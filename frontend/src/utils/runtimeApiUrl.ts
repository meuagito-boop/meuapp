import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCAL_BASE_URL = 'http://localhost:3001';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '10.0.2.2']);

function isDevelopmentRuntime(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function normalizeApiBaseUrl(value: string, source: string): string {
  const normalized = value.trim().replace(/\/+$/, '');

  try {
    // eslint-disable-next-line no-new
    new URL(normalized);
  } catch {
    throw new Error(`${source} must be a valid absolute URL.`);
  }

  return normalized;
}

function isLocalApiUrl(value: string): boolean {
  const parsed = new URL(value);
  return LOCAL_HOSTS.has(parsed.hostname);
}

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

export function resolveApiBaseUrl(apiUrlOverride?: string): string {
  const envBaseUrl = (apiUrlOverride ?? process.env.EXPO_PUBLIC_API_URL)?.trim();

  if (envBaseUrl && envBaseUrl.length > 0) {
    const normalizedEnvBaseUrl = normalizeApiBaseUrl(envBaseUrl, 'EXPO_PUBLIC_API_URL');

    if (!isDevelopmentRuntime() && isLocalApiUrl(normalizedEnvBaseUrl)) {
      throw new Error('EXPO_PUBLIC_API_URL cannot point to a local host in release builds.');
    }

    return normalizedEnvBaseUrl;
  }

  if (isDevelopmentRuntime()) {
    if (Platform.OS === 'android') {
      const debugHost = getExpoDebugHost();
      if (debugHost) {
        return `http://${debugHost}:3001`;
      }
    }

    return LOCAL_BASE_URL;
  }

  throw new Error('EXPO_PUBLIC_API_URL is required for release builds.');
}
