import { create } from 'zustand';
import { feedService } from '../services/api/index';

export interface Post {
  id: string;
  content: string;
  images?: string[];
  video?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedStore {
  // State
  posts: Post[];
  explorePosts: Post[];
  comments: Map<string, PaginatedResponse<Comment>>;
  isLoadingFeed: boolean;
  isLoadingExplore: boolean;
  feedPage: number;
  explorePage: number;
  feedHasMore: boolean;
  exploreHasMore: boolean;
  error: string | null;

  // Actions
  getFeed: (page?: number, limit?: number) => Promise<void>;
  getExplorePosts: (page?: number, limit?: number) => Promise<void>;
  getPost: (postId: string) => Promise<Post>;
  createPost: (content: string, images?: string[], video?: string) => Promise<void>;
  updatePost: (postId: string, content: string, images?: string[], video?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  getComments: (postId: string, page?: number, limit?: number) => Promise<void>;
  createComment: (postId: string, content: string) => Promise<void>;
  likeComment: (commentId: string, postId: string) => Promise<void>;
  unlikeComment: (commentId: string, postId: string) => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
  getUserPosts: (userId: string, page?: number, limit?: number) => Promise<Post[]>;
  refreshFeed: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  loadMoreExplore: () => Promise<void>;
  clearError: () => void;
}

export const feedStore = create<FeedStore>((set, get) => ({
  // Initial state
  posts: [],
  explorePosts: [],
  comments: new Map(),
  isLoadingFeed: false,
  isLoadingExplore: false,
  feedPage: 1,
  explorePage: 1,
  feedHasMore: true,
  exploreHasMore: true,
  error: null,

  // Actions
  getFeed: async (page = 1, limit = 20) => {
    set({ isLoadingFeed: true, error: null });
    try {
      const response = await feedService.getFeed(page, limit);

      if (page === 1) {
        set({
          posts: response.data,
          feedPage: page,
          feedHasMore: page < response.totalPages,
          isLoadingFeed: false,
        });
      } else {
        set((state) => ({
          posts: [...state.posts, ...response.data],
          feedPage: page,
          feedHasMore: page < response.totalPages,
          isLoadingFeed: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar feed';
      set({ error: message, isLoadingFeed: false });
      throw error;
    }
  },

  getExplorePosts: async (page = 1, limit = 20) => {
    set({ isLoadingExplore: true, error: null });
    try {
      const response = await feedService.explorePosts(page, limit);

      if (page === 1) {
        set({
          explorePosts: response.data,
          explorePage: page,
          exploreHasMore: page < response.totalPages,
          isLoadingExplore: false,
        });
      } else {
        set((state) => ({
          explorePosts: [...state.explorePosts, ...response.data],
          explorePage: page,
          exploreHasMore: page < response.totalPages,
          isLoadingExplore: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar exploração';
      set({ error: message, isLoadingExplore: false });
      throw error;
    }
  },

  getPost: async (postId) => {
    set({ error: null });
    try {
      return await feedService.getPost(postId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar post';
      set({ error: message });
      throw error;
    }
  },

  createPost: async (content, images, video) => {
    set({ isLoadingFeed: true, error: null });
    try {
      const newPost = await feedService.createPost({
        content,
        images,
        video,
      });

      set((state) => ({
        posts: [newPost, ...state.posts],
        isLoadingFeed: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar post';
      set({ error: message, isLoadingFeed: false });
      throw error;
    }
  },

  updatePost: async (postId, content, images, video) => {
    set({ error: null });
    try {
      const updatedPost = await feedService.updatePost(postId, {
        content,
        images,
        video,
      });

      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar post';
      set({ error: message });
      throw error;
    }
  },

  deletePost: async (postId) => {
    set({ error: null });
    try {
      await feedService.deletePost(postId);

      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
        explorePosts: state.explorePosts.filter((p) => p.id !== postId),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar post';
      set({ error: message });
      throw error;
    }
  },

  likePost: async (postId) => {
    set({ error: null });
    try {
      await feedService.likePost(postId);

      // Atualizar posts
      const updatePostLike = (posts: Post[]) =>
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: true,
                likesCount: p.likesCount + 1,
              }
            : p,
        );

      set((state) => ({
        posts: updatePostLike(state.posts),
        explorePosts: updatePostLike(state.explorePosts),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao curtir post';
      set({ error: message });
      throw error;
    }
  },

  unlikePost: async (postId) => {
    set({ error: null });
    try {
      await feedService.unlikePost(postId);

      // Atualizar posts
      const updatePostUnlike = (posts: Post[]) =>
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: false,
                likesCount: Math.max(0, p.likesCount - 1),
              }
            : p,
        );

      set((state) => ({
        posts: updatePostUnlike(state.posts),
        explorePosts: updatePostUnlike(state.explorePosts),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao descurtir post';
      set({ error: message });
      throw error;
    }
  },

  getComments: async (postId, page = 1, limit = 20) => {
    set({ error: null });
    try {
      const response = await feedService.getComments(postId, page, limit);

      set((state) => ({
        comments: new Map(state.comments).set(postId, response),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar comentários';
      set({ error: message });
      throw error;
    }
  },

  createComment: async (postId, content) => {
    set({ error: null });
    try {
      const newComment = await feedService.createComment(postId, {
        content,
      });

      // Atualizar post com novo comentário
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
        ),
        explorePosts: state.explorePosts.map((p) =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
        ),
        // Adicionar comentário à lista
        comments: new Map(state.comments).set(
          postId,
          {
            data: [newComment, ...(state.comments.get(postId)?.data || [])],
            total: (state.comments.get(postId)?.total || 0) + 1,
            page: 1,
            limit: 20,
            totalPages: Math.ceil(((state.comments.get(postId)?.total || 0) + 1) / 20),
          },
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao comentar';
      set({ error: message });
      throw error;
    }
  },

  likeComment: async (commentId, postId) => {
    set({ error: null });
    try {
      await feedService.likeComment(commentId);

      // Atualizar comentário
      set((state) => {
        const comments = state.comments.get(postId);
        if (!comments) return state;

        return {
          comments: new Map(state.comments).set(postId, {
            ...comments,
            data: comments.data.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    isLiked: true,
                    likesCount: c.likesCount + 1,
                  }
                : c,
            ),
          }),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao curtir comentário';
      set({ error: message });
      throw error;
    }
  },

  unlikeComment: async (commentId, postId) => {
    set({ error: null });
    try {
      await feedService.unlikeComment(commentId);

      // Atualizar comentário
      set((state) => {
        const comments = state.comments.get(postId);
        if (!comments) return state;

        return {
          comments: new Map(state.comments).set(postId, {
            ...comments,
            data: comments.data.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    isLiked: false,
                    likesCount: Math.max(0, c.likesCount - 1),
                  }
                : c,
            ),
          }),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao descurtir comentário';
      set({ error: message });
      throw error;
    }
  },

  deleteComment: async (commentId, postId) => {
    set({ error: null });
    try {
      await feedService.deleteComment(commentId);

      // Remover comentário
      set((state) => {
        const comments = state.comments.get(postId);
        if (!comments) return state;

        return {
          comments: new Map(state.comments).set(postId, {
            ...comments,
            data: comments.data.filter((c) => c.id !== commentId),
            total: Math.max(0, comments.total - 1),
          }),
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p,
          ),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar comentário';
      set({ error: message });
      throw error;
    }
  },

  getUserPosts: async (userId, page = 1, limit = 20) => {
    set({ error: null });
    try {
      const response = await feedService.getUserPosts(userId, page, limit);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar posts do usuário';
      set({ error: message });
      throw error;
    }
  },

  refreshFeed: async () => {
    await get().getFeed(1);
  },

  loadMoreFeed: async () => {
    const { feedPage, feedHasMore } = get();
    if (feedHasMore) {
      await get().getFeed(feedPage + 1);
    }
  },

  loadMoreExplore: async () => {
    const { explorePage, exploreHasMore } = get();
    if (exploreHasMore) {
      await get().getExplorePosts(explorePage + 1);
    }
  },

  clearError: () => set({ error: null }),
}));
