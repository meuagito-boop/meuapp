import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheModuleNest } from '@common/cache/cache.module';

@Module({
  imports: [CacheModuleNest],
  controllers: [HealthController],
  providers: [HealthService, PrismaService],
})
export class HealthModule {}
