import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [FeedService, PrismaService, UsersService],
  controllers: [FeedController],
  exports: [FeedService],
})
export class FeedModule {}
