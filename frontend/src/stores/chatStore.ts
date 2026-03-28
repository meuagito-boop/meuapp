import { create } from 'zustand';
import { chatService } from '../services/api/index';
import SocketIOManager from '../services/socket/SocketIOManager';

export interface Conversation {
  id: string;
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  file?: {
    url: string;
    filename: string;
  };
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCount {
  total: number;
  byConversation: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatStore {
  // State
  conversations: Conversation[];
  messages: Map<string, Message[]>;
  currentConversation: Conversation | null;
  currentConversationMessages: Message[];
  unreadCount: UnreadCount | null;
  typingUsers: Map<string, Set<string>>; // conversationId -> Set<userId>
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;

  // Actions
  createConversation: (recipientId: string) => Promise<Conversation>;
  listConversations: (page?: number, limit?: number) => Promise<void>;
  getConversation: (conversationId: string) => Promise<void>;
  getMessages: (conversationId: string, page?: number, limit?: number) => Promise<void>;
  sendMessage: (conversationId: string, content: string, file?: { uri: string; name: string; type: string }) => Promise<void>;
  editMessage: (messageId: string, content: string, conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchConversations: (query: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  setTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  addMessage: (message: Message) => void;
  clearError: () => void;
}

export const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  messages: new Map(),
  currentConversation: null,
  currentConversationMessages: [],
  unreadCount: null,
  typingUsers: new Map(),
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,

  // Actions
  createConversation: async (recipientId) => {
    set({ error: null });
    try {
      const conversation = await chatService.createConversation(recipientId);

      set((state) => ({
        conversations: [conversation, ...state.conversations],
      }));

      return conversation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conversa';
      set({ error: message });
      throw error;
    }
  },

  listConversations: async (page = 1, limit = 20) => {
    set({ isLoadingConversations: true, error: null });
    try {
      const response = await chatService.listConversations(page, limit);
      set({
        conversations: page === 1 ? response.data : [...get().conversations, ...response.data],
        isLoadingConversations: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar conversas';
      set({ error: message, isLoadingConversations: false });
      throw error;
    }
  },

  getConversation: async (conversationId) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const conversation = await chatService.getConversation(conversationId);
      set({
        currentConversation: conversation,
        isLoadingMessages: false,
      });

      // Entrar na conversa via Socket.io
      SocketIOManager.joinConversation(conversationId);

      // Carregar mensagens
      await get().getMessages(conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar conversa';
      set({ error: message, isLoadingMessages: false });
      throw error;
    }
  },

  getMessages: async (conversationId, page = 1, limit = 30) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await chatService.getMessages(conversationId, page, limit);

      set((state) => {
        const existingMessages = state.messages.get(conversationId) || [];
        const allMessages =
          page === 1
            ? response.data
            : [...existingMessages, ...response.data].reduce((acc, msg) => {
                if (!acc.find((m) => m.id === msg.id)) {
                  acc.push(msg);
                }
                return acc;
              }, [] as Message[]);

        const newMessages = new Map(state.messages);
        newMessages.set(conversationId, allMessages);

        return {
          messages: newMessages,
          currentConversationMessages: allMessages,
          isLoadingMessages: false,
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar mensagens';
      set({ error: message, isLoadingMessages: false });
      throw error;
    }
  },

  sendMessage: async (conversationId, content, file) => {
    set({ isSendingMessage: true, error: null });
    try {
      const message = await chatService.sendMessage(conversationId, content, file);

      // Atualizar lista local
      set((state) => {
        const messages = state.messages.get(conversationId) || [];
        return {
          messages: new Map(state.messages).set(conversationId, [...messages, message]),
          currentConversationMessages: [...state.currentConversationMessages, message],
          isSendingMessage: false,
        };
      });

      // Emitir via Socket.io
      SocketIOManager.sendMessage(conversationId, content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
      set({ error: message, isSendingMessage: false });
      throw error;
    }
  },

  editMessage: async (messageId, content, conversationId) => {
    set({ error: null });
    try {
      const updatedMessage = await chatService.editMessage(messageId, content);

      // Atualizar lista local
      set((state) => {
        const messages = state.messages.get(conversationId) || [];
        return {
          messages: new Map(state.messages).set(
            conversationId,
            messages.map((m) => (m.id === messageId ? updatedMessage : m)),
          ),
          currentConversationMessages: state.currentConversationMessages.map((m) =>
            m.id === messageId ? updatedMessage : m,
          ),
        };
      });

      // Emitir via Socket.io
      SocketIOManager.editMessage(messageId, conversationId, content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao editar mensagem';
      set({ error: message });
      throw error;
    }
  },

  deleteMessage: async (messageId, conversationId) => {
    set({ error: null });
    try {
      await chatService.deleteMessage(messageId);

      // Remover da lista local
      set((state) => {
        const messages = state.messages.get(conversationId) || [];
        return {
          messages: new Map(state.messages).set(
            conversationId,
            messages.filter((m) => m.id !== messageId),
          ),
          currentConversationMessages: state.currentConversationMessages.filter(
            (m) => m.id !== messageId,
          ),
        };
      });

      // Emitir via Socket.io
      SocketIOManager.deleteMessage(messageId, conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar mensagem';
      set({ error: message });
      throw error;
    }
  },

  markAsRead: async (conversationId) => {
    set({ error: null });
    try {
      await chatService.markAsRead(conversationId);

      // Atualizar unread count
      await get().getUnreadCount();

      // Emitir via Socket.io
      SocketIOManager.markConversationAsRead(conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao marcar como lido';
      set({ error: message });
      throw error;
    }
  },

  searchConversations: async (query) => {
    set({ isLoadingConversations: true, error: null });
    try {
      const results = await chatService.searchConversations(query);
      set({
        conversations: results,
        isLoadingConversations: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar conversas';
      set({ error: message, isLoadingConversations: false });
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const unreadCount = await chatService.getUnreadCount();
      set({ unreadCount });
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidos:', error);
    }
  },

  archiveConversation: async (conversationId) => {
    set({ error: null });
    try {
      await chatService.archiveConversation(conversationId);

      // Remover conversa da lista
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== conversationId),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao arquivar conversa';
      set({ error: message });
      throw error;
    }
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  loadMoreMessages: async (conversationId) => {
    const { currentConversationMessages } = get();
    const page = Math.floor(currentConversationMessages.length / 30) + 1;
    await get().getMessages(conversationId, page);
  },

  setTypingUser: (conversationId, userId) => {
    set((state) => {
      const typingUsers = new Map(state.typingUsers);
      const users = typingUsers.get(conversationId) || new Set();
      users.add(userId);
      typingUsers.set(conversationId, users);
      return { typingUsers };
    });

    // Limpar após 3 segundos
    setTimeout(() => {
      get().removeTypingUser(conversationId, userId);
    }, 3000);
  },

  removeTypingUser: (conversationId, userId) => {
    set((state) => {
      const typingUsers = new Map(state.typingUsers);
      const users = typingUsers.get(conversationId);
      if (users) {
        users.delete(userId);
        if (users.size === 0) {
          typingUsers.delete(conversationId);
        } else {
          typingUsers.set(conversationId, users);
        }
      }
      return { typingUsers };
    });
  },

  addMessage: (message) => {
    set((state) => {
      const conversationId = message.conversationId;
      const messages = state.messages.get(conversationId) || [];

      // Não adicionar se já existe
      if (messages.find((m) => m.id === message.id)) {
        return state;
      }

      const newMessages = new Map(state.messages);
      newMessages.set(conversationId, [...messages, message]);

      return {
        messages: newMessages,
        currentConversationMessages:
          conversationId === state.currentConversation?.id
            ? [...state.currentConversationMessages, message]
            : state.currentConversationMessages,
      };
    });
  },

  clearError: () => set({ error: null }),
}));
