import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEstablishmentDto } from './dtos/create-establishment.dto';
import { UpdateEstablishmentDto } from './dtos/update-establishment.dto';
import { CreateReviewDto } from '../events/dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class EstablishmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar novo estabelecimento
   */
  async createEstablishment(userId: string, createEstablishmentDto: CreateEstablishmentDto) {
    try {
      const establishment = await this.prisma.establishment.create({
        data: {
          name: createEstablishmentDto.name,
          description: createEstablishmentDto.description,
          category: createEstablishmentDto.category,
          address: createEstablishmentDto.address,
          phone: createEstablishmentDto.phone,
          latitude: createEstablishmentDto.latitude,
          longitude: createEstablishmentDto.longitude,
          ownerId: userId,
          isPublic: createEstablishmentDto.isPublic ?? true,
        },
        include: {
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
            },
          },
        },
      });

      return this.sanitizeEstablishment(establishment);
    } catch (error) {
      throw new BadRequestException('Failed to create establishment');
    }
  }

  /**
   * Listar estabelecimentos com filtros opcionais
   */
  async listEstablishments(
    paginationDto: PaginationDto,
    filters?: {
      latitude?: number;
      longitude?: number;
      distance?: number;
      category?: string;
    },
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    let where: any = {
      AND: [{ deletedAt: null }, { isPublic: true }],
    };

    // Filtro de categoria
    if (filters?.category) {
      where.AND.push({ category: filters.category });
    }

    // Filtro de localização
    if (filters?.latitude && filters?.longitude) {
      const distance = filters.distance ?? 10; // km
      const latDelta = distance / 111; // ~111 km per degree latitude
      where.AND.push({
        latitude: {
          gte: filters.latitude - latDelta,
          lte: filters.latitude + latDelta,
        },
        longitude: {
          gte: filters.longitude - latDelta / Math.cos(filters.latitude * Math.PI / 180),
          lte: filters.longitude + latDelta / Math.cos(filters.latitude * Math.PI / 180),
        },
      });
    }

    const [establishments, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        include: {
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
            },
          },
        },
        orderBy: { rating: 'desc' },
      }),
      this.prisma.establishment.count({ where }),
    ]);

    return {
      data: establishments.map((e) => this.sanitizeEstablishment(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obter estabelecimento específico
   */
  async getEstablishment(id: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
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
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!establishment || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    return this.sanitizeEstablishment(establishment);
  }

  /**
   * Atualizar estabelecimento
   */
  async updateEstablishment(
    id: string,
    userId: string,
    updateEstablishmentDto: UpdateEstablishmentDto,
  ) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
    });

    if (!establishment || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    if (establishment.ownerId !== userId) {
      throw new ForbiddenException('Only owner can update');
    }

    try {
      const updated = await this.prisma.establishment.update({
        where: { id },
        data: {
          name: updateEstablishmentDto.name ?? establishment.name,
          description: updateEstablishmentDto.description ?? establishment.description,
          category: updateEstablishmentDto.category ?? establishment.category,
          address: updateEstablishmentDto.address ?? establishment.address,
          phone: updateEstablishmentDto.phone ?? establishment.phone,
          isPublic: updateEstablishmentDto.isPublic ?? establishment.isPublic,
        },
        include: {
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
            },
          },
        },
      });

      return this.sanitizeEstablishment(updated);
    } catch (error) {
      throw new BadRequestException('Failed to update establishment');
    }
  }

  /**
   * Deletar estabelecimento (soft delete)
   */
  async deleteEstablishment(id: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id },
    });

    if (!establishment || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    if (establishment.ownerId !== userId) {
      throw new ForbiddenException('Only owner can delete');
    }

    try {
      await this.prisma.establishment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Establishment deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete establishment');
    }
  }

  /**
   * Criar review/avaliação
   */
  async createReview(
    establishmentId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.deletedAt) {
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

      // Atualizar rating médio
      await this.updateEstablishmentRating(establishmentId);

      return this.sanitizeReview(review);
    } catch (error) {
      throw new BadRequestException('Failed to create review');
    }
  }

  /**
   * Obter reviews do estabelecimento
   */
  async getReviews(establishmentId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.deletedAt) {
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
      data: reviews.map((r) => this.sanitizeReview(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Favoritar estabelecimento
   */
  async favoriteEstablishment(establishmentId: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    // Verificar se já favoritado
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

      const favoriteCount = await this.prisma.establishment
        .findUnique({ where: { id: establishmentId } })
        .favorites();

      return {
        message: 'Establishment favorited',
        favoriteCount: favoriteCount.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to favorite establishment');
    }
  }

  /**
   * Remover de favoritos
   */
  async unfavoriteEstablishment(establishmentId: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment || establishment.deletedAt) {
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

      const favoriteCount = await this.prisma.establishment
        .findUnique({ where: { id: establishmentId } })
        .favorites();

      return {
        message: 'Removed from favorites',
        favoriteCount: favoriteCount.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to remove from favorites');
    }
  }

  /**
   * Atualizar rating médio
   */
  private async updateEstablishmentRating(establishmentId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { establishmentId },
      select: { rating: true },
    });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.prisma.establishment.update({
      where: { id: establishmentId },
      data: { rating: avgRating },
    });
  }

  /**
   * Sanitizar estabelecimento
   */
  private sanitizeEstablishment(establishment: any) {
    const { deletedAt, ...sanitized } = establishment;
    return sanitized;
  }

  /**
   * Sanitizar review
   */
  private sanitizeReview(review: any) {
    const { deletedAt, ...sanitized } = review;
    return sanitized;
  }
}
