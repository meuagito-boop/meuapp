import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@constants/colors';
import { componentSizes, fontWeight } from '@constants/design';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: componentSizes.avatarXS,
  sm: componentSizes.avatarSM,
  md: componentSizes.avatarMD,
  lg: componentSizes.avatarLG,
  xl: componentSizes.avatarXL,
};

const FONT_MAP: Record<AvatarSize, number> = {
  xs: 11,
  sm: 13,
  md: 17,
  lg: 24,
  xl: 32,
};

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  showOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  style,
  showOnline = false,
}) => {
  const dim = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: dim, height: dim, borderRadius: dim / 2 }]}
          accessibilityLabel={name ?? 'Avatar'}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
        >
          <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
        </View>
      )}
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            { bottom: dim * 0.05, right: dim * 0.05 },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    borderWidth: 2,
    borderColor: colors.bgSurface3,
  },
  fallback: {
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bgSurface3,
  },
  initial: {
    color: colors.textInverse,
    fontWeight: fontWeight.bold,
  },
  onlineDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bgPrimary,
  },
});
