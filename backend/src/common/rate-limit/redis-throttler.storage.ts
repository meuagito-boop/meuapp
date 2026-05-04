import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import Redis from 'ioredis';
import { logStructured } from '@common/logging/structured-log';
import { isProductionDeployment } from '@config/deploy-env';

type ThrottlerIncrementResult = Awaited<ReturnType<ThrottlerStorage['increment']>>;

const THROTTLER_INCREMENT_SCRIPT = `
local windowKey = KEYS[1]
local blockKey = KEYS[2]

local now = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local blockDuration = tonumber(ARGV[4])
local member = ARGV[5]

local function currentWindowTtl()
  local oldest = redis.call('ZRANGE', windowKey, 0, 0, 'WITHSCORES')
  if oldest[2] then
    return math.max(0, ttl - (now - tonumber(oldest[2])))
  end
  return 0
end

redis.call('ZREMRANGEBYSCORE', windowKey, 0, now - ttl)

local blockedTtl = redis.call('PTTL', blockKey)
if blockedTtl > 0 then
  return { redis.call('ZCARD', windowKey), currentWindowTtl(), 1, blockedTtl }
end

redis.call('ZADD', windowKey, now, member)
redis.call('PEXPIRE', windowKey, ttl)

local totalHits = redis.call('ZCARD', windowKey)
local timeToExpire = currentWindowTtl()

if totalHits > limit then
  redis.call('SET', blockKey, '1', 'PX', blockDuration)
  return { totalHits, timeToExpire, 1, blockDuration }
end

return { totalHits, timeToExpire, 0, 0 }
`;

function parseBoolean(value: string | undefined, fallback: boolean = false): boolean {
  if (!value) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleInit, OnModuleDestroy {
  private readonly memoryStorage = new ThrottlerStorageService();
  private redis: Redis | null = null;
  private redisEnabled = false;
  private redisConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    const deployEnv = this.configService.get<string>('DEPLOY_ENV');
    const productionDeployment = isProductionDeployment(nodeEnv, deployEnv);
    this.redisEnabled = parseBoolean(this.configService.get<string>('ENABLE_REDIS'), false);

    if (!this.redisEnabled) {
      if (productionDeployment) {
        throw new Error(
          'ENABLE_REDIS=true is required in production deployment for distributed throttling.'
        );
      }

      logStructured('info', 'rate_limit.redis.disabled', {
        environment: nodeEnv,
        mode: 'memory_fallback',
      });
      return;
    }

    try {
      const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 10) {
            logStructured('warn', 'rate_limit.redis.retry.exceeded', {
              retryCount: times,
            });
            return null;
          }

          return Math.min(times * 50, 2000);
        },
        enableReadyCheck: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
      });

      this.redis.on('connect', () => {
        this.redisConnected = true;
        logStructured('info', 'rate_limit.redis.connected', {
          mode: 'redis',
        });
      });

      this.redis.on('error', (error) => {
        this.redisConnected = false;
        logStructured('warn', 'rate_limit.redis.connection_error', {
          errorMessage: error.message,
          mode: productionDeployment ? 'error' : 'memory_fallback',
        });
      });

      await this.redis.ping();
      this.redisConnected = true;
    } catch (error) {
      this.redisConnected = false;

      const errorMessage = error instanceof Error ? error.message : String(error);
      if (productionDeployment) {
        throw new Error(
          `Redis is required in production deployment for distributed throttling: ${errorMessage}`
        );
      }

      logStructured('warn', 'rate_limit.redis.init_failed', {
        errorMessage,
        mode: 'memory_fallback',
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        logStructured('warn', 'rate_limit.redis.quit_failed', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.memoryStorage.onApplicationShutdown();
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerIncrementResult> {
    if (this.redisConnected && this.redis) {
      return this.incrementInRedis(key, ttl, limit, blockDuration, throttlerName);
    }

    if (this.isProductionMode()) {
      throw new Error(
        'Distributed throttling requires an active Redis connection in production deployment.'
      );
    }

    return this.memoryStorage.increment(key, ttl, limit, blockDuration, throttlerName);
  }

  private async incrementInRedis(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string
  ): Promise<ThrottlerIncrementResult> {
    const redis = this.redis;
    if (!redis) {
      throw new Error('Redis client is not initialized for throttling.');
    }

    const now = Date.now();
    const memberId = `${now}-${Math.random().toString(36).slice(2, 10)}`;
    const windowKey = `throttle:${throttlerName}:${key}:window`;
    const blockKey = `throttle:${throttlerName}:${key}:block`;

    const result = (await redis.eval(
      THROTTLER_INCREMENT_SCRIPT,
      2,
      windowKey,
      blockKey,
      now.toString(),
      ttl.toString(),
      limit.toString(),
      blockDuration.toString(),
      memberId
    )) as Array<number | string>;

    const totalHits = Number(result[0] ?? 0);
    const timeToExpireMs = Number(result[1] ?? 0);
    const isBlocked = Number(result[2] ?? 0) === 1;
    const timeToBlockExpireMs = Number(result[3] ?? 0);

    return {
      totalHits,
      timeToExpire: Math.max(0, Math.ceil(timeToExpireMs / 1000)),
      isBlocked,
      timeToBlockExpire: Math.max(0, Math.ceil(timeToBlockExpireMs / 1000)),
    };
  }

  private isProductionMode(): boolean {
    return isProductionDeployment(
      this.configService.get<string>('NODE_ENV'),
      this.configService.get<string>('DEPLOY_ENV')
    );
  }
}
