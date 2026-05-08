import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';

import { colors } from '@constants/colors';
import { borderRadius, fontSize, spacing } from '@constants/design';
import { useLocation } from '@hooks/useLocation';

type MapType = 'events' | 'establishments';
type Radius = 5 | 10 | 25 | 50;

type MapListItem = {
  id: string;
  title?: string;
  name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  attendeesCount?: number;
  rating?: number;
  reviewsCount?: number;
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {
    userLocation,
    events,
    establishments,
    getNearbyEvents,
    getNearbyEstablishments,
    getUserLocation,
    isLoadingLocation,
    isLoadingEvents,
    isLoadingEstablishments,
    error: locationError,
  } = useLocation();

  const [mapType, setMapType] = useState<MapType>('events');
  const [radius, setRadius] = useState<Radius>(10);
  const [isMapView, setIsMapView] = useState(true);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    let currentLocation = userLocation;

    if (!currentLocation) {
      const response = await getUserLocation();
      if (!response.success || !response.location) {
        setLocationNotice('Ative a localizacao para carregar o mapa e a lista por proximidade.');
        return;
      }

      currentLocation = response.location;
    }

    const response =
      mapType === 'events'
        ? await getNearbyEvents(currentLocation.latitude, currentLocation.longitude, radius)
        : await getNearbyEstablishments(currentLocation.latitude, currentLocation.longitude, radius);

    if (!response.success) {
      setLocationNotice(response.error || 'Nao foi possivel carregar dados proximos.');
      return;
    }

    setLocationNotice(null);
  }, [getNearbyEstablishments, getNearbyEvents, getUserLocation, mapType, radius, userLocation]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isLoadingNearby = mapType === 'events' ? isLoadingEvents : isLoadingEstablishments;
  const isLoading = isLoadingLocation || isLoadingNearby;
  const items = (mapType === 'events' ? events : establishments) as MapListItem[];
  const hasLocationProblem = !userLocation && items.length === 0 && Boolean(locationNotice || locationError);

  const getItemTitle = useCallback(
    (item: MapListItem, type: MapType = mapType) =>
      item.title || item.name || (type === 'events' ? 'Evento' : 'Estabelecimento'),
    [mapType],
  );

  const handleOpenItem = useCallback(
    (item: MapListItem, type: MapType = mapType) => {
      if (type === 'events') {
        navigation.navigate('Item', {
          template: 'evento',
          item: {
            id: item.id,
            name: getItemTitle(item, type),
            description: item.address || '',
            category: 'Evento',
            price: '',
          },
        });
        return;
      }

      navigation.navigate('Profile', {
        type: 'establishment',
        establishmentId: item.id,
      });
    },
    [getItemTitle, mapType, navigation],
  );

  const renderMapView = () => (
    <MapView
      style={styles.map}
      initialRegion={
        userLocation
          ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
          : undefined
      }
    >
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Sua localizacao"
          pinColor={colors.primary}
        />
      )}

      {mapType === 'events' &&
        events.map((event: MapListItem) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={getItemTitle(event, 'events')}
            description={event.address}
            pinColor="#4285F4"
            onCalloutPress={() => handleOpenItem(event, 'events')}
          />
        ))}

      {mapType === 'establishments' &&
        establishments.map((est: MapListItem) => (
          <Marker
            key={est.id}
            coordinate={{
              latitude: est.latitude,
              longitude: est.longitude,
            }}
            title={getItemTitle(est, 'establishments')}
            description={est.address}
            pinColor="#34A853"
            onCalloutPress={() => handleOpenItem(est, 'establishments')}
          />
        ))}
    </MapView>
  );

  const renderListItem = (item: MapListItem) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleOpenItem(item)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${getItemTitle(item)}`}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {getItemTitle(item)}
        </Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.address}
        </Text>

        {mapType === 'events' && (
          <Text style={styles.itemMeta}>{item.attendeesCount ?? 0} presentes</Text>
        )}

        {mapType === 'establishments' && (
          <Text style={styles.itemMeta}>
            nota {item.rating ?? 0} - {item.reviewsCount ?? 0} avaliacoes
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLocationState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Localizacao indisponivel</Text>
      <Text style={styles.emptyText}>
        {locationNotice || locationError || 'Ative a localizacao para ver eventos e estabelecimentos proximos.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => void loadData()}
        accessibilityRole="button"
        accessibilityLabel="Tentar carregar localizacao novamente"
      >
        <Text style={styles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mapType === 'events' && styles.toggleBtnActive]}
            onPress={() => setMapType('events')}
            accessibilityRole="button"
            accessibilityLabel="Mostrar eventos no mapa"
          >
            <Text style={[styles.toggleText, mapType === 'events' && styles.toggleTextActive]}>
              Eventos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mapType === 'establishments' && styles.toggleBtnActive]}
            onPress={() => setMapType('establishments')}
            accessibilityRole="button"
            accessibilityLabel="Mostrar estabelecimentos no mapa"
          >
            <Text style={[styles.toggleText, mapType === 'establishments' && styles.toggleTextActive]}>
              Estabelecimentos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radiusControl}>
          {([5, 10, 25, 50] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
              onPress={() => setRadius(r)}
              accessibilityRole="button"
              accessibilityLabel={`Usar raio de ${r} quilometros`}
            >
              <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>{r}km</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewToggleBtn}
          onPress={() => setIsMapView(!isMapView)}
          accessibilityRole="button"
          accessibilityLabel={isMapView ? 'Ver resultados em lista' : 'Ver resultados no mapa'}
        >
          <Text style={styles.viewToggleText}>{isMapView ? 'Lista' : 'Mapa'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : hasLocationProblem ? (
        renderLocationState()
      ) : isMapView ? (
        renderMapView()
      ) : (
        <FlatList<MapListItem>
          data={items}
          renderItem={({ item }) => renderListItem(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum {mapType === 'events' ? 'evento' : 'estabelecimento'} encontrado
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  typeToggle: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: colors.text },
  radiusControl: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  radiusBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  radiusBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  radiusText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: '600' },
  radiusTextActive: { color: colors.text },
  viewToggleBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewToggleText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  map: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  itemContent: { gap: spacing.xs },
  itemTitle: { fontSize: fontSize.xl, color: colors.text, fontWeight: '600' },
  itemSubtitle: { fontSize: fontSize.base, color: colors.textSecondary },
  itemMeta: { fontSize: fontSize.xs, color: colors.primary, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, fontSize: fontSize.md, color: colors.textSecondary },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
