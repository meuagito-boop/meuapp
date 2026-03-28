import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar novo evento
   */
  async createEvent(userId: string, createEventDto: CreateEventDto) {
    try {
      const event = await this.prisma.event.create({
        data: {
          name: createEventDto.name,
          description: createEventDto.description,
          date: new Date(createEventDto.date),
          startTime: createEventDto.startTime,
          endTime: createEventDto.endTime,
          category: createEventDto.category,
          latitude: createEventDto.latitude,
          longitude: createEventDto.longitude,
          organizerId: userId,
          isPublic: createEventDto.isPublic ?? true,
          maxAttendees: createEventDto.maxAttendees,
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              reviews: true,
            },
          },
        },
      });

      return this.sanitizeEvent(event);
    } catch (error) {
      throw new BadRequestException('Failed to create event');
    }
  }

  /**
   * Listar eventos com filtros opcionais de localização
   */
  async listEvents(
    paginationDto: PaginationDto,
    filters?: {
      latitude?: number;
      longitude?: number;
      distance?: number;
    },
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    let where: any = {
      AND: [{ deletedAt: null }, { isPublic: true }],
    };

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

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              reviews: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((e) => this.sanitizeEvent(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obter evento específico
   */
  async getEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        attendees: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
          take: 10,
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
          take: 5,
        },
        _count: {
          select: {
            attendees: true,
            reviews: true,
          },
        },
      },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    return this.sanitizeEvent(event);
  }

  /**
   * Atualizar evento
   */
  async updateEvent(id: string, userId: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can update');
    }

    try {
      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          name: updateEventDto.name ?? event.name,
          description: updateEventDto.description ?? event.description,
          date: updateEventDto.date ? new Date(updateEventDto.date) : event.date,
          startTime: updateEventDto.startTime ?? event.startTime,
          endTime: updateEventDto.endTime ?? event.endTime,
          category: updateEventDto.category ?? event.category,
          isPublic: updateEventDto.isPublic ?? event.isPublic,
          maxAttendees: updateEventDto.maxAttendees ?? event.maxAttendees,
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              attendees: true,
              reviews: true,
            },
          },
        },
      });

      return this.sanitizeEvent(updatedEvent);
    } catch (error) {
      throw new BadRequestException('Failed to update event');
    }
  }

  /**
   * Deletar evento (soft delete)
   */
  async deleteEvent(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can delete');
    }

    try {
      await this.prisma.event.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Event deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete event');
    }
  }

  /**
   * Confirmar presença no evento
   */
  async attendEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    // Verificar se atingiu limite de attendees
    if (event.maxAttendees) {
      const currentCount = await this.prisma.event
        .findUnique({ where: { id: eventId } })
        .attendees();

      if (currentCount.length >= event.maxAttendees) {
        throw new BadRequestException('Event is full');
      }
    }

    // Verificar se já é attendee
    const existingAttendee = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: { id: userId },
        },
      },
    });

    if (existingAttendee) {
      throw new BadRequestException('Already attending this event');
    }

    try {
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            connect: { id: userId },
          },
        },
      });

      const attendeeCount = await this.prisma.event
        .findUnique({ where: { id: eventId } })
        .attendees();

      return {
        message: 'Successfully attending event',
        attendeeCount: attendeeCount.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to attend event');
    }
  }

  /**
   * Cancelar presença no evento
   */
  async cancelAttendance(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    try {
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            disconnect: { id: userId },
          },
        },
      });

      const attendeeCount = await this.prisma.event
        .findUnique({ where: { id: eventId } })
        .attendees();

      return {
        message: 'Attendance cancelled',
        attendeeCount: attendeeCount.length,
      };
    } catch (error) {
      throw new BadRequestException('Failed to cancel attendance');
    }
  }

  /**
   * Obter lista de attendees
   */
  async getAttendees(eventId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    const [attendees, total] = await Promise.all([
      this.prisma.event
        .findUnique({ where: { id: eventId } })
        .attendees({
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        }),
      this.prisma.event
        .findUnique({ where: { id: eventId } })
        .attendees(),
    ]);

    return {
      data: attendees,
      total: total?.length || 0,
      page,
      limit,
      totalPages: Math.ceil((total?.length || 0) / limit),
    };
  }

  /**
   * Criar review/avaliação
   */
  async createReview(
    eventId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    try {
      const review = await this.prisma.review.create({
        data: {
          title: createReviewDto.title,
          content: createReviewDto.content,
          rating: createReviewDto.rating,
          eventId,
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

      // Atualizar rating médio do evento
      await this.updateEventRating(eventId);

      return this.sanitizeReview(review);
    } catch (error) {
      throw new BadRequestException('Failed to create review');
    }
  }

  /**
   * Obter reviews do evento
   */
  async getReviews(eventId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.deletedAt) {
      throw new NotFoundException('Event not found');
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { eventId },
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
      this.prisma.review.count({ where: { eventId } }),
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
   * Atualizar rating médio do evento
   */
  private async updateEventRating(eventId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { eventId },
      select: { rating: true },
    });

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.prisma.event.update({
      where: { id: eventId },
      data: { rating: avgRating },
    });
  }

  /**
   * Sanitizar evento
   */
  private sanitizeEvent(event: any) {
    const { deletedAt, ...sanitized } = event;
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
