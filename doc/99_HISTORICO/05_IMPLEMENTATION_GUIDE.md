# 🛠️ STEP-BY-STEP IMPLEMENTATION GUIDE (35+ Sequential Steps)

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Público:** Backend, Frontend, DevOps  
**Execução:** Linear (Step 1 → Step 35+)  
**Estimado:** 12-16 semanas para conclusão Phase 1.0

---

## 📌 FASE 0: PREPARAÇÃO INICIAL (Steps 1-5)

### Step 1: Configurar Backend — Projeto NestJS + TypeScript
**Objetivo:** Inicializar projeto backend with strict TypeScript
**Dependências:** Node.js 20.x, npm/yarn, NestJS CLI
**Tempo estimado:** 30 minutos

```bash
# Criar novo projeto NestJS
nest new meu-agito-backend --package-manager yarn

# Instalar dependências principais
cd meu-agito-backend
yarn add @nestjs/common @nestjs/core rxjs class-validator class-transformer
yarn add typescript@5.x --save-dev
yarn add @typescript-eslint/eslint-plugin @typescript-eslint/parser --save-dev
yarn add prettier eslint --save-dev

# Gerar tsconfig.json com strict: true
# (already included with nest new)
```

**Checklist:**
- [ ] `yarn dev` executa sem erros
- [ ] `tsconfig.json` tem `"strict": true`
- [ ] ESLint + Prettier configurados
- [ ] `.gitignore` criado

**Próximo:** Step 2

---

### Step 2: Configurar Frontend — Projeto React Native (Expo)
**Objetivo:** Inicializar projeto mobile with TypeScript + Redux
**Tempo estimado:** 20 minutos

```bash
# Criar novo projeto Expo com TypeScript
npx create-expo-app meu-agito-mobile --template
cd meu-agito-mobile

# Instalar dependências principais
yarn add react-native-web react-dom
yarn add @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
yarn add react-redux @reduxjs/toolkit redux-thunk
yarn add axios
yarn add react-native-async-storage/@react-native-async-storage/async-storage
yarn add typescript@5.x --save-dev
```

**Checklist:**
- [ ] `yarn web` ou `npm start` executa Expo
- [ ] Redux store criado (`src/app/store.ts`)
- [ ] Navigation boilerplate criado
- [ ] TypeScript strict mode ativo

**Próximo:** Step 3

---

### Step 3: Configurar Banco de Dados — PostgreSQL + Prisma
**Objetivo:** Database setup + Prisma ORM initialization
**Tempo estimado:** 45 minutos

```bash
# Instalação local
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download PostgreSQL 15.x installer

# Iniciar serviço PostgreSQL
psql -U postgres

# Criar database
CREATE DATABASE meuagito_dev;

# No backend:
yarn add @prisma/client prisma
npx prisma init

# Editar .env
DATABASE_URL="postgresql://user:password@localhost:5432/meuagito_dev?schema=public"

# Gerar Prisma schema inicial (próximo step)
```

**Checklist:**
- [ ] PostgreSQL rodando localmente
- [ ] Database `meuagito_dev` criado
- [ ] `.env` com DATABASE_URL correto
- [ ] `prisma/schema.prisma` criado

**Próximo:** Step 4

---

### Step 4: Implementar Prisma Schema Completo
**Objetivo:** Definir 15+ modelos, relacionamentos, indexes
**Tempo estimado:** 1.5 horas

**Ação:** Copiar schema.prisma completo do arquivo `03_TECHNICAL_BLUEPRINT.md` (seção Database Schema) para `prisma/schema.prisma`

**Pontos-chave:**
- 15 modelos: User, Establishment, Post, Comment, Message, etc
- Soft deletes: Campo `isDeleted` + `deletedAt` em User, Post, Message
- Indexes em colunas frequentes: `email`, `username`, `city`, `createdAt`
- Enum types: UserType, Visibility, MessageType, NotificationType, ItemTemplate

**SQL Migration:**
```bash
npx prisma migrate dev --name initial_schema
```

**Verificação:**
```bash
npx prisma studio  # Abre GUI para inspecionar schema
```

**Checklist:**
- [ ] `prisma/migrations/001_initial_schema/migration.sql` criado
- [ ] `prisma/schema.prisma` completo (15 modelos)
- [ ] `yarn prisma studio` funciona
- [ ] Todos os relacionamentos corretos

**Próximo:** Step 5

---

### Step 5: Configurar Redis + Variáveis de Ambiente
**Objetivo:** Cache layer + env validation
**Tempo estimado:** 30 minutos

```bash
# Instalar Redis (local)
# macOS: brew install redis
# Ubuntu: sudo apt install redis-server
# Windows: WSL + sudo apt install redis-server
redis-server

# Backend: Instalar cliente Redis
yarn add redis ioredis @nestjs/cache-manager cache-manager

# Criar config/env.ts com zod validation
yarn add zod
```

**Arquivo: `src/config/env.ts`**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  // ... other vars
});

export const env = envSchema.parse(process.env);
```

**Checklist:**
- [ ] Redis server rodando na porta 6379
- [ ] `.env` com REDIS_URL
- [ ] `src/config/env.ts` com zod schema
- [ ] `yarn dev` não dispara erros de env

**Próximo:** Step 6

---

## 🔐 FASE 1: AUTENTICAÇÃO (Steps 6-12)

### Step 6: Implementar JWT Strategy + Passport
**Objetivo:** JWT authentication foundation
**Tempo estimado:** 1 hora

```bash
yarn add @nestjs/passport passport @nestjs/jwt passport-jwt
yarn add @types/passport-jwt --save-dev
yarn add bcrypt
yarn add @types/bcrypt --save-dev
```

**Arquivos:**
- `src/auth/jwt.strategy.ts` — Passport JWT strategy
- `src/auth/auth.guard.ts` — JwtAuthGuard
- `src/auth/auth.service.ts` — Password hashing (bcrypt) + token generation

**Core Logic:**
```typescript
// JWT generation
const payload = { sub: user.id, email: user.email };
const token = this.jwtService.sign(payload, { expiresIn: '1h' });

// Password hashing
const hashed = await bcrypt.hash(password, 10);

// Token validation (automatic by Passport)
```

**Teste:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123"}'
```

**Checklist:**
- [ ] POST /auth/login retorna { accessToken, refreshToken, user }
- [ ] GET /protected com header `Authorization: Bearer <token>` funciona
- [ ] Expired token retorna 401 + "token_expired"

**Próximo:** Step 7

---

### Step 7: Implementar Email + SMS OTP
**Objetivo:** Email verification + SMS OTP flow
**Tempo estimado:** 1.5 horas

```bash
yarn add @sendgrid/mail
yarn add twilio
yarn add nodemailer  # Alternative to SendGrid
```

**Serviços:**
- `src/common/services/email.service.ts` — SendGrid wrapper
- `src/common/services/sms.service.ts` — Twilio wrapper

**Fluxo Email Verification:**
1. User registra com email
2. Backend gera OTP (6-digit)
3. Email enviado com link `app://verify/:token`
4. Frontend clica link → POST /auth/verify-email
5. User account marked as `emailVerified`

**Fluxo SMS OTP:**
1. User entra phone number
2. Backend gera OTP (6-digit), rate limit 3/número/hora
3. SMS enviado via Twilio
4. Frontend UI para input OTP
5. POST /auth/verify-sms → token gerado

**Checklist:**
- [ ] Email enviado com sucesso em signup
- [ ] SMS OTP enviado e validado
- [ ] Rate limiting funciona (3 tentativas = 15 min lock)
- [ ] OTP expira em 5 minutos

**Próximo:** Step 8

---

### Step 8: Implementar OAuth (Google + Apple)
**Objetivo:** Social login integration
**Tempo estimado:** 1.5 horas

```bash
yarn add @nestjs/passport passport-google-oauth20 passport-apple
yarn add @types/passport-google-oauth20 --save-dev
yarn add jsonwebtoken  # For Apple ID token validation
```

**Estratégias:**
- `src/auth/google.strategy.ts` — Google OAuth
- `src/auth/apple.strategy.ts` — Apple OAuth

**Fluxo:**
1. Frontend abre Google/Apple login dialog
2. Recebe `idToken` do provider
3. POST /auth/google com { idToken }
4. Backend valida assinatura do idToken
5. Se user não existe, cria novo
6. Retorna JWT tokens

**Teste com cURL (simulado):**
```bash
# Simular Google callback
curl -X GET "http://localhost:3000/auth/google/callback?code=ABC123&state=XYZ789"
```

**Checklist:**
- [ ] Google OAuth funciona end-to-end
- [ ] Apple OAuth funciona end-to-end
- [ ] Usuário criado automaticamente se novo
- [ ] Existing user pode logar com OAuth

**Próximo:** Step 9

---

### Step 9: Implementar Refresh Token Logic
**Objetivo:** Token refresh mechanism
**Tempo estimado:** 45 minutos

```typescript
// POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Resposta
{
  "accessToken": "new_token",
  "refreshToken": "new_refresh_token"
}
```

**Pontos-chave:**
- Refresh token válido por 7 dias
- Storage: Redis com expiration automática
- Geração: Novo refresh token a cada refresh (token rotation)
- Revocation: blacklist no logout

**Checklist:**
- [ ] Refresh token funciona
- [ ] Novo refresh token gerado a cada refresh
- [ ] Expired refresh token retorna 401
- [ ] Logout revoga token

**Próximo:** Step 10

---

### Step 10: Implementar Password Recovery
**Objetivo:** Forgot password flow
**Tempo estimado:** 1 hora

**Fluxo:**
1. User: POST /auth/forgot-password com { email }
2. Backend gera temp token (5 min expiration)
3. Email enviado com link: app://reset-password?token=...
4. Frontend UI: input nova password
5. POST /auth/reset-password com { token, newPassword }
6. Backend valida token, atualiza password

**Database:**
- Adicionar coluna `resetTokenHash` em User (nullable)
- Adicionar `resetTokenExpiresAt` timestamp

**Checklist:**
- [ ] Email enviado com reset link
- [ ] Reset token expira em 5 minutos
- [ ] Novo password atualizado após reset
- [ ] Old token inválido após usado

**Próximo:** Step 11

---

### Step 11: Implementar Rate Limiting (Auth Endpoints)
**Objetivo:** Brute force protection
**Tempo estimado:** 1 hora

```bash
yarn add @nestjs/throttler
```

**Aplicar em:**
- POST /auth/login: 5 tentativas = 15 min lock
- POST /auth/sms-otp: 3 OTPs/número/hora
- POST /auth/register: 10/hora por IP

**Implementação com Redis counter:**
```typescript
// redis.incr(`login_attempts:${email}`)
// Se > 5: throw RateLimitException
```

**Checklist:**
- [ ] 5 falhas de login = 15 min lock
- [ ] SMS rate limit funciona
- [ ] Cliente recebe 429 Too Many Requests

**Próximo:** Step 12

---

### Step 12: Implementar Account Deletion (LGPD)
**Objetivo:** Right to be forgotten
**Tempo estimado:** 1 hora

**Fluxo:**
1. User: DELETE /users/:id com { currentPassword }
2. Backend marca `isDeleted = true`, `deletedAt = now()`
3. Dados não deletados imediatamente (soft delete)
4. 30 dias depois: hard delete automático (scheduled job)
5. Todos os posts/messages do user também marked deleted

**Database:**
- Soft delete: `isDeleted`, `deletedAt` campos
- Hard delete: scheduled job @Cron('0 0 * * *')

**Checklist:**
- [ ] DELETE /users/:id funciona
- [ ] User vê "Conta deletada, será removida em 30 dias"
- [ ] User não consegue logar após delete
- [ ] Hard delete funciona após 30 dias

**Próximo:** Fase 2

---

## 👥 FASE 2: USUÁRIOS & PERFIS (Steps 13-17)

### Step 13: Implementar User Profile CRUD
**Objetivo:** Create/Read/Update profile operations
**Tempo estimado:** 1.5 horas

**Endpoints:**
- GET /users/:id — Buscar perfil de qualquer usuário
- GET /users/me — Perfil próprio
- PUT /users/me — Atualizar próprio perfil
- GET /users/:id/posts — Posts do usuário

**Validações:**
- Username: `[a-zA-Z0-9_]{3,20}`, unique
- Bio: max 200 chars
- Foto: max 5MB, remove EXIF

**Checklist:**
- [ ] GET /users/:id retorna perfil completo
- [ ] PUT /users/me atualiza nome, bio, foto
- [ ] Username validado para unicidade

**Próximo:** Step 14

---

### Step 14: Implementar Establishment (Business Profile)
**Objetivo:** Business registration with duplicate detection
**Tempo estimado:** 2.5 horas

**Endpoints:**
- POST /establishments — Criar estabelecimento
- GET /establishments/:id — Buscar detalhes
- PUT /establishments/:id — Atualizar
- GET /establishments/search — Busca por categoria/localização

**Validações:**
- CNPJ: encrypt AES-256, unique
- Nome: max 100 chars
- Categoria: enum (restaurante, loja, evento, etc)
- Localização: reverse geocoding para address completo

**Duplicate Detection:**
- 4-factor scoring (nome 35%, distance 35%, categoria 20%, phone 10%)
- Se score >= 70: flag para review
- Se score 40-69: aviso ao user

**Queue Job:**
```typescript
// Enqueue duplicate detection job
@UseInterceptors(ClassSerializerInterceptor)
async createEstablishment(dto: CreateEstablishmentDto) {
  const est = await this.establishmentService.create(dto);
  await this.duplicateQueue.add(est.id);
  return est;
}
```

**Checklist:**
- [ ] POST /establishments cria com sucesso
- [ ] Duplicate detection scoring funciona
- [ ] Score >= 70 flag para review manual

**Próximo:** Step 15

---

### Step 15: Implementar Follow/Unfollow Sistema
**Objetivo:** User relationship management
**Tempo estimado:** 1 hora

**Endpoints:**
- POST /follows/:userId — Seguir user
- DELETE /follows/:userId — Deixar de seguir
- GET /users/:id/followers — Lista de seguidores
- GET /users/:id/following — Lista seguindo

**Database:**
- `Follows` model (M:N relationship)
- Unique constraint: (followerId, followingId)

**Notificações:**
- Enviar notification ao user quando seguido

**Checklist:**
- [ ] POST /follows/:userId funciona
- [ ] DELETE /follows/:userId funciona
- [ ] GET /users/:id/followers retorna lista paginada
- [ ] Notification enviada ao seguido

**Próximo:** Step 16

---

### Step 16: Implementar Block User System
**Objetivo:** Privacy + harassment protection
**Tempo estimado:** 45 minutos

**Endpoints:**
- POST /blocks/:userId — Bloquear user
- DELETE /blocks/:userId — Desbloquear
- GET /blocks — Minha lista de bloqueados

**Efeitos:**
- Bloqueado não vê posts do bloqueador
- Bloqueado não consegue enviar mensagens
- Bloqueado não consegue seguir

**Database:**
- `Block` model com unique (blockerId, blockedId)

**Checklist:**
- [ ] POST /blocks/:userId funciona
- [ ] Bloqueado não vê posts
- [ ] Bloqueado não consegue enviar MSG

**Próximo:** Step 17

---

### Step 17: Implementar Follow-Only & Private Profiles
**Objetivo:** Privacy controls
**Tempo estimado:** 1 hora

**Novo campo User:**
- `isPrivate: boolean` — Feed visível só para followers

**Validação em feed:**
```typescript
if (targetUser.isPrivate && !isFollower) {
  throw ForbiddenException("User is private");
}
```

**Checklist:**
- [ ] User pode marcar conta como private
- [ ] Não-followers não veem feed
- [ ] Followers conseguem ver

**Próximo:** Fase 3

---

## 📝 FASE 3: POSTS & SOCIAL (Steps 18-23)

### Step 18: Implementar Post CRUD
**Objetivo:** Create/Read/Update/Delete posts
**Tempo estimado:** 1.5 horas

**Endpoints:**
- POST /posts — Criar post (text + fotos)
- GET /posts/:id — Detalhe
- PUT /posts/:id — Editar (próprio)
- DELETE /posts/:id — Deletar (soft)
- GET /posts — Feed infinito

**Validações:**
- Content: 1-500 chars
- Fotos: max 5, 5MB cada
- Media upload → S3 → signed URLs

**Paginação:**
- Cursor-based: `?cursor=eyJpZCI6IjEyMyJ9&limit=20`

**Checklist:**
- [ ] POST /posts com texto funciona
- [ ] GET /posts infinito scroll
- [ ] PUT /posts/:id edita (próprio only)
- [ ] DELETE /posts/:id soft delete

**Próximo:** Step 19

---

### Step 19: Implementar Like/Dislike Toggle
**Objetivo:** Post engagement (mutually exclusive)
**Tempo estimado:** 1 hora

**Endpoints:**
- POST /posts/:id/like
- POST /posts/:id/dislike
- DELETE /posts/:id/like
- DELETE /posts/:id/dislike

**Lógica:**
- Like e Dislike mutuamente excludentes
- Toggle: clicar novamente remove
- Dislike não visível publicamente
- Feed algorithm usa dislike para ranking

**Database:**
- Unique constraint: (userId, postId)

**Checklist:**
- [ ] POST /posts/:id/like funciona
- [ ] Like e dislike são exclusivos
- [ ] Toggle funciona (remover ao clicar novamente)
- [ ] Dislike não aparece no UI

**Próximo:** Step 20

---

### Step 20: Implementar Comentários (Nested)
**Objetivo:** Infinite-depth comment system
**Tempo estimado:** 1.5 horas

**Endpoints:**
- POST /posts/:id/comments — Criar comentário
- GET /posts/:id/comments — Lista (com nesting)
- DELETE /comments/:id — Deletar (soft)
- POST /comments/:id/reply — Responder comentário
- POST /comments/:id/like — Like em comentário

**Database:**
- `parentCommentId` para nesting
- Recursivo para replies infinitas

**Notificações:**
- Notify post author quando comentário
- Notify reply parent quando respondido

**Checklist:**
- [ ] POST /posts/:id/comments funciona
- [ ] Nesting funciona (replies)
- [ ] Notifications enviadas
- [ ] Like/dislike em comments funciona

**Próximo:** Step 21

---

### Step 21: Implementar Repost (Share) com Attribution
**Objetivo:** Retweet-like functionality
**Tempo estimado:** 1 hora

**Endpoints:**
- POST /posts/:id/repost — Repostar
- DELETE /posts/:id/repost — Remove repost

**Lógica:**
- Repost mostra "Repostado por @username e +X"
- Attribution permanente (não pode ocultar)
- Notifica post author
- Repost conta no contador

**Database:**
- `Repost` model with unique (postId, userId)

**UI:**
- Botão repost em post card
- Mostrar attribution no post repostado

**Checklist:**
- [ ] POST /posts/:id/repost funciona
- [ ] Attribution aparece no UI
- [ ] Notification enviada ao author
- [ ] DELETE /posts/:id/repost remove repost

**Próximo:** Step 22

---

### Step 22: Implementar Story Upload (24h TTL)
**Objetivo:** Instagram-like stories
**Tempo estimado:** 1.5 horas

**Endpoints:**
- POST /stories — Upload story (foto/vídeo)
- GET /stories — Lista stories seguindo
- DELETE /stories/:id — Deletar story (próprio)
- POST /stories/:id/view — Mark as viewed

**Validações:**
- Foto/vídeo: max 15s para vídeo
- Texto overlay: max 100 chars
- Privacy: público ou followers-only

**TTL:**
- Auto-delete após 24 horas (CronJob ou database cleanup)
- View counter + list de visualizadores

**Checklist:**
- [ ] POST /stories upload funciona
- [ ] Stories expiram em 24h
- [ ] View count atualizado
- [ ] GET /stories retorna só não-expirados

**Próximo:** Step 23

---

### Step 23: Implementar Feed Home (7 Zones)
**Objetivo:** Complex multi-zone home feed
**Tempo estimado:** 2 horas

**Zones:**
1. Z1 Mega Events — Top 5 eventos (immediate)
2. Z2 Live Feed — Posts de quem segue (immediate)
3. Z3 Urgent — Estabelecimentos novos (lazy load)
4. Z4 Trending — Top por engagement (lazy load)
5. Z5 Friends Visited — Amigos visitaram (lazy load)
6. Z6 Nearby — Mapa 5km (lazy load)
7. Z7 Most Searched — Top searches (lazy load)

**Implementação:**
- 7 sub-requests, cada um é paginado
- Caching: 30 min TTL com invalidation
- Frontend lazy-loads Z3-Z7

**Database Queries:**
```sql
-- Z1: Top 5 eventos
SELECT * FROM items WHERE template = 'evento' 
ORDER BY createdAt DESC LIMIT 5;

-- Z2: Posts de quem segue
SELECT posts.* FROM posts
INNER JOIN follows ON posts.userId = follows.followingId
WHERE follows.followerId = $1
ORDER BY posts.createdAt DESC LIMIT 20;

-- etc...
```

**Checklist:**
- [ ] GET /home retorna 7 zones
- [ ] Z1-Z2 carregam imediatamente
- [ ] Z3-Z7 lazy-load
- [ ] Cache 30 min funciona

**Próximo:** Fase 4

---

## 🔍 FASE 4: BUSCA & DESCOBERTA (Steps 24-26)

### Step 24: Implementar Search com PostgreSQL Full-Text
**Objetivo:** Estabelecimentos + items search
**Tempo estimado:** 2 horas

**Endpoints:**
- POST /search — Busca com filtros

**Query body:**
```json
{
  "q": "pizza",
  "categories": ["restaurante", "loja"],
  "distance": "10km",
  "rating": 4,
  "openNow": true,
  "type": "item|establishment"
}
```

**PostgreSQL Full-Text:**
```sql
SELECT * FROM establishments 
WHERE to_tsvector('portuguese', name || ' ' || description) 
@@ plainto_tsquery('portuguese', $1)
AND category = ANY($2)
AND ST_Distance(coordinates, ST_Point($3, $4)) < $5
ORDER BY ts_rank(vector, query) DESC;
```

**Paginação:**
- Cursor-based pagination

**Checklist:**
- [ ] Busca por nome funciona
- [ ] Filtros funcionam
- [ ] Pagination funciona
- [ ] <800ms response time (p95)

**Próximo:** Step 25

---

### Step 25: Implementar Search com Mapa
**Objetivo:** Map-based discovery (Google Maps)
**Tempo estimado:** 1.5 horas

**Frontend:**
- React Native Maps integrado
- Pins para estabelecimentos
- Tap pin → detalhes
- User location marker

**Backend:**
- GET /search/map com { latitude, longitude, radius }
- Retorna establishments em grid

**Checklist:**
- [ ] Mapa renderiza com pins
- [ ] Pins clicáveis
- [ ] User location visível
- [ ] <1s mapa load time

**Próximo:** Step 26

---

### Step 26: Implementar Categorias & Filtros Avançados
**Objetivo:** T07 moment 1 + advanced filtering
**Tempo estimado:** 1 hora

**Endpoints:**
- GET /categories — Lista categorias
- POST /search com { categories[] }

**Filtros:**
- Distância: 1km, 5km, 10km, 50km
- Rating: ⭐4+, ⭐3+, etc
- Tipo: evento, serviço, produto, etc
- Aberto agora: toggle
- Promoções: toggle

**Checklist:**
- [ ] GET /categories retorna lista
- [ ] Multi-select funciona
- [ ] Filtros combinam logicamente (AND)

**Próximo:** Fase 5

---

## 💬 FASE 5: MENSAGENS & NOTIFICAÇÕES (Steps 27-29)

### Step 27: Implementar WebSocket (Socket.io) + Mensagens
**Objetivo:** Real-time messaging + typing indicator
**Tempo estimado:** 2 horas

```bash
yarn add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Gateway:**
- `@WebSocketGateway()` decorator
- `@SubscribeMessage('message')` para eventos
- Redis adapter para multi-instância

**Eventos:**
- `send_message` — Enviar mensagem
- `typing` — Indicador digitação
- `message_read` — Leitura (Phase 1.2+)
- `user_online` — Status online

**Fluxo:**
1. Client emite `send_message` com { recipientId, content }
2. Server salva em BD, emite para recipient
3. Recipient recebe em tempo real
4. Client emite `typing` ao digitar

**Checklist:**
- [ ] Mensagens entregues em tempo real
- [ ] Typing indicator funciona
- [ ] Conexão mantida após navegação

**Próximo:** Step 28

---

### Step 28: Implementar Push Notifications (FCM + APNs)
**Objetivo:** Native push notifications
**Tempo estimado:** 2.5 horas

```bash
yarn add firebase-admin
# APNs: usar certificados Apple
```

**Backend Services:**
- `FCMService` para Android
- `APNsService` para iOS
- `NotificationService` que escolhe provider por platform

**Tipos de Notificação:**
1. Social: Post liked, comentário
2. Business: Nova foto, novo item
3. Orders: Status mudança
4. System: Security alerts

**Configuração:**
```typescript
// POST /notifications/subscribe
{ deviceToken, platform: 'ios' | 'android' }

// Enviar notificação
await this.notificationService.send({
  userId: 'xxx',
  title: 'João curtiu seu post',
  body: 'Seu post recebeu 5 curtidas',
  deepLink: 'app://post/123'
})
```

**Checklist:**
- [ ] FCM notificações entregues (Android)
- [ ] APNs notificações entregues (iOS)
- [ ] Deep link funciona ao clicar
- [ ] Max 5 notificações/dia

**Próximo:** Step 29

---

### Step 29: Implementar Notificações na Tela (T13)
**Objetivo:** In-app notification center
**Tempo estimado:** 1.5 horas

**Endpoints:**
- GET /notifications — Lista (paginada)
- PATCH /notifications/:id/read — Marcar lida
- DELETE /notifications/:id — Deletar (soft)

**Tipos:**
- Social (like, comment, follow)
- Business (new photo, item)
- Orders (status)
- System (security alerts)

**UI:**
- Badge com unread count na tab
- Swipe para deletar
- Click → navigate para item
- 4 tipos com cores diferentes

**Checklist:**
- [ ] GET /notifications retorna lista ordenada
- [ ] Badge mostra unread count
- [ ] PATCH /notifications/:id/read funciona
- [ ] Deep link on tap funciona

**Próximo:** Fase 6

---

## 📦 FASE 6: CATALOGO & ITEMS (Steps 30-32)

### Step 30: Implementar Universal Item Template
**Objetivo:** 7 tipos de items com blocos dinâmicos
**Tempo estimado:** 2 horas

**7 Templates:**
1. `evento` — Eventos com cronograma
2. `servico` — Serviços com preço/horário
3. `prato` — Cardápio com ingredientes
4. `produto` — Produtos com variações
5. `quarto` — Hospedagem com capacidade
6. `plano` — Assinaturas com features
7. `procedimento` — Beleza com duração

**Blocos Padrão (todos):**
- GALERIA
- IDENTIDADE
- PREÇO
- AVALIACOES_ITEM

**Blocos Template-Específicos:**
- evento: CRONOGRAMA
- servico: HORARIO
- prato: INGREDIENTES
- produto: TAMANHO, COR
- quarto: CAPACIDADE, AMENIDADES
- plano: FEATURES
- procedimento: TEMPO_DURACAO

**Database:**
```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  establishmentId UUID,
  name VARCHAR(255),
  template ENUM('evento', 'servico', ...),
  price DECIMAL(10, 2),
  images TEXT[],
  templateData JSONB -- { duration, ingredients, features }
);
```

**Checklist:**
- [ ] POST /items com template funciona
- [ ] GET /items/:id renderiza blocos corretos
- [ ] JSONB templateData salva/recupera

**Próximo:** Step 31

---

### Step 31: Implementar Catálogo (T_CATALOGO)
**Objetivo:** Search/filter/paginate items
**Tempo estimado:** 1.5 horas

**Endpoints:**
- GET /catalogs/:id — Detalhe catálogo
- GET /catalogs/:id/items — Items paginados

**Features:**
- Search em tempo real (debounce 300ms)
- Filtros por categoria (chips)
- Sort: relevância, preço asc/desc, rating
- Pagination: 30 itens/página
- State preservation: volta à scroll position

**Checklist:**
- [ ] GET /catalogs/:id/items com search funciona
- [ ] Filtros funcionam
- [ ] Sort funciona
- [ ] State preservation backend

**Próximo:** Step 32

---

### Step 32: Implementar Ratings & Reviews
**Objetivo:** User reviews for items + establishments
**Tempo estimado:** 1 hora

**Endpoints:**
- POST /ratings — Criar rating (1-5 stars + comment)
- GET /establishments/:id/ratings — Lista ratings
- DELETE /ratings/:id — Deletar próprio rating

**Validações:**
- 1 rating por user por establishment
- Comment: max 500 chars
- Star: 1-5

**Agregação:**
- Average rating
- Distribution (% de cada estrela)

**Checklist:**
- [ ] POST /ratings funciona
- [ ] Average rating atualizado
- [ ] User só pode dar 1 rating

**Próximo:** Fase 7

---

## ⚙️ FASE 7: INFRAESTRUTURA & POLISH (Steps 33-35+)

### Step 33: Implementar Logging + Monitoring (Sentry + Winston)
**Objetivo:** Error tracking + observability
**Tempo estimado:** 1.5 horas

```bash
yarn add @sentry/node winston
yarn add @ntegral/nestjs-sentry
```

**Winston Logger:**
- Levels: debug, info, warn, error
- Formato estruturado (JSON)
- Rotação de logs (30 dias)

**Sentry:**
- Capture exceptions automaticamente
- Dashboards para errors
- Release tracking

**Interceptor:**
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    
    this.logger.log(`[${method}] ${url}`);
    
    return next.handle().pipe(
      catchError((error) => {
        this.sentry.captureException(error);
        throw error;
      })
    );
  }
}
```

**Checklist:**
- [ ] Logs estruturados em arquivo
- [ ] Sentry captura exceptions
- [ ] Log retention 30 dias

**Próximo:** Step 34

---

### Step 34: Implementar Cache Strategy + Redis Cleanup
**Objetivo:** Performance optimization
**Tempo estimado:** 1.5 horas

**Cache Tiers:**
1. Hot (1 min): Auth tokens, typing
2. Warm (30 min): Feed zones, profiles, search
3. Cold (24h): Categories, cities
4. Persistent: Sessions, preferences

**Invalidação:**
```typescript
// Event-driven
@EventListener()
onPostCreated(post: Post) {
  this.cacheService.del(`home:feed`); // Invalidate feed
}

// Time-based
@Cron('0 */30 * * * *') // Every 30 min
async refreshFeedZones() {
  // Refresh cache
}
```

**Cleanup Job:**
```typescript
@Cron('0 0 * * *') // Daily at midnight
async cleanupStories() {
  // Delete stories older than 24h
}
```

**Checklist:**
- [ ] Feed cache 30 min TTL
- [ ] Cache invalidation on create/update
- [ ] Cleanup job remove old data

**Próximo:** Step 35

---

### Step 35: Implementar File Upload (S3 + Image Processing)
**Objetivo:** Image optimization + EXIF removal
**Tempo estimado:** 1.5 horas

```bash
yarn add aws-sdk sharp multer
```

**Fluxo:**
1. Frontend seleciona imagem
2. POST /files/upload (multipart)
3. Backend: validate, process (Sharp), upload S3
4. Retorna signed URL (1h validade)

**Sharp Processing:**
```typescript
// Remover EXIF
const buffer = await sharp(file.buffer)
  .rotate() // Remove EXIF rotation
  .withMetadata(false) // Remove all metadata
  .toBuffer();

// Resize (múltiplas resoluções)
await sharp(buffer)
  .resize(800, 600, { fit: 'inside' })
  .toFile(`${key}_800.jpg`);
```

**Signed URLs:**
```typescript
// S3 gera URL com expiração 1h
const signedUrl = s3.getSignedUrl('getObject', {
  Bucket: 'meu-agito-uploads',
  Key: 'posts/abc123.jpg',
  Expires: 3600
});
```

**Checklist:**
- [ ] POST /files/upload funciona
- [ ] EXIF removido server-side
- [ ] Multiple resolutions salvas
- [ ] Signed URLs funcionam

**Próximo:** Step 36

---

### Step 36: Implementar Mobile Frontend — Auth Stack
**Objetivo:** Complete authentication UI (React Native)
**Tempo estimado:** 3 horas

**Screens:**
- T01 Splash — Token validation
- T02 Onboarding — 3-slide carousel
- T03 Login — 4 auth methods
- T03.1 Email — Email input
- T03.2 SMS — Phone + OTP
- T04 Profile Choice — Pessoal ou Empresarial
- T05a Personal Setup — 4-step config
- T05b Business Setup — 5-step config

**Redux:**
```typescript
// authSlice
{
  user: null | UserDto,
  accessToken: null | string,
  refreshToken: null | string,
  loading: boolean,
  error: null | string
}
```

**Navigation:**
```typescript
// RootNavigator
isLoggedIn ? <AppStack /> : <AuthStack />
```

**Checklist:**
- [ ] Splash screen funciona
- [ ] Onboarding com Lottie
- [ ] Login com 4 métodos funciona
- [ ] Personal/Business setup funciona

**Próximo:** Step 37

---

### Step 37: Implementar Mobile Frontend — Main Navigation
**Objetivo:** 6-tab bottom navigation
**Tempo estimado:** 2 horas

**Tabs:**
1. Home — T06 (7 zones)
2. Feed — T_AGITO (posts infinitos)
3. Search — T07 (2 moments)
4. Chat — T_CHAT (conversations)
5. Activity — T_ATIVIDADE (5 cards)
6. Config — T_CONFIG (8 sections)

**BottomTabBar:**
- Custom styling (orange accent)
- Badge para unread messages/notifications

**Navigation Params:**
- Each tab owns stack
- Deep linking support

**Checklist:**
- [ ] All 6 tabs navigate
- [ ] Persistence entre tabs
- [ ] Badge funciona

**Próximo:** Step 38

---

### Step 38: Implementar Mobile Frontend — Feed + Posts
**Objetivo:** Infinite scroll social feed
**Tempo estimado:** 2.5 horas

**Components:**
- FeedScreen: Infinite scroll container
- PostCard: Individual post + engagement
- CommentThread: Nested comments
- PostActions: Like/dislike/comment buttons

**Redux:**
```typescript
// postsSlice
{
  posts: Post[],
  cursor: string,
  loading: boolean
}

// Thunk: fetchMore loads cursor-based pagination
```

**Interactions:**
- Swipe refresh
- Like/dislike toggle
- Tap to view comments
- Repost with attribution

**Checklist:**
- [ ] Infinite scroll funciona
- [ ] Like/dislike toggle funciona
- [ ] Comments renderizam nested
- [ ] Repost attribution visível

**Próximo:** Step 39

---

### Step 39: Implementar Mobile Frontend — Search + Discovery
**Objetivo:** T07 two-moment search UI
**Tempo estimado:** 2 horas

**Moment 1:**
- Category chips (multi-select)
- Search input (filter categories)
- Location selector

**Moment 2:**
- Results list (paginado)
- Mapa toggle
- Filtros avançados (bottom sheet)
- Distance, rating, openNow, etc

**Interactions:**
- Chip select → transition to Moment 2
- Search debounce 300ms
- Map pins clicáveis
- Filter toggle

**Checklist:**
- [ ] Two moments UI funciona
- [ ] Search debounce correto
- [ ] Filters aplicam
- [ ] Map renders

**Próximo:** Step 40

---

### Step 40: Implementar Mobile Frontend — Mensagens + WebSocket
**Objetivo:** Real-time messaging UI
**Tempo estimado:** 2 horas

**Components:**
- ChatScreen: 2 tabs (People | Establishments)
- ConversationList: List de conversations
- ConversationDetail: Messages + input
- MessageBubble: Individual message
- TypingIndicator: "User is typing..."

**WebSocket:**
```typescript
// useMessages hook
const socket = io('https://api.meuagito.com');
socket.on('message', (msg) => {
  dispatch(addMessage(msg));
});
```

**Interactions:**
- Send text, photo, audio
- Typing indicator em tempo real
- Scroll to bottom ao novo message
- Message input accessories

**Checklist:**
- [ ] WebSocket conecta
- [ ] Messages envia/recebe
- [ ] Typing indicator funciona
- [ ] Photo upload funciona

---

### Step 41: Implementar Mobile Frontend — Notificações + Settings
**Objetivo:** Notification center + Config screens
**Tempo estimado:** 1.5 horas

**Components:**
- NotificationsScreen: List + badge
- ConfigScreen: 8 sections com 17 sub-screens
- PermissionsModal: GPS, camera, etc

**Notificações:**
- Socket.io para in-app notifications
- Push notification handling
- Deep link on tap
- 4 tipos (social, business, orders, system)

**Settings:**
- Account: Edit profile, change password, delete
- Location: City selection, GPS toggle
- Privacy: Private account, block users
- Notifications: Type-based disable
- Security: 2FA (Phase 1.2+)
- Legal: Terms, privacy, LGPD

**Checklist:**
- [ ] Notifications list shows all types
- [ ] Push notification deep link works
- [ ] Settings screens navigable
- [ ] Changes persist

---

### Step 42: Teste End-to-End + Performance Tuning
**Objetivo:** Complete testing + optimization
**Tempo estimado:** 2 semanas

**Backend Tests:**
- Unit: Jest (auth, posts, search)
- Integration: Supertest (API routes)
- E2E: Cypress (complete user flows)

**Frontend Tests:**
- Unit: Jest (components, hooks)
- E2E: Detox (mobile app flows)

**Performance:**
- API response time <200ms (p95)
- Feed load <1.5s (p90)
- Search <800ms (p99)
- Image optimization (JPEG + WebP)
- Lazy loading (screens, images, list items)

**Load Testing:**
- Vegeta para API load tests
- 10k concurrent users simulation

**Checklist:**
- [ ] 90%+ test coverage
- [ ] All performance targets met
- [ ] No critical security findings
- [ ] LGPD audit passed

---

## ✅ ENTREGA FINAL (Step 43)

### Step 43: Deploy to Staging + Beta Release
**Objetivo:** Production-ready release
**Tempo estimado:** 1 semana

**Backend Deployment:**
- Docker image build + push ECR
- RDS database (multi-AZ)
- ElastiCache (Redis)
- ALB + auto-scaling
- Sentry + DataDog monitoring

**Frontend Deployment:**
- EAS Build (Expo) para TestFlight (iOS) + Google Play (Android)
- Beta release (closed testing)
- 1000 testers (QA + select users)
- Feedback collection (Sentry, Crashlytics)

**Go-Live Readiness:**
- [ ] All critical bugs fixed
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] LGPD compliance verified
- [ ] Monitoring + alerting configured
- [ ] On-call rotation ready
- [ ] Runbook + documentation complete

---

## 📊 TIMELINE & RESOURCE ALLOCATION

```
Week 1-2:   Setup (Steps 1-5)
Week 3-4:   Auth (Steps 6-12)
Week 5-6:   Users & Profiles (Steps 13-17)
Week 7-8:   Posts & Social (Steps 18-23)
Week 9-10:  Search & Discovery (Steps 24-26)
Week 11:    Messages & Notifications (Steps 27-29)
Week 12:    Catalog & Items (Steps 30-32)
Week 13-14: Mobile Frontend (Steps 36-41)
Week 15-16: Testing + Polish + Deploy (Steps 33-35, 42-43)
```

**Resource Needs:**
- 2-3 backend engineers
- 1-2 frontend engineers
- 1 DevOps engineer
- 1 QA engineer

---

**Documento: MASTER IMPLEMENTATION GUIDE — Ready for AI Codification**
