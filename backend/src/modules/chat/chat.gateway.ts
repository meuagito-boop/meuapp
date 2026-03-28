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
import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:19006',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly chatService: ChatService) {}

  /**
   * Conexão WebSocket
   */
  handleConnection(client: Socket) {
    // Extrair userId do payload do token ou dos query params
    const userId = client.handshake?.auth?.userId || 
                   client.handshake?.query?.userId || 
                   `anonymous_${client.id}`;

    if (!userId) {
      client.disconnect();
      return;
    }

    // Anexar userId ao client para usar em handlers
    (client as any).userId = userId;

    // Adicionar socket do usuário ao mapa
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId).push(client.id);

    // Juntar usuário à sua room pessoal
    client.join(`user_${userId}`);

    console.log(`[ChatGateway] ✅ Usuário ${userId} conectado (socket: ${client.id})`);

    // Emit evento de usuário online para todos
    this.server.emit('user:online', { userId, timestamp: new Date() });
  }

  /**
   * Desconectar usuário
   */
  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;

    if (!userId) return;

    // Remover socket do mapa
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
        // Emit evento de offline apenas quando não há mais sockets
        this.server.emit('user:offline', { userId, timestamp: new Date() });
      }
    }

    console.log(`[ChatGateway] ❌ Usuário ${userId} desconectado (socket: ${client.id})`);
  }

  /**
   * Enviar mensagem em tempo real
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string; fileUrl?: string },
  ) {
    const userId = (client as any).userId;

    try {
      const message = await this.chatService.createMessage(
        payload.conversationId,
        userId,
        payload.content,
        payload.fileUrl,
      );

      const conversation = await this.chatService.getConversation(payload.conversationId, userId);

      // Enviar para ambos os participantes
      conversation.participants.forEach((participant: any) => {
        this.server.to(`user_${participant.id}`).emit('message:received', {
          conversationId: payload.conversationId,
          message,
        });
      });

      // Emit read receipt
      await this.chatService.markAsRead(payload.conversationId, userId);

      console.log(`[ChatGateway] 📨 Mensagem enviada - Usuario: ${userId}, Conversa: ${payload.conversationId}`);
    } catch (error) {
      console.error('[ChatGateway] Erro ao enviar mensagem:', (error as any).message);
      client.emit('message:error', { error: (error as any).message });
    }
  }

  /**
   * Indicador de digitação - Iniciar
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = (client as any).userId;

    // Broadcast para outros membros da conversa
    client.to(`conv_${payload.conversationId}`).emit('typing:user', {
      userId,
      conversationId: payload.conversationId,
      isTyping: true,
    });
  }

  /**
   * Indicador de digitação - Parar
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = (client as any).userId;

    client.to(`conv_${payload.conversationId}`).emit('typing:user', {
      userId,
      conversationId: payload.conversationId,
      isTyping: false,
    });
  }

  /**
   * Read receipt (marcar como lido)
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = (client as any).userId;

    try {
      await this.chatService.markAsRead(payload.conversationId, userId);

      // Notificar outro participante
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
   * Verificar se usuário está online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.length ?? 0) > 0;
  }

  /**
   * Enviar notificação para usuário
   */
  notifyUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  /**
   * Broadcast para conversa
   */
  broadcastToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conv_${conversationId}`).emit(event, data);
  }
}
