import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { AuditLogService } from '@common/audit/audit-log.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  /**
   * Criar ou obter conversa existente
   */
  async createOrGetConversation(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Procurar conversa existente
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: recipientId } } },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (existingConversation) {
      return this.sanitizeConversation(existingConversation);
    }

    // Criar nova conversa
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: userId }, { id: recipientId }],
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'conversation.create',
        entity: 'Conversation',
        entityId: conversation.id,
        changes: {
          participantIds: [userId, recipientId],
        },
      });

      return this.sanitizeConversation(conversation);
    } catch (error) {
      throw new BadRequestException('Failed to create conversation');
    }
  }

  /**
   * Listar conversas do usuário
   */
  async listConversations(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          participants: {
            some: { id: userId },
          },
          archivedBy: {
            none: { id: userId },
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: {
          participants: { some: { id: userId } },
          archivedBy: { none: { id: userId } },
        },
      }),
    ]);

    return {
      data: conversations.map((c) => this.sanitizeConversation(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obter conversa específica
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar se usuário está na conversa
    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    return this.sanitizeConversation(conversation);
  }

  /**
   * Obter mensagens da conversa
   */
  async getMessages(conversationId: string, paginationDto: PaginationDto, userId: string) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar permissão
    const isParticipant = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } },
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          readBy: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      data: messages.map((m) => this.sanitizeMessage(m)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Criar mensagem
   */
  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    fileUrl?: string,
    fileType?: string
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === senderId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    try {
      const message = await this.prisma.message.create({
        data: {
          content,
          fileUrl,
          fileType,
          conversationId,
          senderId,
          userId: senderId,
          readBy: {
            connect: { id: senderId },
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          readBy: {
            select: {
              id: true,
            },
          },
        },
      });

      // Atualizar updatedAt da conversa
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      await this.auditLogService?.record({
        userId: senderId,
        action: 'message.create',
        entity: 'Message',
        entityId: message.id,
        changes: {
          conversationId,
          fileType: message.fileType,
          hasFile: Boolean(message.fileUrl),
          contentLength: message.content?.length ?? 0,
        },
      });

      return this.sanitizeMessage(message);
    } catch (error) {
      throw new BadRequestException('Failed to create message');
    }
  }

  /**
   * Editar mensagem
   */
  async editMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Only sender can edit');
    }

    if (message.editedAt) {
      throw new BadRequestException('Message already edited');
    }

    try {
      const updatedMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content,
          editedAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          readBy: {
            select: {
              id: true,
            },
          },
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'message.update',
        entity: 'Message',
        entityId: messageId,
        changes: {
          conversationId: updatedMessage.conversationId,
          contentLength: updatedMessage.content?.length ?? 0,
          editedAt: updatedMessage.editedAt,
        },
      });

      return this.sanitizeMessage(updatedMessage);
    } catch (error) {
      throw new BadRequestException('Failed to edit message');
    }
  }

  /**
   * Deletar mensagem (soft delete)
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Only sender can delete');
    }

    try {
      await this.prisma.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date() },
      });

      await this.auditLogService?.record({
        userId,
        action: 'message.soft_delete',
        entity: 'Message',
        entityId: messageId,
        changes: {
          conversationId: message.conversationId,
        },
      });

      return { message: 'Message deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete message');
    }
  }

  /**
   * Marcar mensagens como lidas
   */
  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    try {
      // Marcar todas as mensagens como lidas para este usuário
      const unreadMessages = await this.prisma.message.findMany({
        where: {
          conversationId,
          senderId: { not: userId },
          readBy: {
            none: { id: userId },
          },
        },
        select: {
          id: true,
        },
      });

      await Promise.all(
        unreadMessages.map((message) =>
          this.prisma.message.update({
            where: { id: message.id },
            data: {
              readBy: {
                connect: { id: userId },
              },
            },
          })
        )
      );

      await this.auditLogService?.record({
        userId,
        action: 'message.mark_read',
        entity: 'Conversation',
        entityId: conversationId,
        changes: {
          readCount: unreadMessages.length,
        },
      });

      return { message: 'Messages marked as read' };
    } catch (error) {
      throw new BadRequestException('Failed to mark as read');
    }
  }

  /**
   * Buscar conversas por nome ou último conteúdo
   */
  async searchConversations(userId: string, query: string) {
    return this.prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          {
            OR: [
              {
                participants: {
                  some: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
              },
              {
                messages: {
                  some: {
                    content: { contains: query, mode: 'insensitive' },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      take: 10,
    });
  }

  /**
   * Contar mensagens não lidas
   */
  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { id: userId } },
      },
      include: {
        messages: {
          where: {
            senderId: { not: userId },
            readBy: { none: { id: userId } },
          },
        },
      },
    });

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);

    const unreadByConversation = conversations
      .map((conv) => ({
        conversationId: conv.id,
        unreadCount: conv.messages.length,
      }))
      .filter((item) => item.unreadCount > 0);

    return {
      total: totalUnread,
      byConversation: unreadByConversation,
    };
  }

  /**
   * Arquivar conversa
   */
  async archiveConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    try {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          archivedBy: {
            connect: { id: userId },
          },
        },
      });

      await this.auditLogService?.record({
        userId,
        action: 'conversation.archive',
        entity: 'Conversation',
        entityId: conversationId,
      });

      return { message: 'Conversation archived' };
    } catch (error) {
      throw new BadRequestException('Failed to archive conversation');
    }
  }

  /**
   * Sanitizar conversa
   */
  private sanitizeConversation(conversation: any) {
    return {
      ...conversation,
      participants: conversation.participants,
    };
  }

  /**
   * Sanitizar mensagem
   */
  private sanitizeMessage(message: any) {
    const sanitized = { ...message };
    delete sanitized.deletedAt;
    return sanitized;
  }
}
