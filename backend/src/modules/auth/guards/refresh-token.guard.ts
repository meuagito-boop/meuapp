import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: AuthenticatedUser | undefined,
    _info?: unknown,
    _context?: ExecutionContext,
    _status?: unknown
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid refresh token');
    }
    return user as TUser;
  }
}
