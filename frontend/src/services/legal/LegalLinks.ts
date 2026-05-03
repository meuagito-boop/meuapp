import { Alert, Linking } from 'react-native';
import { resolveApiBaseUrl } from '@utils/runtimeApiUrl';

export type LegalDocumentType = 'terms' | 'privacy';

const LEGAL_PATHS: Record<LegalDocumentType, string> = {
  terms: '/legal/terms-of-use',
  privacy: '/legal/privacy-policy',
};
const DEFAULT_SUPPORT_EMAIL = 'support@meuagito.com';
const SUPPORT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveBackendBaseUrl(): string {
  return resolveApiBaseUrl();
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}${path}`;
}

export function getLegalDocumentUrl(type: LegalDocumentType): string {
  return joinUrl(resolveBackendBaseUrl(), LEGAL_PATHS[type]);
}

function isDevelopmentRuntime(): boolean {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function resolveSupportEmail(emailOverride?: string): string {
  const configuredEmail = (emailOverride ?? process.env.EXPO_PUBLIC_SUPPORT_EMAIL)?.trim();

  if (configuredEmail) {
    if (!SUPPORT_EMAIL_PATTERN.test(configuredEmail)) {
      throw new Error('EXPO_PUBLIC_SUPPORT_EMAIL deve ser um e-mail valido.');
    }

    return configuredEmail;
  }

  if (isDevelopmentRuntime()) {
    return DEFAULT_SUPPORT_EMAIL;
  }

  throw new Error('EXPO_PUBLIC_SUPPORT_EMAIL precisa ser configurado no build de release.');
}

export async function openLegalDocument(type: LegalDocumentType): Promise<void> {
  const url = getLegalDocumentUrl(type);

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Nao foi possivel abrir o documento', `Abra manualmente: ${url}`);
  }
}

export async function openSupportEmail(email?: string): Promise<void> {
  try {
    const resolvedEmail = resolveSupportEmail(email);
    const url = `mailto:${resolvedEmail}`;
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert(
      'Nao foi possivel abrir o email',
      getErrorMessage(error, 'Canal de suporte indisponivel.')
    );
  }
}
