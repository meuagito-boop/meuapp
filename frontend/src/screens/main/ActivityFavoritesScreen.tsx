import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * ActivityFavoritesScreen - T_ATIVIDADE_FAVORITOS
 * Lista de favoritos salvos pelo usuário
 * Fase 1.0: Tipos suportados - Lugares, Eventos, Itens
 */

interface FavoriteItem {
  id: string;
  type: 'place' | 'event' | 'item';
  name: string;
  category: string;
  emoji: string;
  savedAt: Date;
  thumbnail?: string;
}

const MOCK_FAVORITES: FavoriteItem[] = [
  {
    id: '1',
    type: 'place',
    name: 'Pizzaria Do Nino',
    category: 'Restaurante',
    emoji: '🍕',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '2',
    type: 'place',
    name: 'Barbearia Vintage',
    category: 'Serviço',
    emoji: '💈',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '3',
    type: 'event',
    name: 'Festival de Rock 2026',
    category: 'Música',
    emoji: '🎸',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '4',
    type: 'item',
    name: 'Camiseta Vintage',
    category: 'Moda',
    emoji: '👕',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

const FILTER_CHIPS = [
  { id: 'all', label: 'Todos' },
  { id: 'place', label: 'Lugares' },
  { id: 'event', label: 'Eventos' },
  { id: 'item', label: 'Itens' },
];

export default function ActivityFavoritesScreen() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(MOCK_FAVORITES);

  useFocusEffect(
    useCallback(() => {
      // Reset state when screen is focused
      setEditMode(false);
      setSelectedItems([]);
    }, []),
  );

  const filteredFavorites = favorites.filter((fav) =>
    activeFilter === 'all' ? true : fav.type === activeFilter,
  );

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFavorites.map((fav) => fav.id));
    }
  };

  const handleRemoveFavorites = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Nenhum item selecionado');
      return;
    }

    Alert.alert(
      'Remover favoritos',
      `Deseja remover ${selectedItems.length} item(ns) dos favoritos?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Remover',
          onPress: () => {
            setFavorites((prev) =>
              prev.filter((fav) => !selectedItems.includes(fav.id)),
            );
            setSelectedItems([]);
            setEditMode(false);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleRemoveItem = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.favoriteItem,
          isSelected && styles.favoriteItemSelected,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          if (editMode) {
            handleSelectItem(item.id);
          }
          // Navigate to detail when not in edit mode
        }}
      >
        {editMode && (
          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxChecked,
            ]}
          >
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}

        <View style={styles.favThumbnail}>
          <Text style={styles.favEmoji}>{item.emoji}</Text>
        </View>

        <View style={styles.favInfo}>
          <Text style={styles.favName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.favCategory} numberOfLines={1}>
            {item.category}
          </Text>
        </View>

        {!editMode && (
          <TouchableOpacity
            style={styles.favHeart}
            onPress={() => handleRemoveItem(item.id)}
          >
            <Text style={styles.heartIcon}>❤️</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const emptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
      <Text style={styles.emptySubtitle}>
        Salve lugares, eventos e itens tocando em ❤️
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Text style={styles.headerAction}>
            {editMode ? 'Cancelar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.filterChip,
              activeFilter === chip.id && styles.filterChipActive,
            ]}
            onPress={() => {
              setActiveFilter(chip.id);
              setSelectedItems([]);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === chip.id && styles.filterChipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        emptyState()
      ) : (
        <>
          <FlatList
            data={filteredFavorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.listContainer}
          />

          {editMode && (
            <View style={styles.editFooter}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAll}
              >
                <Text style={styles.selectAllText}>
                  {selectedItems.length === filteredFavorites.length
                    ? 'Desselecionar tudo'
                    : 'Selecionar tudo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  selectedItems.length === 0 && styles.deleteButtonDisabled,
                ]}
                onPress={handleRemoveFavorites}
                disabled={selectedItems.length === 0}
              >
                <Text style={styles.deleteButtonText}>
                  🗑️ Remover ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  favoriteItemSelected: {
    backgroundColor: colors.surface,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  favThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favEmoji: {
    fontSize: 24,
  },
  favInfo: {
    flex: 1,
  },
  favName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  favCategory: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  favHeart: {
    paddingHorizontal: spacing.sm,
  },
  heartIcon: {
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
  editFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  selectAllButton: {
    paddingVertical: spacing.sm,
  },
  selectAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
});
