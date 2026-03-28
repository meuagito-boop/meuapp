import { Test, TestingModule } from '@nestjs/testing';
import { EstablishmentsService } from './establishments.service';
import { EstablishmentsController } from './establishments.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('EstablishmentsModule', () => {
  let service: EstablishmentsService;
  let controller: EstablishmentsController;
  let prisma: PrismaService;

  const mockPrismaService = {
    establishment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstablishmentsController],
      providers: [
        EstablishmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EstablishmentsService>(EstablishmentsService);
    controller = module.get<EstablishmentsController>(EstablishmentsController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('EstablishmentsService', () => {
    describe('createEstablishment', () => {
      it('should create a new establishment', async () => {
        const userId = 'user-123';
        const createEstablishmentDto = {
          name: 'Bar do João',
          description: 'Traditional bar',
          category: 'bar',
          address: 'Rua Augusta, 2500',
          phone: '+5511987654321',
          latitude: -23.5505,
          longitude: -46.6333,
          isPublic: true,
        };

        const mockEstablishment = {
          id: 'est-123',
          ...createEstablishmentDto,
          ownerId: userId,
          rating: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          owner: {
            id: userId,
            name: 'John Doe',
            avatar: null,
          },
          _count: {
            reviews: 0,
            favorites: 0,
          },
        };

        jest
          .spyOn(mockPrismaService.establishment, 'create')
          .mockResolvedValue(mockEstablishment);

        const result = await service.createEstablishment(userId, createEstablishmentDto);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('ownerId', userId);
        expect(mockPrismaService.establishment.create).toHaveBeenCalledTimes(1);
      });

      it('should throw BadRequestException if creation fails', async () => {
        const userId = 'user-123';
        const createEstablishmentDto = {
          name: 'Bar',
          description: 'Test',
          category: 'bar',
          address: 'Address',
          phone: '+5511987654321',
          latitude: -23.5505,
          longitude: -46.6333,
        };

        jest
          .spyOn(mockPrismaService.establishment, 'create')
          .mockRejectedValue(new Error('Database error'));

        await expect(
          service.createEstablishment(userId, createEstablishmentDto),
        ).rejects.toThrow('Failed to create establishment');
      });
    });

    describe('listEstablishments', () => {
      it('should list all public establishments', async () => {
        const paginationDto = { page: 1, limit: 10 };
        const mockEstablishments = [
          {
            id: 'est-1',
            name: 'Bar 1',
            ownerId: 'user-1',
            owner: { id: 'user-1', name: 'User 1', avatar: null },
            rating: 4.5,
            _count: { reviews: 5, favorites: 10 },
            deletedAt: null,
          },
        ];

        jest
          .spyOn(mockPrismaService.establishment, 'findMany')
          .mockResolvedValue(mockEstablishments);
        jest.spyOn(mockPrismaService.establishment, 'count').mockResolvedValue(1);

        const result = await service.listEstablishments(paginationDto);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total', 1);
        expect(result).toHaveProperty('page', 1);
        expect(result.data).toHaveLength(1);
      });

      it('should filter establishments by location and category', async () => {
        const paginationDto = { page: 1, limit: 10 };
        const filters = {
          latitude: -23.5505,
          longitude: -46.6333,
          distance: 5,
          category: 'bar',
        };

        jest
          .spyOn(mockPrismaService.establishment, 'findMany')
          .mockResolvedValue([]);
        jest.spyOn(mockPrismaService.establishment, 'count').mockResolvedValue(0);

        await service.listEstablishments(paginationDto, filters);

        expect(mockPrismaService.establishment.findMany).toHaveBeenCalled();
        expect(mockPrismaService.establishment.count).toHaveBeenCalled();
      });
    });

    describe('getEstablishment', () => {
      it('should return establishment details', async () => {
        const establishmentId = 'est-123';
        const mockEstablishment = {
          id: establishmentId,
          name: 'Bar',
          ownerId: 'user-1',
          rating: 4.2,
          owner: { id: 'user-1', name: 'User 1', avatar: null },
          reviews: [],
          _count: { reviews: 0, favorites: 0 },
          deletedAt: null,
        };

        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue(mockEstablishment);

        const result = await service.getEstablishment(establishmentId);

        expect(result).toHaveProperty('id', establishmentId);
        expect(result).not.toHaveProperty('deletedAt');
      });

      it('should throw NotFoundException if not found', async () => {
        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue(null);

        await expect(service.getEstablishment('non-existent')).rejects.toThrow(
          'Establishment not found',
        );
      });
    });

    describe('updateEstablishment', () => {
      it('should update establishment', async () => {
        const establishmentId = 'est-123';
        const userId = 'user-1';
        const updateDto = {
          name: 'Bar Updated',
          category: 'lounge',
        };

        const mockEstablishment = {
          id: establishmentId,
          ownerId: userId,
          deletedAt: null,
        };

        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue(mockEstablishment);
        jest
          .spyOn(mockPrismaService.establishment, 'update')
          .mockResolvedValue({
            ...mockEstablishment,
            ...updateDto,
            owner: { id: userId, name: 'User', avatar: null },
            _count: { reviews: 0, favorites: 0 },
          } as any);

        const result = await service.updateEstablishment(
          establishmentId,
          userId,
          updateDto,
        );

        expect(result).toHaveProperty('id', establishmentId);
        expect(mockPrismaService.establishment.update).toHaveBeenCalledTimes(1);
      });

      it('should throw ForbiddenException if not owner', async () => {
        const establishmentId = 'est-123';
        const userId = 'other-user';
        const updateDto = { name: 'Bar Updated' };

        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue({
            id: establishmentId,
            ownerId: 'owner-123',
            deletedAt: null,
          });

        await expect(
          service.updateEstablishment(establishmentId, userId, updateDto),
        ).rejects.toThrow('Only owner can update');
      });
    });

    describe('favoriteEstablishment', () => {
      it('should add establishment to favorites', async () => {
        const establishmentId = 'est-123';
        const userId = 'user-456';

        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue({
            id: establishmentId,
            deletedAt: null,
          });

        const result = await service.favoriteEstablishment(establishmentId, userId);

        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('favoriteCount');
      });

      it('should throw error if already favorited', async () => {
        const establishmentId = 'est-123';
        const userId = 'user-456';

        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue({
            id: establishmentId,
            deletedAt: null,
          });
        jest
          .spyOn(mockPrismaService.establishment, 'findFirst')
          .mockResolvedValue({
            id: establishmentId,
          });

        await expect(
          service.favoriteEstablishment(establishmentId, userId),
        ).rejects.toThrow('Already favorited');
      });
    });

    describe('createReview', () => {
      it('should create a review for establishment', async () => {
        const establishmentId = 'est-123';
        const userId = 'user-456';
        const createReviewDto = {
          title: 'Great place!',
          content: 'Really nice atmosphere',
          rating: 5,
        };

        jest
          .spyOn(mockPrismaService.establishment, 'findUnique')
          .mockResolvedValue({
            id: establishmentId,
            deletedAt: null,
          });

        const mockReview = {
          id: 'review-123',
          ...createReviewDto,
          establishmentId,
          authorId: userId,
          author: {
            id: userId,
            name: 'User',
            avatar: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        jest
          .spyOn(mockPrismaService.review, 'create')
          .mockResolvedValue(mockReview);
        jest
          .spyOn(mockPrismaService.review, 'findMany')
          .mockResolvedValue([]);

        const result = await service.createReview(
          establishmentId,
          userId,
          createReviewDto,
        );

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('rating', 5);
      });
    });
  });

  describe('EstablishmentsController', () => {
    describe('POST /establishments', () => {
      it('should create an establishment', async () => {
        const createEstablishmentDto = {
          name: 'Bar',
          description: 'Test',
          category: 'bar',
          address: 'Address',
          phone: '+5511987654321',
          latitude: -23.5505,
          longitude: -46.6333,
        };

        const request = {
          user: { id: 'user-123' },
        };

        jest
          .spyOn(service, 'createEstablishment')
          .mockResolvedValue({ id: 'est-1' } as any);

        const result = await controller.createEstablishment(
          createEstablishmentDto,
          request,
        );

        expect(result).toHaveProperty('id');
        expect(service.createEstablishment).toHaveBeenCalledWith(
          'user-123',
          createEstablishmentDto,
        );
      });
    });

    describe('GET /establishments', () => {
      it('should list establishments', async () => {
        const paginationDto = { page: 1, limit: 10 };

        jest.spyOn(service, 'listEstablishments').mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        } as any);

        const result = await controller.listEstablishments(paginationDto);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total');
      });
    });

    describe('GET /establishments/:id', () => {
      it('should return establishment details', async () => {
        const establishmentId = 'est-123';

        jest
          .spyOn(service, 'getEstablishment')
          .mockResolvedValue({ id: establishmentId } as any);

        const result = await controller.getEstablishment(establishmentId);

        expect(result).toHaveProperty('id', establishmentId);
        expect(service.getEstablishment).toHaveBeenCalledWith(establishmentId);
      });
    });

    describe('POST /establishments/:id/favorite', () => {
      it('should add to favorites', async () => {
        const establishmentId = 'est-123';
        const request = { user: { id: 'user-456' } };

        jest
          .spyOn(service, 'favoriteEstablishment')
          .mockResolvedValue({
            message: 'Establishment favorited',
            favoriteCount: 1,
          } as any);

        const result = await controller.favoriteEstablishment(
          establishmentId,
          request,
        );

        expect(result).toHaveProperty('message');
        expect(service.favoriteEstablishment).toHaveBeenCalledWith(
          establishmentId,
          'user-456',
        );
      });
    });
  });
});
