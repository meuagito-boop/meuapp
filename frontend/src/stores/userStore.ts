import { create } from 'zustand';
import { userService } from '../services/api/index';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStore {
  // State
  profile: UserProfile | null;
  followers: PaginatedResponse<UserProfile> | null;
  following: PaginatedResponse<UserProfile> | null;
  searchResults: PaginatedResponse<UserProfile> | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getProfile: () => Promise<void>;
  getUserProfile: (userId: string) => Promise<UserProfile>;
  updateProfile: (data: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
  }) => Promise<void>;
  uploadAvatar: (uri: string, filename: string, onProgress?: (progress: number) => void) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  getFollowers: (userId: string, page?: number, limit?: number) => Promise<void>;
  getFollowing: (userId: string, page?: number, limit?: number) => Promise<void>;
  searchUsers: (query: string, page?: number, limit?: number) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  clearError: () => void;
  isFollowingUser: (userId: string) => boolean;
}

export const userStore = create<UserStore>((set, get) => ({
  // Initial state
  profile: null,
  followers: null,
  following: null,
  searchResults: null,
  isLoading: false,
  error: null,

  // Actions
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userService.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar perfil';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userService.getUserProfile(userId);
      set({ isLoading: false });
      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar perfil do usuário';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await userService.updateProfile(data);
      set({ profile: updatedProfile, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  uploadAvatar: async (uri, filename, onProgress) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await userService.uploadAvatar(uri, filename, onProgress);
      set({ profile: updatedProfile, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar avatar';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  followUser: async (userId) => {
    set({ error: null });
    try {
      await userService.followUser(userId);

      // Atualizar perfil local se for o usuário atual
      const { profile } = get();
      if (profile?.id === userId) {
        set({
          profile: {
            ...profile,
            isFollowing: true,
            followersCount: profile.followersCount + 1,
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao seguir usuário';
      set({ error: message });
      throw error;
    }
  },

  unfollowUser: async (userId) => {
    set({ error: null });
    try {
      await userService.unfollowUser(userId);

      // Atualizar perfil local se for o usuário atual
      const { profile } = get();
      if (profile?.id === userId) {
        set({
          profile: {
            ...profile,
            isFollowing: false,
            followersCount: Math.max(0, profile.followersCount - 1),
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deixar de seguir usuário';
      set({ error: message });
      throw error;
    }
  },

  getFollowers: async (userId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const followers = await userService.getFollowers(userId, page, limit);
      set({ followers, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar seguidores';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  getFollowing: async (userId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const following = await userService.getFollowing(userId, page, limit);
      set({ following, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar seguindo';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  searchUsers: async (query, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const searchResults = await userService.searchUsers(query, page, limit);
      set({ searchResults, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuários';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteAccount: async (password) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteAccount(password);
      set({ profile: null, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar conta';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  isFollowingUser: (userId) => {
    const { followers } = get();
    if (!followers) return false;
    return followers.data.some((user) => user.id === userId && user.isFollowing);
  },
}));
