import { useCallback, useState } from 'react';
import { searchService } from '@services/api';
import type {
  SearchEstablishment,
  SearchPost,
  SearchUser,
} from '@services/api/SearchService';

export const useSearch = () => {
  const [feedResults, setFeedResults] = useState<SearchPost[]>([]);
  const [userResults, setUserResults] = useState<SearchUser[]>([]);
  const [establishmentResults, setEstablishmentResults] = useState<SearchEstablishment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPosts = useCallback(async (query: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchService.searchPosts({
        q: query,
        page,
        limit,
      });
      setFeedResults(response.data);
      return { success: true, data: response.data };
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'Failed to search posts';
      setError(message);
      setFeedResults([]);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchService.searchUsers(query, page, limit);
      setUserResults(response.data);
      return { success: true, data: response.data };
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'Failed to search users';
      setError(message);
      setUserResults([]);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchEstablishments = useCallback(
    async (query: string, latitude: number, longitude: number, radiusKm = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchService.searchEstablishments({
          q: query,
          latitude,
          longitude,
          distance: radiusKm,
          page: 1,
          limit: 20,
        });
        setEstablishmentResults(response.data);
        return { success: true, data: response.data };
      } catch (searchError) {
        const message =
          searchError instanceof Error ? searchError.message : 'Failed to search establishments';
        setError(message);
        setEstablishmentResults([]);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearSearch = useCallback(() => {
    setFeedResults([]);
    setUserResults([]);
    setEstablishmentResults([]);
    setError(null);
    return { success: true };
  }, []);

  return {
    feedResults,
    userResults,
    establishmentResults,
    isLoading,
    error,
    searchPosts,
    searchUsers,
    searchEstablishments,
    clearSearch,
  };
};
