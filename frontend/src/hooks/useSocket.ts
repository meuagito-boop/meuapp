/**
 * Hook useSocket - Acesso simplificado ao Socket.IO
 * Uso: const { isConnected, sendMessage, on, off } = useSocket();
 */

import { useEffect, useCallback, useRef } from 'react';
import SocketIOManager from '@services/socket/SocketIOManager';
import type { SocketEvents } from '@services/socket/SocketIOManager';

type SocketListener = (...args: unknown[]) => void;

export const useSocket = () => {
  const unsubscribeRef = useRef<Map<string, Set<() => void>>>(new Map());

  /**
   * Subscribe para um evento
   */
  const on = useCallback(
    <T extends keyof SocketEvents>(eventName: T, callback: SocketEvents[T]) => {
      const unsubscribe = SocketIOManager.on(eventName, callback);

      if (!unsubscribeRef.current.has(eventName)) {
        unsubscribeRef.current.set(eventName, new Set());
      }

      unsubscribeRef.current.get(eventName)!.add(unsubscribe);

      return unsubscribe;
    },
    []
  );

  /**
   * Unsubscribe de um evento
   */
  const off = useCallback((eventName: string, callback?: SocketListener) => {
    SocketIOManager.off(eventName, callback);
  }, []);

  /**
   * Limpar todos os listeners do hook ao desmontar
   */
  useEffect(() => {
    return () => {
      unsubscribeRef.current.forEach((unsubscribes) => {
        unsubscribes.forEach((fn) => fn());
      });
      unsubscribeRef.current.clear();
    };
  }, []);

  /**
   * Enviar mensagem de chat
   */
  const sendMessage = useCallback((conversationId: string, content: string) => {
    SocketIOManager.sendMessage(conversationId, content);
  }, []);

  /**
   * Enviar indicador de digitação
   */
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    SocketIOManager.setTyping(conversationId, isTyping);
  }, []);

  /**
   * Marcar conversa como lida
   */
  const markAsRead = useCallback((conversationId: string) => {
    SocketIOManager.markConversationAsRead(conversationId);
  }, []);

  /**
   * Editar mensagem
   */
  const editMessage = useCallback(
    (messageId: string, conversationId: string, content: string) => {
      SocketIOManager.editMessage(messageId, conversationId, content);
    },
    []
  );

  /**
   * Deletar mensagem
   */
  const deleteMessage = useCallback((messageId: string, conversationId: string) => {
    SocketIOManager.deleteMessage(messageId, conversationId);
  }, []);

  /**
   * Entrar em conversa
   */
  const joinConversation = useCallback((conversationId: string) => {
    SocketIOManager.joinConversation(conversationId);
  }, []);

  /**
   * Sair de conversa
   */
  const leaveConversation = useCallback((conversationId: string) => {
    SocketIOManager.leaveConversation(conversationId);
  }, []);

  return {
    // State
    isConnected: SocketIOManager.getIsConnected(),
    socketId: SocketIOManager.getSocketId(),

    // Events
    on,
    off,

    // Chat actions
    sendMessage,
    setTyping,
    markAsRead,
    editMessage,
    deleteMessage,

    // Conversation actions
    joinConversation,
    leaveConversation,

    // Direct access
    manager: SocketIOManager,
  };
};
