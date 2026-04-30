import * as http from 'http';
import * as https from 'https';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { logStructured } from '@common/logging/structured-log';

type AwsSdkV3Client = {
  middlewareStack: {
    remove: unknown;
    use: unknown;
  };
  config: unknown;
};

type XRayContextMissingStrategy = 'RUNTIME_ERROR' | 'IGNORE_ERROR' | 'LOG_ERROR';

let captureAwsSdkV3Client: (<T extends AwsSdkV3Client>(client: T) => T) | null = null;
let xrayOpenSegmentMiddleware: RequestHandler | null = null;
let xrayCloseSegmentMiddleware: ErrorRequestHandler | null = null;

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function resolveServiceName() {
  const explicitName = process.env.AWS_XRAY_SERVICE_NAME?.trim();
  if (explicitName) {
    return explicitName;
  }

  const appName = process.env.APP_NAME?.trim();
  if (appName) {
    return appName;
  }

  return 'meu-agito-backend';
}

function resolveContextMissingStrategy(): XRayContextMissingStrategy {
  const rawValue = (process.env.AWS_XRAY_CONTEXT_MISSING || 'LOG_ERROR').trim().toUpperCase();
  if (rawValue === 'RUNTIME_ERROR' || rawValue === 'IGNORE_ERROR' || rawValue === 'LOG_ERROR') {
    return rawValue;
  }

  return 'LOG_ERROR';
}

function buildXRayLogger() {
  return {
    error: (message: string, meta?: unknown) =>
      logStructured('error', 'observability.xray.sdk', { message, meta: meta ?? null }),
    warn: (message: string, meta?: unknown) =>
      logStructured('warn', 'observability.xray.sdk', { message, meta: meta ?? null }),
    info: (message: string, meta?: unknown) =>
      logStructured('info', 'observability.xray.sdk', { message, meta: meta ?? null }),
    debug: (message: string, meta?: unknown) =>
      logStructured('debug', 'observability.xray.sdk', { message, meta: meta ?? null }),
  };
}

async function initializeXRay() {
  if (!parseBoolean(process.env.AWS_XRAY_ENABLED, false)) {
    return false;
  }

  try {
    const xray = await import('aws-xray-sdk-core');
    const xrayExpress = await import('aws-xray-sdk-express');
    const serviceName = resolveServiceName();
    const contextMissingStrategy = resolveContextMissingStrategy();

    xray.setLogger(buildXRayLogger());
    xray.setContextMissingStrategy(contextMissingStrategy);
    xray.captureHTTPsGlobal(http);
    xray.captureHTTPsGlobal(https);
    xray.config([xray.plugins.ECSPlugin]);

    captureAwsSdkV3Client = <T extends AwsSdkV3Client>(client: T) =>
      xray.captureAWSv3Client(client);
    xrayOpenSegmentMiddleware = xrayExpress.openSegment(serviceName);
    xrayCloseSegmentMiddleware = xrayExpress.closeSegment();

    logStructured('info', 'observability.xray.initialized', {
      serviceName,
      contextMissingStrategy,
      daemonAddress: process.env.AWS_XRAY_DAEMON_ADDRESS?.trim() || '127.0.0.1:2000',
    });

    return true;
  } catch (error) {
    logStructured('warn', 'observability.xray.skipped', {
      reason: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function initializeSentry() {
  const sentryEnabled =
    parseBoolean(process.env.SENTRY_ENABLED, false) || Boolean(process.env.SENTRY_DSN?.trim());
  const dsn = process.env.SENTRY_DSN?.trim();

  if (!sentryEnabled) {
    return false;
  }

  if (!dsn) {
    logStructured('warn', 'observability.sentry.skipped', {
      reason: 'SENTRY_DSN missing',
    });
    return false;
  }

  try {
    const sentryModule = '@sentry/node';
    const sentry = await import(sentryModule);
    const tracesSampleRate = Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0');

    sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
    });

    logStructured('info', 'observability.sentry.initialized', {
      tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
    });

    return true;
  } catch (error) {
    logStructured('warn', 'observability.sentry.skipped', {
      reason: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function initializeObservability() {
  const [xrayEnabled, sentryEnabled] = await Promise.all([initializeXRay(), initializeSentry()]);

  logStructured('info', 'observability.runtime.initialized', {
    xrayEnabled,
    sentryEnabled,
    cloudWatchLogGroup: process.env.AWS_CLOUDWATCH_LOG_GROUP?.trim() || null,
    cloudWatchNamespace: process.env.AWS_CLOUDWATCH_NAMESPACE?.trim() || null,
    logRetentionDays: process.env.AWS_CLOUDWATCH_LOG_RETENTION_DAYS?.trim() || null,
  });
}

export function getXRayOpenSegmentMiddleware() {
  return xrayOpenSegmentMiddleware;
}

export function getXRayCloseSegmentMiddleware() {
  return xrayCloseSegmentMiddleware;
}

export function instrumentAwsSdkClient<T extends AwsSdkV3Client>(client: T): T {
  if (!captureAwsSdkV3Client) {
    return client;
  }

  try {
    return captureAwsSdkV3Client(client);
  } catch (error) {
    logStructured('warn', 'observability.xray.client_instrumentation_failed', {
      reason: error instanceof Error ? error.message : String(error),
    });
    return client;
  }
}
