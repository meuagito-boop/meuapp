import { Module } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { MediaModule } from '@modules/media/media.module';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [MediaModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, ResourceOwnerGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
