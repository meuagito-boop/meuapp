import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';
import { useFeed } from '@hooks/useFeed';

/**
 * SearchScreen - T07 Design Aprovado
 * 2 Momentos: Inicial (categorias + recentes) + Resultados (lista/mapa + filtros)
 */

const CATEGORIES = [
  { id: '1', name: 'Comida', emoji: '🍔' },
  { id: '2', name: 'Bebidas', emoji: '🍷' },
  { id: '3', name: 'Beleza', emoji: '💇' },
  { id: '4', name: 'Academia', emoji: '💪' },
  { id: '5', name: 'Eventos', emoji: '🎉' },
  { id: '6', name: 'Lazer', emoji: '🎮' },
  { id: '7', name: 'Saúde', emoji: '⚕️' },
  { id: '8', name: 'Educação', emoji: '📚' },
  { id: '9', name: 'Viagem', emoji: '✈️' },
  { id: '10', name: 'Casa', emoji: '🏠' },
  { id: '11', name: 'Moda', emoji: '👗' },
  { id: '12', name: 'Arte', emoji: '🎨' },
  { id: '13', name: 'Música', emoji: '🎵' },
  { id: '14', name: 'Esportes', emoji: '⚽' },
  { id: '15', name: 'Tecnologia', emoji: '💻' },
  { id: '16', name: 'Petshop', emoji: '🐾' },
  { id: '17', name: 'Automovel', emoji: '🚗' },
  { id: '18', name: 'Outros', emoji: '⭐' },
];

const ORDER_OPTIONS = [
  { id: '1', label: 'Relevância', value: 'relevance' },
  { id: '2', label: 'Mais próximo', value: 'distance' },
  { id: '3', label: 'Melhor avaliado', value: 'rating' },
  { id: '4', label: 'Mais popular', value: 'popularity' },
  { id: '5', label: 'Mais recente', value: 'recent' },
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { isLoading } = useFeed();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState('relevance');
  const [radius, setRadius] = useState(5);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);

  const recentSearches = ['Melhor Pizza', 'Spa Perto', 'Eventos Hoje', 'Academia'];

  const mockResults = [
    { id: '1', name: 'Pizzaria Do Nino', category: 'Comida', distance: 0.3, rating: 4.8, reviews: 245, isOpen: true, emoji: '🍕' },
    { id: '2', name: 'Bar da Esquina', category: 'Bebidas', distance: 0.5, rating: 4.5, reviews: 182, isOpen: true, emoji: '🍺' },
    { id: '3', name: 'Salão de Beleza Luxo', category: 'Beleza', distance: 0.8, rating: 4.9, reviews: 512, isOpen: false, emoji: '💇' },
    { id: '4', name: 'Academia Fit', category: 'Academia', distance: 1.2, rating: 4.3, reviews: 98, isOpen: true, emoji: '💪' },
    { id: '5', name: 'Café Cosy', category: 'Comida', distance: 0.2, rating: 4.7, reviews: 334, isOpen: true, emoji: '☕' },
  ];

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setIsSearching(text.length >= 2);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    setSelectedCategory(null);
    setOpenNow(false);
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = CATEGORIES.find(c => c.id === categoryId);
    setSearchQuery(category?.name || '');
    setIsSearching(true);
  };

  const handleRecentPress = (term: string) => {
    setSearchQuery(term);
    setIsSearching(true);
  };

  const filteredResults = useMemo(() => {
    let results = mockResults;

    if (selectedCategory) {
      const cat = CATEGORIES.find(c => c.id === selectedCategory);
      if (cat) {
        results = results.filter(r => r.category === cat.name);
      }
    }

    results = results.filter(r => r.rating >= minRating);
    results = results.filter(r => r.distance <= radius);

    if (openNow) {
      results = results.filter(r => r.isOpen);
    }

    switch (orderBy) {
      case 'distance':
        results.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        results.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'recent':
        results.reverse();
        break;
      default:
        break;
    }

    return results;
  }, [selectedCategory, minRating, radius, openNow, orderBy]);

  // MOMENT 1: Initial
  if (!isSearching && !searchQuery) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="O que você quer?"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎙</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Buscas recentes</Text>
              <View style={styles.chipsContainer}>
                {recentSearches.map((search, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleRecentPress(search)}
                  >
                    <Text style={styles.chipText}>🕐 {search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // MOMENT 2: Results
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="O que você quer?"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} style={styles.toggleButton}>
          <Text style={styles.toggleIcon}>{viewMode === 'list' ? '🗺' : '📋'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterChipText}>⚙ Filtros</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenNow(!openNow)}>
          <Text style={[styles.filterChipText, openNow && styles.filterChipActive]}>
            ⏰ {openNow ? 'Aberto' : 'Aberto agora'}
          </Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ORDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.orderChip, orderBy === opt.value && styles.orderChipActive]}
              onPress={() => setOrderBy(opt.value)}
            >
              <Text
                style={[styles.orderChipText, orderBy === opt.value && styles.orderChipTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {showFilters && (
        <View style={styles.filtersDrawer}>
          <Text style={styles.filterLabel}>Raio: {radius}km</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 5, 10, 20].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.sliderButton, radius === r && styles.sliderButtonActive]}
                onPress={() => setRadius(r)}
              >
                <Text
                  style={[styles.sliderButtonText, radius === r && styles.sliderButtonTextActive]}
                >
                  {r}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Avaliação mínima: {minRating}</Text>
          <View style={styles.sliderContainer}>
            {[0, 3, 3.5, 4, 4.5].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.sliderButton, minRating === r && styles.sliderButtonActive]}
                onPress={() => setMinRating(r)}
              >
                <Text
                  style={[
                    styles.sliderButtonText,
                    minRating === r && styles.sliderButtonTextActive,
                  ]}
                >
                  {r === 0 ? 'Todas' : `${r}⭐`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeFilterButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.closeFilterText}>Fechar filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      {viewMode === 'list' && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {filteredResults.length} resultados
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : filteredResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
              <Text style={styles.emptySubtext}>Tente expandir os filtros</Text>
            </View>
          ) : (
            <FlatList
              data={filteredResults}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultCard} activeOpacity={0.8}>
                  <View style={styles.resultImage}>
                    <Text style={styles.resultEmoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      {item.isOpen && <View style={styles.openBadge} />}
                    </View>
                    <Text style={styles.resultCategory}>{item.category}</Text>
                    <View style={styles.resultMeta}>
                      <Text style={styles.resultDistance}>📍 {item.distance}km</Text>
                      <Text style={styles.resultRating}>⭐ {item.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
            />
          )}
        </View>
      )}

      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>🗺️ Google Maps (futuro)</Text>
          <Text style={styles.mapSubtext}>{filteredResults.length} locais encontrados</Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  cancelText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: fontSize.lg,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  toggleIcon: {
    fontSize: fontSize.lg,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  micIcon: {
    fontSize: fontSize.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  recentSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  categoriesSection: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  filtersRow: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  filterChipActive: {
    color: colors.primary,
  },
  orderChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  orderChipText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  orderChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  orderChipTextActive: {
    color: colors.text,
  },
  filtersDrawer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    maxHeight: 200,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sliderButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sliderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sliderButtonText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sliderButtonTextActive: {
    color: colors.text,
  },
  closeFilterButton: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  closeFilterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  resultsContainer: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    gap: spacing.md,
  },
  resultImage: {
    width: 72,
    height: 72,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 32,
  },
  resultInfo: {
    flex: 1,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  openBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  resultCategory: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultDistance: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  resultRating: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  mapPlaceholder: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  mapSubtext: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
