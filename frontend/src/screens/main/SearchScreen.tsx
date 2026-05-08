import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HeaderBackButton } from '@components';
import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { useLocation } from '@hooks/useLocation';
import { searchService } from '@services/api';
import { activityHistoryService } from '@services/activity/ActivityHistoryService';
import type { SearchEstablishment } from '@services/api/SearchService';

type OrderBy = 'distance' | 'rating' | 'popularity';

type SearchResultItem = {
  id: string;
  name: string;
  categoryLabel: string;
  distanceKm: number | null;
  rating: number;
  reviews: number;
  isOpenNow: boolean;
  imageUrl?: string | null;
};

type SearchRouteParams = {
  initialQuery?: string;
};

const ESTABLISHMENT_CATEGORIES = [
  { id: 'bar', label: 'Bares', value: 'bar' },
  { id: 'restaurant', label: 'Restaurantes', value: 'restaurant' },
  { id: 'cafe', label: 'Cafes', value: 'cafe' },
  { id: 'nightclub', label: 'Baladas', value: 'nightclub' },
  { id: 'lounge', label: 'Lounge', value: 'lounge' },
  { id: 'pub', label: 'Pub', value: 'pub' },
  { id: 'other', label: 'Outros', value: 'other' },
] as const;

const ORDER_OPTIONS: Array<{ id: string; label: string; value: OrderBy }> = [
  { id: 'distance', label: 'Mais proximo', value: 'distance' },
  { id: 'rating', label: 'Melhor avaliado', value: 'rating' },
  { id: 'popularity', label: 'Mais avaliado', value: 'popularity' },
];

function formatDistance(distanceKm: number | null) {
  if (distanceKm == null) {
    return 'Sem distancia';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

function getCategoryLabel(item: SearchEstablishment) {
  if (item.subcategory && item.subcategory.trim().length > 0) {
    return item.subcategory;
  }

  return item.category;
}

function mapEstablishmentToResult(item: SearchEstablishment): SearchResultItem {
  return {
    id: item.id,
    name: item.name,
    categoryLabel: getCategoryLabel(item),
    distanceKm: item.distanceKm ?? null,
    rating: Number(item.rating || 0),
    reviews: item.reviewsCount ?? item._count?.reviews ?? 0,
    isOpenNow: item.isOpenNow === true,
    imageUrl: item.imageUrl,
  };
}

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const routeParams = route.params as SearchRouteParams | undefined;
  const { userLocation, getUserLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<OrderBy>('distance');
  const [radius, setRadius] = useState(5);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const initialQuery = routeParams?.initialQuery?.trim();
    if (!initialQuery) {
      return;
    }

    setSearchQuery(initialQuery);
    setIsSearching(true);
  }, [routeParams?.initialQuery]);

  const resolveLocation = useCallback(async () => {
    if (userLocation) {
      return userLocation;
    }

    const response = await getUserLocation();
    if (!response.success || !response.location) {
      throw new Error('Nao foi possivel obter sua localizacao para a busca.');
    }

    return response.location;
  }, [getUserLocation, userLocation]);

  const fetchResults = useCallback(async () => {
    if (!isSearching) {
      return;
    }

    setIsLoadingResults(true);
    setSearchError(null);

    try {
      const location = await resolveLocation();
      const trimmedQuery = searchQuery.trim();
      const response = await searchService.searchEstablishments({
        q: trimmedQuery.length >= 2 ? trimmedQuery : undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        distance: radius,
        category: selectedCategory ?? undefined,
        openNow: openNow || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        page: 1,
        limit: 50,
      });

      if (trimmedQuery.length >= 2) {
        void activityHistoryService.recordSearch(trimmedQuery);
      }

      setResults(response.data.map(mapEstablishmentToResult));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar busca';
      setSearchError(message);
      setResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  }, [isSearching, minRating, openNow, radius, resolveLocation, searchQuery, selectedCategory]);

  useEffect(() => {
    if (!isSearching) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(() => {
      void fetchResults();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchResults, isSearching]);

  const filteredResults = useMemo(() => {
    const next = [...results];

    switch (orderBy) {
      case 'rating':
        next.sort((left, right) => {
          if (right.rating !== left.rating) {
            return right.rating - left.rating;
          }

          return right.reviews - left.reviews;
        });
        break;
      case 'popularity':
        next.sort((left, right) => {
          if (right.reviews !== left.reviews) {
            return right.reviews - left.reviews;
          }

          return (right.rating ?? 0) - (left.rating ?? 0);
        });
        break;
      default:
        next.sort((left, right) => {
          const leftDistance = left.distanceKm ?? Number.MAX_SAFE_INTEGER;
          const rightDistance = right.distanceKm ?? Number.MAX_SAFE_INTEGER;
          return leftDistance - rightDistance;
        });
        break;
    }

    return next;
  }, [orderBy, results]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setIsSearching(value.trim().length >= 2 || selectedCategory !== null);
    },
    [selectedCategory]
  );

  const handleCategoryPress = useCallback((category: string) => {
    setSelectedCategory(category);
    setIsSearching(true);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setOpenNow(false);
    setRadius(5);
    setMinRating(0);
    setShowFilters(false);
    setIsSearching(false);
    setSearchError(null);
    setResults([]);
  }, []);

  const renderResultCard = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.resultCard}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de ${item.name}`}
      onPress={() =>
        navigation.navigate('Profile', {
          type: 'establishment',
          establishmentId: item.id,
        })
      }
    >
      <View style={styles.resultMedia}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={styles.resultImage} />
        ) : (
          <Text style={styles.resultFallback}>{item.name.slice(0, 2).toUpperCase()}</Text>
        )}
      </View>

      <View style={styles.resultBody}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isOpenNow ? <Text style={styles.openBadge}>ABERTO</Text> : null}
        </View>

        <Text style={styles.resultCategory}>{item.categoryLabel}</Text>

        <View style={styles.resultMetaRow}>
          <Text style={styles.resultMeta}>{formatDistance(item.distanceKm)}</Text>
          <Text style={styles.resultMeta}>nota {item.rating.toFixed(1)}</Text>
          <Text style={styles.resultMeta}>{item.reviews} aval.</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderBackButton onPress={() => navigation.goBack()} />

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar estabelecimentos e lugares"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus
          returnKeyType="search"
        />

        {searchQuery.length > 0 || selectedCategory ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Text style={styles.iconButtonText}>X</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!isSearching ? (
        <ScrollView contentContainerStyle={styles.discoveryContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.chipsWrap}>
              {ESTABLISHMENT_CATEGORIES.map((category) => {
                const active = selectedCategory === category.value;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => handleCategoryPress(category.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Buscar categoria ${category.label}`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersRow}
            contentContainerStyle={styles.filtersContent}
          >
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setShowFilters((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            >
              <Text style={styles.filterChipText}>Filtros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setOpenNow((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel="Alternar somente estabelecimentos abertos"
            >
              <Text style={[styles.filterChipText, openNow && styles.filterChipTextActive]}>
                {openNow ? 'Aberto agora' : 'Somente abertos'}
              </Text>
            </TouchableOpacity>

            {ORDER_OPTIONS.map((option) => {
              const active = orderBy === option.value;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setOrderBy(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ordenar por ${option.label}`}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {showFilters ? (
            <View style={styles.filtersDrawer}>
              <Text style={styles.drawerLabel}>Raio</Text>
              <View style={styles.inlineOptions}>
                {[2, 5, 10, 20].map((value) => {
                  const active = radius === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                      onPress={() => setRadius(value)}
                      accessibilityRole="button"
                      accessibilityLabel={`Buscar em raio de ${value} quilometros`}
                    >
                      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                        {value}km
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.drawerLabel}>Nota minima</Text>
              <View style={styles.inlineOptions}>
                {[0, 3, 4, 4.5].map((value) => {
                  const active = minRating === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                      onPress={() => setMinRating(value)}
                      accessibilityRole="button"
                      accessibilityLabel={value === 0 ? 'Aceitar qualquer nota' : `Nota minima ${value}`}
                    >
                      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
                        {value === 0 ? 'Todas' : `${value}+`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.resultsWrapper}>
            <Text style={styles.resultsCount}>{filteredResults.length} resultados</Text>

            {isLoadingResults ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredResults.length === 0 ? (
              <View style={styles.centerState}>
                <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  {searchError || 'Ajuste o termo ou os filtros para continuar a busca.'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredResults}
                renderItem={renderResultCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.resultsList}
              />
            )}
          </View>
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
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  discoveryContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: '#2E1405',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text,
  },
  filtersRow: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#2E1405',
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  filtersDrawer: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  drawerLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  inlineOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#2E1405',
  },
  optionChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: colors.primary,
  },
  resultsWrapper: {
    flex: 1,
    paddingTop: spacing.md,
  },
  resultsCount: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  resultsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultMedia: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultFallback: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  resultBody: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  openBadge: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
    backgroundColor: colors.success,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  resultCategory: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  resultMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  resultMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});
