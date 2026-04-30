import ApiClient from './ApiClient';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  relatedUserId: string | null;
  relatedPostId: string | null;
}

export type PushPlatform = 'ANDROID' | 'IOS';

export interface PushTokenItem {
  id: string;
  platform: PushPlatform;
  provider: string;
  endpointArn: string | null;
  isActive: boolean;
  lastValidatedAt: string | null;
  lastError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPushTokenPayload {
  platform: PushPlatform;
  deviceToken: string;
  platformApplicationArn?: string;
}

export interface RegisteredPushToken {
  id: string;
  platform: PushPlatform;
  provider: string;
  endpointArn: string | null;
  isActive: boolean;
  lastValidatedAt: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}

class NotificationsService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async list(params: ListNotificationsParams = {}): Promise<PaginatedResponse<NotificationItem>> {
    return this.apiClient.get('/notifications', {
      params,
    });
  }

  async unreadCount(): Promise<{ total: number }> {
    return this.apiClient.get('/notifications/unread/count');
  }

  async listPushTokens(): Promise<{ data: PushTokenItem[] }> {
    return this.apiClient.get('/notifications/push-tokens');
  }

  async registerPushToken(payload: RegisterPushTokenPayload): Promise<RegisteredPushToken> {
    return this.apiClient.post('/notifications/push-tokens', payload);
  }

  async removePushToken(pushTokenId: string): Promise<{ message: string; id: string; isActive: boolean }> {
    return this.apiClient.delete(`/notifications/push-tokens/${pushTokenId}`);
  }

  async sendTestPush(payload?: { title?: string; body?: string }) {
    return this.apiClient.post('/notifications/push-test', payload || {});
  }

  async markAsRead(notificationId: string): Promise<NotificationItem> {
    return this.apiClient.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<{ updated: number; message: string }> {
    return this.apiClient.put('/notifications/read-all');
  }

  async delete(notificationId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/notifications/${notificationId}`);
  }
}

export default NotificationsService;
