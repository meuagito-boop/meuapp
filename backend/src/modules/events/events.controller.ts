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
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Criar um novo evento
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar evento',
    description: 'Cria um novo evento (apenas usuários autenticados)',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento criado com sucesso',
  })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req,
  ) {
    return this.eventsService.createEvent(req.user.id, createEventDto);
  }

  /**
   * Listar eventos
   */
  @Get()
  @ApiOperation({
    summary: 'Listar eventos',
    description: 'Lista eventos públicos com paginação',
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
    description: 'Raio em km (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos',
  })
  async listEvents(
    @Query() paginationDto: PaginationDto,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('distance') distance?: number,
  ) {
    return this.eventsService.listEvents(paginationDto, {
      latitude,
      longitude,
      distance,
    });
  }

  /**
   * Obter evento específico
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obter evento',
    description: 'Retorna um evento específico com detalhes',
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
  @UseGuards(JwtAuthGuard)
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
    @Request() req,
  ) {
    return this.eventsService.updateEvent(id, req.user.id, updateEventDto);
  }

  /**
   * Deletar evento
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
  async deleteEvent(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.eventsService.deleteEvent(id, req.user.id);
  }

  /**
   * Confirmar presença no evento
   */
  @Post(':id/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar presença',
    description: 'Adiciona usuário como attendee do evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Presença confirmada',
  })
  async attendEvent(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.eventsService.attendEvent(id, req.user.id);
  }

  /**
   * Cancelar presença
   */
  @Delete(':id/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar presença',
    description: 'Remove usuário como attendee do evento',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Presença cancelada',
  })
  async cancelAttendance(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.eventsService.cancelAttendance(id, req.user.id);
  }

  /**
   * Listar attendees do evento
   */
  @Get(':id/attendees')
  @ApiOperation({
    summary: 'Listar attendees',
    description: 'Lista quem confirmou presença no evento',
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
  async getAttendees(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.eventsService.getAttendees(id, paginationDto);
  }

  /**
   * Criar avaliação do evento
   */
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Avaliar evento',
    description: 'Cria uma avaliação/review do evento',
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
    @Request() req,
  ) {
    return this.eventsService.createReview(id, req.user.id, createReviewDto);
  }

  /**
   * Obter reviews do evento
   */
  @Get(':id/reviews')
  @ApiOperation({
    summary: 'Obter reviews',
    description: 'Lista reviews/avaliações do evento',
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
  async getReviews(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.eventsService.getReviews(id, paginationDto);
  }
}
