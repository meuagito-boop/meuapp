import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { AuditLogService } from '@common/audit/audit-log.service';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  async listEstablishmentProducts(establishmentId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
        isPublic: true,
      },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    if (!establishment.isPublic) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        establishmentId,
        status: ProductStatus.ACTIVE,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return products.map((product) => this.sanitizeProduct(product));
  }

  async getPublicProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            isPublic: true,
            isDeleted: true,
            deletedAt: true,
          },
        },
      },
    });

    if (
      !product ||
      product.status !== ProductStatus.ACTIVE ||
      product.establishment.isDeleted ||
      product.establishment.deletedAt ||
      !product.establishment.isPublic
    ) {
      throw new NotFoundException('Product not found');
    }

    return this.sanitizeProduct(product);
  }

  async createProduct(establishmentId: string, userId: string, createProductDto: CreateProductDto) {
    await this.assertEstablishmentOwner(establishmentId, userId);

    try {
      const product = await this.prisma.product.create({
        data: {
          establishmentId,
          name: createProductDto.name,
          description: createProductDto.description,
          category: createProductDto.category,
          price: createProductDto.price,
          status: createProductDto.status ?? ProductStatus.ACTIVE,
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'product.create',
        entity: 'Product',
        entityId: product.id,
        changes: {
          establishmentId,
          category: product.category,
          status: product.status,
          price: product.price,
        },
      });

      return this.sanitizeProduct(product);
    } catch (error) {
      throw new BadRequestException('Failed to create product');
    }
  }

  async updateProduct(
    establishmentId: string,
    productId: string,
    userId: string,
    updateProductDto: UpdateProductDto
  ) {
    await this.assertEstablishmentOwner(establishmentId, userId);

    const product = await this.assertProductOwnership(establishmentId, productId);

    try {
      const updated = await this.prisma.product.update({
        where: { id: product.id },
        data: {
          name: updateProductDto.name ?? product.name,
          description: updateProductDto.description ?? product.description,
          category: updateProductDto.category ?? product.category,
          price: updateProductDto.price ?? product.price ?? undefined,
          status: updateProductDto.status ?? product.status,
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'product.update',
        entity: 'Product',
        entityId: updated.id,
        changes: {
          establishmentId,
          category: updated.category,
          status: updated.status,
          price: updated.price,
        },
      });

      return this.sanitizeProduct(updated);
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  async deleteProduct(establishmentId: string, productId: string, userId: string) {
    await this.assertEstablishmentOwner(establishmentId, userId);

    const product = await this.assertProductOwnership(establishmentId, productId);

    await this.prisma.product.update({
      where: { id: product.id },
      data: { status: ProductStatus.INACTIVE },
    });

    await this.auditLogService?.record({
      userId,
      action: 'product.archive',
      entity: 'Product',
      entityId: product.id,
      changes: {
        establishmentId,
        status: ProductStatus.INACTIVE,
      },
    });

    return { message: 'Product archived successfully' };
  }

  async registerProductMainImage(
    establishmentId: string,
    productId: string,
    userId: string,
    publicUrl: string
  ) {
    await this.assertEstablishmentOwner(establishmentId, userId);
    await this.assertProductOwnership(establishmentId, productId);

    await this.prisma.product.update({
      where: { id: productId },
      data: { mainImageUrl: publicUrl },
    });

    await this.auditLogService?.record({
      userId,
      action: 'product.image.register',
      entity: 'Product',
      entityId: productId,
      changes: {
        establishmentId,
        hasImage: true,
      },
    });
  }

  private async assertProductOwnership(establishmentId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.establishmentId !== establishmentId) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async assertEstablishmentOwner(establishmentId: string, userId: string) {
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: {
        id: true,
        ownerId: true,
        isDeleted: true,
        deletedAt: true,
      },
    });

    if (!establishment || establishment.isDeleted || establishment.deletedAt) {
      throw new NotFoundException('Establishment not found');
    }

    if (establishment.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission for this establishment');
    }

    return establishment;
  }

  private sanitizeProduct(product: Record<string, unknown>) {
    return {
      ...product,
      imageUrl: product.mainImageUrl ?? null,
    };
  }
}
