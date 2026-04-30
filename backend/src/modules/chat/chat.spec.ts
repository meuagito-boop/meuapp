import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MediaService } from '@modules/media/media.service';

describe('ChatModule', () => {
  let service: ChatService;
  let controller: ChatController;
  let gateway: ChatGateway;

  const mockPrismaService = {
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-jwt-secret'),
  };

  const mockMediaService = {
    uploadChatAttachment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        ChatService,
        ChatGateway,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    controller = module.get<ChatController>(ChatController);
    gateway = module.get<ChatGateway>(ChatGateway);

    (gateway as any).server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ChatService', () => {
    describe('createOrGetConversation', () => {
      it('should create new conversation', async () => {
        const userId = 'user-1';
        const recipientId = 'user-2';

        jest.spyOn(mockPrismaService.conversation, 'findFirst').mockResolvedValue(null);

        const mockConversation = {
          id: 'conv-123',
          participants: [
            { id: userId, name: 'User 1', avatar: null },
            { id: recipientId, name: 'User 2', avatar: null },
          ],
          _count: { messages: 0 },
        };

        jest.spyOn(mockPrismaService.conversation, 'create').mockResolvedValue(mockConversation);

        const result = await service.createOrGetConversation(userId, recipientId);

        expect(result).toHaveProperty('id');
        expect(result.participants).toHaveLength(2);
      });

      it('should return existing conversation', async () => {
        const userId = 'user-1';
        const recipientId = 'user-2';

        const mockConversation = {
          id: 'conv-123',
          participants: [
            { id: userId, name: 'User 1', avatar: null },
            { id: recipientId, name: 'User 2', avatar: null },
          ],
          messages: [],
          _count: { messages: 5 },
        };

        jest.spyOn(mockPrismaService.conversation, 'findFirst').mockResolvedValue(mockConversation);

        const result = await service.createOrGetConversation(userId, recipientId);

        expect(result.id).toBe('conv-123');
      });

      it('should throw error if same user', async () => {
        const userId = 'user-1';

        await expect(service.createOrGetConversation(userId, userId)).rejects.toThrow(
          'Cannot create conversation with yourself'
        );
      });
    });

    describe('listConversations', () => {
      it('should list user conversations', async () => {
        const userId = 'user-1';
        const paginationDto = { page: 1, limit: 20 };

        const mockConversations = [
          {
            id: 'conv-1',
            participants: [{ id: 'user-2', name: 'User 2', avatar: null }],
            messages: [{ content: 'Hello', createdAt: new Date() }],
            _count: { messages: 1 },
          },
        ];

        jest.spyOn(mockPrismaService.conversation, 'findMany').mockResolvedValue(mockConversations);
        jest.spyOn(mockPrismaService.conversation, 'count').mockResolvedValue(1);

        const result = await service.listConversations(userId, paginationDto);

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total', 1);
        expect(result.data).toHaveLength(1);
      });
    });

    describe('createMessage', () => {
      it('should create a message', async () => {
        const conversationId = 'conv-123';
        const senderId = 'user-1';
        const content = 'Hello!';

        const mockConversation = {
          id: conversationId,
          participants: [{ id: senderId }, { id: 'user-2' }],
        };

        const mockMessage = {
          id: 'msg-123',
          content,
          conversationId,
          senderId,
          fileUrl: null,
          fileType: null,
          sender: {
            id: senderId,
            name: 'User 1',
            avatar: null,
          },
          readBy: [{ id: senderId }],
          createdAt: new Date(),
          editedAt: null,
          deletedAt: null,
        };

        jest
          .spyOn(mockPrismaService.conversation, 'findUnique')
          .mockResolvedValue(mockConversation as any);
        jest.spyOn(mockPrismaService.message, 'create').mockResolvedValue(mockMessage as any);

        const result = await service.createMessage(conversationId, senderId, content);

        expect(result).toHaveProperty('id');
        expect(result.content).toBe(content);
        expect(mockPrismaService.message.create).toHaveBeenCalledTimes(1);
      });

      it('should throw error if conversation not found', async () => {
        jest.spyOn(mockPrismaService.conversation, 'findUnique').mockResolvedValue(null);

        await expect(service.createMessage('invalid', 'user-1', 'Hello')).rejects.toThrow(
          'Conversation not found'
        );
      });
    });

    describe('markAsRead', () => {
      it('should mark messages as read', async () => {
        const conversationId = 'conv-123';
        const userId = 'user-1';

        const mockConversation = {
          id: conversationId,
          participants: [{ id: userId }, { id: 'user-2' }],
        };

        jest
          .spyOn(mockPrismaService.conversation, 'findUnique')
          .mockResolvedValue(mockConversation as any);
        jest
          .spyOn(mockPrismaService.message, 'findMany')
          .mockResolvedValue([{ id: 'msg-1' }, { id: 'msg-2' }] as any);
        jest.spyOn(mockPrismaService.message, 'update').mockResolvedValue({} as any);

        const result = await service.markAsRead(conversationId, userId);

        expect(result).toHaveProperty('message');
        expect(mockPrismaService.message.findMany).toHaveBeenCalledTimes(1);
        expect(mockPrismaService.message.update).toHaveBeenCalledTimes(2);
      });
    });

    describe('getUnreadCount', () => {
      it('should count unread messages', async () => {
        const userId = 'user-1';

        const mockConversations = [
          {
            id: 'conv-1',
            messages: [
              { id: 'msg-1', senderId: 'user-2' },
              { id: 'msg-2', senderId: 'user-2' },
            ],
          },
          {
            id: 'conv-2',
            messages: [{ id: 'msg-3', senderId: 'user-3' }],
          },
        ];

        jest
          .spyOn(mockPrismaService.conversation, 'findMany')
          .mockResolvedValue(mockConversations as any);

        const result = await service.getUnreadCount(userId);

        expect(result).toHaveProperty('total', 3);
        expect(result).toHaveProperty('byConversation');
        expect(result.byConversation).toHaveLength(2);
      });
    });
  });

  describe('ChatController', () => {
    describe('POST /chat/conversations', () => {
      it('should create conversation', async () => {
        const createConversationDto = { recipientId: 'user-2' };

        jest.spyOn(service, 'createOrGetConversation').mockResolvedValue({ id: 'conv-1' } as any);

        const result = await controller.createConversation(createConversationDto, 'user-1');

        expect(result).toHaveProperty('id');
      });
    });

    describe('GET /chat/conversations', () => {
      it('should list conversations', async () => {
        const paginationDto = { page: 1, limit: 20 };

        jest.spyOn(service, 'listConversations').mockResolvedValue({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        } as any);

        const result = await controller.listConversations(paginationDto, 'user-1');

        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('total');
      });
    });

    describe('POST /chat/conversations/:id/messages', () => {
      it('should send message', async () => {
        const conversationId = 'conv-123';
        const sendMessageDto = { content: 'Hello!' };

        jest.spyOn(service, 'createMessage').mockResolvedValue({
          id: 'msg-123',
          content: 'Hello!',
        } as any);

        const result = await controller.sendMessage(
          conversationId,
          sendMessageDto,
          undefined,
          'user-1'
        );

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('content', 'Hello!');
      });
    });

    describe('GET /chat/conversations/unread/count', () => {
      it('should get unread count', async () => {
        jest.spyOn(service, 'getUnreadCount').mockResolvedValue({
          total: 5,
          byConversation: [
            { conversationId: 'conv-1', unreadCount: 3 },
            { conversationId: 'conv-2', unreadCount: 2 },
          ],
        } as any);

        const result = await controller.getUnreadCount('user-1');

        expect(result).toHaveProperty('total', 5);
        expect(result.byConversation).toHaveLength(2);
      });
    });

    describe('PUT /chat/messages/:id', () => {
      it('should edit message', async () => {
        const messageId = 'msg-123';
        const userId = 'user-1';
        const body = { content: 'Updated message' };

        jest.spyOn(service, 'editMessage').mockResolvedValue({
          id: messageId,
          content: 'Updated message',
        } as any);

        const result = await controller.editMessage(messageId, body, userId);

        expect(result.content).toBe('Updated message');
      });
    });

    describe('DELETE /chat/messages/:id', () => {
      it('should delete message', async () => {
        const messageId = 'msg-123';
        const userId = 'user-1';

        jest
          .spyOn(service, 'deleteMessage')
          .mockResolvedValue({ message: 'Message deleted successfully' } as any);

        const result = await controller.deleteMessage(messageId, userId);

        expect(result).toHaveProperty('message');
      });
    });

    describe('PUT /chat/conversations/:id/read', () => {
      it('should mark conversation as read', async () => {
        const conversationId = 'conv-123';

        jest
          .spyOn(service, 'markAsRead')
          .mockResolvedValue({ message: 'Messages marked as read' } as any);

        const result = await controller.markConversationAsRead(conversationId, 'user-1');

        expect(result).toHaveProperty('message');
      });
    });
  });

  describe('ChatGateway', () => {
    describe('Socket connection', () => {
      it('should handle user connection', async () => {
        const userId = 'user-1';
        mockJwtService.verify.mockReturnValue({ id: userId });

        const mockClient = {
          handshake: {
            auth: { token: 'Bearer valid-token' },
          },
          id: 'socket-123',
          join: jest.fn(),
          emit: jest.fn(),
          disconnect: jest.fn(),
        } as any;

        await gateway.handleConnection(mockClient);

        expect(mockClient.join).toHaveBeenCalledWith(`user_${userId}`);
      });

      it('should handle user disconnection', async () => {
        const userId = 'user-1';
        mockJwtService.verify.mockReturnValue({ id: userId });

        const mockClient = {
          handshake: {
            auth: { token: 'Bearer valid-token' },
          },
          id: 'socket-123',
          join: jest.fn(),
          emit: jest.fn(),
          disconnect: jest.fn(),
        } as any;

        await gateway.handleConnection(mockClient);
        await gateway.handleDisconnect(mockClient);

        await expect(gateway.isUserOnline(userId)).resolves.toBe(false);
      });
    });

    describe('User online status', () => {
      it('should check if user is online', async () => {
        const userId = 'user-1';
        mockJwtService.verify.mockReturnValue({ id: userId });

        const mockClient = {
          handshake: { auth: { token: 'Bearer valid-token' } },
          id: 'socket-123',
          join: jest.fn(),
          emit: jest.fn(),
          disconnect: jest.fn(),
        } as any;

        await gateway.handleConnection(mockClient);

        await expect(gateway.isUserOnline(userId)).resolves.toBe(true);
      });

      it('should return false for offline user', async () => {
        await expect(gateway.isUserOnline('non-existent-user')).resolves.toBe(false);
      });
    });
  });
});
