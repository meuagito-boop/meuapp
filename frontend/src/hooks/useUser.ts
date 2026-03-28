/**
 * Hook useUser - acesso simplificado ao user store
 * Uso: const { profile, followers, followUser } = useUser();
 */

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
        await store.getUserProfile(userId);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load user profile' };
      }
    },
    [store]
  );

  const updateProfile = useCallback(
    async (profileData: any) => {
      try {
        await store.updateProfile(profileData);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to update profile' };
      }
    },
    [store]
  );

  const uploadAvatar = useCallback(
    async (fileUri: string, filename: string = 'avatar') => {
      try {
        await store.uploadAvatar(fileUri, filename);
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
    async (userId?: string, page = 1, limit = 20) => {
      const targetUserId = userId || store.profile?.id;
      if (!targetUserId) {
        return { success: false, error: 'User ID not found' };
      }
      try {
        await store.getFollowers(targetUserId, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load followers' };
      }
    },
    [store]
  );

  const getFollowing = useCallback(
    async (userId?: string, page = 1, limit = 20) => {
      const targetUserId = userId || store.profile?.id;
      if (!targetUserId) {
        return { success: false, error: 'User ID not found' };
      }
      try {
        await store.getFollowing(targetUserId, page, limit);
        return { success: true };
      } catch (error) {
        return { success: false, error: store.error || 'Failed to load following' };
      }
    },
    [store]
  );

  return {
    profile: store.profile,
    followers: store.followers?.data || [],
    following: store.following?.data || [],
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    getProfile,
    getUserProfile,
    updateProfile,
    uploadAvatar,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
  };
};
