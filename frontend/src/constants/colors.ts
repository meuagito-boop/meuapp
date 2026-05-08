// Meu Agito — Design System v3
// Tokens alinhados ao front novo.

export const colors = {
  // Brand
  brand: '#FF6600',
  brandDark: '#CC5200',
  brandLight: '#FF8533',
  brandMuted: 'rgba(255, 102, 0, 0.08)',

  // Backgrounds
  bgPrimary: '#0A0A0A',
  bgSurface: '#161616',
  bgSurface2: '#222222',
  bgSurface3: '#2E2E2E',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  textTertiary: '#5A5A5A',
  textBrand: '#FF6600',
  textInverse: '#0A0A0A',

  // States
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Social interactions
  likeActive: '#EF4444',
  likeInactive: '#9A9A9A',
  repostActive: '#22C55E',
  saveActive: '#FF6600',
  checkin: '#FF6600',

  // Legacy aliases (compatibilidade com código existente)
  primary: '#FF6600',
  primaryDark: '#CC5200',
  primaryLight: '#FF8533',
  accent: '#FF6600',
  background: '#0A0A0A',
  surface: '#161616',
  surfaceLight: '#222222',
  border: '#2E2E2E',
  borderLight: '#222222',
  text: '#FFFFFF',
  textPlaceholder: '#5A5A5A',
  textMuted: '#9A9A9A',
  disabled: '#2E2E2E',
  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayLight: 'rgba(0, 0, 0, 0.34)',
  overlayBorder: 'rgba(255, 102, 0, 0.22)',
  badge: '#FF6600',
  verified: '#FF6600',
  alive: '#FF6600',
} as const;

// Sombras nativas (React Native)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 28,
    elevation: 10,
  },
  brand: {
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export type ColorKey = keyof typeof colors;
