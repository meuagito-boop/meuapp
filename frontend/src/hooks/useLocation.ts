/**
 * Hook useLocation - acesso simplificado ao location store
 * Uso: const { userLocation, nearbyEvents, getNearbyEvents } = useLocation();
 */

import { useCallback } from 'react';
import { locationStore, type LocationStore } from '@stores/locationStore';

export const useLocation = () => {
  const store = locationStore();

  const getUserLocation = useCallback(async () => {
    try {
      const location = await store.getUserLocation();
      return { success: true, location };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to get location' };
    }
  }, [store]);

  const watchUserLocation = useCallback(async () => {
    try {
      await store.watchUserLocation();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to watch location' };
    }
  }, [store]);

  const stopWatchingLocation = useCallback(async () => {
    try {
      await store.stopWatchingLocation();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to stop watching location' };
    }
  }, [store]);

  const getNearbyEvents = useCallback(
    async (latitude: number, longitude: number, radiusKm = 10) => {
      try {
        await store.getNearbyEvents(latitude, longitude, radiusKm);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load nearby events' };
      }
    },
    [store]
  );

  const getNearbyEstablishments = useCallback(
    async (latitude: number, longitude: number, radiusKm = 10, category?: string) => {
      try {
        await store.getNearbyEstablishments(latitude, longitude, radiusKm, category);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load nearby establishments' };
      }
    },
    [store]
  );

  const createEvent = useCallback(
    async (eventData: Parameters<LocationStore['createEvent']>[0]) => {
      try {
        await store.createEvent(eventData);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to create event' };
      }
    },
    [store]
  );

  const attendEvent = useCallback(
    async (eventId: string) => {
      try {
        await store.attendEvent(eventId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to attend event' };
      }
    },
    [store]
  );

  const favoriteEstablishment = useCallback(
    async (establishmentId: string) => {
      try {
        await store.favoriteEstablishment(establishmentId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to favorite establishment' };
      }
    },
    [store]
  );

  return {
    userLocation: store.userLocation,
    events: store.events || [],
    establishments: store.establishments || [],
    isLoadingLocation: store.isLoadingLocation,
    isLoadingEvents: store.isLoadingEvents,
    isLoadingEstablishments: store.isLoadingEstablishments,
    error: store.error,

    // Actions
    getUserLocation,
    watchUserLocation,
    stopWatchingLocation,
    getNearbyEvents,
    getNearbyEstablishments,
    createEvent,
    attendEvent,
    favoriteEstablishment,
  };
};
