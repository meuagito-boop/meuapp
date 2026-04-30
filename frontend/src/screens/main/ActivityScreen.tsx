import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';

type ActivityCard = {
  id: string;
  title: string;
  subtitle: string;
  iconLabel: string;
  status: 'info' | 'coming_soon';
  route?: string;
};

const ACTIVITY_CARDS: ActivityCard[] = [
  {
    id: 'favorites',
    title: 'Favoritos',
    subtitle: 'Estado atual do recurso e proximo passo',
    iconLabel: 'FV',
    status: 'info',
    route: 'ActivityFavorites',
  },
  {
    id: 'orders',
    title: 'Pedidos',
    subtitle: 'Fluxo comercial fora do escopo atual',
    iconLabel: 'PD',
    status: 'coming_soon',
  },
  {
    id: 'appointments',
    title: 'Agendamentos',
    subtitle: 'Fase posterior ao MVP atual',
    iconLabel: 'AG',
    status: 'coming_soon',
  },
  {
    id: 'reservations',
    title: 'Reservas',
    subtitle: 'Fase posterior ao MVP atual',
    iconLabel: 'RS',
    status: 'coming_soon',
  },
  {
    id: 'history',
    title: 'Historico',
    subtitle: 'Estado atual do recurso e proximo passo',
    iconLabel: 'HI',
    status: 'info',
    route: 'ActivityHistory',
  },
];

export default function ActivityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const handleCardPress = (card: ActivityCard) => {
    if (card.status === 'coming_soon') {
      Alert.alert('Em breve', `${card.title} ainda nao faz parte do MVP entregue neste build.`);
      return;
    }

    if (card.route) {
      navigation.push(card.route);
    }
  };

  const renderCard = (card: ActivityCard) => {
    const isInteractive = card.status === 'info' && Boolean(card.route);

    return (
      <TouchableOpacity
        key={card.id}
        style={[styles.card, !isInteractive && styles.cardMuted]}
        onPress={() => handleCardPress(card)}
        activeOpacity={isInteractive ? 0.7 : 0.9}
      >
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{card.iconLabel}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={[styles.statusLabel, card.status === 'info' ? styles.statusInfo : styles.statusSoon]}>
            {card.status === 'info' ? 'Status' : 'Depois'}
          </Text>
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
        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>Painel de status do app</Text>
          <Text style={styles.infoText}>
            Esta area nao deve mais simular dados locais como se os recursos estivessem sincronizados.
            Os cards abaixo mostram o que ja existe e o que continua fora do escopo atual.
          </Text>
        </View>

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
  infoPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
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
  cardMuted: {
    opacity: 0.85,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusInfo: {
    color: colors.primary,
  },
  statusSoon: {
    color: colors.textTertiary,
  },
});
