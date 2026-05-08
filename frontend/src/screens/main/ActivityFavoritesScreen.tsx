import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScreenHeader } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { locationService } from '@services/api';
import type { Establishment } from '@services/api/LocationService';

const getInitials = (value: string) =>
  value
    .split(' ')
    .map((chunk) => chunk.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function ActivityFavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [items, setItems] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await locationService.listFavoriteEstablishments(1, 50);
      setItems(response.data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar favoritos.';
      setError(message);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites])
  );

  const handleOpenItem = (item: Establishment) => {
    navigation.getParent()?.navigate('Profile', {
      type: 'establishment',
      establishmentId: item.id,
    });
  };

  const handleRemove = async (item: Establishment) => {
    if (removingId) {
      return;
    }

    setRemovingId(item.id);
    setError(null);

    try {
      await locationService.unfavoriteEstablishment(item.id);
      setItems((current) => current.filter((favorite) => favorite.id !== item.id));
    } catch (removeError) {
      const message =
        removeError instanceof Error ? removeError.message : 'Nao foi possivel remover favorito.';
      setError(message);
    } finally {
      setRemovingId(null);
    }
  };

  const renderItem = ({ item }: { item: Establishment }) => (
    <TouchableOpacity
      style={styles.favoriteRow}
      activeOpacity={0.85}
      onPress={() => handleOpenItem(item)}
      accessibilityRole="button"
    >
      <View style={styles.thumb}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <Text style={styles.thumbFallback}>{getInitials(item.name)}</Text>
        )}
      </View>

      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.favoriteMeta} numberOfLines={1}>
          {item.subcategory || item.category} · {item.address}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => void handleRemove(item)}
        disabled={removingId === item.id}
        accessibilityRole="button"
      >
        <Text style={styles.removeButtonText}>
          {removingId === item.id ? '...' : 'Remover'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Favoritos" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Carregando favoritos...</Text>
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Favoritos indisponiveis</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadFavorites()}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyText}>
              Abra o perfil de um estabelecimento e toque em Salvar para manter o lugar nesta lista.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  favoriteMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  removeButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E74C3C',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeButtonText: {
    color: '#E74C3C',
    fontSize: fontSize.xs,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
  inlineError: {
    color: colors.error,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
