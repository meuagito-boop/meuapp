import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdvancedSearchDto } from './dtos/advanced-search.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca global em todas as entidades
   * Usa PostgreSQL FTS para posts e Full-text search
   */
  async globalSearch(query: string, limit: number = 5) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    const searchQuery = `%${query}%`;
    const ftsQuery = query.replace(/\s+/g, ' & ');

    const [posts, users, events, establishments] = await Promise.all([
      // Busca em posts usando FTS (Full-Text Search)
      this.prisma.post.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            {
              OR: [
                { content: { search: ftsQuery } },
                { content: { contains: query, mode: 'insensitive' } },
              ],
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
        orderBy: { createdAt: 'desc' },
      }),

      // Busca em usuários
      this.prisma.user.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } },
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

      // Busca em eventos
      this.prisma.event.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
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

      // Busca em estabelecimentos
      this.prisma.establishment.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
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
      events: events,
      establishments: establishments,
      total: posts.length + users.length + events.length + establishments.length,
    };
  }

  /**
   * Busca avançada de posts com filtros
   */
  async searchPosts(query: AdvancedSearchDto) {
    const { page = 1, limit = 10, q, authorId, sortBy = 'recent' } = query;
    const skip = (page - 1) * limit;
    const searchQuery = q?.trim().length > 0 ? q : null;

    let where: any = {
      AND: [
        { deletedAt: null },
        { isPublic: true },
      ],
    };

    if (searchQuery) {
      where.AND.push({
        OR: [
          { content: { contains: searchQuery, mode: 'insensitive' } },
        ],
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

  /**
   * Busca de usuários
   */
  async searchUsers(
    query: string,
    profileType: string,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    let where: any = {
      AND: [
        { deletedAt: null },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
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

  /**
   * Busca de eventos com filtros por localização e data
   */
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
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const { q, latitude, longitude, distance = 10, category, dateFrom, dateTo } = filters;

    let where: any = {
      AND: [{ deletedAt: null }],
    };

    // Filtro por texto
    if (q && q.trim().length > 0) {
      where.AND.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Filtro por localização (se fornecidas coordenadas)
    if (latitude && longitude) {
      // Usando PostGIS para busca por distância
      where.AND.push({
        location: {
          path: `ST_DWithin(ST_MakePoint(${longitude}, ${latitude}), location, ${distance * 1000})`,
        },
      });
    }

    // Filtro por categoria
    if (category) {
      where.AND.push({ category: { contains: category, mode: 'insensitive' } });
    }

    // Filtro por data
    if (dateFrom) {
      where.AND.push({ date: { gte: new Date(dateFrom) } });
    }
    if (dateTo) {
      where.AND.push({ date: { lte: new Date(dateTo) } });
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
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca de estabelecimentos por localização com PostGIS
   */
  async searchEstablishments(
    filters: {
      q?: string;
      latitude: number;
      longitude: number;
      distance?: number;
      category?: string;
      minRating?: number;
    },
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const { q, latitude, longitude, distance = 5, category, minRating = 0 } = filters;

    if (!latitude || !longitude) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    let where: any = {
      AND: [
        { deletedAt: null },
        { rating: { gte: minRating } },
      ],
    };

    // Filtro por texto
    if (q && q.trim().length > 0) {
      where.AND.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Filtro por categoria
    if (category) {
      where.AND.push({ category: { contains: category, mode: 'insensitive' } });
    }

    // PostGIS: Busca por distância em km
    where.AND.push({
      location: {
        path: `ST_DWithin(ST_MakePoint(${longitude}, ${latitude}), location, ${distance * 1000})`,
      },
    });

    const [establishments, total] = await Promise.all([
      this.prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.establishment.count({ where }),
    ]);

    return {
      data: establishments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Autocomplete em tempo real
   */
  async autocomplete(
    query: string,
    types: string[],
    limit: number = 10,
  ) {
    if (!query || query.trim().length < 2) {
      return { suggestions: [] };
    }

    const searchQuery = `%${query}%`;
    const suggestions = [];

    // Autocomplete de posts
    if (types.includes('posts')) {
      const posts = await this.prisma.post.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { isPublic: true },
            { content: { contains: query, mode: 'insensitive' } },
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
          highlight: this.highlightMatch(post.content, query),
        })),
      );
    }

    // Autocomplete de usuários
    if (types.includes('users')) {
      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            { deletedAt: null },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
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
        ...users.map((user) => ({
          id: user.id,
          text: user.name,
          type: 'user',
          highlight: this.highlightMatch(user.name, query),
          secondary: user.email,
        })),
      );
    }

    // Autocomplete de eventos
    if (types.includes('events')) {
      const events = await this.prisma.event.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { name: { contains: query, mode: 'insensitive' } },
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
          highlight: this.highlightMatch(event.name, query),
        })),
      );
    }

    // Autocomplete de estabelecimentos
    if (types.includes('establishments')) {
      const establishments = await this.prisma.establishment.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { name: { contains: query, mode: 'insensitive' } },
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
        ...establishments.map((est) => ({
          id: est.id,
          text: est.name,
          type: 'establishment',
          highlight: this.highlightMatch(est.name, query),
          secondary: est.category,
        })),
      );
    }

    // Limitar total de sugestões
    return {
      suggestions: suggestions.slice(0, limit),
    };
  }

  /**
   * Obter tendências (trending)
   */
  async getTrending(limit: number = 5) {
    const [trendingPosts, trendingUsers, trendingEvents] = await Promise.all([
      // Posts com mais curtidas nos últimos 7 dias
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

      // Usuários mais seguidos
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

      // Eventos próximos mais procurados
      this.prisma.event.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { date: { gte: new Date() } },
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
        orderBy: [{ attendees: { _count: 'desc' } }, { date: 'asc' }],
      }),
    ]);

    return {
      posts: this.sanitizePosts(trendingPosts),
      users: this.sanitizeUsers(trendingUsers),
      events: trendingEvents,
    };
  }

  /**
   * Highlighting de match para autocomplete
   */
  private highlightMatch(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return text.substring(0, index);
  }

  /**
   * Sanitizar posts
   */
  private sanitizePosts(posts: any[]) {
    return posts.map((post) => {
      const { deletedAt, ...sanitized } = post;
      return sanitized;
    });
  }

  /**
   * Sanitizar usuários
   */
  private sanitizeUsers(users: any[]) {
    return users.map((user) => {
      const { deletedAt, password, twoFactorSecret, ...sanitized } = user;
      return sanitized;
    });
  }
}
