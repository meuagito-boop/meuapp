import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheModuleNest } from '@common/cache/cache.module';
import { MediaModule } from '@modules/media/media.module';

@Module({
  imports: [CacheModuleNest, MediaModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaService],
})
export class HealthModule {}
