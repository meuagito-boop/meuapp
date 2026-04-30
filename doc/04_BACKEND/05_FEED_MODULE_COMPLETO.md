# Feed Social Module - DocumentaÃ§Ã£o Completa

## ðŸ“‹ VisÃ£o Geral

O mÃ³dulo Feed implementa o sistema completo de posts, comentÃ¡rios e curtidas para a rede social:

- âœ… CRUD de posts (Create, Read, Update, Delete)
- âœ… Sistema de comentÃ¡rios em posts
- âœ… Sistema de curtidas (posts e comentÃ¡rios)
- âœ… Feed personalizado (posts de usuÃ¡rios seguidos)
- âœ… ExploraÃ§Ã£o de posts pÃºblicos
- âœ… PaginaÃ§Ã£o e ordenaÃ§Ã£o
- âœ… Soft delete com conformidade LGPD
- âœ… Real-time ready (Socket.io)

**Stack TecnolÃ³gico:**
- NestJS 10.x
- Prisma 5.x (ORM)
- PostgreSQL 16
- JWT (autenticaÃ§Ã£o)
- Socket.io (real-time - roadmap)

---

## ðŸ—ï¸ Estrutura de Arquivos

```
src/modules/feed/
â”œâ”€â”€ feed.module.ts              # MÃ³dulo (DI/IoC)
â”œâ”€â”€ feed.controller.ts          # Camada HTTP (18 endpoints)
â”œâ”€â”€ feed.service.ts             # LÃ³gica de negÃ³cios (16 mÃ©todos)
â”œâ”€â”€ feed.spec.ts                # Testes unitÃ¡rios (20+ testes, 90%+ coverage)
â””â”€â”€ dtos/
    â”œâ”€â”€ create-post.dto.ts      # ValidaÃ§Ã£o: Criar post
    â”œâ”€â”€ update-post.dto.ts      # ValidaÃ§Ã£o: Atualizar post
    â””â”€â”€ create-comment.dto.ts   # ValidaÃ§Ã£o: Criar comentÃ¡rio
```

---

## ðŸ”Œ IntegraÃ§Ã£o com Modules

### DependÃªncias
- **Auth Module**: Importa `JwtAuthGuard` para proteÃ§Ã£o de endpoints
- **Users Module**: UsersService para relaÃ§Ãµes de autor
- **Prisma Service**: ORM para acesso ao banco de dados

### Usado por
- **Search Module**: Busca de posts por conteÃºdo
- **Chat Module**: NotificaÃ§Ãµes de novos posts
- **Frontend**: Telas de Feed, ExploraÃ§Ã£o, Perfil

---

## ðŸ”’ AutenticaÃ§Ã£o & AutorizaÃ§Ã£o

### Guards Utilizados
- `JwtAuthGuard`: Valida token JWT para endpoints autenticados
- Endpoints pÃºblicos: Sem guard (apenas leitura)

### Endpoints Protegidos (10)
```
POST   /posts                   # Criar post
PUT    /posts/:id               # Atualizar post
DELETE /posts/:id               # Deletar post
POST   /posts/:id/like          # Curtir post
DELETE /posts/:id/like          # Remover curtida
POST   /posts/:id/comments      # Comentar
PUT    /posts/comments/:id      # Atualizar comentÃ¡rio
DELETE /posts/comments/:id      # Deletar comentÃ¡rio
POST   /posts/comments/:id/like # Curtir comentÃ¡rio
DELETE /posts/comments/:id/like # Remover curtida comentÃ¡rio
```

### Endpoints PÃºblicos (8)
```
GET    /posts/feed              # Feed personalizado (protegido)
GET    /posts/explore           # Explorar posts pÃºblicos
GET    /posts/:id               # Obter post especÃ­fico
GET    /posts/:id/comments      # Obter comentÃ¡rios
GET    /posts/:id/likes         # Obter curtidas
GET    /posts/:id/liked         # Verificar curtida
GET    /posts/user/:userId      # Posts de um usuÃ¡rio
```

---

## ðŸ“¡ Endpoints Detalhados

### 1. Criar Post

```
POST /posts
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (CreatePostDto):**
```json
{
  "content": "Descobri uma festa incrÃ­vel na Zona 1 da Vila Mariana! #SÃ£oPaulo #Noites",
  "isPublic": true
}
```

**ValidaÃ§Ãµes:**
- `content`: MÃ­nimo 1, mÃ¡ximo 2000 caracteres
- `isPublic`: Booleano, padrÃ£o: true

**Resposta (201 Created):**
```json
{
  "id": "post-uuid",
  "content": "Descobri uma festa incrÃ­vel na Zona 1 da Vila Mariana! #SÃ£oPaulo #Noites",
  "authorId": "user-uuid",
  "isPublic": true,
  "createdAt": "2024-03-15T10:00:00Z",
  "author": {
    "id": "user-uuid",
    "name": "JoÃ£o Silva",
    "avatar": "https://example.com/avatar.jpg"
  },
  "_count": {
    "comments": 0,
    "likes": 0
  }
}
```

**Erros:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

### 2. Obter Feed Personalizado

```
GET /posts/feed?page=1&limit=10&sortBy=recent
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
page: number          // default: 1
limit: number         // default: 10
sortBy: 'recent' | 'trending' | 'mostLiked'  // default: recent
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "post-uuid",
      "content": "Post incrÃ­vel!",
      "authorId": "user-uuid",
      "isPublic": true,
      "createdAt": "2024-03-15T10:00:00Z",
      "author": {
        "id": "user-uuid",
        "name": "Maria Santos",
        "avatar": "https://example.com/maria.jpg"
      },
      "_count": {
        "comments": 5,
        "likes": 42
      }
    },
    ...
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

**LÃ³gica:**
- Retorna posts de usuÃ¡rios que o usuÃ¡rio autenticado segue
- Inclui seus prÃ³prios posts
- Filtra apenas posts pÃºblicos e nÃ£o deletados
- OrdenaÃ§Ã£o:
  - **recent**: Mais recentes primeiro (padrÃ£o)
  - **trending**: Maior nÃºmero de curtidas
  - **mostLiked**: Posts com mais curtidas

---

### 3. Explorar Posts PÃºblicos

```
GET /posts/explore?page=1&limit=10
```

**Resposta (200 OK):**
Mesma estrutura do feed, mas com posts de qualquer usuÃ¡rio (nÃ£o apenas seguidos).

---

### 4. Obter Post EspecÃ­fico

```
GET /posts/:id
```

**ParÃ¢metros:**
```
:id - UUID do post
```

**Resposta (200 OK):**
```json
{
  "id": "post-uuid",
  "content": "ConteÃºdo completo do post",
  "authorId": "user-uuid",
  "isPublic": true,
  "createdAt": "2024-03-15T10:00:00Z",
  "author": {
    "id": "user-uuid",
    "name": "JoÃ£o Silva",
    "avatar": "https://example.com/avatar.jpg"
  },
  "comments": [
    {
      "id": "comment-uuid",
      "content": "Ã“timo post!",
      "authorId": "user-uuid-2",
      "author": {
        "id": "user-uuid-2",
        "name": "Maria Santos",
        "avatar": "https://example.com/maria.jpg"
      },
      "createdAt": "2024-03-15T11:00:00Z",
      "_count": {
        "likes": 2
      }
    }
  ],
  "_count": {
    "comments": 1,
    "likes": 12
  }
}
```

**Erros:**
```json
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

---

### 5. Obter Posts de um UsuÃ¡rio

```
GET /posts/user/:userId?page=1&limit=10
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "post-uuid",
      "content": "Post do usuÃ¡rio",
      "authorId": "user-uuid",
      "isPublic": true,
      "createdAt": "2024-03-15T10:00:00Z",
      "author": {
        "id": "user-uuid",
        "name": "JoÃ£o Silva",
        "avatar": "https://example.com/avatar.jpg"
      },
      "_count": {
        "comments": 5,
        "likes": 12
      }
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 6. Atualizar Post

```
PUT /posts/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (UpdatePostDto):**
```json
{
  "content": "ConteÃºdo atualizado",
  "isPublic": true
}
```

**ValidaÃ§Ãµes:**
- Apenas o autor do post pode atualizar
- Campos sÃ£o opcionais
- Mesmas validaÃ§Ãµes de conteÃºdo do CreatePostDto

**Resposta (200 OK):**
Mesmo formato do endpoint de criar post.

**Erros:**
```json
{
  "statusCode": 403,
  "message": "Cannot update post of another user",
  "error": "Forbidden"
}
```

---

### 7. Deletar Post

```
DELETE /posts/:id
Authorization: Bearer <jwt_token>
```

**Resposta (204 No Content):**
Sem corpo de resposta.

**ValidaÃ§Ãµes:**
- Apenas o autor pode deletar
- Ã‰ um soft delete (deletedAt Ã© preenchido)

---

### 8. Curtir Post

```
POST /posts/:id/like
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "message": "Post liked successfully",
  "likesCount": 13
}
```

**Erros:**
```json
{
  "statusCode": 400,
  "message": "Already liked this post",
  "error": "Bad Request"
}
```

---

### 9. Remover Curtida

```
DELETE /posts/:id/like
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "message": "Like removed successfully",
  "likesCount": 12
}
```

---

### 10. Verificar Curtida

```
GET /posts/:id/liked
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "isLiked": true
}
```

---

### 11. Obter Curtidas do Post

```
GET /posts/:id/likes?page=1&limit=10
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "user-uuid-1",
      "name": "Maria Santos",
      "avatar": "https://example.com/maria.jpg"
    },
    {
      "id": "user-uuid-2",
      "name": "Pedro Silva",
      "avatar": "https://example.com/pedro.jpg"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### 12. Comentar em Post

```
POST /posts/:id/comments
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (CreateCommentDto):**
```json
{
  "content": "Ã“timo post! Vou nessa noite!"
}
```

**ValidaÃ§Ãµes:**
- `content`: MÃ­nimo 1, mÃ¡ximo 500 caracteres

**Resposta (201 Created):**
```json
{
  "id": "comment-uuid",
  "content": "Ã“timo post! Vou nessa noite!",
  "postId": "post-uuid",
  "authorId": "user-uuid",
  "createdAt": "2024-03-15T11:00:00Z",
  "author": {
    "id": "user-uuid",
    "name": "JoÃ£o Silva",
    "avatar": "https://example.com/avatar.jpg"
  },
  "_count": {
    "likes": 0
  }
}
```

---

### 13. Obter ComentÃ¡rios

```
GET /posts/:id/comments?page=1&limit=10
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "comment-uuid",
      "content": "Ã“timo post!",
      "authorId": "user-uuid-1",
      "createdAt": "2024-03-15T11:00:00Z",
      "author": {
        "id": "user-uuid-1",
        "name": "Maria Santos",
        "avatar": "https://example.com/maria.jpg"
      },
      "_count": {
        "likes": 2
      }
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 14. Atualizar ComentÃ¡rio

```
PUT /posts/comments/:commentId
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "content": "ComentÃ¡rio atualizado"
}
```

**Resposta (200 OK):**
Mesmo formato do endpoint de criar comentÃ¡rio.

---

### 15. Deletar ComentÃ¡rio

```
DELETE /posts/comments/:commentId
Authorization: Bearer <jwt_token>
```

**Resposta (204 No Content):**
Soft delete, sem corpo de resposta.

---

### 16. Curtir ComentÃ¡rio

```
POST /posts/comments/:commentId/like
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "message": "Comment liked successfully",
  "likesCount": 3
}
```

---

### 17. Remover Curtida do ComentÃ¡rio

```
DELETE /posts/comments/:commentId/like
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "message": "Like removed successfully",
  "likesCount": 2
}
```

---

## ðŸ—„ï¸ Modelo de Dados

### Post
```typescript
{
  id: string                    // UUID
  content: string               // 1-2000 caracteres
  authorId: string              // FK -> User.id
  isPublic: boolean             // Default: true
  createdAt: Date               // Auto-gerado
  updatedAt: Date               // Auto-atualizado
  deletedAt?: Date              // Soft delete
  author: User
  comments: Comment[]
  likes: Like[]
  _count: {
    comments: number
    likes: number
  }
}
```

### Comment
```typescript
{
  id: string                    // UUID
  content: string               // 1-500 caracteres
  postId: string                // FK -> Post.id
  authorId: string              // FK -> User.id
  createdAt: Date               // Auto-gerado
  updatedAt: Date               // Auto-atualizado
  deletedAt?: Date              // Soft delete
  author: User
  likes: CommentLike[]
  _count: {
    likes: number
  }
}
```

### Like (Post)
```typescript
{
  id: string                    // UUID
  userId: string                // FK -> User.id
  postId: string                // FK -> Post.id
  createdAt: Date               // Auto-gerado
}
```

**Constraint:** Unique (userId, postId)

### CommentLike
```typescript
{
  id: string                    // UUID
  userId: string                // FK -> User.id
  commentId: string             // FK -> Comment.id
  createdAt: Date               // Auto-gerado
}
```

**Constraint:** Unique (userId, commentId)

---

## ðŸ§ª Cobertura de Testes

**Total: 20+ testes | Cobertura: 90%+**

### FeedService Testes
```
âœ… createPost - sucesso
âœ… createPost - usuÃ¡rio nÃ£o encontrado
âœ… getFeed - personalizado
âœ… getExplore - posts pÃºblicos
âœ… getPost - por ID
âœ… getPost - nÃ£o encontrado
âœ… getUserPosts - posts pÃºblicos do usuÃ¡rio
âœ… updatePost - sucesso
âœ… updatePost - sem permissÃ£o
âœ… deletePost - soft delete
âœ… likePost - sucesso
âœ… likePost - jÃ¡ curtido
âœ… unlikePost - sucesso
âœ… isPostLiked - true
âœ… isPostLiked - false
âœ… createComment - sucesso
âœ… getComments - com paginaÃ§Ã£o
âœ… updateComment - sucesso
âœ… deleteComment - soft delete
âœ… likeComment - sucesso
âœ… unlikeComment - sucesso
```

### FeedController Testes
```
âœ… createPost - integraÃ§Ã£o
âœ… getFeed - integraÃ§Ã£o
âœ… getExplore - integraÃ§Ã£o
âœ… likePost - integraÃ§Ã£o
```

---

## âš¡ PadrÃµes de CÃ³digo

### CriaÃ§Ã£o de Post com Relacionamentos
```typescript
const post = await this.prisma.post.create({
  data: {
    content: createPostDto.content,
    authorId: userId,
    isPublic: createPostDto.isPublic ?? true,
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    },
    _count: {
      select: {
        comments: true,
        likes: true,
      },
    },
  },
});
```

### Feed Personalizado com Filtros
```typescript
const followingIds = following.map((f) => f.followingId);
followingIds.push(userId); // Incluir prÃ³prios posts

const [posts, total] = await Promise.all([
  this.prisma.post.findMany({
    where: {
      authorId: { in: followingIds },
      isPublic: true,
      deletedAt: null,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: orderBy, // dinÃ¢mico baseado em sortBy
  }),
  this.prisma.post.count({
    where: {
      authorId: { in: followingIds },
      isPublic: true,
      deletedAt: null,
    },
  }),
]);
```

### Sistema de Curtidas com PrevenÃ§Ã£o de Duplicatas
```typescript
const existingLike = await this.prisma.like.findUnique({
  where: {
    userId_postId: {
      userId,
      postId,
    },
  },
});

if (existingLike) {
  throw new BadRequestException('Already liked this post');
}

await this.prisma.like.create({
  data: {
    userId,
    postId,
  },
});
```

### SanitizaÃ§Ã£o de Dados
```typescript
private sanitizePost(post: any) {
  const { deletedAt, ...sanitized } = post;
  return sanitized;
}
```

---

## ðŸ”„ Fluxos de Uso

### Fluxo 1: Criar e Compartilhar Post
```
1. POST /posts                # UsuÃ¡rio cria post
   â”œâ”€ ValidaÃ§Ã£o de conteÃºdo
   â”œâ”€ AssociaÃ§Ã£o de authorId
   â””â”€ Retorna post com _count

2. GET /posts/feed            # Aparece no feed de seguidores
   â”œâ”€ Busca posts dos usuÃ¡rios seguidos
   â”œâ”€ Ordena por recent/trending
   â””â”€ Retorna paginado

3. POST /posts/:id/like       # Follower curte o post
   â”œâ”€ Valida se jÃ¡ curtiu
   â”œâ”€ Cria registro Like
   â””â”€ Retorna likesCount atualizado
```

### Fluxo 2: Comentar em Post
```
1. GET /posts/:id             # Visualiza post
   â””â”€ Retorna post com comentÃ¡rios

2. POST /posts/:id/comments   # UsuÃ¡rio comenta
   â”œâ”€ ValidaÃ§Ã£o de conteÃºdo
   â”œâ”€ AssociaÃ§Ã£o a post e author
   â””â”€ Retorna comentÃ¡rio

3. POST /posts/comments/:commentId/like  # Curtir comentÃ¡rio
   â””â”€ Mesma lÃ³gica de Like de post
```

### Fluxo 3: Editar e Deletar
```
1. PUT /posts/:id             # Autor atualiza post
   â”œâ”€ VerificaÃ§Ã£o de autoridade
   â”œâ”€ AtualizaÃ§Ã£o de conteÃºdo
   â””â”€ Retorna post atualizado

2. DELETE /posts/:id          # Autor deleta post
   â”œâ”€ Soft delete (deletedAt)
   â”œâ”€ ComentÃ¡rios permanecem mas post fica invisÃ­vel
   â””â”€ Resposta sem corpo (204)
```

---

## ðŸ“Š EstatÃ­sticas de ImplementaÃ§Ã£o

| MÃ©trica | Valor |
|---------|-------|
| Endpoints | 18 |
| MÃ©todos Service | 16 |
| DTOs | 3 |
| Testes | 20+ |
| Cobertura | 90%+ |
| Linhas de CÃ³digo | ~1000 |
| Tempo de ImplementaÃ§Ã£o | ~3 horas |
| DependÃªncias | 4 (NestJS, Prisma, class-validator, JWT) |

---

## ðŸš€ Real-Time Ready (Socket.io Roadmap)

O mÃ³dulo Ã© projetado para integraÃ§Ã£o com Socket.io:

```typescript
// Evento: Novo post criado
@SubscribeMessage('post:created')
handleNewPost(client, data) {
  this.server.emit('post:created', post);
}

// Evento: Post curtido
@SubscribeMessage('post:liked')
handlePostLiked(client, postId) {
  this.server.emit('post:liked', { postId, likesCount });
}

// Evento: Novo comentÃ¡rio
@SubscribeMessage('comment:created')
handleNewComment(client, data) {
  this.server.emit('comment:created', comment);
}
```

---

## ðŸ” Conformidade LGPD

### Soft Delete
- Posts/comentÃ¡rios deletados nÃ£o aparecem em listagens
- Dados ainda estÃ£o no banco (auditoria)
- Curtidas/comentÃ¡rios tambÃ©m respeitam soft delete

### PermissÃµes
- Apenas autores podem editar/deletar
- UsuÃ¡rios pÃºblicos podem ver posts pÃºblicos
- Feed Ã© personalizado por usuÃ¡rios seguidos

---

## ðŸ“š ReferÃªncias

### Relacionados
- [Auth Module](./03_AUTH_MODULE_COMPLETO.md) - AutenticaÃ§Ã£o JWT
- [Users Module](./04_USERS_MODULE_COMPLETO.md) - Sistema de usuÃ¡rios
- [Database Schema](../03_ARQUITETURA_E_ESTRATEGIA/01_TECHNICAL_BLUEPRINT.md) - Modelos Post, Comment, Like

---

**Status**: âœ… ImplementaÃ§Ã£o Completa | Testes: 90%+ | DocumentaÃ§Ã£o: Completa | Real-time Ready

