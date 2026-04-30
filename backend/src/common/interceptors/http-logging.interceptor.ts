import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { logStructured } from '@common/logging/structured-log';

type RequestWithContext = Request & {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  user?: {
    id?: string;
  };
};

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithContext>();
    const res = http.getResponse<Response>();

    const startedAt = Date.now();
    const method = req.method;
    const path = req.originalUrl || req.url;
    const requestId = req.requestId || null;
    const correlationId = req.correlationId || requestId;
    const traceId = req.traceId || null;
    const userId = req.user?.id ?? null;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        logStructured('info', 'http.request.completed', {
          requestId,
          correlationId,
          traceId,
          method,
          path,
          statusCode: res.statusCode,
          durationMs,
          userId,
        });
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startedAt;
        const errorMessage = error instanceof Error ? error.message : String(error);

        logStructured('error', 'http.request.failed', {
          requestId,
          correlationId,
          traceId,
          method,
          path,
          statusCode: res.statusCode || 500,
          durationMs,
          userId,
          errorMessage,
        });

        return throwError(() => error);
      })
    );
  }
}
