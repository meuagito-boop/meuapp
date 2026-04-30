import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!field) {
      return user;
    }

    return user[field];
  }
);

export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;

  if (!user?.id) {
    throw new UnauthorizedException('Unauthorized');
  }

  return user.id;
});
