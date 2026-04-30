import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditModule } from '@common/audit/audit.module';
import { CacheModuleNest } from '@common/cache/cache.module';
import { NotificationModule } from '@common/notification/notification.module';
import { EmailModule } from '@common/email/email.module';
import { RateLimitModule } from '@common/rate-limit/rate-limit.module';
import { RedisThrottlerStorage } from '@common/rate-limit/redis-throttler.storage';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { FeedModule } from '@modules/feed/feed.module';
import { SearchModule } from '@modules/search/search.module';
import { EventsModule } from '@modules/events/events.module';
import { EstablishmentsModule } from '@modules/establishments/establishments.module';
import { ChatModule } from '@modules/chat/chat.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { LegalModule } from '@modules/legal/legal.module';
import { MediaModule } from '@modules/media/media.module';
import { ProductsModule } from '@modules/products/products.module';
import { validateEnvironment } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? ['.env.test', '.env'] : '.env',
      validate: validateEnvironment,
    }),
    RateLimitModule,
    ThrottlerModule.forRootAsync({
      imports: [RateLimitModule],
      inject: [ConfigService, RedisThrottlerStorage],
      useFactory: (configService: ConfigService, storage: RedisThrottlerStorage) => {
        const ttl = parseInt(configService.get<string>('RATE_LIMIT_TTL_MS') || '60000', 10);
        const limit = parseInt(configService.get<string>('RATE_LIMIT_LIMIT') || '120', 10);
        const blockDuration = parseInt(
          configService.get<string>('RATE_LIMIT_BLOCK_MS') || String(ttl),
          10
        );

        return {
          storage,
          throttlers: [
            {
              name: 'default',
              ttl,
              limit,
              blockDuration,
            },
          ],
        };
      },
    }),
    AuditModule,
    CacheModuleNest,
    NotificationModule,
    EmailModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FeedModule,
    SearchModule,
    EventsModule,
    EstablishmentsModule,
    ChatModule,
    NotificationsModule,
    LegalModule,
    MediaModule,
    ProductsModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
