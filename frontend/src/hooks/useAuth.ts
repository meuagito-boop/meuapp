/**
 * Hook useAuth - acesso simplificado ao auth store
 * Uso: const { user, isLoading, login, logout } = useAuth();
 */

import { useCallback } from 'react';
import { authStore, AuthTokens, UserAuth } from '@stores/authStore';

export const useAuth = () => {
  const store = authStore();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await store.login(email, password);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Login failed' };
      }
    },
    [store]
  );

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      try {
        await store.signup(email, name, password);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Signup failed' };
      }
    },
    [store]
  );

  const logout = useCallback(async () => {
    try {
      await store.logout();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Logout failed' };
    }
  }, [store]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    tokens: store.tokens,
    require2FA: store.require2FA,
    tempEmail: store.tempEmail,
    login,
    signup,
    logout,
    loginWith2FA: store.loginWith2FA,
    refreshToken: store.refreshToken,
    clearError: store.clearError,
  };
};
