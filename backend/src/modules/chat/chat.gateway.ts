import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { logStructured } from '@common/logging/structured-log';

function resolveWebsocketOrigins(): string[] {
  const rawOrigins =
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    'http://localhost:8081,http://localhost:19006';

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const websocketOrigins = resolveWebsocketOrigins();

@WebSocketGateway({
  cors: {
    origin: websocketOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Conexao WebSocket com JWT obrigatorio.
   */
  async handleConnection(client: Socket) {
    try {
      const token = this.extractBearerToken(client);
      const payload = this.validateAccessToken(token);
      const userId = payload.sub ?? payload.id;

      if (!userId) {
        throw new UnauthorizedException('Invalid websocket token payload');
      }

      (client as any).userId = userId;
      await client.join(`user_${userId}`);
      this.trackUserSocket(userId, client.id);

      const activeSocketCount = await this.getUserSocketCount(userId);

      logStructured('info', 'chat.socket.connected', {
        userId,
        socketId: client.id,
      });
      if (activeSocketCount === 1) {
        this.server.emit('user:online', { userId, timestamp: new Date() });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid websocket authentication';

      client.emit('auth:error', { message });
      client.disconnect(true);
    }
  }

  /**
   * Desconectar usuario.
   */
  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;

    if (!userId) {
      return;
    }

    this.untrackUserSocket(userId, client.id);
    const activeSocketCount = await this.getUserSocketCount(userId);
    if (activeSocketCount === 0) {
      this.server.emit('user:offline', { userId, timestamp: new Date() });
    }

    logStructured('info', 'chat.socket.disconnected', {
      userId,
      socketId: client.id,
    });
  }

  /**
   * Entrar em room da conversa (necessario para typing/read events).
   */
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const userId = (client as any).userId;

    if (!payload?.conversationId) {
      client.emit('message:error', { error: 'conversationId is required' });
      return;
    }

    try {
      await this.chatService.getConversation(payload.conversationId, userId);
      client.join(`conv_${payload.conversationId}`);
      client.emit('conversation:joined', { conversationId: payload.conversationId });
    } catch (error) {
      client.emit('message:error', { error: (error as any).message });
    }
  }

  /**
   * Sair da room da conversa.
   */
  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    if (!payload?.conversationId) {
      client.emit('message:error', { error: 'conversationId is required' });
      return;
    }

    client.leave(`conv_${payload.conversationId}`);
    client.emit('conversation:left', { conversationId: payload.conversationId });
  }

  /**
   * Enviar mensagem em tempo real.
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string; fileUrl?: string }
  ) {
    const userId = (client as any).userId;

    try {
      const message = await this.chatService.createMessage(
        payload.conversationId,
        userId,
        payload.content,
        payload.fileUrl
      );

      const conversation = await this.chatService.getConversation(payload.conversationId, userId);

      conversation.participants.forEach((participant: any) => {
        this.server.to(`user_${participant.id}`).emit('message:received', {
          conversationId: payload.conversationId,
          message,
        });
      });

      await this.chatService.markAsRead(payload.conversationId, userId);

      logStructured('info', 'chat.message.sent', {
        userId,
        conversationId: payload.conversationId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'chat.message.send_failed', {
        userId,
        conversationId: payload?.conversationId,
        errorMessage,
      });
      client.emit('message:error', { error: (error as any).message });
    }
  }

  /**
   * Indicador de digitacao - iniciar.
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const userId = (client as any).userId;

    client.to(`conv_${payload.conversationId}`).emit('typing:user', {
      userId,
      conversationId: payload.conversationId,
      isTyping: true,
    });
  }

  /**
   * Indicador de digitacao - parar.
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const userId = (client as any).userId;

    client.to(`conv_${payload.conversationId}`).emit('typing:user', {
      userId,
      conversationId: payload.conversationId,
      isTyping: false,
    });
  }

  /**
   * Read receipt (marcar como lido).
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string }
  ) {
    const userId = (client as any).userId;

    try {
      await this.chatService.markAsRead(payload.conversationId, userId);

      this.server.to(`conv_${payload.conversationId}`).emit('message:marked_read', {
        conversationId: payload.conversationId,
        userId,
        readAt: new Date(),
      });
    } catch (error) {
      client.emit('message:error', { error: (error as any).message });
    }
  }

  /**
   * Edicao de mensagem em tempo real.
   */
  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string; conversationId: string; content: string }
  ) {
    const userId = (client as any).userId;

    if (!payload?.messageId || !payload?.conversationId || !payload?.content) {
      client.emit('message:error', {
        error: 'messageId, conversationId e content sao obrigatorios',
      });
      return;
    }

    try {
      const updatedMessage = await this.chatService.editMessage(
        payload.messageId,
        userId,
        payload.content
      );

      this.server.to(`conv_${payload.conversationId}`).emit('message:edited', {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        content: updatedMessage.content,
        updatedAt: updatedMessage.updatedAt,
      });
    } catch (error) {
      client.emit('message:error', { error: (error as any).message });
    }
  }

  /**
   * Exclusao de mensagem em tempo real.
   */
  @SubscribeMessage('message:delete')
  async handleMessageDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string; conversationId: string }
  ) {
    const userId = (client as any).userId;

    if (!payload?.messageId || !payload?.conversationId) {
      client.emit('message:error', { error: 'messageId e conversationId sao obrigatorios' });
      return;
    }

    try {
      await this.chatService.deleteMessage(payload.messageId, userId);

      this.server.to(`conv_${payload.conversationId}`).emit('message:deleted', {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
      });
    } catch (error) {
      client.emit('message:error', { error: (error as any).message });
    }
  }

  /**
   * Verificar se usuario esta online.
   */
  async isUserOnline(userId: string): Promise<boolean> {
    return (await this.getUserSocketCount(userId)) > 0;
  }

  /**
   * Enviar notificacao para usuario.
   */
  notifyUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  /**
   * Broadcast para conversa.
   */
  broadcastToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conv_${conversationId}`).emit(event, data);
  }

  private extractBearerToken(client: Socket): string {
    const authToken = client.handshake?.auth?.token;
    const headerToken = client.handshake?.headers?.authorization;

    const rawToken =
      typeof authToken === 'string'
        ? authToken
        : Array.isArray(authToken)
          ? authToken[0]
          : typeof headerToken === 'string'
            ? headerToken
            : Array.isArray(headerToken)
              ? headerToken[0]
              : null;

    if (!rawToken) {
      throw new UnauthorizedException('Missing access token in websocket handshake');
    }

    return rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
  }

  private validateAccessToken(token: string): JwtPayload {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    const payload = this.jwtService.verify<JwtPayload>(token, {
      secret: jwtSecret,
    });

    if (!(payload?.sub ?? payload?.id)) {
      throw new UnauthorizedException('Invalid websocket token payload');
    }

    if (payload.temp) {
      throw new UnauthorizedException('Temporary token is not valid for websocket');
    }

    if (payload.type) {
      throw new UnauthorizedException('Invalid websocket token');
    }

    if (payload.tokenType && payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid websocket token type');
    }

    return payload;
  }

  private trackUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);
  }

  private untrackUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) {
      return;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  private async getUserSocketCount(userId: string): Promise<number> {
    if (!this.server?.in) {
      return this.userSockets.get(userId)?.size ?? 0;
    }

    try {
      const sockets = await this.server.in(`user_${userId}`).allSockets();
      return sockets.size;
    } catch (error) {
      logStructured('warn', 'chat.socket.presence_count_failed', {
        userId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return this.userSockets.get(userId)?.size ?? 0;
    }
  }
}
