import * as Location from 'expo-location';
import { useLocationStore } from '@store/useLocationStore';

const DEFAULT_LATITUDE = -23.5505; // São Paulo
const DEFAULT_LONGITUDE = -46.6333;
const LOCATION_TIMEOUT = 30000; // 30 segundos

export class GeolocationService {
  static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<void> {
    const store = useLocationStore.getState();
    
    try {
      store.setLoading(true);

      // Verificar permissão
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const granted = await this.requestPermission();
        if (!granted) {
          // Usar localização padrão se permissão negada
          store.setLocation(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
          store.setError('Permissão de localização negada. Usando localização padrão.');
          store.setLoading(false);
          return;
        }
      }

      // Obter localização atual
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao obter localização')), LOCATION_TIMEOUT)
        ),
      ]);

      if (location) {
        store.setLocation(
          location.coords.latitude,
          location.coords.longitude,
          location.coords.accuracy || 0
        );
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      
      // Tentar usar última localização conhecida
      const hasLastLocation = useLocationStore.getState().latitude !== null;
      
      if (!hasLastLocation) {
        // Usar localização padrão
        store.setLocation(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        store.setError('Usando localização padrão (São Paulo)');
      } else {
        store.setError('Erro ao atualizar localização. Usando última localização conhecida.');
      }
      
      store.setLoading(false);
    }
  }

  static async getLastKnownLocation(): Promise<Location.LocationObject | null> {
    try {
      return await Location.getLastKnownPositionAsync({
        maxAge: 600000, // 10 minutos
        requiredAccuracy: 100,
      });
    } catch (error) {
      console.error('Erro ao obter última localização conhecida:', error);
      return null;
    }
  }

  static async startLocationTracking(callback?: (location: any) => void): Promise<any> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permissão de localização não concedida');
      }

      return Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 100, // 100 metros
        },
        (location) => {
          const store = useLocationStore.getState();
          store.setLocation(
            location.coords.latitude,
            location.coords.longitude,
            location.coords.accuracy || 0
          );
          
          if (callback) {
            callback(location);
          }
        }
      );
    } catch (error) {
      console.error('Erro ao iniciar rastreamento de localização:', error);
      throw error;
    }
  }
}
