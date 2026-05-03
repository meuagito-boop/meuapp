import ApiClient from './ApiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  name?: string;
  password: string;
  passwordConfirm: string;
  profileType: 'USER' | 'ESTABLISHMENT';
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export interface AuthResponse {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    profileType?: 'USER' | 'ESTABLISHMENT';
  };
  accessToken?: string;
  refreshToken?: string;
  require2FA?: boolean;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  tempUserId?: string;
  userId?: string;
  verificationEmailSent?: boolean;
  profileType?: 'USER' | 'ESTABLISHMENT';
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface Verify2FARequest {
  code: string;
}

export interface Disable2FAResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

class AuthService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Signup
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.apiClient.post('/auth/signup', data);
  }

  /**
   * Login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.apiClient.post('/auth/login', data);
  }

  /**
   * Login com 2FA
   */
  async loginWith2FA(userId: string, code: string, tempToken: string): Promise<AuthResponse> {
    return this.apiClient.post('/auth/verify-2fa-login', {
      userId,
      code,
      tempToken,
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    return this.apiClient.post(
      '/auth/refresh',
      undefined,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.apiClient.post('/auth/logout');
    await this.apiClient.logout();
  }

  /**
   * Setup 2FA
   */
  async setup2FA(): Promise<Setup2FAResponse> {
    return this.apiClient.post('/auth/enable-2fa');
  }

  /**
   * Verify 2FA
   */
  async verify2FA(data: Verify2FARequest): Promise<{ message: string }> {
    return this.apiClient.post('/auth/verify-2fa', data);
  }

  async disable2FA(): Promise<Disable2FAResponse> {
    return this.apiClient.post('/auth/disable-2fa');
  }

  /**
   * Reset password (request)
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.apiClient.post('/auth/request-password-reset', { email });
  }

  /**
   * Reset password (confirm)
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
      passwordConfirm: newPassword,
    });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
      passwordConfirm: newPassword,
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    return this.apiClient.post('/auth/verify-email', data);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string; email: string }> {
    return this.apiClient.post('/auth/resend-verification-email', { email });
  }
}

export default AuthService;
