import ApiClient from './ApiClient';
import AuthService from './AuthService';
import UserService from './UserService';
import FeedService from './FeedService';
import ChatService from './ChatService';
import LocationService from './LocationService';

const API_BASE_URL = typeof __DEV__ !== 'undefined' && __DEV__
  ? 'http://10.0.2.2:3001'
  : 'https://api.meuagito.com';

const apiClient = new ApiClient({ baseURL: API_BASE_URL, timeout: 30000 });

export const authService = new AuthService(apiClient);
export const userService = new UserService(apiClient);
export const feedService = new FeedService(apiClient);
export const chatService = new ChatService(apiClient);
export const locationService = new LocationService(apiClient);

export { apiClient };
export default apiClient;
