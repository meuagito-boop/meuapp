import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';
import { logStructured } from '@common/logging/structured-log';
import { RequestContextService } from '@common/request-context/request-context.service';

type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | { [key: string]: AuditJsonValue };

interface AuditLogInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  changes?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordconfirm',
  'currentpassword',
  'newpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'twofactorsecret',
  'authorization',
]);

@Injectable()
export class AuditLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContextService: RequestContextService
  ) {}

  async record(input: AuditLogInput): Promise<void> {
    const sanitizedChanges = this.sanitizeValue(input.changes);
    const requestContext = this.requestContextService.get();

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          changes:
            sanitizedChanges === undefined
              ? undefined
              : sanitizedChanges === null
                ? Prisma.JsonNull
                : sanitizedChanges,
          ipAddress: input.ipAddress ?? requestContext?.ipAddress ?? null,
          userAgent: input.userAgent ?? requestContext?.userAgent ?? null,
        },
      });
    } catch (error) {
      logStructured('warn', 'audit_log.write_failed', {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        userId: input.userId ?? null,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private sanitizeValue(value: unknown): AuditJsonValue | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item) ?? null);
    }

    if (typeof value === 'object') {
      const output: Record<string, AuditJsonValue> = {};
      for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
        const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (SENSITIVE_KEYS.has(normalizedKey)) {
          output[key] = '[REDACTED]';
          continue;
        }

        const sanitized = this.sanitizeValue(raw);
        if (sanitized !== undefined) {
          output[key] = sanitized;
        }
      }
      return output;
    }

    return String(value);
  }
}
