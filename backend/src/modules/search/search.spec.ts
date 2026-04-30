import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('SearchService', () => {
  let service: SearchService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            event: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            establishment: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('globalSearch', () => {
    it('should return search results from all entities', async () => {
      const mockPost = {
        id: 'post-id',
        content: 'Festa incrível',
        authorId: 'user-id',
        author: { id: 'user-id', name: 'João', avatar: null },
        _count: { comments: 5, likes: 12 },
      };

      const mockUser = {
        id: 'user-id',
        name: 'João Silva',
        email: 'joao@example.com',
        avatar: null,
        bio: 'Curtidor de festas',
        location: 'São Paulo',
        _count: { followers: 42, following: 18 },
      };

      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([mockPost]);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser]);
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.establishment, 'findMany').mockResolvedValue([]);

      const result = await service.globalSearch('festa');

      expect(result.posts).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.events).toBeDefined();
      expect(result.establishments).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
    });

    it('should throw BadRequestException if query is empty', async () => {
      await expect(service.globalSearch('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('searchPosts', () => {
    it('should return posts with pagination', async () => {
      const mockPosts = [
        {
          id: 'post-id-1',
          content: 'Festa no Itaim',
          authorId: 'user-id',
          author: { id: 'user-id', name: 'João', avatar: null },
          _count: { comments: 5, likes: 12 },
        },
      ];

      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue(mockPosts);
      jest.spyOn(prismaService.post, 'count').mockResolvedValue(1);

      const result = await service.searchPosts({
        q: 'festa',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter posts by author', async () => {
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.post, 'count').mockResolvedValue(0);

      const result = await service.searchPosts({
        q: 'festa',
        authorId: 'user-id',
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual([]);
    });

    it('should sort by trending', async () => {
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.post, 'count').mockResolvedValue(0);

      await service.searchPosts({
        q: 'festa',
        sortBy: 'trending',
        page: 1,
        limit: 10,
      });

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.any(Array),
        })
      );
    });
  });

  describe('searchUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        {
          id: 'user-id',
          name: 'João Silva',
          email: 'joao@example.com',
          avatar: null,
          bio: 'Bio',
          location: 'São Paulo',
          profileType: 'USER',
          _count: { followers: 42, following: 18 },
        },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

      const result = await service.searchUsers('João', undefined, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should filter by profile type', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(0);

      await service.searchUsers('João', 'ESTABLISHMENT', {
        page: 1,
        limit: 10,
      });

      expect(prismaService.user.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException if query is empty', async () => {
      await expect(service.searchUsers('', undefined, { page: 1, limit: 10 })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('searchEvents', () => {
    it('should return events with filters', async () => {
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.event, 'count').mockResolvedValue(0);

      const result = await service.searchEvents(
        {
          q: 'festa',
          latitude: -23.5505,
          longitude: -46.6333,
          distance: 10,
        },
        { page: 1, limit: 10 }
      );

      expect(result).toBeDefined();
      expect(result.total).toBe(0);
    });

    it('should filter by date range', async () => {
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.event, 'count').mockResolvedValue(0);

      await service.searchEvents(
        {
          q: 'festa',
          latitude: -23.5505,
          longitude: -46.6333,
          dateFrom: '2024-03-15T00:00:00Z',
          dateTo: '2024-03-31T23:59:59Z',
        },
        { page: 1, limit: 10 }
      );

      expect(prismaService.event.findMany).toHaveBeenCalled();
    });
  });

  describe('searchEstablishments', () => {
    it('should return establishments by location', async () => {
      jest.spyOn(prismaService.establishment, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.establishment, 'count').mockResolvedValue(0);

      const result = await service.searchEstablishments(
        {
          latitude: -23.5505,
          longitude: -46.6333,
          distance: 5,
        },
        { page: 1, limit: 10 }
      );

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if location is missing', async () => {
      await expect(
        service.searchEstablishments(
          {
            latitude: undefined,
            longitude: -46.6333,
          },
          { page: 1, limit: 10 }
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter by rating', async () => {
      jest.spyOn(prismaService.establishment, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.establishment, 'count').mockResolvedValue(0);

      await service.searchEstablishments(
        {
          latitude: -23.5505,
          longitude: -46.6333,
          minRating: 4.0,
        },
        { page: 1, limit: 10 }
      );

      expect(prismaService.establishment.findMany).toHaveBeenCalled();
    });
  });

  describe('autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      jest
        .spyOn(prismaService.post, 'findMany')
        .mockResolvedValue([{ id: 'post-id', content: 'Festa incrível' }]);

      const result = await service.autocomplete('festa', ['posts'], 10);

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should return empty suggestions if query is too short', async () => {
      const result = await service.autocomplete('f', ['posts'], 10);

      expect(result.suggestions).toEqual([]);
    });

    it('should suggest from multiple types', async () => {
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.establishment, 'findMany').mockResolvedValue([]);

      const result = await service.autocomplete(
        'test',
        ['posts', 'users', 'events', 'establishments'],
        10
      );

      expect(result.suggestions).toBeDefined();
    });

    it('should restrict event and establishment suggestions to public records', async () => {
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.establishment, 'findMany').mockResolvedValue([]);

      await service.autocomplete('test', ['events', 'establishments'], 10);

      expect(prismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([{ deletedAt: null }, { isPublic: true }]),
          },
        })
      );
      expect(prismaService.establishment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              { deletedAt: null },
              { isDeleted: false },
              { isPublic: true },
            ]),
          },
        })
      );
    });
  });

  describe('getTrending', () => {
    it('should return trending content', async () => {
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);

      const result = await service.getTrending(5);

      expect(result.posts).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.events).toBeDefined();
    });

    it('should restrict trending events to public records', async () => {
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);
      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([]);

      await service.getTrending(5);

      expect(prismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([{ deletedAt: null }, { isPublic: true }]),
          },
        })
      );
    });
  });
});

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: {
            globalSearch: jest.fn(),
            searchPosts: jest.fn(),
            searchUsers: jest.fn(),
            searchEvents: jest.fn(),
            searchEstablishments: jest.fn(),
            autocomplete: jest.fn(),
            getTrending: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  describe('globalSearch', () => {
    it('should call search service', async () => {
      jest.spyOn(searchService, 'globalSearch').mockResolvedValue({
        posts: [],
        users: [],
        events: [],
        establishments: [],
        total: 0,
      });

      await controller.globalSearch({ q: 'festa', limit: 5 });

      expect(searchService.globalSearch).toHaveBeenCalledWith('festa', 5);
    });
  });

  describe('searchPosts', () => {
    it('should search posts', async () => {
      jest.spyOn(searchService, 'searchPosts').mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.searchPosts({
        q: 'festa',
        sortBy: 'recent',
        page: 1,
        limit: 10,
      });

      expect(searchService.searchPosts).toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('should search users', async () => {
      jest.spyOn(searchService, 'searchUsers').mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.searchUsers('João', undefined, {
        page: 1,
        limit: 10,
      });

      expect(searchService.searchUsers).toHaveBeenCalled();
    });
  });

  describe('autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      jest.spyOn(searchService, 'autocomplete').mockResolvedValue({
        suggestions: [],
      });

      await controller.autocomplete('festa', 'posts', 10);

      expect(searchService.autocomplete).toHaveBeenCalled();
    });
  });

  describe('searchEstablishments', () => {
    it('should normalize openNow string values before calling the service', async () => {
      jest.spyOn(searchService, 'searchEstablishments').mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await controller.searchEstablishments(
        '',
        '-23.5505',
        '-46.6333',
        '5',
        '',
        '',
        'false',
        '',
        '1',
        '10'
      );

      expect(searchService.searchEstablishments).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: -23.5505,
          longitude: -46.6333,
          distance: 5,
          openNow: false,
        }),
        { page: 1, limit: 10 }
      );
    });
  });

  describe('trending', () => {
    it('should return trending content', async () => {
      jest.spyOn(searchService, 'getTrending').mockResolvedValue({
        posts: [],
        users: [],
        events: [],
      });

      await controller.trending(5);

      expect(searchService.getTrending).toHaveBeenCalledWith(5);
    });
  });
});
