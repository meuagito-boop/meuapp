import { SetMetadata } from '@nestjs/common';

export type ResourceType = 'user' | 'event' | 'establishment' | 'post' | 'comment' | 'message';

export interface ResourceAuthorizationMetadata {
  resource: ResourceType;
  param: string;
  message?: string;
}

export const RESOURCE_AUTHORIZATION_KEY = 'auth:resource-owner';

export const AuthorizeResourceOwner = (metadata: ResourceAuthorizationMetadata) =>
  SetMetadata(RESOURCE_AUTHORIZATION_KEY, metadata);

export const AuthorizeUserSelf = (param = 'id', message?: string) =>
  AuthorizeResourceOwner({
    resource: 'user',
    param,
    message,
  });
