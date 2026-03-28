import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Feed')
@Controller('posts')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * Criar um novo post
   * @param createPostDto Dados do post
   * @param req Requisição autenticada
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo post',
    description: 'Cria um novo post para o usuário autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Post criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        content: 'Este é meu post',
        authorId: 'uuid',
        createdAt: '2024-03-15T10:00:00Z',
        _count: { comments: 0, likes: 0 },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ) {
    return this.feedService.createPost(req.user.id, createPostDto);
  }

  /**
   * Listar posts do feed
   * Retorna posts de usuários que o usuário autenticado segue + seus próprios posts
   */
  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter feed personalizado',
    description: 'Retorna posts de usuários seguidos + seus próprios posts',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['recent', 'trending', 'mostLiked'],
    description: 'Ordenação dos posts',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed carregado com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            content: 'Post interessante',
            authorId: 'uuid',
            createdAt: '2024-03-15T10:00:00Z',
            _count: { comments: 5, likes: 12 },
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    },
  })
  async getFeed(
    @Query() paginationDto: PaginationDto,
    @Query('sortBy') sortBy: 'recent' | 'trending' | 'mostLiked' = 'recent',
    @Request() req,
  ) {
    return this.feedService.getFeed(req.user.id, paginationDto, sortBy);
  }

  /**
   * Listar posts públicos (todos os usuários)
   */
  @Get('explore')
  @ApiOperation({
    summary: 'Explorar posts públicos',
    description: 'Retorna posts públicos de qualquer usuário',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Posts públicos carregados',
  })
  async getExplore(@Query() paginationDto: PaginationDto) {
    return this.feedService.getExplore(paginationDto);
  }

  /**
   * Obter post específico
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obter post por ID',
    description: 'Retorna um post específico com comentários',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 200,
    description: 'Post encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Post não encontrado',
  })
  async getPost(@Param('id') id: string) {
    return this.feedService.getPost(id);
  }

  /**
   * Obter posts de um usuário específico
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obter posts de um usuário',
    description: 'Retorna todos os posts públicos de um usuário',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'UUID do usuário',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Posts do usuário',
  })
  async getUserPosts(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.feedService.getUserPosts(userId, paginationDto);
  }

  /**
   * Atualizar post
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar post',
    description: 'Atualiza um post (apenas o autor pode atualizar)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 200,
    description: 'Post atualizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para atualizar',
  })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.feedService.updatePost(id, req.user.id, updatePostDto);
  }

  /**
   * Deletar post
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar post',
    description: 'Deleta um post (apenas o autor pode deletar)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 204,
    description: 'Post deletado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para deletar',
  })
  async deletePost(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.feedService.deletePost(id, req.user.id);
  }

  /**
   * Curtir post
   */
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Curtir post',
    description: 'Adiciona uma curtida ao post',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 200,
    description: 'Post curtido',
    schema: {
      example: {
        message: 'Post liked successfully',
        likesCount: 15,
      },
    },
  })
  async likePost(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.feedService.likePost(id, req.user.id);
  }

  /**
   * Remover curtida do post
   */
  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remover curtida',
    description: 'Remove a curtida do post',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 200,
    description: 'Curtida removida',
  })
  async unlikePost(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.feedService.unlikePost(id, req.user.id);
  }

  /**
   * Verificar se curtiu o post
   */
  @Get(':id/liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar curtida',
    description: 'Verifica se o usuário curtiu o post',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 200,
    description: 'Status de curtida',
  })
  async isPostLiked(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.feedService.isPostLiked(id, req.user.id);
  }

  /**
   * Obter curtidas do post
   */
  @Get(':id/likes')
  @ApiOperation({
    summary: 'Obter curtidas',
    description: 'Lista usuários que curtiram o post',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários que curtiram',
  })
  async getPostLikes(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.feedService.getPostLikes(id, paginationDto);
  }

  /**
   * Comentar em um post
   */
  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Comentar em post',
    description: 'Adiciona um comentário ao post',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiResponse({
    status: 201,
    description: 'Comentário criado',
  })
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.feedService.createComment(id, req.user.id, createCommentDto);
  }

  /**
   * Obter comentários do post
   */
  @Get(':id/comments')
  @ApiOperation({
    summary: 'Obter comentários',
    description: 'Lista comentários do post com paginação',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do post',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Comentários carregados',
  })
  async getComments(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.feedService.getComments(id, paginationDto);
  }

  /**
   * Atualizar comentário
   */
  @Put('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar comentário',
    description: 'Atualiza um comentário (apenas o autor)',
  })
  @ApiParam({
    name: 'commentId',
    type: String,
    description: 'UUID do comentário',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentário atualizado',
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.feedService.updateComment(commentId, req.user.id, body.content);
  }

  /**
   * Deletar comentário
   */
  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar comentário',
    description: 'Deleta um comentário (apenas o autor)',
  })
  @ApiParam({
    name: 'commentId',
    type: String,
    description: 'UUID do comentário',
  })
  @ApiResponse({
    status: 204,
    description: 'Comentário deletado',
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.feedService.deleteComment(commentId, req.user.id);
  }

  /**
   * Curtir comentário
   */
  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Curtir comentário',
    description: 'Adiciona uma curtida ao comentário',
  })
  @ApiParam({
    name: 'commentId',
    type: String,
    description: 'UUID do comentário',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentário curtido',
  })
  async likeComment(
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.feedService.likeComment(commentId, req.user.id);
  }

  /**
   * Remover curtida do comentário
   */
  @Delete('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remover curtida do comentário',
    description: 'Remove a curtida do comentário',
  })
  @ApiParam({
    name: 'commentId',
    type: String,
    description: 'UUID do comentário',
  })
  @ApiResponse({
    status: 200,
    description: 'Curtida removida',
  })
  async unlikeComment(
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.feedService.unlikeComment(commentId, req.user.id);
  }
}
