import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@constants/colors';
import { spacing, fontSize } from '@constants/design';
import { useLocation } from '@hooks/useLocation';
import { searchService } from '@services/api';
import type { SearchEstablishment, SearchEvent } from '@services/api/SearchService';

type EventCardData = {
  id: string;
  name: string;
  description: string;
  categoryLabel: string;
  badge: string;
  imageUrl?: string | null;
  distanceKm: number | null;
  organizerName: string;
};

type PlaceCardData = {
  id: string;
  name: string;
  categoryLabel: string;
  rating: number;
  distanceKm: number | null;
  isOpenNow: boolean;
  imageUrl?: string | null;
};

const EVENT_CATEGORY_LABELS: Record<string, string> = {
  nightlife: 'Noite',
  cultural: 'Cultural',
  sports: 'Esporte',
  gastronomic: 'Gastronomia',
  party: 'Festa',
  other: 'Evento',
};

const ESTABLISHMENT_CATEGORY_LABELS: Record<string, string> = {
  bar: 'Bar',
  restaurant: 'Restaurante',
  nightclub: 'Balada',
  cafe: 'Cafe',
  lounge: 'Lounge',
  pub: 'Pub',
  other: 'Local',
};

function formatDistance(distanceKm: number | null) {
  if (distanceKm == null) {
    return 'Sem distancia';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

function formatEventBadge(date?: string) {
  if (!date) {
    return 'SEM DATA';
  }

  const target = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay =
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate();

  if (sameDay) {
    return 'HOJE';
  }

  const sameTomorrow =
    target.getFullYear() === tomorrow.getFullYear() &&
    target.getMonth() === tomorrow.getMonth() &&
    target.getDate() === tomorrow.getDate();

  if (sameTomorrow) {
    return 'AMANHA';
  }

  return target.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function mapEvent(item: SearchEvent): EventCardData {
  return {
    id: item.id,
    name: item.name,
    description: item.description || 'Evento sem descricao publicada.',
    categoryLabel: EVENT_CATEGORY_LABELS[item.category || 'other'] || 'Evento',
    badge: formatEventBadge(item.date),
    imageUrl: item.imageUrl,
    distanceKm: item.distanceKm ?? null,
    organizerName: item.organizer?.name || 'Evento local',
  };
}

function mapPlace(item: SearchEstablishment): PlaceCardData {
  return {
    id: item.id,
    name: item.name,
    categoryLabel:
      item.subcategory && item.subcategory.trim().length > 0
        ? item.subcategory
        : ESTABLISHMENT_CATEGORY_LABELS[item.category] || item.category,
    rating: Number(item.rating || 0),
    distanceKm: item.distanceKm ?? null,
    isOpenNow: item.isOpenNow === true,
    imageUrl: item.imageUrl,
  };
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { userLocation, getUserLocation } = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<EventCardData[]>([]);
  const [urgentEvents, setUrgentEvents] = useState<EventCardData[]>([]);
  const [openNowPlaces, setOpenNowPlaces] = useState<PlaceCardData[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceCardData[]>([]);
  const [topRatedPlaces, setTopRatedPlaces] = useState<PlaceCardData[]>([]);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      let resolvedLocation = userLocation;
      if (!resolvedLocation) {
        const response = await getUserLocation();
        if (response.success && response.location) {
          resolvedLocation = response.location;
          setLocationNotice(null);
        } else {
          setLocationNotice('Ative a localizacao para liberar as secoes de proximidade.');
        }
      } else {
        setLocationNotice(null);
      }

      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const eventFilters =
        resolvedLocation != null
          ? {
              latitude: resolvedLocation.latitude,
              longitude: resolvedLocation.longitude,
            }
          : {};

      const [eventsResponse, urgentEventsResponse] = await Promise.all([
        searchService.searchEvents({
          ...eventFilters,
          distance: 25,
          page: 1,
          limit: 8,
        }),
        searchService.searchEvents({
          ...eventFilters,
          distance: 15,
          dateFrom: new Date().toISOString(),
          dateTo: tomorrowEnd.toISOString(),
          page: 1,
          limit: 8,
        }),
      ]);

      setFeaturedEvents(eventsResponse.data.map(mapEvent));
      setUrgentEvents(urgentEventsResponse.data.map(mapEvent));

      if (!resolvedLocation) {
        setOpenNowPlaces([]);
        setNearbyPlaces([]);
        setTopRatedPlaces([]);
        return;
      }

      const [nearbyResponse, openNowResponse] = await Promise.all([
        searchService.searchEstablishments({
          latitude: resolvedLocation.latitude,
          longitude: resolvedLocation.longitude,
          distance: 10,
          page: 1,
          limit: 12,
        }),
        searchService.searchEstablishments({
          latitude: resolvedLocation.latitude,
          longitude: resolvedLocation.longitude,
          distance: 5,
          openNow: true,
          page: 1,
          limit: 12,
        }),
      ]);

      const mappedNearbyPlaces = nearbyResponse.data.map(mapPlace);
      const mappedOpenNowPlaces = openNowResponse.data.map(mapPlace);

      setNearbyPlaces(mappedNearbyPlaces);
      setOpenNowPlaces(mappedOpenNowPlaces);
      setTopRatedPlaces(
        [...mappedNearbyPlaces]
          .sort((left, right) => {
            if (right.rating !== left.rating) {
              return right.rating - left.rating;
            }

            const leftDistance = left.distanceKm ?? Number.MAX_SAFE_INTEGER;
            const rightDistance = right.distanceKm ?? Number.MAX_SAFE_INTEGER;
            return leftDistance - rightDistance;
          })
          .slice(0, 5)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar a discovery';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getUserLocation, userLocation]);

  useFocusEffect(
    useCallback(() => {
      void loadHome();
    }, [loadHome])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHome();
    setRefreshing(false);
  }, [loadHome]);

  const navigateToEvent = useCallback(
    (item: EventCardData) => {
      navigation.navigate('Item', {
        template: 'evento',
        establishmentName: item.organizerName,
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.categoryLabel,
          price: 'Consulte',
          badge: item.badge,
          emoji: 'EVT',
          imageUrl: item.imageUrl ?? undefined,
        },
      });
    },
    [navigation]
  );

  const navigateToPlace = useCallback(
    (item: PlaceCardData) => {
      navigation.navigate('Profile', {
        type: 'establishment',
        establishmentId: item.id,
      });
    },
    [navigation]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>M</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.headerActionText}>CHAT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navigation.getParent()?.navigate('Notifications')}
        >
          <Text style={styles.headerActionText}>BELL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.headerActionText}>MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
      <Text style={styles.searchText}>Buscar lugares, eventos e descoberta local</Text>
      <Text style={styles.searchAction}>IR</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Search')}>
        <Text style={styles.sectionLink}>Ver busca</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEventCards = (items: EventCardData[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} style={styles.eventCard} onPress={() => navigateToEvent(item)}>
          <View style={styles.eventMedia}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={styles.mediaImage} />
            ) : (
              <Text style={styles.mediaFallback}>EVT</Text>
            )}
            <Text style={styles.eventBadge}>{item.badge}</Text>
          </View>

          <View style={styles.eventBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle}>{item.categoryLabel}</Text>
            <Text style={styles.cardMeta}>{formatDistance(item.distanceKm)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPlaceCards = (items: PlaceCardData[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} style={styles.placeCard} onPress={() => navigateToPlace(item)}>
          <View style={styles.placeMedia}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={styles.mediaImage} />
            ) : (
              <Text style={styles.mediaFallback}>{item.name.slice(0, 2).toUpperCase()}</Text>
            )}
            {item.isOpenNow ? <Text style={styles.openBadge}>ABERTO</Text> : null}
          </View>

          <View style={styles.placeBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle}>{item.categoryLabel}</Text>
            <Text style={styles.cardMeta}>
              {formatDistance(item.distanceKm)} · ★ {item.rating.toFixed(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTopRatedList = (items: PlaceCardData[]) => (
    <View style={styles.rankList}>
      {items.map((item, index) => (
        <TouchableOpacity key={item.id} style={styles.rankCard} onPress={() => navigateToPlace(item)}>
          <Text style={styles.rankIndex}>#{index + 1}</Text>
          <View style={styles.rankBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle}>{item.categoryLabel}</Text>
          </View>
          <View style={styles.rankMeta}>
            <Text style={styles.rankMetaText}>★ {item.rating.toFixed(1)}</Text>
            <Text style={styles.rankMetaText}>{formatDistance(item.distanceKm)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const hasContent =
    featuredEvents.length > 0 ||
    urgentEvents.length > 0 ||
    openNowPlaces.length > 0 ||
    nearbyPlaces.length > 0 ||
    topRatedPlaces.length > 0;

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}

      {isLoading && !hasContent ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loadError ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Falha ao carregar a discovery</Text>
              <Text style={styles.noticeText}>{loadError}</Text>
            </View>
          ) : null}

          {locationNotice ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Localizacao opcional, mas importante</Text>
              <Text style={styles.noticeText}>{locationNotice}</Text>
            </View>
          ) : null}

          {featuredEvents.length > 0 ? (
            <View style={styles.section}>
              {renderSectionHeader('Eventos por perto')}
              {renderEventCards(featuredEvents)}
            </View>
          ) : null}

          {urgentEvents.length > 0 ? (
            <View style={styles.section}>
              {renderSectionHeader('Nao deixe passar')}
              {renderEventCards(urgentEvents)}
            </View>
          ) : null}

          {openNowPlaces.length > 0 ? (
            <View style={styles.section}>
              {renderSectionHeader('Aberto agora')}
              {renderPlaceCards(openNowPlaces)}
            </View>
          ) : null}

          {topRatedPlaces.length > 0 ? (
            <View style={styles.section}>
              {renderSectionHeader('Mais bem avaliados por perto')}
              {renderTopRatedList(topRatedPlaces)}
            </View>
          ) : null}

          {nearbyPlaces.length > 0 ? (
            <View style={styles.section}>
              {renderSectionHeader('Perto de voce')}
              {renderPlaceCards(nearbyPlaces)}
            </View>
          ) : null}

          {!hasContent && !loadError ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Sem descoberta disponivel agora</Text>
              <Text style={styles.noticeText}>
                Ainda nao ha dados suficientes para preencher a home com discovery real.
              </Text>
            </View>
          ) : null}
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  logoText: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerActionText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  searchAction: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  noticeCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  noticeTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  sectionLink: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  eventCard: {
    width: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventMedia: {
    height: 150,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeMedia: {
    height: 110,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaFallback: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  eventBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    backgroundColor: colors.primary,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  openBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    backgroundColor: colors.success,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  eventBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  placeCard: {
    width: 170,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  rankList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankIndex: {
    width: 28,
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  rankBody: {
    flex: 1,
    gap: spacing.xs,
  },
  rankMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  rankMetaText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});
