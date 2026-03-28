import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(async (set, get) => {
  // Carregar dados persistidos ao inicializar
  const persistedAuth = await AsyncStorage.getItem('auth-store');
  const initialState = persistedAuth ? JSON.parse(persistedAuth) : {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
  };

  return {
    ...initialState,

    login: async (email: string, password: string) => {
      // TODO: Implementar login com API backend
      // const response = await api.post('/auth/login', { email, password });
      // set({ isAuthenticated: true, user: response.data.user, accessToken: response.data.accessToken });
    },

    logout: async () => {
      await AsyncStorage.removeItem('auth-store');
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    },

    setUser: (user) => {
      set({ user });
    },

    setTokens: (accessToken, refreshToken) => {
      set({ accessToken, refreshToken });
    },

    refreshAccessToken: async () => {
      // TODO: Implementar refresh token com API backend
    },
  };
});
