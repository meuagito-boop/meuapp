import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

/**
 * NotificationsScreen - T13 Design Aprovado
 * Central de Notificações com lista cronológica única
 * 4 tipos: Social (1.2+), Estabelecimentos, Pedidos (1.2+), Sistema
 * Fase 1.0: Estabelecimentos e Sistema ativos
 */

interface NotificationItem {
  id: string;
  type: 'social' | 'establishment' | 'order' | 'system';
  title: string;
  text: string;
  avatar: string;
  badge: string;
  badgeColor: string;
  timestamp: Date;
  read: boolean;
  miniature?: string;
  action?: string;
  actionDestination?: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'establishment',
    title: 'Barbearia Vintage',
    text: 'publicou um novo Momento.',
    avatar: '💈',
    badge: '▶',
    badgeColor: '#E8640A',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    action: 'View Story',
    actionDestination: 'FeedSocial',
  },
  {
    id: 'n2',
    type: 'establishment',
    title: 'Pizzaria Do Nino',
    text: 'tem promoção hoje: 20% off no almoço.',
    avatar: '🍕',
    badge: '%',
    badgeColor: '#27AE60',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    read: false,
    action: 'View Promo',
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Bem-vindo',
    text: 'Bem-vindo ao Meu Agito! Explore o que está rolando na sua cidade.',
    avatar: '📱',
    badge: 'M',
    badgeColor: '#E8640A',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Alerta de Segurança',
    text: 'Novo acesso detectado na sua conta de São Paulo, SP. Se não foi você, proteja agora.',
    avatar: '🔒',
    badge: '!',
    badgeColor: '#E8640A',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    action: 'Review',
    actionDestination: 'Settings',
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Mark all as read when screen is focused
      setNotifications((prev) =>
        prev.map((notif) => (notif.read ? notif : { ...notif, read: true })),
      );
    }, []),
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const groupedNotifications = groupByDate(notifications);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    if (notif.actionDestination) {
      navigation.navigate(notif.actionDestination);
    }
  };

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
    return date.toLocaleDateString('pt-BR', { day: 'short', month: 'short' });
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notifItem, item.read ? styles.notifItemRead : styles.notifItemUnread]}
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
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

      {item.miniature && (
        <View style={styles.notifThumb}>
          <Text>{item.miniature}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>{section.title}</Text>
    </View>
  );

  const emptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>Nenhuma notificação ainda</Text>
      <Text style={styles.emptySubtitle}>
        Você receberá notificações sobre atividades relevantes
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.headerAction}>Marcar lidas</Text>
          </TouchableOpacity>
        )}
        {!hasUnread && <View style={styles.headerSpacer} />}
      </View>

      {hasUnread && (
        <View style={styles.unreadCounter}>
          <Text style={styles.unreadCounterText}>
            🔔 <Text style={styles.unreadCounterNumber}>{unreadCount}</Text> novas
            notificações
          </Text>
        </View>
      )}

      {notifications.length === 0 ? (
        emptyState()
      ) : (
        <SectionList
          sections={groupedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
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

  const groups: { [key: string]: NotificationItem[] } = {
    HOJE: [],
    ONTEM: [],
  };

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.timestamp);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === today.getTime()) {
      groups['HOJE'].push(notif);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups['ONTEM'].push(notif);
    } else {
      const dateKey = notif.timestamp.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(notif);
    }
  });

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
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
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 15,
    color: colors.text,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text,
  },
  headerAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 34,
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: colors.text,
  },
  notifTime: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  notifThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
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
    fontWeight: '700',
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
