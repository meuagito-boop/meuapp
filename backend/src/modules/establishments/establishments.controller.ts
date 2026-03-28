import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dtos/create-establishment.dto';
import { UpdateEstablishmentDto } from './dtos/update-establishment.dto';
import { CreateReviewDto } from '../events/dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Establishments')
@Controller('establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo estabelecimento' })
  @ApiResponse({ status: 201, description: 'Estabelecimento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createEstablishment(
    @Body() createEstablishmentDto: CreateEstablishmentDto,
    @Request() req,
  ) {
    return this.establishmentsService.createEstablishment(req.user.id, createEstablishmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar estabelecimentos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'distance', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de estabelecimentos' })
  async listEstablishments(
    @Query() paginationDto: PaginationDto,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('distance') distance?: number,
    @Query('category') category?: string,
  ) {
    return this.establishmentsService.listEstablishments(paginationDto, {
      latitude,
      longitude,
      distance,
      category,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Detalhes do estabelecimento' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  async getEstablishment(@Param('id') id: string) {
    return this.establishmentsService.getEstablishment(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento atualizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar' })
  async updateEstablishment(
    @Param('id') id: string,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
    @Request() req,
  ) {
    return this.establishmentsService.updateEstablishment(id, req.user.id, updateEstablishmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento deletado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  async deleteEstablishment(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.establishmentsService.deleteEstablishment(id, req.user.id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar avaliação para estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 201, description: 'Avaliação criada' })
  async createReview(
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req,
  ) {
    return this.establishmentsService.createReview(id, req.user.id, createReviewDto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Obter avaliações de um estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de avaliações' })
  async getReviews(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.establishmentsService.getReviews(id, paginationDto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Favoritar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento favoritado' })
  async favoriteEstablishment(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.establishmentsService.favoriteEstablishment(id, req.user.id);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover estabelecimento dos favoritos' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Removido dos favoritos' })
  async unfavoriteEstablishment(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.establishmentsService.unfavoriteEstablishment(id, req.user.id);
  }
}
