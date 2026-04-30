import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { AgitoFeedController } from './agito-feed.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MediaModule } from '@modules/media/media.module';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

@Module({
  imports: [MediaModule],
  providers: [FeedService, PrismaService, UsersService, ResourceOwnerGuard],
  controllers: [FeedController, AgitoFeedController],
  exports: [FeedService],
})
export class FeedModule {}
