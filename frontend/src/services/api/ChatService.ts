import ApiClient from './ApiClient';

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  messages: number;
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  readBy: {
    id: string;
  }[];
  createdAt: string;
  editedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCount {
  total: number;
  byConversation: {
    conversationId: string;
    unreadCount: number;
  }[];
}

class ChatService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Criar ou obter conversa
   */
  async createConversation(recipientId: string): Promise<Conversation> {
    return this.apiClient.post('/chat/conversations', {
      recipientId,
    });
  }

  /**
   * Listar conversas
   */
  async listConversations(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    return this.apiClient.get('/chat/conversations', {
      params: { page, limit },
    });
  }

  /**
   * Obter conversa específica
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    return this.apiClient.get(`/chat/conversations/${conversationId}`);
  }

  /**
   * Obter mensagens
   */
  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponse<Message>> {
    return this.apiClient.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(
    conversationId: string,
    content: string,
    file?: {
      uri: string;
      name: string;
      type: string;
    },
  ): Promise<Message> {
    if (file) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      return this.apiClient.post(`/chat/conversations/${conversationId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return this.apiClient.post(`/chat/conversations/${conversationId}/messages`, {
      content,
    });
  }

  /**
   * Editar mensagem
   */
  async editMessage(messageId: string, content: string): Promise<Message> {
    return this.apiClient.put(`/chat/messages/${messageId}`, { content });
  }

  /**
   * Deletar mensagem
   */
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/chat/messages/${messageId}`);
  }

  /**
   * Marcar conversa como lida
   */
  async markAsRead(conversationId: string): Promise<{ message: string }> {
    return this.apiClient.put(`/chat/conversations/${conversationId}/read`);
  }

  /**
   * Buscar conversas
   */
  async searchConversations(query: string): Promise<Conversation[]> {
    return this.apiClient.get('/chat/conversations/search/query', {
      params: { q: query },
    });
  }

  /**
   * Contar não lidas
   */
  async getUnreadCount(): Promise<UnreadCount> {
    return this.apiClient.get('/chat/conversations/unread/count');
  }

  /**
   * Arquivar conversa
   */
  async archiveConversation(conversationId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/chat/conversations/${conversationId}`);
  }
}

export default ChatService;
