import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('FeedService', () => {
  let service: FeedService;
  let prismaService: PrismaService;

  const mockPost = {
    id: 'post-id',
    content: 'Este é meu post',
    authorId: 'user-id',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    author: {
      id: 'user-id',
      name: 'João Silva',
      avatar: 'https://example.com/avatar.jpg',
    },
    _count: {
      comments: 5,
      likes: 12,
    },
  };

  const mockComment = {
    id: 'comment-id',
    content: 'Ótimo post!',
    postId: 'post-id',
    authorId: 'user-id-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    author: {
      id: 'user-id-2',
      name: 'Maria Santos',
      avatar: 'https://example.com/maria.jpg',
    },
    _count: {
      likes: 2,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            post: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            follow: {
              findMany: jest.fn(),
            },
            like: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
            },
            comment: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            commentLike: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      });
      jest.spyOn(prismaService.post, 'create').mockResolvedValue(mockPost);

      const result = await service.createPost('user-id', {
        content: 'Este é meu post',
      });

      expect(result).toBeDefined();
      expect(result.content).toBe('Este é meu post');
      expect(prismaService.post.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createPost('invalid-id', { content: 'Post' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFeed', () => {
    it('should return personalized feed', async () => {
      jest.spyOn(prismaService.follow, 'findMany').mockResolvedValue([
        { followingId: 'user-2' },
      ]);
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValue([mockPost]);
      jest.spyOn(prismaService.post, 'count').mockResolvedValue(1);

      const result = await service.getFeed('user-id', { page: 1, limit: 10 });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('getPost', () => {
    it('should return post by id', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);

      const result = await service.getPost('post-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('post-id');
    });

    it('should throw NotFoundException if post not found', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);

      await expect(service.getPost('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePost', () => {
    it('should update post', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.post, 'update').mockResolvedValue({
        ...mockPost,
        content: 'Updated content',
      });

      const result = await service.updatePost('post-id', 'user-id', {
        content: 'Updated content',
      });

      expect(result.content).toBe('Updated content');
    });

    it('should throw ForbiddenException if user is not author', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);

      await expect(
        service.updatePost('post-id', 'different-user', {
          content: 'Updated',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePost', () => {
    it('should soft delete post', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.post, 'update').mockResolvedValue({
        ...mockPost,
        deletedAt: new Date(),
      });

      const result = await service.deletePost('post-id', 'user-id');

      expect(result.message).toBe('Post deleted successfully');
    });
  });

  describe('likePost', () => {
    it('should like a post', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.like, 'create').mockResolvedValue({
        id: 'like-id',
        userId: 'user-id',
        postId: 'post-id',
        createdAt: new Date(),
      });
      jest.spyOn(prismaService.like, 'count').mockResolvedValue(13);

      const result = await service.likePost('post-id', 'user-id');

      expect(result.message).toBe('Post liked successfully');
      expect(result.likesCount).toBe(13);
    });

    it('should throw BadRequestException if already liked', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue({
        id: 'like-id',
        userId: 'user-id',
        postId: 'post-id',
        createdAt: new Date(),
      });

      await expect(service.likePost('post-id', 'user-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.like, 'delete').mockResolvedValue({
        id: 'like-id',
        userId: 'user-id',
        postId: 'post-id',
        createdAt: new Date(),
      });
      jest.spyOn(prismaService.like, 'count').mockResolvedValue(11);

      const result = await service.unlikePost('post-id', 'user-id');

      expect(result.message).toBe('Like removed successfully');
      expect(result.likesCount).toBe(11);
    });
  });

  describe('isPostLiked', () => {
    it('should return true if post is liked', async () => {
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue({
        id: 'like-id',
        userId: 'user-id',
        postId: 'post-id',
        createdAt: new Date(),
      });

      const result = await service.isPostLiked('post-id', 'user-id');

      expect(result.isLiked).toBe(true);
    });

    it('should return false if post is not liked', async () => {
      jest.spyOn(prismaService.like, 'findUnique').mockResolvedValue(null);

      const result = await service.isPostLiked('post-id', 'user-id');

      expect(result.isLiked).toBe(false);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.comment, 'create').mockResolvedValue(mockComment);

      const result = await service.createComment('post-id', 'user-id-2', {
        content: 'Ótimo post!',
      });

      expect(result).toBeDefined();
      expect(result.content).toBe('Ótimo post!');
    });

    it('should throw NotFoundException if post not found', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createComment('invalid-id', 'user-id', { content: 'Comment' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('should return comments for a post', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(mockPost);
      jest.spyOn(prismaService.comment, 'findMany').mockResolvedValue([mockComment]);
      jest.spyOn(prismaService.comment, 'count').mockResolvedValue(1);

      const result = await service.getComments('post-id', { page: 1, limit: 10 });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('updateComment', () => {
    it('should update comment', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);
      jest.spyOn(prismaService.comment, 'update').mockResolvedValue({
        ...mockComment,
        content: 'Updated comment',
      });

      const result = await service.updateComment('comment-id', 'user-id-2', 'Updated comment');

      expect(result.content).toBe('Updated comment');
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);
      jest.spyOn(prismaService.comment, 'update').mockResolvedValue({
        ...mockComment,
        deletedAt: new Date(),
      });

      const result = await service.deleteComment('comment-id', 'user-id-2');

      expect(result.message).toBe('Comment deleted successfully');
    });
  });

  describe('likeComment', () => {
    it('should like a comment', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);
      jest.spyOn(prismaService.commentLike, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.commentLike, 'create').mockResolvedValue({
        id: 'like-id',
        userId: 'user-id',
        commentId: 'comment-id',
        createdAt: new Date(),
      });
      jest.spyOn(prismaService.commentLike, 'count').mockResolvedValue(3);

      const result = await service.likeComment('comment-id', 'user-id');

      expect(result.message).toBe('Comment liked successfully');
      expect(result.likesCount).toBe(3);
    });
  });

  describe('unlikeComment', () => {
    it('should unlike a comment', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(mockComment);
      jest.spyOn(prismaService.commentLike, 'delete').mockResolvedValue({
        id: 'like-id',
        userId: 'user-id',
        commentId: 'comment-id',
        createdAt: new Date(),
      });
      jest.spyOn(prismaService.commentLike, 'count').mockResolvedValue(1);

      const result = await service.unlikeComment('comment-id', 'user-id');

      expect(result.message).toBe('Like removed successfully');
    });
  });
});

describe('FeedController', () => {
  let controller: FeedController;
  let feedService: FeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: FeedService,
          useValue: {
            createPost: jest.fn(),
            getFeed: jest.fn(),
            getExplore: jest.fn(),
            getPost: jest.fn(),
            getUserPosts: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            likePost: jest.fn(),
            unlikePost: jest.fn(),
            isPostLiked: jest.fn(),
            getPostLikes: jest.fn(),
            createComment: jest.fn(),
            getComments: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
            likeComment: jest.fn(),
            unlikeComment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedController>(FeedController);
    feedService = module.get<FeedService>(FeedService);
  });

  describe('createPost', () => {
    it('should create post', async () => {
      const mockRequest = { user: { id: 'user-id' } };
      jest.spyOn(feedService, 'createPost').mockResolvedValue({
        id: 'post-id',
        content: 'Test post',
        authorId: 'user-id',
        isPublic: true,
        createdAt: new Date(),
        _count: { comments: 0, likes: 0 },
      });

      const result = await controller.createPost(
        { content: 'Test post' },
        mockRequest,
      );

      expect(result).toBeDefined();
      expect(result.content).toBe('Test post');
    });
  });

  describe('getFeed', () => {
    it('should return feed', async () => {
      const mockRequest = { user: { id: 'user-id' } };
      jest.spyOn(feedService, 'getFeed').mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      const result = await controller.getFeed(
        { page: 1, limit: 10 },
        'recent',
        mockRequest,
      );

      expect(result).toBeDefined();
    });
  });

  describe('getExplore', () => {
    it('should return explore feed', async () => {
      jest.spyOn(feedService, 'getExplore').mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      const result = await controller.getExplore({ page: 1, limit: 10 });

      expect(result).toBeDefined();
    });
  });

  describe('likePost', () => {
    it('should like post', async () => {
      const mockRequest = { user: { id: 'user-id' } };
      jest.spyOn(feedService, 'likePost').mockResolvedValue({
        message: 'Post liked successfully',
        likesCount: 1,
      });

      const result = await controller.likePost('post-id', mockRequest);

      expect(result.message).toBe('Post liked successfully');
    });
  });
});
