import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GlobalSearchDto } from './dtos/global-search.dto';
import { AdvancedSearchDto } from './dtos/advanced-search.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  private toOptionalNumber(value: number | string | undefined): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toOptionalBoolean(value: boolean | string | undefined): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'sim'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'nao', 'não'].includes(normalized)) {
      return false;
    }

    return undefined;
  }

  /**
   * Busca global em todas as entidades
   * Retorna posts, usuários, eventos e estabelecimentos
   */
  @Get('global')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca global',
    description: 'Busca em posts, usuários, eventos e estabelecimentos',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: true,
    description: 'Termo de busca',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Itens por tipo (padrão: 5)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca global',
    schema: {
      example: {
        posts: [
          {
            id: 'uuid',
            content: 'Post sobre festa',
            authorId: 'uuid',
            _count: { comments: 5, likes: 12 },
          },
        ],
        users: [
          {
            id: 'uuid',
            name: 'João Silva',
            avatar: 'https://example.com/avatar.jpg',
            _count: { followers: 42, following: 18 },
          },
        ],
        events: [],
        establishments: [],
        total: 2,
      },
    },
  })
  async globalSearch(@Query() query: GlobalSearchDto) {
    return this.searchService.globalSearch(query.q, query.limit ?? 5);
  }

  /**
   * Busca avançada de posts com filtros
   */
  @Get('posts')
  @ApiOperation({
    summary: 'Busca avançada de posts',
    description: 'Busca posts com filtros por conteúdo, autor, data',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: false,
    description: 'Termo de busca',
  })
  @ApiQuery({
    name: 'authorId',
    type: String,
    required: false,
    description: 'UUID do autor',
  })
  @ApiQuery({
    name: 'sortBy',
    enum: ['recent', 'trending', 'mostLiked'],
    required: false,
    description: 'Ordenação',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Posts encontrados',
  })
  async searchPosts(@Query() query: AdvancedSearchDto) {
    return this.searchService.searchPosts(query);
  }

  /**
   * Busca de usuários com filtros
   */
  @Get('users')
  @ApiOperation({
    summary: 'Busca de usuários',
    description: 'Busca usuários por nome, email ou bio',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: true,
    description: 'Termo de busca (nome ou email)',
  })
  @ApiQuery({
    name: 'profileType',
    enum: ['USER', 'ESTABLISHMENT'],
    required: false,
    description: 'Tipo de perfil',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários encontrados',
  })
  async searchUsers(
    @Query('q') q: string,
    @Query('profileType') profileType: string,
    @Query('page') page: number | string,
    @Query('limit') limit: number | string
  ) {
    const paginationDto: PaginationDto = {
      page: this.toOptionalNumber(page),
      limit: this.toOptionalNumber(limit),
    };

    return this.searchService.searchUsers(q, profileType, paginationDto);
  }

  /**
   * Busca de eventos por localização e data
   */
  @Get('events')
  @ApiOperation({
    summary: 'Busca de eventos',
    description: 'Busca eventos por localização, data e categoria',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: false,
    description: 'Nome do evento',
  })
  @ApiQuery({
    name: 'latitude',
    type: Number,
    required: false,
    description: 'Latitude para busca de proximidade',
  })
  @ApiQuery({
    name: 'longitude',
    type: Number,
    required: false,
    description: 'Longitude para busca de proximidade',
  })
  @ApiQuery({
    name: 'distance',
    type: Number,
    required: false,
    description: 'Raio de busca em km (padrão: 10)',
  })
  @ApiQuery({
    name: 'category',
    type: String,
    required: false,
    description: 'Categoria do evento',
  })
  @ApiQuery({
    name: 'dateFrom',
    type: String,
    required: false,
    description: 'Data mínima (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    type: String,
    required: false,
    description: 'Data máxima (ISO 8601)',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos encontrados',
  })
  async searchEvents(
    @Query('q') q: string,
    @Query('latitude') latitude: number | string,
    @Query('longitude') longitude: number | string,
    @Query('distance') distance: number | string,
    @Query('category') category: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('page') page: number | string,
    @Query('limit') limit: number | string
  ) {
    const paginationDto: PaginationDto = {
      page: this.toOptionalNumber(page),
      limit: this.toOptionalNumber(limit),
    };

    return this.searchService.searchEvents(
      {
        q,
        latitude: this.toOptionalNumber(latitude),
        longitude: this.toOptionalNumber(longitude),
        distance: this.toOptionalNumber(distance),
        category,
        dateFrom,
        dateTo,
      },
      paginationDto
    );
  }

  /**
   * Busca de estabelecimentos por localização
   */
  @Get('establishments')
  @ApiOperation({
    summary: 'Busca de estabelecimentos',
    description: 'Busca estabelecimentos por localização, categoria e rating',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: false,
    description: 'Nome do estabelecimento',
  })
  @ApiQuery({
    name: 'latitude',
    type: Number,
    required: true,
    description: 'Latitude',
  })
  @ApiQuery({
    name: 'longitude',
    type: Number,
    required: true,
    description: 'Longitude',
  })
  @ApiQuery({
    name: 'distance',
    type: Number,
    required: false,
    description: 'Raio de busca em km (padrão: 5)',
  })
  @ApiQuery({
    name: 'category',
    type: String,
    required: false,
    description: 'Categoria',
  })
  @ApiQuery({
    name: 'subcategory',
    type: String,
    required: false,
    description: 'Subcategoria',
  })
  @ApiQuery({
    name: 'openNow',
    type: Boolean,
    required: false,
    description: 'Filtrar por estabelecimentos abertos agora',
  })
  @ApiQuery({
    name: 'minRating',
    type: Number,
    required: false,
    description: 'Rating mínimo (0-5)',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Estabelecimentos encontrados',
  })
  async searchEstablishments(
    @Query('q') q: string,
    @Query('latitude') latitude: number | string,
    @Query('longitude') longitude: number | string,
    @Query('distance') distance: number | string,
    @Query('category') category: string,
    @Query('subcategory') subcategory: string,
    @Query('openNow') openNow: boolean | string,
    @Query('minRating') minRating: number | string,
    @Query('page') page: number | string,
    @Query('limit') limit: number | string
  ) {
    const paginationDto: PaginationDto = {
      page: this.toOptionalNumber(page),
      limit: this.toOptionalNumber(limit),
    };

    return this.searchService.searchEstablishments(
      {
        q,
        latitude: this.toOptionalNumber(latitude),
        longitude: this.toOptionalNumber(longitude),
        distance: this.toOptionalNumber(distance),
        category,
        subcategory,
        openNow: this.toOptionalBoolean(openNow),
        minRating: this.toOptionalNumber(minRating),
      },
      paginationDto
    );
  }

  /**
   * Autocomplete em tempo real
   */
  @Get('autocomplete')
  @ApiOperation({
    summary: 'Autocomplete',
    description: 'Sugestões de busca em tempo real',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: true,
    description: 'Termo parcial',
  })
  @ApiQuery({
    name: 'types',
    type: String,
    required: false,
    description: 'Tipos a buscar: posts,users,events,establishments (separado por vírgula)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limite de sugestões (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugestões de autocomplete',
    schema: {
      example: {
        suggestions: [
          {
            id: 'uuid',
            text: 'Festa no Itaim Bibi',
            type: 'post',
            highlight: 'Festa',
          },
          {
            id: 'uuid',
            text: 'João Silva',
            type: 'user',
            highlight: 'Jo',
          },
        ],
      },
    },
  })
  async autocomplete(
    @Query('q') q: string,
    @Query('types') types: string,
    @Query('limit') limit: number = 10
  ) {
    return this.searchService.autocomplete(
      q,
      types?.split(',') || ['posts', 'users', 'events', 'establishments'],
      limit
    );
  }

  /**
   * Sugestões de trending (mais procurados)
   */
  @Get('trending')
  @ApiOperation({
    summary: 'Tendências',
    description: 'Posts, usuários e eventos em tendência',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Limite de itens por tipo (padrão: 5)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tendências atuais',
  })
  async trending(@Query('limit') limit: number = 5) {
    return this.searchService.getTrending(limit);
  }
}
