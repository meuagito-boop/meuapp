import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  lastUpdated: Date | null;
  error: string | null;
  isLoading: boolean;
  
  setLocation: (latitude: number, longitude: number, accuracy?: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      accuracy: null,
      lastUpdated: null,
      error: null,
      isLoading: false,

      setLocation: (latitude, longitude, accuracy = 0) =>
        set({
          latitude,
          longitude,
          accuracy,
          lastUpdated: new Date(),
          error: null,
        }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      reset: () =>
        set({
          latitude: null,
          longitude: null,
          accuracy: null,
          lastUpdated: null,
          error: null,
          isLoading: false,
        }),
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
