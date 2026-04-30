import { ConfigService } from '@nestjs/config';
import { RedisThrottlerStorage } from './redis-throttler.storage';

function createConfigService(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('RedisThrottlerStorage', () => {
  it('should fallback to memory in test mode when redis is disabled', async () => {
    const storage = new RedisThrottlerStorage(
      createConfigService({
        NODE_ENV: 'test',
        ENABLE_REDIS: 'false',
      })
    );

    await storage.onModuleInit();

    const first = await storage.increment('tracker', 60_000, 2, 60_000, 'default');
    const second = await storage.increment('tracker', 60_000, 2, 60_000, 'default');

    expect(first.totalHits).toBe(1);
    expect(second.totalHits).toBe(2);

    await storage.onModuleDestroy();
  });

  it('should fail in production when redis is disabled', async () => {
    const storage = new RedisThrottlerStorage(
      createConfigService({
        NODE_ENV: 'production',
        ENABLE_REDIS: 'false',
      })
    );

    await expect(storage.onModuleInit()).rejects.toThrow(
      'ENABLE_REDIS=true is required in production for distributed throttling.'
    );
  });
});
