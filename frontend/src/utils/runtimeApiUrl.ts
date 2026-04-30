import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PROD_API_BASE_URL = 'https://api.meuagito.com';
const LOCAL_BASE_URL = 'http://localhost:3001';

function getExpoDebugHost(): string | null {
  const expoConfigHostUri = Constants.expoConfig?.hostUri;
  const manifestDebuggerHost = (Constants.manifest as { debuggerHost?: string } | null | undefined)
    ?.debuggerHost;

  const hostUri = expoConfigHostUri || manifestDebuggerHost;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  return host;
}

export function resolveApiBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (envBaseUrl && envBaseUrl.length > 0) {
    return envBaseUrl;
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (Platform.OS === 'android') {
      const debugHost = getExpoDebugHost();
      if (debugHost) {
        return `http://${debugHost}:3001`;
      }
    }

    return LOCAL_BASE_URL;
  }

  return PROD_API_BASE_URL;
}
