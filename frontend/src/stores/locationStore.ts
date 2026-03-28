import { create } from 'zustand';
import { locationService } from '../services/api/index';
import GeolocationService, { Coordinates } from '../services/geolocation/GeolocationService';

export interface Event {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: string;
  endDate: string;
  category: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendeesCount: number;
  isAttending: boolean;
  image?: string;
  createdAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  website?: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewsCount: number;
  favoritesCount: number;
  isFavorited: boolean;
  image?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocationStore {
  // State
  userLocation: Coordinates | null;
  events: Event[];
  establishments: Establishment[];
  eventDetails: Map<string, Event>;
  establishmentDetails: Map<string, Establishment>;
  eventReviews: Map<string, PaginatedResponse<Review>>;
  establishmentReviews: Map<string, PaginatedResponse<Review>>;
  favorites: string[];
  isLoadingLocation: boolean;
  isLoadingEvents: boolean;
  isLoadingEstablishments: boolean;
  error: string | null;

  // Actions
  getUserLocation: () => Promise<Coordinates>;
  watchUserLocation: (onLocationChange?: (location: Coordinates) => void) => Promise<string>;
  stopWatchingLocation: () => Promise<void>;
  getNearbyEvents: (
    latitude?: number,
    longitude?: number,
    distance?: number,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  getEvent: (eventId: string) => Promise<void>;
  createEvent: (data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    startDate: string;
    endDate: string;
    category: string;
    image?: string;
  }) => Promise<void>;
  updateEvent: (eventId: string, data: any) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  attendEvent: (eventId: string) => Promise<void>;
  cancelAttendance: (eventId: string) => Promise<void>;
  getEventAttendees: (eventId: string, page?: number, limit?: number) => Promise<any>;
  getEventReviews: (eventId: string, page?: number, limit?: number) => Promise<void>;
  createEventReview: (eventId: string, rating: number, comment: string) => Promise<void>;
  getNearbyEstablishments: (
    latitude?: number,
    longitude?: number,
    distance?: number,
    category?: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  getEstablishment: (establishmentId: string) => Promise<void>;
  createEstablishment: (data: any) => Promise<void>;
  updateEstablishment: (establishmentId: string, data: any) => Promise<void>;
  deleteEstablishment: (establishmentId: string) => Promise<void>;
  favoriteEstablishment: (establishmentId: string) => Promise<void>;
  unfavoriteEstablishment: (establishmentId: string) => Promise<void>;
  getEstablishmentReviews: (
    establishmentId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  createEstablishmentReview: (
    establishmentId: string,
    rating: number,
    comment: string,
  ) => Promise<void>;
  clearError: () => void;
  isFavorited: (establishmentId: string) => boolean;
}

export const locationStore = create<LocationStore>((set, get) => ({
  // Initial state
  userLocation: null,
  events: [],
  establishments: [],
  eventDetails: new Map(),
  establishmentDetails: new Map(),
  eventReviews: new Map(),
  establishmentReviews: new Map(),
  favorites: [],
  isLoadingLocation: false,
  isLoadingEvents: false,
  isLoadingEstablishments: false,
  error: null,

  // Actions
  getUserLocation: async () => {
    set({ isLoadingLocation: true, error: null });
    try {
      const location = await GeolocationService.getCurrentLocationWithFallback();
      set({ userLocation: location, isLoadingLocation: false });
      return location;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao obter localização';
      set({ error: message, isLoadingLocation: false });
      throw error;
    }
  },

  watchUserLocation: async (onLocationChange) => {
    try {
      const watchId = await GeolocationService.watchLocation(
        (location) => {
          set({ userLocation: location });
          onLocationChange?.(location);
        },
        (error) => {
          console.error('Erro ao monitorar localização:', error);
          set({ error: error.message });
        },
      );
      return watchId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao monitorar localização';
      set({ error: message });
      throw error;
    }
  },

  stopWatchingLocation: async () => {
    await GeolocationService.stopWatching();
  },

  getNearbyEvents: async (latitude, longitude, distance = 50, page = 1, limit = 20) => {
    set({ isLoadingEvents: true, error: null });
    try {
      // Se não passou coordenadas, usar localização do usuário
      let lat = latitude;
      let lng = longitude;

      if (!lat || !lng) {
        const location = get().userLocation || (await get().getUserLocation());
        lat = location.latitude;
        lng = location.longitude;
      }

      const response = await locationService.getNearbyEvents(lat, lng, distance, page, limit);

      if (page === 1) {
        set({
          events: response.data,
          isLoadingEvents: false,
        });
      } else {
        set((state) => ({
          events: [...state.events, ...response.data],
          isLoadingEvents: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar eventos próximos';
      set({ error: message, isLoadingEvents: false });
      throw error;
    }
  },

  getEvent: async (eventId) => {
    set({ error: null });
    try {
      const event = await locationService.getEvent(eventId);
      set((state) => {
        const newDetails = new Map(state.eventDetails);
        newDetails.set(eventId, event);
        return { eventDetails: newDetails };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar evento';
      set({ error: message });
      throw error;
    }
  },

  createEvent: async (data) => {
    set({ isLoadingEvents: true, error: null });
    try {
      const event = await locationService.createEvent(data);
      set((state) => ({
        events: [event, ...state.events],
        isLoadingEvents: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar evento';
      set({ error: message, isLoadingEvents: false });
      throw error;
    }
  },

  updateEvent: async (eventId, data) => {
    set({ error: null });
    try {
      const updatedEvent = await locationService.updateEvent(eventId, data);
      set((state) => {
        const newDetails = new Map(state.eventDetails);
        newDetails.set(eventId, updatedEvent);
        return {
          events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
          eventDetails: newDetails,
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar evento';
      set({ error: message });
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    set({ error: null });
    try {
      await locationService.deleteEvent(eventId);
      set((state) => ({
        events: state.events.filter((e) => e.id !== eventId),
        eventDetails: new Map([...state.eventDetails].filter(([id]) => id !== eventId)),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar evento';
      set({ error: message });
      throw error;
    }
  },

  attendEvent: async (eventId) => {
    set({ error: null });
    try {
      await locationService.attendEvent(eventId);

      // Atualizar evento
      set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isAttending: true,
                attendeesCount: e.attendeesCount + 1,
              }
            : e,
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao entrar no evento';
      set({ error: message });
      throw error;
    }
  },

  cancelAttendance: async (eventId) => {
    set({ error: null });
    try {
      await locationService.cancelAttendance(eventId);

      // Atualizar evento
      set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isAttending: false,
                attendeesCount: Math.max(0, e.attendeesCount - 1),
              }
            : e,
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cancelar presença';
      set({ error: message });
      throw error;
    }
  },

  getEventAttendees: async (eventId, page = 1, limit = 20) => {
    set({ error: null });
    try {
      return await locationService.getEventAttendees(eventId, page, limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar participantes';
      set({ error: message });
      throw error;
    }
  },

  getEventReviews: async (eventId, page = 1, limit = 20) => {
    set({ error: null });
    try {
      const reviews = await locationService.getEventReviews(eventId, page, limit);
      set((state) => {
        const newReviews = new Map(state.eventReviews);
        newReviews.set(eventId, reviews);
        return { eventReviews: newReviews };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar avaliações';
      set({ error: message });
      throw error;
    }
  },

  createEventReview: async (eventId, rating, comment) => {
    set({ error: null });
    try {
      const review = await locationService.createEventReview(eventId, { rating, comment });

      // Atualizar avaliações
      set((state) => {
        const reviews = state.eventReviews.get(eventId);
        if (reviews) {
          reviews.data.unshift(review);
        }
        return { eventReviews: state.eventReviews };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar avaliação';
      set({ error: message });
      throw error;
    }
  },

  getNearbyEstablishments: async (
    latitude,
    longitude,
    distance = 50,
    category,
    page = 1,
    limit = 20,
  ) => {
    set({ isLoadingEstablishments: true, error: null });
    try {
      let lat = latitude;
      let lng = longitude;

      if (!lat || !lng) {
        const location = get().userLocation || (await get().getUserLocation());
        lat = location.latitude;
        lng = location.longitude;
      }

      const response = await locationService.getNearbyEstablishments(
        lat,
        lng,
        distance,
        category,
        page,
        limit,
      );

      if (page === 1) {
        set({
          establishments: response.data,
          isLoadingEstablishments: false,
        });
      } else {
        set((state) => ({
          establishments: [...state.establishments, ...response.data],
          isLoadingEstablishments: false,
        }));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar estabelecimentos próximos';
      set({ error: message, isLoadingEstablishments: false });
      throw error;
    }
  },

  getEstablishment: async (establishmentId) => {
    set({ error: null });
    try {
      const establishment = await locationService.getEstablishment(establishmentId);
      set((state) => {
        const newDetails = new Map(state.establishmentDetails);
        newDetails.set(establishmentId, establishment);
        return { establishmentDetails: newDetails };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar estabelecimento';
      set({ error: message });
      throw error;
    }
  },

  createEstablishment: async (data) => {
    set({ isLoadingEstablishments: true, error: null });
    try {
      const establishment = await locationService.createEstablishment(data);
      set((state) => ({
        establishments: [establishment, ...state.establishments],
        isLoadingEstablishments: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar estabelecimento';
      set({ error: message, isLoadingEstablishments: false });
      throw error;
    }
  },

  updateEstablishment: async (establishmentId, data) => {
    set({ error: null });
    try {
      const updatedEstablishment = await locationService.updateEstablishment(
        establishmentId,
        data,
      );
      set((state) => {
        const newDetails = new Map(state.establishmentDetails);
        newDetails.set(establishmentId, updatedEstablishment);
        return {
          establishments: state.establishments.map((e) =>
            e.id === establishmentId ? updatedEstablishment : e,
          ),
          establishmentDetails: newDetails,
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar estabelecimento';
      set({ error: message });
      throw error;
    }
  },

  deleteEstablishment: async (establishmentId) => {
    set({ error: null });
    try {
      await locationService.deleteEstablishment(establishmentId);
      set((state) => ({
        establishments: state.establishments.filter((e) => e.id !== establishmentId),
        establishmentDetails: new Map(
          [...state.establishmentDetails].filter(([id]) => id !== establishmentId),
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar estabelecimento';
      set({ error: message });
      throw error;
    }
  },

  favoriteEstablishment: async (establishmentId) => {
    set({ error: null });
    try {
      await locationService.favoriteEstablishment(establishmentId);

      // Adicionar aos favoritos
      set((state) => ({
        favorites: [...state.favorites, establishmentId],
        establishments: state.establishments.map((e) =>
          e.id === establishmentId
            ? {
                ...e,
                isFavorited: true,
                favoritesCount: e.favoritesCount + 1,
              }
            : e,
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao favoritizar estabelecimento';
      set({ error: message });
      throw error;
    }
  },

  unfavoriteEstablishment: async (establishmentId) => {
    set({ error: null });
    try {
      await locationService.unfavoriteEstablishment(establishmentId);

      // Remover dos favoritos
      set((state) => ({
        favorites: state.favorites.filter((id) => id !== establishmentId),
        establishments: state.establishments.map((e) =>
          e.id === establishmentId
            ? {
                ...e,
                isFavorited: false,
                favoritesCount: Math.max(0, e.favoritesCount - 1),
              }
            : e,
        ),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao remover favoritização do estabelecimento';
      set({ error: message });
      throw error;
    }
  },

  getEstablishmentReviews: async (establishmentId, page = 1, limit = 20) => {
    set({ error: null });
    try {
      const reviews = await locationService.getEstablishmentReviews(establishmentId, page, limit);
      set((state) => {
        const newReviews = new Map(state.establishmentReviews);
        newReviews.set(establishmentId, reviews);
        return { establishmentReviews: newReviews };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar avaliações';
      set({ error: message });
      throw error;
    }
  },

  createEstablishmentReview: async (establishmentId, rating, comment) => {
    set({ error: null });
    try {
      const review = await locationService.createEstablishmentReview(establishmentId, {
        rating,
        comment,
      });

      // Atualizar avaliações
      set((state) => {
        const reviews = state.establishmentReviews.get(establishmentId);
        if (reviews) {
          reviews.data.unshift(review);
        }
        return { establishmentReviews: state.establishmentReviews };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar avaliação';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  isFavorited: (establishmentId) => {
    return get().favorites.includes(establishmentId);
  },
}));
