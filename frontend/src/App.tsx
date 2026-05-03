import React, { useEffect, useMemo, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';

import RootNavigator from '@screens/navigation/RootNavigator';
import { navigationLinking } from '@screens/navigation/linking';
import { WebPreviewNavigator } from '@screens/dev/WebPreviewNavigator';
import { pushRegistrationService } from '@services/push/PushRegistrationService';
import { authStore } from '@stores/authStore';
import { locationStore } from '@stores/locationStore';
import { logger } from '@utils/logger';

// Keep native splash visible until bootstrap finishes.
void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const getPreviewScreenFromQuery = (): string | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('preview');
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const previewScreenName = useMemo(() => getPreviewScreenFromQuery(), []);
  const { isAuthenticated, needsOnboarding } = authStore();

  useEffect(() => {
    const prepare = async () => {
      try {
        if (!previewScreenName) {
          try {
            await locationStore.getState().getUserLocation();
          } catch (locationError) {
            logger.warn('Falha ao obter localizacao inicial:', locationError);
          }
        }
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    void prepare();
  }, [previewScreenName]);

  useEffect(() => {
    if (!isReady || previewScreenName !== null) {
      return;
    }

    if (!isAuthenticated || needsOnboarding) {
      return;
    }

    void pushRegistrationService.registerCurrentDevice();
  }, [isAuthenticated, isReady, needsOnboarding, previewScreenName]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer linking={previewScreenName === null ? navigationLinking : undefined}>
        {previewScreenName !== null ? (
          <WebPreviewNavigator previewScreenName={previewScreenName} />
        ) : (
          <RootNavigator />
        )}
      </NavigationContainer>
    </QueryClientProvider>
  );
}
