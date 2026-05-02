import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { notificationsService } from '@services/api';
import type { PushPlatform } from '@services/api/NotificationsService';
import { logger } from '@utils/logger';

const PUSH_REGISTRATION_STORAGE_KEY = 'push-registration-v1';
const PUSH_REGISTRATION_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

type StoredPushRegistration = {
  pushTokenId: string;
  deviceToken: string;
  platform: PushPlatform;
};

class PushRegistrationService {
  private notificationHandlerConfigured = false;

  isRegistrationEnabled(): boolean {
    const configuredValue = process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION?.trim().toLowerCase();
    return configuredValue ? PUSH_REGISTRATION_ENABLED_VALUES.has(configuredValue) : false;
  }

  private configureNotificationHandling() {
    if (this.notificationHandlerConfigured || Platform.OS === 'web') {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowAlert: true,
      }),
    });

    this.notificationHandlerConfigured = true;
  }

  async registerCurrentDevice(): Promise<StoredPushRegistration | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    if (!this.isRegistrationEnabled()) {
      logger.info('Registro de push desabilitado por configuracao do build.');
      return null;
    }

    this.configureNotificationHandling();
    await this.ensureAndroidChannel();

    try {
      const hasPermission = await this.ensurePermissions();
      if (!hasPermission) {
        logger.info('Permissao de notificacao nao concedida. Registro de push ignorado.');
        return null;
      }

      const nativeToken = await Notifications.getDevicePushTokenAsync();
      const deviceToken =
        typeof nativeToken.data === 'string' ? nativeToken.data : JSON.stringify(nativeToken.data);

      if (!deviceToken || deviceToken.length < 10) {
        logger.warn('Token nativo de push invalido. Registro ignorado.');
        return null;
      }

      const platform = this.resolvePlatform();
      const previousRegistration = await this.readStoredRegistration();
      if (
        previousRegistration &&
        previousRegistration.deviceToken === deviceToken &&
        previousRegistration.platform === platform
      ) {
        return previousRegistration;
      }

      const registeredToken = await notificationsService.registerPushToken({
        platform,
        deviceToken,
        platformApplicationArn: this.resolvePlatformApplicationArn(platform),
      });

      const storedRegistration = {
        pushTokenId: registeredToken.id,
        deviceToken,
        platform,
      };

      await AsyncStorage.setItem(
        PUSH_REGISTRATION_STORAGE_KEY,
        JSON.stringify(storedRegistration),
      );

      return storedRegistration;
    } catch (error) {
      logger.warn('Falha ao registrar push token no backend:', error);
      return null;
    }
  }

  async unregisterCurrentDevice(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    const storedRegistration = await this.readStoredRegistration();
    if (!storedRegistration) {
      return;
    }

    try {
      await notificationsService.removePushToken(storedRegistration.pushTokenId);
    } finally {
      await AsyncStorage.removeItem(PUSH_REGISTRATION_STORAGE_KEY);
    }
  }

  private async ensurePermissions(): Promise<boolean> {
    const currentPermissions = await Notifications.getPermissionsAsync();
    if (currentPermissions.granted) {
      return true;
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();
    return requestedPermissions.granted;
  }

  private async ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8640A',
    });
  }

  private resolvePlatform(): PushPlatform {
    return Platform.OS === 'android' ? 'ANDROID' : 'IOS';
  }

  private resolvePlatformApplicationArn(platform: PushPlatform): string | undefined {
    if (platform === 'ANDROID') {
      return process.env.EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID?.trim() || undefined;
    }

    return process.env.EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_IOS?.trim() || undefined;
  }

  private async readStoredRegistration(): Promise<StoredPushRegistration | null> {
    const rawValue = await AsyncStorage.getItem(PUSH_REGISTRATION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as StoredPushRegistration;
    } catch {
      await AsyncStorage.removeItem(PUSH_REGISTRATION_STORAGE_KEY);
      return null;
    }
  }
}

export const pushRegistrationService = new PushRegistrationService();
