import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@constants/colors';
import { fontSize, spacing } from '@constants/design';
import { catalogService } from '@services/api';
import type { CatalogProduct } from '@services/api/CatalogService';

type CatalogTemplate =
  | 'prato'
  | 'produto'
  | 'quarto'
  | 'plano'
  | 'procedimento'
  | 'servico'
  | 'evento';

type CatalogItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  badge?: string;
  fallbackLabel: string;
  imageUrl?: string;
};

type CatalogRouteParams = {
  template?: CatalogTemplate;
  establishmentId?: string;
  establishmentName?: string;
};

const TEMPLATE_LABEL: Record<CatalogTemplate, string> = {
  prato: 'Cardapio',
  produto: 'Vitrine publica',
  quarto: 'Quartos disponiveis',
  plano: 'Planos',
  procedimento: 'Procedimentos',
  servico: 'Servicos',
  evento: 'Eventos',
};

const formatPrice = (value?: number | null) => {
  if (value == null) {
    return 'Consulte';
  }

  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const mapProductToCatalogItem = (product: CatalogProduct): CatalogItem => ({
  id: product.id,
  name: product.name,
  description: product.description || 'Sem descricao publicada.',
  category: product.category || 'Produto',
  price: formatPrice(product.price),
  badge: product.status === 'OUT_OF_STOCK' ? 'Sem estoque' : undefined,
  fallbackLabel: 'PRD',
  imageUrl: product.imageUrl || product.mainImageUrl || undefined,
});

export default function CatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase, string>>();
  const routeParams = route.params as CatalogRouteParams | undefined;

  const establishmentId = routeParams?.establishmentId;
  const establishmentName = routeParams?.establishmentName ?? 'Estabelecimento';
  const remoteMode = Boolean(establishmentId);
  const hasRealCatalogSource = remoteMode && Boolean(establishmentId);
  const template: CatalogTemplate = remoteMode ? 'produto' : routeParams?.template ?? 'servico';

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRealCatalogSource || !establishmentId) {
      setItems([]);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    catalogService
      .getEstablishmentProducts(establishmentId)
      .then((products) => {
        if (!isMounted) {
          return;
        }

        setItems(products.map(mapProductToCatalogItem));
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Falha ao carregar a vitrine.';
        setLoadError(message);
        setItems([]);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [establishmentId, hasRealCatalogSource]);

  const categories = useMemo(() => {
    if (!hasRealCatalogSource) {
      return ['Todos'];
    }

    const dynamicCategories = Array.from(
      new Set(items.map((item) => item.category).filter((category) => category.trim().length > 0))
    );

    return ['Todos', ...dynamicCategories];
  }, [hasRealCatalogSource, items]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory('Todos');
    }
  }, [activeCategory, categories]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const categoryMatches = activeCategory === 'Todos' || item.category === activeCategory;
      const queryMatches =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);

      return categoryMatches && queryMatches;
    });
  }, [activeCategory, items, query]);

  const hasActiveFilter = query.trim().length > 0 || activeCategory !== 'Todos';
  const emptyTitle = !hasRealCatalogSource
    ? 'Catalogo indisponivel'
    : hasActiveFilter
    ? 'Nenhum item encontrado'
    : 'Nenhum item publicado';
  const emptySubtitle = !hasRealCatalogSource
    ? 'Acesse a vitrine por um perfil de estabelecimento publicado.'
    : hasActiveFilter
    ? 'Ajuste o termo da busca ou limpe os filtros atuais.'
    : 'A vitrine publica deste estabelecimento ainda nao possui produtos ativos.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.circleIcon}>{'<'}</Text>
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {establishmentName}
          </Text>
          <Text style={styles.headerSubtitle}>{TEMPLATE_LABEL[template]}</Text>
        </View>

        <View style={styles.headerGhost} />
      </View>

      {hasRealCatalogSource ? (
        <>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>Busca</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Buscar em ${TEMPLATE_LABEL[template].toLowerCase()}`}
              placeholderTextColor={colors.textTertiary}
              style={styles.searchInput}
              accessibilityLabel="Buscar na vitrine"
            />
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca da vitrine"
              >
                <Text style={styles.clearSearch}>X</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((category) => {
              const active = category === activeCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveCategory(category)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar vitrine por ${category}`}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptySubtitle}>Carregando vitrine publica...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Falha ao carregar</Text>
          <Text style={styles.emptySubtitle}>{loadError}</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemCard}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Abrir item ${item.name}`}
              onPress={() =>
                navigation.navigate('Item', {
                  template,
                  productId: item.id,
                  establishmentId,
                  establishmentName,
                  item,
                })
              }
            >
              <View style={styles.itemMediaContainer}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={styles.itemImage} />
                ) : (
                  <Text style={styles.itemFallback}>{item.fallbackLabel}</Text>
                )}
              </View>

              <View style={styles.itemBody}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  {item.badge ? <Text style={styles.itemBadge}>{item.badge}</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  circleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleIcon: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
  },
  headerGhost: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    paddingVertical: spacing.md,
  },
  clearSearch: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  chipsRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: '#1A0F05',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.md,
  },
  itemMediaContainer: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemFallback: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  itemBody: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  itemName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  itemDescription: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  itemFooter: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  itemBadge: {
    color: colors.text,
    backgroundColor: '#2E1405',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
