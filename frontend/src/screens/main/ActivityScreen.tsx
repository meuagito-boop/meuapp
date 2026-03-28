import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * ActivityScreen - T_ATIVIDADE Design Aprovado
 * Hub pessoal do usuário com 5 cards
 * Favoritos e Histórico ativo (Fase 1.0)
 * Pedidos, Agendamentos, Reservas em breve (Fase 1.2+)
 */

interface ActivityCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  phase: '1.0' | '1.2+';
  color: string;
  route?: string;
  badge?: number;
}

const ACTIVITY_CARDS: ActivityCard[] = [
  {
    id: 'favorites',
    title: 'Meus Favoritos',
    subtitle: 'Lugares e eventos salvos',
    icon: '❤️',
    phase: '1.0',
    color: '#E8640A',
    route: 'ActivityFavorites',
    badge: 5,
  },
  {
    id: 'orders',
    title: 'Meus Pedidos',
    subtitle: 'Delivery e compras',
    icon: '🛒',
    phase: '1.2+',
    color: '#3498DB',
  },
  {
    id: 'appointments',
    title: 'Meus Agendamentos',
    subtitle: 'Serviços e procedimentos',
    icon: '📅',
    phase: '1.2+',
    color: '#9B59B6',
  },
  {
    id: 'reservations',
    title: 'Minhas Reservas',
    subtitle: 'Hotel e restaurante',
    icon: '🏨',
    phase: '1.2+',
    color: '#27AE60',
  },
  {
    id: 'history',
    title: 'Histórico de Atividades',
    subtitle: 'Check-ins, buscas e vistos',
    icon: '📍',
    phase: '1.0',
    color: '#F39C12',
    route: 'ActivityHistory',
  },
];

export default function ActivityScreen() {
  const navigation = useNavigation<any>();
  const [loadingCards, setLoadingCards] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      // Reset loading state when screen is focused
      setLoadingCards([]);
    }, []),
  );

  const handleCardPress = (card: ActivityCard) => {
    if (card.phase === '1.2+') {
      Alert.alert('Em breve', `${card.title} estará disponível em breve.`);
      return;
    }

    if (card.route) {
      // Push new stack screen for child navigation
      navigation.push(card.route);
    }
  };

  const renderCard = (card: ActivityCard) => {
    const isActive = card.phase === '1.0';
    const opacity = isActive ? 1 : 0.6;

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          !isActive && styles.cardDisabled,
          { opacity },
        ]}
        onPress={() => handleCardPress(card)}
        activeOpacity={isActive ? 0.7 : 1}
      >
        {/* Icon */}
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: card.color + '15' },
          ]}
        >
          <Text style={styles.cardIconText}>{card.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
        </View>

        {/* Badge or Phase Label */}
        <View style={styles.cardRight}>
          {isActive && card.badge ? (
            <View style={[styles.badge, { backgroundColor: card.color }]}>
              <Text style={styles.badgeText}>{card.badge}</Text>
            </View>
          ) : null}
          {!isActive && (
            <Text style={styles.phaseLabel}>Em breve</Text>
          )}
          {isActive && (
            <Text style={styles.chevron}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <Text style={styles.title}>Atividade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ACTIVITY_CARDS.map((card) => renderCard(card))}
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text,
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardDisabled: {
    borderStyle: 'dashed',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  phaseLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textTertiary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
