/**
 * Meu Agito color tokens
 * Canonical + legacy aliases for compatibility during migration.
 */

export const colors = {
  // Primary
  primary: '#E8640A',
  accent: '#E8640A', // legacy alias
  primaryDark: '#B84A08',
  primaryLight: '#FF8C42',

  // Surfaces
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#222222',

  // Borders
  border: '#2A2A2A',
  borderLight: '#1A1A1A',
  overlayBorder: 'rgba(232, 100, 10, 0.27)',

  // Text
  text: '#FFFFFF',
  textPrimary: '#FFFFFF', // legacy alias
  textSecondary: '#AAAAAA',
  textTertiary: '#555555',
  textPlaceholder: '#666666',
  textMuted: '#888888',

  // States
  success: '#1A7A4A',
  warning: '#E8640A',
  error: '#C0392B',
  info: '#2A9FD8',

  // Special
  badge: '#1A0800',
  verified: '#E8640A',
  alive: '#E8640A',
  disabled: '#333333',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradients
  gradientOrange: 'linear-gradient(135deg, #E8640A, #FF8C42)',
  gradientOverlay: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.92))',
} as const;

export const semanticColors = {
  bgPrimary: colors.background,
  bgCard: colors.surface,
  bgHover: colors.surfaceLight,
  bgOverlay: colors.overlay,

  textPrimary: colors.text,
  textSecondary: colors.textSecondary,
  textDisabled: colors.textMuted,

  buttonPrimary: colors.primary,
  buttonDisabled: colors.disabled,
  borderDefault: colors.border,

  success: colors.success,
  error: colors.error,
  warning: colors.warning,
} as const;
