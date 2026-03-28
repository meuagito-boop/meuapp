/**
 * Paleta de cores oficial do Meu Agito v1.0
 * Baseada nos designs aprovados (T01-T07, T_AGITO, T_PERFIL, etc)
 */

export const colors = {
  // Primárias
  primary: '#E8640A', // Laranja vibrante - principal
  primaryDark: '#B84A08', // Laranja mais escuro - hover
  primaryLight: '#FF8C42', // Laranja claro - fundo de badge

  // Neutras - Fundo
  background: '#0D0D0D', // Preto profundo - fundo principal
  surface: '#1A1A1A', // Cinza escuro - cards
  surfaceLight: '#222222', // Cinza claro - hover de cards

  // Neutras - Bordas
  border: '#2A2A2A', // Cinza médio - bordas
  borderLight: '#1A1A1A', // Cinza escuro - bordas sutis
  overlayBorder: 'rgba(232, 100, 10, 0.27)', // Laranja semi-transparente

  // Texto
  text: '#FFFFFF', // Branco - texto principal
  textSecondary: '#AAAAAA', // Cinza médio - texto secundário
  textTertiary: '#555555', // Cinza escuro - texto terciário
  textPlaceholder: '#666666', // Cinza - placeholder de input
  textMuted: '#888888', // Cinza - texto desabilitado

  // Estados
  success: '#1A7A4A', // Verde - open/sucesso
  warning: '#E8640A', // Laranja - aviso
  error: '#C0392B', // Vermelho - erro/urgência
  info: '#2A9FD8', // Azul - informação

  // Especiais
  badge: '#1A0800', // Marrom escuro - fundo de badge
  verified: '#E8640A', // Laranja - verificado
  alive: '#E8640A', // Laranja - ao vivo/ativo
  disabled: '#333333', // Cinza - desabilitado

  // Transparentes
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay para modais
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Overlay leve para imagens

  // Degradês (strings)
  gradientOrange: 'linear-gradient(135deg, #E8640A, #FF8C42)',
  gradientOverlay: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.92))',
} as const;

/**
 * Aliases semânticos para uso comum
 */
export const semanticColors = {
  // Backgrounds
  bgPrimary: colors.background,
  bgCard: colors.surface,
  bgHover: colors.surfaceLight,
  bgOverlay: colors.overlay,

  // Texts
  textPrimary: colors.text,
  textSecondary: colors.textSecondary,
  textDisabled: colors.textMuted,

  // Interactive
  buttonPrimary: colors.primary,
  buttonDisabled: colors.disabled,
  borderDefault: colors.border,

  // Feedback
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
} as const;
