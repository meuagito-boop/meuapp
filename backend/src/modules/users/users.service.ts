import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '@common/audit/audit-log.service';
import { AccountType } from '@common/enums/account-type.enum';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email.toLowerCase(),
          name: createUserDto.name,
          password: createUserDto.password, // Should be hashed by auth service
          profileType: createUserDto.profileType ?? AccountType.USER,
        },
      });

      await this.auditLogService?.record({
        userId: user.id,
        action: 'user.create',
        entity: 'User',
        entityId: user.id,
        changes: {
          profileType: user.profileType,
        },
      });

      return this.sanitizeUser(user);
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              following: true,
              followers: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        ...this.sanitizeUser(user),
        followersCount: user._count?.followers || 0,
        followingCount: user._count?.following || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10, search } = paginationDto;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null, // Exclude soft deleted users
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            profileType: true,
            createdAt: true,
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users.map((user) => ({
          ...user,
          followersCount: user._count?.followers || 0,
          followingCount: user._count?.following || 0,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updateData: Prisma.UserUpdateInput = {};

      if (updateUserDto.name !== undefined) {
        updateData.name = updateUserDto.name;
      }

      if (updateUserDto.email !== undefined) {
        const normalizedEmail = updateUserDto.email.toLowerCase();
        const currentUser = await this.prisma.user.findUnique({
          where: { id },
          select: { email: true },
        });

        if (!currentUser) {
          throw new NotFoundException('User not found');
        }

        updateData.email = normalizedEmail;
        if (normalizedEmail !== currentUser.email.toLowerCase()) {
          updateData.emailVerified = false;
        }
      }

      if (updateUserDto.username !== undefined) {
        const normalizedUsername = updateUserDto.username?.trim() || '';
        updateData.username = normalizedUsername.length > 0 ? normalizedUsername : null;
      }

      if (updateUserDto.phoneNumber !== undefined) {
        const normalizedPhone = updateUserDto.phoneNumber?.trim() || '';
        updateData.phoneNumber = normalizedPhone.length > 0 ? normalizedPhone : null;
      }

      if (updateUserDto.profileType !== undefined) {
        updateData.profileType = updateUserDto.profileType;
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      await this.auditLogService?.record({
        userId: id,
        action: 'user.update',
        entity: 'User',
        entityId: id,
        changes: updateUserDto,
      });

      return this.sanitizeUser(user);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      if (this.isPrismaErrorCode(error, 'P2002')) {
        throw new BadRequestException(this.getUniqueConstraintMessage(error));
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    try {
      const updateData: Prisma.UserUpdateInput = {};

      if (updateProfileDto.bio !== undefined) {
        updateData.bio = updateProfileDto.bio;
      }

      if (updateProfileDto.avatar !== undefined) {
        updateData.avatar = updateProfileDto.avatar;
      }

      if (updateProfileDto.location !== undefined) {
        updateData.location = updateProfileDto.location;
      }

      if (updateProfileDto.website !== undefined) {
        updateData.website = updateProfileDto.website;
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      // Invalidate profile cache when updated
      await this.cacheService.del(`user:${id}:profile`);

      await this.auditLogService?.record({
        userId: id,
        action: 'user.profile_update',
        entity: 'User',
        entityId: id,
        changes: updateProfileDto,
      });

      return this.sanitizeUser(user);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async softDelete(id: string, password: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser || existingUser.deletedAt) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, existingUser.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.cacheService.del(`user:${id}:profile`);
      await this.cacheService.del(`user:${id}:stats`);

      await this.prisma.refreshToken.deleteMany({
        where: { userId: id },
      });

      await this.auditLogService?.record({
        userId: id,
        action: 'user.soft_delete',
        entity: 'User',
        entityId: id,
      });

      return {
        message: 'User account deleted successfully',
        deletedAt: user.deletedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      if ((error as any).code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async followUser(userId: string, targetUserId: string) {
    try {
      // Check if target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        throw new NotFoundException('User to follow not found');
      }

      // Check if already following
      const alreadyFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });

      if (alreadyFollowing) {
        throw new BadRequestException('Already following this user');
      }

      // Create follow relationship
      await this.prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId,
        },
      });

      // Invalidate stats cache for both users
      await this.cacheService.del(`user:${userId}:stats`);
      await this.cacheService.del(`user:${targetUserId}:stats`);
      // Invalidate follower/following caches
      await this.cacheService.invalidateFollowCache(userId, targetUserId);

      // Get updated following count
      const followingCount = await this.prisma.follow.count({
        where: { followerId: userId },
      });

      return {
        message: 'User followed successfully',
        followingCount,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to follow user');
    }
  }

  async unfollowUser(userId: string, targetUserId: string) {
    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });

      // Invalidate stats cache for both users
      await this.cacheService.del(`user:${userId}:stats`);
      await this.cacheService.del(`user:${targetUserId}:stats`);
      // Invalidate follower/following caches
      await this.cacheService.invalidateFollowCache(userId, targetUserId);

      // Get updated following count
      const followingCount = await this.prisma.follow.count({
        where: { followerId: userId },
      });

      return {
        message: 'User unfollowed successfully',
        followingCount,
      };
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new BadRequestException('Not following this user');
      }
      throw new InternalServerErrorException('Failed to unfollow user');
    }
  }

  async getFollowers(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `user:${userId}:followers:${page}:${limit}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const skip = (page - 1) * limit;

          const [followers, total] = await Promise.all([
            this.prisma.follow.findMany({
              where: { followingId: userId },
              include: {
                follower: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    bio: true,
                  },
                },
              },
              skip,
              take: limit,
              orderBy: { createdAt: 'desc' },
            }),
            this.prisma.follow.count({
              where: { followingId: userId },
            }),
          ]);

          return {
            data: followers.map((f) => f.follower),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          };
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch followers');
        }
      },
      ttlSeconds
    );
  }

  async getFollowing(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const cacheKey = `user:${userId}:following:${page}:${limit}`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const skip = (page - 1) * limit;

          const [following, total] = await Promise.all([
            this.prisma.follow.findMany({
              where: { followerId: userId },
              include: {
                following: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    bio: true,
                  },
                },
              },
              skip,
              take: limit,
              orderBy: { createdAt: 'desc' },
            }),
            this.prisma.follow.count({
              where: { followerId: userId },
            }),
          ]);

          return {
            data: following.map((f) => f.following),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          };
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch following');
        }
      },
      ttlSeconds
    );
  }

  async isFollowing(userId: string, targetUserId: string) {
    try {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });

      return {
        isFollowing: !!follow,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to check follow status');
    }
  }

  async getUserStats(userId: string) {
    const cacheKey = `user:${userId}:stats`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_WARM || '1800', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const [followersCount, followingCount, postsCount, likesCount] = await Promise.all([
            this.prisma.follow.count({
              where: { followingId: userId },
            }),
            this.prisma.follow.count({
              where: { followerId: userId },
            }),
            this.prisma.post.count({
              where: {
                authorId: userId,
                deletedAt: null,
                isDeleted: false,
              },
            }),
            this.prisma.like.count({
              where: {
                post: {
                  authorId: userId,
                  deletedAt: null,
                  isDeleted: false,
                },
              },
            }),
          ]);

          return {
            followersCount,
            followingCount,
            postsCount,
            likesCount,
          };
        } catch (error) {
          throw new InternalServerErrorException('Failed to fetch user stats');
        }
      },
      ttlSeconds
    );
  }

  async getPublicProfile(userId: string) {
    const cacheKey = `user:${userId}:profile`;
    const ttlSeconds = parseInt(process.env.CACHE_TTL_HOT || '60', 10);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
              profileType: true,
              location: true,
              website: true,
              createdAt: true,
              _count: {
                select: {
                  followers: true,
                  following: true,
                },
              },
            },
          });

          if (!user) {
            throw new NotFoundException('User not found');
          }

          return {
            ...user,
            followersCount: user._count?.followers || 0,
            followingCount: user._count?.following || 0,
          };
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new InternalServerErrorException('Failed to fetch profile');
        }
      },
      ttlSeconds
    );
  }

  private sanitizeUser(user: any) {
    // Remove sensitive fields
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.twoFactorSecret;
    return sanitized;
  }

  private isPrismaErrorCode(error: unknown, code: string) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
  }

  private getUniqueConstraintMessage(error: unknown) {
    const target =
      typeof error === 'object' && error !== null && 'meta' in error
        ? (error.meta as { target?: string[] | string } | undefined)?.target
        : undefined;
    const fields = Array.isArray(target) ? target : target ? [target] : [];

    if (fields.includes('username')) {
      return 'Username already exists';
    }

    if (fields.includes('phoneNumber')) {
      return 'Phone number already exists';
    }

    return 'Email already exists';
  }
}
