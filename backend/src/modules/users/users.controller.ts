import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { MediaService } from '@modules/media/media.service';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';
import { AuthorizeUserSelf } from '@modules/auth/decorators/authorize-resource.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mediaService: MediaService
  ) {}

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
        profileType: 'USER',
        bio: 'My bio',
        avatar: 'https://...',
        createdAt: '2024-01-01T00:00:00Z',
      },
    },
  })
  async getCurrentUser(@CurrentUserId() userId: string) {
    return this.usersService.findById(userId);
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
  async isFollowing(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.usersService.isFollowing(userId, id);
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
  async getFollowers(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
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
  async getFollowing(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
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
  async updateCurrentUser(@CurrentUserId() userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeUserSelf('id', 'You can only update your own profile.')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user (self only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - only self access' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
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
  async updateProfile(@CurrentUserId() userId: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    })
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload avatar do usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Avatar atualizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo invalido ou ausente',
  })
  async uploadAvatar(@CurrentUserId() userId: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Avatar file is required');
    }

    const uploadedMedia = await this.mediaService.uploadAvatar(userId, file);

    return this.usersService.updateProfile(userId, {
      avatar: uploadedMedia.publicUrl,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeUserSelf('id', 'You can only delete your own profile.')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
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
  async followUser(@Param('id') id: string, @CurrentUserId() userId: string) {
    if (id === userId) {
      throw new BadRequestException('Cannot follow yourself');
    }
    return this.usersService.followUser(userId, id);
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
  async unfollowUser(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.usersService.unfollowUser(userId, id);
  }
}
