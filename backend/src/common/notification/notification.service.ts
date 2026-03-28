import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Notification Service - Push notifications via Firebase Cloud Messaging
 * 
 * Handles:
 * - Device token registration
 * - Sending notifications to individual devices
 * - Sending multicast notifications
 * - Topic-based subscriptions
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private messaging: any; // firebase-admin/messaging
  private db: any; // Prisma or Firebase Realtime DB

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const admin = await import('firebase-admin');

      // Initialize Firebase Admin SDK
      const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT_KEY');

      if (serviceAccount && !admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
          databaseURL: this.configService.get('FIREBASE_DATABASE_URL'),
        });

        this.messaging = admin.messaging();
        console.log('✓ Firebase Cloud Messaging initialized');
      } else {
        console.warn('⚠ Firebase not configured, notifications disabled');
      }
    } catch (error) {
      console.warn('Firebase initialization skipped:', error);
    }
  }

  /**
   * Register device token for user
   */
  async registerDeviceToken(
    userId: string,
    deviceToken: string,
  ): Promise<{ success: boolean }> {
    try {
      if (!this.messaging) {
        console.warn('Messaging not available, token registration skipped');
        return { success: false };
      }

      // Store token in database (for sending notifications later)
      // This would be done via your database adapter
      console.log(`Device token registered for user ${userId}`);

      return { success: true };
    } catch (error) {
      console.error('Error registering device token:', error);
      return { success: false };
    }
  }

  /**
   * Send notification to single device
   */
  async sendToDevice(
    deviceToken: string,
    payload: NotificationPayload,
  ): Promise<NotificationResponse> {
    try {
      if (!this.messaging) {
        return { success: false, error: 'Messaging not available' };
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        token: deviceToken,
      };

      const messageId = await this.messaging.send(message);
      return { success: true, messageId };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send notification to multiple devices (multicast)
   */
  async sendToDevices(
    deviceTokens: string[],
    payload: NotificationPayload,
  ): Promise<{ successCount: number; failureCount: number; errors: any[] }> {
    try {
      if (!this.messaging) {
        return { successCount: 0, failureCount: deviceTokens.length, errors: [] };
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      };

      const response = await this.messaging.sendMulticast({
        ...message,
        tokens: deviceTokens,
      });

      const errors = response.responses
        .map((resp: any, idx: number) => (!resp.success ? resp.error : null))
        .filter(Boolean);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors,
      };
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      return { successCount: 0, failureCount: deviceTokens.length, errors: [error] };
    }
  }

  /**
   * Send notification to topic subscribers
   */
  async sendToTopic(
    topic: string,
    payload: NotificationPayload,
  ): Promise<NotificationResponse> {
    try {
      if (!this.messaging) {
        return { success: false, error: 'Messaging not available' };
      }

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        topic,
      };

      const messageId = await this.messaging.send(message);
      return { success: true, messageId };
    } catch (error) {
      console.error('Error sending topic notification:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(
    deviceTokens: string | string[],
    topic: string,
  ): Promise<{ success: boolean }> {
    try {
      if (!this.messaging) {
        return { success: false };
      }

      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      await this.messaging.subscribeToTopic(tokens, topic);

      return { success: true };
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return { success: false };
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(
    deviceTokens: string | string[],
    topic: string,
  ): Promise<{ success: boolean }> {
    try {
      if (!this.messaging) {
        return { success: false };
      }

      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      await this.messaging.unsubscribeFromTopic(tokens, topic);

      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return { success: false };
    }
  }
}
