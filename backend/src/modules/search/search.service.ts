import { BadRequestException, Injectable } from '@nestjs/common';
import {
  buildBoundingBox,
  calculateDistanceKm,
  hasCoordinates,
  roundDistanceKm,
} from '@common/geo/geo.utils';
import { isOpenNow } from '@common/time/opening-hours.utils';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdvancedSearchDto } from './dtos/advanced-search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, limit: number = 5) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    const normalizedQuery = query.trim();

    const [posts, users, events, establishments] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            { content: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              OR: [
                { name: { contains: normalizedQuery, mode: 'insensitive' } },
                { email: { contains: normalizedQuery, mode: 'insensitive' } },
                { bio: { contains: normalizedQuery, mode: 'insensitive' } },
              ],
            },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          location: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            {
              OR: [
                { name: { contains: normalizedQuery, mode: 'insensitive' } },
                { description: { contains: normalizedQuery, mode: 'insensitive' } },
              ],
            },
          ],
        },
        take: limit,
        include: {
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.establishment.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            {
              OR: [
                { name: { contains: normalizedQuery, mode: 'insensitive' } },
                { description: { contains: normalizedQuery, mode: 'insensitive' } },
              ],
            },
          ],
        },
        take: limit,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
      }),
    ]);

    return {
      posts: this.sanitizePosts(posts),
      users: this.sanitizeUsers(users),
      events,
      establishments,
      total: posts.length + users.length + events.length + establishments.length,
    };
  }

  async searchPosts(query: AdvancedSearchDto) {
    const { page = 1, limit = 10, q, authorId, sortBy = 'recent' } = query;
    const skip = (page - 1) * limit;
    const searchQuery = q && q.trim().length > 0 ? q.trim() : null;

    const where: any = {
      AND: [{ deletedAt: null }, { isPublic: true }],
    };

    if (searchQuery) {
      where.AND.push({
        content: { contains: searchQuery, mode: 'insensitive' },
      });
    }

    if (authorId) {
      where.AND.push({ authorId });
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'trending') {
      orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }];
    } else if (sortBy === 'mostLiked') {
      orderBy = [{ likes: { _count: 'desc' } }];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: this.sanitizePosts(posts),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchUsers(query: string, profileType: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    const normalizedQuery = query.trim();
    const where: any = {
      AND: [
        { deletedAt: null },
        {
          OR: [
            { name: { contains: normalizedQuery, mode: 'insensitive' } },
            { email: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
      ],
    };

    if (profileType) {
      where.AND.push({ profileType });
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          location: true,
          profileType: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: this.sanitizeUsers(users),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchEvents(
    filters: {
      q?: string;
      latitude?: number;
      longitude?: number;
      distance?: number;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    paginationDto: PaginationDto
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const { q, latitude, longitude, distance = 10, category, dateFrom, dateTo } = filters;

    const where: any = {
      AND: [{ deletedAt: null }, { isPublic: true }],
    };

    if (q && q.trim().length > 0) {
      const normalizedQuery = q.trim();
      where.AND.push({
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { description: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      });
    }

    if (category) {
      where.AND.push({
        category: {
          equals: category,
          mode: 'insensitive',
        },
      });
    }

    if (dateFrom) {
      where.AND.push({ date: { gte: new Date(dateFrom) } });
    }

    if (dateTo) {
      where.AND.push({ date: { lte: new Date(dateTo) } });
    }

    const origin =
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { latitude, longitude }
        : null;

    if (origin) {
      where.AND.push(buildBoundingBox(origin, distance));

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
            },
          },
        },
        orderBy: { date: 'asc' },
      });

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
          this.sanitizeEventSearchResult(event, distanceKm)
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
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((event) => this.sanitizeEventSearchResult(event)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchEstablishments(
    filters: {
      q?: string;
      latitude?: number;
      longitude?: number;
      distance?: number;
      category?: string;
      subcategory?: string;
      openNow?: boolean;
      minRating?: number;
    },
    paginationDto: PaginationDto
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const {
      q,
      latitude,
      longitude,
      distance = 5,
      category,
      subcategory,
      openNow,
      minRating = 0,
    } = filters;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new BadRequestException('Latitude and longitude are required');
    }

    const where: any = {
      AND: [
        { deletedAt: null },
        { isDeleted: false },
        { isPublic: true },
        { rating: { gte: minRating } },
      ],
    };

    if (q && q.trim().length > 0) {
      const normalizedQuery = q.trim();
      where.AND.push({
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { description: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      });
    }

    if (category) {
      where.AND.push({
        category: {
          equals: category,
          mode: 'insensitive',
        },
      });
    }

    if (subcategory) {
      where.AND.push({
        subcategory: {
          equals: subcategory,
          mode: 'insensitive',
        },
      });
    }

    const origin = { latitude, longitude };
    where.AND.push(buildBoundingBox(origin, distance));

    const establishments = await this.prisma.establishment.findMany({
      where,
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    });

    const enriched = establishments
      .map((establishment) => ({
        establishment,
        distanceKm: hasCoordinates(establishment)
          ? roundDistanceKm(calculateDistanceKm(origin, establishment))
          : null,
        openNowState: isOpenNow(establishment.openingHours),
      }))
      .filter((entry) => {
        if (openNow === undefined) {
          return true;
        }

        return entry.openNowState === openNow;
      })
      .sort((left, right) => {
        const leftDistance = left.distanceKm ?? Number.MAX_SAFE_INTEGER;
        const rightDistance = right.distanceKm ?? Number.MAX_SAFE_INTEGER;

        if (leftDistance !== rightDistance) {
          return leftDistance - rightDistance;
        }

        const ratingDelta = (right.establishment.rating ?? 0) - (left.establishment.rating ?? 0);
        if (ratingDelta !== 0) {
          return ratingDelta;
        }

        return (left.establishment.name ?? '').localeCompare(
          right.establishment.name ?? '',
          'pt-BR',
          {
            sensitivity: 'base',
          }
        );
      });

    const paginated = enriched.slice(skip, skip + limit);

    return {
      data: paginated.map(({ establishment, distanceKm, openNowState }) =>
        this.sanitizeEstablishmentSearchResult(establishment, distanceKm, openNowState)
      ),
      total: enriched.length,
      page,
      limit,
      totalPages: Math.ceil(enriched.length / limit),
    };
  }

  async autocomplete(query: string, types: string[], limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return { suggestions: [] };
    }

    const normalizedQuery = query.trim();
    const suggestions: Array<{
      id: string;
      text: string;
      type: string;
      highlight: string;
      secondary?: string;
    }> = [];

    if (types.includes('posts')) {
      const posts = await this.prisma.post.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            { content: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          content: true,
        },
      });

      suggestions.push(
        ...posts.map((post) => ({
          id: post.id,
          text: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
          type: 'post',
          highlight: this.highlightMatch(post.content, normalizedQuery),
        }))
      );
    }

    if (types.includes('users')) {
      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              OR: [
                { name: { contains: normalizedQuery, mode: 'insensitive' } },
                { email: { contains: normalizedQuery, mode: 'insensitive' } },
              ],
            },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      suggestions.push(
        ...users.map((user) => {
          const primaryText = user.name || user.email;
          return {
            id: user.id,
            text: primaryText,
            type: 'user',
            highlight: this.highlightMatch(primaryText, normalizedQuery),
            secondary: user.email,
          };
        })
      );
    }

    if (types.includes('events')) {
      const events = await this.prisma.event.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            { name: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
        },
      });

      suggestions.push(
        ...events.map((event) => ({
          id: event.id,
          text: event.name,
          type: 'event',
          highlight: this.highlightMatch(event.name, normalizedQuery),
        }))
      );
    }

    if (types.includes('establishments')) {
      const establishments = await this.prisma.establishment.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isDeleted: false },
            { isPublic: true },
            { name: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          category: true,
        },
      });

      suggestions.push(
        ...establishments.map((establishment) => ({
          id: establishment.id,
          text: establishment.name,
          type: 'establishment',
          highlight: this.highlightMatch(establishment.name, normalizedQuery),
          secondary: establishment.category,
        }))
      );
    }

    return {
      suggestions: suggestions.slice(0, limit),
    };
  }

  async getTrending(limit: number = 5) {
    const [trendingPosts, trendingUsers, trendingEvents] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: [{ likes: { _count: 'desc' } }],
      }),
      this.prisma.user.findMany({
        where: { deletedAt: null },
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        orderBy: [{ followers: { _count: 'desc' } }],
      }),
      this.prisma.event.findMany({
        where: {
          AND: [{ deletedAt: null }, { isPublic: true }, { date: { gte: new Date() } }],
        },
        take: limit,
        include: {
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: [{ attendees: { _count: 'desc' } }, { date: 'asc' }],
      }),
    ]);

    return {
      posts: this.sanitizePosts(trendingPosts),
      users: this.sanitizeUsers(trendingUsers),
      events: trendingEvents,
    };
  }

  private sanitizeEventSearchResult(event: Record<string, unknown>, distanceKm?: number | null) {
    const sanitized = { ...event } as Record<string, unknown>;
    delete sanitized.deletedAt;
    sanitized.distanceKm = distanceKm ?? null;
    return sanitized;
  }

  private sanitizeEstablishmentSearchResult(
    establishment: Record<string, unknown>,
    distanceKm?: number | null,
    openNowState?: boolean | null
  ) {
    const sanitized = { ...establishment } as Record<string, unknown>;
    delete sanitized.deletedAt;
    sanitized.distanceKm = distanceKm ?? null;
    sanitized.isOpenNow = openNowState ?? isOpenNow(sanitized.openingHours);
    sanitized.reviewsCount =
      (typeof sanitized.reviewsCount === 'number' ? sanitized.reviewsCount : undefined) ??
      (sanitized._count as { reviews?: number } | undefined)?.reviews ??
      0;
    return sanitized;
  }

  private highlightMatch(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) {
      return text;
    }

    return text.substring(0, index);
  }

  private sanitizePosts(posts: any[]) {
    return posts.map((post) => {
      const sanitized = { ...post };
      delete sanitized.deletedAt;
      return sanitized;
    });
  }

  private sanitizeUsers(users: any[]) {
    return users.map((user) => {
      const sanitized = { ...user };
      delete sanitized.deletedAt;
      delete sanitized.password;
      delete sanitized.twoFactorSecret;
      return sanitized;
    });
  }
}
