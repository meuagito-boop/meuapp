import { io, Socket } from 'socket.io-client';
import { store as authStore } from '../../stores/authStore';
import { store as chatStore } from '../../stores/chatStore';

export interface SocketEvents {
  // Chat events
  'message:received': (data: {
    messageId: string;
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    createdAt: string;
  }) => void;

  'typing:user': (data: {
    conversationId: string;
    userId: string;
    userName: string;
  }) => void;

  'message:edited': (data: {
    messageId: string;
    conversationId: string;
    content: string;
    updatedAt: string;
  }) => void;

  'message:deleted': (data: {
    messageId: string;
    conversationId: string;
  }) => void;

  // Presence events
  'user:online': (data: { userId: string; userName: string }) => void;
  'user:offline': (data: { userId: string }) => void;

  // Notifications
  'notification:new': (data: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) => void;

  // Call events (para futura implementação)
  'call:incoming': (data: {
    callId: string;
    callerId: string;
    callerName: string;
  }) => void;

  'call:accepted': (data: { callId: string }) => void;
  'call:rejected': (data: { callId: string }) => void;
  'call:ended': (data: { callId: string }) => void;
}

class SocketIOManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Conectar ao servidor Socket.IO
   */
  async connect(serverUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Usar URL padrão se não fornecida
        const url = serverUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
        const token = authStore.getState().tokens?.accessToken;

        if (!token) {
          reject(new Error('Token não disponível'));
          return;
        }

        this.socket = io(`${url}/chat`, {
          auth: {
            token: `Bearer ${token}`,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('Socket conectado:', this.socket?.id);
          this.isConnected = true;
          this.emit('socket:connected');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Socket desconectado');
          this.isConnected = false;
          this.emit('socket:disconnected');
        });

        this.socket.on('error', (error) => {
          console.error('Socket erro:', error);
          this.emit('socket:error', error);
          reject(error);
        });

        // Listener padrão para mensagens
        this.socket.on('message:received', (data) => {
          chatStore.getState().addMessage(data);
          this.emit('message:received', data);
        });

        // Listener padrão para digitação
        this.socket.on('typing:user', (data) => {
          chatStore.getState().setTypingUser(data.conversationId, data.userId);
          this.emit('typing:user', data);
        });

        // Listener padrão para usuário online
        this.socket.on('user:online', (data) => {
          this.emit('user:online', data);
        });

        // Listener padrão para usuário offline
        this.socket.on('user:offline', (data) => {
          this.emit('user:offline', data);
        });

        // Listener padrão para notificações
        this.socket.on('notification:new', (data) => {
          this.emit('notification:new', data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  /**
   * Verificar se está conectado
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Emitir evento
   */
  emit(eventName: string, data?: any): void {
    if (!this.socket) {
      console.warn('Socket não conectado');
      return;
    }

    this.socket.emit(eventName, data);
  }

  /**
   * Subscribe para evento
   */
  on<T extends keyof SocketEvents>(
    eventName: T,
    callback: SocketEvents[T],
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(callback as Function);

    // Retornar função para unsubscribe
    return () => {
      this.listeners.get(eventName)?.delete(callback as Function);
    };
  }

  /**
   * Unsubscribe de evento
   */
  off(eventName: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(eventName);
      return;
    }

    this.listeners.get(eventName)?.delete(callback);
  }

  /**
   * Enviar mensagem de texto
   */
  sendMessage(conversationId: string, content: string): void {
    this.emit('message:send', {
      conversationId,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Indicador de digitação
   */
  setTyping(conversationId: string, isTyping: boolean): void {
    if (isTyping) {
      this.emit('typing:start', { conversationId });
    } else {
      this.emit('typing:stop', { conversationId });
    }
  }

  /**
   * Marcar conversa como lida
   */
  markConversationAsRead(conversationId: string): void {
    this.emit('message:read', { conversationId });
  }

  /**
   * Editar mensagem (em tempo real)
   */
  editMessage(messageId: string, conversationId: string, content: string): void {
    this.emit('message:edit', {
      messageId,
      conversationId,
      content,
    });
  }

  /**
   * Deletar mensagem (em tempo real)
   */
  deleteMessage(messageId: string, conversationId: string): void {
    this.emit('message:delete', {
      messageId,
      conversationId,
    });
  }

  /**
   * Entrar em uma conversa
   */
  joinConversation(conversationId: string): void {
    this.emit('conversation:join', { conversationId });
  }

  /**
   * Sair de uma conversa
   */
  leaveConversation(conversationId: string): void {
    this.emit('conversation:leave', { conversationId });
  }

  /**
   * Enviar chamada (futura implementação)
   */
  initiateCall(recipientId: string, callId: string): void {
    this.emit('call:initiate', {
      recipientId,
      callId,
    });
  }

  /**
   * Aceitar chamada
   */
  acceptCall(callId: string): void {
    this.emit('call:accept', { callId });
  }

  /**
   * Rejeitar chamada
   */
  rejectCall(callId: string): void {
    this.emit('call:reject', { callId });
  }

  /**
   * Encerrar chamada
   */
  endCall(callId: string): void {
    this.emit('call:end', { callId });
  }

  /**
   * Enviar ICE candidate (WebRTC)
   */
  sendIceCandidate(callId: string, candidate: any): void {
    this.emit('ice:candidate', {
      callId,
      candidate,
    });
  }

  /**
   * Enviar SDP offer (WebRTC)
   */
  sendSdpOffer(callId: string, offer: RTCSessionDescriptionInit): void {
    this.emit('sdp:offer', {
      callId,
      offer,
    });
  }

  /**
   * Enviar SDP answer (WebRTC)
   */
  sendSdpAnswer(callId: string, answer: RTCSessionDescriptionInit): void {
    this.emit('sdp:answer', {
      callId,
      answer,
    });
  }

  /**
   * Reconectar manualmente
   */
  reconnect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * Obter ID do socket
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export default new SocketIOManager();
