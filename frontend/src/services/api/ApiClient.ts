import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { logger } from '@utils/logger';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private inMemoryTokens: AuthTokens | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configurar interceptadores
   */
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAccessToken();
        const hasExplicitAuthorization = this.hasAuthorizationHeader(config);

        if (token && !hasExplicitAuthorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !this.isAuthRefreshRequest(originalRequest)
        ) {
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const newToken = await this.refreshAccessToken();

              this.isRefreshing = false;
              this.onRefreshed(newToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }

              return this.client(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              this.refreshSubscribers = [];

              // Logout usuario
              await this.logout();

              return Promise.reject(refreshError);
            }
          }

          return new Promise((resolve) => {
            this.subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.client(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Subscribe para refresh de token
   */
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notificar subscribers do novo token
   */
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private hasAuthorizationHeader(config: InternalAxiosRequestConfig) {
    const headers = config.headers as Record<string, unknown> & {
      get?: (headerName: string) => unknown;
    };

    return Boolean(
      headers.Authorization ??
      headers.authorization ??
      headers.get?.('Authorization'),
    );
  }

  private isAuthRefreshRequest(config?: AxiosRequestConfig) {
    return Boolean(config?.url?.includes('/auth/refresh'));
  }

  /**
   * Normalize API payloads that may come wrapped as { data: ... }.
   */
  private unwrapResponse<T>(payload: ApiResponse<T> | T): T {
    if (this.isPaginatedPayload(payload)) {
      return payload as T;
    }

    if (
      payload !== null &&
      typeof payload === 'object' &&
      'data' in (payload as Record<string, unknown>) &&
      (payload as ApiResponse<T>).data !== undefined
    ) {
      return (payload as ApiResponse<T>).data as T;
    }

    return payload as T;
  }

  /**
   * Responses paginadas do backend usam { data, total, page, limit, totalPages }.
   * Nesses casos nao devemos desembrulhar para manter metadados de paginacao.
   */
  private isPaginatedPayload(payload: ApiResponse<unknown> | unknown): payload is Record<string, unknown> {
    if (payload === null || typeof payload !== 'object') {
      return false;
    }

    const record = payload as Record<string, unknown>;
    const isCursorPaginated =
      'data' in record && 'nextCursor' in record && 'hasMore' in record && 'limit' in record;

    if (isCursorPaginated) {
      return true;
    }

    return (
      'data' in record &&
      'total' in record &&
      'page' in record &&
      'limit' in record &&
      'totalPages' in record
    );
  }

  /**
   * Obter access token
   */
  private async getAccessToken(): Promise<string | null> {
    if (this.inMemoryTokens?.accessToken) {
      return this.inMemoryTokens.accessToken;
    }

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      return token;
    } catch (error) {
      logger.error('Erro ao obter access token:', error);
      return null;
    }
  }

  /**
   * Obter refresh token
   */
  private async getRefreshToken(): Promise<string | null> {
    if (this.inMemoryTokens?.refreshToken) {
      return this.inMemoryTokens.refreshToken;
    }

    try {
      const token = await SecureStore.getItemAsync('refreshToken');
      return token;
    } catch (error) {
      logger.error('Erro ao obter refresh token:', error);
      return null;
    }
  }

  /**
   * Salvar tokens
   */
  async saveTokens(tokens: AuthTokens) {
    this.inMemoryTokens = tokens;

    try {
      await Promise.all([
        SecureStore.setItemAsync('accessToken', tokens.accessToken),
        SecureStore.setItemAsync('refreshToken', tokens.refreshToken),
      ]);
    } catch (error) {
      logger.error('Erro ao salvar tokens:', error);
    }
  }

  /**
   * Renovar access token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('Refresh token nao encontrado');
    }

    const response = await axios.post<ApiResponse<AuthTokens> | AuthTokens>(
      `${this.baseURL}/auth/refresh`,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    const refreshedViaHeader = this.unwrapResponse<AuthTokens>(response.data);
    if (refreshedViaHeader?.accessToken) {
      const newTokens: AuthTokens = {
        accessToken: refreshedViaHeader.accessToken,
        refreshToken: refreshedViaHeader.refreshToken || refreshToken,
      };
      await this.saveTokens(newTokens);
      return newTokens.accessToken;
    }

    const fallbackResponse = await axios.post<ApiResponse<AuthTokens> | AuthTokens>(
      `${this.baseURL}/auth/refresh`,
      { refreshToken },
    );

    const refreshedViaBody = this.unwrapResponse<AuthTokens>(fallbackResponse.data);
    if (refreshedViaBody?.accessToken) {
      const newTokens: AuthTokens = {
        accessToken: refreshedViaBody.accessToken,
        refreshToken: refreshedViaBody.refreshToken || refreshToken,
      };
      await this.saveTokens(newTokens);
      return newTokens.accessToken;
    }

    throw new Error('Falha ao renovar token');
  }
  /**
   * Logout
   */
  async logout() {
    this.inMemoryTokens = null;

    try {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
      ]);
    } catch (error) {
      logger.error('Erro ao fazer logout:', error);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<ApiResponse<T> | T>(url, config);
      return this.unwrapResponse<T>(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T> | T>(url, data, config);
      return this.unwrapResponse<T>(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.put<ApiResponse<T> | T>(url, data, config);
      return this.unwrapResponse<T>(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<ApiResponse<T> | T>(url, config);
      return this.unwrapResponse<T>(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.patch<ApiResponse<T> | T>(url, data, config);
      return this.unwrapResponse<T>(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Upload com progress
   */
  async uploadFile<T = unknown>(
    url: string,
    file: {
      uri: string;
      name: string;
      type: string;
    },
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);

      const token = await this.getAccessToken();

      const response = await axios.post<ApiResponse<T> | T>(
        `${this.baseURL}${url}`,
        formData,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          transformRequest: (data) => data,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              onProgress(Math.round(progress));
            }
          },
        },
      );

      return this.unwrapResponse<T>(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // API retornou erro
        const { status, data } = error.response;

        logger.error(`API Error ${status}:`, data);

        if (status === 401) {
          // Unauthorized - sera tratado pelo interceptor
        } else if (status === 403) {
          logger.error('Acesso proibido');
        } else if (status === 404) {
          logger.error('Recurso nao encontrado');
        } else if (status === 500) {
          logger.error('Erro interno do servidor');
        }
      } else if (error.request) {
        // Request foi feito mas sem resposta
        logger.error('Nenhuma resposta do servidor:', error.request);
      } else {
        // Erro na configuracao da request
        logger.error('Erro na request:', error.message);
      }
      return;
    }

    if (error instanceof Error) {
      logger.error('Erro inesperado:', error.message);
      return;
    }

    logger.error('Erro inesperado sem detalhes');
  }

  /**
   * Obter client axios (para usos avancados)
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  getCachedAccessToken(): string | null {
    return this.inMemoryTokens?.accessToken ?? null;
  }
}

export default ApiClient;
