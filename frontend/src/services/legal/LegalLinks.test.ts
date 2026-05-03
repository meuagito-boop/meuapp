jest.mock('@utils/runtimeApiUrl', () => ({
  resolveApiBaseUrl: () => 'https://api.staging.meuagito.com',
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
  },
}));

import { getLegalDocumentUrl, resolveSupportEmail } from './LegalLinks';

type DevGlobal = typeof globalThis & {
  __DEV__?: boolean;
};

const devGlobal = globalThis as DevGlobal;
const originalDev = devGlobal.__DEV__;
const originalSupportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;

function setDev(value: boolean) {
  Object.defineProperty(devGlobal, '__DEV__', {
    configurable: true,
    value,
  });
}

describe('LegalLinks', () => {
  afterEach(() => {
    if (originalDev === undefined) {
      delete devGlobal.__DEV__;
    } else {
      setDev(originalDev);
    }

    if (originalSupportEmail === undefined) {
      delete process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
    } else {
      process.env.EXPO_PUBLIC_SUPPORT_EMAIL = originalSupportEmail;
    }
  });

  it('builds legal document URLs from the API base URL', () => {
    expect(getLegalDocumentUrl('terms')).toBe(
      'https://api.staging.meuagito.com/legal/terms-of-use'
    );
    expect(getLegalDocumentUrl('privacy')).toBe(
      'https://api.staging.meuagito.com/legal/privacy-policy'
    );
  });

  it('uses configured support email override', () => {
    setDev(false);

    expect(resolveSupportEmail('suporte@meuagito.com')).toBe('suporte@meuagito.com');
  });

  it('requires support email in release builds', () => {
    setDev(false);
    delete process.env.EXPO_PUBLIC_SUPPORT_EMAIL;

    expect(() => resolveSupportEmail()).toThrow(
      'EXPO_PUBLIC_SUPPORT_EMAIL precisa ser configurado no build de release.'
    );
  });

  it('rejects invalid support email', () => {
    setDev(true);

    expect(() => resolveSupportEmail('email-invalido')).toThrow(
      'EXPO_PUBLIC_SUPPORT_EMAIL deve ser um e-mail valido.'
    );
  });
});
