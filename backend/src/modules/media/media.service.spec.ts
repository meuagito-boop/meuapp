import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MediaEntityType } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { StorageService } from './storage.service';
import { MediaService } from './media.service';

function createImageFile(overrides?: Partial<Express.Multer.File>) {
  return {
    fieldname: 'file',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('image-bytes'),
    stream: null as never,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('MediaService', () => {
  let service: MediaService;
  let prismaService: PrismaService;
  let storageService: StorageService;

  beforeEach(() => {
    prismaService = {
      media: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      conversation: {
        findFirst: jest.fn(),
      },
      post: {
        findUnique: jest.fn(),
      },
      event: {
        findUnique: jest.fn(),
      },
      establishment: {
        findUnique: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    storageService = {
      uploadFile: jest.fn(),
      buildProtectedMediaUrl: jest.fn(
        (mediaId: string) => `http://localhost:3001/media/protected/${mediaId}`
      ),
      getLocalAbsolutePath: jest.fn(),
      downloadFile: jest.fn(),
    } as unknown as StorageService;

    service = new MediaService(prismaService, storageService);
  });

  it('uploads avatar media for the owner account', async () => {
    (storageService.uploadFile as jest.Mock).mockResolvedValue({
      provider: 'LOCAL',
      bucket: 'local',
      storagePath: 'avatars/user-1-avatar.png',
      publicUrl: 'http://localhost:3001/media/local/avatars/user-1-avatar.png',
    });

    (prismaService.media.create as jest.Mock).mockResolvedValue({
      id: 'media-1',
      entityType: MediaEntityType.AVATAR,
      publicUrl: 'http://localhost:3001/media/local/avatars/user-1-avatar.png',
    });

    const result = await service.uploadAvatar('user-1', createImageFile());

    expect(storageService.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'avatars',
        ownerId: 'user-1',
        mimeType: 'image/png',
      })
    );
    expect(result).toEqual({
      id: 'media-1',
      entityType: MediaEntityType.AVATAR,
      publicUrl: 'http://localhost:3001/media/local/avatars/user-1-avatar.png',
    });
  });

  it('rejects invalid avatar mime types', async () => {
    await expect(
      service.uploadAvatar(
        'user-1',
        createImageFile({
          mimetype: 'application/pdf',
          originalname: 'avatar.pdf',
        })
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('returns protected media URL for private chat attachments', async () => {
    (prismaService.conversation.findFirst as jest.Mock).mockResolvedValue({
      id: 'conversation-1',
    });

    (storageService.uploadFile as jest.Mock).mockResolvedValue({
      provider: 'S3',
      bucket: 'bucket',
      storagePath: 'chat-attachments/file-1.png',
      publicUrl: 'https://bucket.s3.sa-east-1.amazonaws.com/chat-attachments/file-1.png',
    });

    (prismaService.media.create as jest.Mock).mockResolvedValue({
      id: 'media-chat-1',
      entityType: MediaEntityType.CHAT_ATTACHMENT,
      publicUrl: 'https://bucket.s3.sa-east-1.amazonaws.com/chat-attachments/file-1.png',
    });

    const result = await service.uploadChatAttachment(
      'user-1',
      'conversation-1',
      createImageFile()
    );

    expect(storageService.buildProtectedMediaUrl).toHaveBeenCalledWith('media-chat-1');
    expect(result).toEqual({
      id: 'media-chat-1',
      entityType: MediaEntityType.CHAT_ATTACHMENT,
      publicUrl: 'http://localhost:3001/media/protected/media-chat-1',
    });
  });

  it('blocks chat attachment upload when the user is not in the conversation', async () => {
    (prismaService.conversation.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.uploadChatAttachment('user-1', 'conversation-1', createImageFile())
    ).rejects.toThrow(ForbiddenException);
  });
});
