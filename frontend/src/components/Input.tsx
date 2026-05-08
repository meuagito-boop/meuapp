import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@constants/colors';
import { borderRadius, componentSizes, spacing, typography } from '@constants/design';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  disabled = false,
  editable = true,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isEditable = editable && !disabled;

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.brand
    : colors.bgSurface3;

  const borderWidth = isFocused || error ? 1.5 : 1;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.wrapper,
          { borderColor, borderWidth, opacity: isEditable ? 1 : 0.6 },
        ]}
      >
        {leftIcon ? (
          <Feather
            name={leftIcon}
            size={20}
            color={isFocused ? colors.brand : colors.textSecondary}
            style={styles.iconLeft}
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          editable={isEditable}
          selectionColor={colors.brand}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(v => !v)}
            style={styles.iconRight}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            disabled={!isEditable}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={isFocused ? colors.brand : colors.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            disabled={!isEditable || !onRightIconPress}
          >
            <Feather name={rightIcon} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.feedback}>
          <Feather name="alert-circle" size={12} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.brand,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: componentSizes.inputDefault,
    backgroundColor: colors.bgSurface2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.base,
    color: colors.textPrimary,
    paddingVertical: 0,
    minHeight: componentSizes.inputDefault,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.xs,
    color: colors.error,
    fontWeight: '500',
  },
  hintText: {
    ...typography.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
