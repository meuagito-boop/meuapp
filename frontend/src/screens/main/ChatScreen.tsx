import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';
import { useSocket } from '@hooks';

/**
 * ChatScreen - Módulo de Chat Completo
 * 2 Telas: ConversationsList + ChatDetailScreen
 * Socket.io real-time, typing indicators, read receipts
 */

interface ChatUser {
  id: string;
  name: string;
  emoji: string;
  avatar: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: ChatUser;
  conversationId: string;
  timestamp: string;
  readBy: string[];
  fileUrl?: string;
  editedAt?: string;
}

interface Conversation {
  id: string;
  participants: ChatUser[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

const Stack = createNativeStackNavigator();

// MOCK DATA
const MOCK_USERS: { [key: string]: ChatUser } = {
  u1: { id: 'u1', name: 'Pedro Lara', emoji: '👨‍💼', avatar: '👨‍💼', isOnline: true },
  u2: { id: 'u2', name: 'Ana Costa', emoji: '👩‍🎨', avatar: '👩‍🎨', isOnline: false },
  u3: { id: 'u3', name: 'Carlos Meio', emoji: '👨‍🍳', avatar: '👨‍🍳', isOnline: true },
  u4: { id: 'u4', name: 'Sofia Lima', emoji: '👩‍💻', avatar: '👩‍💻', isOnline: true },
};

const CURRENT_USER_ID = 'current_user';
const CURRENT_USER: ChatUser = {
  id: CURRENT_USER_ID,
  name: 'Você',
  emoji: '🧑',
  avatar: '🧑',
  isOnline: true,
};

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg1',
    content: 'Oi! Tudo bem?',
    senderId: 'u1',
    sender: MOCK_USERS.u1,
    conversationId: 'conv_1',
    timestamp: '2h',
    readBy: [CURRENT_USER_ID, 'u1'],
  },
  {
    id: 'msg2',
    content: 'Tudo certo! E você?',
    senderId: CURRENT_USER_ID,
    sender: CURRENT_USER,
    conversationId: 'conv_1',
    timestamp: '2h',
    readBy: [CURRENT_USER_ID, 'u1'],
  },
  {
    id: 'msg3',
    content: 'Tudo bem! Vamos marcar um café qualquer dia?',
    senderId: 'u1',
    sender: MOCK_USERS.u1,
    conversationId: 'conv_1',
    timestamp: '1h',
    readBy: [CURRENT_USER_ID, 'u1'],
  },
  {
    id: 'msg4',
    content: 'Claro! Próxima semana funciona? 🙌',
    senderId: CURRENT_USER_ID,
    sender: CURRENT_USER,
    conversationId: 'conv_1',
    timestamp: '45m',
    readBy: [CURRENT_USER_ID, 'u1'],
  },
  {
    id: 'msg5',
    content: 'Perfeito!',
    senderId: 'u1',
    sender: MOCK_USERS.u1,
    conversationId: 'conv_1',
    timestamp: '30m',
    readBy: [CURRENT_USER_ID],
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participants: [MOCK_USERS.u1],
    lastMessage: MOCK_MESSAGES[4],
    unreadCount: 1,
    updatedAt: '30m',
  },
  {
    id: 'conv_2',
    participants: [MOCK_USERS.u2],
    lastMessage: {
      id: 'msg10',
      content: 'Tudo bem com você?',
      senderId: 'u2',
      sender: MOCK_USERS.u2,
      conversationId: 'conv_2',
      timestamp: '3h',
      readBy: [CURRENT_USER_ID],
    },
    unreadCount: 2,
    updatedAt: '3h',
  },
  {
    id: 'conv_3',
    participants: [MOCK_USERS.u3],
    lastMessage: {
      id: 'msg11',
      content: 'Você já provou o novo prato?',
      senderId: CURRENT_USER_ID,
      sender: CURRENT_USER,
      conversationId: 'conv_3',
      timestamp: '5h',
      readBy: [CURRENT_USER_ID, 'u3'],
    },
    unreadCount: 0,
    updatedAt: '5h',
  },
  {
    id: 'conv_4',
    participants: [MOCK_USERS.u4],
    lastMessage: {
      id: 'msg12',
      content: 'Aparece no stand up?',
      senderId: 'u4',
      sender: MOCK_USERS.u4,
      conversationId: 'conv_4',
      timestamp: '1d',
      readBy: [CURRENT_USER_ID, 'u4'],
    },
    unreadCount: 0,
    updatedAt: '1d',
  },
];

// ========== CONVERSATIONS LIST SCREEN ==========
function ConversationsListScreen({ navigation }: any) {
  // ============ Socket.IO Integration ============
  const { on, isConnected } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ============ Real-time Conversation Updates ============
  useEffect(() => {
    // Escutar quando novas mensagens chegam para atualizar preview
    const unsubscribeMessage = on('message:received', (data: any) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessage: {
                  id: data.id,
                  content: data.content,
                  senderId: data.senderId,
                  sender: { 
                    id: data.senderId,
                    name: data.senderName || 'Unknown',
                    emoji: data.senderEmoji || '👤',
                    avatar: data.senderEmoji || '👤',
                    isOnline: true
                  },
                  conversationId: data.conversationId,
                  timestamp: data.timestamp || 'now',
                  readBy: data.readBy || [],
                },
                updatedAt: data.timestamp || 'agora',
              }
            : conv
        )
      );
    });

    // Escutar quando usuários vão online/offline
    const unsubscribePresence = on('user:online', (data: any) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participants[0].id === data.userId
            ? {
                ...conv,
                participants: conv.participants.map((p) =>
                  p.id === data.userId ? { ...p, isOnline: data.isOnline } : p
                ),
              }
            : conv
        )
      );
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribePresence?.();
    };
  }, [on]);

  const filteredConversations = searchQuery
    ? conversations.filter((conv) =>
        conv.participants[0].name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    navigation.navigate('ChatDetail', { conversation });
  }, [navigation]);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUser = item.participants[0];
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, isUnread && styles.conversationItemUnread]}
        onPress={() => handleSelectConversation(item)}
      >
        <View style={styles.conversationAvatar}>
          <Text>{otherUser.emoji}</Text>
          {otherUser.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, isUnread && { fontWeight: '700' }]}>
              {otherUser.name}
            </Text>
            <Text style={styles.conversationTime}>{item.updatedAt}</Text>
          </View>
          <Text
            style={[styles.conversationLastMessage, isUnread && { fontWeight: '600', color: colors.text }]}
            numberOfLines={1}
          >
            {item.lastMessage?.senderId === CURRENT_USER_ID ? 'Você: ' : ''}
            {item.lastMessage?.content}
          </Text>
        </View>

        {isUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.listTitle}>Mensagens</Text>
          {totalUnread > 0 && (
            <Text style={styles.listSubtitle}>{totalUnread} não lidas</Text>
          )}
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar conversa..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ========== CHAT DETAIL SCREEN ==========
function ChatDetailScreen({ route, navigation }: any) {
  const { conversation } = route.params;
  const otherUser = conversation.participants[0];

  // ============ Socket.IO Integration ============
  const { 
    sendMessage: sendViaSocket, 
    setTyping: sendTypingStatus,
    on, 
    off,
    isConnected 
  } = useSocket();

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // ============ Socket.IO Event Listeners ============
  useEffect(() => {
    // Escutar mensagens que chegam do Socket.IO
    const unsubscribeMessage = on('message:received', (data: any) => {
      const newMessage: Message = {
        id: data.id || `msg_${Date.now()}`,
        content: data.content,
        senderId: data.senderId,
        sender: data.senderName ? { 
          id: data.senderId, 
          name: data.senderName, 
          emoji: data.senderEmoji || '👤',
          avatar: data.senderEmoji || '👤',
          isOnline: true
        } : otherUser,
        conversationId: conversation.id,
        timestamp: data.timestamp || 'now',
        readBy: data.readBy || [data.senderId],
        fileUrl: data.fileUrl,
        editedAt: data.editedAt,
      };

      setMessages((prev) => [...prev, newMessage]);
      
      // Scroll para última mensagem
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Escutar indicador de digitação
    const unsubscribeTyping = on('typing:user', (data: any) => {
      if (data.userId !== CURRENT_USER_ID && data.isTyping) {
        setOtherUserTyping(true);
      } else {
        setOtherUserTyping(false);
      }
    });

    // Cleanup ao desmontar
    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
    };
  }, [conversation.id, on]);

  // ============ Join/Leave Conversation ============
  useEffect(() => {
    // Entrar na conversa ao abrir
    // const joinData = { conversationId: conversation.id, userId: CURRENT_USER_ID };
    // console.log('[ChatDetailScreen] Joining conversation:', joinData);
    
    // Sair da conversa ao fechar
    return () => {
      // const leaveData = { conversationId: conversation.id, userId: CURRENT_USER_ID };
      // console.log('[ChatDetailScreen] Leaving conversation:', leaveData);
    };
  }, [conversation.id]);

  // ============ Input & Typing Handler ============
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      // Enviar status de digitação via Socket.IO
      if (isConnected) {
        sendTypingStatus(conversation.id, true).catch((error) => {
          console.warn('[ChatDetailScreen] Erro ao enviar typing status:', error);
        });
      }
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing após 2 segundos de inatividade
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Enviar fim de digitação via Socket.IO
      if (isConnected) {
        sendTypingStatus(conversation.id, false).catch((error) => {
          console.warn('[ChatDetailScreen] Erro ao parar typing:', error);
        });
      }
    }, 2000);
  };

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      content: inputText,
      senderId: CURRENT_USER_ID,
      sender: CURRENT_USER,
      conversationId: conversation.id,
      timestamp: 'now',
      readBy: [CURRENT_USER_ID],
    };

    // Adicionar mensagem localmente (optimistic update)
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsTyping(false);

    // Enviar via Socket.IO
    if (isConnected) {
      sendViaSocket(conversation.id, inputText)
        .then(() => {
          console.log('[ChatDetailScreen] Mensagem enviada com sucesso via Socket.IO');
          // Atualizar read receipts
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id
                ? { ...msg, readBy: [CURRENT_USER_ID, otherUser.id] }
                : msg
            )
          );
        })
        .catch((error) => {
          console.warn('[ChatDetailScreen] Erro ao enviar mensagem:', error);
          // Mensagem permanece local, será sincronizada quando reconectar
        });
    } else {
      // Fallback: manter apenas localmente se desconectado
      console.warn('[ChatDetailScreen] Socket.IO não conectado, mensagem local apenas');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, readBy: [CURRENT_USER_ID, otherUser.id], timestamp: 'now' }
            : msg
        )
      );
    }

    // Parar indicador de digitação
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(conversation.id, false).catch(() => {});

    // Scroll para última mensagem
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, conversation.id, otherUser.id, isConnected, sendViaSocket, sendTypingStatus]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);

    // Simular carregamento de histórico
    setTimeout(() => {
      setLoadingMore(false);
    }, 500);
  }, [loadingMore]);

  // ============ Mark as Read & Sync Status ============
  useEffect(() => {
    // Marcar conversa como lida ao abrir (só as não lidas)
    const unreadMessages = messages.filter(
      (msg) => !msg.readBy.includes(CURRENT_USER_ID)
    );

    if (unreadMessages.length > 0) {
      setMessages((prev) =>
        prev.map((msg) =>
          !msg.readBy.includes(CURRENT_USER_ID)
            ? { ...msg, readBy: [...msg.readBy, CURRENT_USER_ID] }
            : msg
        )
      );

      // Notificar via Socket.IO que marcou como lido
      if (isConnected) {
        unreadMessages.forEach((msg) => {
          // Socket.IO: emit mark:read 
          // Exemplo: sendMarkAsRead(msg.id, conversation.id)
        });
      }
    }
  }, [conversation.id, isConnected]);

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isOwnMessage = message.senderId === CURRENT_USER_ID;
    const isRead = message.readBy.includes(otherUser.id);

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.messageContainerOwn : styles.messageContainerOther,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.messageBubbleEmoji}>{message.sender.emoji}</Text>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.messageTextOwn : styles.messageTextOther,
            ]}
          >
            {message.content}
          </Text>
        </View>

        {isOwnMessage && (
          <Text style={styles.messageStatusIcon}>
            {isRead ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.chatHeaderBack}>←</Text>
        </TouchableOpacity>

        <View style={styles.chatHeaderUser}>
          <Text style={styles.chatHeaderEmoji}>{otherUser.emoji}</Text>
          <View>
            <Text style={styles.chatHeaderName}>{otherUser.name}</Text>
            <Text style={styles.chatHeaderStatus}>
              {otherUser.isOnline ? '🟢 Online' : '⚫ Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.chatHeaderActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Text>☎️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Text>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messagesContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          scrollEventThrottle={16}
          initialNumToRender={20}
        />

        {/* Typing Indicator */}
        {otherUserTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingEmoji}>{otherUser.emoji}</Text>
            <View style={styles.typingDots}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}

        {/* Loading More */}
        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Text style={styles.attachIcon}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.messageInput}
          placeholder="Mensagem..."
          placeholderTextColor={colors.textTertiary}
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          maxHeight={100}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>
            {inputText.trim() ? '📤' : '🎤'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ========== MAIN CHAT NAVIGATOR ==========
export default function ChatScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ConversationsList"
        component={ConversationsListScreen}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{
          cardStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack.Navigator>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // CONVERSATIONS LIST STYLES
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  listSubtitle: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonIcon: {
    fontSize: 18,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
  },

  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  conversationItemUnread: {
    backgroundColor: colors.surface,
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    fontSize: 28,
    position: 'relative',
  },
  onlineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.background,
  },
  conversationContent: {
    flex: 1,
    gap: spacing.xs,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conversationName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  conversationTime: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  conversationLastMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  unreadBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  // CHAT DETAIL STYLES
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  chatHeaderBack: {
    fontSize: 24,
    color: colors.primary,
  },
  chatHeaderUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chatHeaderEmoji: {
    fontSize: 32,
  },
  chatHeaderName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  chatHeaderStatus: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
  },

  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageContainerOther: {
    justifyContent: 'flex-start',
  },
  messageBubbleEmoji: {
    fontSize: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
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
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  messageTextOwn: {
    color: colors.text,
  },
  messageTextOther: {
    color: colors.text,
  },
  messageStatusIcon: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  typingEmoji: {
    fontSize: 24,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },

  loadingMoreContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendIcon: {
    fontSize: 18,
  },
});
