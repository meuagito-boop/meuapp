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
import { Feather } from '@expo/vector-icons';
import { ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { borderRadius, spacing, typography } from '@constants/design';
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
  cafe: 'Café',
  lounge: 'Lounge',
  pub: 'Pub',
  other: 'Local',
};

function formatDistance(km: number | null) {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(km < 10 ? 1 : 0)}km`;
}

function formatEventBadge(date?: string) {
  if (!date) return 'EM BREVE';
  const target = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay =
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate();
  if (sameDay) return 'HOJE';
  const sameTomorrow =
    target.getFullYear() === tomorrow.getFullYear() &&
    target.getMonth() === tomorrow.getMonth() &&
    target.getDate() === tomorrow.getDate();
  if (sameTomorrow) return 'AMANHÃ';
  return target.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function mapEvent(item: SearchEvent): EventCardData {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
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
      item.subcategory?.trim().length
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
  const insets = useSafeAreaInsets();
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
      let loc = userLocation;
      if (!loc) {
        const res = await getUserLocation();
        if (res.success && res.location) {
          loc = res.location;
          setLocationNotice(null);
        } else {
          setLocationNotice('Ative a localização para ver conteúdo próximo.');
        }
      } else {
        setLocationNotice(null);
      }

      const tomorrowEnd = new Date();
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      const geoFilter = loc ? { latitude: loc.latitude, longitude: loc.longitude } : {};

      const [eventsRes, urgentRes] = await Promise.all([
        searchService.searchEvents({ ...geoFilter, distance: 25, page: 1, limit: 8 }),
        searchService.searchEvents({
          ...geoFilter,
          distance: 15,
          dateFrom: new Date().toISOString(),
          dateTo: tomorrowEnd.toISOString(),
          page: 1,
          limit: 8,
        }),
      ]);

      setFeaturedEvents(eventsRes.data.map(mapEvent));
      setUrgentEvents(urgentRes.data.map(mapEvent));

      if (!loc) {
        setOpenNowPlaces([]);
        setNearbyPlaces([]);
        setTopRatedPlaces([]);
        return;
      }

      const [nearbyRes, openRes] = await Promise.all([
        searchService.searchEstablishments({ latitude: loc.latitude, longitude: loc.longitude, distance: 10, page: 1, limit: 12 }),
        searchService.searchEstablishments({ latitude: loc.latitude, longitude: loc.longitude, distance: 5, openNow: true, page: 1, limit: 12 }),
      ]);

      const nearby = nearbyRes.data.map(mapPlace);
      const open = openRes.data.map(mapPlace);
      setNearbyPlaces(nearby);
      setOpenNowPlaces(open);
      setTopRatedPlaces(
        [...nearby]
          .sort((a, b) => b.rating !== a.rating ? b.rating - a.rating : (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
          .slice(0, 5)
      );
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Falha ao carregar');
    } finally {
      setIsLoading(false);
    }
  }, [getUserLocation, userLocation]);

  useFocusEffect(
    useCallback(() => { void loadHome(); }, [loadHome])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHome();
    setRefreshing(false);
  }, [loadHome]);

  const goToEvent = useCallback((item: EventCardData) => {
    navigation.navigate('Item', {
      template: 'evento',
      establishmentName: item.organizerName,
      item: { id: item.id, name: item.name, description: item.description, category: item.categoryLabel, badge: item.badge, imageUrl: item.imageUrl },
    });
  }, [navigation]);

  const goToPlace = useCallback((item: PlaceCardData) => {
    navigation.navigate('Profile', { type: 'establishment', establishmentId: item.id });
  }, [navigation]);

  const hasContent =
    featuredEvents.length > 0 || urgentEvents.length > 0 ||
    openNowPlaces.length > 0 || nearbyPlaces.length > 0 || topRatedPlaces.length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          accessibilityRole="button"
          accessibilityLabel="Buscar lugares e eventos"
        >
          <Feather name="search" size={16} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Buscar lugares, eventos…</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Chat')}
            accessibilityRole="button"
            accessibilityLabel="Mensagens"
          >
            <Feather name="message-circle" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notificações"
          >
            <Feather name="bell" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !hasContent ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loadError ? (
            <View style={styles.noticeCard}>
              <Feather name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.noticeText}>{loadError}</Text>
            </View>
          ) : null}

          {locationNotice ? (
            <View style={styles.noticeCard}>
              <Feather name="map-pin" size={18} color={colors.brand} />
              <Text style={styles.noticeText}>{locationNotice}</Text>
            </View>
          ) : null}

          {featuredEvents.length > 0 && (
            <Section title="Eventos por perto" onSeeAll={() => navigation.navigate('Search')}>
              <HScrollList>
                {featuredEvents.map((item) => (
                  <EventCard key={item.id} item={item} onPress={() => goToEvent(item)} />
                ))}
              </HScrollList>
            </Section>
          )}

          {urgentEvents.length > 0 && (
            <Section title="Não deixe passar" onSeeAll={() => navigation.navigate('Search')}>
              <HScrollList>
                {urgentEvents.map((item) => (
                  <EventCard key={item.id} item={item} onPress={() => goToEvent(item)} />
                ))}
              </HScrollList>
            </Section>
          )}

          {openNowPlaces.length > 0 && (
            <Section title="Aberto agora" onSeeAll={() => navigation.navigate('Search')}>
              <HScrollList>
                {openNowPlaces.map((item) => (
                  <PlaceCard key={item.id} item={item} onPress={() => goToPlace(item)} />
                ))}
              </HScrollList>
            </Section>
          )}

          {topRatedPlaces.length > 0 && (
            <Section title="Mais bem avaliados" onSeeAll={() => navigation.navigate('Search')}>
              <View style={styles.rankList}>
                {topRatedPlaces.map((item, i) => (
                  <TouchableOpacity key={item.id} style={styles.rankRow} onPress={() => goToPlace(item)}>
                    <Text style={styles.rankIndex}>#{i + 1}</Text>
                    <View style={styles.rankBody}>
                      <Text style={styles.rankName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.rankSub}>{item.categoryLabel}</Text>
                    </View>
                    <View style={styles.rankMeta}>
                      <Text style={styles.rankMetaText}>★ {item.rating.toFixed(1)}</Text>
                      {item.distanceKm != null && (
                        <Text style={styles.rankMetaSub}>{formatDistance(item.distanceKm)}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>
          )}

          {nearbyPlaces.length > 0 && (
            <Section title="Perto de você" onSeeAll={() => navigation.navigate('Search')}>
              <HScrollList>
                {nearbyPlaces.map((item) => (
                  <PlaceCard key={item.id} item={item} onPress={() => goToPlace(item)} />
                ))}
              </HScrollList>
            </Section>
          )}

          {!hasContent && !loadError ? (
            <View style={styles.emptyWrap}>
              <Feather name="compass" size={40} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
              <Text style={styles.emptySub}>Seja um dos primeiros a descobrir Guarulhos no Meu Agito.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function Section({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.row}>
        <Text style={sectionStyles.title}>{title}</Text>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={sectionStyles.link}>Ver todos</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { gap: spacing[3] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4] },
  title: { ...typography.lg, color: colors.textPrimary },
  link: { ...typography.sm, color: colors.brand, fontWeight: '600' as const },
});

function HScrollList({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing[4], gap: spacing[3] }}>
      {children}
    </ScrollView>
  );
}

function EventCard({ item, onPress }: { item: EventCardData; onPress: () => void }) {
  return (
    <TouchableOpacity style={cardStyles.event} onPress={onPress}>
      <View style={cardStyles.eventMedia}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={cardStyles.mediaImg} resizeMode="cover" />
        ) : (
          <Feather name="calendar" size={32} color={colors.textTertiary} />
        )}
        <View style={cardStyles.badge}>
          <Text style={cardStyles.badgeText}>{item.badge}</Text>
        </View>
      </View>
      <View style={cardStyles.body}>
        <Text style={cardStyles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={cardStyles.sub}>{item.categoryLabel}</Text>
        {item.distanceKm != null && <Text style={cardStyles.meta}>{formatDistance(item.distanceKm)}</Text>}
      </View>
    </TouchableOpacity>
  );
}

function PlaceCard({ item, onPress }: { item: PlaceCardData; onPress: () => void }) {
  return (
    <TouchableOpacity style={cardStyles.place} onPress={onPress}>
      <View style={cardStyles.placeMedia}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={cardStyles.mediaImg} resizeMode="cover" />
        ) : (
          <Feather name="map-pin" size={28} color={colors.textTertiary} />
        )}
        {item.isOpenNow && (
          <View style={cardStyles.openBadge}>
            <Text style={cardStyles.openText}>ABERTO</Text>
          </View>
        )}
      </View>
      <View style={cardStyles.body}>
        <Text style={cardStyles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={cardStyles.sub}>{item.categoryLabel}</Text>
        <Text style={cardStyles.meta}>
          {item.distanceKm != null ? formatDistance(item.distanceKm) + ' · ' : ''}
          ★ {item.rating.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  event: {
    width: 240,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgSurface3,
  },
  place: {
    width: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgSurface3,
  },
  eventMedia: {
    height: 140,
    backgroundColor: colors.bgSurface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeMedia: {
    height: 100,
    backgroundColor: colors.bgSurface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImg: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.brand,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  badgeText: { ...typography.xs, color: '#FFFFFF', fontWeight: '600' as const },
  openBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  openText: { ...typography.xs, color: '#FFFFFF', fontWeight: '600' as const },
  body: { padding: spacing[3], gap: 3 },
  name: { ...typography.baseSemibold, color: colors.textPrimary },
  sub: { ...typography.xs, color: colors.textSecondary },
  meta: { ...typography.xs, color: colors.textTertiary },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
  },
  logo: {
    width: 36,
    height: 36,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.bgSurface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.bgSurface3,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  searchPlaceholder: {
    ...typography.sm,
    color: colors.textTertiary,
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingVertical: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgSurface3,
  },
  noticeText: {
    ...typography.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  rankList: {
    marginHorizontal: spacing[4],
    gap: spacing[2],
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgSurface3,
  },
  rankIndex: {
    ...typography.lg,
    color: colors.brand,
    width: 32,
  },
  rankBody: {
    flex: 1,
    gap: 2,
  },
  rankName: {
    ...typography.baseSemibold,
    color: colors.textPrimary,
  },
  rankSub: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  rankMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rankMetaText: {
    ...typography.sm,
    color: colors.brand,
    fontWeight: '600' as const,
  },
  rankMetaSub: {
    ...typography.xs,
    color: colors.textTertiary,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
  },
  emptyTitle: {
    ...typography.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    ...typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
