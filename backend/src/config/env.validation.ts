type RawEnv = Record<string, unknown>;

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on']);
const VALID_NODE_ENVS = new Set(['development', 'test', 'production']);
const VALID_STORAGE_PROVIDERS = new Set(['none', 's3']);
const VALID_PUSH_PROVIDERS = new Set(['none', 'sns']);
const VALID_EMAIL_PROVIDERS = new Set(['none', 'ses']);
const VALID_LOG_LEVELS = new Set(['debug', 'info', 'warn', 'error']);
const VALID_XRAY_CONTEXT_MISSING = new Set(['RUNTIME_ERROR', 'IGNORE_ERROR', 'LOG_ERROR']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBoolean(value: string | undefined, fallback: boolean = false): boolean {
  if (value == null) {
    return fallback;
  }

  return TRUTHY_VALUES.has(value.toLowerCase().trim());
}

function requireWhen(
  condition: boolean,
  env: NodeJS.ProcessEnv,
  key: string,
  errors: string[],
  message?: string
) {
  if (!condition) {
    return;
  }

  const value = env[key];
  if (!value || value.trim().length === 0) {
    errors.push(message ?? `${key} is required.`);
  }
}

function readFirstNonEmpty(env: NodeJS.ProcessEnv, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function requireAnyWhen(
  condition: boolean,
  env: NodeJS.ProcessEnv,
  keys: string[],
  errors: string[],
  message?: string
) {
  if (!condition) {
    return;
  }

  if (!readFirstNonEmpty(env, keys)) {
    errors.push(message ?? `${keys.join(' or ')} is required.`);
  }
}

function validateUrlWhenProvided(value: string | undefined, key: string, errors: string[]) {
  if (!value || value.trim().length === 0) {
    return;
  }

  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    errors.push(`${key} must be a valid URL.`);
  }
}

function validateEmailWhenProvided(value: string | undefined, key: string, errors: string[]) {
  if (!value || value.trim().length === 0) {
    return;
  }

  if (!EMAIL_PATTERN.test(value.trim())) {
    errors.push(`${key} must be a valid email address.`);
  }
}

export function validateEnvironment(rawEnv: RawEnv): RawEnv {
  const env = rawEnv as NodeJS.ProcessEnv;
  const errors: string[] = [];

  const nodeEnv = (env.NODE_ENV || 'development').trim();
  const isProduction = nodeEnv === 'production';
  const logLevel = (env.LOG_LEVEL || 'info').trim().toLowerCase();

  if (!VALID_NODE_ENVS.has(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: development, test, production (received: ${nodeEnv}).`);
  }

  if (!VALID_LOG_LEVELS.has(logLevel)) {
    errors.push(`LOG_LEVEL must be one of: debug, info, warn, error (received: ${logLevel}).`);
  }

  requireWhen(true, env, 'DATABASE_URL', errors);
  requireWhen(true, env, 'JWT_SECRET', errors);
  requireWhen(true, env, 'REFRESH_TOKEN_SECRET', errors);
  requireWhen(isProduction, env, 'CORS_ORIGIN', errors, 'CORS_ORIGIN is required in production.');
  requireWhen(isProduction, env, 'PORT', errors, 'PORT is required in production.');
  requireWhen(
    isProduction,
    env,
    'SUPPORT_EMAIL',
    errors,
    'SUPPORT_EMAIL is required in production.'
  );
  validateEmailWhenProvided(env.SUPPORT_EMAIL, 'SUPPORT_EMAIL', errors);
  if (isProduction && env.CORS_ORIGIN?.trim() === '*') {
    errors.push('CORS_ORIGIN cannot be "*" in production.');
  }

  const redisEnabled = parseBoolean(env.ENABLE_REDIS, false);
  if (isProduction && !redisEnabled) {
    errors.push('ENABLE_REDIS=true is required in production.');
  }
  requireWhen(
    redisEnabled,
    env,
    'REDIS_URL',
    errors,
    'REDIS_URL is required when ENABLE_REDIS is true.'
  );

  const emailExplicitlyEnabled = parseBoolean(env.ENABLE_EMAIL, false);
  const emailProvider = (env.EMAIL_PROVIDER || 'none').toLowerCase().trim();
  if (!VALID_EMAIL_PROVIDERS.has(emailProvider)) {
    errors.push(`EMAIL_PROVIDER must be one of: none, ses (received: ${emailProvider}).`);
  }

  if (isProduction && emailProvider !== 'ses') {
    errors.push('EMAIL_PROVIDER=ses is required in production.');
  }

  const emailEnabled = emailExplicitlyEnabled || emailProvider === 'ses';
  if (emailEnabled && emailProvider !== 'none') {
    requireWhen(
      true,
      env,
      'AWS_SES_REGION',
      errors,
      'AWS_SES_REGION is required when EMAIL_PROVIDER=ses.'
    );
    requireWhen(
      true,
      env,
      'AWS_SES_FROM_EMAIL',
      errors,
      'AWS_SES_FROM_EMAIL is required when EMAIL_PROVIDER=ses.'
    );
  }

  const storageProvider = (env.STORAGE_PROVIDER || 'none').toLowerCase().trim();
  if (!VALID_STORAGE_PROVIDERS.has(storageProvider)) {
    errors.push(`STORAGE_PROVIDER must be one of: none, s3 (received: ${storageProvider}).`);
  }

  if (isProduction && storageProvider !== 's3') {
    errors.push('STORAGE_PROVIDER=s3 is required in production.');
  }

  if (storageProvider === 's3') {
    if (!readFirstNonEmpty(env, ['S3_BUCKET', 'AWS_S3_BUCKET'])) {
      errors.push('S3_BUCKET (or AWS_S3_BUCKET) is required for STORAGE_PROVIDER=s3.');
    }
    if (!readFirstNonEmpty(env, ['S3_REGION', 'AWS_REGION'])) {
      errors.push('S3_REGION (or AWS_REGION) is required for STORAGE_PROVIDER=s3.');
    }
    if (!readFirstNonEmpty(env, ['S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID'])) {
      errors.push('S3_ACCESS_KEY_ID (or AWS_ACCESS_KEY_ID) is required for STORAGE_PROVIDER=s3.');
    }
    if (!readFirstNonEmpty(env, ['S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY'])) {
      errors.push(
        'S3_SECRET_ACCESS_KEY (or AWS_SECRET_ACCESS_KEY) is required for STORAGE_PROVIDER=s3.'
      );
    }

    const useCloudFront = parseBoolean(env.USE_CLOUDFRONT, false);
    const cloudFrontBaseUrl = readFirstNonEmpty(env, ['CLOUDFRONT_BASE_URL', 'AWS_CLOUDFRONT_URL']);
    if (isProduction && !useCloudFront) {
      errors.push('USE_CLOUDFRONT=true is required in production.');
    }
    requireAnyWhen(
      useCloudFront || isProduction,
      env,
      ['CLOUDFRONT_BASE_URL', 'AWS_CLOUDFRONT_URL'],
      errors,
      'CLOUDFRONT_BASE_URL (or AWS_CLOUDFRONT_URL) is required when USE_CLOUDFRONT is true or in production.'
    );
    validateUrlWhenProvided(cloudFrontBaseUrl, 'CLOUDFRONT_BASE_URL', errors);
  }

  const pushProvider = (env.PUSH_PROVIDER || 'none').toLowerCase().trim();
  if (!VALID_PUSH_PROVIDERS.has(pushProvider)) {
    errors.push(`PUSH_PROVIDER must be one of: none, sns (received: ${pushProvider}).`);
  }

  if (isProduction && pushProvider !== 'sns') {
    errors.push('PUSH_PROVIDER=sns is required in production.');
  }

  if (pushProvider === 'sns' && !readFirstNonEmpty(env, ['AWS_SNS_REGION', 'AWS_REGION'])) {
    errors.push('AWS_SNS_REGION (or AWS_REGION) is required when PUSH_PROVIDER=sns.');
  }

  if (pushProvider === 'sns' && isProduction) {
    requireAnyWhen(
      true,
      env,
      ['AWS_SNS_PLATFORM_APPLICATION_ARN', 'AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID'],
      errors,
      'AWS_SNS_PLATFORM_APPLICATION_ARN (or AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID) is required in production when PUSH_PROVIDER=sns.'
    );
  }

  const sentryEnabled = parseBoolean(env.SENTRY_ENABLED, false) || Boolean(env.SENTRY_DSN);
  requireWhen(
    sentryEnabled,
    env,
    'SENTRY_DSN',
    errors,
    'SENTRY_DSN is required when Sentry is enabled.'
  );
  validateUrlWhenProvided(env.SENTRY_DSN, 'SENTRY_DSN', errors);

  const xrayEnabled = parseBoolean(env.AWS_XRAY_ENABLED, false);
  const xrayContextMissing = (env.AWS_XRAY_CONTEXT_MISSING || 'LOG_ERROR').trim().toUpperCase();
  if (!VALID_XRAY_CONTEXT_MISSING.has(xrayContextMissing)) {
    errors.push(
      `AWS_XRAY_CONTEXT_MISSING must be one of: RUNTIME_ERROR, IGNORE_ERROR, LOG_ERROR (received: ${xrayContextMissing}).`
    );
  }

  if (xrayEnabled) {
    requireWhen(
      true,
      env,
      'AWS_XRAY_DAEMON_ADDRESS',
      errors,
      'AWS_XRAY_DAEMON_ADDRESS is required when AWS_XRAY_ENABLED is true.'
    );
  }

  const logRetentionDays = env.AWS_CLOUDWATCH_LOG_RETENTION_DAYS?.trim();
  if (logRetentionDays) {
    const parsedRetention = Number.parseInt(logRetentionDays, 10);
    if (!Number.isFinite(parsedRetention) || parsedRetention <= 0) {
      errors.push('AWS_CLOUDWATCH_LOG_RETENTION_DAYS must be a positive integer when provided.');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }

  return rawEnv;
}
