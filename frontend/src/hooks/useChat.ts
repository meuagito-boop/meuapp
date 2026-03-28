/**
 * Hook useChat - acesso simplificado ao chat store
 * Uso: const { conversations, messages, sendMessage } = useChat();
 */

import { useCallback } from 'react';
import { chatStore } from '@stores/chatStore';

export const useChat = () => {
  const store = chatStore();

  const listConversations = useCallback(
    async (page = 1, limit = 20) => {
      try {
        await store.listConversations(page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load conversations' };
      }
    },
    [store]
  );

  const getMessages = useCallback(
    async (conversationId: string, page = 1, limit = 50) => {
      try {
        await store.getMessages(conversationId, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load messages' };
      }
    },
    [store]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string, file?: { uri: string; name: string; type: string }) => {
      try {
        await store.sendMessage(conversationId, content, file);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to send message' };
      }
    },
    [store]
  );

  const createConversation = useCallback(
    async (recipientId: string) => {
      try {
        await store.createConversation(recipientId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to create conversation' };
      }
    },
    [store]
  );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        await store.markAsRead(conversationId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to mark as read' };
      }
    },
    [store]
  );

  return {
    conversations: store.conversations || [],
    messages: store.messages || [],
    currentConversation: store.currentConversation,
    isLoadingConversations: store.isLoadingConversations,
    isLoadingMessages: store.isLoadingMessages,
    isSendingMessage: store.isSendingMessage,
    error: store.error,
    
    // Actions
    listConversations,
    getMessages,
    sendMessage,
    createConversation,
    markAsRead,
  };
};
