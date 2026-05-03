import { getCurrentRequestContext } from '@common/request-context/request-context.service';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirm',
  'currentpassword',
  'newpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'setcookie',
  'secret',
  'clientsecret',
  'jwtsecret',
  'refreshtokensecret',
  'twofactorsecret',
  'apikey',
  'apiKey',
  'privatekey',
  's3secretaccesskey',
  'awssecretaccesskey',
]);
const BEARER_TOKEN_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const KEY_VALUE_SECRET_PATTERN =
  /\b(password|passwordConfirm|currentPassword|newPassword|token|accessToken|refreshToken|authorization|secret|apiKey|clientSecret)=([^&\s]+)/gi;

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

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function redactSensitiveText(value: string): string {
  return value
    .replace(BEARER_TOKEN_PATTERN, `Bearer ${REDACTED_VALUE}`)
    .replace(KEY_VALUE_SECRET_PATTERN, (_match, key: string) => `${key}=${REDACTED_VALUE}`);
}

function sanitizeLogValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return redactSensitiveText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);
    const output: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(normalizeKey(key))) {
        output[key] = REDACTED_VALUE;
        continue;
      }

      output[key] = sanitizeLogValue(raw, seen);
    }
    seen.delete(value);
    return output;
  }

  return String(value);
}

function sanitizeLogContext(context: Record<string, unknown>): Record<string, unknown> {
  return sanitizeLogValue(context, new WeakSet<object>()) as Record<string, unknown>;
}

export function logStructured(level: LogLevel, event: string, context: Record<string, unknown>) {
  if (!shouldEmit(level)) {
    return;
  }

  const requestContext = getCurrentRequestContext();
  const sanitizedContext = sanitizeLogContext(context);
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
    ...sanitizedContext,
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
