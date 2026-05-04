import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { locationService } from '@services/api';
import { activityHistoryService } from '@services/activity/ActivityHistoryService';
import type { Establishment } from '@services/api/LocationService';

type ActivityCard = {
  id: 'favorites' | 'history';
  title: string;
  subtitle: string;
  counter: number;
  action: () => void;
};

const getInitials = (value: string) =>
  value
    .split(' ')
    .map((chunk) => chunk.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function ActivityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritePreview, setFavoritePreview] = useState<Establishment[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [favorites, history] = await Promise.all([
        locationService.listFavoriteEstablishments(1, 4),
        activityHistoryService.getHistory(),
      ]);

      setFavoritePreview(favorites.data);
      setFavoritesCount(favorites.total);
      setHistoryCount(history.checkins.length + history.searches.length + history.viewed.length);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar suas atividades.';
      setError(message);
      setFavoritePreview([]);
      setFavoritesCount(0);
      setHistoryCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary])
  );

  const cards: ActivityCard[] = [
    {
      id: 'favorites',
      title: 'Meus favoritos',
      subtitle: favoritesCount > 0 ? 'Lugares salvos por voce' : 'Salve lugares pelo perfil do estabelecimento',
      counter: favoritesCount,
      action: () => navigation.push('ActivityFavorites'),
    },
    {
      id: 'history',
      title: 'Historico de atividades',
      subtitle: historyCount > 0 ? 'Buscas e itens vistos recentemente' : 'Suas buscas e visualizacoes aparecerao aqui',
      counter: historyCount,
      action: () => navigation.push('ActivityHistory'),
    },
  ];

  const renderFavoritePreview = () => {
    if (favoritePreview.length === 0) {
      return (
        <View style={styles.previewEmpty}>
          <Text style={styles.previewEmptyText}>Sem favoritos salvos</Text>
        </View>
      );
    }

    return (
      <View style={styles.previewRow}>
        {favoritePreview.map((item) => (
          <View key={item.id} style={styles.previewThumb}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <Text style={styles.previewFallback}>{getInitials(item.name)}</Text>
            )}
          </View>
        ))}
      </View>
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

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.centerText}>Carregando atividades...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Atividade indisponivel</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadSummary()}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsWrapper}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={card.action}
                accessibilityRole="button"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Text style={styles.cardIconText}>{card.id === 'favorites' ? 'S' : 'H'}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.counterBadge}>{card.counter}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                  <Text style={styles.chevron}>{'>'}</Text>
                </View>
                {card.id === 'favorites' ? renderFavoritePreview() : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
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
    padding: spacing.md,
  },
  cardsWrapper: {
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#201005',
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  counterBadge: {
    minWidth: 24,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2E1405',
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textAlign: 'center',
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  previewThumb: {
    width: 54,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFallback: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  previewEmpty: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  previewEmptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  centerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
