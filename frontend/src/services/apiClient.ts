import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@store/useAuthStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token JWT
    this.instance.interceptors.request.use((config) => {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    // Interceptor para renovar token se expirado
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await useAuthStore.getState().refreshAccessToken();
            const { accessToken } = useAuthStore.getState();
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  get = (url: string, config?: any) => this.instance.get(url, config);
  post = (url: string, data?: any, config?: any) => this.instance.post(url, data, config);
  put = (url: string, data?: any, config?: any) => this.instance.put(url, data, config);
  delete = (url: string, config?: any) => this.instance.delete(url, config);
}

export const apiClient = new ApiClient();
