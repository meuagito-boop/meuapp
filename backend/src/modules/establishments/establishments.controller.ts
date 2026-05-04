import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dtos/create-establishment.dto';
import { UpdateEstablishmentDto } from './dtos/update-establishment.dto';
import { CreateReviewDto } from '../events/dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ListEstablishmentsQueryDto } from './dtos/list-establishments-query.dto';
import { MediaService } from '@modules/media/media.service';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { AuthorizeResourceOwner } from '@modules/auth/decorators/authorize-resource.decorator';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';

@ApiTags('Establishments')
@Controller('establishments')
export class EstablishmentsController {
  constructor(
    private readonly establishmentsService: EstablishmentsService,
    private readonly mediaService: MediaService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo estabelecimento' })
  @ApiResponse({ status: 201, description: 'Estabelecimento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createEstablishment(
    @Body() createEstablishmentDto: CreateEstablishmentDto,
    @CurrentUserId() userId: string
  ) {
    return this.establishmentsService.createEstablishment(userId, createEstablishmentDto);
  }

  @Post(':id/media')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can manage establishment media.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload de mídia do estabelecimento',
    description: 'Envia imagem do estabelecimento para storage externo/local e registra metadados',
  })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  async uploadEstablishmentMedia(
    @Param('id') id: string,
    @Query('target') target: 'gallery' | 'logo' | 'cover' = 'gallery',
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserId() userId: string
  ) {
    if (!['gallery', 'logo', 'cover'].includes(target)) {
      throw new BadRequestException('Invalid establishment media target');
    }

    const uploadedMedia = await this.mediaService.uploadEstablishmentMedia(userId, id, file);
    await this.establishmentsService.registerUploadedMediaTarget(
      id,
      userId,
      uploadedMedia.publicUrl,
      target
    );
    return uploadedMedia;
  }

  @Get()
  @ApiOperation({ summary: 'Listar estabelecimentos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'distance', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'subcategory', required: false, type: String })
  @ApiQuery({ name: 'openNow', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de estabelecimentos' })
  async listEstablishments(@Query() queryDto: ListEstablishmentsQueryDto) {
    const { latitude, longitude, distance, category, subcategory, openNow, page, limit } = queryDto;
    const paginationDto: PaginationDto = { page, limit };

    return this.establishmentsService.listEstablishments(paginationDto, {
      latitude,
      longitude,
      distance,
      category,
      subcategory,
      openNow,
    });
  }

  @Get('me/owned')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter o estabelecimento da conta autenticada' })
  @ApiResponse({ status: 200, description: 'Estabelecimento do dono autenticado' })
  @ApiResponse({ status: 404, description: 'Nenhum estabelecimento ativo encontrado para a conta' })
  async getOwnedEstablishment(@CurrentUserId() userId: string) {
    return this.establishmentsService.getOwnedEstablishment(userId);
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar estabelecimentos favoritos da conta autenticada' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de estabelecimentos favoritos' })
  async listFavoriteEstablishments(
    @CurrentUserId() userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.establishmentsService.listFavoriteEstablishments(userId, paginationDto);
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
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can update this establishment.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento atualizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar' })
  async updateEstablishment(
    @Param('id') id: string,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
    @CurrentUserId() userId: string
  ) {
    return this.establishmentsService.updateEstablishment(id, userId, updateEstablishmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'establishment',
    param: 'id',
    message: 'Only the establishment owner can delete this establishment.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento deletado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  async deleteEstablishment(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.establishmentsService.deleteEstablishment(id, userId);
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
    @CurrentUserId() userId: string
  ) {
    return this.establishmentsService.createReview(id, userId, createReviewDto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Obter avaliações de um estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de avaliações' })
  async getReviews(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.establishmentsService.getReviews(id, paginationDto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Favoritar estabelecimento' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Estabelecimento favoritado' })
  async favoriteEstablishment(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.establishmentsService.favoriteEstablishment(id, userId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover estabelecimento dos favoritos' })
  @ApiParam({ name: 'id', description: 'ID do estabelecimento' })
  @ApiResponse({ status: 200, description: 'Removido dos favoritos' })
  async unfavoriteEstablishment(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.establishmentsService.unfavoriteEstablishment(id, userId);
  }
}
