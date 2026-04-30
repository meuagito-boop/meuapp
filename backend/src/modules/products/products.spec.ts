import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '@modules/media/media.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsModule', () => {
  let service: ProductsService;
  let controller: ProductsController;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    establishment: {
      findUnique: jest.fn(),
    },
  };

  const mockMediaService = {
    uploadProductMedia: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ProductsService', () => {
    it('should list only active public products for an establishment', async () => {
      jest.spyOn(mockPrismaService.establishment, 'findUnique').mockResolvedValue({
        id: 'est-1',
        isDeleted: false,
        deletedAt: null,
        isPublic: true,
      });
      jest.spyOn(mockPrismaService.product, 'findMany').mockResolvedValue([
        {
          id: 'prod-1',
          establishmentId: 'est-1',
          name: 'Combo',
          status: 'ACTIVE',
          mainImageUrl: null,
        },
      ]);

      const result = await service.listEstablishmentProducts('est-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('imageUrl', null);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            establishmentId: 'est-1',
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should return a public product with establishment context', async () => {
      jest.spyOn(mockPrismaService.product, 'findUnique').mockResolvedValue({
        id: 'prod-1',
        establishmentId: 'est-1',
        name: 'Produto',
        status: 'ACTIVE',
        mainImageUrl: 'https://cdn.example.com/produto.jpg',
        establishment: {
          id: 'est-1',
          name: 'Loja',
          isPublic: true,
          isDeleted: false,
          deletedAt: null,
        },
      });

      const result = await service.getPublicProduct('prod-1');

      expect(result).toHaveProperty('id', 'prod-1');
      expect(result).toHaveProperty('imageUrl', 'https://cdn.example.com/produto.jpg');
    });

    it('should create a product when the actor owns the establishment', async () => {
      jest.spyOn(mockPrismaService.establishment, 'findUnique').mockResolvedValue({
        id: 'est-1',
        ownerId: 'user-1',
        isDeleted: false,
        deletedAt: null,
      });
      jest.spyOn(mockPrismaService.product, 'create').mockResolvedValue({
        id: 'prod-1',
        establishmentId: 'est-1',
        name: 'Produto',
        category: 'Lanches',
        price: 29.9,
        status: 'ACTIVE',
        mainImageUrl: null,
      });

      const result = await service.createProduct('est-1', 'user-1', {
        name: 'Produto',
        category: 'Lanches',
        price: 29.9,
      });

      expect(result).toHaveProperty('id', 'prod-1');
      expect(mockPrismaService.product.create).toHaveBeenCalledTimes(1);
    });

    it('should archive a product instead of deleting it physically', async () => {
      jest.spyOn(mockPrismaService.establishment, 'findUnique').mockResolvedValue({
        id: 'est-1',
        ownerId: 'user-1',
        isDeleted: false,
        deletedAt: null,
      });
      jest.spyOn(mockPrismaService.product, 'findUnique').mockResolvedValue({
        id: 'prod-1',
        establishmentId: 'est-1',
      });
      jest.spyOn(mockPrismaService.product, 'update').mockResolvedValue({
        id: 'prod-1',
        status: 'INACTIVE',
      });

      const result = await service.deleteProduct('est-1', 'prod-1', 'user-1');

      expect(result).toEqual({ message: 'Product archived successfully' });
      expect(mockPrismaService.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'INACTIVE' },
        })
      );
    });
  });

  describe('ProductsController', () => {
    it('should delegate listing products to the service', async () => {
      jest.spyOn(service, 'listEstablishmentProducts').mockResolvedValue([] as any);

      await controller.listEstablishmentProducts('est-1');

      expect(service.listEstablishmentProducts).toHaveBeenCalledWith('est-1');
    });
  });
});
