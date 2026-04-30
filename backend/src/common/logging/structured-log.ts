import { getCurrentRequestContext } from '@common/request-context/request-context.service';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveConfiguredLogLevel(): LogLevel {
  const rawLevel = (process.env.LOG_LEVEL || 'info').trim().toLowerCase();
  if (rawLevel === 'debug' || rawLevel === 'info' || rawLevel === 'warn' || rawLevel === 'error') {
    return rawLevel;
  }

  return 'info';
}

function shouldEmit(level: LogLevel) {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[resolveConfiguredLogLevel()];
}

export function logStructured(level: LogLevel, event: string, context: Record<string, unknown>) {
  if (!shouldEmit(level)) {
    return;
  }

  const requestContext = getCurrentRequestContext();
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: (process.env.APP_NAME || 'meu-agito-backend').trim(),
    environment: process.env.NODE_ENV || 'development',
    ...(requestContext
      ? {
          requestId: requestContext.requestId,
          correlationId: requestContext.correlationId,
          ...(requestContext.traceId ? { traceId: requestContext.traceId } : {}),
        }
      : {}),
    ...context,
  };

  const serialized = JSON.stringify(payload);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  if (level === 'debug') {
    console.debug(serialized);
    return;
  }

  console.log(serialized);
}
