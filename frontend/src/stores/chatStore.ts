import { create } from 'zustand';
import { chatService } from '../services/api/index';
import { authStore } from './authStore';
import { logger } from '@utils/logger';

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: ConversationParticipant[];
  lastMessage?: {
    id?: string;
    senderId?: string;
    senderName?: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  messagesCount: number;
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
  readBy?: Array<{ id: string }>;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
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

type ApiConversation = {
  id: string;
  recipient?: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants?: ConversationParticipant[];
  messages?: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  lastMessage?: {
    id?: string;
    content: string;
    createdAt: string;
    sender?: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  unreadCount?: number;
  _count?: {
    messages?: number;
  };
  createdAt: string;
  updatedAt: string;
};

type ApiUnreadCount = {
  total?: number;
  byConversation?: Record<string, number> | Array<{ conversationId: string; unreadCount: number }>;
};

const toUnreadMap = (
  byConversation?: Record<string, number> | Array<{ conversationId: string; unreadCount: number }>,
) => {
  if (!byConversation) {
    return new Map<string, number>();
  }

  if (Array.isArray(byConversation)) {
    return new Map(
      byConversation
        .filter((entry) => entry?.conversationId)
        .map((entry) => [entry.conversationId, entry.unreadCount || 0] as const),
    );
  }

  return new Map(Object.entries(byConversation));
};

const toUnreadRecord = (
  byConversation?: Record<string, number> | Array<{ conversationId: string; unreadCount: number }>,
): Record<string, number> => Object.fromEntries(toUnreadMap(byConversation));

const normalizeConversation = (
  conversation: ApiConversation,
  currentUserId: string | null,
  unreadByConversation: Map<string, number>,
): Conversation => {
  const participants = conversation.participants || [];
  const recipientFromParticipants =
    participants.find((participant) => participant.id !== currentUserId) || participants[0];

  const recipient = conversation.recipient ||
    recipientFromParticipants || {
      id: 'unknown',
      name: 'Contato',
    };

  const rawLastMessage = conversation.lastMessage || conversation.messages?.[0];
  const unreadCount =
    conversation.unreadCount ??
    unreadByConversation.get(conversation.id) ??
    0;

  return {
    id: conversation.id,
    recipient: {
      id: recipient.id,
      name: recipient.name,
      avatar: recipient.avatar,
    },
    participants,
    lastMessage: rawLastMessage
      ? {
          id: rawLastMessage.id,
          senderId: rawLastMessage.sender?.id,
          senderName: rawLastMessage.sender?.name,
          content: rawLastMessage.content,
          createdAt: rawLastMessage.createdAt,
        }
      : undefined,
    unreadCount,
    messagesCount: conversation._count?.messages ?? 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

const withSocketManager = async (
  action: (socketManager: {
    joinConversation: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string) => void;
    editMessage: (messageId: string, conversationId: string, content: string) => void;
    deleteMessage: (messageId: string, conversationId: string) => void;
    markConversationAsRead: (conversationId: string) => void;
  }) => void,
) => {
  try {
    const { default: socketManager } = await import('../services/socket/SocketIOManager');
    action(socketManager);
  } catch (error) {
    logger.warn('Erro no Socket.IO Manager:', error);
  }
};

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
      const currentUserId = authStore.getState().user?.id ?? null;
      const unreadMap = toUnreadMap(get().unreadCount?.byConversation);
      const normalized = normalizeConversation(conversation as unknown as ApiConversation, currentUserId, unreadMap);

      set((state) => ({
        conversations: [normalized, ...state.conversations.filter((item) => item.id !== normalized.id)],
      }));

      return normalized;
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
      const currentUserId = authStore.getState().user?.id ?? null;
      const unreadMap = toUnreadMap(get().unreadCount?.byConversation);
      const normalized = response.data.map((item) =>
        normalizeConversation(item as unknown as ApiConversation, currentUserId, unreadMap),
      );

      set((state) => {
        const conversations = page === 1
          ? normalized
          : [...state.conversations, ...normalized].reduce((acc, item) => {
              if (!acc.find((existing) => existing.id === item.id)) {
                acc.push(item);
              }
              return acc;
            }, [] as Conversation[]);

        return {
          conversations,
          isLoadingConversations: false,
        };
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
      const currentUserId = authStore.getState().user?.id ?? null;
      const unreadMap = toUnreadMap(get().unreadCount?.byConversation);
      const normalized = normalizeConversation(conversation as unknown as ApiConversation, currentUserId, unreadMap);
      set({
        currentConversation: normalized,
        isLoadingMessages: false,
      });

      // Entrar na conversa via Socket.io
      await withSocketManager((socketManager) => {
        socketManager.joinConversation(conversationId);
      });

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
        const updatedConversationList = state.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage: {
                  id: message.id,
                  senderId: message.sender.id,
                  senderName: message.sender.name,
                  content: message.content,
                  createdAt: message.createdAt,
                },
                updatedAt: message.createdAt,
              }
            : conversation,
        );

        return {
          messages: new Map(state.messages).set(conversationId, [...messages, message]),
          currentConversationMessages: [...state.currentConversationMessages, message],
          conversations: updatedConversationList,
          isSendingMessage: false,
        };
      });

      // Emitir via Socket.io
      void withSocketManager((socketManager) => {
        socketManager.sendMessage(conversationId, content);
      });
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
      void withSocketManager((socketManager) => {
        socketManager.editMessage(messageId, conversationId, content);
      });
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
      void withSocketManager((socketManager) => {
        socketManager.deleteMessage(messageId, conversationId);
      });
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
      void withSocketManager((socketManager) => {
        socketManager.markConversationAsRead(conversationId);
      });
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
      const currentUserId = authStore.getState().user?.id ?? null;
      const unreadMap = toUnreadMap(get().unreadCount?.byConversation);
      const normalized = results.map((item) =>
        normalizeConversation(item as unknown as ApiConversation, currentUserId, unreadMap),
      );
      set({
        conversations: normalized,
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
      const unreadCount = await chatService.getUnreadCount() as ApiUnreadCount;
      const byConversation = toUnreadRecord(unreadCount.byConversation);
      const total =
        typeof unreadCount.total === 'number'
          ? unreadCount.total
          : Object.values(byConversation).reduce((acc, value) => acc + value, 0);
      set((state) => ({
        unreadCount: {
          total,
          byConversation,
        },
        conversations: state.conversations.map((conversation) => ({
          ...conversation,
          unreadCount: byConversation[conversation.id] ?? 0,
        })),
        currentConversation: state.currentConversation
          ? {
              ...state.currentConversation,
              unreadCount: byConversation[state.currentConversation.id] ?? 0,
            }
          : null,
      }));
    } catch (error) {
      logger.error('Erro ao carregar contagem de nao lidos:', error);
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

    // Limpar apÃ³s 3 segundos
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
      const currentUserId = authStore.getState().user?.id ?? null;
      // Nao adicionar se ja existe
      if (messages.find((m) => m.id === message.id)) {
        return state;
      }
      const newMessages = new Map(state.messages);
      newMessages.set(conversationId, [...messages, message]);
      const isCurrentConversation = conversationId === state.currentConversation?.id;
      const isIncomingMessage = message.sender.id !== currentUserId;
      const byConversation = { ...(state.unreadCount?.byConversation ?? {}) };
      const previousUnread = byConversation[conversationId] ?? 0;
      const nextUnread = !isCurrentConversation && isIncomingMessage ? previousUnread + 1 : previousUnread;
      byConversation[conversationId] = nextUnread;
      const totalUnread = Object.values(byConversation).reduce((acc, value) => acc + value, 0);
      const lastMessage = {
        id: message.id,
        senderId: message.sender.id,
        senderName: message.sender.name,
        content: message.content,
        createdAt: message.createdAt,
      };
      const conversations = state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage,
              updatedAt: message.createdAt,
              unreadCount: nextUnread,
            }
          : conversation,
      );
      const currentConversation = state.currentConversation?.id === conversationId
        ? {
            ...state.currentConversation,
            lastMessage,
            updatedAt: message.createdAt,
            unreadCount: 0,
          }
        : state.currentConversation;
      return {
        messages: newMessages,
        currentConversationMessages:
          isCurrentConversation
            ? [...state.currentConversationMessages, message]
            : state.currentConversationMessages,
        conversations,
        currentConversation,
        unreadCount: {
          total: totalUnread,
          byConversation,
        },
      };
    });
  },

  clearError: () => set({ error: null }),
}));
