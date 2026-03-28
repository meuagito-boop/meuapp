/**
 * Design tokens para o Meu Agito
 * Baseado em escala 8px (mobile first)
 */

export const spacing = {
  // Base units (8px scale)
  xs: 4, // 4px
  sm: 8, // 8px
  md: 12, // 12px
  lg: 16, // 16px
  xl: 20, // 20px
  xxl: 24, // 24px
  xxxl: 32, // 32px
  huge: 40, // 40px
} as const;

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 14,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  xxxl: 20,
  huge: 24,
  giant: 28,
  mega: 32,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

/**
 * Componentes - Tamanhos padrão
 */
export const componentSizes = {
  // Button heights
  buttonSmall: 36,
  buttonDefault: 40,
  buttonLarge: 48,
  buttonIcon: 36,

  // Input heights
  inputDefault: 48,
  inputSmall: 36,

  // Avatar sizes
  avatarXS: 24,
  avatarSM: 32,
  avatarMD: 36,
  avatarLG: 48,
  avatarXL: 56,
  avatarXXL: 72,

  // Icon sizes
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,

  // Header/Footer
  headerHeight: 56,
  tabBarHeight: 60,
  notchHeight: 22,

  // Safe area (typical values)
  safeAreaTop: 44,
  safeAreaBottom: 32,

  // Modal/Sheet
  modalBottomSheetHeight: 350,
  modalBottomSheetHeightLarge: 500,
} as const;

/**
 * Animações - Timings
 */
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Breakpoints (para casos raros de responsive)
 */
export const breakpoints = {
  phone: 414,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Sombras
 */
export const shadows = {
  none: 'none',
  sm: '0 2px 4px rgba(0,0,0,0.1)',
  md: '0 4px 8px rgba(0,0,0,0.15)',
  lg: '0 8px 16px rgba(0,0,0,0.2)',
  xl: '0 20px 60px rgba(0,0,0,0.8)',
} as const;

/**
 * Z-index escala
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  overlay: 2000,
  modal: 3000,
  toast: 4000,
  tooltip: 5000,
} as const;
