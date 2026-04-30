import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RequestContextModule } from '@common/request-context/request-context.module';
import { AuditLogService } from './audit-log.service';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [PrismaService, AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
