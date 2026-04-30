import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logStructured } from '@common/logging/structured-log';

type RequestWithContext = Request & {
  requestId?: string;
  correlationId?: string;
};

type ErrorResponseShape = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string | null;
  correlationId: string | null;
  method: string;
  path: string;
  timestamp: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<RequestWithContext>();
    const res = ctx.getResponse<Response>();

    const statusCode = this.resolveStatusCode(exception);
    const requestId = req.requestId || null;
    const correlationId = req.correlationId || requestId;
    const path = req.originalUrl || req.url;
    const method = req.method;
    const timestamp = new Date().toISOString();

    const { code, message, details } = this.resolveErrorPayload(exception, statusCode);

    const responseBody: ErrorResponseShape = {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      requestId,
      correlationId,
      method,
      path,
      timestamp,
    };

    const isServerError = statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;
    logStructured(isServerError ? 'error' : 'warn', 'http.exception', {
      requestId,
      correlationId,
      method,
      path,
      statusCode,
      code,
      message,
    });

    res.status(statusCode).json(responseBody);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveErrorPayload(exception: unknown, statusCode: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          code: this.codeFromStatus(statusCode),
          message: response,
          details: undefined,
        };
      }

      if (response && typeof response === 'object') {
        const objectResponse = response as {
          message?: string | string[];
          error?: string;
          details?: unknown;
        };

        const message = Array.isArray(objectResponse.message)
          ? objectResponse.message.join('; ')
          : objectResponse.message || exception.message;

        return {
          code: this.normalizeCode(objectResponse.error) || this.codeFromStatus(statusCode),
          message,
          details: Array.isArray(objectResponse.message)
            ? objectResponse.message
            : objectResponse.details,
        };
      }
    }

    const fallbackMessage =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: fallbackMessage,
      details: undefined,
    };
  }

  private normalizeCode(value?: string): string | null {
    if (!value) {
      return null;
    }

    return value
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }

  private codeFromStatus(statusCode: number): string {
    const statusLabel = HttpStatus[statusCode];
    if (!statusLabel) {
      return 'HTTP_ERROR';
    }

    return this.normalizeCode(statusLabel) || 'HTTP_ERROR';
  }
}
