import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import {
  RESOURCE_AUTHORIZATION_KEY,
  ResourceAuthorizationMetadata,
  ResourceType,
} from '../decorators/authorize-resource.decorator';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    const metadata = this.reflector.getAllAndOverride<ResourceAuthorizationMetadata>(
      RESOURCE_AUTHORIZATION_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const resourceId = request.params?.[metadata.param];
    if (!resourceId) {
      throw new BadRequestException(`Missing route param: ${metadata.param}`);
    }

    const ownerId = await this.resolveOwnerId(metadata.resource, resourceId);
    if (!ownerId) {
      throw new NotFoundException(`${this.humanizeResource(metadata.resource)} not found`);
    }

    if (ownerId !== user.id) {
      throw new ForbiddenException(
        metadata.message ?? 'You do not have permission for this resource'
      );
    }

    return true;
  }

  private humanizeResource(resource: ResourceType): string {
    switch (resource) {
      case 'user':
        return 'User';
      case 'event':
        return 'Event';
      case 'establishment':
        return 'Establishment';
      case 'post':
        return 'Post';
      case 'comment':
        return 'Comment';
      case 'message':
        return 'Message';
      default:
        return 'Resource';
    }
  }

  private async resolveOwnerId(resource: ResourceType, resourceId: string): Promise<string | null> {
    switch (resource) {
      case 'user': {
        const record = await this.prisma.user.findUnique({
          where: { id: resourceId },
          select: { id: true, isDeleted: true },
        });
        if (!record || record.isDeleted) {
          return null;
        }
        return record.id;
      }
      case 'event': {
        const record = await this.prisma.event.findUnique({
          where: { id: resourceId },
          select: { organizerId: true, isDeleted: true, deletedAt: true },
        });
        if (!record || record.isDeleted || record.deletedAt) {
          return null;
        }
        return record.organizerId ?? null;
      }
      case 'establishment': {
        const record = await this.prisma.establishment.findUnique({
          where: { id: resourceId },
          select: { ownerId: true, isDeleted: true, deletedAt: true },
        });
        if (!record || record.isDeleted || record.deletedAt) {
          return null;
        }
        return record.ownerId;
      }
      case 'post': {
        const record = await this.prisma.post.findUnique({
          where: { id: resourceId },
          select: { authorId: true, isDeleted: true, deletedAt: true },
        });
        if (!record || record.isDeleted || record.deletedAt) {
          return null;
        }
        return record.authorId;
      }
      case 'comment': {
        const record = await this.prisma.comment.findUnique({
          where: { id: resourceId },
          select: { authorId: true, isDeleted: true, deletedAt: true },
        });
        if (!record || record.isDeleted || record.deletedAt) {
          return null;
        }
        return record.authorId;
      }
      case 'message': {
        const record = await this.prisma.message.findUnique({
          where: { id: resourceId },
          select: { senderId: true, deletedAt: true },
        });
        if (!record || record.deletedAt) {
          return null;
        }
        return record.senderId;
      }
      default:
        return null;
    }
  }
}
