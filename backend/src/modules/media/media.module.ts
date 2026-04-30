import { Module } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, StorageService, PrismaService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
