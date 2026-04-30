import ApiClient from './ApiClient';
import AuthService from './AuthService';
import UserService from './UserService';
import FeedService from './FeedService';
import ChatService from './ChatService';
import LocationService from './LocationService';
import SearchService from './SearchService';
import NotificationsService from './NotificationsService';
import CatalogService from './CatalogService';
import { resolveApiBaseUrl } from '@utils/runtimeApiUrl';

const API_BASE_URL = resolveApiBaseUrl();
const API_TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT || 30000);

const apiClient = new ApiClient({ baseURL: API_BASE_URL, timeout: API_TIMEOUT });

export const authService = new AuthService(apiClient);
export const userService = new UserService(apiClient);
export const feedService = new FeedService(apiClient);
export const chatService = new ChatService(apiClient);
export const locationService = new LocationService(apiClient);
export const searchService = new SearchService(apiClient);
export const notificationsService = new NotificationsService(apiClient);
export const catalogService = new CatalogService(apiClient);

export { apiClient };
export default apiClient;
