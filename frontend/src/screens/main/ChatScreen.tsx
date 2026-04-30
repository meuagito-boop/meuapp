import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { useSocket } from '@hooks';
import { authStore } from '@stores/authStore';
import { chatStore, type Message as ChatMessage } from '@stores/chatStore';
import type { SocketEvents } from '@services/socket/SocketIOManager';

type ChatStackParamList = {
  ConversationsList: undefined;
  ChatDetail: {
    conversationId: string;
    recipientName: string;
  };
};

type ConversationsListProps = NativeStackScreenProps<ChatStackParamList, 'ConversationsList'>;
type ChatDetailProps = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;
type MessageReceivedPayload = Parameters<SocketEvents['message:received']>[0];

const Stack = createNativeStackNavigator<ChatStackParamList>();

const formatTime = (value: string): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapSocketMessageToStore = (payload: MessageReceivedPayload): ChatMessage => {
  const senderId = payload.message.sender?.id ?? payload.message.senderId;

  return {
    id: payload.message.id,
    conversationId: payload.conversationId,
    content: payload.message.content,
    sender: {
      id: senderId,
      name: payload.message.sender?.name ?? 'Contato',
      avatar: payload.message.sender?.avatar,
    },
    file: payload.message.fileUrl
      ? {
          url: payload.message.fileUrl,
          filename: 'arquivo',
        }
      : undefined,
    readBy: payload.message.readBy,
    isEdited: Boolean(payload.message.editedAt),
    createdAt: payload.message.createdAt,
    updatedAt: payload.message.updatedAt ?? payload.message.createdAt,
    editedAt: payload.message.editedAt,
  };
};

function ConversationsListScreen({ navigation }: ConversationsListProps) {
  const conversations = chatStore((state) => state.conversations);
  const isLoadingConversations = chatStore((state) => state.isLoadingConversations);
  const listConversations = chatStore((state) => state.listConversations);
  const getUnreadCount = chatStore((state) => state.getUnreadCount);
  const addMessage = chatStore((state) => state.addMessage);

  const { on } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      void listConversations(1, 30);
      void getUnreadCount();
    }, [getUnreadCount, listConversations]),
  );

  useEffect(() => {
    const unsubscribe = on('message:received', (payload) => {
      addMessage(mapSocketMessageToStore(payload));
    });

    return () => {
      unsubscribe?.();
    };
  }, [addMessage, on]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const recipientName = conversation.recipient?.name ?? '';
      return recipientName.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const totalUnread = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0),
    [conversations],
  );

  const renderItem = ({ item }: { item: (typeof conversations)[number] }) => {
    const recipientName = item.recipient?.name || 'Contato';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate('ChatDetail', {
            conversationId: item.id,
            recipientName,
          })
        }
      >
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{recipientName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.conversationBody}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {recipientName}
            </Text>
            <Text style={styles.conversationTime}>{formatTime(item.updatedAt)}</Text>
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.content || 'Sem mensagens'}
          </Text>
        </View>

        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
        {totalUnread > 0 && <Text style={styles.subtitle}>{totalUnread} nao lidas</Text>}
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversa"
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoadingConversations ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.centeredState}>
          <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

function ChatDetailScreen({ route, navigation }: ChatDetailProps) {
  const { conversationId, recipientName } = route.params;

  const currentUserId = authStore((state) => state.user?.id ?? null);

  const currentConversation = chatStore((state) => state.currentConversation);
  const currentConversationMessages = chatStore((state) => state.currentConversationMessages);
  const messagesMap = chatStore((state) => state.messages);
  const isLoadingMessages = chatStore((state) => state.isLoadingMessages);
  const isSendingMessage = chatStore((state) => state.isSendingMessage);
  const getConversation = chatStore((state) => state.getConversation);
  const sendMessage = chatStore((state) => state.sendMessage);
  const markAsRead = chatStore((state) => state.markAsRead);
  const addMessage = chatStore((state) => state.addMessage);

  const { on, joinConversation, leaveConversation, setTyping, isConnected } = useSocket();

  const [inputText, setInputText] = useState('');
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<ChatMessage> | null>(null);

  useEffect(() => {
    void getConversation(conversationId);
    void markAsRead(conversationId);
    joinConversation(conversationId);

    return () => {
      leaveConversation(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isConnected) {
        setTyping(conversationId, false);
      }
    };
  }, [conversationId, getConversation, isConnected, joinConversation, leaveConversation, markAsRead, setTyping]);

  useEffect(() => {
    const unsubscribeMessage = on('message:received', (payload) => {
      if (payload.conversationId !== conversationId) {
        return;
      }

      addMessage(mapSocketMessageToStore(payload));
      void markAsRead(conversationId);
    });

    const unsubscribeTyping = on('typing:user', (payload) => {
      const isOtherUser = payload.userId !== currentUserId;
      const isSameConversation = payload.conversationId === conversationId;
      setIsRecipientTyping(Boolean(isOtherUser && isSameConversation && payload.isTyping));
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
    };
  }, [addMessage, conversationId, currentUserId, markAsRead, on]);

  const messages = useMemo(() => {
    const source =
      currentConversation?.id === conversationId
        ? currentConversationMessages
        : (messagesMap.get(conversationId) ?? []);

    return [...source].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });
  }, [conversationId, currentConversation?.id, currentConversationMessages, messagesMap]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages.length]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);

      if (!isConnected) {
        return;
      }

      setTyping(conversationId, value.trim().length > 0);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTyping(conversationId, false);
      }, 1200);
    },
    [conversationId, isConnected, setTyping],
  );

  const handleSend = useCallback(async () => {
    const content = inputText.trim();
    if (!content || isSendingMessage) {
      return;
    }

    setInputText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isConnected) {
      setTyping(conversationId, false);
    }

    await sendMessage(conversationId, content);
  }, [conversationId, inputText, isConnected, isSendingMessage, sendMessage, setTyping]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.sender.id === currentUserId;

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage ? styles.messageRowOwn : styles.messageRowOther,
        ]}
      >
        <View style={[styles.messageBubble, isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTimestamp}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle} numberOfLines={1}>
          {recipientName}
        </Text>
      </View>

      {isLoadingMessages ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.chatBody}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
          />

          {isRecipientTyping && (
            <View style={styles.typingRow}>
              <Text style={styles.typingText}>{recipientName} esta digitando...</Text>
            </View>
          )}

          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder="Digite sua mensagem"
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={handleInputChange}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isSendingMessage) && styles.sendButtonDisabled]}
              onPress={() => {
                void handleSend();
              }}
              disabled={!inputText.trim() || isSendingMessage}
            >
              {isSendingMessage ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={styles.sendButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default function ChatScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsList" component={ConversationsListScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.huge,
    color: colors.text,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  searchBox: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    height: 42,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  conversationBody: {
    flex: 1,
    gap: spacing.xs,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  conversationName: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  conversationTime: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadBadgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  detailTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  chatBody: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  messageBubbleOwn: {
    backgroundColor: colors.primary,
  },
  messageBubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  messageTimestamp: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    alignSelf: 'flex-end',
  },
  typingRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  typingText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
  },
  sendButton: {
    minWidth: 74,
    height: 42,
    borderRadius: spacing.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
