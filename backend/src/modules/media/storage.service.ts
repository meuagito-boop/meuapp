import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { dirname, extname, resolve } from 'path';
import { instrumentAwsSdkClient } from '@common/observability/observability.bootstrap';

type StorageProvider = 's3' | 'local';

type UploadStorageInput = {
  folder: string;
  ownerId: string;
  mimeType: string;
  originalName?: string;
  buffer: Buffer;
};

export type UploadStorageResult = {
  provider: 'S3' | 'LOCAL';
  bucket: string;
  storagePath: string;
  publicUrl: string;
};

export type ResolvedStorageFile = {
  mimeType: string;
  absolutePath?: string;
  buffer?: Buffer;
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

@Injectable()
export class StorageService {
  private s3Client: S3Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  async uploadFile(input: UploadStorageInput): Promise<UploadStorageResult> {
    const provider = this.resolveProvider();
    const fileExtension = this.resolveFileExtension(input.mimeType, input.originalName);
    const filename = `${input.ownerId}-${Date.now()}-${randomUUID()}${fileExtension}`;
    const storagePath = `${input.folder}/${filename}`;

    if (provider === 's3') {
      return this.uploadToS3(storagePath, input.mimeType, input.buffer);
    }

    return this.uploadToLocal(storagePath, input.buffer);
  }

  async downloadFile(input: {
    provider: 'S3' | 'LOCAL';
    bucket: string;
    storagePath: string;
    mimeType: string;
  }): Promise<ResolvedStorageFile> {
    if (input.provider === 'LOCAL') {
      return {
        mimeType: input.mimeType,
        absolutePath: this.getLocalAbsolutePath(input.storagePath),
      };
    }

    return this.downloadFromS3(input.bucket, input.storagePath, input.mimeType);
  }

  buildProtectedMediaUrl(mediaId: string): string {
    return `${this.getPublicBaseUrl()}/media/protected/${encodeURIComponent(mediaId)}`;
  }

  getLocalAbsolutePath(storagePath: string): string {
    const localRoot = this.getLocalStorageRoot();
    const normalizedPath = storagePath.replace(/\\/g, '/');
    const absolutePath = resolve(localRoot, normalizedPath);

    if (!absolutePath.startsWith(localRoot)) {
      throw new InternalServerErrorException('Invalid local media path');
    }

    return absolutePath;
  }

  private resolveProvider(): StorageProvider {
    const rawProvider = (this.configService.get<string>('STORAGE_PROVIDER') || 'none')
      .toLowerCase()
      .trim();

    if (rawProvider === 's3') {
      return 's3';
    }

    return 'local';
  }

  private async uploadToS3(
    storagePath: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<UploadStorageResult> {
    const bucket = this.readRequired(['S3_BUCKET', 'AWS_S3_BUCKET']);

    try {
      const client = this.getS3Client();
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: storagePath,
          Body: buffer,
          ContentType: mimeType,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to upload file to S3: ${message}`);
    }

    return {
      provider: 'S3',
      bucket,
      storagePath,
      publicUrl: this.buildS3PublicUrl(bucket, storagePath),
    };
  }

  private async uploadToLocal(storagePath: string, buffer: Buffer): Promise<UploadStorageResult> {
    const absolutePath = this.getLocalAbsolutePath(storagePath);

    await fs.mkdir(dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const [folder, filename] = storagePath.split('/');
    const localUrl = `${this.getPublicBaseUrl()}/media/local/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;

    return {
      provider: 'LOCAL',
      bucket: 'local',
      storagePath,
      publicUrl: localUrl,
    };
  }

  private async downloadFromS3(
    bucket: string,
    storagePath: string,
    fallbackMimeType: string
  ): Promise<ResolvedStorageFile> {
    try {
      const client = this.getS3Client();
      const response = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: storagePath,
        })
      );

      const bytes = await response.Body?.transformToByteArray();
      if (!bytes) {
        throw new Error('Empty S3 object body');
      }

      return {
        mimeType: response.ContentType || fallbackMimeType,
        buffer: Buffer.from(bytes),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to download file from S3: ${message}`);
    }
  }

  private getPublicBaseUrl(): string {
    const configuredBase =
      this.configService.get<string>('BACKEND_PUBLIC_URL') ||
      this.configService.get<string>('PUBLIC_BASE_URL') ||
      this.configService.get<string>('APP_PUBLIC_URL');

    if (configuredBase && configuredBase.trim().length > 0) {
      return configuredBase.replace(/\/+$/, '');
    }

    const port = this.configService.get<string>('PORT') || '3001';
    return `http://localhost:${port}`;
  }

  private getLocalStorageRoot(): string {
    const configured = this.configService.get<string>('LOCAL_STORAGE_ROOT') || 'storage';
    return resolve(process.cwd(), configured);
  }

  private getS3Client(): S3Client {
    if (this.s3Client) {
      return this.s3Client;
    }

    const region = this.readRequired(['S3_REGION', 'AWS_REGION']);
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    const accessKeyId =
      this.configService.get<string>('S3_ACCESS_KEY_ID') ||
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey =
      this.configService.get<string>('S3_SECRET_ACCESS_KEY') ||
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.s3Client = instrumentAwsSdkClient(
      new S3Client({
        region,
        ...(endpoint ? { endpoint } : {}),
        ...(accessKeyId && secretAccessKey
          ? {
              credentials: {
                accessKeyId,
                secretAccessKey,
              },
            }
          : {}),
        forcePathStyle: parseBoolean(
          this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE'),
          false
        ),
      })
    );

    return this.s3Client;
  }

  private buildS3PublicUrl(bucket: string, storagePath: string): string {
    const useCloudFront = parseBoolean(this.configService.get<string>('USE_CLOUDFRONT'), false);
    const cloudFrontBaseUrl =
      this.configService.get<string>('CLOUDFRONT_BASE_URL') ||
      this.configService.get<string>('AWS_CLOUDFRONT_URL');

    if (useCloudFront && cloudFrontBaseUrl) {
      return `${cloudFrontBaseUrl.replace(/\/+$/, '')}/${storagePath}`;
    }

    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    if (endpoint && endpoint.trim().length > 0) {
      return `${endpoint.replace(/\/+$/, '')}/${bucket}/${storagePath}`;
    }

    const region = this.readRequired(['S3_REGION', 'AWS_REGION']);
    return `https://${bucket}.s3.${region}.amazonaws.com/${storagePath}`;
  }

  private readRequired(keys: string[]): string {
    for (const key of keys) {
      const value = this.configService.get<string>(key);
      if (value && value.trim().length > 0) {
        return value.trim();
      }
    }

    throw new InternalServerErrorException(
      `Missing required storage configuration: ${keys.join(' or ')}`
    );
  }

  private resolveFileExtension(mimeType: string, originalName?: string): string {
    const originalExt = originalName ? extname(originalName).toLowerCase() : '';
    if (originalExt) {
      return originalExt;
    }

    const [type, subtype] = (mimeType || '').split('/');
    if (!type || !subtype) {
      return '';
    }

    if (subtype === 'jpeg') {
      return '.jpg';
    }

    const safeSubtype = subtype.replace(/[^a-z0-9.+-]/gi, '');
    return safeSubtype ? `.${safeSubtype}` : '';
  }
}
