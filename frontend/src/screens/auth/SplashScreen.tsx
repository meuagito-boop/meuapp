import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';



import AsyncStorage from '@react-native-async-storage/async-storage';

import { authStore } from '@stores/authStore';
import { locationStore } from '@stores/locationStore';
import { colors } from '@constants/colors';
import { logger } from '@utils/logger';

const ONBOARDING_STORAGE_KEY = 'meuagito_onboarding_completo';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { isLoadingLocation } = locationStore();
  const { isAuthenticated, needsOnboarding, pendingOnboardingScreen, refreshToken, logout, user } =
    authStore();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const initializeApp = async () => {
      try {
        if (isAuthenticated && user) {
          try {
            await refreshToken();
            if (needsOnboarding && pendingOnboardingScreen) {
              navigation.replace(pendingOnboardingScreen);
            }
            return;
          } catch {
            await logout();
            const onboardingDone = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
            navigation.replace(onboardingDone === 'true' ? 'Login' : 'Onboarding');
          }
          return;
        }

        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        timer = setTimeout(() => {
          navigation.replace(onboardingDone === 'true' ? 'Login' : 'Onboarding');
        }, 900);
      } catch (error) {
        logger.error('Error initializing app:', error);
        navigation.replace('Login');
      }
    };

    void initializeApp();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isAuthenticated, logout, navigation, needsOnboarding, pendingOnboardingScreen, refreshToken, user]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meu Agito</Text>
        <Text style={styles.subtitle}>Descubra estabelecimentos e eventos perto de voce</Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isLoadingLocation ? 'Obtendo sua localizacao...' : 'Inicializando...'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    paddingBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
