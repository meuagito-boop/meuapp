import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { MediaService } from '@modules/media/media.service';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  const mockCacheService = {
    getOrSet: jest.fn(async (_key: string, compute: () => Promise<unknown>) => compute()),
    del: jest.fn(),
    invalidateFollowCache: jest.fn(),
  };

  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    username: 'test.user',
    password: 'hashed-password',
    profileType: 'USER',
    bio: 'Test bio',
    avatar: 'https://example.com/avatar.jpg',
    location: 'São Paulo',
    website: 'https://example.com',
    emailVerified: true,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    deletedAt: null,
    _count: {
      followers: 10,
      following: 5,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            follow: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            post: {
              count: jest.fn(),
            },
            like: {
              count: jest.fn(),
            },
            refreshToken: {
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findById('test-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          _count: {
            select: {
              following: true,
              followers: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter users by search query', async () => {
      const users = [mockUser];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);

      const result = await service.findAll({ search: 'Test' });

      expect(result.data).toBeDefined();
    });
  });

  describe('isUsernameAvailable', () => {
    it('should return available when username is not used', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.isUsernameAvailable('New.User');

      expect(result).toEqual({
        username: 'new.user',
        available: true,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'new.user' },
        select: { id: true },
      });
    });

    it('should return unavailable when username belongs to another user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({ id: 'other-id' });

      const result = await service.isUsernameAvailable('taken.user', 'test-id');

      expect(result).toEqual({
        username: 'taken.user',
        available: false,
      });
    });

    it('should return available when username belongs to current user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({ id: 'test-id' });

      const result = await service.isUsernameAvailable('test.user', 'test-id');

      expect(result).toEqual({
        username: 'test.user',
        available: true,
      });
    });

    it('should reject invalid username', async () => {
      await expect(service.isUsernameAvailable('invalid user')).rejects.toThrow(
        BadRequestException
      );
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
        username: 'updated.user',
        phoneNumber: '+5511999999999',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update('test-id', updateDto);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          name: 'Updated Name',
          email: 'updated@example.com',
          emailVerified: false,
          username: 'updated.user',
          phoneNumber: '+5511999999999',
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateDto: UpdateUserDto = { name: 'New Name' };
      jest.spyOn(prismaService.user, 'update').mockImplementation(() => {
        const error = new Error();
        (error as any).code = 'P2025';
        throw error;
      });

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if email exists', async () => {
      const updateDto: UpdateUserDto = { email: 'existing@example.com' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.user, 'update').mockImplementation(() => {
        const error = new Error();
        (error as any).code = 'P2002';
        throw error;
      });

      await expect(service.update('test-id', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const profileDto: UpdateProfileDto = {
        bio: 'New bio',
        location: 'Rio de Janeiro',
      };

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        bio: profileDto.bio,
        location: profileDto.location,
      });

      const result = await service.updateProfile('test-id', profileDto);

      expect(result.bio).toBe('New bio');
      expect(result.location).toBe('Rio de Janeiro');
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      const password = 'ValidPassword123!';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash(password, 10),
      });
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.softDelete('test-id', password);

      expect(result.message).toBe('User account deleted successfully');
      expect(result.deletedAt).toBeDefined();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'test-id' },
      });
    });

    it('should reject soft delete when password is invalid', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash('ValidPassword123!', 10),
      });

      await expect(service.softDelete('test-id', 'WrongPassword123!')).rejects.toThrow(
        UnauthorizedException
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.follow, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.follow, 'create').mockResolvedValue({
        id: 'follow-id',
        followerId: 'test-id',
        followingId: 'other-id',
        createdAt: new Date(),
      });
      jest.spyOn(prismaService.follow, 'count').mockResolvedValue(1);

      const result = await service.followUser('test-id', 'other-id');

      expect(result.message).toBe('User followed successfully');
      expect(result.followingCount).toBe(1);
    });

    it('should throw if already following', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.follow, 'findUnique').mockResolvedValue({
        id: 'follow-id',
        followerId: 'test-id',
        followingId: 'other-id',
        createdAt: new Date(),
      });

      await expect(service.followUser('test-id', 'other-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user', async () => {
      jest.spyOn(prismaService.follow, 'delete').mockResolvedValue({
        id: 'follow-id',
        followerId: 'test-id',
        followingId: 'other-id',
        createdAt: new Date(),
      });
      jest.spyOn(prismaService.follow, 'count').mockResolvedValue(0);

      const result = await service.unfollowUser('test-id', 'other-id');

      expect(result.message).toBe('User unfollowed successfully');
      expect(result.followingCount).toBe(0);
    });
  });

  describe('getFollowers', () => {
    it('should get user followers', async () => {
      const followers = [
        {
          follower: {
            id: 'follower-id',
            name: 'Follower',
            avatar: 'https://example.com/avatar.jpg',
            bio: 'Follower bio',
          },
        },
      ];

      jest.spyOn(prismaService.follow, 'findMany').mockResolvedValue(followers);
      jest.spyOn(prismaService.follow, 'count').mockResolvedValue(1);

      const result = await service.getFollowers('test-id', { page: 1 });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('isFollowing', () => {
    it('should return true if following', async () => {
      jest.spyOn(prismaService.follow, 'findUnique').mockResolvedValue({
        id: 'follow-id',
        followerId: 'test-id',
        followingId: 'other-id',
        createdAt: new Date(),
      });

      const result = await service.isFollowing('test-id', 'other-id');

      expect(result.isFollowing).toBe(true);
    });

    it('should return false if not following', async () => {
      jest.spyOn(prismaService.follow, 'findUnique').mockResolvedValue(null);

      const result = await service.isFollowing('test-id', 'other-id');

      expect(result.isFollowing).toBe(false);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      jest.spyOn(prismaService.follow, 'count').mockResolvedValueOnce(10).mockResolvedValueOnce(5);
      jest.spyOn(prismaService.post, 'count').mockResolvedValue(3);
      jest.spyOn(prismaService.like, 'count').mockResolvedValue(12);

      const result = await service.getUserStats('test-id');

      expect(result).toEqual({
        followersCount: 10,
        followingCount: 5,
        postsCount: 3,
        likesCount: 12,
      });
    });
  });
});

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  const mockControllerUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    profileType: 'USER',
    bio: 'Test bio',
    avatar: 'https://example.com/avatar.jpg',
    location: 'Sao Paulo',
    website: 'https://example.com',
    emailVerified: true,
    twoFactorEnabled: false,
    followersCount: 10,
    followingCount: 5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            updateProfile: jest.fn(),
            isUsernameAvailable: jest.fn(),
            softDelete: jest.fn(),
            followUser: jest.fn(),
            unfollowUser: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
            isFollowing: jest.fn(),
            getUserStats: jest.fn(),
            getPublicProfile: jest.fn(),
          },
        },
        {
          provide: MediaService,
          useValue: {
            uploadAvatar: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            event: { findUnique: jest.fn() },
            establishment: { findUnique: jest.fn() },
            post: { findUnique: jest.fn() },
            comment: { findUnique: jest.fn() },
            message: { findUnique: jest.fn() },
          },
        },
        {
          provide: ResourceOwnerGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockControllerUser as any);

      const result = await controller.getCurrentUser('test-id');

      expect(result).toBeDefined();
      expect(usersService.findById).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getUser', () => {
    it('should return user by id', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockControllerUser as any);

      const result = await controller.getUser('test-id');

      expect(result).toBeDefined();
    });
  });

  describe('listUsers', () => {
    it('should list users', async () => {
      const mockResult = {
        data: [mockControllerUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockResult);

      const result = await controller.listUsers({ page: 1, limit: 10 });

      expect(result).toBeDefined();
    });
  });

  describe('checkUsernameAvailability', () => {
    it('should check username availability for current user', async () => {
      jest.spyOn(usersService, 'isUsernameAvailable').mockResolvedValue({
        username: 'test.user',
        available: true,
      });

      const result = await controller.checkUsernameAvailability('test-id', {
        username: 'test.user',
      });

      expect(result.available).toBe(true);
      expect(usersService.isUsernameAvailable).toHaveBeenCalledWith('test.user', 'test-id');
    });
  });

  describe('followUser', () => {
    it('should follow user', async () => {
      jest.spyOn(usersService, 'followUser').mockResolvedValue({
        message: 'User followed successfully',
        followingCount: 1,
      });

      const result = await controller.followUser('other-id', 'test-id');

      expect(result.message).toBe('User followed successfully');
    });
  });
});
