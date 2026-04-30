import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { assertTestDatabaseConnection } from './setup';

jest.setTimeout(30000);

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await assertTestDatabaseConnection();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        timestamp: expect.any(String),
      })
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
