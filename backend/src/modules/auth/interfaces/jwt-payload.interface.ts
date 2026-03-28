export interface JwtPayload {
  id: string;
  temp?: boolean;
  type?: 'password-reset' | 'email-verification';
  iat?: number;
  exp?: number;
}
