import { Module } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { EstablishmentsController } from './establishments.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MediaModule } from '@modules/media/media.module';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

@Module({
  imports: [MediaModule],
  providers: [EstablishmentsService, PrismaService, ResourceOwnerGuard],
  controllers: [EstablishmentsController],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}
