import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheModuleNest } from '@common/cache/cache.module';
import { NotificationModule } from '@common/notification/notification.module';
import { EmailModule } from '@common/email/email.module';
import { HealthModule } from '@modules/health/health.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { FeedModule } from '@modules/feed/feed.module';
import { SearchModule } from '@modules/search/search.module';
import { EventsModule } from '@modules/events/events.module';
import { EstablishmentsModule } from '@modules/establishments/establishments.module';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModuleNest,
    NotificationModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FeedModule,
    SearchModule,
    EventsModule,
    EstablishmentsModule,
    ChatModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
