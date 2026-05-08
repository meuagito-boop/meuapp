import type { AxiosRequestConfig } from 'axios';

import {
  previewActivityHistory,
  previewComments,
  previewConversations,
  previewEstablishments,
  previewEvents,
  previewMessages,
  previewNotifications,
  previewPosts,
  previewProducts,
  previewReviews,
  previewUserAuth,
  previewUserProfile,
} from './previewData';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type PreviewParams = Record<string, unknown>;

const emptyPaginated = <T>(data: T[] = [], page = 1, limit = 20) => ({
  data,
  total: data.length,
  page,
  limit,
  totalPages: data.length > 0 ? 1 : 0,
});

const cursorPaginated = <T>(data: T[], limit = 15) => ({
  data: data.slice(0, limit),
  mode: 'mixed',
  limit,
  hasMore: false,
  nextCursor: null,
});

const normalizePath = (url: string) => {
  const [pathOnly] = url.split('?');
  const normalized = pathOnly.replace(/\/+$/, '');
  return normalized.length > 0 ? normalized : '/';
};

const getParams = (config?: AxiosRequestConfig): PreviewParams => {
  const params = config?.params;
  return params && typeof params === 'object' ? params as PreviewParams : {};
};

const getNumberParam = (
  params: PreviewParams,
  key: string,
  fallback: number,
) => {
  const value = params[key];
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const textMatches = (value: string | undefined, query: unknown) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return String(value || '').toLowerCase().includes(normalizedQuery);
};

const withDistance = <T extends { id: string }>(items: T[]) =>
  items.map((item, index) => ({
    ...item,
    distanceKm: 'distanceKm' in item ? item.distanceKm : Number((1.2 + index * 0.8).toFixed(1)),
    isOpenNow: 'isOpenNow' in item ? item.isOpenNow : index !== 2,
    _count: {
      reviews: 'reviewsCount' in item && typeof item.reviewsCount === 'number' ? item.reviewsCount : 0,
      attendees: 'attendeesCount' in item && typeof item.attendeesCount === 'number' ? item.attendeesCount : 0,
    },
  }));

const findPost = (postId: string) =>
  previewPosts.find((post) => post.id === postId) ?? previewPosts[0];

const findEstablishment = (establishmentId: string) =>
  previewEstablishments.find((item) => item.id === establishmentId) ?? previewEstablishments[0];

const findEvent = (eventId: string) =>
  previewEvents.find((item) => item.id === eventId) ?? previewEvents[0];

const findProduct = (productId: string) =>
  previewProducts.find((item) => item.id === productId) ?? previewProducts[0];

const previewAuthResponse = {
  user: previewUserAuth,
  accessToken: 'preview-access-token',
  refreshToken: 'preview-refresh-token',
  verificationEmailSent: true,
};

export const getPreviewApiResponse = <T>(
  method: HttpMethod,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): T => {
  const path = normalizePath(url);
  const params = getParams(config);
  const page = getNumberParam(params, 'page', 1);
  const limit = getNumberParam(params, 'limit', 20);

  if (path.startsWith('/auth/')) {
    if (path === '/auth/enable-2fa') {
      return {
        secret: 'PREVIEW-2FA-SECRET',
        qrCode: 'otpauth://totp/MeuAgito:preview@meuagito.local?secret=PREVIEW',
      } as T;
    }

    return (method === 'POST' || method === 'PUT'
      ? previewAuthResponse
      : { message: 'Preview auth ok' }) as T;
  }

  if (path === '/users/me' || path === '/users/me/profile') {
    return previewUserProfile as T;
  }

  if (path === '/users/username/availability') {
    return {
      username: String(params.username || 'preview'),
      available: true,
    } as T;
  }

  if (path === '/users') {
    return emptyPaginated([previewUserProfile], page, limit) as T;
  }

  if (/^\/users\/[^/]+\/public-profile$/.test(path) || /^\/users\/[^/]+$/.test(path)) {
    return previewUserProfile as T;
  }

  if (/^\/users\/[^/]+\/followers$/.test(path) || /^\/users\/[^/]+\/following$/.test(path)) {
    return emptyPaginated([previewUserProfile], page, limit) as T;
  }

  if (path === '/feed/agito') {
    return cursorPaginated(previewPosts, getNumberParam(params, 'limit', 15)) as T;
  }

  if (path === '/posts/feed' || path === '/posts/explore' || /^\/posts\/user\/[^/]+$/.test(path)) {
    return emptyPaginated(previewPosts, page, limit) as T;
  }

  if (path === '/posts' && method === 'POST') {
    const body = data && typeof data === 'object' ? data as Record<string, unknown> : {};
    return {
      ...previewPosts[0],
      id: `preview-post-${Date.now()}`,
      content: String(body.content || 'Post criado em modo preview.'),
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: previewUserAuth.id,
        name: previewUserAuth.name,
        username: 'brunopreview',
        profileType: 'USER',
      },
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      repostsCount: 0,
      isLiked: false,
    } as T;
  }

  if (/^\/posts\/[^/]+\/comments$/.test(path)) {
    if (method === 'POST') {
      const body = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      return {
        ...previewComments[0],
        id: `preview-comment-${Date.now()}`,
        content: String(body.content || 'Comentario de preview.'),
        author: {
          id: previewUserAuth.id,
          name: previewUserAuth.name,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T;
    }

    return emptyPaginated(previewComments, page, limit) as T;
  }

  if (/^\/posts\/comments\/[^/]+(\/like)?$/.test(path) || /^\/posts\/[^/]+\/like$/.test(path)) {
    return { message: 'Preview action ok' } as T;
  }

  if (/^\/posts\/[^/]+$/.test(path)) {
    const postId = path.split('/')[2];
    return findPost(postId) as T;
  }

  if (path === '/search/events') {
    const filtered = previewEvents.filter((item) =>
      textMatches(item.name || item.title, params.q) || textMatches(item.description, params.q),
    );
    return emptyPaginated(withDistance(filtered), page, limit) as T;
  }

  if (path === '/search/establishments') {
    const filtered = previewEstablishments.filter((item) =>
      textMatches(item.name, params.q) || textMatches(item.description, params.q),
    );
    return emptyPaginated(withDistance(filtered), page, limit) as T;
  }

  if (path === '/search/posts') {
    const filtered = previewPosts.filter((item) => textMatches(item.content, params.q));
    return emptyPaginated(filtered, page, limit) as T;
  }

  if (path === '/search/users') {
    return emptyPaginated([previewUserProfile], page, limit) as T;
  }

  if (path === '/search/autocomplete') {
    return {
      suggestions: [
        { type: 'event', label: 'Samba no Boteco', value: 'samba' },
        { type: 'establishment', label: 'Boteco Avenida', value: 'boteco avenida' },
        { type: 'category', label: 'Bares abertos agora', value: 'bares' },
      ],
    } as T;
  }

  if (path === '/search/global') {
    return {
      events: previewEvents.slice(0, 2),
      establishments: previewEstablishments.slice(0, 2),
      posts: previewPosts.slice(0, 2),
      users: [previewUserProfile],
    } as T;
  }

  if (path === '/search/trending') {
    return {
      data: ['samba hoje', 'bares abertos', 'feira criativa', 'cafe perto de mim'],
    } as T;
  }

  if (path === '/events') {
    return method === 'POST'
      ? { ...previewEvents[0], id: `preview-event-${Date.now()}` } as T
      : emptyPaginated(withDistance(previewEvents), page, limit) as T;
  }

  if (/^\/events\/[^/]+\/attend$/.test(path)) {
    return { message: 'Presenca atualizada em modo preview.', attendeeCount: 87 } as T;
  }

  if (/^\/events\/[^/]+\/attendees$/.test(path)) {
    return emptyPaginated([
      { id: previewUserAuth.id, name: previewUserAuth.name },
      { id: 'preview-user-ana', name: 'Ana Lima' },
    ], page, limit) as T;
  }

  if (/^\/events\/[^/]+\/reviews$/.test(path)) {
    return method === 'POST' ? previewReviews[0] as T : emptyPaginated(previewReviews, page, limit) as T;
  }

  if (/^\/events\/[^/]+$/.test(path)) {
    return findEvent(path.split('/')[2]) as T;
  }

  if (path === '/establishments') {
    return method === 'POST'
      ? { ...previewEstablishments[0], id: `preview-est-${Date.now()}` } as T
      : emptyPaginated(withDistance(previewEstablishments), page, limit) as T;
  }

  if (path === '/establishments/me/owned') {
    return findEstablishment('preview-est-1') as T;
  }

  if (path === '/establishments/me/favorites') {
    return emptyPaginated([findEstablishment('preview-est-1')], page, limit) as T;
  }

  if (/^\/establishments\/[^/]+\/favorite$/.test(path)) {
    return { message: 'Favorito atualizado em modo preview.', favoriteCount: 1041 } as T;
  }

  if (/^\/establishments\/[^/]+\/reviews$/.test(path)) {
    return method === 'POST' ? previewReviews[0] as T : emptyPaginated(previewReviews, page, limit) as T;
  }

  if (/^\/establishments\/[^/]+\/products$/.test(path)) {
    const establishmentId = path.split('/')[2];
    const products = previewProducts.filter((item) => item.establishmentId === establishmentId);
    if (method === 'POST') {
      const body = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      return {
        ...previewProducts[0],
        id: `preview-product-${Date.now()}`,
        establishmentId,
        name: String(body.name || 'Produto preview'),
      } as T;
    }

    return products as T;
  }

  if (/^\/establishments\/[^/]+\/products\/[^/]+$/.test(path)) {
    return { message: 'Produto atualizado em modo preview.' } as T;
  }

  if (/^\/establishments\/[^/]+$/.test(path)) {
    return findEstablishment(path.split('/')[2]) as T;
  }

  if (/^\/products\/[^/]+$/.test(path)) {
    return findProduct(path.split('/')[2]) as T;
  }

  if (path === '/chat/conversations') {
    if (method === 'POST') {
      return previewConversations[0] as T;
    }

    return emptyPaginated(previewConversations, page, limit) as T;
  }

  if (path === '/chat/conversations/search/query') {
    return previewConversations as T;
  }

  if (path === '/chat/conversations/unread/count') {
    return {
      total: 1,
      byConversation: {
        'preview-conversation-1': 1,
        'preview-conversation-2': 0,
      },
    } as T;
  }

  if (/^\/chat\/conversations\/[^/]+\/messages$/.test(path)) {
    const conversationId = path.split('/')[3];
    if (method === 'POST') {
      const body = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      return {
        id: `preview-message-${Date.now()}`,
        conversationId,
        content: String(body.content || 'Mensagem enviada em preview.'),
        sender: {
          id: previewUserAuth.id,
          name: previewUserAuth.name,
        },
        readBy: [{ id: previewUserAuth.id }],
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T;
    }

    return emptyPaginated(previewMessages[conversationId] || [], page, limit) as T;
  }

  if (/^\/chat\/conversations\/[^/]+\/read$/.test(path)) {
    return { message: 'Conversa marcada como lida em modo preview.' } as T;
  }

  if (/^\/chat\/conversations\/[^/]+$/.test(path)) {
    const conversationId = path.split('/')[3];
    return (previewConversations.find((item) => item.id === conversationId) ?? previewConversations[0]) as T;
  }

  if (/^\/chat\/messages\/[^/]+$/.test(path)) {
    return { message: 'Mensagem atualizada em modo preview.' } as T;
  }

  if (path === '/notifications') {
    return emptyPaginated(previewNotifications, page, limit) as T;
  }

  if (path === '/notifications/unread/count') {
    return { total: previewNotifications.filter((item) => !item.isRead).length } as T;
  }

  if (path === '/notifications/push-tokens') {
    return { data: [] } as T;
  }

  if (path === '/notifications/push-test' || path === '/notifications/read-all') {
    return { updated: previewNotifications.length, message: 'Preview notifications ok' } as T;
  }

  if (/^\/notifications\/[^/]+\/read$/.test(path)) {
    return {
      ...previewNotifications[0],
      isRead: true,
      readAt: new Date().toISOString(),
    } as T;
  }

  if (/^\/notifications\/push-tokens\/[^/]+$/.test(path)) {
    return { message: 'Token removido em modo preview.', id: path.split('/').pop(), isActive: false } as T;
  }

  if (/^\/notifications\/[^/]+$/.test(path)) {
    return { message: 'Notificacao removida em modo preview.' } as T;
  }

  if (path === '/activity/history') {
    return previewActivityHistory as T;
  }

  if (method === 'GET') {
    return emptyPaginated([], page, limit) as T;
  }

  return { message: 'Acao simulada em modo preview.' } as T;
};
