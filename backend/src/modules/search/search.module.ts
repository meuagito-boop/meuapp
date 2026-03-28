import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [SearchService, PrismaService, UsersService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
