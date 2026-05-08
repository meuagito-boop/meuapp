/**
 * Shim para expo-secure-store que cai para AsyncStorage no web.
 * expo-secure-store v12.x não tem suporte web; esta camada garante
 * que ApiClient e SocketIOManager funcionem em preview web.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore: typeof import('expo-secure-store') | null = null;

if (Platform.OS !== 'web') {
  // Lazy require — não importa o módulo nativo no bundle web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (SecureStore) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (SecureStore) {
    return SecureStore.setItemAsync(key, value);
  }
  await AsyncStorage.setItem(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (SecureStore) {
    return SecureStore.deleteItemAsync(key);
  }
  await AsyncStorage.removeItem(key);
}
