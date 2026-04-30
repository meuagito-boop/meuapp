import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export type RequestContextData = {
  requestId: string;
  correlationId: string;
  traceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
};

let requestContextAccessor: (() => RequestContextData | undefined) | null = null;

export function registerRequestContextAccessor(accessor: () => RequestContextData | undefined) {
  requestContextAccessor = accessor;
}

export function getCurrentRequestContext() {
  return requestContextAccessor?.();
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContextData>();

  constructor() {
    registerRequestContextAccessor(() => this.get());
  }

  run<T>(context: RequestContextData, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): RequestContextData | undefined {
    return this.storage.getStore();
  }
}
