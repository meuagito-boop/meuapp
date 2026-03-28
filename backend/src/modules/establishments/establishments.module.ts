import { Module } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { EstablishmentsController } from './establishments.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  providers: [EstablishmentsService, PrismaService],
  controllers: [EstablishmentsController],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}
