import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '@constants/colors';
import { borderRadius, fontSize, spacing } from '@constants/design';

type Tone = 'default' | 'orange' | 'danger' | 'success';

const toneStyles: Record<Tone, { borderColor: string; backgroundColor: string; titleColor: string }> = {
  default: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    titleColor: colors.text,
  },
  orange: {
    borderColor: 'rgba(232, 100, 10, 0.28)',
    backgroundColor: 'rgba(232, 100, 10, 0.08)',
    titleColor: colors.primary,
  },
  danger: {
    borderColor: 'rgba(231, 76, 60, 0.28)',
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    titleColor: '#E74C3C',
  },
  success: {
    borderColor: 'rgba(39, 174, 96, 0.28)',
    backgroundColor: 'rgba(39, 174, 96, 0.08)',
    titleColor: '#27AE60',
  },
};

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  leftLabel?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightLabel,
  onRightPress,
  leftLabel,
}) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} accessibilityRole="button" style={styles.headerButton}>
        <Text style={styles.headerButtonText}>{leftLabel ?? '<'}</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>M</Text>
      </View>
    )}

    <Text style={styles.headerTitle} numberOfLines={1}>
      {title}
    </Text>

    {rightLabel && onRightPress ? (
      <TouchableOpacity onPress={onRightPress} accessibilityRole="button" style={styles.headerAction}>
        <Text style={styles.headerActionText}>{rightLabel}</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.headerGhost} />
    )}
  </View>
);

export interface SectionLabelProps {
  label: string;
  style?: ViewStyle;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => (
  <View style={[styles.sectionDivider, style]}>
    <View style={styles.sectionLine} />
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

export interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  tone?: Tone;
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  tone = 'default',
  style,
}) => {
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
        style,
      ]}
    >
      <Text style={[styles.infoTitle, { color: palette.titleColor }]}>{title}</Text>
      <View style={styles.infoBody}>{children}</View>
    </View>
  );
};

export interface ActionRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export const ActionRow: React.FC<ActionRowProps> = ({
  title,
  subtitle,
  value,
  onPress,
  danger = false,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.actionRow, disabled && styles.disabledRow]}
    onPress={onPress}
    disabled={disabled || !onPress}
    activeOpacity={0.75}
    accessibilityRole={onPress ? 'button' : undefined}
  >
    <View style={styles.actionText}>
      <Text style={[styles.actionTitle, danger && styles.dangerText]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.actionSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    {value ? <Text style={styles.actionValue}>{value}</Text> : null}
    {onPress ? <Text style={styles.chevron}>{'>'}</Text> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '900',
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerAction: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  headerGhost: {
    width: 34,
    height: 34,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surface,
  },
  sectionText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  infoBody: {
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  disabledRow: {
    opacity: 0.6,
  },
  actionText: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  dangerText: {
    color: '#E74C3C',
  },
  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  actionValue: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
