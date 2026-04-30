import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheService } from '@common/cache/cache.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  async getHealth() {
    const memory = process.memoryUsage();
    const cache = this.cacheService.getStatus();

    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        cache,
        uptimeSeconds: Math.round(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: memory.rss,
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        cache,
        uptimeSeconds: Math.round(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: memory.rss,
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal,
        },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
