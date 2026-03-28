import ApiClient from './ApiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accessToken: string;
  refreshToken: string;
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface Verify2FARequest {
  code: string;
  secret: string;
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
  async loginWith2FA(email: string, code: string): Promise<AuthResponse> {
    return this.apiClient.post('/auth/login/2fa', {
      email,
      code,
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.apiClient.post('/auth/refresh', {
      refreshToken,
    });
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.apiClient.get('/auth/logout');
    await this.apiClient.logout();
  }

  /**
   * Setup 2FA
   */
  async setup2FA(): Promise<Setup2FAResponse> {
    return this.apiClient.post('/auth/2fa/setup');
  }

  /**
   * Verify 2FA
   */
  async verify2FA(data: Verify2FARequest): Promise<{ message: string }> {
    return this.apiClient.post('/auth/2fa/verify', data);
  }

  /**
   * Reset password (request)
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.apiClient.post('/auth/password-reset', { email });
  }

  /**
   * Reset password (confirm)
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.apiClient.post('/auth/password-reset/confirm', {
      token,
      newPassword,
    });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }
}

export default AuthService;
