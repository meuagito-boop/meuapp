jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: null,
    manifest: null,
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

import { resolveApiBaseUrl } from './runtimeApiUrl';

type DevGlobal = typeof globalThis & {
  __DEV__?: boolean;
};

const devGlobal = globalThis as DevGlobal;
const originalDev = devGlobal.__DEV__;
const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

function setDev(value: boolean) {
  Object.defineProperty(devGlobal, '__DEV__', {
    configurable: true,
    value,
  });
}

describe('resolveApiBaseUrl', () => {
  afterEach(() => {
    if (originalDev === undefined) {
      delete devGlobal.__DEV__;
    } else {
      setDev(originalDev);
    }

    if (originalApiUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }

  });

  it('uses localhost only during development when env url is missing', () => {
    setDev(true);
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(resolveApiBaseUrl()).toBe('http://localhost:3001');
  });

  it('requires EXPO_PUBLIC_API_URL in release builds', () => {
    setDev(false);
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(() => resolveApiBaseUrl()).toThrow('EXPO_PUBLIC_API_URL is required for release builds.');
  });

  it('blocks local API URLs in release builds', () => {
    setDev(false);

    expect(() => resolveApiBaseUrl('http://localhost:3001')).toThrow(
      'EXPO_PUBLIC_API_URL cannot point to a local host in release builds.'
    );
  });

  it('normalizes a valid release API URL', () => {
    setDev(false);

    expect(resolveApiBaseUrl('https://api.staging.meuagito.com/')).toBe(
      'https://api.staging.meuagito.com'
    );
  });
});
