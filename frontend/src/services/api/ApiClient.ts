import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
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

        if (token) {
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

        if (error.response?.status === 401 && !originalRequest._retry) {
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

              // Logout usuário
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

  /**
   * Obter access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      return token;
    } catch (error) {
      console.error('Erro ao obter access token:', error);
      return null;
    }
  }

  /**
   * Obter refresh token
   */
  private async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('refreshToken');
      return token;
    } catch (error) {
      console.error('Erro ao obter refresh token:', error);
      return null;
    }
  }

  /**
   * Salvar tokens
   */
  async saveTokens(tokens: AuthTokens) {
    try {
      await Promise.all([
        SecureStore.setItemAsync('accessToken', tokens.accessToken),
        SecureStore.setItemAsync('refreshToken', tokens.refreshToken),
      ]);
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
    }
  }

  /**
   * Renovar access token
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await this.client.post<ApiResponse<AuthTokens>>(
        '/auth/refresh',
        { refreshToken },
      );

      if (response.data.data?.accessToken) {
        const newTokens = response.data.data;
        await this.saveTokens(newTokens);
        return newTokens.accessToken;
      }

      throw new Error('Falha ao renovar token');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
      ]);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Upload com progress
   */
  async uploadFile<T = any>(
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
      } as any);

      const token = await this.getAccessToken();

      const response = await axios.post<ApiResponse<T>>(
        `${this.baseURL}${url}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token ? `Bearer ${token}` : '',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              onProgress(Math.round(progress));
            }
          },
        },
      );

      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any) {
    if (error.response) {
      // API retornou erro
      const { status, data } = error.response;

      console.error(`API Error ${status}:`, data);

      if (status === 401) {
        // Unauthorized - será tratado pelo interceptor
      } else if (status === 403) {
        console.error('Acesso proibido');
      } else if (status === 404) {
        console.error('Recurso não encontrado');
      } else if (status === 500) {
        console.error('Erro interno do servidor');
      }
    } else if (error.request) {
      // Request foi feito mas sem resposta
      console.error('Nenhuma resposta do servidor:', error.request);
    } else {
      // Erro na configuração da request
      console.error('Erro na request:', error.message);
    }
  }

  /**
   * Obter client axios (para usos avançados)
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

export default ApiClient;
