import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { notificationsService } from '@services/api';
import type { NotificationItem as ApiNotificationItem } from '@services/api/NotificationsService';
import socketManager from '@services/socket/SocketIOManager';
import { logger } from '@utils/logger';

interface NotificationItem {
  id: string;
  type: 'social' | 'establishment' | 'order' | 'system';
  title: string;
  text: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  badgeColor: string;
  avatar: string;
  badge: string;
  timestamp: Date;
  read: boolean;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown> | null;
  relatedUserId?: string | null;
  relatedPostId?: string | null;
}

type NormalizedEntityType =
  | 'conversation'
  | 'establishment'
  | 'product'
  | 'produto'
  | 'event'
  | 'evento'
  | 'post';

const TYPE_META: Record<
  string,
  { icon: keyof typeof Feather.glyphMap; iconColor: string; badgeColor: string; normalizedType: NotificationItem['type'] }
> = {
  social: {
    icon: 'heart',
    iconColor: colors.primary,
    badgeColor: colors.primary,
    normalizedType: 'social',
  },
  establishment: {
    icon: 'map-pin',
    iconColor: colors.success,
    badgeColor: colors.success,
    normalizedType: 'establishment',
  },
  order: {
    icon: 'shopping-bag',
    iconColor: colors.info,
    badgeColor: colors.info,
    normalizedType: 'order',
  },
  system: {
    icon: 'bell',
    iconColor: colors.warning,
    badgeColor: colors.warning,
    normalizedType: 'system',
  },
};

const getPayloadString = (
  payload: Record<string, unknown> | null | undefined,
  key: string,
): string | null => {
  const value = payload?.[key];

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeEntityType = (value?: string | null): NormalizedEntityType | null => {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === 'conversation' ||
    normalized === 'establishment' ||
    normalized === 'product' ||
    normalized === 'produto' ||
    normalized === 'event' ||
    normalized === 'evento' ||
    normalized === 'post'
  ) {
    return normalized;
  }

  return null;
};

const getNotificationEntityId = (
  notification: NotificationItem,
  payloadKeys: string[] = [],
): string | null => {
  if (notification.entityId?.trim()) {
    return notification.entityId.trim();
  }

  for (const key of payloadKeys) {
    const payloadValue = getPayloadString(notification.payload, key);
    if (payloadValue) {
      return payloadValue;
    }
  }

  return getPayloadString(notification.payload, 'entityId');
};

const mapApiNotification = (item: ApiNotificationItem): NotificationItem => {
  const meta = TYPE_META[item.type] || TYPE_META.system;

  return {
    id: item.id,
    type: meta.normalizedType,
    title: item.title,
    text: item.body,
    icon: meta.icon,
    iconColor: meta.iconColor,
    badgeColor: meta.badgeColor,
    avatar: item.title.slice(0, 1).toUpperCase() || 'N',
    badge: meta.normalizedType.slice(0, 1).toUpperCase(),
    timestamp: new Date(item.createdAt),
    read: item.isRead,
    entityType: item.entityType,
    entityId: item.entityId,
    payload: item.payload,
    relatedUserId: item.relatedUserId,
    relatedPostId: item.relatedPostId,
  };
};

const mapSocketNotification = (
  item: Partial<ApiNotificationItem> & {
    id: string;
    type: string;
    title: string;
    body?: string;
    message?: string;
    createdAt?: string;
  },
): NotificationItem => {
  const meta = TYPE_META[item.type] || TYPE_META.system;

  return {
    id: item.id,
    type: meta.normalizedType,
    title: item.title,
    text: item.body || item.message || '',
    icon: meta.icon,
    iconColor: meta.iconColor,
    badgeColor: meta.badgeColor,
    avatar: item.title.slice(0, 1).toUpperCase() || 'N',
    badge: meta.normalizedType.slice(0, 1).toUpperCase(),
    timestamp: item.createdAt ? new Date(item.createdAt) : new Date(),
    read: item.isRead ?? false,
    entityType: item.entityType,
    entityId: item.entityId,
    payload: item.payload,
    relatedUserId: item.relatedUserId,
    relatedPostId: item.relatedPostId,
  };
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationsService.list({ page: 1, limit: 100 });
      setNotifications(response.data.map(mapApiNotification));
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Falha ao carregar notificacoes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  useEffect(() => {
    const unsubscribe = socketManager.on('notification:new', (incomingNotification) => {
      setNotifications((previousNotifications) => {
        const mappedNotification = mapSocketNotification(incomingNotification);
        const withoutPreviousVersion = previousNotifications.filter(
          (notification) => notification.id !== mappedNotification.id,
        );

        return [mappedNotification, ...withoutPreviousVersion].sort(
          (left, right) => right.timestamp.getTime() - left.timestamp.getTime(),
        );
      });
    });

    return unsubscribe;
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const groupedNotifications = useMemo(() => groupByDate(notifications), [notifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (markError) {
      const message = markError instanceof Error ? markError.message : 'Falha ao marcar notificacoes';
      Alert.alert('Erro', message);
    }
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    Alert.alert('Excluir notificacao', 'Deseja remover esta notificacao?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationsService.delete(id);
            setNotifications((prev) => prev.filter((item) => item.id !== id));
          } catch (deleteError) {
            const message =
              deleteError instanceof Error ? deleteError.message : 'Falha ao excluir notificacao';
            Alert.alert('Erro', message);
          }
        },
      },
    ]);
  }, []);

  const markAsReadLocally = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const handleNotificationPress = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.read) {
        try {
          await notificationsService.markAsRead(notification.id);
          markAsReadLocally(notification.id);
        } catch (markError) {
          logger.warn('Falha ao marcar notificacao como lida:', markError);
        }
      }

      const entityType = normalizeEntityType(notification.entityType);
      const conversationId =
        getPayloadString(notification.payload, 'conversationId') ||
        (entityType === 'conversation'
          ? getNotificationEntityId(notification, ['conversationId'])
          : null);
      const entityId = getNotificationEntityId(notification, ['id']);

      if (notification.relatedPostId || entityType === 'post') {
        navigation.navigate('MainTabs', { screen: 'Feed' });
        return;
      }

      if (conversationId) {
        const recipientName =
          getPayloadString(notification.payload, 'recipientName') ||
          getPayloadString(notification.payload, 'senderName') ||
          notification.title;

        navigation.navigate('MainTabs', {
          screen: 'Chat',
          params: {
            screen: 'ChatDetail',
            params: {
              conversationId,
              recipientName,
            },
          },
        });
        return;
      }

      if (entityType === 'establishment' && entityId) {
        navigation.navigate('MainTabs', {
          screen: 'Profile',
          params: {
            type: 'establishment',
            establishmentId: entityId,
          },
        });
        return;
      }

      if ((entityType === 'product' || entityType === 'produto') && entityId) {
        navigation.navigate('Item', {
          template: 'produto',
          productId: entityId,
        });
        return;
      }

      if ((entityType === 'event' || entityType === 'evento') && entityId) {
        navigation.navigate('Item', {
          template: 'evento',
          item: {
            id: entityId,
            name: notification.title,
            description: notification.text,
            category: 'Evento',
            price: 'Consulte',
          },
        });
        return;
      }

      if (notification.relatedUserId) {
        navigation.navigate('MainTabs', {
          screen: 'Profile',
          params: {
            type: 'user',
            userId: notification.relatedUserId,
          },
        });
        return;
      }

      if (notification.type === 'system') {
        navigation.navigate('MainTabs', { screen: 'Settings' });
      }
    },
    [markAsReadLocally, navigation],
  );

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      return days[date.getDay()];
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notifItem, item.read ? styles.notifItemRead : styles.notifItemUnread]}
      activeOpacity={0.7}
      onPress={() => void handleNotificationPress(item)}
      onLongPress={() => handleDeleteNotification(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.read ? 'Notificacao lida' : 'Notificacao nao lida'}: ${item.title}. ${item.text}`}
      accessibilityHint="Toque para abrir o destino. Toque e segure para excluir."
    >
      {!item.read && <View style={styles.unreadDot} />}

      <View style={styles.notifAvatar}>
        <Text style={styles.notifAvatarText}>{item.avatar}</Text>
        <View style={[styles.notifBadge, { backgroundColor: item.badgeColor }]}>
          <Text style={styles.notifBadgeText}>{item.badge}</Text>
        </View>
      </View>

      <View style={styles.notifContent}>
        <Text style={[styles.notifText, !item.read && styles.notifTextUnread]}>
          <Text style={styles.notifTextBold}>{item.title}</Text> {item.text}
        </Text>
        <Text style={styles.notifTime}>{formatTime(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>{section.title}</Text>
    </View>
  );

  const emptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>N</Text>
      <Text style={styles.emptyTitle}>Nenhuma notificacao ainda</Text>
      <Text style={styles.emptySubtitle}>
        {error || 'Voce recebera notificacoes sobre atividades relevantes'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Notificacoes</Text>
        {hasUnread ? (
          <TouchableOpacity
            onPress={() => void handleMarkAllAsRead()}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas as notificacoes como lidas"
          >
            <Text style={styles.headerAction}>Marcar lidas</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {hasUnread && (
        <View style={styles.unreadCounter}>
          <Text style={styles.unreadCounterText}>
            <Text style={styles.unreadCounterNumber}>{unreadCount}</Text> novas notificacoes
          </Text>
        </View>
      )}

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        emptyState()
      ) : (
        <SectionList
          sections={groupedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void onRefresh()}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function groupByDate(
  notifications: NotificationItem[],
): Array<{ title: string; data: NotificationItem[] }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, NotificationItem[]> = {
    HOJE: [],
    ONTEM: [],
  };

  notifications.forEach((notification) => {
    const normalizedDate = new Date(notification.timestamp);
    normalizedDate.setHours(0, 0, 0, 0);

    if (normalizedDate.getTime() === today.getTime()) {
      groups.HOJE.push(notification);
      return;
    }

    if (normalizedDate.getTime() === yesterday.getTime()) {
      groups.ONTEM.push(notification);
      return;
    }

    const dateKey = notification.timestamp.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(notification);
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([title, data]) => ({ title, data }));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  headerAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  unreadCounter: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadCounterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unreadCounterNumber: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  dateHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateHeaderText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    position: 'relative',
  },
  notifItemRead: {
    backgroundColor: colors.background,
  },
  notifItemUnread: {
    backgroundColor: colors.surface,
  },
  unreadDot: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.md + 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  notifAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifAvatarText: {
    fontSize: 20,
  },
  notifBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  notifBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  notifTextUnread: {
    color: colors.text,
  },
  notifTextBold: {
    fontWeight: '600',
    color: colors.text,
  },
  notifTime: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
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
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
