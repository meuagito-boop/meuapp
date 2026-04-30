import { BadRequestException } from '@nestjs/common';
import { NotificationDeliveryStatus, PushPlatform, PushProvider } from '@prisma/client';
import { AuditLogService } from '@common/audit/audit-log.service';
import { NotificationService as PushNotificationService } from '@common/notification/notification.service';
import { ChatGateway } from '@modules/chat/chat.gateway';
import { PrismaService } from '@common/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const pushNotificationService = {
    registerDeviceToken: jest.fn(),
    sendToDevice: jest.fn(),
  } as unknown as PushNotificationService;

  const chatGateway = {
    notifyUser: jest.fn(),
  } as unknown as ChatGateway;

  const auditLogService = {
    record: jest.fn(),
  } as unknown as AuditLogService;

  const prismaService = {
    notification: {
      create: jest.fn(),
    },
    notificationDelivery: {
      create: jest.fn(),
    },
    pushToken: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(
      prismaService,
      pushNotificationService,
      chatGateway,
      auditLogService
    );
  });

  it('registers a push token and audits the operation', async () => {
    const lastValidatedAt = new Date('2026-04-29T07:00:00.000Z');

    (pushNotificationService.registerDeviceToken as jest.Mock).mockResolvedValue({
      success: true,
      endpointArn: 'arn:aws:sns:sa-east-1:123456789012:endpoint/GCM/app/device',
    });

    (prismaService.pushToken.upsert as jest.Mock).mockResolvedValue({
      id: 'push-token-1',
      platform: PushPlatform.ANDROID,
      provider: PushProvider.SNS,
      endpointArn: 'arn:aws:sns:sa-east-1:123456789012:endpoint/GCM/app/device',
      isActive: true,
      lastValidatedAt,
    });

    const result = await service.registerPushToken({
      userId: 'user-1',
      deviceToken: 'native-token-1',
      platform: PushPlatform.ANDROID,
    });

    expect(result).toEqual({
      id: 'push-token-1',
      platform: PushPlatform.ANDROID,
      provider: PushProvider.SNS,
      endpointArn: 'arn:aws:sns:sa-east-1:123456789012:endpoint/GCM/app/device',
      isActive: true,
      lastValidatedAt,
    });

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'push_token.register',
        entity: 'PushToken',
        entityId: 'push-token-1',
      })
    );
  });

  it('rejects test push when the user has no active token', async () => {
    (prismaService.pushToken.findMany as jest.Mock).mockResolvedValue([]);

    await expect(service.sendTestPush('user-1', 'Titulo', 'Corpo')).rejects.toThrow(
      BadRequestException
    );
  });

  it('disables invalid push tokens after terminal delivery failure', async () => {
    const token = {
      id: 'push-token-1',
      userId: 'user-1',
      endpointArn: 'arn:aws:sns:sa-east-1:123456789012:endpoint/GCM/app/device',
      isActive: true,
    };

    (prismaService.pushToken.findMany as jest.Mock)
      .mockResolvedValueOnce([token])
      .mockResolvedValueOnce([token]);

    (prismaService.notification.create as jest.Mock).mockResolvedValue({
      id: 'notification-1',
      type: 'system',
      title: 'Teste',
      body: 'Mensagem',
      entityType: 'push-test',
      entityId: null,
      payload: { scope: 'manual-test' },
      isRead: false,
      createdAt: new Date('2026-04-29T07:05:00.000Z'),
      readAt: null,
      relatedUserId: null,
      relatedPostId: null,
    });

    (pushNotificationService.sendToDevice as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Endpoint is disabled',
    });

    const result = await service.sendTestPush('user-1', 'Teste', 'Mensagem');

    expect(result).toEqual({
      notificationId: 'notification-1',
      attempted: 1,
      sent: 0,
      failed: 0,
      disabled: 1,
    });

    expect(prismaService.notificationDelivery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: NotificationDeliveryStatus.DISABLED,
          errorMessage: 'Endpoint is disabled',
        }),
      })
    );

    expect(prismaService.pushToken.update).toHaveBeenCalledWith({
      where: { id: 'push-token-1' },
      data: {
        isActive: false,
        lastError: 'Endpoint is disabled',
      },
    });
  });
});
