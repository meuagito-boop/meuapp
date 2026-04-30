import { MediaEntityType } from '@prisma/client';

export const MEDIA_PREFIX_BY_ENTITY: Record<MediaEntityType, string> = {
  [MediaEntityType.AVATAR]: 'avatars',
  [MediaEntityType.POST]: 'post-media',
  [MediaEntityType.CHAT_ATTACHMENT]: 'chat-attachments',
  [MediaEntityType.ESTABLISHMENT]: 'establishment-media',
  [MediaEntityType.EVENT]: 'event-media',
  [MediaEntityType.PRODUCT]: 'product-media',
};

export const MEDIA_ALLOWED_MIME_PREFIXES: Record<MediaEntityType, string[]> = {
  [MediaEntityType.AVATAR]: ['image/'],
  [MediaEntityType.POST]: ['image/'],
  [MediaEntityType.ESTABLISHMENT]: ['image/'],
  [MediaEntityType.EVENT]: ['image/'],
  [MediaEntityType.PRODUCT]: ['image/'],
  [MediaEntityType.CHAT_ATTACHMENT]: ['image/', 'video/', 'application/pdf'],
};

export const MEDIA_MAX_SIZE_BYTES: Record<MediaEntityType, number> = {
  [MediaEntityType.AVATAR]: 2 * 1024 * 1024,
  [MediaEntityType.POST]: 10 * 1024 * 1024,
  [MediaEntityType.ESTABLISHMENT]: 10 * 1024 * 1024,
  [MediaEntityType.EVENT]: 10 * 1024 * 1024,
  [MediaEntityType.PRODUCT]: 10 * 1024 * 1024,
  [MediaEntityType.CHAT_ATTACHMENT]: 20 * 1024 * 1024,
};

export const PRIVATE_MEDIA_ENTITY_TYPES = new Set<MediaEntityType>([
  MediaEntityType.CHAT_ATTACHMENT,
]);

export const MEDIA_ENTITY_ALIASES: Record<string, MediaEntityType> = {
  avatar: MediaEntityType.AVATAR,
  avatars: MediaEntityType.AVATAR,
  post: MediaEntityType.POST,
  posts: MediaEntityType.POST,
  'post-media': MediaEntityType.POST,
  chat: MediaEntityType.CHAT_ATTACHMENT,
  'chat-attachment': MediaEntityType.CHAT_ATTACHMENT,
  'chat-attachments': MediaEntityType.CHAT_ATTACHMENT,
  establishment: MediaEntityType.ESTABLISHMENT,
  establishments: MediaEntityType.ESTABLISHMENT,
  'establishment-media': MediaEntityType.ESTABLISHMENT,
  event: MediaEntityType.EVENT,
  events: MediaEntityType.EVENT,
  'event-media': MediaEntityType.EVENT,
  product: MediaEntityType.PRODUCT,
  products: MediaEntityType.PRODUCT,
  'product-media': MediaEntityType.PRODUCT,
};
