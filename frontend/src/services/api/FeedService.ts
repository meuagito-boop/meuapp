import ApiClient from './ApiClient';

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
  _count?: {
    likes?: number;
    comments?: number;
  };
  likes?: number;
  comments?: number;
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
  _count?: {
    likes?: number;
  };
  likes?: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  imageUrls?: string[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface UploadedMedia {
  id: string;
  publicUrl: string;
  mimeType: string;
  size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FeedMode = 'mixed' | 'following' | 'global' | 'nearby';

export interface CursorPaginatedResponse<T> {
  data: T[];
  mode: FeedMode;
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

class FeedService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  private normalizePost(post: Post): Post {
    const likesCount = post.likesCount ?? post.likes ?? post._count?.likes ?? 0;
    const commentsCount = post.commentsCount ?? post.comments ?? post._count?.comments ?? 0;
    const normalizedImages = post.imageUrls ?? post.images ?? [];

    return {
      ...post,
      images: normalizedImages,
      imageUrls: normalizedImages,
      likesCount,
      commentsCount,
      sharesCount: post.sharesCount ?? 0,
      likes: post.likes ?? likesCount,
      comments: post.comments ?? commentsCount,
      isLiked: post.isLiked ?? false,
    };
  }

  private normalizeComment(comment: Comment): Comment {
    const likesCount = comment.likesCount ?? comment.likes ?? comment._count?.likes ?? 0;

    return {
      ...comment,
      likesCount,
      likes: comment.likes ?? likesCount,
      isLiked: comment.isLiked ?? false,
    };
  }

  private normalizePaginatedPosts(
    response: PaginatedResponse<Post>,
  ): PaginatedResponse<Post> {
    return {
      ...response,
      data: response.data.map((post) => this.normalizePost(post)),
    };
  }

  private normalizePaginatedComments(
    response: PaginatedResponse<Comment>,
  ): PaginatedResponse<Comment> {
    return {
      ...response,
      data: response.data.map((comment) => this.normalizeComment(comment)),
    };
  }

  private normalizeCursorPaginatedPosts(
    response: CursorPaginatedResponse<Post>,
  ): CursorPaginatedResponse<Post> {
    return {
      ...response,
      data: response.data.map((post) => this.normalizePost(post)),
    };
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const post = await this.apiClient.post<Post>('/posts', {
      content: data.content,
      imageUrls: data.imageUrls ?? data.images ?? [],
    });
    return this.normalizePost(post);
  }

  async uploadPostMedia(
    uri: string,
    filename: string,
    mimeType: string = 'image/jpeg',
    postId?: string,
    onProgress?: (progress: number) => void,
  ): Promise<UploadedMedia> {
    const query = postId ? `?postId=${encodeURIComponent(postId)}` : '';
    return this.apiClient.uploadFile<UploadedMedia>(
      `/posts/media${query}`,
      {
        uri,
        name: filename,
        type: mimeType,
      },
      onProgress,
    );
  }

  async getFeed(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    const response = await this.apiClient.get<PaginatedResponse<Post>>('/posts/feed', {
      params: { page, limit },
    });
    return this.normalizePaginatedPosts(response);
  }

  async getAgitoFeed(params?: {
    cursor?: string;
    limit?: number;
    mode?: FeedMode;
  }): Promise<CursorPaginatedResponse<Post>> {
    const response = await this.apiClient.get<CursorPaginatedResponse<Post>>('/feed/agito', {
      params: {
        cursor: params?.cursor,
        limit: params?.limit ?? 15,
        mode: params?.mode ?? 'mixed',
      },
    });
    return this.normalizeCursorPaginatedPosts(response);
  }

  async explorePosts(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    const response = await this.apiClient.get<PaginatedResponse<Post>>('/posts/explore', {
      params: { page, limit },
    });
    return this.normalizePaginatedPosts(response);
  }

  async getPost(postId: string): Promise<Post> {
    const post = await this.apiClient.get<Post>(`/posts/${postId}`);
    return this.normalizePost(post);
  }

  async updatePost(postId: string, data: CreatePostRequest): Promise<Post> {
    const post = await this.apiClient.put<Post>(`/posts/${postId}`, {
      content: data.content,
      imageUrls: data.imageUrls ?? data.images ?? [],
    });
    return this.normalizePost(post);
  }

  async deletePost(postId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/posts/${postId}`);
  }

  async likePost(postId: string): Promise<{ message: string }> {
    return this.apiClient.post(`/posts/${postId}/like`);
  }

  async unlikePost(postId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/posts/${postId}/like`);
  }

  async getComments(postId: string, page = 1, limit = 20): Promise<PaginatedResponse<Comment>> {
    const response = await this.apiClient.get<PaginatedResponse<Comment>>(
      `/posts/${postId}/comments`,
      {
        params: { page, limit },
      },
    );
    return this.normalizePaginatedComments(response);
  }

  async createComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
    const comment = await this.apiClient.post<Comment>(`/posts/${postId}/comments`, data);
    return this.normalizeComment(comment);
  }

  async likeComment(commentId: string): Promise<{ message: string }> {
    return this.apiClient.post(`/posts/comments/${commentId}/like`);
  }

  async unlikeComment(commentId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/posts/comments/${commentId}/like`);
  }

  async deleteComment(commentId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/posts/comments/${commentId}`);
  }

  async getUserPosts(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    const response = await this.apiClient.get<PaginatedResponse<Post>>(`/posts/user/${userId}`, {
      params: { page, limit },
    });
    return this.normalizePaginatedPosts(response);
  }
}

export default FeedService;
