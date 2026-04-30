import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MediaModule } from '@modules/media/media.module';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

@Module({
  imports: [MediaModule],
  providers: [EventsService, PrismaService, ResourceOwnerGuard],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
