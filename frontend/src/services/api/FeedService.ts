import ApiClient from './ApiClient';

export interface Post {
  id: string;
  content: string;
  images?: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  isLiked?: boolean;
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
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class FeedService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Criar post
   */
  async createPost(data: CreatePostRequest): Promise<Post> {
    return this.apiClient.post('/feed/posts', data);
  }

  /**
   * Listar feed personalizado
   */
  async getFeed(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.apiClient.get('/feed/posts/feed', {
      params: { page, limit },
    });
  }

  /**
   * Explorar posts públicos
   */
  async explorePosts(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    return this.apiClient.get('/feed/posts/explore', {
      params: { page, limit },
    });
  }

  /**
   * Obter post específico
   */
  async getPost(postId: string): Promise<Post> {
    return this.apiClient.get(`/feed/posts/${postId}`);
  }

  /**
   * Atualizar post
   */
  async updatePost(postId: string, data: CreatePostRequest): Promise<Post> {
    return this.apiClient.put(`/feed/posts/${postId}`, data);
  }

  /**
   * Deletar post
   */
  async deletePost(postId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/feed/posts/${postId}`);
  }

  /**
   * Curtir post
   */
  async likePost(postId: string): Promise<{ message: string }> {
    return this.apiClient.post(`/feed/posts/${postId}/like`);
  }

  /**
   * Remover curtida
   */
  async unlikePost(postId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/feed/posts/${postId}/like`);
  }

  /**
   * Listar comentários
   */
  async getComments(
    postId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Comment>> {
    return this.apiClient.get(`/feed/posts/${postId}/comments`, {
      params: { page, limit },
    });
  }

  /**
   * Criar comentário
   */
  async createComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
    return this.apiClient.post(`/feed/posts/${postId}/comments`, data);
  }

  /**
   * Curtir comentário
   */
  async likeComment(commentId: string): Promise<{ message: string }> {
    return this.apiClient.post(`/feed/comments/${commentId}/like`);
  }

  /**
   * Remover curtida do comentário
   */
  async unlikeComment(commentId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/feed/comments/${commentId}/like`);
  }

  /**
   * Deletar comentário
   */
  async deleteComment(commentId: string): Promise<{ message: string }> {
    return this.apiClient.delete(`/feed/comments/${commentId}`);
  }

  /**
   * Posts de um usuário
   */
  async getUserPosts(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Post>> {
    return this.apiClient.get(`/feed/users/${userId}/posts`, {
      params: { page, limit },
    });
  }
}

export default FeedService;
