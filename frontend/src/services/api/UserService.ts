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

  async updateAccount(data: UpdateAccountRequest): Promise<UserProfile> {
    return this.apiClient.put('/users/me', data);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.apiClient.put('/users/me/profile', data);
  }

  async uploadAvatar(
    uri: string,
    filename: string,
    onProgress?: (progress: number) => void,
  ): Promise<UserProfile> {
    return this.apiClient.uploadFile(
      '/users/me/avatar',
      {
        uri,
        name: filename,
        type: 'image/jpeg',
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
