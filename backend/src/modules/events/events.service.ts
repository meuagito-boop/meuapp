import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { AuditLogService } from '@common/audit/audit-log.service';
import {
  buildBoundingBox,
  calculateDistanceKm,
  hasCoordinates,
  roundDistanceKm,
} from '@common/geo/geo.utils';
import { MediaEntityType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

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

      await this.auditLogService?.record({
        userId,
        action: 'event.create',
        entity: 'Event',
        entityId: event.id,
        changes: {
          category: event.category,
          date: event.date,
          isPublic: event.isPublic,
          maxAttendees: event.maxAttendees,
        },
      });

      const imageMap = await this.getEventImageMap([event.id]);
      return this.sanitizeEvent(event, imageMap.get(event.id));
    } catch (error) {
      throw new BadRequestException('Failed to create event');
    }
  }

  /**
   * Listar eventos com filtros opcionais de localiza????o
   */
  async listEvents(
    paginationDto: PaginationDto,
    filters?: {
      latitude?: number;
      longitude?: number;
      distance?: number;
      category?: string;
    }
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [{ deletedAt: null }, { isPublic: true }],
    };

    if (filters?.category) {
      where.AND.push({
        category: {
          equals: filters.category,
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
      where.AND.push(buildBoundingBox(origin, filters?.distance ?? 10));

      const events = await this.prisma.event.findMany({
        where,
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
      });

      const imageMap = await this.getEventImageMap(events.map((event) => event.id));
      const enriched = events
        .map((event) => ({
          event,
          distanceKm: hasCoordinates(event)
            ? roundDistanceKm(calculateDistanceKm(origin, event))
            : null,
        }))
        .sort((left, right) => {
          const leftDistance = left.distanceKm ?? Number.MAX_SAFE_INTEGER;
          const rightDistance = right.distanceKm ?? Number.MAX_SAFE_INTEGER;

          if (leftDistance !== rightDistance) {
            return leftDistance - rightDistance;
          }

          return new Date(left.event.date).getTime() - new Date(right.event.date).getTime();
        });

      const paginated = enriched.slice(skip, skip + limit);

      return {
        data: paginated.map(({ event, distanceKm }) =>
          this.sanitizeEvent(event, imageMap.get(event.id), distanceKm ?? undefined)
        ),
        total: enriched.length,
        page,
        limit,
        totalPages: Math.ceil(enriched.length / limit),
      };
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

    const imageMap = await this.getEventImageMap(events.map((event) => event.id));

    return {
      data: events.map((event) => this.sanitizeEvent(event, imageMap.get(event.id))),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

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

    const imageMap = await this.getEventImageMap([event.id]);
    return this.sanitizeEvent(event, imageMap.get(event.id));
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

      await this.auditLogService?.record({
        userId,
        action: 'event.update',
        entity: 'Event',
        entityId: id,
        changes: {
          category: updatedEvent.category,
          date: updatedEvent.date,
          isPublic: updatedEvent.isPublic,
          maxAttendees: updatedEvent.maxAttendees,
        },
      });

      const imageMap = await this.getEventImageMap([updatedEvent.id]);
      return this.sanitizeEvent(updatedEvent, imageMap.get(updatedEvent.id));
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

      await this.auditLogService?.record({
        userId,
        action: 'event.soft_delete',
        entity: 'Event',
        entityId: id,
      });

      return { message: 'Event deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete event');
    }
  }

  /**
   * Confirmar presenÃƒÂ§a no evento
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
      const currentCount = await this.prisma.user.count({
        where: {
          attendedEvents: {
            some: { id: eventId },
          },
        },
      });

      if (currentCount >= event.maxAttendees) {
        throw new BadRequestException('Event is full');
      }
    }

    // Verificar se jÃƒÂ¡ ÃƒÂ© attendee
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

      const attendeeCount = await this.prisma.user.count({
        where: {
          attendedEvents: {
            some: { id: eventId },
          },
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'event.attend',
        entity: 'Event',
        entityId: eventId,
        changes: { attendeeCount },
      });

      return {
        message: 'Successfully attending event',
        attendeeCount,
      };
    } catch (error) {
      throw new BadRequestException('Failed to attend event');
    }
  }

  /**
   * Cancelar presenÃƒÂ§a no evento
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

      const attendeeCount = await this.prisma.user.count({
        where: {
          attendedEvents: {
            some: { id: eventId },
          },
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'event.cancel_attendance',
        entity: 'Event',
        entityId: eventId,
        changes: { attendeeCount },
      });

      return {
        message: 'Attendance cancelled',
        attendeeCount,
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
      this.prisma.event.findUnique({ where: { id: eventId } }).attendees({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
        },
      }),
      this.prisma.event.findUnique({ where: { id: eventId } }).attendees(),
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
   * Criar review/avaliaÃƒÂ§ÃƒÂ£o
   */
  async createReview(eventId: string, userId: string, createReviewDto: CreateReviewDto) {
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

      // Atualizar rating mÃƒÂ©dio do evento
      await this.updateEventRating(eventId);

      await this.auditLogService?.record({
        userId,
        action: 'event.review.create',
        entity: 'Review',
        entityId: review.id,
        changes: {
          eventId,
          rating: review.rating,
          title: review.title,
        },
      });

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
   * Atualizar rating mÃƒÂ©dio do evento
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
  private sanitizeEvent(event: any, imageUrl?: string, distanceKm?: number) {
    const sanitized = { ...event };
    delete sanitized.deletedAt;
    sanitized.imageUrl = imageUrl ?? null;
    sanitized.distanceKm = distanceKm ?? null;
    return sanitized;
  }

  private sanitizeReview(review: any) {
    const sanitized = { ...review };
    delete sanitized.deletedAt;
    return sanitized;
  }

  private async getEventImageMap(eventIds: string[]) {
    const uniqueIds = Array.from(new Set(eventIds.filter((id) => Boolean(id))));
    if (uniqueIds.length === 0) {
      return new Map<string, string>();
    }

    const mediaList = await this.prisma.media.findMany({
      where: {
        entityType: MediaEntityType.EVENT,
        entityId: { in: uniqueIds },
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
}
