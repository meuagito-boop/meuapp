import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheService } from '@common/cache/cache.service';
import { StorageService, StorageHealthStatus } from '@modules/media/storage.service';

type HealthComponentStatus = 'ok' | 'error' | 'disabled';

type DatabaseHealth = {
  status: 'ok' | 'error';
  connected: boolean;
  error?: string;
};

type CacheHealth = {
  status: HealthComponentStatus;
  connected: boolean;
  type: 'redis' | 'memory';
  required: boolean;
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService
  ) {}

  async getHealth() {
    const memory = process.memoryUsage();
    const [database, storage] = await Promise.all([
      this.checkDatabase(),
      this.storageService.getHealthStatus(),
    ]);
    const cache = this.getCacheHealth();
    const status = this.resolveOverallStatus(database, cache, storage);

    return {
      status,
      timestamp: new Date().toISOString(),
      database,
      cache,
      storage: this.sanitizeStorageHealth(storage),
      uptimeSeconds: Math.round(process.uptime()),
      environment: this.getEnvironment(),
      memory: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
      },
    };
  }

  private async checkDatabase(): Promise<DatabaseHealth> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        connected: true,
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: this.formatError(error),
      };
    }
  }

  private getCacheHealth(): CacheHealth {
    const cache = this.cacheService.getStatus();
    const required =
      this.isProduction() || parseBoolean(this.configService.get<string>('ENABLE_REDIS'), false);

    return {
      ...cache,
      required,
      status: cache.connected ? 'ok' : required ? 'error' : 'disabled',
    };
  }

  private resolveOverallStatus(
    database: DatabaseHealth,
    cache: CacheHealth,
    storage: StorageHealthStatus
  ): 'ok' | 'error' {
    return database.status === 'error' || cache.status === 'error' || storage.status === 'error'
      ? 'error'
      : 'ok';
  }

  private sanitizeStorageHealth(storage: StorageHealthStatus): StorageHealthStatus {
    if (storage.status !== 'error') {
      return storage;
    }

    return {
      ...storage,
      error: this.formatError(storage.error),
    };
  }

  private formatError(error: unknown): string {
    if (this.isProduction()) {
      return 'Health dependency check failed';
    }

    return error instanceof Error ? error.message : String(error);
  }

  private isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  private getEnvironment(): string {
    return this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV || 'development';
  }
}
