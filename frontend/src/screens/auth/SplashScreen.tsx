import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// Usando locationStore de @stores/
import { authStore } from '@stores/authStore';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { isLoading: isLoadingLocation } = useLocationStore();
  const { isAuthenticated, refreshToken, logout, user } = authStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Se usuário está autenticado, tentar refresh do token
        if (isAuthenticated && user) {
          try {
            await refreshToken();
            // Refresh bem-sucedido, navegar para app
            navigation.navigate('Home' as never);
          } catch (error) {
            // Refresh falhou, logout e voltar para login
            await logout();
            navigation.navigate('Login' as never);
          }
        } else {
          // Sem autenticação, ir para login (após 1.5s de splash)
          const timer = setTimeout(() => {
            navigation.navigate('Login' as never);
          }, 1500);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Em caso de erro inesperado, ir para login
        const timer = setTimeout(() => {
          navigation.navigate('Login' as never);
        }, 1500);
        return () => clearTimeout(timer);
      }
    };

    initializeApp();
  }, [navigation, isAuthenticated, user, refreshToken, logout]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meu Agito</Text>
        <Text style={styles.subtitle}>Descobra estabelecimentos e eventos perto de você</Text>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>
            {isLoadingLocation ? 'Obtendo sua localização...' : 'Inicializando...'}
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
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  locationInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
  },
  footer: {
    paddingBottom: 30,
  },
});
