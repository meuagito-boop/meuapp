import { create } from 'zustand';
import { feedService } from '../services/api/index';
import type { FeedMode } from '../services/api/FeedService';

export interface Post {
  id: string;
  content: string;
  images?: string[];
  imageUrls?: string[];
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  author: {
    id: string;
    name: string;
    avatar?: string;
    profileType?: 'USER' | 'ESTABLISHMENT';
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

const mergeUniquePosts = (existing: Post[], incoming: Post[]) => {
  const seen = new Set(existing.map((post) => post.id));
  const merged = [...existing];

  for (const post of incoming) {
    if (!seen.has(post.id)) {
      merged.push(post);
      seen.add(post.id);
    }
  }

  return merged;
};

const mapPostCollection = (posts: Post[], postId: string, mapper: (post: Post) => Post) =>
  posts.map((post) => (post.id === postId ? mapper(post) : post));

export interface FeedStore {
  posts: Post[];
  agitoPosts: Post[];
  agitoMode: FeedMode;
  agitoCursor: string | null;
  agitoHasMore: boolean;
  explorePosts: Post[];
  comments: Map<string, PaginatedResponse<Comment>>;
  isLoadingFeed: boolean;
  isLoadingAgito: boolean;
  isLoadingExplore: boolean;
  feedPage: number;
  explorePage: number;
  feedHasMore: boolean;
  exploreHasMore: boolean;
  error: string | null;

  getFeed: (page?: number, limit?: number) => Promise<void>;
  getAgitoFeed: (mode?: FeedMode, options?: { reset?: boolean; limit?: number }) => Promise<void>;
  setAgitoMode: (mode: FeedMode) => void;
  getExplorePosts: (page?: number, limit?: number) => Promise<void>;
  getPost: (postId: string) => Promise<Post>;
  createPost: (content: string, images?: string[]) => Promise<void>;
  updatePost: (postId: string, content: string, images?: string[]) => Promise<void>;
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
  refreshAgitoFeed: () => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  loadMoreAgitoFeed: () => Promise<void>;
  loadMoreExplore: () => Promise<void>;
  clearError: () => void;
}

export const feedStore = create<FeedStore>((set, get) => ({
  posts: [],
  agitoPosts: [],
  agitoMode: 'mixed',
  agitoCursor: null,
  agitoHasMore: true,
  explorePosts: [],
  comments: new Map(),
  isLoadingFeed: false,
  isLoadingAgito: false,
  isLoadingExplore: false,
  feedPage: 1,
  explorePage: 1,
  feedHasMore: true,
  exploreHasMore: true,
  error: null,

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

  getAgitoFeed: async (mode, options) => {
    const resolvedMode = mode ?? get().agitoMode;
    const reset = options?.reset ?? false;
    const limit = options?.limit ?? 15;

    set({
      isLoadingAgito: true,
      error: null,
      ...(mode ? { agitoMode: resolvedMode } : {}),
    });

    try {
      const response = await feedService.getAgitoFeed({
        mode: resolvedMode,
        limit,
        cursor: reset ? undefined : get().agitoCursor ?? undefined,
      });

      set((state) => ({
        agitoPosts: reset ? response.data : mergeUniquePosts(state.agitoPosts, response.data),
        agitoMode: resolvedMode,
        agitoCursor: response.nextCursor,
        agitoHasMore: response.hasMore,
        isLoadingAgito: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar feed social';
      set({ error: message, isLoadingAgito: false });
      throw error;
    }
  },

  setAgitoMode: (mode) => {
    set({
      agitoMode: mode,
      agitoCursor: null,
      agitoHasMore: true,
      agitoPosts: [],
    });
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
      const message = error instanceof Error ? error.message : 'Erro ao carregar exploracao';
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

  createPost: async (content, images) => {
    set({ isLoadingFeed: true, isLoadingAgito: true, error: null });
    try {
      const newPost = await feedService.createPost({
        content,
        images,
      });

      set((state) => ({
        posts: [newPost, ...state.posts],
        agitoPosts: [newPost, ...state.agitoPosts],
        isLoadingFeed: false,
        isLoadingAgito: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar post';
      set({ error: message, isLoadingFeed: false, isLoadingAgito: false });
      throw error;
    }
  },

  updatePost: async (postId, content, images) => {
    set({ error: null });
    try {
      const updatedPost = await feedService.updatePost(postId, {
        content,
        images,
      });

      set((state) => ({
        posts: mapPostCollection(state.posts, postId, () => updatedPost),
        agitoPosts: mapPostCollection(state.agitoPosts, postId, () => updatedPost),
        explorePosts: mapPostCollection(state.explorePosts, postId, () => updatedPost),
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
        posts: state.posts.filter((post) => post.id !== postId),
        agitoPosts: state.agitoPosts.filter((post) => post.id !== postId),
        explorePosts: state.explorePosts.filter((post) => post.id !== postId),
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

      const applyLike = (posts: Post[]) =>
        mapPostCollection(posts, postId, (post) => ({
          ...post,
          isLiked: true,
          likesCount: post.likesCount + 1,
        }));

      set((state) => ({
        posts: applyLike(state.posts),
        agitoPosts: applyLike(state.agitoPosts),
        explorePosts: applyLike(state.explorePosts),
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

      const applyUnlike = (posts: Post[]) =>
        mapPostCollection(posts, postId, (post) => ({
          ...post,
          isLiked: false,
          likesCount: Math.max(0, post.likesCount - 1),
        }));

      set((state) => ({
        posts: applyUnlike(state.posts),
        agitoPosts: applyUnlike(state.agitoPosts),
        explorePosts: applyUnlike(state.explorePosts),
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
      const message = error instanceof Error ? error.message : 'Erro ao carregar comentarios';
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

      set((state) => ({
        posts: mapPostCollection(state.posts, postId, (post) => ({
          ...post,
          commentsCount: post.commentsCount + 1,
        })),
        agitoPosts: mapPostCollection(state.agitoPosts, postId, (post) => ({
          ...post,
          commentsCount: post.commentsCount + 1,
        })),
        explorePosts: mapPostCollection(state.explorePosts, postId, (post) => ({
          ...post,
          commentsCount: post.commentsCount + 1,
        })),
        comments: new Map(state.comments).set(postId, {
          data: [newComment, ...(state.comments.get(postId)?.data || [])],
          total: (state.comments.get(postId)?.total || 0) + 1,
          page: 1,
          limit: 20,
          totalPages: Math.ceil(((state.comments.get(postId)?.total || 0) + 1) / 20),
        }),
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

      set((state) => {
        const comments = state.comments.get(postId);
        if (!comments) {
          return state;
        }

        return {
          comments: new Map(state.comments).set(postId, {
            ...comments,
            data: comments.data.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: true,
                    likesCount: comment.likesCount + 1,
                  }
                : comment
            ),
          }),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao curtir comentario';
      set({ error: message });
      throw error;
    }
  },

  unlikeComment: async (commentId, postId) => {
    set({ error: null });
    try {
      await feedService.unlikeComment(commentId);

      set((state) => {
        const comments = state.comments.get(postId);
        if (!comments) {
          return state;
        }

        return {
          comments: new Map(state.comments).set(postId, {
            ...comments,
            data: comments.data.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: false,
                    likesCount: Math.max(0, comment.likesCount - 1),
                  }
                : comment
            ),
          }),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao descurtir comentario';
      set({ error: message });
      throw error;
    }
  },

  deleteComment: async (commentId, postId) => {
    set({ error: null });
    try {
      await feedService.deleteComment(commentId);

      set((state) => {
        const comments = state.comments.get(postId);
        if (!comments) {
          return state;
        }

        return {
          comments: new Map(state.comments).set(postId, {
            ...comments,
            data: comments.data.filter((comment) => comment.id !== commentId),
            total: Math.max(0, comments.total - 1),
          }),
          posts: mapPostCollection(state.posts, postId, (post) => ({
            ...post,
            commentsCount: Math.max(0, post.commentsCount - 1),
          })),
          agitoPosts: mapPostCollection(state.agitoPosts, postId, (post) => ({
            ...post,
            commentsCount: Math.max(0, post.commentsCount - 1),
          })),
          explorePosts: mapPostCollection(state.explorePosts, postId, (post) => ({
            ...post,
            commentsCount: Math.max(0, post.commentsCount - 1),
          })),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar comentario';
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
      const message = error instanceof Error ? error.message : 'Erro ao carregar posts do usuario';
      set({ error: message });
      throw error;
    }
  },

  refreshFeed: async () => {
    await get().getFeed(1);
  },

  refreshAgitoFeed: async () => {
    await get().getAgitoFeed(get().agitoMode, { reset: true });
  },

  loadMoreFeed: async () => {
    const { feedPage, feedHasMore } = get();
    if (feedHasMore) {
      await get().getFeed(feedPage + 1);
    }
  },

  loadMoreAgitoFeed: async () => {
    const { agitoHasMore, isLoadingAgito, agitoMode } = get();
    if (!agitoHasMore || isLoadingAgito) {
      return;
    }

    await get().getAgitoFeed(agitoMode);
  },

  loadMoreExplore: async () => {
    const { explorePage, exploreHasMore } = get();
    if (exploreHasMore) {
      await get().getExplorePosts(explorePage + 1);
    }
  },

  clearError: () => set({ error: null }),
}));
