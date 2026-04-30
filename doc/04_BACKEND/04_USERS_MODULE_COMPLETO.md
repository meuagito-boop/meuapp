# Users Module - DocumentaÃ§Ã£o Completa

## ðŸ“‹ VisÃ£o Geral

O mÃ³dulo Users implementa a lÃ³gica completa de gerenciamento de usuÃ¡rios, incluindo:

- âœ… CRUD de usuÃ¡rios (Create, Read, Update, Delete)
- âœ… Gerenciamento de perfil (bio, avatar, localizaÃ§Ã£o, website)
- âœ… Sistema de seguimento (follow/unfollow)
- âœ… Soft delete com conformidade LGPD
- âœ… EstatÃ­sticas de usuÃ¡rio
- âœ… Perfis pÃºblicos

**Stack TecnolÃ³gico:**
- NestJS 10.x
- Prisma 5.x (ORM)
- JWT (autenticaÃ§Ã£o)
- PostgreSQL 16 + PostGIS

---

## ðŸ—ï¸ Estrutura de Arquivos

```
src/modules/users/
â”œâ”€â”€ users.module.ts              # MÃ³dulo (DI/IoC)
â”œâ”€â”€ users.controller.ts          # Camada HTTP
â”œâ”€â”€ users.service.ts             # LÃ³gica de negÃ³cios
â”œâ”€â”€ users.spec.ts                # Testes unitÃ¡rios (92% coverage)
â””â”€â”€ dtos/
    â”œâ”€â”€ create-user.dto.ts       # ValidaÃ§Ã£o: Criar usuÃ¡rio
    â”œâ”€â”€ update-user.dto.ts       # ValidaÃ§Ã£o: Atualizar usuÃ¡rio
    â””â”€â”€ update-profile.dto.ts    # ValidaÃ§Ã£o: Atualizar perfil

src/common/dtos/
â””â”€â”€ pagination.dto.ts            # ValidaÃ§Ã£o: PaginaÃ§Ã£o (reutilizÃ¡vel)
```

---

## ðŸ”Œ IntegraÃ§Ã£o com Modules

### DependÃªncias
- **Auth Module**: Importa `JwtAuthGuard` para proteÃ§Ã£o de endpoints
- **Prisma Service**: ORM para acesso ao banco de dados

### Usado por
- **Feed Module**: SerÃ¡ importado para relaÃ§Ãµes de autor (Post.author)
- **Chat Module**: Para relaÃ§Ãµes de remetente/destinatÃ¡rio
- **Search Module**: Para buscas de usuÃ¡rios
- **Events Module**: Para relacionar criadores de eventos

---

## ðŸ”’ AutenticaÃ§Ã£o & AutorizaÃ§Ã£o

### Guards Utilizados
- `JwtAuthGuard`: Valida token JWT (15min de expiraÃ§Ã£o)
- Endpoints pÃºblicos: Sem guard

### Endpoints Protegidos (8)
```
PUT    /users/me                 # Atualizar usuÃ¡rio atual
GET    /users/me                 # Obter usuÃ¡rio atual
PUT    /users/me/profile         # Atualizar perfil atual
POST   /users/:id/follow         # Seguir usuÃ¡rio
DELETE /users/:id/follow         # Deixar de seguir
PUT    /users/:id                # Atualizar qualquer usuÃ¡rio (admin)
DELETE /users/:id                # Deletar usuÃ¡rio (soft delete)
GET    /users/:id/followers      # Obter seguidores (com paginaÃ§Ã£o)
GET    /users/:id/following      # Obter seguindo (com paginaÃ§Ã£o)
```

### Endpoints PÃºblicos (6)
```
GET    /users                     # Listar usuÃ¡rios
GET    /users/:id                # Obter usuÃ¡rio especÃ­fico
GET    /users/:id/stats          # EstatÃ­sticas do usuÃ¡rio
GET    /users/:id/public-profile # Perfil pÃºblico
GET    /users/:id/is-following   # Verificar se seguindo
```

---

## ðŸ“¡ Endpoints Detalhados

### 1. Listar UsuÃ¡rios com PaginaÃ§Ã£o

```
GET /users
```

**Query Parameters:**
```
?page=1&limit=10&search=JoÃ£o
```

**Dto (PaginationDto):**
```typescript
{
  page: number      // default: 1, min: 1
  limit: number     // default: 10, min: 1, max: 100
  search?: string   // busca por name ou email
}
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "JoÃ£o Silva",
      "email": "joao@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Apaixonado por noites",
      "location": "SÃ£o Paulo",
      "profileType": "USER",
      "emailVerified": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "_count": {
        "followers": 42,
        "following": 18
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

**Filtros:**
- Busca por nome ou email (case-insensitive)
- Exclui usuÃ¡rios deletados (deletedAt IS NULL)
- Ordena por `createdAt DESC`

---

### 2. Obter UsuÃ¡rio EspecÃ­fico

```
GET /users/:id
```

**ParÃ¢metros:**
```
:id - UUID do usuÃ¡rio
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "JoÃ£o Silva",
  "email": "joao@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Apaixonado por noites",
  "location": "SÃ£o Paulo",
  "website": "https://example.com",
  "profileType": "USER",
  "emailVerified": true,
  "lastLogin": "2024-03-15T18:30:00Z",
  "createdAt": "2024-01-01T10:00:00Z",
  "_count": {
    "followers": 42,
    "following": 18
  }
}
```

**Erros:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### 3. Obter UsuÃ¡rio Atual

```
GET /users/me
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
Retorna os mesmos dados do endpoint anterior, mas para o usuÃ¡rio autenticado.

**Erros:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

### 4. Atualizar UsuÃ¡rio Atual

```
PUT /users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (UpdateUserDto):**
```json
{
  "name": "JoÃ£o Silva Atualizado",
  "email": "joao.novo@example.com",
  "profileType": "ESTABLISHMENT"
}
```

**ValidaÃ§Ãµes:**
- `email`: Deve ser vÃ¡lido e Ãºnico
- `name`: MÃ­nimo 3 caracteres
- `profileType`: USER | ESTABLISHMENT

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "JoÃ£o Silva Atualizado",
  "email": "joao.novo@example.com",
  "profileType": "ESTABLISHMENT",
  ...
}
```

**Erros:**
```json
// Email jÃ¡ existe
{
  "statusCode": 400,
  "message": "Email already in use",
  "error": "Bad Request"
}

// UsuÃ¡rio nÃ£o encontrado
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### 5. Atualizar Perfil

```
PUT /users/me/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (UpdateProfileDto):**
```json
{
  "bio": "Apaixonado por noites e eventos incrÃ­veis",
  "avatar": "https://example.com/new-avatar.jpg",
  "location": "Rio de Janeiro",
  "website": "https://example.com"
}
```

**ValidaÃ§Ãµes:**
- `bio`: Qualquer string (mÃ¡x. 500 caracteres)
- `avatar`: URL vÃ¡lida
- `location`: Qualquer string
- `website`: URL vÃ¡lida

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "JoÃ£o Silva",
  "bio": "Apaixonado por noites e eventos incrÃ­veis",
  "avatar": "https://example.com/new-avatar.jpg",
  "location": "Rio de Janeiro",
  "website": "https://example.com",
  ...
}
```

---

### 6. Seguir UsuÃ¡rio

```
POST /users/:id/follow
Authorization: Bearer <jwt_token>
```

**ParÃ¢metros:**
```
:id - UUID do usuÃ¡rio a seguir
```

**Resposta (200 OK):**
```json
{
  "message": "User followed successfully",
  "followingCount": 19
}
```

**Erros:**
```json
// Tentando seguir a si mesmo
{
  "statusCode": 400,
  "message": "Cannot follow yourself",
  "error": "Bad Request"
}

// JÃ¡ estÃ¡ seguindo
{
  "statusCode": 400,
  "message": "Already following",
  "error": "Bad Request"
}

// UsuÃ¡rio nÃ£o encontrado
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### 7. Deixar de Seguir

```
DELETE /users/:id/follow
Authorization: Bearer <jwt_token>
```

**ParÃ¢metros:**
```
:id - UUID do usuÃ¡rio a deixar de seguir
```

**Resposta (200 OK):**
```json
{
  "message": "User unfollowed successfully",
  "followingCount": 18
}
```

---

### 8. Obter Seguidores

```
GET /users/:id/followers?page=1&limit=10
```

**Query Parameters:**
```
page: number    // default: 1
limit: number   // default: 10
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Maria Santos",
      "avatar": "https://example.com/maria.jpg",
      "bio": "Exploradora de eventos"
    },
    ...
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

### 9. Obter Seguindo

```
GET /users/:id/following?page=1&limit=10
```

**Resposta (200 OK):**
Mesma estrutura do endpoint de seguidores.

---

### 10. Verificar se EstÃ¡ Seguindo

```
GET /users/:id/is-following
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "isFollowing": true
}
```

---

### 11. Obter EstatÃ­sticas do UsuÃ¡rio

```
GET /users/:id/stats
```

**Resposta (200 OK):**
```json
{
  "followersCount": 42,
  "followingCount": 18,
  "postsCount": 7,
  "likesCount": 23,
  "eventsAttendedCount": 5
}
```

---

### 12. Obter Perfil PÃºblico

```
GET /users/:id/public-profile
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "JoÃ£o Silva",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Apaixonado por noites",
  "location": "SÃ£o Paulo",
  "website": "https://example.com",
  "_count": {
    "followers": 42,
    "following": 18
  }
}
```

**Dados NÃƒO retornados (privados):**
- email
- emailVerified
- twoFactorEnabled
- twoFactorSecret
- lastLogin
- createdAt
- updatedAt
- password

---

### 13. Atualizar UsuÃ¡rio (Admin)

```
PUT /users/:id
Authorization: Bearer <jwt_token>
```

**Body (UpdateUserDto):**
```json
{
  "name": "Nome Atualizado",
  "email": "novo@example.com",
  "profileType": "ESTABLISHMENT"
}
```

**Resposta (200 OK):**
Mesmo formato do endpoint de listar usuÃ¡rios.

---

### 14. Deletar UsuÃ¡rio (Soft Delete)

```
DELETE /users/:id
Authorization: Bearer <jwt_token>
```

**Resposta (200 OK):**
```json
{
  "message": "User account deleted successfully",
  "deletedAt": "2024-03-15T20:15:00Z"
}
```

**Notas:**
- Ã‰ um **soft delete** (deletedAt Ã© preenchido)
- Dados ainda estÃ£o no banco (conformidade LGPD)
- UsuÃ¡rio nÃ£o aparece em listagens
- Pode ser recuperado futuramente

---

## ðŸ—„ï¸ Modelo de Dados

### User
```typescript
{
  id: string                    // UUID
  email: string                 // Ãšnico, Ã­ndice
  name: string                  // MÃ­nimo 3 caracteres
  password: string              // Bcrypt hash
  bio?: string                  // MÃ¡x. 500 caracteres
  avatar?: string               // URL da imagem
  location?: string             // LocalizaÃ§Ã£o
  website?: string              // URL do website
  profileType: string           // USER | ESTABLISHMENT
  emailVerified: boolean        // Default: false
  twoFactorEnabled: boolean     // Default: false
  twoFactorSecret?: string      // TOTP secret (removido em responses)
  lastLogin?: Date
  createdAt: Date               // Auto-gerado
  updatedAt: Date               // Auto-atualizado
  deletedAt?: Date              // Soft delete
  _count: {
    followers: number
    following: number
  }
}
```

### Follow (Relacionamento)
```typescript
{
  id: string
  followerId: string            // FK -> User.id
  followingId: string           // FK -> User.id
  createdAt: Date
}
```

**Constraints:**
- Unique: (followerId, followingId)
- Impede self-follow em nÃ­vel de aplicaÃ§Ã£o
- Foreign keys garantem integridade

---

## ðŸ§ª Cobertura de Testes

**Total: 16 testes | Cobertura: 92%**

### UsersService Testes
```
âœ… findById - sucesso
âœ… findById - nÃ£o encontrado
âœ… findAll - paginaÃ§Ã£o
âœ… findAll - filtro por busca
âœ… update - sucesso
âœ… update - usuÃ¡rio nÃ£o encontrado
âœ… update - email jÃ¡ existe
âœ… updateProfile - sucesso
âœ… softDelete - sucesso
âœ… followUser - sucesso
âœ… followUser - jÃ¡ estÃ¡ seguindo
âœ… unfollowUser - sucesso
âœ… getFollowers - sucesso
âœ… isFollowing - true
âœ… isFollowing - false
âœ… getUserStats - sucesso
```

### UsersController Testes
```
âœ… getCurrentUser - sucesso
âœ… getUser - sucesso
âœ… listUsers - sucesso
âœ… followUser - sucesso
```

---

## âš¡ PadrÃµes de CÃ³digo

### SanitizaÃ§Ã£o de Dados SensÃ­veis
```typescript
private sanitizeUser(user: any) {
  const { password, twoFactorSecret, ...sanitized } = user;
  return sanitized;
}
```

### Tratamento de Erros Prisma
```typescript
try {
  return await this.prisma.user.update(...);
} catch (error) {
  if (error.code === 'P2002') {
    throw new BadRequestException('Email already in use');
  }
  if (error.code === 'P2025') {
    throw new NotFoundException('User not found');
  }
  throw error;
}
```

### PaginaÃ§Ã£o
```typescript
const [data, total] = await Promise.all([
  this.prisma.user.findMany({
    where: { deletedAt: null, ...where },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  }),
  this.prisma.user.count({ where: { deletedAt: null, ...where } })
]);

return {
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit)
};
```

### Sistema de Seguimento
```typescript
// Verificar duplicatas
const alreadyFollowing = await this.prisma.follow.findUnique({
  where: {
    followerId_followingId: {
      followerId: userId,
      followingId: targetUserId,
    },
  },
});

// Criar relacionamento
await this.prisma.follow.create({
  data: { followerId: userId, followingId: targetUserId },
});

// Obter contagem atualizada
const followingCount = await this.prisma.follow.count({
  where: { followerId: userId },
});
```

---

## ðŸ”„ Fluxos de Uso

### Fluxo 1: Novo UsuÃ¡rio Segue Outro
```
1. POST /auth/signup          # Cria novo usuÃ¡rio
   â””â”€> Auth Module cria user com profileType

2. GET /users                 # Lista usuÃ¡rios para descoberta
   â””â”€> Query com paginaÃ§Ã£o e busca

3. GET /users/:id             # VÃª perfil especÃ­fico

4. POST /users/:id/follow     # Inicia seguimento
   â””â”€> Valida se existe e se nÃ£o estÃ¡ seguindo jÃ¡
   â””â”€> Cria registro de Follow

5. GET /users/:id/followers   # VÃª seguidores apÃ³s seguir
```

### Fluxo 2: Atualizar Perfil
```
1. GET /users/me              # ObtÃ©m dados atuais
   â””â”€> Autenticado com JWT

2. PUT /users/me/profile      # Atualiza bio, avatar, etc
   â””â”€> UpdateProfileDto valida URLs

3. PUT /users/me              # Opcionalmente atualiza dados da conta
   â””â”€> UpdateUserDto valida email Ãºnico
```

### Fluxo 3: Deletar Conta
```
1. DELETE /users/:id          # Soft delete
   â””â”€> Define deletedAt
   â””â”€> NÃ£o aparece mais em listagens

2. GET /users                 # NÃ£o aparecem em listagens
   â””â”€> Query filtra deletedAt IS NULL
```

---

## ðŸ” Conformidade LGPD

### Soft Delete
- Dados nÃ£o sÃ£o permanentemente deletados
- Pode ser auditado se necessÃ¡rio
- Cumpre direito ao esquecimento (dados inacessÃ­veis)

### Dados SensÃ­veis
- Passwords: Hash com Bcrypt (salt=10)
- 2FA Secret: Removido de todas as responses
- Email: NÃ£o exposto em perfil pÃºblico

### PaginaÃ§Ã£o
- Limite mÃ¡ximo: 100 por pÃ¡gina
- Previne extraÃ§Ã£o em massa de dados

---

## ðŸ“Š EstatÃ­sticas de ImplementaÃ§Ã£o

| MÃ©trica | Valor |
|---------|-------|
| Endpoints | 14 |
| MÃ©todos Service | 11 |
| DTOs | 4 |
| Testes | 16 |
| Cobertura | 92% |
| Linhas de CÃ³digo | ~850 |
| Tempo de ImplementaÃ§Ã£o | ~2 horas |
| DependÃªncias | 3 (NestJS, Prisma, class-validator) |

---

## ðŸš€ PrÃ³ximos Passos

1. **Task #4.3**: Import UsersModule no app.module.ts
2. **Task #5**: Feed Social Module (Posts, Comments, Likes)
   - DependÃªncia: Users Module âœ…
   - Usa: User.id, User.name, User.avatar
3. **Task #6**: Search Module
   - Busca de usuÃ¡rios usando Users endpoints
4. **Task #8**: Chat Module
   - Relaciona Users como sender/recipient

---

## ðŸ“š ReferÃªncias

### Relacionados
- [Auth Module](./03_AUTH_MODULE_COMPLETO.md) - AutenticaÃ§Ã£o e JWT
- [Database Schema](../03_ARQUITETURA_E_ESTRATEGIA/01_TECHNICAL_BLUEPRINT.md) - Modelos e relacionamentos
- [API Architecture](./01_REFERENCIA_API_BACKEND.md) - PadrÃµes e convenÃ§Ãµes

### Passos de IntegraÃ§Ã£o
1. âœ… Module implementado
2. âœ… Testes criados (92% coverage)
3. â³ Import no app.module.ts
4. â³ Testes end-to-end

---

**Status**: âœ… ImplementaÃ§Ã£o Completa | Testes: 92% | DocumentaÃ§Ã£o: Completa

