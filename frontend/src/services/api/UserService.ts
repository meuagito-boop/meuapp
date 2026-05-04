import ApiClient from './ApiClient';

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  followers?: number;
  following?: number;
  isFollowing: boolean;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  createdAt: string;
}

export interface PublicUserProfile {
  id: string;
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
  bio?: string | null;
  profileType?: string;
  location?: string | null;
  website?: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export interface UpdateAccountRequest {
  name?: string;
  email?: string;
  username?: string | null;
  phoneNumber?: string | null;
}

export interface UpdateProfileRequest {
  bio?: string;
  location?: string;
  website?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getProfile(): Promise<UserProfile> {
    return this.apiClient.get('/users/me');
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.apiClient.get(`/users/${userId}`);
  }

  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    return this.apiClient.get(`/users/${userId}/public-profile`);
  }

  async updateAccount(data: UpdateAccountRequest): Promise<UserProfile> {
    return this.apiClient.put('/users/me', data);
  }

  async checkUsernameAvailability(username: string): Promise<{ username: string; available: boolean }> {
    return this.apiClient.get('/users/username/availability', {
      params: { username },
    });
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.apiClient.put('/users/me/profile', data);
  }

  async uploadAvatar(
    uri: string,
    filename: string,
    mimeType: string = 'image/jpeg',
    onProgress?: (progress: number) => void,
  ): Promise<UserProfile> {
    return this.apiClient.uploadFile(
      '/users/me/avatar',
      {
        uri,
        name: filename,
        type: mimeType,
      },
      onProgress,
    );
  }

  async followUser(userId: string): Promise<{ message: string }> {
    return this.apiClient.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/users/${userId}/follow`);
  }

  async getFollowers(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<UserProfile>> {
    return this.apiClient.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
  }

  async getFollowing(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<UserProfile>> {
    return this.apiClient.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    return this.apiClient.delete('/users/me', {
      data: { password },
    });
  }

  async searchUsers(query: string, page = 1, limit = 20): Promise<PaginatedResponse<UserProfile>> {
    return this.apiClient.get('/users', {
      params: { search: query, page, limit },
    });
  }
}

export default UserService;
