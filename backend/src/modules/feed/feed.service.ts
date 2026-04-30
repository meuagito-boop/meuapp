import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { AuditLogService } from '@common/audit/audit-log.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { AgitoFeedMode, AgitoFeedQueryDto } from './dtos/agito-feed-query.dto';

type FeedCursorPayload = {
  createdAt: string;
  id: string;
};

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  /**
   * Criar um novo post
   */
  async createPost(userId: string, createPostDto: CreatePostDto) {
    const imageUrls = this.normalizeImageUrls(createPostDto.imageUrls, createPostDto.images) ?? [];
    if (imageUrls.length === 0) {
      throw new BadRequestException('At least one media asset is required for social posts');
    }

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
          imageUrls,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              profileType: true,
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

      await this.auditLogService?.record({
        userId,
        action: 'post.create',
        entity: 'Post',
        entityId: post.id,
        changes: {
          isPublic: post.isPublic,
          imageCount: post.imageUrls?.length ?? 0,
          contentLength: post.content?.length ?? 0,
        },
      });

      return this.sanitizePost(post);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  /**
   * Obter feed personalizado (posts de usuários seguidos + próprios)
   */
  async getFeed(
    userId: string,
    paginationDto: PaginationDto,
    sortBy: 'recent' | 'trending' | 'mostLiked' = 'recent'
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
      ttlSeconds
    );
  }

  /**
   * Explorar posts públicos (não personalizados)
   */
  async getAgitoFeed(userId: string, queryDto: AgitoFeedQueryDto) {
    const limit = queryDto.limit ?? queryDto.limite ?? 15;
    const mode = queryDto.mode ?? 'mixed';
    const cursor = queryDto.cursor?.trim() || undefined;
    const page = cursor ? undefined : Math.max(queryDto.pagina ?? 1, 1);
    const cacheSegment = cursor ? `cursor:${cursor}` : `page:${page}`;
    const cacheKey = `posts:agito:${userId}:${mode}:${limit}:${cacheSegment}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            location: true,
            latitude: true,
            longitude: true,
            searchRadius: true,
          },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (mode === 'following') {
          return this.queryAgitoFeed({
            userId,
            mode,
            limit,
            cursor,
            page,
            where: {
              authorId: {
                in: await this.getFollowingAuthorIds(userId),
              },
            },
          });
        }

        if (mode === 'global') {
          return this.queryAgitoFeed({
            userId,
            mode,
            limit,
            cursor,
            page,
            where: {},
          });
        }

        if (mode === 'nearby') {
          const nearbyWhere = this.buildNearbyWhere(
            user.latitude,
            user.longitude,
            user.searchRadius
          );
          return this.queryAgitoFeed({
            userId,
            mode,
            limit,
            cursor,
            page,
            where: nearbyWhere ?? { id: '__no_nearby_posts__' },
          });
        }

        const followingIds = await this.getFollowingAuthorIds(userId);
        if (followingIds.length > 1) {
          const followingFeed = await this.queryAgitoFeed({
            userId,
            mode,
            limit,
            cursor,
            page,
            where: {
              authorId: {
                in: followingIds,
              },
            },
          });

          if (followingFeed.data.length > 0 || cursor || (page ?? 1) > 1) {
            return followingFeed;
          }
        }

        const fallbackWhere =
          user.location && user.location.trim().length > 0
            ? {
                author: {
                  is: {
                    location: user.location.trim(),
                  },
                },
              }
            : {};

        return this.queryAgitoFeed({
          userId,
          mode,
          limit,
          cursor,
          page,
          where: fallbackWhere,
        });
      },
      ttlSeconds
    );
  }

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
      ttlSeconds
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
      ttlSeconds
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
      ttlSeconds
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

    const nextImageUrls = this.normalizeImageUrls(
      updatePostDto.imageUrls,
      updatePostDto.images,
      true
    );
    if (nextImageUrls !== undefined && nextImageUrls.length === 0) {
      throw new BadRequestException('A social post cannot be left without media');
    }

    try {
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          content: updatePostDto.content ?? post.content,
          isPublic: updatePostDto.isPublic ?? post.isPublic,
          ...(nextImageUrls !== undefined ? { imageUrls: nextImageUrls } : {}),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              profileType: true,
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

      await this.auditLogService?.record({
        userId,
        action: 'post.update',
        entity: 'Post',
        entityId: id,
        changes: {
          isPublic: updatedPost.isPublic,
          imageCount: updatedPost.imageUrls?.length ?? 0,
          contentLength: updatedPost.content?.length ?? 0,
        },
      });

      await this.invalidatePostCaches(id);

      return this.sanitizePost(updatedPost);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
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

      await this.auditLogService?.record({
        userId,
        action: 'post.soft_delete',
        entity: 'Post',
        entityId: id,
      });

      await this.invalidatePostCaches(id);

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

      await this.auditLogService?.record({
        userId,
        action: 'post.like',
        entity: 'Post',
        entityId: postId,
        changes: { likesCount },
      });

      await this.invalidatePostCaches(postId);

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

      await this.auditLogService?.record({
        userId,
        action: 'post.unlike',
        entity: 'Post',
        entityId: postId,
        changes: { likesCount },
      });

      await this.invalidatePostCaches(postId);

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
  async createComment(postId: string, userId: string, createCommentDto: CreateCommentDto) {
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
      await this.cacheService.delMany(`post:${postId}:comments:*`);
      await this.cacheService.invalidatePostsCache();

      await this.auditLogService?.record({
        userId,
        action: 'comment.create',
        entity: 'Comment',
        entityId: comment.id,
        changes: {
          postId,
          contentLength: comment.content?.length ?? 0,
        },
      });

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
      ttlSeconds
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

      await this.auditLogService?.record({
        userId,
        action: 'comment.update',
        entity: 'Comment',
        entityId: commentId,
        changes: {
          contentLength: updatedComment.content?.length ?? 0,
        },
      });

      await this.invalidateCommentCaches(comment.postId);

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

      await this.auditLogService?.record({
        userId,
        action: 'comment.soft_delete',
        entity: 'Comment',
        entityId: commentId,
      });

      await this.invalidateCommentCaches(comment.postId, true);

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

      await this.auditLogService?.record({
        userId,
        action: 'comment.like',
        entity: 'Comment',
        entityId: commentId,
        changes: { likesCount },
      });

      await this.invalidateCommentCaches(comment.postId);

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

      await this.auditLogService?.record({
        userId,
        action: 'comment.unlike',
        entity: 'Comment',
        entityId: commentId,
        changes: { likesCount },
      });

      await this.invalidateCommentCaches(comment.postId);

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
    const sanitized = { ...post };
    const postLikes = Array.isArray(sanitized.likes) ? sanitized.likes : [];
    const postCounts = sanitized._count ?? {};

    sanitized.imageUrls = Array.isArray(sanitized.imageUrls) ? sanitized.imageUrls : [];
    sanitized.images = sanitized.imageUrls;
    sanitized.likesCount = sanitized.likesCount ?? postCounts.likes ?? 0;
    sanitized.commentsCount = sanitized.commentsCount ?? postCounts.comments ?? 0;
    sanitized.sharesCount = sanitized.sharesCount ?? 0;
    sanitized.isLiked = sanitized.isLiked ?? postLikes.length > 0;

    delete sanitized.likes;
    delete sanitized.deletedAt;
    return sanitized;
  }

  /**
   * Sanitizar comentário
   */
  private sanitizeComment(comment: any) {
    const sanitized = { ...comment };
    const commentLikes = Array.isArray(sanitized.likes) ? sanitized.likes : [];
    const commentCounts = sanitized._count ?? {};

    sanitized.likesCount = sanitized.likesCount ?? commentCounts.likes ?? 0;
    sanitized.isLiked = sanitized.isLiked ?? commentLikes.length > 0;

    delete sanitized.likes;
    delete sanitized.deletedAt;
    return sanitized;
  }

  private async getFollowingAuthorIds(userId: string): Promise<string[]> {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    return [...new Set([userId, ...following.map((entry) => entry.followingId)])];
  }

  private buildNearbyWhere(
    latitude?: number | null,
    longitude?: number | null,
    radiusKm: number = 5
  ) {
    if (latitude == null || longitude == null) {
      return null;
    }

    const safeRadius = Math.max(radiusKm || 5, 1);
    const latitudeDelta = safeRadius / 111;
    const cosine = Math.cos((latitude * Math.PI) / 180);
    const longitudeDelta = safeRadius / (111 * Math.max(Math.abs(cosine), 0.1));

    return {
      latitude: {
        gte: latitude - latitudeDelta,
        lte: latitude + latitudeDelta,
      },
      longitude: {
        gte: longitude - longitudeDelta,
        lte: longitude + longitudeDelta,
      },
    };
  }

  private buildCursorWhere(cursor?: string) {
    if (!cursor) {
      return undefined;
    }

    let decoded: FeedCursorPayload;
    try {
      decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as FeedCursorPayload;
    } catch (_error) {
      throw new BadRequestException('Invalid feed cursor');
    }

    const createdAt = new Date(decoded.createdAt);
    if (
      Number.isNaN(createdAt.getTime()) ||
      typeof decoded.id !== 'string' ||
      decoded.id.length === 0
    ) {
      throw new BadRequestException('Invalid feed cursor');
    }

    return {
      OR: [
        {
          createdAt: {
            lt: createdAt,
          },
        },
        {
          createdAt,
          id: {
            lt: decoded.id,
          },
        },
      ],
    };
  }

  private encodeCursor(post: { createdAt: Date; id: string }) {
    return Buffer.from(
      JSON.stringify({
        createdAt: post.createdAt.toISOString(),
        id: post.id,
      })
    ).toString('base64url');
  }

  private async queryAgitoFeed(params: {
    userId: string;
    mode: AgitoFeedMode;
    limit: number;
    cursor?: string;
    page?: number;
    where: Record<string, unknown>;
  }) {
    const cursorWhere = this.buildCursorWhere(params.cursor);
    const baseWhere = {
      isPublic: true,
      deletedAt: null,
      imageUrls: {
        isEmpty: false,
      },
      ...params.where,
    };

    const where = cursorWhere
      ? {
          AND: [baseWhere, cursorWhere],
        }
      : baseWhere;

    const posts = await this.prisma.post.findMany({
      where: where as any,
      ...(params.cursor
        ? { take: params.limit + 1 }
        : { skip: ((params.page ?? 1) - 1) * params.limit, take: params.limit + 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            profileType: true,
          },
        },
        likes: {
          where: {
            userId: params.userId,
          },
          select: {
            id: true,
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

    const hasMore = posts.length > params.limit;
    const visiblePosts = posts.slice(0, params.limit).map((post) => this.sanitizePost(post));
    const nextCursor =
      hasMore && posts.length > 0
        ? this.encodeCursor(
            posts[Math.min(params.limit - 1, posts.length - 1)] as {
              createdAt: Date;
              id: string;
            }
          )
        : null;

    return {
      data: visiblePosts,
      mode: params.mode,
      limit: params.limit,
      hasMore,
      nextCursor,
    };
  }

  private async invalidatePostCaches(postId: string) {
    await Promise.all([
      this.cacheService.invalidatePostsCache(),
      this.cacheService.del(`post:${postId}`),
      this.cacheService.delMany(`post:${postId}:comments:*`),
    ]);
  }

  private async invalidateCommentCaches(postId: string, invalidateFeed: boolean = false) {
    await Promise.all([
      this.cacheService.del(`post:${postId}`),
      this.cacheService.delMany(`post:${postId}:comments:*`),
      ...(invalidateFeed ? [this.cacheService.invalidatePostsCache()] : []),
    ]);
  }

  private normalizeImageUrls(
    primary?: string[],
    legacy?: string[],
    allowUndefined: boolean = false
  ): string[] | undefined {
    const candidate = primary ?? legacy;
    if (candidate === undefined) {
      return allowUndefined ? undefined : [];
    }

    const normalizedUrls = candidate
      .map((url) => (typeof url === 'string' ? url.trim() : ''))
      .filter((url) => url.length > 0);

    for (const url of normalizedUrls) {
      if (url.toLowerCase().startsWith('data:')) {
        throw new BadRequestException(
          'Data URI/base64 nao e permitido. Envie o arquivo para o endpoint de upload e use a URL retornada.'
        );
      }
    }

    return normalizedUrls;
  }
}
