import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Cache Module - Application-wide caching
 *
 * Provides centralized caching using in-memory cache
 * Can be extended to support Redis via environment variables
 *
 * Exports:
 * - CacheService: Application cache operations
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModuleNest {}
