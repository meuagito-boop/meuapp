import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@constants/colors';
import { borderRadius, spacing, typography } from '@constants/design';

export interface BottomSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: React.ReactNode;
}

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options?: BottomSheetOption[];
  children?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  options,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 220, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, spacing[4]) },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {title ? <Text style={styles.title}>{title}</Text> : null}

        {options?.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => { opt.onPress(); onClose(); }}
            style={styles.option}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
          >
            {opt.icon ? <View style={styles.optionIcon}>{opt.icon}</View> : null}
            <Text style={[styles.optionLabel, opt.destructive && styles.destructive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {children}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 100,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSurface3,
    marginBottom: spacing[4],
    marginTop: spacing[2],
  },
  title: {
    ...typography.baseSemibold,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSurface3,
    minHeight: 52,
    gap: spacing[3],
  },
  optionIcon: {
    width: 24,
    alignItems: 'center',
  },
  optionLabel: {
    ...typography.base,
    color: colors.textPrimary,
  },
  destructive: {
    color: colors.error,
  },
});
