import { registerRequestContextAccessor } from '@common/request-context/request-context.service';
import { logStructured } from './structured-log';

describe('logStructured', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    process.env = { ...originalEnv };
    registerRequestContextAccessor(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    registerRequestContextAccessor(() => undefined);
  });

  it('enriches logs with runtime and request context metadata', () => {
    process.env.APP_NAME = 'meu-agito-backend';
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'debug';

    registerRequestContextAccessor(() => ({
      requestId: 'req-123',
      correlationId: 'corr-123',
      traceId: 'Root=1-abc',
      ipAddress: null,
      userAgent: null,
    }));

    logStructured('info', 'test.event', {
      feature: 'observability',
    });

    expect(console.log).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((console.log as jest.Mock).mock.calls[0][0] as string);

    expect(payload).toMatchObject({
      level: 'info',
      event: 'test.event',
      service: 'meu-agito-backend',
      environment: 'test',
      requestId: 'req-123',
      correlationId: 'corr-123',
      traceId: 'Root=1-abc',
      feature: 'observability',
    });
  });

  it('suppresses log entries below the configured threshold', () => {
    process.env.LOG_LEVEL = 'error';

    logStructured('info', 'test.event', {
      feature: 'observability',
    });

    expect(console.log).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });
});
