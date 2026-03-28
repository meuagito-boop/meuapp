import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, apiClient } from '../services/api/index';
import SocketIOManager from '../services/socket/SocketIOManager';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthStore {
  // State
  user: UserAuth | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  require2FA: boolean;
  tempEmail: string | null;

  // Actions
  signup: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWith2FA: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (code: string, secret: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  setUser: (user: UserAuth | null) => void;
}

export const authStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      require2FA: false,
      tempEmail: null,

      // Actions
      signup: async (email, name, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signup({
            email,
            name,
            password,
          });

          set({
            user: {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              avatar: response.user.avatar,
            },
            tokens: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          // Salvar tokens no ApiClient (SecureStore)
          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao registrar';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({
            email,
            password,
          });

          // Verificar se precisa de 2FA
          if (response.require2FA) {
            set({
              require2FA: true,
              tempEmail: email,
              isLoading: false,
            });
            return;
          }

          set({
            user: {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              avatar: response.user.avatar,
            },
            tokens: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            isAuthenticated: true,
            require2FA: false,
            tempEmail: null,
            isLoading: false,
          });

          // Salvar tokens no ApiClient
          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          // Conectar Socket.io (não bloqueia o fluxo)
          SocketIOManager.connect().catch((error) => {
            console.warn('Erro ao conectar Socket.IO:', error);
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao fazer login';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      loginWith2FA: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.loginWith2FA(email, code);

          set({
            user: {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              avatar: response.user.avatar,
            },
            tokens: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            isAuthenticated: true,
            require2FA: false,
            tempEmail: null,
            isLoading: false,
          });

          // Salvar tokens
          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao verificar 2FA';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // Desconectar Socket.io
          SocketIOManager.disconnect();

          await authService.logout();

          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // Limpar tokens do ApiClient
          await apiClient.logout();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao fazer logout';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const { tokens } = get();
          if (!tokens?.refreshToken) {
            throw new Error('Refresh token não disponível');
          }

          const response = await authService.refreshToken(tokens.refreshToken);

          set({
            tokens: {
              accessToken: response.accessToken,
              refreshToken: tokens.refreshToken, // Manter o mesmo refresh token
            },
          });

          // Atualizar no ApiClient
          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: tokens.refreshToken,
          });
        } catch (error) {
          // Se refresh falhar, fazer logout
          get().logout();
          throw error;
        }
      },

      setup2FA: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.setup2FA();
          set({ isLoading: false });
          return {
            secret: response.secret,
            qrCode: response.qrCode,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao configurar 2FA';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      verify2FA: async (code, secret) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verify2FA(code, secret);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao verificar 2FA';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authService.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao solicitar reset';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(token, newPassword);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao resetar senha';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const store = authStore;
