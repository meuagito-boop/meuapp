import { Module } from '@nestjs/common';
import { NotificationModule } from '@common/notification/notification.module';
import { PrismaService } from '@common/prisma/prisma.service';
import { ChatModule } from '@modules/chat/chat.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [NotificationModule, ChatModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
