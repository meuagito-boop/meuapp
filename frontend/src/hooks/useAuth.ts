/**
 * Hook useAuth - acesso simplificado ao auth store
 * Uso: const { user, isLoading, login, logout } = useAuth();
 */

import { useCallback } from 'react';
import { authStore, type SignupPayload } from '@stores/authStore';

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
    async (data: SignupPayload) => {
      try {
        const result = await store.signup(data);
        return { success: true, ...result };
      } catch (error) {
        return { success: false, error: store.error || 'Signup failed' };
      }
    },
    [store]
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        await store.requestPasswordReset(email);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Request reset failed' };
      }
    },
    [store]
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        await store.resetPassword(token, newPassword);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Reset password failed' };
      }
    },
    [store]
  );

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        await store.verifyEmail(token);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Verify email failed' };
      }
    },
    [store]
  );

  const resendVerificationEmail = useCallback(
    async (email: string) => {
      try {
        await store.resendVerificationEmail(email);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Verification email resend failed' };
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
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    logout,
    loginWith2FA: store.loginWith2FA,
    refreshToken: store.refreshToken,
    setup2FA: store.setup2FA,
    verify2FA: store.verify2FA,
    disable2FA: store.disable2FA,
    clearTwoFactorChallenge: store.clearTwoFactorChallenge,
    clearError: store.clearError,
  };
};
