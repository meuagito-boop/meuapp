import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestContextService } from '@common/request-context/request-context.service';

type RequestWithContext = Request & {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
};

function getHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value.find((entry) => entry.trim().length > 0)?.trim() ?? null;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return null;
}

function resolveIpAddress(req: Request): string | null {
  const forwardedFor = getHeaderValue(req.headers['x-forwarded-for']);
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? null;
  }

  return req.ip || req.socket?.remoteAddress || null;
}

export function createRequestContextMiddleware(requestContextService: RequestContextService) {
  return (req: RequestWithContext, res: Response, next: NextFunction) => {
    const requestId = getHeaderValue(req.headers['x-request-id']) || randomUUID();
    const correlationId = getHeaderValue(req.headers['x-correlation-id']) || requestId;
    const traceId = getHeaderValue(req.headers['x-amzn-trace-id']);

    req.requestId = requestId;
    req.correlationId = correlationId;
    req.traceId = traceId ?? undefined;
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);

    requestContextService.run(
      {
        requestId,
        correlationId,
        traceId,
        ipAddress: resolveIpAddress(req),
        userAgent: getHeaderValue(req.headers['user-agent']),
      },
      next
    );
  };
}
