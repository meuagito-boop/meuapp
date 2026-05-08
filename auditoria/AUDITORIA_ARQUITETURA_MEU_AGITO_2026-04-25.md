# Auditoria Arquitetural - Meu Agito (Codigo Real)

Data: 2026-04-25
Escopo: backend + frontend, com base no codigo atual no repositorio.

## Evidencias principais inspecionadas
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/package.json`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260403050906_/migration.sql`
- `backend/prisma/seed.ts`
- `backend/src/common/prisma/prisma.service.ts`
- `backend/src/common/cache/cache.service.ts`
- `backend/src/common/email/email.service.ts`
- `backend/src/common/notification/notification.service.ts`
- `backend/src/modules/auth/*`
- `backend/src/modules/users/*`
- `backend/src/modules/feed/*`
- `backend/src/modules/search/*`
- `backend/src/modules/events/*`
- `backend/src/modules/establishments/*`
- `backend/src/modules/chat/*`
- `backend/src/modules/notifications/*`
- `backend/src/modules/health/*`
- `backend/src/modules/legal/*`
- `backend/Dockerfile`
- `docker-compose.yml`
- `frontend/package.json`
- `frontend/app.json`
- `frontend/src/services/api/*`
- `frontend/src/services/socket/SocketIOManager.ts`
- `frontend/src/services/legal/LegalLinks.ts`
- `frontend/src/stores/*`
- `frontend/src/screens/main/*`
- `frontend/src/utils/runtimeApiUrl.ts`

## Validacoes executadas nesta analise
- `npm --prefix backend run build` -> sucesso.
- `npm --prefix backend run test -- --runInBand` -> 7 suites, 126 testes, todos passando.

---

## 1) Stack principal

| Item | Status | Evidencia no codigo | Pronto para deploy? | Ajustes necessarios |
|---|---|---|---|---|
| NestJS no backend | EXISTE | `backend/package.json`, `backend/src/main.ts`, `backend/src/app.module.ts` | Sim, base pronta | Versionamento de API e hardening de producao |
| Prisma | EXISTE | `backend/prisma/schema.prisma`, `backend/src/common/prisma/prisma.service.ts` | Sim | Validacao de env obrigatoria no startup |
| PostgreSQL | EXISTE | `backend/prisma/schema.prisma` (provider postgresql), `DATABASE_URL` | Sim | Planejar pool/connection strategy para escala |
| React Native/Expo no frontend | EXISTE | `frontend/package.json`, `frontend/app.json` | Parcial (MVP) | Fechar gaps de telas mock e fluxos sem backend real |
| Socket.IO | EXISTE | `backend/src/modules/chat/chat.gateway.ts`, `frontend/src/services/socket/SocketIOManager.ts` | Sim para 1 instancia | Redis adapter para multi-instancia |
| JWT/Refresh Token | EXISTE MAS PRECISA MUDAR | `backend/src/modules/auth/auth.service.ts`, `strategies/*.ts`, `RefreshToken` model | Parcial | Claims/roles no JWT e estrategia de permissoes |
| Docker Compose local | EXISTE | `docker-compose.yml` | Nao e deploy final | Usar servicos externos no ambiente online |
| Migrations Prisma | EXISTE | `backend/prisma/migrations/*`, script `prisma:migrate:prod` | Sim | Garantir pipeline com migrate antes de start |
| Health check | EXISTE | `backend/src/modules/health/*` (`GET /health`) | Sim | Incluir checks adicionais (Redis, fila, storage) |
| Swagger/API docs | EXISTE | `backend/src/main.ts` (`/api/docs`) | Sim | Controle por ambiente em producao |

---

## 2) Banco de dados / Prisma

### 2.1 Estado geral
- `schema.prisma`: EXISTE e consistente com PostgreSQL (`backend/prisma/schema.prisma`).
- migrations: EXISTE (`backend/prisma/migrations/20260403050906_/migration.sql`).
- seed: EXISTE (`backend/prisma/seed.ts`), nao obrigatorio para subir.
- `PrismaService`: EXISTE (`backend/src/common/prisma/prisma.service.ts`), conecta no boot.
- `DATABASE_URL`: EXISTE no fluxo (`backend/src/common/prisma/prisma.service.ts`, `.env.example`).

SUPOSIÇÃO: sem `DATABASE_URL` valido, o backend nao sobe funcionalmente porque `PrismaService` conecta no `onModuleInit`.

### 2.2 Modelos solicitados

| Modelo | Status | Campos principais observados | Suficiencia para Meu Agito | O que falta |
|---|---|---|---|---|
| User | EXISTE MAS PRECISA MUDAR | `email`, `username`, `password`, `avatar`, `profileType`, `latitude/longitude`, `isAdmin`, `emailVerified`, `twoFactorEnabled` | Boa base | Claims de role no JWT; separar papel global de permissoes por recurso |
| UserLocation | EXISTE PARCIALMENTE | `userId`, `latitude`, `longitude`, `cityName`, `isPrimary` | Estrutura existe | NÃO ENCONTRADO NO CÓDIGO uso de `prisma.userLocation` nos modulos |
| Follow | EXISTE | `followerId`, `followingId`, unique composto | Suficiente MVP | Sugestoes/recomendacao e anti-spam follow |
| Post | EXISTE MAS PRECISA MUDAR | `content`, `imageUrls[]`, `latitude/longitude`, contadores | Boa base | Backend nao expoe fluxo real de upload/imagem no create/update DTO |
| Comment | EXISTE | `postId`, `authorId`, `content` | Suficiente MVP | Moderacao e anti-spam |
| Like | EXISTE | `postId`, `userId`, unique | Suficiente MVP | Contadores atomicos/filas para alto volume |
| Story | EXISTE PARCIALMENTE | `imageUrl`, `expiresAt`, `viewsCount` | Nao suficiente | NÃO ENCONTRADO NO CÓDIGO modulo/rotas de story |
| Conversation | EXISTE | relacao participantes, `archivedBy`, `messages` | Suficiente MVP | Melhorias para grupos e escala multi-instancia |
| Message | EXISTE MAS PRECISA MUDAR | `content`, `fileUrl`, `fileType`, `readBy`, `editedAt`, `deletedAt` | Suficiente MVP | Anexo em data URI; falta storage externo |
| Notification | EXISTE PARCIALMENTE | `userId`, `type`, `title`, `body`, `relatedUserId`, `relatedPostId`, `isRead` | Parcial | Falta payload generico para evento/estabelecimento/chat |
| Establishment | EXISTE PARCIALMENTE | `name`, `description`, `category`, `address`, `phone`, `website`, `latitude/longitude`, `ownerId`, `isVerified` | Parcial | Falta membro/equipe, horario, midia, subcategoria |
| Event | EXISTE PARCIALMENTE | `name`, `description`, `date`, `startTime/endTime`, `latitude/longitude`, `category`, `organizerId` | Parcial | Falta midia real, regras de moderacao e geosearch robusta |
| Review | EXISTE | `authorId`, `rating`, `content`, `eventId/establishmentId` | Suficiente MVP | Politica de elegibilidade (ex.: quem participou) |
| RefreshToken | EXISTE | `token` unique, `expiresAt`, `revokedAt`, `userId` | Suficiente | Revogacao global/dispositivo com mais metadados |
| AuditLog | EXISTE PARCIALMENTE | `action`, `entity`, `entityId`, `changes` | Estrutura existe | NÃO ENCONTRADO NO CÓDIGO uso ativo de escrita no fluxo |
| Product/CatalogItem | NÃO EXISTE | NÃO ENCONTRADO NO CÓDIGO | Insuficiente | Criar modelos de vitrine publica |
| EstablishmentMember/Owner | EXISTE PARCIALMENTE | owner existe via `ownerId` em `Establishment` | Parcial | Falta tabela de membros/permissoes por estabelecimento |
| PushToken | NÃO EXISTE | NÃO ENCONTRADO NO CÓDIGO em Prisma | Insuficiente para push real | Criar modelo de token por device/plataforma |
| Media/File/Upload | NÃO EXISTE | NÃO ENCONTRADO NO CÓDIGO como modelo dedicado | Insuficiente | Criar modelo de midia e metadados |
| NotificationDelivery | NÃO EXISTE | NÃO ENCONTRADO NO CÓDIGO | Insuficiente para rastrear push/email | Criar tracking de entrega/falha |

Evidencias: `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260403050906_/migration.sql`.

---

## 3) Midia / Storage

### Onde salva hoje
- Avatar de usuario: data URI base64 no campo `avatar`.
  - Evidencia: `backend/src/modules/users/users.controller.ts` (`avatarDataUri = data:...base64...`).
- Anexos do chat: data URI base64 no campo `fileUrl`.
  - Evidencia: `backend/src/modules/chat/chat.controller.ts`.
- Imagem de post/stories/eventos/estabelecimentos:
  - `Post.imageUrls` existe no schema, mas create/update DTO de post nao recebem imagem.
  - Story existe no schema, porem NÃO ENCONTRADO NO CÓDIGO modulo/rotas.
  - Event e Establishment nao possuem pipeline real de upload de imagem.

### Classificacao de storage atual
- Base64 no PostgreSQL: EXISTE (avatar/chat).
- Arquivos locais: NÃO ENCONTRADO NO CÓDIGO.
- Supabase Storage: NÃO ENCONTRADO NO CÓDIGO.
- S3/R2/outro object storage: NÃO ENCONTRADO NO CÓDIGO.
- Apenas URL: EXISTE PARCIALMENTE (campos string podem guardar URL, sem provider dedicado).

### Respostas objetivas
- Existe modulo Media? NÃO EXISTE.
- Existe integracao com storage externo? NÃO EXISTE.
- Existe campo url/storagePath/mimeType/size/provider padrao? EXISTE PARCIALMENTE (chat tem `fileUrl`/`fileType`; sem padrao global).
- Existe risco de crescimento do banco? EXISTE MAS PRECISA MUDAR (alto risco por base64).
- O que precisa mudar? mover midia para object storage e guardar somente metadados + URL no banco.

Evidencias: `backend/src/modules/users/users.controller.ts`, `backend/src/modules/chat/chat.controller.ts`, `backend/prisma/schema.prisma`, `backend/src/modules/feed/dtos/create-post.dto.ts`, `backend/src/modules/feed/dtos/update-post.dto.ts`.

---

## 4) Estabelecimentos / paginas publicas

### O que existe
- Criacao/edicao/listagem/detalhes/delecao: EXISTE.
  - `backend/src/modules/establishments/establishments.controller.ts`
- Localizacao lat/lng + endereco + categoria + telefone: EXISTE.
  - DTOs `create-establishment.dto.ts`, `list-establishments-query.dto.ts`
- Favoritos e reviews: EXISTE.
  - rotas `:id/favorite`, `:id/reviews`
- Status de verificacao em schema (`isVerified`): EXISTE.
  - `backend/prisma/schema.prisma`
- Relacao User -> Establishment owner (`ownerId`): EXISTE.
  - `backend/prisma/schema.prisma`

### O que esta incompleto
- Website existe no schema, mas DTOs de create/update nao incluem website: EXISTE PARCIALMENTE.
- Subcategoria: NÃO EXISTE.
- WhatsApp dedicado: NÃO EXISTE.
- Horario de funcionamento: NÃO EXISTE.
- Fotos/capa/logo estruturadas: NÃO EXISTE.
- EstablishmentMember/Owner por equipe: EXISTE PARCIALMENTE (so owner unico).
- Permissoes avancadas por estabelecimento: EXISTE PARCIALMENTE (apenas check de owner no service).

Evidencias: `backend/src/modules/establishments/*`, `backend/prisma/schema.prisma`.

---

## 5) Produtos / vitrine publica

- Product: NÃO EXISTE.
- CatalogItem: NÃO EXISTE.
- ProductImage: NÃO EXISTE.
- ProductCategory: NÃO EXISTE.
- Rota publica de produtos por estabelecimento: NÃO EXISTE.
- Vinculo produto <-> estabelecimento: NÃO EXISTE.
- Status `ACTIVE/INACTIVE/OUT_OF_STOCK`: NÃO EXISTE.
- Campos `name/description/price/imageUrl`: NÃO EXISTE como modulo backend.

Frontend:
- Existe tela de catalogo com dados mock locais: `frontend/src/screens/main/CatalogScreen.tsx`.
- Classificacao: EXISTE PARCIALMENTE (UI local), sem backend real.

Evidencias: `backend/prisma/schema.prisma`, `backend/src/modules/*`, `frontend/src/screens/main/CatalogScreen.tsx`.

---

## 6) Eventos

### Estado
- Criacao/edicao/listagem/detalhes/delecao: EXISTE.
- Participacao/presenca (`attend`, `cancel`, `attendees`): EXISTE.
- Avaliacoes (`reviews`): EXISTE.
- Localizacao (lat/lng) e data/hora: EXISTE.
- Dono/criador (`organizerId`) e permissoes de edicao/delecao: EXISTE.
- Busca por proximidade: EXISTE PARCIALMENTE (bounding-box simples).
- Imagens de eventos: EXISTE PARCIALMENTE (campo consumido no frontend, pipeline backend nao encontrado).

### Suficiencia para app de descoberta local
- Classificacao geral: EXISTE PARCIALMENTE.
- Bom para MVP.
- Para escala/fidelidade: falta geosearch robusta por distancia real, storage de imagem e filtros mais ricos.

Evidencias: `backend/src/modules/events/*`, `backend/src/modules/search/search.service.ts`, `frontend/src/services/api/LocationService.ts`.

---

## 7) Geo / localizacao / discovery

### O que existe
- Latitude/longitude em User, Event, Establishment, Post: EXISTE.
  - `backend/prisma/schema.prisma`
- Busca por proximidade: EXISTE PARCIALMENTE (calculo por delta de lat/lng em services).
  - `events.service.ts`, `establishments.service.ts`, `search.service.ts`
- Filtro por categoria: EXISTE (events/establishments search).
- Busca textual por nome/categoria: EXISTE.
  - `search.service.ts`
- Indices de lat/lng: EXISTE.
  - migration SQL e schema indices.

### O que falta
- Ordenacao por distancia real: NÃO EXISTE.
- Filtro "aberto agora": NÃO EXISTE.
- Modulo discovery/geo dedicado: EXISTE PARCIALMENTE (usa `SearchModule`, sem modulo geo especializado).
- PostGIS: NÃO EXISTE.
- Uso ativo de `UserLocation`: NÃO ENCONTRADO NO CÓDIGO.
- Indice de categoria para Event em migration atual: NÃO ENCONTRADO NO CÓDIGO da migration aplicada.

### Para escala
- Classificacao: EXISTE MAS PRECISA MUDAR.
- Recomendado: PostGIS + GiST + ordenacao por distancia + filtros compostos.

Evidencias: `backend/src/modules/search/search.service.ts`, `backend/src/modules/events/events.service.ts`, `backend/src/modules/establishments/establishments.service.ts`, `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260403050906_/migration.sql`.

---

## 8) Feed / rede social

### Cobertura funcional
- Posts: EXISTE.
- Comentarios: EXISTE.
- Curtidas: EXISTE.
- Seguidores: EXISTE.
- Feed de seguindo (personalizado): EXISTE.
- Feed global/explore: EXISTE.
- Feed local/proximo: NÃO EXISTE.
- Stories: EXISTE PARCIALMENTE (modelo existe, API/servico nao encontrados).
- Midia em posts: EXISTE PARCIALMENTE (schema suporta, DTO/servico nao implementam fluxo completo).

### Paginacao/cache/indices
- Paginacao: offset (`page/limit`), NAO cursor.
- Limite por pagina: EXISTE.
- Cache: EXISTE (CacheService em feed/users).
- Invalida cache: EXISTE PARCIALMENTE.
  - Problema: `cacheService.del('post:${postId}:comments:*')` usa wildcard em `del`, enquanto wildcard foi implementado em `delMany`.
- Indices base para feed: EXISTE (`Post_authorId_idx`, `Post_createdAt_idx`, `Post_isPublic_idx`).

### Risco de query pesada / N+1
- N+1 grave: NÃO ENCONTRADO NO CÓDIGO nas principais queries do feed (usa include/_count).
- Risco de escala: EXISTE MAS PRECISA MUDAR por offset pagination, agregacoes e invalidacao parcial.

### Pronto para escala?
- Feed atual: EXISTE MAS PRECISA MUDAR.
- Usa Redis? EXISTE PARCIALMENTE (opcional com fallback).
- Paginacao correta para escala? NÃO (offset para alto volume nao e ideal).

Evidencias: `backend/src/modules/feed/*`, `backend/src/common/cache/cache.service.ts`, `backend/prisma/migrations/20260403050906_/migration.sql`, `frontend/src/services/api/FeedService.ts`, `frontend/src/stores/feedStore.ts`, `frontend/src/screens/main/FeedSocialScreen.tsx`.

---

## 9) Chat / Socket.IO / tempo real

### Estado atual
- `ChatGateway`: EXISTE.
- `ChatService`: EXISTE.
- Conversas e mensagens persistidas no banco: EXISTE.
- Anexos: EXISTE PARCIALMENTE (chat aceita arquivo, salva data URI).
- Eventos Socket.IO principais: EXISTE (`message:*`, `typing:*`, `conversation:*`, `user:online/offline`).
- Typing: EXISTE.
- Online/offline: EXISTE PARCIALMENTE (estado em memoria `Map`).
- Namespace `/chat`: EXISTE.
- Autenticacao no socket via JWT handshake: EXISTE.
- Redis adapter para Socket.IO: NÃO EXISTE.
- Suporte multi-instancia realtime: NÃO EXISTE.

### O que persiste vs memoria
- Persistido no banco: conversations, messages, readBy, arquivo em `fileUrl`.
- Em memoria: mapa de sockets conectados por usuario (`userSockets`).

### Pronto para escalar?
- Classificacao: EXISTE PARCIALMENTE.
- Bom para instancia unica.
- Para escala horizontal: precisa Redis adapter + estrategia de presenca distribuida.

Evidencias: `backend/src/modules/chat/chat.gateway.ts`, `backend/src/modules/chat/chat.service.ts`, `backend/src/modules/chat/chat.controller.ts`, `frontend/src/services/socket/SocketIOManager.ts`.

---

## 10) Redis / Cache

### Estado atual
- `CacheService`: EXISTE.
- `ENABLE_REDIS`: EXISTE.
- `REDIS_URL`: EXISTE.
- Fallback memoria: EXISTE.

### Uso real encontrado
- Feed cache: EXISTE (`feed.service.ts`).
- Users/profile/stats cache: EXISTE (`users.service.ts`).
- Rate limit com Redis store: NÃO ENCONTRADO NO CÓDIGO.
- Sessao/refresh token em Redis: NÃO ENCONTRADO NO CÓDIGO.
- Socket.IO adapter Redis: NÃO ENCONTRADO NO CÓDIGO.
- Filas: NÃO ENCONTRADO NO CÓDIGO.

### Redis e obrigatorio hoje?
- NÃO. Classificacao: EXISTE MAS OPCIONAL (com fallback memoria).

### Onde deveria ser usado para escalar
- Socket.IO adapter.
- Store de rate limit distribuido.
- Cache de discovery e consultas pesadas.
- Opcionalmente fila/eventos assinc.

Evidencias: `backend/src/common/cache/cache.service.ts`, `backend/src/app.module.ts`, `backend/src/modules/feed/feed.service.ts`, `backend/src/modules/users/users.service.ts`.

---

## 11) Push notifications

### Estado atual
- Firebase Admin/FCM service: EXISTE (`common/notification`).
- `FIREBASE_ENABLED`: EXISTE.
- `firebase-service-account` por path/base64/key: EXISTE.
- `google-services.json` no frontend: EXISTE (`frontend/google-services.json`, `frontend/android/app/google-services.json`).

### Lacunas
- PushToken model: NÃO EXISTE.
- NotificationDelivery model: NÃO EXISTE.
- Endpoints para registrar/remover token: NÃO ENCONTRADO NO CÓDIGO.
- Endpoint de teste push: NÃO ENCONTRADO NO CÓDIGO.
- Integracao `expo-notifications` no app: NÃO ENCONTRADO NO CÓDIGO.
- Uso efetivo de `NotificationService` nos modulos de dominio: NÃO ENCONTRADO NO CÓDIGO.

### Funcional ponta a ponta
- Classificacao: EXISTE PARCIALMENTE.
- Infra basica de Firebase existe, fluxo end-to-end nao.

Evidencias: `backend/src/common/notification/notification.service.ts`, `backend/src/common/notification/notification.module.ts`, `frontend/app.json`, `frontend/package.json`, busca em `frontend/src`.

---

## 12) Notificacoes in-app

### Estado atual
- `Notification` model: EXISTE.
- Listar notificacoes: EXISTE.
- Contar nao lidas: EXISTE.
- Marcar como lida: EXISTE.
- Marcar todas: EXISTE.
- Deletar: EXISTE.

### Lacunas
- Emissao automatica para likes/comentarios/follows/eventos/chat: EXISTE PARCIALMENTE (praticamente so boas-vindas no signup).
- Emissao por Socket.IO em fluxo de notificacoes: EXISTE PARCIALMENTE (gateway tem helper `notifyUser`, mas fluxo integrado nao encontrado).
- Tipos e payload:
  - `type` string livre existe.
  - `payload/dataJson` generico: NÃO EXISTE.
  - vinculos adicionais alem de `relatedUserId` e `relatedPostId`: NÃO EXISTE.

### Suficiencia para social/chat/eventos/estabelecimentos
- Classificacao: EXISTE PARCIALMENTE.

Evidencias: `backend/prisma/schema.prisma` (model Notification), `backend/src/modules/notifications/*`, `backend/src/modules/auth/auth.service.ts`, `backend/src/modules/chat/chat.gateway.ts`.

---

## 13) E-mail / Resend / Auth

### Estado atual
- Resend no `EmailService`: EXISTE.
- Verificacao de email: EXISTE.
- Reset de senha: EXISTE.
- Reenvio de verificacao: EXISTE.
- Templates: EXISTE (HTML inline).
- Tratamento de erro: EXISTE PARCIALMENTE.

### Comportamento sem e-mail
- Cadastro/login sem email configurado: EXISTE (funciona, com `verificationEmailSent=false`).
- Reset e reenvio sem email: EXISTE MAS PRECISA MUDAR (podem retornar erro 500).

### Producao / env obrigatorias
- Validacao forte de env no startup: NÃO EXISTE.
- Dependencia de dominio verificado Resend: SUPOSIÇÃO (fora do codigo; exigencia do provedor).

### Pronto para email real
- Classificacao: EXISTE PARCIALMENTE.

Evidencias: `backend/src/common/email/email.service.ts`, `backend/src/modules/auth/auth.service.ts`, `backend/src/modules/auth/auth.controller.ts`.

---

## 14) Auth / Conta

### Estado atual
- Usuario unico por email/username: EXISTE.
- Refresh token persistido em DB: EXISTE.
- 2FA: EXISTE (TOTP + QR + backup codes).
- Roles globais: EXISTE PARCIALMENTE (`isAdmin` em schema).
- Usuario comum pode criar estabelecimento: EXISTE (endpoint autenticado, sem role especial).

### Lacunas
- Separacao role global x permissao por estabelecimento: NÃO EXISTE.
- Uso real de `isAdmin` no request auth:
  - `users.controller.ts` checa `req.user.isAdmin`.
  - `jwt.strategy.ts` retorna apenas `{ id }`.
  - Resultado: check admin nao funciona como esperado.

### Classificacao
- EXISTE MAS PRECISA MUDAR.

Evidencias: `backend/prisma/schema.prisma`, `backend/src/modules/auth/strategies/jwt.strategy.ts`, `backend/src/modules/users/users.controller.ts`, `backend/src/modules/auth/auth.service.ts`.

---

## 15) Permissoes

### O que existe
- Guards JWT em rotas privadas: EXISTE.
- Ownership checks em feed/chat/events/establishments: EXISTE.
- Admin flag no schema: EXISTE.

### O que falta
- RBAC/ABAC consistente: NÃO EXISTE.
- Permissoes por estabelecimento (membro, editor, manager): NÃO EXISTE.
- Admin efetivo via JWT atual: EXISTE PARCIALMENTE (bug de claim/strategy).

### Classificacao
- EXISTE PARCIALMENTE.

Evidencias: `backend/src/modules/*/*.controller.ts`, `backend/src/modules/*/*.service.ts`, `backend/src/modules/auth/strategies/jwt.strategy.ts`, `backend/prisma/schema.prisma`.

---

## 16) API publica

### Estrutura atual
- Rotas publicas existem (ex.: `GET /posts/explore`, `GET /events`, `GET /establishments`, `GET /users/:id/public-profile`).
- Rotas autenticadas existem (`@UseGuards(JwtAuthGuard)`).
- Rotas administrativas dedicadas: NÃO ENCONTRADO NO CÓDIGO como namespace/modulo.
- Rotas publicas para leitura de paginas/eventos: EXISTE.
- Rotas de criacao/edicao de paginas/eventos: EXISTE (autenticado + ownership).

### Classificacao
- EXISTE PARCIALMENTE.

### Precisa reorganizar?
- Recomendado: separar explicitamente `/public`, `/me`, `/admin`, e permissoes por recurso para facilitar escala e governanca.

Evidencias: `backend/src/modules/users/users.controller.ts`, `backend/src/modules/feed/feed.controller.ts`, `backend/src/modules/events/events.controller.ts`, `backend/src/modules/establishments/establishments.controller.ts`, `backend/src/modules/search/search.controller.ts`.

---

## 17) Seguranca / producao

### O que existe
- CORS: EXISTE (`main.ts`).
- Helmet: EXISTE (`main.ts`).
- ValidationPipe global (whitelist/forbid/transform): EXISTE (`main.ts`).
- Rate limit baseline (Throttler): EXISTE (`app.module.ts`).
- Upload validation mime/tamanho no avatar/chat: EXISTE.

### O que falta
- Validacao central de env obrigatoria no startup: NÃO EXISTE.
- `trust proxy`: NÃO ENCONTRADO NO CÓDIGO.
- Logs estruturados (pino/winston) e observabilidade: NÃO ENCONTRADO NO CÓDIGO.
- Tratamento global de erros padronizado (exception filter): NÃO ENCONTRADO NO CÓDIGO.
- Protecao anti-spam/brute-force focada em auth (alem de throttle global): EXISTE PARCIALMENTE.
- HTTPS obrigatorio no host: SUPOSIÇÃO (depende do provedor, nao do codigo).

### Critico antes de deploy
- P0: env validation, estrategia de segredo, CORS de producao correto, storage de midia fora do DB.

Evidencias: `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/modules/users/users.controller.ts`, `backend/src/modules/chat/chat.controller.ts`.

---

## 18) Deploy

### Estado tecnico
- Scripts build/start/prod: EXISTE (`backend/package.json`).
- Prisma generate script: EXISTE.
- Prisma migrate deploy script: EXISTE.
- Dockerfile backend: EXISTE.
- Docker Compose local com postgres/redis/backend: EXISTE.
- Porta via `process.env.PORT`: EXISTE.
- Health check endpoint: EXISTE (`/health`).

### Compatibilidade (estado atual)
- Railway: EXISTE (SUPOSIÇÃO de deploy, nao executado nesta analise).
- Render: EXISTE (SUPOSIÇÃO de deploy, nao executado nesta analise).
- Supabase PostgreSQL: EXISTE (via `DATABASE_URL`, SUPOSIÇÃO de conexao).
- Redis externo: EXISTE (via `REDIS_URL`).
- Storage externo: EXISTE PARCIALMENTE (nao implementado no codigo, requer novo modulo).

### App pronto para deploy?
- Backend para ambiente de teste controlado: EXISTE PARCIALMENTE.
- Projeto completo para crescimento forte: EXISTE MAS PRECISA MUDAR.

Evidencias: `backend/package.json`, `backend/Dockerfile`, `docker-compose.yml`, `backend/src/main.ts`, `backend/src/modules/health/*`, `backend/src/common/cache/cache.service.ts`.

---

## 19) Escala futura

| Area | Classificacao |
|---|---|
| Muitos usuarios | aceitavel para MVP |
| Feed pesado | precisa mudar agora |
| Muitas imagens | precisa mudar agora |
| Chat em tempo real | aceitavel para MVP (1 instancia) |
| Muitos estabelecimentos | aceitavel para MVP |
| Muitos eventos | aceitavel para MVP |
| Busca por proximidade | precisa mudar agora |
| Notificacoes push | precisa mudar agora |
| API publica estavel | aceitavel para MVP |

Justificativa resumida:
- Feed e geodiscovery ainda usam estrategia simples (offset + bounding-box).
- Midia em base64 no banco e gargalo claro de crescimento.
- Realtime sem adapter distribuido limita horizontal scaling.
- Push ainda nao esta fechado ponta a ponta.

---

## 20) Tabela final obrigatoria

| Item | Status | Evidencia no codigo | Problema | Recomendacao | Prioridade |
|---|---|---|---|---|---|
| PostgreSQL/Prisma | EXISTE MAS PRECISA MUDAR | `backend/prisma/schema.prisma`, `backend/src/common/prisma/prisma.service.ts`, `backend/prisma/migrations/*` | Sem validacao forte de env; estrategia de conexao para escala ainda basica | Validar env no startup + pipeline de migrate/generate + revisar strategy de conexao para producao | P0 |
| Storage de midia | EXISTE MAS PRECISA MUDAR | `backend/src/modules/users/users.controller.ts`, `backend/src/modules/chat/chat.controller.ts` | Avatar/anexo em base64 no DB | Migrar para S3/R2/Supabase Storage e manter so URL/metadados | P0 |
| Establishment | EXISTE PARCIALMENTE | `backend/src/modules/establishments/*`, `backend/prisma/schema.prisma` | Falta horario, midia, subcategoria, website nos DTOs | Evoluir modelo + DTOs + endpoints publicos completos | P1 |
| EstablishmentMember/Owner | EXISTE PARCIALMENTE | `backend/prisma/schema.prisma` (`ownerId`) | So owner unico, sem membros/permissoes por pagina | Criar `EstablishmentMember` com papeis (`OWNER`, `ADMIN`, `EDITOR`) | P0 |
| Produtos/vitrine publica | NÃO EXISTE | NÃO ENCONTRADO NO CÓDIGO backend; `frontend/src/screens/main/CatalogScreen.tsx` com mock | Sem backend de catalogo | Criar modelos Product/CatalogItem + rotas publicas + integracao frontend | P1 |
| Geo/Discovery | EXISTE MAS PRECISA MUDAR | `backend/src/modules/search/search.service.ts`, `events.service.ts`, `establishments.service.ts` | Bounding-box simples, sem distancia real/PostGIS/open-now | Adotar PostGIS + ordenacao por distancia + filtros compostos | P1 |
| Feed | EXISTE MAS PRECISA MUDAR | `backend/src/modules/feed/*`, `backend/src/common/cache/cache.service.ts`, `frontend/src/services/api/FeedService.ts` | Offset pagination; stories incompleto; invalidacao parcial; mismatch de midia | Cursor pagination, completar stories/media, corrigir invalidacao e observabilidade | P1 |
| Chat/Socket.IO | EXISTE PARCIALMENTE | `backend/src/modules/chat/*`, `frontend/src/services/socket/SocketIOManager.ts` | Presenca em memoria; sem redis adapter; anexo em base64 | Redis adapter + presenca distribuida + storage externo para anexos | P1 |
| Redis | EXISTE PARCIALMENTE | `backend/src/common/cache/cache.service.ts`, `backend/src/modules/feed/feed.service.ts`, `users.service.ts` | Uso restrito a cache; sem throttle store/socket adapter | Manter opcional no MVP e ampliar uso para escala distribuida | P2 |
| Push | EXISTE PARCIALMENTE | `backend/src/common/notification/notification.service.ts`, `frontend/app.json` | Sem PushToken/Delivery/endpoints/app token flow | Criar fluxo completo de registro/envio/rastreamento | P1 |
| Notificacoes in-app | EXISTE PARCIALMENTE | `backend/src/modules/notifications/*`, `backend/prisma/schema.prisma` | Pouco automatismo de eventos e payload limitado | Expandir tipos/eventos + payload generico + emissao realtime consistente | P1 |
| E-mail/Resend | EXISTE PARCIALMENTE | `backend/src/common/email/email.service.ts`, `backend/src/modules/auth/auth.service.ts` | Fluxos de reset/reenvio falham sem email; erro 500 generico | Melhorar degradacao/erros e hardening de configuracao de envio | P1 |
| Auth/Conta | EXISTE MAS PRECISA MUDAR | `backend/src/modules/auth/*`, `backend/prisma/schema.prisma`, `backend/src/modules/users/users.controller.ts` | Claim admin nao chega no req.user; sem permissoes por recurso | Ajustar JWT strategy/claims e modelo de autorizacao | P0 |
| Permissoes | EXISTE PARCIALMENTE | `backend/src/modules/*` (ownership checks), `jwt-auth.guard.ts` | Nao ha RBAC/ABAC completo | Implementar camada de autorizacao por recurso/acao | P0 |
| Seguranca | EXISTE MAS PRECISA MUDAR | `backend/src/main.ts`, `backend/src/app.module.ts` | Sem env schema, sem trust proxy, logs/erros globais limitados | Validacao de env, logging estruturado, filtros globais e hardening auth | P0 |
| Deploy | EXISTE PARCIALMENTE | `backend/package.json`, `backend/Dockerfile`, `docker-compose.yml`, `/health` | Pronto para teste, nao fechado para escala alta | Definir pipeline CI/CD com migrate, secrets e observabilidade | P1 |

---

## Conclusao executiva

- O projeto tem base solida de MVP em backend (auth, social, chat, eventos, estabelecimentos, busca).
- O maior gargalo estrutural hoje e midia/storage + autorizacao por recurso + push end-to-end + vitrine de produtos inexistente.
- Para "crescer grande", os pontos P0 precisam ser fechados antes de ampliar base real de usuarios.
- Para "teste real controlado", o projeto esta em estado EXISTE PARCIALMENTE: funcional no nucleo, mas com lacunas claras que podem afetar confiabilidade e evolucao.

---

## Atualizacao complementar - 2026-04-29 (America/Sao_Paulo)

Esta auditoria arquitetural refletia corretamente o estado de 25/04/2026, mas parte das lacunas listadas acima deixou de valer apos a rodada AWS-first registrada em 26/04/2026 e revalidada depois.

### Pontos desta auditoria que ficaram superados por implementacao posterior

- `Product` e vitrine publica deixaram de ser inexistentes no backend
- `PushToken` e `NotificationDelivery` deixaram de ser inexistentes no schema/runtime
- SES deixou de ser apenas direcao e passou a existir no codigo
- Redis deixou de ser apenas cache opcional e passou a sustentar throttling distribuido e adapter Socket.IO no runtime produtivo
- `distanceKm`, `openNow` e ordenacao por distancia foram fechados no backend de discovery
- `AuditLog` deixou de ser apenas estrutura no schema e passou a ter escrita real

### Pontos desta auditoria que continuam uteis

- ela continua valida como fotografia da virada entre o baseline antigo e a direcao AWS-first
- ela continua util para mostrar porque storage, autorizacao, realtime distribuido e deploy eram os gargalos centrais naquele momento

### Pontos que continuam abertos mesmo apos a rodada posterior

- observabilidade AWS aplicada na conta real
- validacao mobile/manual ponta a ponta
- deploy AWS real com migrations, SES e SNS validados em ambiente final

### Observacao de governanca

Para decisao tecnica atual, esta auditoria deve ser lida junto com:
- `AUDITORIA_PROMPT_AWS_2026-04-26.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`
- documentacao canonica atual em `doc/`

## Atualizacao complementar - 2026-04-29 (America/Sao_Paulo) - Docker local

Esta auditoria antiga apontava Docker/Compose como existente mas ainda pouco validado para ciclo real. Nesta rodada foi possivel fechar melhor essa leitura sem apagar o contexto historico.

### Confirmacoes novas

- o Compose local atual sobe `postgres`, `postgres-test` e `redis` com healthcheck verde
- o banco principal Docker aceita e aplica o conjunto atual de 6 migrations Prisma
- o banco de teste Docker volta a existir em `localhost:5433`, eliminando a lacuna anterior de indisponibilidade

### Ajuste de interpretacao necessario

- a existencia dos artefatos Docker no repositorio continua verdadeira
- o que ainda nao ficou plenamente aprovado e a validacao do build da imagem do backend no host atual
- a falha observada no build nao mostrou erro de codigo do app; mostrou quebra do builder/host por pressao de memoria

### Conclusao complementar

- para leitura arquitetural atual, Docker local deve ser interpretado como `EXISTE E ESTA ALINHADO ESTRUTURALMENTE`, mas `AINDA DEPENDE DE HOST SAUDAVEL` para build completo da imagem

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - Docker local fechado

- `postgres`, `postgres-test`, `redis` e `backend` ficaram `healthy` no Compose local
- o backend respondeu `GET /health` em `localhost:3001`
- o `npm run test:e2e` voltou a passar
- a leitura arquitetural correta agora e: Docker local esta operacional para desenvolvimento; a unica pendencia relacionada a containerizacao ficou no build da imagem customizada em host/runner mais estavel

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - fechamento funcional adicional

- o frontend de evento deixou de depender apenas de card generico e passou a consumir detalhe real
- o frontend de auth passou a completar o desafio de 2FA ja suportado no backend
- a tela de 2FA em configuracoes passou a falar com os endpoints reais
- o endpoint de stats do usuario deixou de manter contadores falsos de posts/likes

Leitura arquitetural atualizada:

- os gaps remanescentes de producao ficaram menos ligados a "funcionalidade ausente no core" e mais ligados a "operacao e release real"
- a arquitetura ainda nao deve ser considerada totalmente pronta para deploy publico sem:
  - observabilidade AWS real
  - validacao de credenciais/provedores finais
  - smoke mobile/manual
  - fechamento das telas auxiliares que continuam fora do MVP principal
