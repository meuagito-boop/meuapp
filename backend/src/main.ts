import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { HttpLoggingInterceptor } from '@common/interceptors/http-logging.interceptor';
import { createRequestContextMiddleware } from '@common/middleware/request-id.middleware';
import {
  getXRayCloseSegmentMiddleware,
  getXRayOpenSegmentMiddleware,
  initializeObservability,
} from '@common/observability/observability.bootstrap';
import { logStructured } from '@common/logging/structured-log';
import { RedisIoAdapter } from '@common/realtime/redis-io.adapter';
import { RequestContextService } from '@common/request-context/request-context.service';

function parseOrigins(rawOrigins: string | undefined): string[] {
  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function applyTrustProxy(app: Awaited<ReturnType<typeof NestFactory.create>>) {
  const httpServer = app.getHttpAdapter().getInstance() as {
    set?: (key: string, value: unknown) => void;
  };
  const setTrustProxy = (value: unknown) => {
    httpServer.set?.('trust proxy', value);
  };

  const trustProxyValue = process.env.TRUST_PROXY;
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!trustProxyValue || trustProxyValue.trim().length === 0) {
    if (nodeEnv === 'production') {
      setTrustProxy(1);
    }
    return;
  }

  if (trustProxyValue === 'true') {
    setTrustProxy(1);
    return;
  }

  if (trustProxyValue === 'false') {
    setTrustProxy(false);
    return;
  }

  const numericValue = Number.parseInt(trustProxyValue, 10);
  setTrustProxy(Number.isNaN(numericValue) ? trustProxyValue : numericValue);
}

async function bootstrap() {
  await initializeObservability();

  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  const requestContextService = app.get(RequestContextService);
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOrigins = parseOrigins(process.env.CORS_ORIGIN);

  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Security
  app.use(helmet());
  app.use(createRequestContextMiddleware(requestContextService));
  applyTrustProxy(app);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (nodeEnv !== 'production' && corsOrigins.length === 0) {
        callback(null, true);
        return;
      }

      if (corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  const xrayOpenSegmentMiddleware = getXRayOpenSegmentMiddleware();
  if (xrayOpenSegmentMiddleware) {
    app.use(xrayOpenSegmentMiddleware);
  }

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Meu Agito API')
    .setDescription('Backend para aplicativo de descoberta de locais e eventos')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerEnabled = nodeEnv !== 'production' || process.env.ENABLE_SWAGGER === 'true';
  if (swaggerEnabled) {
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  await app.init();

  const xrayCloseSegmentMiddleware = getXRayCloseSegmentMiddleware();
  if (xrayCloseSegmentMiddleware) {
    app.use(xrayCloseSegmentMiddleware);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  shutdownSignals.forEach((signal) => {
    process.once(signal, () => {
      void redisIoAdapter.close();
    });
  });

  logStructured('info', 'app.started', {
    environment: nodeEnv,
    port,
    swaggerEnabled,
    xrayEnabled: Boolean(xrayOpenSegmentMiddleware),
    cloudWatchLogGroup: process.env.AWS_CLOUDWATCH_LOG_GROUP?.trim() || null,
  });
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logStructured('error', 'app.bootstrap.failed', { message });
  process.exit(1);
});
