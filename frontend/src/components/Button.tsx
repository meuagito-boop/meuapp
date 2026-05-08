import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, shadows } from '@constants/colors';
import { borderRadius, componentSizes, spacing, typography } from '@constants/design';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  labelStyle,
  accessibilityLabel,
}) => {
  const height =
    size === 'small' ? componentSizes.buttonSmall :
    size === 'large' ? componentSizes.buttonLarge :
    componentSizes.buttonDefault;

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    { height },
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    variant === 'danger' && styles.danger,
    isDisabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textColor =
    isDisabled ? colors.textSecondary :
    variant === 'primary' ? colors.textInverse :
    variant === 'danger' ? '#FFFFFF' :
    variant === 'ghost' ? colors.brand :
    colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.75}
      style={[containerStyle, variant === 'primary' && !isDisabled && shadows.brand]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textInverse : colors.brand}
          size="small"
        />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, { color: textColor }, labelStyle]}>{label}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconWrap}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: colors.brand,
  },
  secondary: {
    backgroundColor: colors.bgSurface2,
    borderColor: colors.bgSurface3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.textSecondary,
    borderWidth: 1.5,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    backgroundColor: colors.bgSurface2,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.baseSemibold,
  },
});
