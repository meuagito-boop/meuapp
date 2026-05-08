// Meu Agito — Design Tokens v3
// Direcao visual: tipografia mais leve, moderna e amigavel.

// Escala de espaçamento (múltiplos de 4px)
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  // aliases semânticos (compatibilidade)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// Raios de borda
export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Escala tipografica global.
// Pesos 700/800 ficam reservados para enfases pontuais, nao para a UI inteira.
export const typography = {
  xs:           { fontSize: 11, lineHeight: 17 },
  sm:           { fontSize: 13, lineHeight: 19 },
  base:         { fontSize: 15, lineHeight: 23 },
  baseSemibold: { fontSize: 15, lineHeight: 23, fontWeight: '500' as const },
  md:           { fontSize: 17, lineHeight: 25 },
  mdBold:       { fontSize: 17, lineHeight: 25, fontWeight: '600' as const },
  lg:           { fontSize: 20, lineHeight: 29, fontWeight: '500' as const },
  xl:           { fontSize: 24, lineHeight: 33, fontWeight: '600' as const },
  '2xl':        { fontSize: 28, lineHeight: 37, fontWeight: '600' as const },
  '3xl':        { fontSize: 34, lineHeight: 43, fontWeight: '700' as const },
} as const;

// Aliases de fontSize (compatibilidade com código existente)
export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  huge: 24,
  giant: 28,
  mega: 34,
} as const;

// Pesos de fonte
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '600' as const,
  extrabold: '700' as const,
} as const;

// Tamanhos de componentes
export const componentSizes = {
  // Botões
  buttonSmall: 36,
  buttonDefault: 48,
  buttonLarge: 52,
  buttonIcon: 44,

  // Inputs
  inputDefault: 48,
  inputSmall: 40,

  // Avatares
  avatarXS: 28,
  avatarSM: 36,
  avatarMD: 48,
  avatarLG: 72,
  avatarXL: 96,
  avatarXXL: 72,

  // Ícones
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 32,

  // Header / Nav
  headerHeight: 56,
  tabBarHeight: 56,
  fabSize: 52,

  // Área mínima de toque (WCAG)
  minTouch: 44,
} as const;

// Timings de animação
export const animations = {
  fast: 200,
  normal: 280,
  slow: 320,
  spring: 300,
} as const;

// Z-index
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  overlay: 2000,
  modal: 3000,
  toast: 4000,
} as const;

// Breakpoints
export const breakpoints = {
  phone: 414,
  tablet: 768,
  desktop: 1024,
} as const;

// Sombras (string — legacy)
export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.24)',
  md: '0 4px 14px rgba(0,0,0,0.30)',
  lg: '0 8px 28px rgba(0,0,0,0.36)',
  brand: '0 4px 18px rgba(255,102,0,0.22)',
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;
