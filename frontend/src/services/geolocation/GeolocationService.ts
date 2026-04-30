import * as Location from 'expo-location';
import { logger } from '@utils/logger';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

class GeolocationService {
  private permissionAsked = false;
  private watchId: Location.LocationSubscription | null = null;

  private isPermissionDenied(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const normalizedMessage = message.toLowerCase();
    return normalizedMessage.includes('permiss') && normalizedMessage.includes('negad');
  }

  /**
   * Solicitar permissão de localização
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.warn('Falha ao solicitar permissao de localizacao:', error);
      return false;
    }
  }

  /**
   * Verificar se tem permissão
   */
  async hasPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.warn('Falha ao verificar permissao de localizacao:', error);
      return false;
    }
  }

  /**
   * Obter localização atual
   */
  async getCurrentLocation(): Promise<Coordinates> {
    try {
      const hasPermission = await this.hasPermission();

      if (!hasPermission) {
        const requested = await this.requestPermission();
        if (!requested) {
          throw new Error('Permissão de localização negada');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
      };
    } catch (error) {
      if (this.isPermissionDenied(error)) {
        logger.warn('Permissao de localizacao nao concedida. Usando fallback.');
      } else {
        logger.error('Erro ao obter localizacao:', error);
      }
      throw error;
    }
  }

  /**
   * Obter localização com fallback
   */
  async getCurrentLocationWithFallback(
    defaultCoordinates?: Coordinates,
  ): Promise<Coordinates> {
    try {
      return await this.getCurrentLocation();
    } catch (error) {
      logger.warn('Falha ao obter localização, usando padrão:', error);

      if (defaultCoordinates) {
        return defaultCoordinates;
      }

      // Coordenadas padrão (São Paulo, Brasil)
      return {
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: 1000,
      };
    }
  }

  /**
   * Monitorar localização
   */
  async watchLocation(
    onLocationChange: (location: Coordinates) => void,
    onError?: (error: Error) => void,
  ): Promise<Location.LocationSubscription> {
    try {
      const hasPermission = await this.hasPermission();

      if (!hasPermission) {
        const requested = await this.requestPermission();
        if (!requested) {
          throw new Error('Permissão de localização negada');
        }
      }

      const watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // atualizar a cada 5 segundos
          distanceInterval: 10, // ou a cada 10 metros
        },
        (location) => {
          onLocationChange({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
          });
        },
      );

      this.watchId = watchSubscription;
      return watchSubscription;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }

  /**
   * Parar de monitorar
   */
  async stopWatching(): Promise<void> {
    if (this.watchId) {
      try {
        this.watchId.remove();
        this.watchId = null;
      } catch (error) {
        logger.error('Erro ao parar de monitorar:', error);
      }
    }
  }

  /**
   * Calcular distância entre dois pontos (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
  }

  /**
   * Geocode (endereço para coordenadas)
   */
  async geocodeAddress(address: string): Promise<Coordinates[]> {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length === 0) {
        throw new Error('Nenhum resultado encontrado');
      }

      return results.map((result) => ({
        latitude: result.latitude,
        longitude: result.longitude,
      }));
    } catch (error) {
      logger.error('Erro ao fazer geocode:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode (coordenadas para endereço)
   */
  async reverseGeocodeCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<Location.LocationGeocodedAddress[]> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length === 0) {
        throw new Error('Nenhum resultado encontrado');
      }

      return results;
    } catch (error) {
      logger.error('Erro ao fazer reverse geocode:', error);
      throw error;
    }
  }

  /**
   * Obter endereço formatado
   */
  async getFormattedAddress(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    try {
      const results = await this.reverseGeocodeCoordinates(latitude, longitude);

      if (results.length > 0) {
        const address = results[0];
        const parts = [];

        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.postalCode) parts.push(address.postalCode);

        return parts.join(', ');
      }

      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      logger.error('Erro ao obter endereço formatado:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }
}

export default new GeolocationService();
