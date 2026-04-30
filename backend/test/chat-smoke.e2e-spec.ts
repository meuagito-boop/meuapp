import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { assertTestDatabaseConnection, resetDatabase } from './setup';

type AuthResponse = {
  id: string;
  accessToken: string;
  refreshToken: string;
};

type MessageReceivedPayload = {
  conversationId: string;
  message: {
    id: string;
    content: string;
    sender: { id: string };
  };
};

const SOCKET_TIMEOUT_MS = 8000;
const TEST_TIMEOUT_MS = 30000;

function waitForSocketEvent<T>(
  socket: Socket,
  eventName: string,
  timeoutMs = SOCKET_TIMEOUT_MS
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timeout aguardando evento ${eventName}`));
    }, timeoutMs);

    const handler = (payload: T) => {
      clearTimeout(timeout);
      socket.off(eventName, handler);
      resolve(payload);
    };

    socket.on(eventName, handler);
  });
}

function connectSocket(baseUrl: string, token: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(`${baseUrl}/chat`, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket'],
      reconnection: false,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Timeout de conexao do socket'));
    }, SOCKET_TIMEOUT_MS);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

describe('Chat Smoke (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  let socketA: Socket | null = null;
  let socketB: Socket | null = null;

  beforeAll(async () => {
    await assertTestDatabaseConnection();
    await resetDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);

    const address = app.getHttpServer().address();
    const port = typeof address === 'string' ? 3002 : address.port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    socketA?.disconnect();
    socketB?.disconnect();

    if (app) {
      await app.close();
    }
  });

  it(
    'deve validar join/leave, typing, read receipt e reconexao com 2 contas',
    async () => {
      const userASuffix = Date.now();
      const userBSuffix = Date.now() + 1;

      const userAResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `chat.smoke.a.${userASuffix}@meuagito.dev`,
          name: 'Chat Smoke A',
          firstName: 'Chat',
          lastName: 'SmokeA',
          birthDate: '1995-01-15',
          password: 'SmokePass#123',
          passwordConfirm: 'SmokePass#123',
        })
        .expect(201);

      const userBResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `chat.smoke.b.${userBSuffix}@meuagito.dev`,
          name: 'Chat Smoke B',
          firstName: 'Chat',
          lastName: 'SmokeB',
          birthDate: '1994-06-20',
          password: 'SmokePass#123',
          passwordConfirm: 'SmokePass#123',
        })
        .expect(201);

      const userA = userAResponse.body as AuthResponse;
      const userB = userBResponse.body as AuthResponse;

      expect(userA.accessToken).toBeDefined();
      expect(userB.accessToken).toBeDefined();

      const conversationResponse = await request(app.getHttpServer())
        .post('/chat/conversations')
        .set('Authorization', `Bearer ${userA.accessToken}`)
        .send({ recipientId: userB.id })
        .expect(201);

      const conversationId: string = conversationResponse.body.id;
      expect(conversationId).toBeDefined();

      socketA = await connectSocket(baseUrl, userA.accessToken);
      socketB = await connectSocket(baseUrl, userB.accessToken);

      const joinA = waitForSocketEvent<{ conversationId: string }>(socketA, 'conversation:joined');
      socketA.emit('conversation:join', { conversationId });
      await expect(joinA).resolves.toEqual(expect.objectContaining({ conversationId }));

      const joinB = waitForSocketEvent<{ conversationId: string }>(socketB, 'conversation:joined');
      socketB.emit('conversation:join', { conversationId });
      await expect(joinB).resolves.toEqual(expect.objectContaining({ conversationId }));

      const typingEventForB = waitForSocketEvent<{
        conversationId: string;
        userId: string;
        isTyping: boolean;
      }>(socketB, 'typing:user');

      socketA.emit('typing:start', { conversationId });

      await expect(typingEventForB).resolves.toEqual(
        expect.objectContaining({
          conversationId,
          userId: userA.id,
          isTyping: true,
        })
      );

      const messageForB = waitForSocketEvent<MessageReceivedPayload>(socketB, 'message:received');

      socketA.emit('message:send', {
        conversationId,
        content: 'smoke-message-1',
      });

      const receivedMessage = await messageForB;
      expect(receivedMessage.conversationId).toBe(conversationId);
      expect(receivedMessage.message.content).toBe('smoke-message-1');

      const markedReadForA = waitForSocketEvent<{
        conversationId: string;
        userId: string;
        readAt: string;
      }>(socketA, 'message:marked_read');

      socketB.emit('message:read', { conversationId });

      await expect(markedReadForA).resolves.toEqual(
        expect.objectContaining({
          conversationId,
          userId: userB.id,
        })
      );

      const leaveB = waitForSocketEvent<{ conversationId: string }>(socketB, 'conversation:left');
      socketB.emit('conversation:leave', { conversationId });
      await expect(leaveB).resolves.toEqual(expect.objectContaining({ conversationId }));

      socketB.disconnect();
      socketB = await connectSocket(baseUrl, userB.accessToken);

      const rejoinB = waitForSocketEvent<{ conversationId: string }>(
        socketB,
        'conversation:joined'
      );
      socketB.emit('conversation:join', { conversationId });
      await expect(rejoinB).resolves.toEqual(expect.objectContaining({ conversationId }));

      const messageAfterReconnect = waitForSocketEvent<MessageReceivedPayload>(
        socketB,
        'message:received'
      );

      socketA.emit('message:send', {
        conversationId,
        content: 'smoke-message-2',
      });

      await expect(messageAfterReconnect).resolves.toEqual(
        expect.objectContaining({
          conversationId,
          message: expect.objectContaining({ content: 'smoke-message-2' }),
        })
      );
    },
    TEST_TIMEOUT_MS
  );
});
