import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { logStructured } from '@common/logging/structured-log';
import { isProductionDeployment } from '@config/deploy-env';

/**
 * Cache Service - Production-grade caching abstraction
 *
 * Provides high-level caching methods using Redis backend
 * Supports TTL, pattern-based invalidation, and memory fallback
 *
 * Cache Keys Convention:
 * - `post:{id}` - Individual post
 * - `posts:feed:{userId}:{page}:{limit}:{sortBy}` - User's feed
 * - `posts:explore:{page}:{limit}` - Public explore feed
 * - `user:{id}:stats` - User statistics
 * - `user:{id}:profile` - User profile
 * - `user:{id}:followers:{page}:{limit}` - Followers list
 * - `user:{id}:following:{page}:{limit}` - Following list
 * - `user:{id}:posts:{page}:{limit}` - User posts
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private redis!: Redis;
  private fallbackCache = new Map<string, { value: any; expiresAt: number }>();
  private isRedisConnected = false;
  private redisEnabled = true;
  private readonly isProductionDeployment = isProductionDeployment(
    process.env.NODE_ENV,
    process.env.DEPLOY_ENV
  );

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  async onModuleInit() {
    const redisFlag = (process.env.ENABLE_REDIS || 'false').toLowerCase();
    this.redisEnabled = redisFlag === 'true' || redisFlag === '1';

    if (!this.redisEnabled) {
      if (this.isProductionDeployment) {
        throw new Error(
          'ENABLE_REDIS=true is required in production deployment for cache/realtime consistency.'
        );
      }
      logStructured('info', 'cache.redis.disabled', {
        reason: 'ENABLE_REDIS=false',
      });
      return;
    }

    try {
      // Initialize Redis connection
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 10) {
            logStructured('warn', 'cache.redis.retry.exceeded', {
              retryCount: times,
            });
            return null;
          }
          return Math.min(times * 50, 2000);
        },
        enableReadyCheck: true,
        enableOfflineQueue: true,
        maxRetriesPerRequest: null,
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        logStructured('info', 'cache.redis.connected', {
          mode: 'redis',
        });
      });

      this.redis.on('error', (err) => {
        this.isRedisConnected = false;
        logStructured('warn', 'cache.redis.connection_error', {
          errorMessage: err.message,
          mode: 'memory_fallback',
        });
      });

      // Test connection
      await this.redis.ping();
      this.isRedisConnected = true;
    } catch (error) {
      if (this.isProductionDeployment) {
        throw new Error(
          `Redis is required in production deployment when ENABLE_REDIS=true: ${this.getErrorMessage(error)}`
        );
      }
      logStructured('warn', 'cache.redis.init_failed', {
        errorMessage: this.getErrorMessage(error),
        mode: 'memory_fallback',
      });
      this.isRedisConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        logStructured('warn', 'cache.redis.quit_failed', {
          errorMessage: this.getErrorMessage(error),
        });
      }
    }
    this.fallbackCache.clear();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      if (this.isRedisConnected && this.redis) {
        const value = await this.redis.get(key);
        if (!value) return undefined;
        return JSON.parse(value);
      }
    } catch (error) {
      logStructured('warn', 'cache.redis.get_failed', {
        key,
        errorMessage: this.getErrorMessage(error),
      });
    }

    if (!this.shouldUseMemoryFallback()) {
      return undefined;
    }

    // Fallback to memory cache
    const entry = this.fallbackCache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
      this.fallbackCache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds || parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
        return;
      }
    } catch (error) {
      logStructured('warn', 'cache.redis.set_failed', {
        key,
        errorMessage: this.getErrorMessage(error),
      });
    }

    if (!this.shouldUseMemoryFallback()) {
      return;
    }

    // Fallback to memory cache
    const expiresAt = Date.now() + ttl * 1000;
    this.fallbackCache.set(key, { value, expiresAt });
  }

  /**
   * Delete single key from cache
   */
  async del(key: string): Promise<number> {
    try {
      if (this.isRedisConnected && this.redis) {
        return await this.redis.del(key);
      }
    } catch (error) {
      logStructured('warn', 'cache.redis.del_failed', {
        key,
        errorMessage: this.getErrorMessage(error),
      });
    }

    if (!this.shouldUseMemoryFallback()) {
      return 0;
    }

    // Fallback to memory cache
    const exists = this.fallbackCache.has(key);
    if (exists) {
      this.fallbackCache.delete(key);
      return 1;
    }
    return 0;
  }

  /**
   * Delete multiple keys from cache by pattern
   * Pattern uses wildcard: e.g., "post:123:comments:*"
   */
  async delMany(pattern: string): Promise<number> {
    try {
      if (this.isRedisConnected && this.redis) {
        // Use SCAN to find keys matching pattern (safe for large databases)
        const keys: string[] = [];
        let cursor = '0';

        // Convert wildcard pattern to glob for SCAN
        const scanPattern = pattern;

        do {
          const [newCursor, scannedKeys] = await this.redis.scan(
            cursor,
            'MATCH',
            scanPattern,
            'COUNT',
            '100'
          );
          cursor = newCursor;
          keys.push(...scannedKeys);
        } while (cursor !== '0');

        if (keys.length > 0) {
          return await this.redis.del(...keys);
        }
        return 0;
      }
    } catch (error) {
      logStructured('warn', 'cache.redis.del_many_failed', {
        pattern,
        errorMessage: this.getErrorMessage(error),
      });
    }

    if (!this.shouldUseMemoryFallback()) {
      return 0;
    }

    // Fallback to memory cache
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    let count = 0;

    for (const key of this.fallbackCache.keys()) {
      if (regex.test(key)) {
        this.fallbackCache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      if (this.isRedisConnected && this.redis) {
        await this.redis.flushdb();
        return;
      }
    } catch (error) {
      logStructured('warn', 'cache.redis.reset_failed', {
        errorMessage: this.getErrorMessage(error),
      });
    }

    if (this.shouldUseMemoryFallback()) {
      this.fallbackCache.clear();
    }
  }

  /**
   * Cache-aside pattern: Get or set pattern
   * Executes factory function if cache miss
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Cache miss - execute factory
    const value = await factory();

    // Store in cache
    await this.set(key, value, ttlSeconds);

    return value;
  }

  /**
   * Invalidate all posts cache
   * Used when creating posts, modifying posts, or liking posts
   */
  async invalidatePostsCache(): Promise<void> {
    // Clear posts feed cache for all users
    await this.delMany('posts:feed:*');
    await this.delMany('posts:agito:*');
    // Clear explore cache
    await this.delMany('posts:explore:*');
    // Clear individual post cache
    await this.delMany('post:*');
    // Clear user posts cache
    await this.delMany('user:*:posts:*');
  }

  /**
   * Invalidate user stats cache
   * Used when follow/unfollow operations occur
   */
  async invalidateUserStats(userId: string): Promise<void> {
    await this.del(`user:${userId}:stats`);
  }

  /**
   * Invalidate follow relationship caches
   * Used when follow/unfollow operations occur
   */
  async invalidateFollowCache(userId: string, targetUserId: string): Promise<void> {
    // Clear followers caches (both users are affected)
    await this.delMany(`user:${userId}:followers:*`);
    await this.delMany(`user:${targetUserId}:followers:*`);
    // Clear following caches (both users are affected)
    await this.delMany(`user:${userId}:following:*`);
    await this.delMany(`user:${targetUserId}:following:*`);
  }

  /**
   * Get cache health status
   */
  getStatus(): { connected: boolean; type: 'redis' | 'memory' } {
    return {
      connected: this.isRedisConnected,
      type: this.isRedisConnected ? 'redis' : 'memory',
    };
  }

  private shouldUseMemoryFallback(): boolean {
    return !this.isProductionDeployment;
  }
}
