import { ConfigService } from '@nestjs/config';
import { CacheService } from '@common/cache/cache.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { StorageHealthStatus, StorageService } from '@modules/media/storage.service';
import { HealthService } from './health.service';

type HealthServiceOptions = {
  databaseError?: Error;
  cacheConnected?: boolean;
  config?: Record<string, string>;
  storage?: StorageHealthStatus;
};

function createHealthService(options: HealthServiceOptions = {}) {
  const prismaService = {
    $queryRaw: jest.fn(),
  };

  if (options.databaseError) {
    prismaService.$queryRaw.mockRejectedValue(options.databaseError);
  } else {
    prismaService.$queryRaw.mockResolvedValue([{ ok: 1 }]);
  }

  const cacheService = {
    getStatus: jest.fn(() => ({
      connected: options.cacheConnected ?? false,
      type: options.cacheConnected ? 'redis' : 'memory',
    })),
  };

  const config = options.config ?? {};
  const configService = {
    get: jest.fn((key: string) => config[key]),
  };

  const storageService = {
    getHealthStatus: jest.fn(
      async () =>
        options.storage ?? {
          provider: 'local',
          status: 'ok',
          configured: true,
          verified: true,
        }
    ),
  };

  return new HealthService(
    prismaService as unknown as PrismaService,
    cacheService as unknown as CacheService,
    configService as unknown as ConfigService,
    storageService as unknown as StorageService
  );
}

describe('HealthService', () => {
  it('returns ok when database is connected and optional dependencies are healthy or disabled', async () => {
    const service = createHealthService();

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.database).toMatchObject({ status: 'ok', connected: true });
    expect(result.cache).toMatchObject({ status: 'disabled', connected: false, required: false });
    expect(result.storage).toMatchObject({ provider: 'local', status: 'ok' });
  });

  it('returns error when Redis is required but disconnected', async () => {
    const service = createHealthService({
      config: {
        ENABLE_REDIS: 'true',
      },
      cacheConnected: false,
    });

    const result = await service.getHealth();

    expect(result.status).toBe('error');
    expect(result.cache).toMatchObject({ status: 'error', required: true });
  });

  it('returns error when storage health fails', async () => {
    const service = createHealthService({
      storage: {
        provider: 's3',
        status: 'error',
        configured: false,
        verified: false,
        error: 'Missing S3 bucket or region',
      },
    });

    const result = await service.getHealth();

    expect(result.status).toBe('error');
    expect(result.storage).toMatchObject({
      provider: 's3',
      status: 'error',
      error: 'Missing S3 bucket or region',
    });
  });

  it('redacts dependency error details in production', async () => {
    const service = createHealthService({
      databaseError: new Error('password authentication failed for user meuagito'),
      config: {
        NODE_ENV: 'production',
      },
      storage: {
        provider: 's3',
        status: 'error',
        configured: true,
        verified: true,
        error: 'AccessDenied: secret bucket details',
      },
    });

    const result = await service.getHealth();

    expect(result.status).toBe('error');
    expect(result.database.error).toBe('Health dependency check failed');
    expect(result.storage.error).toBe('Health dependency check failed');
  });
});
