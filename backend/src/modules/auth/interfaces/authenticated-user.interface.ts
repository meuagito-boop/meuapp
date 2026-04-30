export type AuthTokenType = 'access' | 'refresh' | 'temp';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  profileType: string | null;
  tokenType: AuthTokenType;
  refreshToken?: string;
}
