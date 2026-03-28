import ApiClient from './ApiClient';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  location: {
    coordinates: [number, number];
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: number;
  reviews: number;
  rating: number;
  maxAttendees?: number;
  isPublic: boolean;
  createdAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  location: {
    coordinates: [number, number];
  };
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviews: number;
  favorites: number;
  isPublic: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  category: string;
  maxAttendees?: number;
  isPublic?: boolean;
}

export interface CreateEstablishmentRequest {
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  isPublic?: boolean;
}

export interface CreateReviewRequest {
  title: string;
  content: string;
  rating: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class LocationService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ===== EVENTS =====

  /**
   * Criar evento
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    return this.apiClient.post('/events', data);
  }

  /**
   * Listar eventos próximos
   */
  async getNearbyEvents(
    latitude: number,
    longitude: number,
    distance = 10,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Event>> {
    return this.apiClient.get('/events', {
      params: {
        latitude,
        longitude,
        distance,
        page,
        limit,
      },
    });
  }

  /**
   * Obter evento específico
   */
  async getEvent(eventId: string): Promise<Event> {
    return this.apiClient.get(`/events/${eventId}`);
  }

  /**
   * Atualizar evento
   */
  async updateEvent(eventId: string, data: Partial<CreateEventRequest>): Promise<Event> {
    return this.apiClient.put(`/events/${eventId}`, data);
  }

  /**
   * Deletar evento
   */
  async deleteEvent(eventId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/events/${eventId}`);
  }

  /**
   * Confirmar presença
   */
  async attendEvent(eventId: string): Promise<{ message: string; attendeeCount: number }> {
    return this.apiClient.post(`/events/${eventId}/attend`);
  }

  /**
   * Cancelar presença
   */
  async cancelAttendance(eventId: string): Promise<{ message: string; attendeeCount: number }> {
    return this.apiClient.delete(`/events/${eventId}/attend`);
  }

  /**
   * Listar participantes
   */
  async getEventAttendees(
    eventId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<any>> {
    return this.apiClient.get(`/events/${eventId}/attendees`, {
      params: { page, limit },
    });
  }

  /**
   * Criar avaliação de evento
   */
  async createEventReview(
    eventId: string,
    data: CreateReviewRequest,
  ): Promise<Review> {
    return this.apiClient.post(`/events/${eventId}/reviews`, data);
  }

  /**
   * Listar avaliações de evento
   */
  async getEventReviews(
    eventId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Review>> {
    return this.apiClient.get(`/events/${eventId}/reviews`, {
      params: { page, limit },
    });
  }

  // ===== ESTABLISHMENTS =====

  /**
   * Criar estabelecimento
   */
  async createEstablishment(data: CreateEstablishmentRequest): Promise<Establishment> {
    return this.apiClient.post('/establishments', data);
  }

  /**
   * Listar estabelecimentos próximos
   */
  async getNearbyEstablishments(
    latitude: number,
    longitude: number,
    distance = 10,
    category?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Establishment>> {
    return this.apiClient.get('/establishments', {
      params: {
        latitude,
        longitude,
        distance,
        category,
        page,
        limit,
      },
    });
  }

  /**
   * Obter estabelecimento
   */
  async getEstablishment(establishmentId: string): Promise<Establishment> {
    return this.apiClient.get(`/establishments/${establishmentId}`);
  }

  /**
   * Atualizar estabelecimento
   */
  async updateEstablishment(
    establishmentId: string,
    data: Partial<CreateEstablishmentRequest>,
  ): Promise<Establishment> {
    return this.apiClient.put(`/establishments/${establishmentId}`, data);
  }

  /**
   * Deletar estabelecimento
   */
  async deleteEstablishment(establishmentId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/establishments/${establishmentId}`);
  }

  /**
   * Adicionar aos favoritos
   */
  async favoriteEstablishment(
    establishmentId: string,
  ): Promise<{ message: string; favoriteCount: number }> {
    return this.apiClient.post(`/establishments/${establishmentId}/favorite`);
  }

  /**
   * Remover dos favoritos
   */
  async unfavoriteEstablishment(
    establishmentId: string,
  ): Promise<{ message: string; favoriteCount: number }> {
    return this.apiClient.delete(`/establishments/${establishmentId}/favorite`);
  }

  /**
   * Criar avaliação de estabelecimento
   */
  async createEstablishmentReview(
    establishmentId: string,
    data: CreateReviewRequest,
  ): Promise<Review> {
    return this.apiClient.post(`/establishments/${establishmentId}/reviews`, data);
  }

  /**
   * Listar avaliações de estabelecimento
   */
  async getEstablishmentReviews(
    establishmentId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Review>> {
    return this.apiClient.get(`/establishments/${establishmentId}/reviews`, {
      params: { page, limit },
    });
  }
}

export default LocationService;
