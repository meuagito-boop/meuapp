import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreatePlatformEndpointCommand,
  PublishCommand,
  SNSClient,
  SubscribeCommand,
  UnsubscribeCommand,
} from '@aws-sdk/client-sns';
import { ConfigService } from '@nestjs/config';
import { logStructured } from '@common/logging/structured-log';
import { instrumentAwsSdkClient } from '@common/observability/observability.bootstrap';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

type PushPlatform = 'ANDROID' | 'IOS';

interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Notification Service - Push notifications via AWS SNS.
 *
 * Notes:
 * - `sendToDevice` expects an SNS platform endpoint ARN.
 * - `sendToTopic` accepts a full topic ARN, `default`, or a topic suffix when
 *   `AWS_SNS_TOPIC_ARN_PREFIX` is configured.
 * - `subscribeToTopic` expects SNS platform endpoint ARNs.
 * - `unsubscribeFromTopic` expects SNS subscription ARNs.
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private snsClient: SNSClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const pushProvider = (this.configService.get<string>('PUSH_PROVIDER') || 'none')
      .toLowerCase()
      .trim();

    if (pushProvider !== 'sns') {
      logStructured('info', 'notification.provider.disabled', {
        provider: pushProvider || 'none',
      });
      return;
    }

    const region =
      this.configService.get<string>('AWS_SNS_REGION') ||
      this.configService.get<string>('AWS_REGION');

    if (!region?.trim()) {
      logStructured('warn', 'notification.sns.region_missing', {
        provider: 'sns',
      });
      return;
    }

    this.snsClient = instrumentAwsSdkClient(new SNSClient({ region: region.trim() }));
    logStructured('info', 'notification.sns.initialized', {
      provider: 'sns',
      region: region.trim(),
    });
  }

  async registerDeviceToken(
    userId: string,
    deviceToken: string,
    platformApplicationArn?: string,
    platform?: PushPlatform
  ): Promise<{ success: boolean; endpointArn?: string; error?: string }> {
    try {
      if (!this.snsClient) {
        return { success: false, error: 'SNS push is not available' };
      }

      const resolvedPlatformArn =
        platformApplicationArn?.trim() || this.getPlatformApplicationArn(platform);

      if (!resolvedPlatformArn) {
        return {
          success: false,
          error:
            'AWS_SNS_PLATFORM_APPLICATION_ARN (or an explicit platformApplicationArn) is required to register device tokens.',
        };
      }

      const response = await this.snsClient.send(
        new CreatePlatformEndpointCommand({
          PlatformApplicationArn: resolvedPlatformArn,
          Token: deviceToken,
          CustomUserData: userId,
        })
      );

      const endpointArn = response.EndpointArn;
      logStructured('info', 'notification.device_endpoint.registered', {
        userId,
        endpointArn,
      });

      return { success: Boolean(endpointArn), endpointArn };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'notification.device_endpoint.register_failed', {
        userId,
        errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async sendToDevice(
    endpointArn: string,
    payload: NotificationPayload
  ): Promise<NotificationResponse> {
    try {
      if (!this.snsClient) {
        return { success: false, error: 'SNS push is not available' };
      }

      const response = await this.snsClient.send(
        new PublishCommand({
          TargetArn: endpointArn,
          MessageStructure: 'json',
          Message: this.buildAwsPushMessage(payload),
          Subject: payload.title,
        })
      );

      return { success: true, messageId: response.MessageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'notification.send_to_device.failed', {
        provider: 'sns',
        endpointArn,
        errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async sendToDevices(
    endpointArns: string[],
    payload: NotificationPayload
  ): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
    const results = await Promise.all(
      endpointArns.map((endpointArn) => this.sendToDevice(endpointArn, payload))
    );
    const errors = results
      .filter((result) => !result.success)
      .map((result) => result.error || 'Unknown push error');

    return {
      successCount: results.length - errors.length,
      failureCount: errors.length,
      errors,
    };
  }

  async sendToTopic(topic: string, payload: NotificationPayload): Promise<NotificationResponse> {
    try {
      if (!this.snsClient) {
        return { success: false, error: 'SNS push is not available' };
      }

      const topicArn = this.resolveTopicArn(topic);
      if (!topicArn) {
        return {
          success: false,
          error:
            'Topic ARN is required. Pass a full ARN, use "default", or configure AWS_SNS_TOPIC_ARN_PREFIX.',
        };
      }

      const response = await this.snsClient.send(
        new PublishCommand({
          TopicArn: topicArn,
          MessageStructure: 'json',
          Message: this.buildAwsPushMessage(payload),
          Subject: payload.title,
        })
      );

      return { success: true, messageId: response.MessageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'notification.send_to_topic.failed', {
        provider: 'sns',
        topic,
        errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async subscribeToTopic(
    endpointArns: string | string[],
    topic: string
  ): Promise<{ success: boolean }> {
    try {
      if (!this.snsClient) {
        return { success: false };
      }

      const topicArn = this.resolveTopicArn(topic);
      if (!topicArn) {
        return { success: false };
      }

      const targets = Array.isArray(endpointArns) ? endpointArns : [endpointArns];

      await Promise.all(
        targets.map((endpointArn) =>
          this.snsClient!.send(
            new SubscribeCommand({
              TopicArn: topicArn,
              Protocol: 'application',
              Endpoint: endpointArn,
              ReturnSubscriptionArn: true,
            })
          )
        )
      );

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'notification.subscribe_topic.failed', {
        topic,
        errorMessage,
      });
      return { success: false };
    }
  }

  async unsubscribeFromTopic(
    subscriptionArns: string | string[],
    _topic: string
  ): Promise<{ success: boolean }> {
    try {
      if (!this.snsClient) {
        return { success: false };
      }

      const targets = Array.isArray(subscriptionArns) ? subscriptionArns : [subscriptionArns];

      await Promise.all(
        targets.map((subscriptionArn) =>
          this.snsClient!.send(
            new UnsubscribeCommand({
              SubscriptionArn: subscriptionArn,
            })
          )
        )
      );

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'notification.unsubscribe_topic.failed', {
        errorMessage,
      });
      return { success: false };
    }
  }

  private buildAwsPushMessage(payload: NotificationPayload): string {
    const data = Object.fromEntries(
      Object.entries(payload.data || {}).map(([key, value]) => [key, String(value)])
    );

    const apnsPayload = {
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        sound: 'default',
      },
      data,
    };

    const gcmPayload = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data,
    };

    return JSON.stringify({
      default: payload.body,
      GCM: JSON.stringify(gcmPayload),
      APNS: JSON.stringify(apnsPayload),
      APNS_SANDBOX: JSON.stringify(apnsPayload),
    });
  }

  private resolveTopicArn(topic: string): string | null {
    if (topic.startsWith('arn:aws:sns:')) {
      return topic;
    }

    if (topic === 'default') {
      return this.configService.get<string>('AWS_SNS_DEFAULT_TOPIC_ARN') || null;
    }

    const topicPrefix = this.configService.get<string>('AWS_SNS_TOPIC_ARN_PREFIX');
    if (!topicPrefix?.trim()) {
      return null;
    }

    return `${topicPrefix.trim()}${topic}`;
  }

  private getPlatformApplicationArn(platform?: PushPlatform): string | null {
    const explicitArn = this.configService.get<string>('AWS_SNS_PLATFORM_APPLICATION_ARN')?.trim();
    if (explicitArn) {
      return explicitArn;
    }

    if (platform === 'IOS') {
      return this.configService.get<string>('AWS_SNS_PLATFORM_APPLICATION_ARN_IOS')?.trim() || null;
    }

    return (
      this.configService.get<string>('AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID')?.trim() || null
    );
  }
}
