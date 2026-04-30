import { Alert, Linking } from 'react-native';
import { resolveApiBaseUrl } from '@utils/runtimeApiUrl';

export type LegalDocumentType = 'terms' | 'privacy';

const LEGAL_PATHS: Record<LegalDocumentType, string> = {
  terms: '/legal/terms-of-use',
  privacy: '/legal/privacy-policy',
};

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

export async function openLegalDocument(type: LegalDocumentType): Promise<void> {
  const url = getLegalDocumentUrl(type);

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Nao foi possivel abrir o documento', `Abra manualmente: ${url}`);
  }
}

export async function openSupportEmail(email: string = 'support@meuagito.com'): Promise<void> {
  const url = `mailto:${email}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Nao foi possivel abrir o email', `Envie para: ${email}`);
  }
}
