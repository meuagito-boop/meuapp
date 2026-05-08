import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authStore } from '@stores/authStore';
import { colors } from '@constants/colors';
import { typography } from '@constants/design';
import { logger } from '@utils/logger';
import { isUiPreviewModeEnabled } from '@config/uiPreview';
import { AuthBackground } from './authLayout';

const SPLASH_DELAY_MS = 2200;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SPLASH_LOGO = require('../../../assets/icon.png');

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const needsOnboarding = authStore((state) => state.needsOnboarding);
  const pendingOnboardingScreen = authStore((state) => state.pendingOnboardingScreen);
  const refreshToken = authStore((state) => state.refreshToken);
  const logout = authStore((state) => state.logout);
  const user = authStore((state) => state.user);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isUiPreviewModeEnabled()) {
      return undefined;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const go = (screen: string) => {
      timer = setTimeout(() => navigation.replace(screen), SPLASH_DELAY_MS);
    };

    const init = async () => {
      try {
        if (isAuthenticated && user) {
          try {
            await refreshToken();
            if (needsOnboarding && pendingOnboardingScreen) {
              go(pendingOnboardingScreen);
            }
            return;
          } catch {
            await logout();
            go('Login');
          }
          return;
        }

        go('Login');
      } catch (error) {
        logger.error('SplashScreen init error:', error);
        go('Login');
      }
    };

    void init();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, logout, navigation, needsOnboarding, pendingOnboardingScreen, refreshToken, user]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(wordmarkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 0.8, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [logoOpacity, taglineOpacity, wordmarkOpacity]);

  return (
    <AuthBackground overlayOpacity={0.62}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.center}>
          <Animated.View style={{ opacity: logoOpacity }}>
            <Image
              source={SPLASH_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.Text style={[styles.wordmark, { opacity: wordmarkOpacity }]}>
            Meu Agito
          </Animated.Text>
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Novas experiências perto de você
          </Animated.Text>
          <Animated.Text style={[styles.supportText, { opacity: taglineOpacity }]}>
            Curta, aproveite e compartilhe
          </Animated.Text>
        </View>
        <Animated.View style={[styles.loader, { opacity: wordmarkOpacity }]}>
          <View style={styles.loaderBar} />
        </Animated.View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
    transform: [{ translateY: -58 }],
  },
  logo: {
    width: 132,
    height: 132,
    marginBottom: 8,
  },
  wordmark: {
    ...typography['3xl'],
    color: colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    ...typography.baseSemibold,
    color: colors.textPrimary,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  supportText: {
    ...typography.sm,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  loader: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  loaderBar: {
    width: 120,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
