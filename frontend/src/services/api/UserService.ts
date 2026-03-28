import ApiClient from './ApiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
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

  /**
   * Obter perfil do usuário logado
   */
  async getProfile(): Promise<UserProfile> {
    return this.apiClient.get('/users/me');
  }

  /**
   * Obter perfil de outro usuário
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.apiClient.get(`/users/${userId}`);
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.apiClient.put('/users/me', data);
  }

  /**
   * Upload avatar
   */
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

  /**
   * Seguir usuário
   */
  async followUser(userId: string): Promise<{ message: string }> {
    return this.apiClient.post(`/users/${userId}/follow`);
  }

  /**
   * Deixar de seguir usuário
   */
  async unfollowUser(userId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/users/${userId}/follow`);
  }

  /**
   * Listar seguidores
   */
  async getFollowers(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserProfile>> {
    return this.apiClient.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
  }

  /**
   * Listar seguindo
   */
  async getFollowing(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserProfile>> {
    return this.apiClient.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
  }

  /**
   * Deletar conta
   */
  async deleteAccount(): Promise<{ message: string }> {
    return this.apiClient.delete('/users/me');
  }

  /**
   * Listar usuários (com busca)
   */
  async searchUsers(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserProfile>> {
    return this.apiClient.get('/users/search', {
      params: { q: query, page, limit },
    });
  }
}

export default UserService;
