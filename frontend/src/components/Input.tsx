import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '@constants/colors';
import { componentSizes, spacing, borderRadius, fontSize } from '@constants/design';

export interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword: initialIsPassword,
  disabled = false,
  editable = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!initialIsPassword);

  const borderColor = error ? colors.error : colors.border;
  const backgroundColor = disabled ? colors.disabled : colors.surface;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {icon ? <View style={styles.iconLeft}>{icon}</View> : null}

        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: initialIsPassword && !showPassword ? 5 : 0,
            },
          ]}
          placeholderTextColor={colors.textPlaceholder}
          placeholder={placeholder}
          secureTextEntry={initialIsPassword && !showPassword}
          editable={editable && !disabled}
          {...props}
        />

        {initialIsPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            <Text style={{ fontSize: 18 }}>
              {showPassword ? '👁' : '🔒'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {rightIcon && !initialIsPassword ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentSizes.inputDefault,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    padding: 0,
  },
  iconLeft: {
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});
