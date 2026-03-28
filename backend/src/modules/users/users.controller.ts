import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ===== STATIC ROUTES (must come first) =====

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Current user data',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'John Doe',
        profileType: 'PESSOA_FISICA',
        bio: 'My bio',
        avatar: 'https://...',
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
  })
  async getCurrentUser(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  // ===== PARAMETERIZED SUB-ROUTES (:id/xxx - must come before :id) =====

  @Get(':id/public-profile')
  @ApiOperation({ summary: 'Get user public profile (no auth required)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User public profile',
  })
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    schema: {
      example: {
        followersCount: 100,
        followingCount: 50,
        postsCount: 25,
        likesCount: 500,
      },
    },
  })
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  @Get(':id/is-following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user follows a user' })
  @ApiParam({ name: 'id', description: 'User ID to check' })
  @ApiResponse({
    status: 200,
    description: 'Is following status',
    schema: {
      example: {
        isFollowing: true,
      },
    },
  })
  async isFollowing(@Param('id') id: string, @Request() req: ExpressRequest) {
    return this.usersService.isFollowing((req as any).user.id, id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of followers',
  })
  async getFollowers(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.getFollowers(id, paginationDto);
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get users that user is following' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of users being followed',
  })
  async getFollowing(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.getFollowing(id, paginationDto);
  }

  // ===== GENERIC ROUTES (must come last) =====

  @Get()
  @ApiOperation({ summary: 'List all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      example: {
        data: [],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    },
  })
  async listUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User data',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
  })
  async updateCurrentUser(
    @Request() req: ExpressRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update((req as any).user.id, updateUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user (admin only for other users)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: ExpressRequest,
  ) {
    const currentUserId = (req as any).user.id;
    const isAdmin = (req as any).user.isAdmin || false;

    // Check authorization: can update self or admin can update anyone
    if (id !== currentUserId && !isAdmin) {
      throw new ForbiddenException(
        'You can only update your own profile. Admin access required to update other users.',
      );
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile info (bio, avatar, etc)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated',
    schema: {
      example: {
        id: 'uuid',
        bio: 'Updated bio',
        avatar: 'https://...',
        location: 'São Paulo, SP',
        website: 'https://...',
      },
    },
  })
  async updateProfile(
    @Request() req: ExpressRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile((req as any).user.id, updateProfileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Request() req: ExpressRequest) {
    if (id !== (req as any).user.id) {
      throw new BadRequestException('Can only delete own account');
    }
    return this.usersService.softDelete(id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'id', description: 'User ID to follow' })
  @ApiResponse({
    status: 200,
    description: 'User followed',
    schema: {
      example: {
        message: 'User followed successfully',
        followingCount: 10,
      },
    },
  })
  async followUser(@Param('id') id: string, @Request() req: ExpressRequest) {
    if (id === (req as any).user.id) {
      throw new BadRequestException('Cannot follow yourself');
    }
    return this.usersService.followUser((req as any).user.id, id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'id', description: 'User ID to unfollow' })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed',
    schema: {
      example: {
        message: 'User unfollowed successfully',
        followingCount: 9,
      },
    },
  })
  async unfollowUser(@Param('id') id: string, @Request() req: ExpressRequest) {
    return this.usersService.unfollowUser((req as any).user.id, id);
  }

}
