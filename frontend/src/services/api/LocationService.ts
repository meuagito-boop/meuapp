import ApiClient from './ApiClient';

type CountBag = {
  attendees?: number;
  reviews?: number;
  favorites?: number;
  products?: number;
};

type BackendEvent = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  organizer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendeesCount?: number;
  attendees?: number;
  reviews?: number;
  rating?: number;
  maxAttendees?: number;
  isAttending?: boolean;
  isPublic?: boolean;
  image?: string;
  imageUrl?: string;
  distanceKm?: number | null;
  createdAt?: string;
  _count?: CountBag;
};

type BackendEstablishment = {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string | null;
  address?: string;
  phone?: string;
  whatsapp?: string | null;
  website?: string;
  latitude?: number;
  longitude?: number;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviewsCount?: number;
  favoritesCount?: number;
  favorites?: number;
  isFavorited?: boolean;
  isPublic?: boolean;
  image?: string;
  imageUrl?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryUrls?: string[];
  distanceKm?: number | null;
  isOpenNow?: boolean | null;
  openingHours?: unknown;
  reviews?: BackendReview[];
  createdAt?: string;
  _count?: CountBag;
};

type BackendReview = {
  id: string;
  title?: string;
  content?: string;
  comment?: string;
  rating: number;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt?: string;
};

type EventPayload = {
  name?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  isPublic?: boolean;
  maxAttendees?: number;
};

const formatDateOnly = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return value;
};

const formatTimeOnly = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().substring(11, 16);
  }

  return undefined;
};

const normalizeDateTime = (
  date?: string,
  time?: string,
  fallbackTime: string = '00:00',
): string => {
  const baseDate = date ? formatDateOnly(date) : new Date().toISOString().split('T')[0];
  const baseTime = time || fallbackTime;
  return `${baseDate}T${baseTime}:00.000Z`;
};

const normalizeEventPayload = (
  data: Partial<CreateEventRequest>,
  options: { requireMandatory: boolean },
): EventPayload => {
  const payload: EventPayload = {};

  const rawName = data.name ?? data.title;
  if (rawName !== undefined) {
    payload.name = rawName;
  }

  if (data.description !== undefined) {
    payload.description = data.description;
  }

  if (data.latitude !== undefined) {
    payload.latitude = data.latitude;
  }

  if (data.longitude !== undefined) {
    payload.longitude = data.longitude;
  }

  if (data.category !== undefined) {
    payload.category = data.category;
  }

  if (data.isPublic !== undefined) {
    payload.isPublic = data.isPublic;
  }

  if (data.maxAttendees !== undefined) {
    payload.maxAttendees = data.maxAttendees;
  }

  const derivedDate = data.date ?? (data.startDate ? formatDateOnly(data.startDate) : undefined);
  const derivedStartTime = data.startTime ?? formatTimeOnly(data.startDate);
  const derivedEndTime = data.endTime ?? formatTimeOnly(data.endDate);

  if (derivedDate !== undefined) {
    payload.date = derivedDate;
  }

  if (derivedStartTime !== undefined) {
    payload.startTime = derivedStartTime;
  }

  if (derivedEndTime !== undefined) {
    payload.endTime = derivedEndTime;
  }

  if (options.requireMandatory) {
    if (!payload.name || !payload.description || !payload.category) {
      throw new Error('Campos obrigatorios do evento ausentes');
    }

    if (typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') {
      throw new Error('Coordenadas obrigatorias do evento ausentes');
    }

    payload.date = payload.date || new Date().toISOString().split('T')[0];
    payload.startTime = payload.startTime || '00:00';
    payload.endTime = payload.endTime || payload.startTime;
  }

  return payload;
};

const normalizeReviewPayload = (data: CreateReviewRequest) => {
  const content = data.content ?? data.comment ?? '';
  const title =
    data.title ??
    (content.length > 0 ? content.slice(0, 60) : 'Avaliacao');

  return {
    title: title.trim().length > 0 ? title : 'Avaliacao',
    content: content.trim().length > 0 ? content : 'Sem comentario',
    rating: data.rating,
  };
};

const normalizeReview = (review: BackendReview): Review => ({
  id: review.id,
  title: review.title,
  comment: review.comment ?? review.content ?? '',
  content: review.content ?? review.comment ?? '',
  rating: review.rating,
  author: review.author || {
    id: 'unknown',
    name: 'Usuario',
  },
  createdAt: review.createdAt || new Date().toISOString(),
});

const normalizeEvent = (event: BackendEvent): Event => {
  const attendeesCount =
    event.attendeesCount ??
    event.attendees ??
    event._count?.attendees ??
    0;
  const reviewsCount = event.reviews ?? event._count?.reviews ?? 0;
  const resolvedName = event.name ?? event.title ?? 'Evento';
  const date = event.date ? formatDateOnly(event.date) : new Date().toISOString().split('T')[0];
  const startTime = event.startTime ?? '00:00';
  const endTime = event.endTime ?? startTime;

  return {
    id: event.id,
    title: event.title ?? resolvedName,
    name: resolvedName,
    description: event.description ?? '',
    latitude: event.latitude ?? 0,
    longitude: event.longitude ?? 0,
    address: event.address ?? '',
    startDate: normalizeDateTime(date, startTime),
    endDate: normalizeDateTime(date, endTime, startTime),
    date,
    startTime,
    endTime,
    category: event.category ?? 'other',
    location: {
      coordinates: [event.longitude ?? 0, event.latitude ?? 0],
    },
    creator: event.creator ?? event.organizer ?? {
      id: 'unknown',
      name: 'Organizador',
    },
    organizer: event.organizer ?? event.creator,
    attendeesCount,
    attendees: attendeesCount,
    reviews: reviewsCount,
    rating: event.rating ?? 0,
    maxAttendees: event.maxAttendees,
    isAttending: event.isAttending ?? false,
    isPublic: event.isPublic ?? true,
    image: event.image ?? event.imageUrl,
    distanceKm: event.distanceKm ?? null,
    createdAt: event.createdAt || new Date().toISOString(),
  };
};

const normalizeEstablishment = (establishment: BackendEstablishment): Establishment => {
  const reviewsCount =
    establishment.reviewsCount ??
    establishment._count?.reviews ??
    0;
  const favoritesCount =
    establishment.favoritesCount ??
    establishment.favorites ??
    establishment._count?.favorites ??
    0;
  const productsCount = establishment._count?.products ?? 0;
  const galleryUrls = Array.isArray(establishment.galleryUrls)
    ? establishment.galleryUrls.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    id: establishment.id,
    name: establishment.name ?? 'Estabelecimento',
    description: establishment.description,
    category: establishment.category ?? 'other',
    subcategory: establishment.subcategory ?? null,
    address: establishment.address ?? '',
    phone: establishment.phone,
    whatsapp: establishment.whatsapp ?? undefined,
    website: establishment.website,
    latitude: establishment.latitude ?? 0,
    longitude: establishment.longitude ?? 0,
    location: {
      coordinates: [establishment.longitude ?? 0, establishment.latitude ?? 0],
    },
    owner: establishment.owner ?? {
      id: 'unknown',
      name: 'Proprietario',
    },
    rating: establishment.rating ?? 0,
    reviewsCount,
    reviews: reviewsCount,
    favoritesCount,
    favorites: favoritesCount,
    productsCount,
    isFavorited: establishment.isFavorited ?? false,
    isPublic: establishment.isPublic ?? true,
    image: establishment.image ?? establishment.imageUrl,
    logoUrl: establishment.logoUrl ?? null,
    coverImageUrl: establishment.coverImageUrl ?? null,
    galleryUrls,
    distanceKm: establishment.distanceKm ?? null,
    isOpenNow: establishment.isOpenNow ?? null,
    openingHours:
      establishment.openingHours && typeof establishment.openingHours === 'object'
        ? (establishment.openingHours as Record<string, unknown>)
        : null,
    reviewsPreview: establishment.reviews?.map((review) => normalizeReview(review)) ?? [],
    createdAt: establishment.createdAt || new Date().toISOString(),
  };
};

export interface Event {
  id: string;
  title: string;
  name?: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: string;
  endDate: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  category: string;
  location?: {
    coordinates: [number, number];
  };
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  organizer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendeesCount: number;
  attendees?: number;
  reviews?: number;
  rating?: number;
  maxAttendees?: number;
  isAttending: boolean;
  isPublic?: boolean;
  image?: string;
  distanceKm?: number | null;
  createdAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string | null;
  address: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  latitude: number;
  longitude: number;
  location?: {
    coordinates: [number, number];
  };
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewsCount: number;
  reviews?: number;
  favoritesCount: number;
  favorites?: number;
  productsCount: number;
  isFavorited: boolean;
  isPublic?: boolean;
  image?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryUrls: string[];
  distanceKm?: number | null;
  isOpenNow?: boolean | null;
  openingHours?: Record<string, unknown> | null;
  reviewsPreview: Review[];
  createdAt: string;
}

export interface Review {
  id: string;
  title?: string;
  comment: string;
  content?: string;
  rating: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface EventAttendee {
  id: string;
  name: string;
  avatar?: string;
}

export interface CreateEventRequest {
  title?: string;
  name?: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  category: string;
  image?: string;
  maxAttendees?: number;
  isPublic?: boolean;
}

export interface CreateEstablishmentRequest {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  latitude: number;
  longitude: number;
  isPublic?: boolean;
  website?: string;
  openingHours?: Record<string, unknown>;
}

export interface CreateReviewRequest {
  title?: string;
  comment?: string;
  content?: string;
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

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const payload = normalizeEventPayload(data, { requireMandatory: true });
    const response = await this.apiClient.post<BackendEvent>('/events', payload);
    return normalizeEvent(response);
  }

  async uploadEventMedia(
    eventId: string,
    uri: string,
    filename: string,
    mimeType: string = 'image/jpeg',
    onProgress?: (progress: number) => void,
  ): Promise<{ id: string; publicUrl: string; mimeType: string; size: number }> {
    return this.apiClient.uploadFile(
      `/events/${eventId}/media`,
      {
        uri,
        name: filename,
        type: mimeType,
      },
      onProgress,
    );
  }

  async getNearbyEvents(
    latitude: number,
    longitude: number,
    distance = 10,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Event>> {
    const response = await this.apiClient.get<PaginatedResponse<BackendEvent>>('/events', {
      params: {
        latitude,
        longitude,
        distance,
        page,
        limit,
      },
    });

    return {
      ...response,
      data: response.data.map((event) => normalizeEvent(event)),
    };
  }

  async getEvent(eventId: string): Promise<Event> {
    const response = await this.apiClient.get<BackendEvent>(`/events/${eventId}`);
    return normalizeEvent(response);
  }

  async updateEvent(eventId: string, data: Partial<CreateEventRequest>): Promise<Event> {
    const payload = normalizeEventPayload(data, { requireMandatory: false });
    const response = await this.apiClient.put<BackendEvent>(`/events/${eventId}`, payload);
    return normalizeEvent(response);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.apiClient.delete(`/events/${eventId}`);
  }

  async attendEvent(eventId: string): Promise<{ message: string; attendeeCount: number }> {
    return this.apiClient.post(`/events/${eventId}/attend`);
  }

  async cancelAttendance(eventId: string): Promise<{ message: string; attendeeCount: number }> {
    return this.apiClient.delete(`/events/${eventId}/attend`);
  }

  async getEventAttendees(eventId: string, page = 1, limit = 20): Promise<PaginatedResponse<EventAttendee>> {
    return this.apiClient.get(`/events/${eventId}/attendees`, {
      params: { page, limit },
    });
  }

  async createEventReview(eventId: string, data: CreateReviewRequest): Promise<Review> {
    const payload = normalizeReviewPayload(data);
    const response = await this.apiClient.post<BackendReview>(`/events/${eventId}/reviews`, payload);
    return normalizeReview(response);
  }

  async getEventReviews(eventId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    const response = await this.apiClient.get<PaginatedResponse<BackendReview>>(
      `/events/${eventId}/reviews`,
      {
        params: { page, limit },
      },
    );

    return {
      ...response,
      data: response.data.map((review) => normalizeReview(review)),
    };
  }

  async createEstablishment(data: CreateEstablishmentRequest): Promise<Establishment> {
    const payload = {
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      address: data.address,
      phone: data.phone,
      whatsapp: data.whatsapp,
      latitude: data.latitude,
      longitude: data.longitude,
      isPublic: data.isPublic,
      website: data.website,
      openingHours: data.openingHours,
    };

    const response = await this.apiClient.post<BackendEstablishment>('/establishments', payload);
    return normalizeEstablishment(response);
  }

  async uploadEstablishmentMedia(
    establishmentId: string,
    uri: string,
    filename: string,
    mimeType: string = 'image/jpeg',
    onProgress?: (progress: number) => void,
    target: 'gallery' | 'logo' | 'cover' = 'gallery',
  ): Promise<{ id: string; publicUrl: string; mimeType: string; size: number }> {
    return this.apiClient.uploadFile(
      `/establishments/${establishmentId}/media?target=${target}`,
      {
        uri,
        name: filename,
        type: mimeType,
      },
      onProgress,
    );
  }

  async getNearbyEstablishments(
    latitude: number,
    longitude: number,
    distance = 10,
    category?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Establishment>> {
    const response = await this.apiClient.get<PaginatedResponse<BackendEstablishment>>('/establishments', {
      params: {
        latitude,
        longitude,
        distance,
        category,
        page,
        limit,
      },
    });

    return {
      ...response,
      data: response.data.map((item) => normalizeEstablishment(item)),
    };
  }

  async getEstablishment(establishmentId: string): Promise<Establishment> {
    const response = await this.apiClient.get<BackendEstablishment>(`/establishments/${establishmentId}`);
    return normalizeEstablishment(response);
  }

  async getOwnedEstablishment(): Promise<Establishment> {
    const response = await this.apiClient.get<BackendEstablishment>('/establishments/me/owned');
    return normalizeEstablishment(response);
  }

  async updateEstablishment(
    establishmentId: string,
    data: Partial<CreateEstablishmentRequest>,
  ): Promise<Establishment> {
    const payload = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.subcategory !== undefined ? { subcategory: data.subcategory } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
      ...(data.website !== undefined ? { website: data.website } : {}),
      ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
      ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
      ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
      ...(data.openingHours !== undefined ? { openingHours: data.openingHours } : {}),
    };

    const response = await this.apiClient.put<BackendEstablishment>(
      `/establishments/${establishmentId}`,
      payload,
    );
    return normalizeEstablishment(response);
  }

  async deleteEstablishment(establishmentId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/establishments/${establishmentId}`);
  }

  async favoriteEstablishment(
    establishmentId: string,
  ): Promise<{ message: string; favoriteCount: number }> {
    return this.apiClient.post(`/establishments/${establishmentId}/favorite`);
  }

  async unfavoriteEstablishment(
    establishmentId: string,
  ): Promise<{ message: string; favoriteCount: number }> {
    return this.apiClient.delete(`/establishments/${establishmentId}/favorite`);
  }

  async createEstablishmentReview(
    establishmentId: string,
    data: CreateReviewRequest,
  ): Promise<Review> {
    const payload = normalizeReviewPayload(data);
    const response = await this.apiClient.post<BackendReview>(
      `/establishments/${establishmentId}/reviews`,
      payload,
    );
    return normalizeReview(response);
  }

  async getEstablishmentReviews(
    establishmentId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Review>> {
    const response = await this.apiClient.get<PaginatedResponse<BackendReview>>(
      `/establishments/${establishmentId}/reviews`,
      {
        params: { page, limit },
      },
    );

    return {
      ...response,
      data: response.data.map((review) => normalizeReview(review)),
    };
  }
}

export default LocationService;
