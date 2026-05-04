import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AuditLogService } from '@common/audit/audit-log.service';
import {
  buildBoundingBox,
  calculateDistanceKm,
  hasCoordinates,
  roundDistanceKm,
} from '@common/geo/geo.utils';
import { isOpenNow } from '@common/time/opening-hours.utils';
import { MediaEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { CreateReviewDto } from '../events/dtos/create-review.dto';
import { CreateEstablishmentDto } from './dtos/create-establishment.dto';
import { UpdateEstablishmentDto } from './dtos/update-establishment.dto';

type EstablishmentMediaTarget = 'gallery' | 'logo' | 'cover';
type EstablishmentSanitizationOptions = {
  distanceKm?: number | null;
  openNowState?: boolean | null;
};

@Injectable()
export class EstablishmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  async createEstablishment(userId: string, createEstablishmentDto: CreateEstablishmentDto) {
    try {
      await this.assertEstablishmentAccount(userId);
      await this.assertSingleOwnedEstablishment(userId);

      const establishment = await this.prisma.establishment.create({
        data: {
          name: createEstablishmentDto.name,
          description: createEstablishmentDto.description,
          category: createEstablishmentDto.category,
          subcategory: createEstablishmentDto.subcategory,
          address: createEstablishmentDto.address,
          phone: createEstablishmentDto.phone,
          whatsapp: createEstablishmentDto.whatsapp,
          website: createEstablishmentDto.website,
          latitude: createEstablishmentDto.latitude,
          longitude: createEstablishmentDto.longitude,
          ownerId: userId,
          isPublic: createEstablishmentDto.isPublic ?? true,
          openingHours:
            createEstablishmentDto.openingHours !== undefined
              ? (createEstablishmentDto.openingHours as Prisma.InputJsonValue)
              : undefined,
        },
        include: this.buildEstablishmentInclude(),
      });

      await this.auditLogService?.record({
        userId,
        action: 'establishment.create',
        entity: 'Establishment',
        entityId: establishment.id,
        changes: {
          category: establishment.category,
          subcategory: establishment.subcategory,
          isPublic: establishment.isPublic,
        },
      });

      const mediaMap = await this.getEstablishmentMediaBundles([establishment.id]);
      return this.sanitizeEstablishment(establishment, mediaMap.get(establishment.id));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Failed to create establishment');
    }
  }

  async listEstablishments(
    paginationDto: PaginationDto,
    filters?: {
      latitude?: number;
      longitude?: number;
      distance?: number;
      category?: string;
      subcategory?: string;
      openNow?: boolean;
    }
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      AND: [{ isDeleted: false }, { deletedAt: null }, { isPublic: true }],
    };

    const whereAnd = where.AND as Record<string, unknown>[];
    if (filters?.category) {
      whereAnd.push({
        category: {
          equals: filters.category,
          mode: 'insensitive',
        },
      });
    }

    if (filters?.subcategory) {
      whereAnd.push({
        subcategory: {
          equals: filters.subcategory,
          mode: 'insensitive',
        },
      });
    }

    const origin =
      filters?.latitude != null && filters?.longitude != null
        ? {
            latitude: filters.latitude,
            longitude: filters.longitude,
          }
        : null;

    if (origin) {
      whereAnd.push(buildBoundingBox(origin, filters?.distance ?? 10));
    }

    const needsComputedGeoResult = Boolean(origin) || filters?.openNow !== undefined;

    if (needsComputedGeoResult) {
      const establishments = await this.prisma.establishment.findMany({
        where,
        include: this.buildEstablishmentInclude(),
        orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      });

      const mediaMap = await this.getEstablishmentMediaBundles(
        establishments.map((item) => item.id)
      );
      const enriched = establishments
        .map((item) => ({
          item,
          distanceKm:
            origin && hasCoordinates(item)
              ? roundDistanceKm(calculateDistanceKm(origin, item))
              : null,
          openNowState: isOpenNow(item.openingHours),
        }))
        .filter((entry) => {
          if (filters?.openNow === undefined) {
            return true;
          }

          return entry.openNowState === filters.openNow;
        })
        .sort((left, right) => {
          if (origin) {
            const leftDistance = left.distanceKm ?? Number.MAX_SAFE_INTEGER;
            const rightDistance = right.distanceKm ?? Number.MAX_SAFE_INTEGER;

            if (leftDistance !== rightDistance) {
              return leftDistance - rightDistance;
            }
          }

          const ratingDelta = (right.item.rating ?? 0) - (left.item.rating ?? 0);
          if (ratingDelta !== 0) {
            return ratingDelta;
          }

          return (left.item.name ?? '').localeCompare(right.item.name ?? '', 'pt-BR', {
            sensitivity: 'base',
          });
        });

      const paginated = enriched.slice(skip, skip + limit);

      return {
        data: paginated.map(({ item, distanceKm, openNowState }) =>
          this.sanitizeEstablishment(item, mediaMap.get(item.id), {
            distanceKm,
            openNowState,
          })
        ),
        total: enriched.length,
        page,
        limit,
        totalPages: Math.ceil(enriched.length / limit),
      };
    }

    const [establishments, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        include: this.buildEstablishmentInclude(),
        orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.establishment.count({ where }),
    ]);

    const mediaMap = await this.getEstablishmentMediaBundles(establishments.map((item) => item.id));

    return {
      data: establishments.map((item) => this.sanitizeEstablishment(item, mediaMap.get(item.id))),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listFavoriteEstablishments(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;
    const where: Prisma.EstablishmentWhereInput = {
      isDeleted: false,
      deletedAt: null,
      isPublic: true,
      favorites: {
        some: {
          id: userId,
        },
      },
    };

    const [establishments, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        include: this.buildEstablishmentInclude(),
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.establishment.count({ where }),
    ]);

    const mediaMap = await this.getEstablishmentMediaBundles(establishments.map((item) => item.id));

    return {
      data: establishments.map((item) =>
        this.sanitizeEstablishment(
          {
            ...item,
            isFavorited: true,
          },
          mediaMap.get(item.id)
        )
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEstablishment(id: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
      include: {
        ...this.buildEstablishmentInclude(),
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    const mediaMap = await this.getEstablishmentMediaBundles([establishment.id]);
    return this.sanitizeEstablishment(establishment, mediaMap.get(establishment.id));
  }

  async getOwnedEstablishment(userId: string) {
    const establishment = await this.prisma.establishment.findFirst({
      where: {
        ownerId: userId,
        isDeleted: false,
        deletedAt: null,
      },
      include: {
        ...this.buildEstablishmentInclude(),
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!establishment) {
      throw new NotFoundException('Owned establishment not found');
    }

    const mediaMap = await this.getEstablishmentMediaBundles([establishment.id]);
    return this.sanitizeEstablishment(establishment, mediaMap.get(establishment.id));
  }

  async updateEstablishment(
    id: string,
    userId: string,
    updateEstablishmentDto: UpdateEstablishmentDto
  ) {
    const establishment = await this.assertEstablishmentOwner(id, userId);

    try {
      const updated = await this.prisma.establishment.update({
        where: { id },
        data: {
          name: updateEstablishmentDto.name ?? establishment.name,
          description: updateEstablishmentDto.description ?? establishment.description,
          category: updateEstablishmentDto.category ?? establishment.category,
          subcategory: updateEstablishmentDto.subcategory ?? establishment.subcategory,
          address: updateEstablishmentDto.address ?? establishment.address,
          phone: updateEstablishmentDto.phone ?? establishment.phone,
          whatsapp: updateEstablishmentDto.whatsapp ?? establishment.whatsapp,
          website: updateEstablishmentDto.website ?? establishment.website,
          latitude: updateEstablishmentDto.latitude ?? establishment.latitude,
          longitude: updateEstablishmentDto.longitude ?? establishment.longitude,
          isPublic: updateEstablishmentDto.isPublic ?? establishment.isPublic,
          openingHours:
            updateEstablishmentDto.openingHours !== undefined
              ? (updateEstablishmentDto.openingHours as Prisma.InputJsonValue)
              : (establishment.openingHours ?? undefined),
        },
        include: this.buildEstablishmentInclude(),
      });

      await this.auditLogService?.record({
        userId,
        action: 'establishment.update',
        entity: 'Establishment',
        entityId: id,
        changes: updateEstablishmentDto,
      });

      const mediaMap = await this.getEstablishmentMediaBundles([updated.id]);
      return this.sanitizeEstablishment(updated, mediaMap.get(updated.id));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Failed to update establishment');
    }
  }

  async deleteEstablishment(id: string, userId: string) {
    await this.assertEstablishmentOwner(id, userId);

    try {
      await this.prisma.establishment.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'establishment.soft_delete',
        entity: 'Establishment',
        entityId: id,
      });

      return { message: 'Establishment deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete establishment');
    }
  }

  async registerUploadedMediaTarget(
    establishmentId: string,
    userId: string,
    publicUrl: string,
    target: EstablishmentMediaTarget
  ) {
    await this.assertEstablishmentOwner(establishmentId, userId);

    if (target === 'gallery') {
      return;
    }

    await this.prisma.establishment.update({
      where: { id: establishmentId },
      data:
        target === 'logo'
          ? { logoUrl: publicUrl }
          : {
              coverImageUrl: publicUrl,
            },
    });
  }

  async createReview(establishmentId: string, userId: string, createReviewDto: CreateReviewDto) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    try {
      const review = await this.prisma.review.create({
        data: {
          title: createReviewDto.title,
          content: createReviewDto.content,
          rating: createReviewDto.rating,
          establishmentId,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      await this.updateEstablishmentRating(establishmentId);

      return this.sanitizeReview(review);
    } catch (error) {
      throw new BadRequestException('Failed to create review');
    }
  }

  async getReviews(establishmentId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { establishmentId },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { establishmentId } }),
    ]);

    return {
      data: reviews.map((item) => this.sanitizeReview(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async favoriteEstablishment(establishmentId: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    const existingFavorite = await this.prisma.establishment.findFirst({
      where: {
        id: establishmentId,
        favorites: {
          some: { id: userId },
        },
      },
    });

    if (existingFavorite) {
      throw new BadRequestException('Already favorited');
    }

    try {
      await this.prisma.establishment.update({
        where: { id: establishmentId },
        data: {
          favorites: {
            connect: { id: userId },
          },
        },
      });

      const favoriteCount = await this.prisma.user.count({
        where: {
          favoriteEstablishments: {
            some: { id: establishmentId },
          },
        },
      });

      return {
        message: 'Establishment favorited',
        favoriteCount,
      };
    } catch (error) {
      throw new BadRequestException('Failed to favorite establishment');
    }
  }

  async unfavoriteEstablishment(establishmentId: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    try {
      await this.prisma.establishment.update({
        where: { id: establishmentId },
        data: {
          favorites: {
            disconnect: { id: userId },
          },
        },
      });

      const favoriteCount = await this.prisma.user.count({
        where: {
          favoriteEstablishments: {
            some: { id: establishmentId },
          },
        },
      });

      return {
        message: 'Removed from favorites',
        favoriteCount,
      };
    } catch (error) {
      throw new BadRequestException('Failed to remove from favorites');
    }
  }

  private async assertEstablishmentOwner(establishmentId: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    if (establishment.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission for this establishment');
    }

    return establishment;
  }

  private async assertEstablishmentAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profileType: true,
        isActive: true,
        isDeleted: true,
      },
    });

    if (!user || user.isDeleted || !user.isActive) {
      throw new NotFoundException('Owner account not found');
    }

    if (user.profileType !== 'ESTABLISHMENT') {
      throw new ForbiddenException('Only ESTABLISHMENT accounts can create an establishment page');
    }

    return user;
  }

  private async assertSingleOwnedEstablishment(userId: string) {
    const existingEstablishment = await this.prisma.establishment.findFirst({
      where: {
        ownerId: userId,
        isDeleted: false,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (existingEstablishment) {
      throw new ConflictException(
        'An ESTABLISHMENT account can manage only one active establishment'
      );
    }
  }

  private async updateEstablishmentRating(establishmentId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { establishmentId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return;
    }

    const avgRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    await this.prisma.establishment.update({
      where: { id: establishmentId },
      data: { rating: avgRating },
    });
  }

  private sanitizeEstablishment(
    establishment: Record<string, unknown>,
    mediaBundle?: { latestImageUrl: string | null; galleryUrls: string[] },
    options?: EstablishmentSanitizationOptions
  ) {
    const sanitized = { ...establishment } as Record<string, unknown>;
    delete sanitized.deletedAt;

    const logoUrl = (sanitized.logoUrl as string | null | undefined) ?? null;
    const coverImageUrl = (sanitized.coverImageUrl as string | null | undefined) ?? null;
    sanitized.imageUrl = coverImageUrl ?? logoUrl ?? mediaBundle?.latestImageUrl ?? null;
    sanitized.galleryUrls = mediaBundle?.galleryUrls ?? [];
    sanitized.distanceKm = options?.distanceKm ?? null;
    sanitized.isOpenNow = options?.openNowState ?? isOpenNow(sanitized.openingHours);
    return sanitized;
  }

  private sanitizeReview(review: Record<string, unknown>) {
    const sanitized = { ...review };
    delete sanitized.deletedAt;
    return sanitized;
  }

  private buildEstablishmentInclude() {
    return {
      owner: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
          products: true,
        },
      },
    };
  }

  private async getEstablishmentMediaBundles(establishmentIds: string[]) {
    const uniqueIds = Array.from(new Set(establishmentIds.filter((id) => Boolean(id))));
    const map = new Map<string, { latestImageUrl: string | null; galleryUrls: string[] }>();
    if (uniqueIds.length === 0) {
      return map;
    }

    const mediaList = await this.prisma.media.findMany({
      where: {
        entityType: MediaEntityType.ESTABLISHMENT,
        entityId: { in: uniqueIds },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        entityId: true,
        publicUrl: true,
      },
    });

    for (const entityId of uniqueIds) {
      map.set(entityId, {
        latestImageUrl: null,
        galleryUrls: [],
      });
    }

    for (const media of mediaList) {
      if (!media.entityId) {
        continue;
      }

      const bundle = map.get(media.entityId);
      if (!bundle) {
        continue;
      }

      if (!bundle.latestImageUrl) {
        bundle.latestImageUrl = media.publicUrl;
      }

      bundle.galleryUrls.push(media.publicUrl);
    }

    return map;
  }
}
