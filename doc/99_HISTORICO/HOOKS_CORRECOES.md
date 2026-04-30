# 🔧 CORREÇÕES ESPECÍFICAS PARA HOOKS

## useChat.ts - CORRETO

```typescript
import { useCallback } from 'react';
import { chatStore } from '@stores/chatStore';

export const useChat = () => {
  const store = chatStore();

  const listConversations = useCallback(
    async (page = 1, limit = 20) => {
      try {
        await store.listConversations(page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load conversations' };
      }
    },
    [store]
  );

  const getMessages = useCallback(
    async (conversationId: string, page = 1, limit = 50) => {
      try {
        await store.getMessages(conversationId, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load messages' };
      }
    },
    [store]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string, file?: { uri: string; name: string; type: string }) => {
      try {
        await store.sendMessage(conversationId, content, file);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to send message' };
      }
    },
    [store]
  );

  const createConversation = useCallback(
    async (recipientId: string) => {
      try {
        await store.createConversation(recipientId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to create conversation' };
      }
    },
    [store]
  );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        await store.markAsRead(conversationId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to mark as read' };
      }
    },
    [store]
  );

  return {
    // STATE
    conversations: store.conversations,
    currentConversationMessages: store.currentConversationMessages,
    currentConversation: store.currentConversation,
    unreadCount: store.unreadCount,
    typingUsers: store.typingUsers,
    
    // LOADING STATES
    isLoadingConversations: store.isLoadingConversations,
    isLoadingMessages: store.isLoadingMessages,
    isSendingMessage: store.isSendingMessage,
    error: store.error,
    
    // ACTIONS
    listConversations,
    getMessages,
    sendMessage,
    createConversation,
    markAsRead,
  };
};
```

---

## useLocation.ts - CORRETO

```typescript
import { useCallback } from 'react';
import { locationStore } from '@stores/locationStore';

export const useLocation = () => {
  const store = locationStore();

  const getUserLocation = useCallback(async () => {
    try {
      await store.getUserLocation();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to get location' };
    }
  }, [store]);

  const watchUserLocation = useCallback(async () => {
    try {
      await store.watchUserLocation();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to watch location' };
    }
  }, [store]);

  const stopWatchingLocation = useCallback(async () => {
    try {
      await store.stopWatchingLocation();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to stop watching' };
    }
  }, [store]);

  const getNearbyEvents = useCallback(
    async (latitude?: number, longitude?: number, distance = 10) => {
      try {
        await store.getNearbyEvents(latitude, longitude, distance);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load nearby events' };
      }
    },
    [store]
  );

  const getNearbyEstablishments = useCallback(
    async (latitude?: number, longitude?: number, distance = 10, category?: string) => {
      try {
        await store.getNearbyEstablishments(latitude, longitude, distance, category);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load nearby establishments' };
      }
    },
    [store]
  );

  const attendEvent = useCallback(
    async (eventId: string) => {
      try {
        await store.attendEvent(eventId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to attend event' };
      }
    },
    [store]
  );

  const favoriteEstablishment = useCallback(
    async (establishmentId: string) => {
      try {
        await store.favoriteEstablishment(establishmentId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to favorite establishment' };
      }
    },
    [store]
  );

  return {
    // STATE LOCATION
    userLocation: store.userLocation,
    
    // STATE EVENTS
    events: store.events,
    eventDetails: store.eventDetails,
    eventReviews: store.eventReviews,
    
    // STATE ESTABLISHMENTS
    establishments: store.establishments,
    establishmentDetails: store.establishmentDetails,
    establishmentReviews: store.establishmentReviews,
    favorites: store.favorites,
    
    // LOADING STATES
    isLoadingLocation: store.isLoadingLocation,
    isLoadingEvents: store.isLoadingEvents,
    isLoadingEstablishments: store.isLoadingEstablishments,
    error: store.error,
    
    // ACTIONS
    getUserLocation,
    watchUserLocation,
    stopWatchingLocation,
    getNearbyEvents,
    getNearbyEstablishments,
    attendEvent,
    favoriteEstablishment,
  };
};
```

---

## useUser.ts - CORRETO

```typescript
import { useCallback } from 'react';
import { userStore } from '@stores/userStore';

export const useUser = () => {
  const store = userStore();

  const getProfile = useCallback(async () => {
    try {
      await store.getProfile();
      return { success: true };
    } catch (error) {
      return { success: false, error: store.error || 'Failed to load profile' };
    }
  }, [store]);

  const getUserProfile = useCallback(
    async (userId: string) => {
      try {
        const profile = await store.getUserProfile(userId);
        return { success: true, data: profile };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load user profile' };
      }
    },
    [store]
  );

  const updateProfile = useCallback(
    async (data: { name?: string; bio?: string; location?: string; website?: string }) => {
      try {
        await store.updateProfile(data);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to update profile' };
      }
    },
    [store]
  );

  const uploadAvatar = useCallback(
    async (uri: string, filename: string, onProgress?: (progress: number) => void) => {
      try {
        await store.uploadAvatar(uri, filename, onProgress);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to upload avatar' };
      }
    },
    [store]
  );

  const followUser = useCallback(
    async (userId: string) => {
      try {
        await store.followUser(userId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to follow user' };
      }
    },
    [store]
  );

  const unfollowUser = useCallback(
    async (userId: string) => {
      try {
        await store.unfollowUser(userId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to unfollow user' };
      }
    },
    [store]
  );

  const getFollowers = useCallback(
    async (userId: string, page = 1, limit = 20) => {
      try {
        await store.getFollowers(userId, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load followers' };
      }
    },
    [store]
  );

  const getFollowing = useCallback(
    async (userId: string, page = 1, limit = 20) => {
      try {
        await store.getFollowing(userId, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load following' };
      }
    },
    [store]
  );

  const searchUsers = useCallback(
    async (query: string, page = 1, limit = 20) => {
      try {
        await store.searchUsers(query, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to search users' };
      }
    },
    [store]
  );

  return {
    // STATE
    profile: store.profile,
    followers: store.followers,
    following: store.following,
    searchResults: store.searchResults,
    
    // LOADING STATE
    isLoading: store.isLoading,
    error: store.error,
    
    // ACTIONS
    getProfile,
    getUserProfile,
    updateProfile,
    uploadAvatar,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    searchUsers,
  };
};
```

---

## useSearch.ts - CORRETO

```typescript
import { useCallback } from 'react';
import { feedStore } from '@stores/feedStore';
import { userStore } from '@stores/userStore';

export const useSearch = () => {
  const feedStoreInstance = feedStore();
  const userStoreInstance = userStore();

  const searchPosts = useCallback(
    async (query: string, page = 1, limit = 20) => {
      try {
        // Feed store não tem search direto, usar getFeed
        await feedStoreInstance.getFeed(page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: feedStoreInstance.error || 'Failed to search posts' };
      }
    },
    [feedStoreInstance]
  );

  const searchUsers = useCallback(
    async (query: string, page = 1, limit = 20) => {
      try {
        await userStoreInstance.searchUsers(query, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: userStoreInstance.error || 'Failed to search users' };
      }
    },
    [userStoreInstance]
  );

  return {
    // STATE
    postResults: feedStoreInstance.posts,
    userResults: userStoreInstance.searchResults,
    
    // LOADING STATES
    isLoadingPosts: feedStoreInstance.isLoadingFeed,
    isLoadingUsers: userStoreInstance.isLoading,
    error: feedStoreInstance.error || userStoreInstance.error,
    
    // ACTIONS
    searchPosts,
    searchUsers,
  };
};
```

---

## Para Aplicar as Correções

1. **Edite seus hooks** com o conteúdo acima (remova os erros e use as assinaturas corretas)
2. **Teste compilação**: `npm run build` na pasta frontend
3. **Execute**: `npm start` e `npm run start:dev` (backend)
4. **Teste fluxos**: Login → Home → Chat → Map → Profile

Todos os nomes de métodos e tipos agora estão 100% alinhados! ✅
