import ApiClient from './ApiClient';

export interface SearchEstablishment {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string | null;
  address?: string;
  latitude: number;
  longitude: number;
  rating: number;
  distanceKm?: number | null;
  isOpenNow?: boolean | null;
  imageUrl?: string | null;
  galleryUrls?: string[];
  _count?: {
    reviews?: number;
  };
  reviewsCount?: number;
}

export interface SearchPost {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count?: {
    comments?: number;
    likes?: number;
  };
}

export interface SearchEvent {
  id: string;
  name: string;
  description?: string;
  date?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number | null;
  imageUrl?: string | null;
  organizer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count?: {
    attendees?: number;
  };
}

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EstablishmentSearchParams {
  q?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  category?: string;
  subcategory?: string;
  openNow?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface EventSearchParams {
  q?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PostSearchParams {
  q?: string;
  authorId?: string;
  sortBy?: 'recent' | 'trending' | 'mostLiked';
  page?: number;
  limit?: number;
}

class SearchService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  private normalizeEstablishment(item: SearchEstablishment): SearchEstablishment {
    return {
      ...item,
      reviewsCount: item.reviewsCount ?? item._count?.reviews ?? 0,
      distanceKm: item.distanceKm ?? null,
      isOpenNow: item.isOpenNow ?? null,
    };
  }

  async searchEstablishments(
    params: EstablishmentSearchParams,
  ): Promise<PaginatedResponse<SearchEstablishment>> {
    const response = await this.apiClient.get<PaginatedResponse<SearchEstablishment>>(
      '/search/establishments',
      {
        params,
      },
    );

    return {
      ...response,
      data: response.data.map((item) => this.normalizeEstablishment(item)),
    };
  }

  async searchEvents(params: EventSearchParams): Promise<PaginatedResponse<SearchEvent>> {
    return this.apiClient.get('/search/events', {
      params,
    });
  }

  async searchPosts(params: PostSearchParams): Promise<PaginatedResponse<SearchPost>> {
    return this.apiClient.get('/search/posts', {
      params,
    });
  }

  async searchUsers(q: string, page = 1, limit = 20): Promise<PaginatedResponse<SearchUser>> {
    return this.apiClient.get('/search/users', {
      params: { q, page, limit },
    });
  }

  async autocomplete(q: string, types?: string[], limit = 10) {
    return this.apiClient.get('/search/autocomplete', {
      params: {
        q,
        types: types?.join(','),
        limit,
      },
    });
  }

  async globalSearch(q: string, limit = 5) {
    return this.apiClient.get('/search/global', {
      params: { q, limit },
    });
  }

  async trending(limit = 5) {
    return this.apiClient.get('/search/trending', {
      params: { limit },
    });
  }
}

export default SearchService;
