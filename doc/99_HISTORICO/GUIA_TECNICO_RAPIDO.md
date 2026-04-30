# 📖 GUIA TÉCNICO DE REFERÊNCIA RÁPIDA

## 1. COMO USAR OS STORES

### Pattern Básico

```typescript
import { authStore, feedStore } from '@/stores';

export function MyComponent() {
  // Destructure do store
  const { posts, isLoading, error, likePost, getFeed } = feedStore();
  
  useEffect(() => {
    getFeed(); // Carrega automaticamente
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} onLike={() => likePost(item.id)} />}
      keyExtractor={item => item.id}
    />
  );
}
```

### Padrão de Erro

```typescript
useEffect(() => {
  if (feedStore().error) {
    Alert.alert('Erro', feedStore().error);
    feedStore().clearError();
  }
}, [feedStore().error]);
```

### Async Actions

```typescript
// Quando chamar uma action, ela retorna uma Promise
try {
  await authStore().login(email, password);
  navigation.navigate('Home');
} catch (err) {
  // Erro já está em authStore().error
  Alert.alert('Erro', authStore().error);
}
```

---

## 2. FLUXO DE AUTENTICAÇÃO

```
Splash Screen
    ↓
Token válido? (verificar AsyncStorage)
    ├─ SIM → Tentar refresh token
    │         └─ Success → Navigate App
    │         └─ Fail → Navigate Auth
    └─ NÃO → Navigate Auth
             ↓
         Login Screen
             ↓
         Email + Senha
             ↓
         Requer 2FA? → SIM → Modal com QR code
         │                   └─ Input código
         │                   └─ Verify 2FA
         └─ NÃO → Direct login
             ↓
         Onboarding? (primeira vez)
         ├─ SIM → Carousel tour
         └─ NÃO → Home
             ↓
         Navigate App
             ↓
         BottomTabNavigator
```

---

## 3. ESTRUTURA DE TELAS

### Screen Básica

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { authStore, feedStore } from '@/stores';
import { PostCard } from '@/components';

export function HomeScreen() {
  // 1. Get store state
  const { posts, isLoadingFeed, error, feedHasMore } = feedStore();
  const { getFeed, loadMoreFeed, refreshFeed } = feedStore();
  
  // 2. Local state se necessário
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  
  // 3. Load data on mount
  useEffect(() => {
    getFeed();
  }, []);
  
  // 4. Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Erro', error);
      feedStore().clearError();
    }
  }, [error]);
  
  // 5. Render
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => setSelectedPost(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        refreshing={isLoadingFeed}
        onRefresh={refreshFeed}
        onEndReached={() => feedHasMore && loadMoreFeed()}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
```

### Screen com Modal

```typescript
export function ProfileScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const { profile, updateProfile } = userStore();
  
  const handleSave = async (newData) => {
    try {
      await updateProfile(newData);
      setShowEditModal(false);
      Alert.alert('Sucesso', 'Perfil atualizado');
    } catch (err) {
      Alert.alert('Erro', userStore().error);
    }
  };
  
  return (
    <View>
      <ScrollView>
        {/* Profile content */}
      </ScrollView>
      
      <Modal visible={showEditModal} animationType="slide">
        <EditProfileForm onSave={handleSave} onCancel={() => setShowEditModal(false)} />
      </Modal>
    </View>
  );
}
```

---

## 4. PADRÃO DE PAGINATION

```typescript
// Store já mantem track de page
const { posts, feedPage, feedHasMore, getFeed, loadMoreFeed } = feedStore();

// Carregar primeira página
useEffect(() => {
  getFeed(1); // Começa em page 1
}, []);

// Carregar mais (chamado pelo onEndReached)
const handleLoadMore = () => {
  if (feedHasMore && !isLoadingFeed) {
    loadMoreFeed(); // Automático incrementa página
  }
};

return (
  <FlatList
    // ... outras props
    onEndReached={handleLoadMore}
    onEndReachedThreshold={0.5}
  />
);
```

---

## 5. UPLOAD DE ARQUIVO

```typescript
import * as ImagePicker from 'expo-image-picker';

async function handleAvatarUpload() {
  // 1. Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  if (result.canceled) return;
  
  // 2. Upload com progress
  try {
    await userStore().uploadAvatar(
      result.assets[0].uri,
      'avatar.jpg',
      (progress) => {
        console.log(`Upload: ${progress}%`);
        setUploadProgress(progress);
      }
    );
    Alert.alert('Sucesso', 'Avatar atualizado');
  } catch (err) {
    Alert.alert('Erro', userStore().error);
  }
}
```

---

## 6. GEOLOCALIZAÇÃO

```typescript
import { GeolocationService } from '@/services';
import { locationStore } from '@/stores';

// No mount
useEffect(() => {
  initLocation();
}, []);

async function initLocation() {
  try {
    // Opção 1: Get location uma vez
    const location = await GeolocationService.getCurrentLocationWithFallback();
    
    // Opção 2: Watch location (updates contínuo)
    const watchId = await GeolocationService.watchLocation(
      (newLocation) => {
        console.log(`Latitude: ${newLocation.latitude}, Longitude: ${newLocation.longitude}`);
        // Update store com nova localização
        locationStore().getNearbyEvents(newLocation.latitude, newLocation.longitude);
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
    
    // Cleanup
    return () => {
      GeolocationService.stopWatching();
    };
  } catch (err) {
    console.error('Failed to get location:', err);
    // Fallback to São Paulo
  }
}

// Calcular distância
const distance = GeolocationService.calculateDistance(
  lat1, lon1,
  lat2, lon2 // em km
);

// Reverse geocode (coordenadas para endereço)
const address = await GeolocationService.getFormattedAddress(lat, lng);
```

---

## 7. SOCKET.IO PARA CHAT

```typescript
import { SocketIOManager } from '@/services';
import { chatStore } from '@/stores';

// Conectar ao abrir app (após login)
useEffect(() => {
  connectSocket();
}, [authStore().isAuthenticated]);

async function connectSocket() {
  try {
    await SocketIOManager.connect('http://localhost:3000'); // ou prod URL
    
    // Listeners para eventos reais
    SocketIOManager.on('message:received', (message) => {
      chatStore().addMessage(message); // Update store
    });
    
    SocketIOManager.on('typing:user', (data) => {
      chatStore().setTypingUser(data.conversationId, data.userId);
    });
    
    SocketIOManager.on('user:online', (data) => {
      // Update user status na UI
    });
    
  } catch (err) {
    console.error('Socket connection failed:', err);
  }
}

// Enviar mensagem
const handleSendMessage = async (conversationId: string, content: string) => {
  try {
    await chatStore().sendMessage(conversationId, content);
    // Mensagem já aparece na UI via store
    // Socket.io notifica outros usuários
  } catch (err) {
    Alert.alert('Erro', chatStore().error);
  }
};

// Typing indicator
const handleTextChange = (text: string) => {
  setText(text);
  
  if (text.length > 0) {
    SocketIOManager.setTyping(conversationId, true);
  } else {
    SocketIOManager.setTyping(conversationId, false);
  }
};

// Cleanup
useEffect(() => {
  return () => {
    SocketIOManager.disconnect();
  };
}, []);
```

---

## 8. MAPA COM EVENTOS/ESTABELECIMENTOS

```typescript
import MapView, { Marker, Callout } from 'react-native-maps';
import { locationStore } from '@/stores';

export function EventsScreen() {
  const { userLocation, events, getNearbyEvents } = locationStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  useEffect(() => {
    if (userLocation) {
      getNearbyEvents(userLocation.latitude, userLocation.longitude, 50);
    }
  }, [userLocation]);
  
  return (
    <View style={{ flex: 1 }}>
      {userLocation && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onRegionChangeComplete={(region) => {
            // Atualizar eventos ao mover mapa
            getNearbyEvents(region.latitude, region.longitude, 50);
          }}
        >
          {events.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              title={event.title}
              description={event.address}
              pinColor={event.category === 'music' ? 'red' : 'blue'}
              onPress={() => setSelectedEvent(event)}
            >
              <Callout>
                <View style={{ width: 200 }}>
                  <Text style={{ fontWeight: 'bold' }}>{event.title}</Text>
                  <Text>{new Date(event.startDate).toLocaleDateString()}</Text>
                  <Text>{event.attendeesCount} participantes</Text>
                  <Button 
                    title={event.isAttending ? 'Sair' : 'Participar'}
                    onPress={() => {
                      event.isAttending
                        ? locationStore().cancelAttendance(event.id)
                        : locationStore().attendEvent(event.id);
                    }}
                  />
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
}
```

---

## 9. FORMULÁRIOS COM VALIDAÇÃO

```typescript
import { useForm, Controller } from 'react-hook-form';

export function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data) => {
    try {
      await authStore().login(data.email, data.password);
      
      if (authStore().require2FA) {
        // Navigate to 2FA screen
      } else {
        navigation.replace('App');
      }
    } catch (err) {
      Alert.alert('Erro', authStore().error);
    }
  };
  
  return (
    <View>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email é obrigatório',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Email inválido',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Email"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            keyboardType="email-address"
            style={{
              borderColor: errors.email ? 'red' : 'gray',
              borderWidth: 1,
              padding: 10,
            }}
          />
        )}
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}
      
      <Button title="Entrar" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
```

---

## 10. DEBOUNCING PARA BUSCA

```typescript
import { useCallback, useRef } from 'react';
import { debounce } from 'lodash'; // ou implementar próprio

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const { searchUsers, searchResults, isLoading } = userStore();
  
  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length > 2) {
        await userStore().searchUsers(searchQuery);
      }
    }, 300),
    []
  );
  
  const handleSearch = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };
  
  return (
    <View>
      <TextInput
        placeholder="Buscar usuários..."
        value={query}
        onChangeText={handleSearch}
      />
      
      {isLoading && <ActivityIndicator />}
      
      <FlatList
        data={searchResults?.data || []}
        renderItem={({ item }) => <UserCard user={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={query.length > 2 && <Text>Nenhum resultado</Text>}
      />
    </View>
  );
}
```

---

## 11. ESTADOS DE LOADING E ERRO

```typescript
export function MyScreen() {
  const { data, isLoading, error, clearError } = myStore();
  
  // Estados
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeletons count={3} />;
    }
    
    if (error) {
      return (
        <ErrorView
          message={error}
          onRetry={() => myStore().fetchData()}
          onDismiss={() => clearError()}
        />
      );
    }
    
    if (!data || data.length === 0) {
      return <EmptyState message="Nenhum dado encontrado" />;
    }
    
    return <DataList items={data} />;
  };
  
  return <View style={{ flex: 1 }}>{renderContent()}</View>;
}
```

---

## 12. KEYBOARD HANDLING

```typescript
import { Keyboard, KeyboardAvoidingView } from 'react-native';

export function ChatScreen() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted // Latest message no bottom
      />
      
      <View style={{ paddingBottom: isKeyboardVisible ? 0 : 20 }}>
        <TextInput placeholder="Mensagem..." />
        <Button title="Enviar" />
      </View>
    </KeyboardAvoidingView>
  );
}
```

---

## 13. NAVIGATION PATTERNS

### Navegar entre telas

```typescript
// Navigate with params
navigation.navigate('PostDetail', { postId: '123' });

// Go back
navigation.goBack();

// Replace (não permite voltar)
navigation.replace('Home');

// Reset stack (limpar histórico)
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

// Get params
const route = useRoute();
const { postId } = route.params;
```

### Deep Linking

```typescript
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://myapp.com",
          "prefixes": ["https://myapp.com", "myapp://"]
        }
      ]
    ]
  }
}

// Navigation config
const linking = {
  prefixes: ['https://myapp.com', 'myapp://'],
  config: {
    screens: {
      Home: 'home',
      PostDetail: 'posts/:postId',
      Profile: 'users/:userId',
    },
  },
};
```

---

## 14. IMAGENS E OPTIMIZAÇÃO

```typescript
import FastImage from 'react-native-fast-image';
import { Image } from 'react-native';

// Fast image (melhor performance)
<FastImage
  style={{ width: 100, height: 100 }}
  source={{
    uri: 'https://example.com/image.jpg',
    priority: FastImage.priority.high,
  }}
/>

// Com fallback
<FastImage
  source={{ uri: imageUri }}
  fallback={true}
  defaultSource={require('@/assets/placeholder.png')}
/>

// Carousel de imagens
<ScrollView horizontal pagingEnabled>
  {images.map((img, idx) => (
    <Image key={idx} source={{ uri: img }} style={{ width: 300, height: 300 }} />
  ))}
</ScrollView>
```

---

## 15. TESTE RÁPIDO

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { feedStore } from '@/stores';

describe('Feed Store', () => {
  it('should load posts', async () => {
    const { result } = renderHook(() => feedStore());
    
    expect(result.current.isLoadingFeed).toBe(false);
    
    await act(async () => {
      await result.current.getFeed();
    });
    
    expect(result.current.posts.length).toBeGreaterThan(0);
  });
});
```

---

## 📋 CHECKLIST RÁPIDO POR FEATURE

### Para cada Screen:
- [ ] Import stores necessários
- [ ] useEffect para carregar dados
- [ ] useEffect para error handling
- [ ] FlatList com keyExtractor
- [ ] Loading/error/empty states
- [ ] Cleanup em return do useEffect

### Para cada Action:
- [ ] Try/catch wrapper
- [ ] Error alert ou toast
- [ ] Loading state feedback
- [ ] Navigation após sucesso

### Performance:
- [ ] useMemo para listas
- [ ] useCallback para handlers
- [ ] FlatList removeClippedSubviews
- [ ] Image optimization

### UX:
- [ ] Pull-to-refresh
- [ ] Infinite scroll
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error messages claros

---

**Última atualização**: 26/03/2026
