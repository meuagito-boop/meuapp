import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useFeed } from '@hooks/useFeed';
import { colors } from '@constants/colors';
import { spacing, fontSize, componentSizes } from '@constants/design';

/**
 * HomeScreen - T06 Design Aprovado
 * 7 Zonas principais com lazy loading
 */

const SECTIONS = [
  { id: 'header' },
  { id: 'search' },
  { id: 'z1', title: '🎉 Mega Eventos' },
  { id: 'z2', title: '🔥 Rolando agora' },
  { id: 'z3', title: '⏰ Não deixe passar' },
  { id: 'z4', title: '📈 Mais hypado da semana' },
  { id: 'z5', title: '👥 Seus amigos foram' },
  { id: 'z6', title: '📍 Perto de você' },
  { id: 'z7', title: '🏆 Mais buscado da cidade' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { isLoading, getFeed, refreshFeed } = useFeed();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getFeed();
    }, [getFeed]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshFeed().finally(() => setRefreshing(false));
  }, [refreshFeed]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>M</Text>
      </View>
      <TouchableOpacity style={styles.headerIcon}>
        <Text style={styles.iconText}>💬</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIcon}>
        <Text style={styles.iconText}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerIcon}>
        <Text style={styles.iconText}>⋯</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearch = () => (
    <TouchableOpacity
      style={styles.searchContainer}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Search')}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <Text style={styles.searchPlaceholder}>O que você quer encontrar?</Text>
      <Text style={styles.filterIcon}>⚙</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: any) => {
    if (item.id === 'header') return renderHeader();
    if (item.id === 'search') return renderSearch();

    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.sectionLink}>Ver todos →</Text>
        </View>
        {item.id === 'z1' && <Zone1 />}
        {item.id === 'z2' && <Zone2 />}
        {item.id === 'z3' && <Zone3 />}
        {item.id === 'z4' && <Zone4 />}
        {item.id === 'z5' && <Zone5 />}
        {item.id === 'z6' && <Zone6 />}
        {item.id === 'z7' && <Zone7 />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color={colors.primary} />}
      <FlatList
        data={SECTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// ZONA 1 - Mega Eventos
// ─────────────────────────────────────────────────────────────────
const Zone1 = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const mockEvents = [
    { id: '1', title: 'Festival de Rock', category: 'Música' },
    { id: '2', title: 'Noite de Comédia', category: 'Humor' },
    { id: '3', title: 'Show de Samba', category: 'Música' },
    { id: '4', title: 'Cervejada', category: 'Festa' },
  ];

  return (
    <View style={styles.zone}>
      <FlatList
        data={mockEvents}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
            <View style={styles.eventImage}>
              <Text style={styles.eventEmoji}>🎪</Text>
            </View>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>HOJE</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.eventMeta}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
        snapToInterval={300 + spacing.md}
        decelerationRate="fast"
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (300 + spacing.md));
          setActiveIndex(Math.min(index, mockEvents.length - 1));
        }}
        scrollEventThrottle={16}
      />
      <View style={styles.dotsCarousel}>
        {mockEvents.map((_, i) => (
          <View key={i} style={[styles.dotCarousel, i === activeIndex && styles.dotCarouselActive]} />
        ))}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// ZONA 2 - Rolando Agora
// ─────────────────────────────────────────────────────────────────
const Zone2 = () => {
  const mockPosts = [
    { id: '1', title: 'Melhor burger da cidade', category: 'Comida', rating: '4.8' },
    { id: '2', title: 'Spa novo e incrível', category: 'Beleza', rating: '4.9' },
    { id: '3', title: 'Bar com vista', category: 'Bebidas', rating: '4.7' },
  ];

  return (
    <View style={styles.zone}>
      <FlatList
        data={mockPosts}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.feedCard} activeOpacity={0.9}>
            <View style={styles.feedImage}>
              <Text style={styles.feedEmoji}>📸</Text>
            </View>
            <View style={styles.feedBody}>
              <Text style={styles.feedTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.feedMeta}>
                <Text style={styles.feedCategory}>{item.category}</Text>
                <Text style={styles.feedRating}>★ {item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// ZONA 3 - Não Deixe Passar
// ─────────────────────────────────────────────────────────────────
const Zone3 = () => {
  const mockItems = Array.from({ length: 4 }, (_, i) => ({ id: String(i) }));

  return (
    <View style={styles.zone}>
      <FlatList
        data={mockItems}
        renderItem={() => (
          <TouchableOpacity style={styles.smallCard}>
            <View style={styles.smallCardImage}>
              <Text style={styles.smallCardEmoji}>📍</Text>
            </View>
            <View style={styles.smallCardBadge}>
              <Text style={styles.smallCardBadgeText}>HOJE</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// ZONA 4 - Mais Hypado
// ─────────────────────────────────────────────────────────────────
const Zone4 = () => {
  const mockRanking = [
    { id: '1', title: 'Pizzaria Top', category: 'Comida' },
    { id: '2', title: 'Bar do Zé', category: 'Bebidas' },
    { id: '3', title: 'Salão de Beleza', category: 'Beleza' },
  ];

  return (
    <View style={styles.zone}>
      {mockRanking.map((item, idx) => (
        <TouchableOpacity key={item.id} style={[styles.rankingCard, idx === 0 && styles.rankingCardTop]}>
          <Text style={[styles.rankingNumber, idx === 0 && { color: colors.text }]}>#{idx + 1}</Text>
          <View style={styles.rankingAvatar}>
            <Text style={styles.rankingAvatarEmoji}>🏪</Text>
          </View>
          <View style={styles.rankingInfo}>
            <Text style={[styles.rankingName, idx === 0 && { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.rankingCategory, idx === 0 && { color: colors.text }]}>{item.category}</Text>
          </View>
          <Text style={[styles.rankingRating, idx === 0 && { color: colors.text }]}>★ 4.9</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// ZONA 5 - Amigos Foram
// ─────────────────────────────────────────────────────────────────
const Zone5 = () => {
  const mockFriends = [
    { id: '1', name: 'João', place: 'Bar Downtown' },
    { id: '2', name: 'Maria', place: 'Pizza Place' },
    { id: '3', name: 'Pedro', place: 'Academia' },
    { id: '4', name: 'Ana', place: 'Café' },
  ];

  return (
    <View style={styles.zone}>
      <FlatList
        data={mockFriends}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendCard}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendAvatarEmoji}>👤</Text>
            </View>
            <Text style={styles.friendName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.friendLocation}>{item.place}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// ZONA 6 - Perto de Você
// ─────────────────────────────────────────────────────────────────
const Zone6 = () => {
  const mockNearby = [
    { id: '1', title: 'Padaria', distance: '200m' },
    { id: '2', title: 'Restaurante', distance: '350m' },
    { id: '3', title: 'Sorveteria', distance: '150m' },
    { id: '4', title: 'Café', distance: '400m' },
  ];

  return (
    <View style={styles.zone}>
      <FlatList
        data={mockNearby}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.nearbyCard}>
            <View style={styles.nearbyImage}>
              <Text style={styles.nearbyEmoji}>🏪</Text>
              <View style={styles.nearbyBadge}>
                <Text style={styles.nearbyBadgeText}>ABERTO</Text>
              </View>
            </View>
            <Text style={styles.nearbyTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.nearbyDistance}>{item.distance} · ~3min</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// ZONA 7 - Mais Buscado
// ─────────────────────────────────────────────────────────────────
const Zone7 = () => {
  const categories = ['Comida', 'Beleza', 'Eventos', 'Lazer'];

  return (
    <View style={styles.zone}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      >
        {categories.map((cat) => (
          <TouchableOpacity key={cat} style={styles.chip}>
            <Text style={styles.chipText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        <TouchableOpacity style={styles.feedCard} activeOpacity={0.9}>
          <View style={styles.feedImage}>
            <Text style={styles.feedEmoji}>📸</Text>
          </View>
          <View style={styles.feedBody}>
            <Text style={styles.feedTitle}>Top da semana</Text>
            <View style={styles.feedMeta}>
              <Text style={styles.feedCategory}>Destaque</Text>
              <Text style={styles.feedRating}>★ 4.8</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}


// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoBox: {
    width: componentSizes.avatar.large,
    height: componentSizes.avatar.large,
    borderRadius: spacing.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerIcon: {
    padding: spacing.sm,
  },
  iconText: {
    fontSize: 20,
  },

  // SEARCH
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterIcon: {
    fontSize: 18,
  },

  // SECTION HEADERS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },

  zone: {
    paddingVertical: spacing.md,
  },

  dotsCarousel: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  dotCarousel: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  dotCarouselActive: {
    backgroundColor: colors.primary,
    width: 22,
  },

  // CHIP
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // EVENT CARD (Z1)
  eventCard: {
    width: 280,
    borderRadius: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventEmoji: {
    fontSize: 48,
  },
  eventBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.xs,
  },
  eventBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  eventInfo: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  eventTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  eventMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },

  // FEED CARD (Z2)
  feedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  feedImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedEmoji: {
    fontSize: 40,
  },
  feedBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  feedTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  feedMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedCategory: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  feedRating: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },

  // SMALL CARD (Z3)
  smallCard: {
    width: 140,
    aspectRatio: 1,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCardImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCardEmoji: {
    fontSize: 40,
  },
  smallCardBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  smallCardBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },

  // RANKING CARD (Z4)
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rankingCardTop: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginVertical: spacing.sm,
    borderBottomWidth: 0,
  },
  rankingNumber: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    width: 30,
  },
  rankingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingAvatarEmoji: {
    fontSize: 24,
  },
  rankingInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  rankingName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rankingCategory: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  rankingRating: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },

  // FRIEND CARD (Z5)
  friendCard: {
    width: 100,
    alignItems: 'center',
    gap: spacing.xs,
  },
  friendAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarEmoji: {
    fontSize: 32,
  },
  friendName: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  friendLocation: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // NEARBY CARD (Z6)
  nearbyCard: {
    width: 150,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  nearbyImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  nearbyEmoji: {
    fontSize: 40,
  },
  nearbyBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nearbyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  nearbyTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  nearbyDistance: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
