import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors } from '@constants/colors';
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
  const {
    userLocation,
    events,
    establishments,
    getNearbyEvents,
    getNearbyEstablishments,
    isLoadingEvents,
    isLoadingEstablishments,
  } = useLocation();

  const [mapType, setMapType] = useState<MapType>('events');
  const [radius, setRadius] = useState<Radius>(10);
  const [isMapView, setIsMapView] = useState(true);

  const loadData = useCallback(async () => {
    if (!userLocation) return;

    if (mapType === 'events') {
      await getNearbyEvents(userLocation.latitude, userLocation.longitude, radius);
      return;
    }

    await getNearbyEstablishments(userLocation.latitude, userLocation.longitude, radius);
  }, [getNearbyEstablishments, getNearbyEvents, mapType, radius, userLocation]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isLoading = mapType === 'events' ? isLoadingEvents : isLoadingEstablishments;
  const items = (mapType === 'events' ? events : establishments) as MapListItem[];

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
            title={event.title || event.name}
            description={event.address}
            pinColor="#4285F4"
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
            title={est.name}
            description={est.address}
            pinColor="#34A853"
          />
        ))}
    </MapView>
  );

  const renderListItem = (item: MapListItem) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.address}
        </Text>

        {mapType === 'events' && (
          <Text style={styles.itemMeta}>{item.attendeesCount ?? 0} presentes</Text>
        )}

        {mapType === 'establishments' && (
          <Text style={styles.itemMeta}>
            ⭐ {item.rating ?? 0} • {item.reviewsCount ?? 0} avaliacoes
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mapType === 'events' && styles.toggleBtnActive]}
            onPress={() => setMapType('events')}
          >
            <Text style={[styles.toggleText, mapType === 'events' && styles.toggleTextActive]}>
              Eventos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mapType === 'establishments' && styles.toggleBtnActive]}
            onPress={() => setMapType('establishments')}
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
            >
              <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>{r}km</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.viewToggleBtn} onPress={() => setIsMapView(!isMapView)}>
          <Text style={styles.viewToggleText}>{isMapView ? 'Lista' : 'Mapa'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  typeToggle: { flexDirection: 'row', marginBottom: 12 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 14, color: '#999', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
  radiusControl: { flexDirection: 'row', marginBottom: 12 },
  radiusBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  radiusBtnActive: { backgroundColor: colors.primary },
  radiusText: { fontSize: 12, color: '#999', fontWeight: '600' },
  radiusTextActive: { color: '#fff' },
  viewToggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewToggleText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  map: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  itemContent: { gap: 4 },
  itemTitle: { fontSize: 16, color: '#fff', fontWeight: '600' },
  itemSubtitle: { fontSize: 13, color: '#aaa' },
  itemMeta: { fontSize: 12, color: colors.primary, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
});
