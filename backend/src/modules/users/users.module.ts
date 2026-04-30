import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MediaModule } from '@modules/media/media.module';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

@Module({
  imports: [MediaModule],
  providers: [UsersService, PrismaService, ResourceOwnerGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
