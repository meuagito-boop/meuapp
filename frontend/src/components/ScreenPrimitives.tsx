import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { borderRadius, fontWeight, spacing, typography } from '@constants/design';

// ─── Header Tipo B — tela interna (com voltar) ──────────────────────────────

export interface HeaderBackButtonProps {
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  onPress,
  disabled = false,
  accessibilityLabel = 'Voltar',
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.75}
    style={[styles.headerBtn, disabled && styles.headerBtnDisabled, style]}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
  >
    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
  </TouchableOpacity>
);

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIcon?: keyof typeof Feather.glyphMap;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightLabel,
  onRightPress,
  rightIcon,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
      {onBack ? (
        <HeaderBackButton onPress={onBack} />
      ) : (
        <View style={styles.headerGhost} />
      )}

      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>

      {(rightLabel || rightIcon) && onRightPress ? (
        <TouchableOpacity
          onPress={onRightPress}
          style={styles.headerAction}
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
        >
          {rightIcon ? (
            <Feather name={rightIcon} size={22} color={colors.brand} />
          ) : (
            <Text style={styles.headerActionText}>{rightLabel}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.headerGhost} />
      )}
    </View>
  );
};

// ─── Action Row (linhas de configuração) ────────────────────────────────────

export interface ActionRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
}

export const ActionRow: React.FC<ActionRowProps> = ({
  title,
  subtitle,
  value,
  icon,
  onPress,
  danger = false,
  disabled = false,
  showChevron = true,
}) => (
  <TouchableOpacity
    style={[styles.actionRow, disabled && { opacity: 0.5 }]}
    onPress={onPress}
    disabled={disabled || !onPress}
    activeOpacity={0.7}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={title}
  >
    {icon ? (
      <View style={styles.actionIcon}>
        <Feather name={icon} size={20} color={danger ? colors.error : colors.textSecondary} />
      </View>
    ) : null}
    <View style={styles.actionText}>
      <Text style={[styles.actionTitle, danger && { color: colors.error }]}>{title}</Text>
      {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
    </View>
    {value ? <Text style={styles.actionValue}>{value}</Text> : null}
    {onPress && showChevron ? (
      <Feather name="chevron-right" size={18} color={colors.textTertiary} />
    ) : null}
  </TouchableOpacity>
);

// ─── Section Label ───────────────────────────────────────────────────────────

export interface SectionLabelProps {
  label: string;
  style?: ViewStyle;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => (
  <View style={[styles.sectionLabel, style]}>
    <Text style={styles.sectionLabelText}>{label}</Text>
  </View>
);

// ─── Info Card ───────────────────────────────────────────────────────────────

type Tone = 'default' | 'brand' | 'danger' | 'success';

const toneMap: Record<Tone, { border: string; bg: string; title: string }> = {
  default: { border: colors.bgSurface3, bg: colors.bgSurface, title: colors.textPrimary },
  brand:   { border: 'rgba(255,102,0,0.3)', bg: 'rgba(255,102,0,0.08)', title: colors.brand },
  danger:  { border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.08)', title: colors.error },
  success: { border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.08)', title: colors.success },
};

export interface InfoCardProps {
  title?: string;
  tone?: Tone;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, tone = 'default', children, style }) => {
  const p = toneMap[tone];
  return (
    <View style={[styles.infoCard, { borderColor: p.border, backgroundColor: p.bg }, style]}>
      {title ? <Text style={[styles.infoTitle, { color: p.title }]}>{title}</Text> : null}
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
    minHeight: 52,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnDisabled: {
    opacity: 0.45,
  },
  headerTitle: {
    flex: 1,
    ...typography.mdBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerAction: {
    minWidth: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    ...typography.sm,
    color: colors.brand,
    fontWeight: fontWeight.bold,
  },
  headerGhost: { width: 44 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
    gap: spacing[3],
  },
  actionIcon: { width: 28, alignItems: 'center' },
  actionText: { flex: 1, gap: 2 },
  actionTitle: {
    ...typography.base,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actionSubtitle: {
    ...typography.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionValue: {
    ...typography.sm,
    color: colors.textTertiary,
  },
  sectionLabel: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
    paddingBottom: spacing[2],
  },
  sectionLabelText: {
    ...typography.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    gap: spacing[2],
  },
  infoTitle: {
    ...typography.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
