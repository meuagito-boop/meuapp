import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Criar um novo post
   */
  async createPost(userId: string, createPostDto: CreatePostDto) {
    try {
      // Validar que o usuário existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      const post = await this.prisma.post.create({
        data: {
          content: createPostDto.content,
          authorId: userId,
          isPublic: createPostDto.isPublic ?? true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      // Invalidate feed cache when new post is created
      await this.cacheService.invalidatePostsCache();

      return this.sanitizePost(post);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  /**
   * Obter feed personalizado (posts de usuários seguidos + próprios)
   */
  async getFeed(
    userId: string,
    paginationDto: PaginationDto,
    sortBy: 'recent' | 'trending' | 'mostLiked' = 'recent',
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Cache key includes userId, page, limit, and sort criteria for granular caching
    const cacheKey = `posts:feed:${userId}:${page}:${limit}:${sortBy}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        // Obter IDs dos usuários que o usuário segue
        const following = await this.prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        followingIds.push(userId); // Incluir seus próprios posts

        // Determinar ordenação
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'trending') {
          orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }];
        } else if (sortBy === 'mostLiked') {
          orderBy = [{ likes: { _count: 'desc' } }];
        }

        const [posts, total] = await Promise.all([
          this.prisma.post.findMany({
            where: {
              authorId: { in: followingIds },
              isPublic: true,
              deletedAt: null,
            },
            skip,
            take: limit,
            orderBy,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
            },
          }),
          this.prisma.post.count({
            where: {
              authorId: { in: followingIds },
              isPublic: true,
              deletedAt: null,
            },
          }),
        ]);

        return {
          data: posts.map((p) => this.sanitizePost(p)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      ttlSeconds,
    );
  }

  /**
   * Explorar posts públicos (não personalizados)
   */
  async getExplore(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `posts:explore:${page}:${limit}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
          this.prisma.post.findMany({
            where: {
              isPublic: true,
              deletedAt: null,
            },
            skip,
            take: limit,
            orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
            },
          }),
          this.prisma.post.count({
            where: { isPublic: true, deletedAt: null },
          }),
        ]);

        return {
          data: posts.map((p) => this.sanitizePost(p)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      ttlSeconds,
    );
  }

  /**
   * Obter post específico com comentários
   */
  async getPost(id: string) {
    const cacheKey = `post:${id}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_HOT || '60', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const post = await this.prisma.post.findUnique({
          where: { id },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            comments: {
              where: { deletedAt: null },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                _count: {
                  select: { likes: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            _count: {
              select: {
                comments: true,
                likes: true,
              },
            },
          },
        });

        if (!post || post.deletedAt) {
          throw new NotFoundException('Post not found');
        }

        return this.sanitizePost(post);
      },
      ttlSeconds,
    );
  }

  /**
   * Obter posts de um usuário específico
   */
  async getUserPosts(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `user:${userId}:posts:${page}:${limit}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        // Validar que o usuário existe
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) throw new NotFoundException('User not found');

        const [posts, total] = await Promise.all([
          this.prisma.post.findMany({
            where: {
              authorId: userId,
              isPublic: true,
              deletedAt: null,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
            },
          }),
          this.prisma.post.count({
            where: {
              authorId: userId,
              isPublic: true,
              deletedAt: null,
            },
          }),
        ]);

        return {
          data: posts.map((p) => this.sanitizePost(p)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      ttlSeconds,
    );
  }

  /**
   * Atualizar post
   */
  async updatePost(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Cannot update post of another user');
    }

    try {
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          content: updatePostDto.content ?? post.content,
          isPublic: updatePostDto.isPublic ?? post.isPublic,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      return this.sanitizePost(updatedPost);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  /**
   * Deletar post (soft delete)
   */
  async deletePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Cannot delete post of another user');
    }

    try {
      await this.prisma.post.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Post deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  /**
   * Curtir post
   */
  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    // Verificar se já curtiu
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('Already liked this post');
    }

    try {
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      const likesCount = await this.prisma.like.count({
        where: { postId },
      });

      return {
        message: 'Post liked successfully',
        likesCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to like post');
    }
  }

  /**
   * Remover curtida do post
   */
  async unlikePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    try {
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      const likesCount = await this.prisma.like.count({
        where: { postId },
      });

      return {
        message: 'Like removed successfully',
        likesCount,
      };
    } catch (error) {
      throw new BadRequestException('You did not like this post');
    }
  }

  /**
   * Verificar se curtiu o post
   */
  async isPostLiked(postId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return {
      isLiked: !!like,
    };
  }

  /**
   * Obter curtidas do post
   */
  async getPostLikes(postId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { postId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({
        where: { postId },
      }),
    ]);

    return {
      data: likes.map((l) => l.user),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Criar comentário
   */
  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    try {
      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          postId,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { likes: true },
          },
        },
      });

      // Invalidate post cache (includes comment count)
      await this.cacheService.del(`post:${postId}`);
      // Invalidate all comment caches for this post
      await this.cacheService.del(`post:${postId}:comments:*`);

      return this.sanitizeComment(comment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  /**
   * Obter comentários do post
   */
  async getComments(postId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `post:${postId}:comments:${page}:${limit}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;

        const post = await this.prisma.post.findUnique({
          where: { id: postId },
        });

        if (!post || post.deletedAt) {
          throw new NotFoundException('Post not found');
        }

        const [comments, total] = await Promise.all([
          this.prisma.comment.findMany({
            where: {
              postId,
              deletedAt: null,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: { likes: true },
              },
            },
          }),
          this.prisma.comment.count({
            where: {
              postId,
              deletedAt: null,
            },
          }),
        ]);

        return {
          data: comments.map((c) => this.sanitizeComment(c)),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      ttlSeconds,
    );
  }

  /**
   * Atualizar comentário
   */
  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Cannot update comment of another user');
    }

    try {
      const updatedComment = await this.prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { likes: true },
          },
        },
      });

      return this.sanitizeComment(updatedComment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  /**
   * Deletar comentário (soft delete)
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Cannot delete comment of another user');
    }

    try {
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
      });

      return { message: 'Comment deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }

  /**
   * Curtir comentário
   */
  async likeComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('Already liked this comment');
    }

    try {
      await this.prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });

      const likesCount = await this.prisma.commentLike.count({
        where: { commentId },
      });

      return {
        message: 'Comment liked successfully',
        likesCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to like comment');
    }
  }

  /**
   * Remover curtida do comentário
   */
  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comment not found');
    }

    try {
      await this.prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      const likesCount = await this.prisma.commentLike.count({
        where: { commentId },
      });

      return {
        message: 'Like removed successfully',
        likesCount,
      };
    } catch (error) {
      throw new BadRequestException('You did not like this comment');
    }
  }

  /**
   * Sanitizar post (remover dados sensíveis)
   */
  private sanitizePost(post: any) {
    const { deletedAt, ...sanitized } = post;
    return sanitized;
  }

  /**
   * Sanitizar comentário
   */
  private sanitizeComment(comment: any) {
    const { deletedAt, ...sanitized } = comment;
    return sanitized;
  }
}
