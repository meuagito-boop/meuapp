import { AuditLogService } from './audit-log.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RequestContextService } from '@common/request-context/request-context.service';

describe('AuditLogService', () => {
  it('should inherit ipAddress and userAgent from request context when not provided explicitly', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const prismaService = {
      auditLog: {
        create,
      },
    } as unknown as PrismaService;
    const requestContextService = new RequestContextService();
    const service = new AuditLogService(prismaService, requestContextService);

    await requestContextService.run(
      {
        requestId: 'req-1',
        ipAddress: '203.0.113.10',
        userAgent: 'MeuAgitoTest/1.0',
      },
      async () => {
        await service.record({
          userId: 'user-1',
          action: 'user.update',
          entity: 'User',
          entityId: 'user-1',
        });
      }
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ipAddress: '203.0.113.10',
          userAgent: 'MeuAgitoTest/1.0',
        }),
      })
    );
  });

  it('should keep explicit ipAddress and userAgent when provided', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const prismaService = {
      auditLog: {
        create,
      },
    } as unknown as PrismaService;
    const requestContextService = new RequestContextService();
    const service = new AuditLogService(prismaService, requestContextService);

    await requestContextService.run(
      {
        requestId: 'req-2',
        ipAddress: '203.0.113.10',
        userAgent: 'MeuAgitoTest/1.0',
      },
      async () => {
        await service.record({
          userId: 'user-1',
          action: 'user.update',
          entity: 'User',
          entityId: 'user-1',
          ipAddress: '198.51.100.20',
          userAgent: 'ExplicitAgent/2.0',
        });
      }
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ipAddress: '198.51.100.20',
          userAgent: 'ExplicitAgent/2.0',
        }),
      })
    );
  });
});
