import { io, Socket } from 'socket.io-client';
import * as SecureStore from '@utils/secureStorage';
import { resolveApiBaseUrl } from '@utils/runtimeApiUrl';
import { logger } from '@utils/logger';

type SocketListener = (...args: unknown[]) => void;

type RealtimeNotificationEvent = {
  id: string;
  type: string;
  title: string;
  body?: string;
  message?: string;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown> | null;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
  readAt?: string | null;
  relatedUserId?: string | null;
  relatedPostId?: string | null;
};

export interface SocketEvents {
  // Socket lifecycle
  'socket:connected': () => void;
  'socket:disconnected': () => void;
  'socket:error': (error: unknown) => void;

  // Chat events
  'message:received': (data: {
    conversationId: string;
    message: {
      id: string;
      content: string;
      senderId: string;
      createdAt: string;
      updatedAt?: string;
      editedAt?: string;
      fileUrl?: string;
      sender?: {
        id: string;
        name: string;
        avatar?: string;
      };
      readBy?: Array<{ id: string }>;
    };
  }) => void;

  'typing:user': (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
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
  'user:online': (data: { userId: string; timestamp?: string }) => void;
  'user:offline': (data: { userId: string; timestamp?: string }) => void;

  // Notifications
  'notification:new': (data: RealtimeNotificationEvent) => void;
  notification: (data: RealtimeNotificationEvent) => void;

  // Call events (future)
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
  private listeners: Map<string, Set<SocketListener>> = new Map();
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('accessToken');
    } catch (error) {
      logger.error('Erro ao obter token para Socket.IO:', error);
      return null;
    }
  }

  private notifyListeners(eventName: string, data?: unknown): void {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks || callbacks.size === 0) {
      return;
    }

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        logger.error(`Erro no listener do evento ${eventName}:`, error);
      }
    });
  }

  /**
   * Connect to Socket.IO server
   */
  async connect(serverUrl?: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const url = serverUrl?.trim() || resolveApiBaseUrl();
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Token nao disponivel');
    }

    return new Promise((resolve, reject) => {
      try {
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
          logger.info('Socket conectado:', this.socket?.id);
          this.isConnected = true;
          this.notifyListeners('socket:connected');
          resolve();
        });

        this.socket.on('disconnect', () => {
          logger.info('Socket desconectado');
          this.isConnected = false;
          this.notifyListeners('socket:disconnected');
        });

        this.socket.on('error', (error) => {
          logger.error('Socket erro:', error);
          this.notifyListeners('socket:error', error);
          reject(error);
        });

        this.socket.on('connect_error', (error) => {
          logger.error('Socket connect_error:', error);
          this.notifyListeners('socket:error', error);
          reject(error);
        });

        // Default listeners
        this.socket.on('message:received', (data) => {
          this.notifyListeners('message:received', data);
        });

        this.socket.on('typing:user', (data) => {
          this.notifyListeners('typing:user', data);
        });

        this.socket.on('message:edited', (data) => {
          this.notifyListeners('message:edited', data);
        });

        this.socket.on('message:deleted', (data) => {
          this.notifyListeners('message:deleted', data);
        });

        this.socket.on('user:online', (data) => {
          this.notifyListeners('user:online', data);
        });

        this.socket.on('user:offline', (data) => {
          this.notifyListeners('user:offline', data);
        });

        this.socket.on('notification:new', (data) => {
          this.notifyListeners('notification:new', data);
        });

        this.socket.on('notification', (data) => {
          this.notifyListeners('notification', data);
          this.notifyListeners('notification:new', data);
        });

        this.socket.on('call:incoming', (data) => {
          this.notifyListeners('call:incoming', data);
        });

        this.socket.on('call:accepted', (data) => {
          this.notifyListeners('call:accepted', data);
        });

        this.socket.on('call:rejected', (data) => {
          this.notifyListeners('call:rejected', data);
        });

        this.socket.on('call:ended', (data) => {
          this.notifyListeners('call:ended', data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Connection status
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Emit event to server
   */
  emit(eventName: string, data?: unknown): void {
    if (!this.socket) {
      logger.warn('Socket nao conectado');
      return;
    }

    this.socket.emit(eventName, data);
  }

  /**
   * Subscribe to local events
   */
  on<T extends keyof SocketEvents>(eventName: T, callback: SocketEvents[T]): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    const listener = callback as unknown as SocketListener;
    this.listeners.get(eventName)!.add(listener);

    return () => {
      this.listeners.get(eventName)?.delete(listener);
    };
  }

  /**
   * Unsubscribe from local events
   */
  off(eventName: string, callback?: SocketListener): void {
    if (!callback) {
      this.listeners.delete(eventName);
      return;
    }

    this.listeners.get(eventName)?.delete(callback);
  }

  /**
   * Send text message
   */
  sendMessage(conversationId: string, content: string): void {
    this.emit('message:send', {
      conversationId,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Typing indicator
   */
  setTyping(conversationId: string, isTyping: boolean): void {
    if (isTyping) {
      this.emit('typing:start', { conversationId });
    } else {
      this.emit('typing:stop', { conversationId });
    }
  }

  /**
   * Mark conversation as read
   */
  markConversationAsRead(conversationId: string): void {
    this.emit('message:read', { conversationId });
  }

  /**
   * Edit message in real-time
   */
  editMessage(messageId: string, conversationId: string, content: string): void {
    this.emit('message:edit', {
      messageId,
      conversationId,
      content,
    });
  }

  /**
   * Delete message in real-time
   */
  deleteMessage(messageId: string, conversationId: string): void {
    this.emit('message:delete', {
      messageId,
      conversationId,
    });
  }

  /**
   * Join conversation
   */
  joinConversation(conversationId: string): void {
    this.emit('conversation:join', { conversationId });
  }

  /**
   * Leave conversation
   */
  leaveConversation(conversationId: string): void {
    this.emit('conversation:leave', { conversationId });
  }

  /**
   * Start call (future)
   */
  initiateCall(recipientId: string, callId: string): void {
    this.emit('call:initiate', {
      recipientId,
      callId,
    });
  }

  /**
   * Accept call
   */
  acceptCall(callId: string): void {
    this.emit('call:accept', { callId });
  }

  /**
   * Reject call
   */
  rejectCall(callId: string): void {
    this.emit('call:reject', { callId });
  }

  /**
   * End call
   */
  endCall(callId: string): void {
    this.emit('call:end', { callId });
  }

  /**
   * Send ICE candidate (WebRTC)
   */
  sendIceCandidate(callId: string, candidate: RTCIceCandidateInit | RTCIceCandidate): void {
    this.emit('ice:candidate', {
      callId,
      candidate,
    });
  }

  /**
   * Send SDP offer (WebRTC)
   */
  sendSdpOffer(callId: string, offer: RTCSessionDescriptionInit): void {
    this.emit('sdp:offer', {
      callId,
      offer,
    });
  }

  /**
   * Send SDP answer (WebRTC)
   */
  sendSdpAnswer(callId: string, answer: RTCSessionDescriptionInit): void {
    this.emit('sdp:answer', {
      callId,
      answer,
    });
  }

  /**
   * Manual reconnect
   */
  reconnect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  /**
   * Current socket id
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export default new SocketIOManager();
