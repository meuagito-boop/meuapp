import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AuditLogService } from '@common/audit/audit-log.service';
import { NotificationService as PushNotificationService } from '@common/notification/notification.service';
import { ChatGateway } from '@modules/chat/chat.gateway';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  Prisma,
  PushPlatform,
  PushProvider,
} from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { ListNotificationsQueryDto } from './dtos/list-notifications-query.dto';

type NotificationListItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  payload: unknown;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
  relatedUserId: string | null;
  relatedPostId: string | null;
};

type CreateNotificationOptions = {
  type?: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  relatedUserId?: string;
  relatedPostId?: string;
  sendPush?: boolean;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationService: PushNotificationService,
    @Optional() private readonly chatGateway?: ChatGateway,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  async listForUser(userId: string, query: ListNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(typeof query.isRead === 'boolean' ? { isRead: query.isRead } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: data.map((notification) => this.toListItem(notification)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string) {
    const total = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { total };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: notification.readAt ?? new Date(),
      },
    });

    await this.auditLogService?.record({
      userId,
      action: 'notification.read',
      entity: 'Notification',
      entityId: notificationId,
    });

    return this.toListItem(updated);
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await this.auditLogService?.record({
      userId,
      action: 'notification.read_all',
      entity: 'Notification',
      changes: {
        updatedCount: result.count,
      },
    });

    return {
      updated: result.count,
      message: 'Notifications marked as read',
    };
  }

  async deleteForUser(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    await this.auditLogService?.record({
      userId,
      action: 'notification.delete',
      entity: 'Notification',
      entityId: notificationId,
    });

    return { message: 'Notification deleted' };
  }

  async listPushTokens(userId: string) {
    const tokens = await this.prisma.pushToken.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        platform: true,
        provider: true,
        endpointArn: true,
        isActive: true,
        lastValidatedAt: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { data: tokens };
  }

  async registerPushToken(input: {
    userId: string;
    deviceToken: string;
    platform: PushPlatform;
    platformApplicationArn?: string;
  }) {
    const result = await this.pushNotificationService.registerDeviceToken(
      input.userId,
      input.deviceToken,
      input.platformApplicationArn,
      input.platform
    );

    if (!result.success || !result.endpointArn) {
      throw new BadRequestException(result.error || 'Failed to register push token');
    }

    const pushToken = await this.prisma.pushToken.upsert({
      where: {
        deviceToken: input.deviceToken,
      },
      update: {
        userId: input.userId,
        platform: input.platform,
        provider: PushProvider.SNS,
        endpointArn: result.endpointArn,
        isActive: true,
        lastValidatedAt: new Date(),
        lastError: null,
      },
      create: {
        userId: input.userId,
        deviceToken: input.deviceToken,
        platform: input.platform,
        provider: PushProvider.SNS,
        endpointArn: result.endpointArn,
        isActive: true,
        lastValidatedAt: new Date(),
      },
    });

    await this.auditLogService?.record({
      userId: input.userId,
      action: 'push_token.register',
      entity: 'PushToken',
      entityId: pushToken.id,
      changes: {
        platform: pushToken.platform,
        provider: pushToken.provider,
        isActive: pushToken.isActive,
      },
    });

    return {
      id: pushToken.id,
      platform: pushToken.platform,
      provider: pushToken.provider,
      endpointArn: pushToken.endpointArn,
      isActive: pushToken.isActive,
      lastValidatedAt: pushToken.lastValidatedAt,
    };
  }

  async removePushToken(userId: string, pushTokenId: string) {
    const pushToken = await this.prisma.pushToken.findFirst({
      where: {
        id: pushTokenId,
        userId,
      },
    });

    if (!pushToken) {
      throw new NotFoundException('Push token not found');
    }

    const updated = await this.prisma.pushToken.update({
      where: { id: pushTokenId },
      data: {
        isActive: false,
        lastError: null,
      },
    });

    await this.auditLogService?.record({
      userId,
      action: 'push_token.deactivate',
      entity: 'PushToken',
      entityId: pushTokenId,
      changes: {
        platform: updated.platform,
        provider: updated.provider,
        isActive: updated.isActive,
      },
    });

    return {
      message: 'Push token deactivated',
      id: updated.id,
      isActive: updated.isActive,
    };
  }

  async sendTestPush(userId: string, title: string, body: string) {
    const tokens = await this.prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
        endpointArn: {
          not: null,
        },
      },
    });

    if (tokens.length === 0) {
      throw new BadRequestException('No active push tokens available for this user');
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: 'system',
        title,
        body,
        entityType: 'push-test',
        payload: this.toJsonPayload({
          scope: 'manual-test',
        }),
      },
    });
    const listItem = this.toListItem(notification);
    this.emitRealtimeNotification(userId, listItem);

    const deliveryResult = await this.deliverPushNotification(
      notification.id,
      userId,
      title,
      body,
      {
        scope: 'manual-test',
      }
    );

    await this.auditLogService?.record({
      userId,
      action: 'push.test_send',
      entity: 'Notification',
      entityId: notification.id,
      changes: deliveryResult,
    });

    return {
      notificationId: notification.id,
      ...deliveryResult,
    };
  }

  async createSystemNotification(
    userId: string,
    title: string,
    body: string,
    options?: CreateNotificationOptions
  ) {
    const created = await this.prisma.notification.create({
      data: {
        userId,
        type: options?.type ?? 'system',
        title,
        body,
        entityType: options?.entityType,
        entityId: options?.entityId,
        payload: this.toJsonPayload(options?.payload),
        relatedUserId: options?.relatedUserId,
        relatedPostId: options?.relatedPostId,
      },
    });

    if (options?.sendPush) {
      await this.deliverPushNotification(created.id, userId, title, body, options.payload);
    }

    const listItem = this.toListItem(created);
    this.emitRealtimeNotification(userId, listItem);

    return listItem;
  }

  private async deliverPushNotification(
    notificationId: string,
    userId: string,
    title: string,
    body: string,
    payload?: Record<string, unknown>
  ) {
    const tokens = await this.prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
        endpointArn: {
          not: null,
        },
      },
    });

    if (tokens.length === 0) {
      await this.prisma.notificationDelivery.create({
        data: {
          notificationId,
          userId,
          channel: NotificationChannel.PUSH,
          provider: PushProvider.SNS,
          status: NotificationDeliveryStatus.DISABLED,
          errorMessage: 'No active push token available',
        },
      });

      return {
        attempted: 0,
        sent: 0,
        failed: 0,
        disabled: 1,
      };
    }

    const results = await Promise.all(
      tokens.map(async (token) => {
        const response = await this.pushNotificationService.sendToDevice(token.endpointArn!, {
          title,
          body,
          data: this.serializePayload(payload),
        });

        const disableToken = !response.success && this.shouldDisablePushToken(response.error);
        const status = response.success
          ? NotificationDeliveryStatus.SENT
          : disableToken
            ? NotificationDeliveryStatus.DISABLED
            : NotificationDeliveryStatus.FAILED;

        await this.prisma.notificationDelivery.create({
          data: {
            notificationId,
            userId,
            pushTokenId: token.id,
            channel: NotificationChannel.PUSH,
            provider: PushProvider.SNS,
            status,
            externalMessageId: response.messageId,
            errorMessage: response.error,
            deliveredAt: response.success ? new Date() : null,
            failedAt: response.success ? null : new Date(),
          },
        });

        if (response.success) {
          await this.prisma.pushToken.update({
            where: { id: token.id },
            data: {
              lastValidatedAt: new Date(),
              lastError: null,
            },
          });
        } else {
          await this.prisma.pushToken.update({
            where: { id: token.id },
            data: {
              ...(disableToken ? { isActive: false } : {}),
              lastError: response.error ?? 'Push delivery failed',
            },
          });
        }

        return {
          success: response.success,
          disabled: disableToken,
        };
      })
    );

    const sent = results.filter((result) => result.success).length;
    const disabled = results.filter((result) => result.disabled).length;
    const failed = results.length - sent - disabled;

    return {
      attempted: results.length,
      sent,
      failed,
      disabled,
    };
  }

  private shouldDisablePushToken(errorMessage?: string | null) {
    if (!errorMessage) {
      return false;
    }

    const normalized = errorMessage.toLowerCase();
    const terminalPatterns = [
      'endpoint is disabled',
      'endpointdisabled',
      'not a valid platform endpoint',
      'platform token',
      'token is invalid',
      'no endpoint found',
      'targetarn',
    ];

    return terminalPatterns.some((pattern) => normalized.includes(pattern));
  }

  private serializePayload(payload?: Record<string, unknown>) {
    if (!payload) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ])
    );
  }

  private toJsonPayload(
    payload?: Record<string, unknown>
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (payload === undefined) {
      return undefined;
    }

    return payload as Prisma.InputJsonValue;
  }

  private toListItem(notification: NotificationListItem) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      entityType: notification.entityType,
      entityId: notification.entityId,
      payload: notification.payload,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      relatedUserId: notification.relatedUserId,
      relatedPostId: notification.relatedPostId,
    };
  }

  private emitRealtimeNotification(
    userId: string,
    notification: ReturnType<NotificationsService['toListItem']>
  ) {
    const payload =
      notification.payload &&
      typeof notification.payload === 'object' &&
      !Array.isArray(notification.payload)
        ? (notification.payload as Record<string, unknown>)
        : null;

    this.chatGateway?.notifyUser(userId, {
      ...notification,
      message: notification.body,
      data: payload,
    });
  }
}
