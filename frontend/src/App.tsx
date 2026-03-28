import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import RootNavigator from '@screens/navigation/RootNavigator';
import { GeolocationService } from '@services/geolocationService';
import { locationStore } from '@stores/locationStore';

// Manter splash screen visível enquanto carregando
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const { setLoading, setLocation, setError } = locationStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Carregar fontes customizadas (opcional - não falha se fontes ausentes)
        try {
          await Font.loadAsync({
            'Montserrat-Bold': require('@assets/fonts/Montserrat-Bold.ttf'),
            'Montserrat-Regular': require('@assets/fonts/Montserrat-Regular.ttf'),
            'Montserrat-SemiBold': require('@assets/fonts/Montserrat-SemiBold.ttf'),
          });
        } catch (fontError) {
          console.warn('Fontes não encontradas, usando fontes padrão:', fontError);
        }

        // Obter localização do usuário
        await GeolocationService.getCurrentLocation();

        setIsReady(true);
      } catch (e) {
        console.warn(e);
        // Se erro ao carregar, ainda continua
        setLocation(-23.5505, -46.6333); // São Paulo padrão
        setIsReady(true);
      } finally {
        // Esconder splash screen quando tudo estiver pronto
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
