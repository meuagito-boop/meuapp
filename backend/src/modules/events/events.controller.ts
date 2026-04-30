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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ListEventsQueryDto } from './dtos/list-events-query.dto';
import { MediaService } from '@modules/media/media.service';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';
import { AuthorizeResourceOwner } from '@modules/auth/decorators/authorize-resource.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly mediaService: MediaService
  ) {}

  /**
   * Criar um novo evento
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar evento',
    description: 'Cria um novo evento (apenas usuÃƒÂ¡rios autenticados)',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento criado com sucesso',
  })
  async createEvent(@Body() createEventDto: CreateEventDto, @CurrentUserId() userId: string) {
    return this.eventsService.createEvent(userId, createEventDto);
  }

  @Post(':id/media')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'event',
    param: 'id',
    message: 'Only event organizer can upload media',
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
    summary: 'Upload de mÃƒÂ­dia do evento',
    description: 'Envia imagem do evento para storage externo/local e registra metadados',
  })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  async uploadEventMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserId() userId: string
  ) {
    return this.mediaService.uploadEventMedia(userId, id, file);
  }

  /**
   * Listar eventos
   */
  @Get()
  @ApiOperation({
    summary: 'Listar eventos',
    description: 'Lista eventos pÃƒÂºblicos com paginaÃƒÂ§ÃƒÂ£o',
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
  @ApiQuery({
    name: 'latitude',
    required: false,
    type: Number,
    description: 'Latitude para busca de proximidade',
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
    type: Number,
    description: 'Longitude para busca de proximidade',
  })
  @ApiQuery({
    name: 'distance',
    required: false,
    type: Number,
    description: 'Raio em km (padrÃƒÂ£o: 10)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Categoria do evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos',
  })
  async listEvents(@Query() queryDto: ListEventsQueryDto) {
    const { latitude, longitude, distance, category, page, limit } = queryDto;
    const paginationDto: PaginationDto = { page, limit };

    return this.eventsService.listEvents(paginationDto, {
      latitude,
      longitude,
      distance,
      category,
    });
  }

  /**
   * Obter evento especÃƒÂ­fico
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obter evento',
    description: 'Retorna um evento especÃƒÂ­fico com detalhes',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento encontrado',
  })
  async getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  /**
   * Atualizar evento
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'event',
    param: 'id',
    message: 'Only event organizer can update',
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar evento',
    description: 'Atualiza um evento (apenas o criador)',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Evento atualizado',
  })
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUserId() userId: string
  ) {
    return this.eventsService.updateEvent(id, userId, updateEventDto);
  }

  /**
   * Deletar evento
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'event',
    param: 'id',
    message: 'Only event organizer can delete',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar evento',
    description: 'Deleta um evento (apenas o criador)',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Evento deletado',
  })
  async deleteEvent(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.eventsService.deleteEvent(id, userId);
  }

  /**
   * Confirmar presenÃƒÂ§a no evento
   */
  @Post(':id/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar presenÃƒÂ§a',
    description: 'Adiciona usuÃƒÂ¡rio como attendee do evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'PresenÃƒÂ§a confirmada',
  })
  async attendEvent(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.eventsService.attendEvent(id, userId);
  }

  /**
   * Cancelar presenÃƒÂ§a
   */
  @Delete(':id/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar presenÃƒÂ§a',
    description: 'Remove usuÃƒÂ¡rio como attendee do evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'PresenÃƒÂ§a cancelada',
  })
  async cancelAttendance(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.eventsService.cancelAttendance(id, userId);
  }

  /**
   * Listar attendees do evento
   */
  @Get(':id/attendees')
  @ApiOperation({
    summary: 'Listar attendees',
    description: 'Lista quem confirmou presenÃƒÂ§a no evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
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
    description: 'Lista de attendees',
  })
  async getAttendees(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.eventsService.getAttendees(id, paginationDto);
  }

  /**
   * Criar avaliaÃƒÂ§ÃƒÂ£o do evento
   */
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Avaliar evento',
    description: 'Cria uma avaliaÃƒÂ§ÃƒÂ£o/review do evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Review criada',
  })
  async createReview(
    @Param('id') id: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUserId() userId: string
  ) {
    return this.eventsService.createReview(id, userId, createReviewDto);
  }

  /**
   * Obter reviews do evento
   */
  @Get(':id/reviews')
  @ApiOperation({
    summary: 'Obter reviews',
    description: 'Lista reviews/avaliaÃƒÂ§ÃƒÂµes do evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
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
    description: 'Lista de reviews',
  })
  async getReviews(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.eventsService.getReviews(id, paginationDto);
  }
}
