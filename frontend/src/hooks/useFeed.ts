/**
 * Hook useFeed - acesso simplificado ao feed store
 */

import { useCallback } from 'react';
import { feedStore } from '@stores/feedStore';

export const useFeed = () => {
  const store = feedStore();

  const getFeed = useCallback(
    async (page = 1, limit = 20) => {
      try {
        await store.getFeed(page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error };
      }
    },
    [store]
  );

  const likePost = useCallback(
    async (postId: string) => {
      try {
        await store.likePost(postId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error };
      }
    },
    [store]
  );

  const createPost = useCallback(
    async (content: string, images?: string[]) => {
      try {
        await store.createPost(content, images);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error };
      }
    },
    [store]
  );

  return {
    posts: store.posts,
    isLoading: store.isLoadingFeed,
    error: store.error,
    getFeed,
    likePost,
    createPost,
    deletePost: store.deletePost,
    loadMoreFeed: store.loadMoreFeed,
    refreshFeed: store.refreshFeed,
    clearError: store.clearError,
  };
};
