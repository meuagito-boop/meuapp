import React from 'react';
import {
  ImageBackground,
  Platform,
  StyleSheet,
  View,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { colors } from '@constants/colors';
import { spacing } from '@constants/design';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AUTH_BACKGROUND = require('../../../assets/fundo_inicial.png');

type WebImagePositionStyle = ImageStyle & {
  objectFit?: 'cover';
  objectPosition?: string;
};

type AuthBackgroundProps = {
  children: React.ReactNode;
  overlayOpacity?: number;
  imageOpacity?: number;
};

export const authBackgroundImageStyle: WebImagePositionStyle = {
  ...(Platform.OS === 'web'
    ? {
        objectFit: 'cover',
        objectPosition: '50% 50%',
      }
    : {}),
};

export const authPanelStyle: ViewStyle = {
  width: '100%',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  backgroundColor: 'rgba(22,22,22,0.90)',
  padding: spacing.lg,
  shadowColor: '#000000',
  shadowOpacity: 0.28,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
};

export const authInsetStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.10)',
  backgroundColor: 'rgba(10,10,10,0.36)',
};

export function AuthBackground({
  children,
  overlayOpacity = 0.66,
  imageOpacity = 1,
}: AuthBackgroundProps) {
  return (
    <ImageBackground
      source={AUTH_BACKGROUND}
      style={styles.background}
      imageStyle={[authBackgroundImageStyle, { opacity: imageOpacity }]}
      resizeMode="cover"
    >
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          { backgroundColor: `rgba(10,10,10,${overlayOpacity})` },
        ]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
