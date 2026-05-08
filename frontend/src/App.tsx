import React, { useEffect, useMemo, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from '@screens/navigation/RootNavigator';
import { navigationLinking } from '@screens/navigation/linking';
import { WebPreviewNavigator } from '@screens/dev/WebPreviewNavigator';
import { pushRegistrationService } from '@services/push/PushRegistrationService';
import { authStore } from '@stores/authStore';
import { locationStore } from '@stores/locationStore';
import { logger } from '@utils/logger';
import { bootstrapUiPreviewStores } from '@dev/bootstrapUiPreview';
import { getWebPreviewScreenName, isUiPreviewModeEnabled } from '@config/uiPreview';

// Keep native splash visible until bootstrap finishes.
void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const previewScreenName = useMemo(() => getWebPreviewScreenName(), []);
  const isPreviewMode = useMemo(() => isUiPreviewModeEnabled(), [previewScreenName]);
  const { isAuthenticated, needsOnboarding } = authStore();

  useEffect(() => {
    const prepare = async () => {
      try {
        if (isPreviewMode) {
          bootstrapUiPreviewStores(previewScreenName);
        } else {
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
  }, [isPreviewMode, previewScreenName]);

  useEffect(() => {
    if (!isReady || isPreviewMode) {
      return;
    }

    if (!isAuthenticated || needsOnboarding) {
      return;
    }

    void pushRegistrationService.registerCurrentDevice();
  }, [isAuthenticated, isPreviewMode, isReady, needsOnboarding]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer linking={isPreviewMode ? undefined : navigationLinking}>
            {isPreviewMode ? (
              <WebPreviewNavigator previewScreenName={previewScreenName} />
            ) : (
              <RootNavigator />
            )}
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
