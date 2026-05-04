import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaEntityType } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import {
  MEDIA_ALLOWED_MIME_PREFIXES,
  MEDIA_MAX_SIZE_BYTES,
  MEDIA_PREFIX_BY_ENTITY,
  PRIVATE_MEDIA_ENTITY_TYPES,
} from './media.constants';
import { StorageService } from './storage.service';

type UploadMediaInput = {
  ownerId: string;
  entityType: MediaEntityType;
  entityId?: string;
  file?: Express.Multer.File;
};

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async uploadMedia(input: UploadMediaInput) {
    const file = input.file;
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo de media e obrigatorio');
    }

    this.validateFileByEntity(input.entityType, file);
    await this.assertEntityAuthorization(input.ownerId, input.entityType, input.entityId);

    const folder = MEDIA_PREFIX_BY_ENTITY[input.entityType];
    const storageResult = await this.storageService.uploadFile({
      folder,
      ownerId: input.ownerId,
      mimeType: file.mimetype,
      originalName: file.originalname,
      buffer: file.buffer,
    });

    const createdMedia = await this.prisma.media.create({
      data: {
        ownerId: input.ownerId,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        provider: storageResult.provider,
        bucket: storageResult.bucket,
        storagePath: storageResult.storagePath,
        publicUrl: storageResult.publicUrl,
        mimeType: file.mimetype,
        size: file.size,
        width: null,
        height: null,
      },
    });

    return this.toClientMedia(createdMedia);
  }

  async uploadAvatar(ownerId: string, file?: Express.Multer.File) {
    return this.uploadMedia({
      ownerId,
      entityType: MediaEntityType.AVATAR,
      entityId: ownerId,
      file,
    });
  }

  async uploadPostMedia(ownerId: string, file?: Express.Multer.File, postId?: string) {
    return this.uploadMedia({
      ownerId,
      entityType: MediaEntityType.POST,
      entityId: postId,
      file,
    });
  }

  async uploadChatAttachment(ownerId: string, conversationId: string, file?: Express.Multer.File) {
    return this.uploadMedia({
      ownerId,
      entityType: MediaEntityType.CHAT_ATTACHMENT,
      entityId: conversationId,
      file,
    });
  }

  async uploadEventMedia(ownerId: string, eventId: string, file?: Express.Multer.File) {
    return this.uploadMedia({
      ownerId,
      entityType: MediaEntityType.EVENT,
      entityId: eventId,
      file,
    });
  }

  async uploadEstablishmentMedia(
    ownerId: string,
    establishmentId: string,
    file?: Express.Multer.File
  ) {
    return this.uploadMedia({
      ownerId,
      entityType: MediaEntityType.ESTABLISHMENT,
      entityId: establishmentId,
      file,
    });
  }

  async uploadProductMedia(ownerId: string, productId: string, file?: Express.Multer.File) {
    return this.uploadMedia({
      ownerId,
      entityType: MediaEntityType.PRODUCT,
      entityId: productId,
      file,
    });
  }

  async listEntityMedia(entityType: MediaEntityType, entityId: string) {
    if (this.isPrivateMedia(entityType)) {
      throw new NotFoundException('Midia nao encontrada');
    }

    const mediaList = await this.prisma.media.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return mediaList.map((media) => this.toClientMedia(media));
  }

  async resolveLocalMediaFile(folder: string, filename: string) {
    const storagePath = `${folder}/${filename}`;
    const media = await this.prisma.media.findFirst({
      where: {
        storagePath,
        provider: 'LOCAL',
      },
      select: {
        storagePath: true,
        mimeType: true,
        entityType: true,
      },
    });

    if (!media) {
      throw new NotFoundException('Arquivo de media nao encontrado');
    }

    if (this.isPrivateMedia(media.entityType)) {
      throw new NotFoundException('Arquivo de media nao encontrado');
    }

    return {
      absolutePath: this.storageService.getLocalAbsolutePath(media.storagePath),
      mimeType: media.mimeType,
    };
  }

  async resolveProtectedMedia(mediaId: string, userId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        provider: true,
        bucket: true,
        storagePath: true,
        mimeType: true,
      },
    });

    if (!media || !this.isPrivateMedia(media.entityType)) {
      throw new NotFoundException('Arquivo de media nao encontrado');
    }

    await this.assertPrivateMediaAccess(userId, media.entityType, media.entityId);

    return this.storageService.downloadFile({
      provider: media.provider,
      bucket: media.bucket,
      storagePath: media.storagePath,
      mimeType: media.mimeType,
    });
  }

  async resolvePublicMedia(mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        entityType: true,
        provider: true,
        bucket: true,
        storagePath: true,
        mimeType: true,
      },
    });

    if (!media || this.isPrivateMedia(media.entityType)) {
      throw new NotFoundException('Arquivo de media nao encontrado');
    }

    return this.storageService.downloadFile({
      provider: media.provider,
      bucket: media.bucket,
      storagePath: media.storagePath,
      mimeType: media.mimeType,
    });
  }

  async getLatestMediaMap(entityType: MediaEntityType, entityIds: string[]) {
    const uniqueEntityIds = Array.from(new Set(entityIds.filter((id) => id && id.length > 0)));
    if (uniqueEntityIds.length === 0) {
      return new Map<string, string>();
    }

    const mediaList = await this.prisma.media.findMany({
      where: {
        entityType,
        entityId: { in: uniqueEntityIds },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        entityId: true,
        publicUrl: true,
      },
    });

    const map = new Map<string, string>();
    for (const media of mediaList) {
      if (media.entityId && !map.has(media.entityId)) {
        map.set(media.entityId, media.publicUrl);
      }
    }

    return map;
  }

  private validateFileByEntity(entityType: MediaEntityType, file: Express.Multer.File) {
    const allowedMimePrefixes = MEDIA_ALLOWED_MIME_PREFIXES[entityType];
    const hasAllowedMime = allowedMimePrefixes.some((mimePrefix) =>
      file.mimetype?.startsWith(mimePrefix)
    );
    if (!hasAllowedMime) {
      throw new BadRequestException(`Tipo de arquivo nao permitido para ${entityType}`);
    }

    const maxSize = MEDIA_MAX_SIZE_BYTES[entityType];
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Arquivo excede o limite de ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
      );
    }
  }

  private async assertEntityAuthorization(
    ownerId: string,
    entityType: MediaEntityType,
    entityId?: string
  ) {
    if (entityType === MediaEntityType.AVATAR) {
      if (!entityId || entityId !== ownerId) {
        throw new ForbiddenException('Avatar so pode ser enviado para o proprio usuario');
      }
      return;
    }

    if (entityType === MediaEntityType.POST) {
      if (!entityId) {
        return;
      }

      const post = await this.prisma.post.findUnique({
        where: { id: entityId },
        select: { authorId: true },
      });
      if (!post) {
        throw new NotFoundException('Post nao encontrado');
      }
      if (post.authorId !== ownerId) {
        throw new ForbiddenException('Sem permissao para enviar media deste post');
      }
      return;
    }

    if (entityType === MediaEntityType.CHAT_ATTACHMENT) {
      if (!entityId) {
        throw new BadRequestException('conversationId e obrigatorio para anexos de chat');
      }

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: entityId,
          participants: {
            some: { id: ownerId },
          },
        },
        select: { id: true },
      });

      if (!conversation) {
        throw new ForbiddenException('Sem permissao para anexar arquivo nesta conversa');
      }
      return;
    }

    if (entityType === MediaEntityType.EVENT) {
      if (!entityId) {
        throw new BadRequestException('eventId e obrigatorio para media de evento');
      }

      const event = await this.prisma.event.findUnique({
        where: { id: entityId },
        select: { organizerId: true },
      });

      if (!event) {
        throw new NotFoundException('Evento nao encontrado');
      }
      if (event.organizerId !== ownerId) {
        throw new ForbiddenException('Somente o organizador pode enviar media do evento');
      }
      return;
    }

    if (entityType === MediaEntityType.ESTABLISHMENT) {
      if (!entityId) {
        throw new BadRequestException(
          'establishmentId e obrigatorio para media de estabelecimento'
        );
      }

      const establishment = await this.prisma.establishment.findUnique({
        where: { id: entityId },
        select: {
          ownerId: true,
          isDeleted: true,
          deletedAt: true,
        },
      });

      if (!establishment || establishment.isDeleted || establishment.deletedAt) {
        throw new NotFoundException('Estabelecimento nao encontrado');
      }

      if (establishment.ownerId !== ownerId) {
        throw new ForbiddenException('Sem permissao para enviar media do estabelecimento');
      }

      return;
    }

    if (entityType === MediaEntityType.PRODUCT) {
      if (!entityId) {
        throw new BadRequestException('productId e obrigatorio para media de produto');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: entityId },
        select: {
          establishment: {
            select: {
              ownerId: true,
              isDeleted: true,
              deletedAt: true,
            },
          },
        },
      });

      if (!product || product.establishment.isDeleted || product.establishment.deletedAt) {
        throw new NotFoundException('Produto nao encontrado');
      }

      if (product.establishment.ownerId !== ownerId) {
        throw new ForbiddenException('Sem permissao para enviar media do produto');
      }
    }
  }

  private async assertPrivateMediaAccess(
    userId: string,
    entityType: MediaEntityType,
    entityId: string | null
  ) {
    if (entityType !== MediaEntityType.CHAT_ATTACHMENT || !entityId) {
      throw new ForbiddenException('Sem permissao para acessar esta media');
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: entityId,
        participants: {
          some: { id: userId },
        },
      },
      select: { id: true },
    });

    if (!conversation) {
      throw new ForbiddenException('Sem permissao para acessar esta media');
    }
  }

  private isPrivateMedia(entityType: MediaEntityType) {
    return PRIVATE_MEDIA_ENTITY_TYPES.has(entityType);
  }

  private toClientMedia<
    T extends {
      id: string;
      entityType: MediaEntityType;
      publicUrl: string;
      provider?: string;
    },
  >(media: T): T {
    if (!this.isPrivateMedia(media.entityType)) {
      if (this.storageService.shouldServePublicMediaThroughApi(media.provider)) {
        return {
          ...media,
          publicUrl: this.storageService.buildPublicMediaUrl(media.id),
        };
      }

      return media;
    }

    return {
      ...media,
      publicUrl: this.storageService.buildProtectedMediaUrl(media.id),
    };
  }
}
