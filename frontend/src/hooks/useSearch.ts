/**
 * Hook useSearch - acesso combinado para buscas de usuários e posts
 * Uso: const { searchResults, searchUsers } = useSearch();
 */

import { useCallback } from 'react';
import { feedStore } from '@stores/feedStore';
import { userStore } from '@stores/userStore';

export const useSearch = () => {
  const feedStoreInstance = feedStore();
  const userStoreInstance = userStore();

  const searchPosts = useCallback(
    async (query: string, page = 1, limit = 20) => {
      try {
        // Implementar search de posts via feedStore
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
        // Implementar search de usuários via userStore
        // await userStoreInstance.searchUsers(query, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: userStoreInstance.error || 'Failed to search users' };
      }
    },
    [userStoreInstance]
  );

  const searchEstablishments = useCallback(
    async (query: string, latitude: number, longitude: number, radiusKm = 10) => {
      try {
        // Implementar search de estabelecimentos
        // const results = await establishmentService.search(query, latitude, longitude, radiusKm);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to search establishments' };
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    return { success: true };
  }, []);

  return {
    feedResults: feedStoreInstance.posts || [],
    userResults: userStoreInstance.following?.data || [],
    isLoading: feedStoreInstance.isLoadingFeed || feedStoreInstance.isLoadingExplore || userStoreInstance.isLoading,
    error: feedStoreInstance.error || userStoreInstance.error,
    
    // Actions
    searchPosts,
    searchUsers,
    searchEstablishments,
    clearSearch,
  };
};
