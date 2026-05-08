import { Platform } from 'react-native';

const truthyPreviewValues = new Set(['1', 'true', 'yes', 'on']);

export const UI_PREVIEW_ENV_ENABLED = truthyPreviewValues.has(
  String(process.env.EXPO_PUBLIC_UI_PREVIEW_MODE || '').toLowerCase(),
);

export const getWebPreviewScreenName = (): string | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('preview');
};

export const isUiPreviewModeEnabled = (): boolean =>
  UI_PREVIEW_ENV_ENABLED || getWebPreviewScreenName() !== null;
