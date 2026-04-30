import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '@constants/colors';
import { componentSizes, spacing, borderRadius } from '@constants/design';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'default' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
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
}) => {
  const buttonHeight =
    size === 'small'
      ? componentSizes.buttonSmall
      : size === 'large'
      ? componentSizes.buttonLarge
      : componentSizes.buttonDefault;

  const backgroundColor = disabled
    ? colors.disabled
    : variant === 'primary'
    ? colors.primary
    : variant === 'secondary'
    ? colors.surface
    : variant === 'danger'
    ? colors.error
    : 'transparent';

  const borderColor =
    variant === 'secondary' || variant === 'ghost' ? colors.border : 'transparent';

  const textColor =
    variant === 'ghost' || variant === 'secondary' ? colors.primary : colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.button,
        {
          height: buttonHeight,
          backgroundColor,
          borderColor,
          width: fullWidth ? '100%' : 'auto',
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            <Text style={[styles.label, { color: textColor }, labelStyle]}>
              {label}
            </Text>
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
