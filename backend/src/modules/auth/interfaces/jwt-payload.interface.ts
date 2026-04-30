export interface JwtPayload {
  id?: string;
  sub?: string;
  email?: string;
  profileType?: string;
  tokenType?: 'access' | 'refresh' | 'temp';
  temp?: boolean;
  type?: 'password-reset' | 'email-verification';
  jti?: string;
  iat?: number;
  exp?: number;
}
