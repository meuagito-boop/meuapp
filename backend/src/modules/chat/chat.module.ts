import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MediaModule } from '@modules/media/media.module';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

@Module({
  imports: [
    MediaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [ChatService, ChatGateway, PrismaService, ResourceOwnerGuard],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
