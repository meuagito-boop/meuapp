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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar ou obter conversa' })
  @ApiResponse({ status: 201, description: 'Conversa criada/obtida' })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req,
  ) {
    return this.chatService.createOrGetConversation(
      req.user.id,
      createConversationDto.recipientId,
    );
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async listConversations(
    @Query() paginationDto: PaginationDto,
    @Request() req,
  ) {
    return this.chatService.listConversations(req.user.id, paginationDto);
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Detalhes da conversa' })
  async getConversation(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.chatService.getConversation(id, req.user.id);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter mensagens da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Histórico de mensagens' })
  async getMessages(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
    @Request() req,
  ) {
    return this.chatService.getMessages(id, paginationDto, req.user.id);
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensagem (com arquivo opcional)' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  async sendMessage(
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req,
  ) {
    let fileUrl: string | undefined;

    if (file) {
      // Salvar arquivo em cloud storage (S3, etc)
      // Por enquanto, usar path local
      fileUrl = `/uploads/${file.filename}`;
    }

    return this.chatService.createMessage(
      id,
      req.user.id,
      sendMessageDto.content,
      fileUrl,
      file?.mimetype,
    );
  }

  @Put('messages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem editada' })
  async editMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.chatService.editMessage(id, req.user.id, body.content);
  }

  @Delete('messages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem deletada' })
  async deleteMessage(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.chatService.deleteMessage(id, req.user.id);
  }

  @Put('conversations/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar conversa como lida' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Conversa marcada como lida' })
  async markConversationAsRead(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.chatService.markAsRead(id, req.user.id);
  }

  @Get('conversations/search/query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar conversas' })
  @ApiQuery({ name: 'q', description: 'Termo de busca' })
  @ApiResponse({ status: 200, description: 'Conversas encontradas' })
  async searchConversations(
    @Query('q') query: string,
    @Request() req,
  ) {
    return this.chatService.searchConversations(req.user.id, query);
  }

  @Get('conversations/unread/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar mensagens não lidas' })
  @ApiResponse({ status: 200, description: 'Total de mensagens não lidas' })
  async getUnreadCount(
    @Request() req,
  ) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar/Arquivar conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Conversa arquivada' })
  async deleteConversation(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.chatService.archiveConversation(id, req.user.id);
  }
}
