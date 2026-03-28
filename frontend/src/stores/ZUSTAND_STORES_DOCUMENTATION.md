# Zustand Stores Documentation

## Overview

O projeto utiliza **Zustand** para gerenciamento de estado global. Cada store é responsável por uma área específica da aplicação:

- **authStore**: Autenticação e tokens
- **userStore**: Perfil de usuário e relacionamentos
- **feedStore**: Posts, comentários e curtidas
- **chatStore**: Conversas e mensagens
- **locationStore**: Eventos e estabelecimentos

## Installation

```bash
npm install zustand
npm install @react-native-async-storage/async-storage
```

---

## 1. Auth Store

Gerencia autenticação, tokens e estado de login/logout.

### State

```typescript
{
  user: UserAuth | null;           // Usuário logado
  tokens: AuthTokens | null;       // Access + Refresh tokens
  isAuthenticated: boolean;        // Está logado?
  isLoading: boolean;              // Carregando requisição
  error: string | null;            // Mensagem de erro
  require2FA: boolean;             // Precisa de 2FA
  tempEmail: string | null;        // Email temporário para 2FA
}
```

### Usage Example

```typescript
import { authStore } from '@/stores';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, require2FA } = authStore();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Se require2FA, ir para tela de 2FA
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      <TextInput 
        value={email} 
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput 
        value={password} 
        onChangeText={setPassword}
        placeholder="Senha"
        secureTextEntry
      />
      <Button
        onPress={handleLogin}
        disabled={isLoading}
        title={isLoading ? 'Carregando...' : 'Entrar'}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

### Methods

- `signup(email, name, password)` - Registrar novo usuário
- `login(email, password)` - Fazer login
- `loginWith2FA(email, code)` - Login com código 2FA
- `logout()` - Fazer logout
- `refreshToken()` - Renovar access token
- `setup2FA()` - Configurar autenticação 2FA
- `verify2FA(code, secret)` - Verificar código 2FA
- `requestPasswordReset(email)` - Solicitar reset de senha
- `resetPassword(token, newPassword)` - Resetar senha
- `changePassword(current, new)` - Alterar senha atual
- `clearError()` - Limpar mensagem de erro
- `setUser(user)` - Definir usuário logado

---

## 2. User Store

Gerencia perfil de usuário, followers e following.

### State

```typescript
{
  profile: UserProfile | null;                    // Perfil do usuário
  followers: PaginatedResponse<UserProfile>;      // Lista de seguidores
  following: PaginatedResponse<UserProfile>;      // Lista seguindo
  searchResults: PaginatedResponse<UserProfile>;  // Resultados de busca
  isLoading: boolean;                             // Carregando
  error: string | null;                           // Erro
}
```

### Usage Example

```typescript
import { userStore } from '@/stores';

export function ProfileScreen({ userId }: { userId: string }) {
  const [profile, setProfile] = useState(null);
  const { getProfile, updateProfile, uploadAvatar, isLoading } = userStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setProfile(profile);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpload = async (imageUri: string) => {
    try {
      await uploadAvatar(imageUri, 'avatar.jpg', (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView>
      {profile && (
        <>
          <Image
            source={{ uri: profile.avatar }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          <Text>{profile.name}</Text>
          <Text>{profile.bio}</Text>
          <Text>Seguidores: {profile.followersCount}</Text>
          <Text>Seguindo: {profile.followingCount}</Text>
          <Button 
            onPress={() => handleAvatarUpload(pickerResult.uri)}
            title="Alterar Avatar"
          />
        </>
      )}
    </ScrollView>
  );
}
```

### Methods

- `getProfile()` - Carregar perfil do usuário logado
- `getUserProfile(userId)` - Carregar perfil de outro usuário
- `updateProfile(data)` - Atualizar informações do perfil
- `uploadAvatar(uri, filename, onProgress)` - Enviar novo avatar
- `followUser(userId)` - Seguir um usuário
- `unfollowUser(userId)` - Deixar de seguir
- `getFollowers(userId, page, limit)` - Listar seguidores
- `getFollowing(userId, page, limit)` - Listar seguindo
- `searchUsers(query, page, limit)` - Buscar usuários
- `deleteAccount()` - Deletar conta do usuário
- `clearError()` - Limpar erro
- `isFollowingUser(userId)` - Verificar se segue usuário

---

## 3. Feed Store

Gerencia posts, comentários, curtidas e feed.

### State

```typescript
{
  posts: Post[];                          // Posts do feed
  explorePosts: Post[];                   // Posts exploração
  comments: Map<postId, Comment[]>;       // Comentários por post
  isLoadingFeed: boolean;
  isLoadingExplore: boolean;
  feedPage: number;                       // Página atual do feed
  explorePage: number;                    // Página atual exploração
  feedHasMore: boolean;                   // Tem mais posts no feed?
  exploreHasMore: boolean;                // Tem mais posts exploração?
  error: string | null;
}
```

### Usage Example

```typescript
import { feedStore } from '@/stores';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export function HomeScreen() {
  const {
    posts,
    isLoadingFeed,
    feedHasMore,
    getFeed,
    createPost,
    likePost,
    unlikePost,
    loadMoreFeed,
    refreshFeed,
  } = feedStore();

  useEffect(() => {
    getFeed();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: item.author.avatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.author.name}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={{ marginTop: 10 }}>{item.content}</Text>
      {item.images?.map((img, idx) => (
        <Image
          key={idx}
          source={{ uri: img }}
          style={{ width: '100%', height: 200, marginTop: 10 }}
        />
      ))}
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => (item.isLiked ? unlikePost(item.id) : likePost(item.id))}
        >
          <Text style={{ color: item.isLiked ? 'red' : '#666' }}>
            ❤️ {item.likesCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 20 }}>
          <Text>💬 {item.commentsCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      onRefresh={refreshFeed}
      refreshing={isLoadingFeed}
      onEndReached={() => feedHasMore && loadMoreFeed()}
      onEndReachedThreshold={0.5}
    />
  );
}
```

### Methods

- `getFeed(page, limit)` - Carregar feed personalizado
- `getExplorePosts(page, limit)` - Carregar exploração pública
- `getPost(postId)` - Carregar detalhes de um post
- `createPost(content, images, video)` - Criar novo post
- `updatePost(postId, data)` - Editar post
- `deletePost(postId)` - Deletar post
- `likePost(postId)` - Curtir post
- `unlikePost(postId)` - Descurtir post
- `getComments(postId, page, limit)` - Carregar comentários
- `createComment(postId, content)` - Comentar
- `likeComment(commentId, postId)` - Curtir comentário
- `unlikeComment(commentId, postId)` - Descurtir comentário
- `deleteComment(commentId, postId)` - Deletar comentário
- `getUserPosts(userId, page, limit)` - Posts de um usuário
- `refreshFeed()` - Atualizar feed (pull-to-refresh)
- `loadMoreFeed()` - Carregar mais posts
- `loadMoreExplore()` - Carregar mais exploração
- `clearError()` - Limpar erro

---

## 4. Chat Store

Gerencia conversas e mensagens em tempo real.

### State

```typescript
{
  conversations: Conversation[];                  // Lista de conversas
  messages: Map<conversationId, Message[]>;       // Mensagens por conversa
  currentConversation: Conversation | null;       // Conversa aberta
  currentConversationMessages: Message[];         // Mensagens da conversa aberta
  unreadCount: UnreadCount | null;                // Contagem não lidos
  typingUsers: Map<conversationId, Set<userId>>; // Quem está digitando
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
}
```

### Usage Example

```typescript
import { chatStore } from '@/stores';
import SocketIOManager from '@/services/socket/SocketIOManager';

export function ChatScreen() {
  const {
    currentConversation,
    currentConversationMessages,
    sendMessage,
    markAsRead,
    typingUsers,
  } = chatStore();

  const [text, setText] = useState('');

  const handleSendMessage = async () => {
    if (!currentConversation) return;
    
    try {
      await sendMessage(currentConversation.id, text);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentConversation) return;
    SocketIOManager.setTyping(currentConversation.id, isTyping);
  };

  const typingList = typingUsers.get(currentConversation?.id || '') || new Set();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={currentConversationMessages}
        renderItem={({ item }) => (
          <View style={{
            alignSelf: item.sender.id === authStore().user?.id ? 'flex-end' : 'flex-start',
            backgroundColor: item.sender.id === authStore().user?.id ? '#007AFF' : '#E5E5EA',
            marginVertical: 5,
            marginHorizontal: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
          }}>
            <Text style={{ color: item.sender.id === authStore().user?.id ? '#fff' : '#000' }}>
              {item.content}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {typingList.size > 0 && (
        <Text style={{ padding: 10, fontStyle: 'italic' }}>
          {Array.from(typingList).join(', ')} está digitando...
        </Text>
      )}

      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder="Mensagem..."
          style={{ flex: 1, borderWidth: 1, paddingHorizontal: 10 }}
        />
        <Button
          onPress={handleSendMessage}
          title="Enviar"
        />
      </View>
    </View>
  );
}
```

### Methods

- `createConversation(recipientId)` - Iniciar conversa
- `listConversations(page, limit)` - Listar conversas
- `getConversation(conversationId)` - Abrir conversa
- `getMessages(conversationId, page, limit)` - Carregar mensagens
- `sendMessage(conversationId, content, file)` - Enviar mensagem
- `editMessage(messageId, content, conversationId)` - Editar mensagem
- `deleteMessage(messageId, conversationId)` - Deletar mensagem
- `markAsRead(conversationId)` - Marcar como lido
- `searchConversations(query)` - Buscar conversas
- `getUnreadCount()` - Contar não lidos
- `archiveConversation(conversationId)` - Arquivar conversa
- `setCurrentConversation(conversation)` - Definir conversa atual
- `loadMoreMessages(conversationId)` - Carregar mais mensagens
- `setTypingUser(conversationId, userId)` - Marcador de digitação
- `removeTypingUser(conversationId, userId)` - Remover marcador
- `addMessage(message)` - Adicionar mensagem (Socket.io)
- `clearError()` - Limpar erro

---

## 5. Location Store

Gerencia eventos e estabelecimentos baseados em localização.

### State

```typescript
{
  userLocation: Coordinates | null;               // Localização do usuário
  events: Event[];                                // Eventos próximos
  establishments: Establishment[];                // Estabelecimentos próximos
  eventDetails: Map<eventId, Event>;              // Detalhes de eventos
  establishmentDetails: Map<estabId, Estab>;     // Detalhes estabelecimentos
  eventReviews: Map<eventId, Review[]>;           // Avaliações eventos
  establishmentReviews: Map<estabId, Review[]>;  // Avaliações estabelecimentos
  favorites: string[];                            // IDs estabelecimentos favoritos
  isLoadingLocation: boolean;
  isLoadingEvents: boolean;
  isLoadingEstablishments: boolean;
  error: string | null;
}
```

### Usage Example

```typescript
import { locationStore } from '@/stores';
import MapView, { Marker } from 'react-native-maps';

export function EventsScreen() {
  const {
    userLocation,
    events,
    isLoadingEvents,
    getUserLocation,
    getNearbyEvents,
    attendEvent,
    cancelAttendance,
  } = locationStore();

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    try {
      await getUserLocation();
      await getNearbyEvents();
    } catch (err) {
      console.error(err);
    }
  };

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
            />
          ))}
        </MapView>
      )}

      <ScrollView style={{ padding: 10 }}>
        {events.map((event) => (
          <View key={event.id} style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{event.title}</Text>
            <Text>{new Date(event.startDate).toLocaleDateString()}</Text>
            <Text>{event.address}</Text>
            <Text>{event.attendeesCount} pessoas</Text>
            <Button
              onPress={() =>
                event.isAttending
                  ? cancelAttendance(event.id)
                  : attendEvent(event.id)
              }
              title={event.isAttending ? 'Sair' : 'Participar'}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

### Methods

**Location:**
- `getUserLocation()` - Obter localização atual do usuário
- `watchUserLocation(callback)` - Monitorar localização em tempo real
- `stopWatchingLocation()` - Parar de monitorar

**Events:**
- `getNearbyEvents(lat, lng, distance, page, limit)` - Buscar eventos próximos
- `getEvent(eventId)` - Detalhes de um evento
- `createEvent(data)` - Criar novo evento
- `updateEvent(eventId, data)` - Editar evento
- `deleteEvent(eventId)` - Deletar evento
- `attendEvent(eventId)` - Participar de evento
- `cancelAttendance(eventId)` - Cancelar participação
- `getEventAttendees(eventId, page, limit)` - Lista de participantes
- `getEventReviews(eventId, page, limit)` - Avaliações do evento
- `createEventReview(eventId, rating, comment)` - Avaliar evento

**Establishments:**
- `getNearbyEstablishments(lat, lng, distance, category, page, limit)` - Buscar estabelecimentos
- `getEstablishment(establishmentId)` - Detalhes de estabelecimento
- `createEstablishment(data)` - Criar novo estabelecimento
- `updateEstablishment(estabId, data)` - Editar estabelecimento
- `deleteEstablishment(estabId)` - Deletar estabelecimento
- `favoriteEstablishment(estabId)` - Adicionar aos favoritos
- `unfavoriteEstablishment(estabId)` - Remover dos favoritos
- `getEstablishmentReviews(estabId, page, limit)` - Avaliações
- `createEstablishmentReview(estabId, rating, comment)` - Avaliar estabelecimento
- `isFavorited(estabId)` - Verificar se é favorito

---

## Best Practices

### 1. Using Multiple Stores

```typescript
import { authStore, feedStore } from '@/stores';

export function MyComponent() {
  const { isAuthenticated } = authStore();
  const { posts, likePost } = feedStore();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <FlatList data={posts} {...} />;
}
```

### 2. Async Operations

```typescript
// Store action já retorna promessa
try {
  await feedStore().createPost(content);
  // Post criado com sucesso
} catch (err) {
  // Handle erro
}
```

### 3. Cleaning Up

```typescript
useEffect(() => {
  // Cleanup function
  return () => {
    locationStore().stopWatchingLocation();
  };
}, []);
```

### 4. Error Handling

```typescript
const { error, clearError } = feedStore();

useEffect(() => {
  if (error) {
    Alert.alert('Erro', error);
    clearError();
  }
}, [error]);
```

---

## Testing

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { authStore } from '@/stores';

describe('Auth Store', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => authStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

---

## Summary

| Store | Purpose | Key Methods |
|-------|---------|-------------|
| **authStore** | Autenticação | login, logout, refreshToken |
| **userStore** | Perfil | getProfile, updateProfile, followUser |
| **feedStore** | Posts | getFeed, createPost, likePost |
| **chatStore** | Mensagens | sendMessage, markAsRead, createConversation |
| **locationStore** | Locais | getNearbyEvents, favoriteEstablishment |

Todos os stores incluem tratamento de erro e estados de carregamento para melhor experiência de usuário.
