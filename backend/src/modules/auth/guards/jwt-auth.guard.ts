import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
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
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user as TUser;
  }
}
