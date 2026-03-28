# 🔙 REFERÊNCIA DE API BACKEND

## Endpoints Disponíveis

### 1. AUTH ENDPOINTS (11 endpoints)

```
POST /auth/signup
- Body: { email, name, password }
- Response: { user: User, accessToken, refreshToken }
- 2FA: Habilitado via authenticator

POST /auth/login
- Body: { email, password }
- Response: { user: User, accessToken, refreshToken, require2FA? }

POST /auth/login/2fa
- Body: { email, code }
- Response: { user: User, accessToken, refreshToken }

POST /auth/refresh
- Body: { refreshToken }
- Response: { accessToken }

POST /auth/logout
- Headers: Authorization: Bearer <token>
- Response: { message: "Logged out" }

POST /auth/2fa/setup
- Headers: Authorization: Bearer <token>
- Response: { secret, qrCode }

POST /auth/2fa/verify
- Body: { code, secret }
- Headers: Authorization: Bearer <token>
- Response: { message: "2FA enabled" }

POST /auth/password/request
- Body: { email }
- Response: { message: "Email enviado" }

POST /auth/password/reset
- Body: { token, newPassword }
- Response: { message: "Password reset" }

POST /auth/password/change
- Body: { currentPassword, newPassword }
- Headers: Authorization: Bearer <token>
- Response: { message: "Password changed" }

GET /auth/me
- Headers: Authorization: Bearer <token>
- Response: { user: User }
```

### 2. USERS ENDPOINTS (14 endpoints)

```
GET /users/me
- Headers: Authorization: Bearer <token>
- Response: { id, email, name, bio, avatar, location, website, followersCount, followingCount, postsCount, createdAt }

GET /users/:id
- Headers: Authorization: Bearer <token>
- Response: { user profile }

PUT /users/me
- Body: { name?, bio?, location?, website? }
- Headers: Authorization: Bearer <token>
- Response: { updated user }

POST /users/me/avatar
- Body: FormData { file }
- Headers: Authorization: Bearer <token>
- Response: { user with new avatar }

POST /users/:id/follow
- Headers: Authorization: Bearer <token>
- Response: { message: "Following" }

DELETE /users/:id/follow
- Headers: Authorization: Bearer <token>
- Response: { message: "Unfollowed" }

GET /users/:id/followers
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [User], total, page, limit, totalPages }

GET /users/:id/following
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [User], total, page, limit, totalPages }

GET /users/search?q=
- Query: q=query&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [User], total, page, limit, totalPages }

DELETE /users/me
- Headers: Authorization: Bearer <token>
- Response: { message: "Account deleted" }
```

### 3. FEED ENDPOINTS (18 endpoints)

```
POST /posts
- Body: { content, images?: [], video?: string }
- Headers: Authorization: Bearer <token>
- Response: { post: Post }

GET /feed
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Post], total, page, limit, totalPages }
- Nota: Feed personalizado com ranking

GET /explore
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Post], total, page, limit, totalPages }
- Nota: Feed público

GET /posts/:id
- Headers: Authorization: Bearer <token>
- Response: { post: Post }

PUT /posts/:id
- Body: { content?, images?, video? }
- Headers: Authorization: Bearer <token>
- Response: { updated post }

DELETE /posts/:id
- Headers: Authorization: Bearer <token>
- Response: { message: "Post deleted" }

POST /posts/:id/like
- Headers: Authorization: Bearer <token>
- Response: { message: "Liked" }

DELETE /posts/:id/like
- Headers: Authorization: Bearer <token>
- Response: { message: "Unliked" }

GET /posts/:id/comments
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Comment], total, page, limit, totalPages }

POST /posts/:id/comments
- Body: { content }
- Headers: Authorization: Bearer <token>
- Response: { comment: Comment }

POST /comments/:id/like
- Headers: Authorization: Bearer <token>
- Response: { message: "Liked" }

DELETE /comments/:id/like
- Headers: Authorization: Bearer <token>
- Response: { message: "Unliked" }

DELETE /comments/:id
- Headers: Authorization: Bearer <token>
- Response: { message: "Comment deleted" }

GET /users/:id/posts
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Post], total, page, limit, totalPages }
```

### 4. SEARCH ENDPOINTS (7 endpoints)

```
GET /search/global?q=
- Query: q=query&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { users: [User], posts: [Post], events: [Event], establishments: [Establishment] }

GET /search/users?q=
- Query: q=query&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [User], total, page, limit, totalPages }

GET /search/posts?q=
- Query: q=query&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Post], total, page, limit, totalPages }

GET /search/events?q=
- Query: q=query&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Event], total, page, limit, totalPages }

GET /search/establishments?q=
- Query: q=query&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Establishment], total, page, limit, totalPages }

GET /search/trending
- Headers: Authorization: Bearer <token>
- Response: { trends: [{ hashtag, count }] }

GET /search/suggestions?q=
- Query: q=query (min 2 chars)
- Headers: Authorization: Bearer <token>
- Response: { suggestions: [string] }
```

### 5. EVENTS ENDPOINTS (10 endpoints)

```
POST /events
- Body: { title, description, latitude, longitude, address, startDate, endDate, category, image? }
- Headers: Authorization: Bearer <token>
- Response: { event: Event }

GET /events/nearby
- Query: latitude=X&longitude=Y&distance=50&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Event], total, page, limit, totalPages }
- Nota: distance em km, usa PostGIS

GET /events/:id
- Headers: Authorization: Bearer <token>
- Response: { event: Event }

PUT /events/:id
- Body: { title?, description?, latitude?, longitude?, address?, startDate?, endDate?, category?, image? }
- Headers: Authorization: Bearer <token>
- Response: { updated event }

DELETE /events/:id
- Headers: Authorization: Bearer <token>
- Response: { message: "Event deleted" }

POST /events/:id/attend
- Headers: Authorization: Bearer <token>
- Response: { message: "Attending", attendeeCount }

DELETE /events/:id/attend
- Headers: Authorization: Bearer <token>
- Response: { message: "Cancelled", attendeeCount }

GET /events/:id/attendees
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [User], total, page, limit, totalPages }

POST /events/:id/reviews
- Body: { rating (1-5), comment }
- Headers: Authorization: Bearer <token>
- Response: { review: Review }

GET /events/:id/reviews
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Review], total, page, limit, totalPages }
```

### 6. ESTABLISHMENTS ENDPOINTS (9 endpoints)

```
POST /establishments
- Body: { name, description?, category, latitude, longitude, address, phone?, website?, image? }
- Headers: Authorization: Bearer <token>
- Response: { establishment: Establishment }

GET /establishments/nearby
- Query: latitude=X&longitude=Y&distance=50&category?&page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Establishment], total, page, limit, totalPages }
- Nota: distance em km, categoria opcional

GET /establishments/:id
- Headers: Authorization: Bearer <token>
- Response: { establishment: Establishment }

PUT /establishments/:id
- Body: { name?, description?, category?, latitude?, longitude?, address?, phone?, website?, image? }
- Headers: Authorization: Bearer <token>
- Response: { updated establishment }

DELETE /establishments/:id
- Headers: Authorization: Bearer <token>
- Response: { message: "Establishment deleted" }

POST /establishments/:id/favorite
- Headers: Authorization: Bearer <token>
- Response: { message: "Favorited", favoriteCount }

DELETE /establishments/:id/favorite
- Headers: Authorization: Bearer <token>
- Response: { message: "Unfavorited", favoriteCount }

POST /establishments/:id/reviews
- Body: { rating (1-5), comment }
- Headers: Authorization: Bearer <token>
- Response: { review: Review }

GET /establishments/:id/reviews
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Review], total, page, limit, totalPages }
```

### 7. CHAT ENDPOINTS (11 endpoints)

```
POST /conversations
- Body: { recipientId }
- Headers: Authorization: Bearer <token>
- Response: { conversation: Conversation }

GET /conversations
- Query: page=1&limit=20
- Headers: Authorization: Bearer <token>
- Response: { data: [Conversation], total, page, limit, totalPages }

GET /conversations/:id
- Headers: Authorization: Bearer <token>
- Response: { conversation: Conversation }

GET /conversations/:id/messages
- Query: page=1&limit=30
- Headers: Authorization: Bearer <token>
- Response: { data: [Message], total, page, limit, totalPages }

POST /conversations/:id/messages
- Body: { content, file? (FormData) }
- Headers: Authorization: Bearer <token>
- Response: { message: Message }

PUT /messages/:id
- Body: { content }
- Headers: Authorization: Bearer <token>
- Response: { message: Message }

DELETE /messages/:id
- Headers: Authorization: Bearer <token>
- Response: { message: "Message deleted" }

POST /conversations/:id/read
- Headers: Authorization: Bearer <token>
- Response: { message: "Marked as read" }

GET /conversations/search?q=
- Query: q=query
- Headers: Authorization: Bearer <token>
- Response: { data: [Conversation] }

GET /conversations/unread
- Headers: Authorization: Bearer <token>
- Response: { total, byConversation: { conversationId: count } }

DELETE /conversations/:id
- Headers: Authorization: Bearer <token>
- Response: { message: "Conversation archived" }
```

---

## WebSocket Events (Socket.io)

### Chat Events

```
// Client -> Server
message:send
  Data: { conversationId, content }
  Response: Confirmação no message:received

typing:start
  Data: { conversationId }

typing:stop
  Data: { conversationId }

message:read
  Data: { conversationId }

// Server -> Client
message:received
  Data: { messageId, conversationId, content, senderId, senderName, senderAvatar, createdAt }

typing:user
  Data: { conversationId, userId, userName }

user:online
  Data: { userId, userName }

user:offline
  Data: { userId }

message:edited
  Data: { messageId, conversationId, content, updatedAt }

message:deleted
  Data: { messageId, conversationId }
```

---

## DATA MODELS

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // Soft delete
}
```

### Post
```typescript
{
  id: string;
  content: string;
  images?: string[];
  video?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### Comment
```typescript
{
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Event
```typescript
{
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: string;
  endDate: string;
  category: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendeesCount: number;
  isAttending: boolean;
  image?: string;
  rating?: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### Establishment
```typescript
{
  id: string;
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  website?: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewsCount: number;
  favoritesCount: number;
  isFavorited: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Conversation
```typescript
{
  id: string;
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
```

### Message
```typescript
{
  id: string;
  conversationId: string;
  content: string;
  file?: {
    url: string;
    filename: string;
  };
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // Soft delete
}
```

### Review
```typescript
{
  id: string;
  rating: number; // 1-5
  comment: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## Error Codes

```
200 - OK
201 - Created
204 - No Content
400 - Bad Request
401 - Unauthorized (token inválido/expirado)
403 - Forbidden (sem permissão)
404 - Not Found
422 - Unprocessable Entity (validação falhou)
429 - Too Many Requests (rate limit)
500 - Internal Server Error
```

---

## Base URL

```
Development: http://localhost:3000
Production: https://api.meu-agito.com.br
```

---

## Authentication

Todos os requests protegidos requerem:
```
Authorization: Bearer <accessToken>
```

Token expirado? (401)
- Frontend automaticamente faz refresh do token
- ApiClient trata automaticamente (já implementado)
- Se refresh falha, usuário é deslogado

---

## Rate Limiting

```
- 100 requests por minuto por IP
- Arquivo upload: 10MB máximo
- Imagem upload: 5MB máximo
```

---

## Headers Recomendados

```
Content-Type: application/json
Authorization: Bearer <token>
User-Agent: MEU-AGITO-MOBILE/<version>
X-Request-ID: <uuid> (opcional, para debugging)
```

---

**Última atualização**: 26/03/2026  
**API Version**: 1.0.0  
**Status**: Todos endpoints operacionais ✅
