import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';
import { logStructured } from '@common/logging/structured-log';
import { isProductionDeployment } from '@config/deploy-env';

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export class RedisIoAdapter extends IoAdapter {
  private readonly configService: ConfigService;
  private readonly isProductionDeployment: boolean;
  private publisherClient: Redis | null = null;
  private subscriberClient: Redis | null = null;
  private redisAdapter: ReturnType<typeof createAdapter> | null = null;

  constructor(app: INestApplicationContext) {
    super(app);
    this.configService = app.get(ConfigService);
    this.isProductionDeployment = isProductionDeployment(
      this.configService.get<string>('NODE_ENV'),
      this.configService.get<string>('DEPLOY_ENV')
    );
  }

  async connectToRedis(): Promise<void> {
    const redisEnabled = parseBoolean(this.configService.get<string>('ENABLE_REDIS'), false);
    if (!redisEnabled) {
      if (this.isProductionDeployment) {
        throw new Error(
          'ENABLE_REDIS=true is required in production deployment for Socket.IO clustering'
        );
      }

      logStructured('info', 'socket.redis_adapter.disabled', {
        reason: 'ENABLE_REDIS=false',
      });
      return;
    }

    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    try {
      this.publisherClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 10) {
            return null;
          }

          return Math.min(times * 50, 2000);
        },
        enableReadyCheck: true,
        enableOfflineQueue: true,
        maxRetriesPerRequest: null,
      });
      this.subscriberClient = this.publisherClient.duplicate();

      await Promise.all([this.publisherClient.ping(), this.subscriberClient.ping()]);
      this.redisAdapter = createAdapter(this.publisherClient, this.subscriberClient);

      logStructured('info', 'socket.redis_adapter.connected', {
        mode: 'redis',
      });
    } catch (error) {
      await this.close();

      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.isProductionDeployment) {
        throw new Error(
          `Socket.IO Redis adapter is required in production deployment: ${errorMessage}`
        );
      }

      logStructured('warn', 'socket.redis_adapter.init_failed', {
        errorMessage,
        mode: 'in_memory',
      });
    }
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);

    if (this.redisAdapter) {
      server.adapter(this.redisAdapter);
    }

    return server;
  }

  async close(): Promise<void> {
    await Promise.allSettled([this.publisherClient?.quit(), this.subscriberClient?.quit()]);

    this.publisherClient = null;
    this.subscriberClient = null;
    this.redisAdapter = null;
  }
}
