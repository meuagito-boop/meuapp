import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiClient, authService } from '../services/api';
import { pushRegistrationService } from '@services/push/PushRegistrationService';
import { logger } from '@utils/logger';
import { isUiPreviewModeEnabled } from '@config/uiPreview';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AccountType = 'USER' | 'ESTABLISHMENT';
export type PendingOnboardingScreen = 'PersonalSetup' | 'BusinessSetup' | null;
export type PostOnboardingTab = 'Home' | 'Profile' | null;

export interface UserAuth {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  profileType?: AccountType;
}

export interface SignupPayload {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  password: string;
  profileType: AccountType;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  legalCountryCode: string;
  legalCountryName?: string | null;
}

export interface SignupResult {
  verificationEmailSent: boolean;
  nextScreen: Exclude<PendingOnboardingScreen, null>;
}

type AuthApiResponse = {
  user?: UserAuth;
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  profileType?: AccountType;
  accessToken?: string;
  refreshToken?: string;
  require2FA?: boolean;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  tempUserId?: string;
  userId?: string;
  verificationEmailSent?: boolean;
};

const normalizeUser = (response: AuthApiResponse): UserAuth | null => {
  if (response.user) {
    return response.user;
  }

  if (response.id && response.email && response.name) {
    return {
      id: response.id,
      email: response.email,
      name: response.name,
      avatar: response.avatar,
      profileType: response.profileType,
    };
  }

  return null;
};

const resolveOnboardingScreen = (
  profileType: AccountType | undefined,
): Exclude<PendingOnboardingScreen, null> =>
  profileType === 'ESTABLISHMENT' ? 'BusinessSetup' : 'PersonalSetup';

const connectSocket = async () => {
  try {
    const { default: socketManager } = await import('../services/socket/SocketIOManager');
    await socketManager.connect();
  } catch (error) {
    logger.warn('Erro ao conectar Socket.IO:', error);
  }
};

const disconnectSocket = async () => {
  try {
    const { default: socketManager } = await import('../services/socket/SocketIOManager');
    socketManager.disconnect();
  } catch (error) {
    logger.warn('Erro ao desconectar Socket.IO:', error);
  }
};

export interface AuthStore {
  user: UserAuth | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  pendingOnboardingScreen: PendingOnboardingScreen;
  postOnboardingTab: PostOnboardingTab;
  postOnboardingProfileParams: Record<string, unknown> | null;
  isLoading: boolean;
  error: string | null;
  require2FA: boolean;
  tempEmail: string | null;
  tempUserId: string | null;
  tempToken: string | null;

  signup: (payload: SignupPayload) => Promise<SignupResult>;
  login: (email: string, password: string) => Promise<void>;
  loginWith2FA: (codeOrEmail: string, codeMaybe?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (code: string, _secret?: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  completeOnboarding: (options?: {
    tab?: Exclude<PostOnboardingTab, null>;
    profileParams?: Record<string, unknown> | null;
  }) => Promise<void>;
  clearPostOnboardingTarget: () => void;
  clearTwoFactorChallenge: () => void;
  clearError: () => void;
  setUser: (user: UserAuth | null) => void;
}

export const authStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      needsOnboarding: false,
      pendingOnboardingScreen: null,
      postOnboardingTab: null,
      postOnboardingProfileParams: null,
      isLoading: false,
      error: null,
      require2FA: false,
      tempEmail: null,
      tempUserId: null,
      tempToken: null,

      signup: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const {
            email,
            name,
            firstName,
            lastName,
            birthDate,
            password,
            profileType,
            termsAccepted,
            privacyPolicyAccepted,
            legalCountryCode,
            legalCountryName,
          } = payload;
          const response = (await authService.signup({
            email,
            name,
            firstName,
            lastName,
            birthDate,
            password,
            passwordConfirm: password,
            profileType,
            termsAccepted,
            privacyPolicyAccepted,
            legalCountryCode,
            legalCountryName,
          })) as AuthApiResponse;

          const user = normalizeUser(response);
          if (!user || !response.accessToken || !response.refreshToken) {
            throw new Error('Resposta de cadastro invalida');
          }

          const nextScreen = resolveOnboardingScreen(profileType);

          set({
            user,
            tokens: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            isAuthenticated: true,
            needsOnboarding: true,
            pendingOnboardingScreen: nextScreen,
            postOnboardingTab: null,
            postOnboardingProfileParams: null,
            isLoading: false,
            require2FA: false,
            tempEmail: null,
            tempUserId: null,
            tempToken: null,
          });

          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          void connectSocket();
          return {
            verificationEmailSent: response.verificationEmailSent !== false,
            nextScreen,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao registrar';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = (await authService.login({ email, password })) as AuthApiResponse;

          if (response.requiresTwoFactor || response.require2FA) {
            set({
              require2FA: true,
              tempEmail: email,
              tempUserId: response.userId ?? response.tempUserId ?? null,
              tempToken: response.tempToken ?? null,
              isLoading: false,
            });
            return;
          }

          const user = normalizeUser(response);
          if (!user || !response.accessToken || !response.refreshToken) {
            throw new Error('Resposta de login invalida');
          }

          set({
            user,
            tokens: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            isAuthenticated: true,
            needsOnboarding: false,
            pendingOnboardingScreen: null,
            postOnboardingTab: null,
            postOnboardingProfileParams: null,
            require2FA: false,
            tempEmail: null,
            tempUserId: null,
            tempToken: null,
            isLoading: false,
          });

          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          void connectSocket();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao fazer login';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      loginWith2FA: async (codeOrEmail, codeMaybe) => {
        set({ isLoading: true, error: null });
        try {
          const code = codeMaybe ?? codeOrEmail;
          const { tempUserId, tempToken } = get();

          if (!tempUserId || !tempToken) {
            throw new Error('Sessao temporaria de 2FA nao encontrada');
          }

          const response = (await authService.loginWith2FA(tempUserId, code, tempToken)) as AuthApiResponse;
          const user = normalizeUser(response);

          if (!user || !response.accessToken || !response.refreshToken) {
            throw new Error('Resposta de login 2FA invalida');
          }

          set({
            user,
            tokens: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
            isAuthenticated: true,
            needsOnboarding: false,
            pendingOnboardingScreen: null,
            postOnboardingTab: null,
            postOnboardingProfileParams: null,
            require2FA: false,
            tempEmail: null,
            tempUserId: null,
            tempToken: null,
            isLoading: false,
          });

          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          void connectSocket();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao verificar 2FA';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        let logoutError: Error | null = null;

        try {
          await disconnectSocket();

          try {
            await pushRegistrationService.unregisterCurrentDevice();
          } catch (pushError) {
            logger.warn('Falha ao desregistrar push token localmente.', pushError);
          }

          await authService.logout();
        } catch (error) {
          logoutError = error instanceof Error ? error : new Error('Erro ao fazer logout');
          logger.warn('Falha ao concluir logout no servidor. Sessao local sera limpa.', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            needsOnboarding: false,
            pendingOnboardingScreen: null,
            postOnboardingTab: null,
            postOnboardingProfileParams: null,
            require2FA: false,
            tempEmail: null,
            tempUserId: null,
            tempToken: null,
            isLoading: false,
          });

          try {
            await apiClient.logout();
          } catch (storageError) {
            logger.warn('Falha ao limpar sessao local:', storageError);
          }
        }

        if (logoutError) {
          set({ error: logoutError.message });
        }
      },

      refreshToken: async () => {
        try {
          const { tokens } = get();
          if (!tokens?.refreshToken) {
            throw new Error('Refresh token nao disponivel');
          }

          const response = await authService.refreshToken(tokens.refreshToken);
          if (!response.accessToken) {
            throw new Error('Falha ao renovar token');
          }

          const nextRefreshToken = response.refreshToken || tokens.refreshToken;

          set({
            tokens: {
              accessToken: response.accessToken,
              refreshToken: nextRefreshToken,
            },
          });

          await apiClient.saveTokens({
            accessToken: response.accessToken,
            refreshToken: nextRefreshToken,
          });
        } catch (error) {
          await get().logout();
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

      verify2FA: async (code) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verify2FA({ code });
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao verificar 2FA';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      disable2FA: async () => {
        set({ isLoading: true, error: null });
        try {
          await authService.disable2FA();
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao desativar 2FA';
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

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verifyEmail({ token });
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao verificar email';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      resendVerificationEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resendVerificationEmail(email);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao reenviar verificacao';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      completeOnboarding: async (options) => {
        set({
          needsOnboarding: false,
          pendingOnboardingScreen: null,
          postOnboardingTab: options?.tab ?? null,
          postOnboardingProfileParams: options?.profileParams ?? null,
        });
      },

      clearPostOnboardingTarget: () =>
        set({
          postOnboardingTab: null,
          postOnboardingProfileParams: null,
        }),

      clearTwoFactorChallenge: () =>
        set({
          require2FA: false,
          tempEmail: null,
          tempUserId: null,
          tempToken: null,
          error: null,
          isLoading: false,
        }),

      clearError: () => set({ error: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) =>
        isUiPreviewModeEnabled()
          ? {
              user: null,
              tokens: null,
              isAuthenticated: false,
              needsOnboarding: false,
              pendingOnboardingScreen: null,
            }
          : {
              user: state.user,
              tokens: state.tokens,
              isAuthenticated: state.isAuthenticated,
              needsOnboarding: state.needsOnboarding,
              pendingOnboardingScreen: state.pendingOnboardingScreen,
            },
    },
  ),
);

export const store = authStore;
