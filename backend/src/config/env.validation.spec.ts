import { validateEnvironment } from './env.validation';

type TestEnv = Record<string, string | undefined>;

const baseEnv: TestEnv = {
  DATABASE_URL: 'postgresql://meuagito:secret@localhost:5432/meuagito',
  JWT_SECRET: 'jwt-secret',
  REFRESH_TOKEN_SECRET: 'refresh-secret',
};

function validationError(env: TestEnv): string {
  try {
    validateEnvironment(env);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return '';
}

describe('validateEnvironment', () => {
  it('allows development to run without external AWS providers', () => {
    const env: TestEnv = {
      ...baseEnv,
      NODE_ENV: 'development',
      STORAGE_PROVIDER: 'none',
      EMAIL_PROVIDER: 'none',
      PUSH_PROVIDER: 'none',
    };

    expect(validateEnvironment(env)).toBe(env);
  });

  it('blocks production when AWS-backed providers are disabled', () => {
    const message = validationError({
      ...baseEnv,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.meuagito.com',
      PORT: '3001',
      ENABLE_REDIS: 'true',
      REDIS_URL: 'redis://redis.internal:6379',
      STORAGE_PROVIDER: 'none',
      EMAIL_PROVIDER: 'none',
      PUSH_PROVIDER: 'none',
    });

    expect(message).toContain('STORAGE_PROVIDER=s3 is required in production.');
    expect(message).toContain('EMAIL_PROVIDER=ses is required in production.');
    expect(message).toContain('PUSH_PROVIDER=sns is required in production.');
    expect(message).toContain('SUPPORT_EMAIL is required in production.');
  });

  it('rejects invalid support email when provided', () => {
    const message = validationError({
      ...baseEnv,
      NODE_ENV: 'development',
      SUPPORT_EMAIL: 'not-an-email',
    });

    expect(message).toContain('SUPPORT_EMAIL must be a valid email address.');
  });

  it('requires CloudFront URL and SNS platform application ARN in production', () => {
    const message = validationError({
      ...baseEnv,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.meuagito.com',
      PORT: '3001',
      SUPPORT_EMAIL: 'suporte@meuagito.com',
      ENABLE_REDIS: 'true',
      REDIS_URL: 'redis://redis.internal:6379',
      STORAGE_PROVIDER: 's3',
      S3_BUCKET: 'meuagito-prod-media',
      S3_REGION: 'sa-east-1',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      USE_CLOUDFRONT: 'true',
      EMAIL_PROVIDER: 'ses',
      AWS_SES_REGION: 'sa-east-1',
      AWS_SES_FROM_EMAIL: 'noreply@meuagito.com',
      PUSH_PROVIDER: 'sns',
      AWS_SNS_REGION: 'sa-east-1',
    });

    expect(message).toContain(
      'CLOUDFRONT_BASE_URL (or AWS_CLOUDFRONT_URL) is required when USE_CLOUDFRONT is true or in production.'
    );
    expect(message).toContain(
      'AWS_SNS_PLATFORM_APPLICATION_ARN (or AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID) is required in production when PUSH_PROVIDER=sns.'
    );
  });

  it('allows production when Redis, S3, CloudFront, SES and SNS are configured', () => {
    const env: TestEnv = {
      ...baseEnv,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.meuagito.com',
      PORT: '3001',
      SUPPORT_EMAIL: 'suporte@meuagito.com',
      ENABLE_REDIS: 'true',
      REDIS_URL: 'redis://redis.internal:6379',
      STORAGE_PROVIDER: 's3',
      S3_BUCKET: 'meuagito-prod-media',
      S3_REGION: 'sa-east-1',
      S3_ACCESS_KEY_ID: 'access-key',
      S3_SECRET_ACCESS_KEY: 'secret-key',
      USE_CLOUDFRONT: 'true',
      AWS_CLOUDFRONT_URL: 'https://cdn.meuagito.com',
      EMAIL_PROVIDER: 'ses',
      AWS_SES_REGION: 'sa-east-1',
      AWS_SES_FROM_EMAIL: 'noreply@meuagito.com',
      PUSH_PROVIDER: 'sns',
      AWS_SNS_REGION: 'sa-east-1',
      AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID:
        'arn:aws:sns:sa-east-1:123456789012:app/GCM/meuagito-android',
    };

    expect(validateEnvironment(env)).toBe(env);
  });
});
