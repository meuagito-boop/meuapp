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
import { MediaService } from '@modules/media/media.service';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { ResourceOwnerGuard } from '@modules/auth/guards/resource-owner.guard';
import { AuthorizeResourceOwner } from '@modules/auth/decorators/authorize-resource.decorator';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly mediaService: MediaService
  ) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar ou obter conversa' })
  @ApiResponse({ status: 201, description: 'Conversa criada/obtida' })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUserId() userId: string
  ) {
    return this.chatService.createOrGetConversation(userId, createConversationDto.recipientId);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async listConversations(@Query() paginationDto: PaginationDto, @CurrentUserId() userId: string) {
    return this.chatService.listConversations(userId, paginationDto);
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Detalhes da conversa' })
  async getConversation(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.chatService.getConversation(id, userId);
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
    @CurrentUserId() userId: string
  ) {
    return this.chatService.getMessages(id, paginationDto, userId);
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensagem (com arquivo opcional)' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  async sendMessage(
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserId() userId: string
  ) {
    let fileUrl: string | undefined;

    if (file) {
      const uploadedMedia = await this.mediaService.uploadChatAttachment(userId, id, file);
      fileUrl = uploadedMedia.publicUrl;
    }

    return this.chatService.createMessage(
      id,
      userId,
      sendMessageDto.content,
      fileUrl,
      file?.mimetype
    );
  }

  @Put('messages/:id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'message',
    param: 'id',
    message: 'Only message sender can edit this message',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Editar mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem editada' })
  async editMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @CurrentUserId() userId: string
  ) {
    return this.chatService.editMessage(id, userId, body.content);
  }

  @Delete('messages/:id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @AuthorizeResourceOwner({
    resource: 'message',
    param: 'id',
    message: 'Only message sender can delete this message',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 200, description: 'Mensagem deletada' })
  async deleteMessage(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.chatService.deleteMessage(id, userId);
  }

  @Put('conversations/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar conversa como lida' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Conversa marcada como lida' })
  async markConversationAsRead(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.chatService.markAsRead(id, userId);
  }

  @Get('conversations/search/query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar conversas' })
  @ApiQuery({ name: 'q', description: 'Termo de busca' })
  @ApiResponse({ status: 200, description: 'Conversas encontradas' })
  async searchConversations(@Query('q') query: string, @CurrentUserId() userId: string) {
    return this.chatService.searchConversations(userId, query);
  }

  @Get('conversations/unread/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar mensagens não lidas' })
  @ApiResponse({ status: 200, description: 'Total de mensagens não lidas' })
  async getUnreadCount(@CurrentUserId() userId: string) {
    return this.chatService.getUnreadCount(userId);
  }

  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar/Arquivar conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Conversa arquivada' })
  async deleteConversation(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.chatService.archiveConversation(id, userId);
  }
}
