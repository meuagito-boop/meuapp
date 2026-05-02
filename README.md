# Meu Agito

Atualizado em: 2026-04-30
Status do projeto: baseline tecnica local forte; deploy AWS real e smoke mobile manual ainda pendentes.

## 1. Visao geral

Meu Agito e um aplicativo mobile-first para descoberta local, feed social, eventos, estabelecimentos, vitrine/catalogo, chat e notificacoes, com foco inicial em Guarulhos.

O produto combina:

- descoberta de lugares e eventos por contexto local;
- feed social com posts, comentarios e curtidas;
- perfis de usuarios e estabelecimentos;
- catalogo/vitrine publica de estabelecimentos;
- chat em tempo real;
- notificacoes in-app e push;
- arquitetura preparada para AWS.

O MVP atual segue a decisao de conta simples:

- `USER`: usuario final;
- `ESTABLISHMENT`: conta de estabelecimento, dona da propria pagina.

Nao existe, no modelo atual, estrutura de `OWNER` / `ADMIN` / `EDITOR` por estabelecimento. O dono da conta `ESTABLISHMENT` gerencia a propria pagina, midia e vitrine.

## 2. Fontes de verdade

Para entender o projeto hoje, use esta ordem:

1. `README.md` da raiz: mapa geral do projeto.
2. `.codex/PROJECT_CONTEXT.md`: visao de produto e diretrizes.
3. `doc/README.md`: entrada da documentacao canonica.
4. `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md`: estado validado mais recente.
5. `doc/00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md`: caminho ate release.
6. `doc/04_BACKEND/01_REFERENCIA_API_BACKEND.md`: rotas reais do backend.
7. `doc/aws doc/*.md`: arquitetura AWS alvo.

Regra importante: `doc/99_HISTORICO/` guarda material antigo e nao deve guiar decisao atual sem revalidar no codigo.

## 3. Estrutura do repositorio

```text
.
|-- backend/                    # API NestJS, Prisma, PostgreSQL, Redis, Socket.IO
|-- frontend/                   # App React Native / Expo
|-- doc/                        # Documentacao canonica e historica
|-- doc/aws doc/                # Planos AWS e PDFs de referencia
|-- .codex/                     # Diretrizes locais, prompts e skills do projeto
|-- docker-compose.yml          # PostgreSQL, Postgres de teste, Redis, backend e pgAdmin
|-- STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md
|-- AUDITORIA_PROMPT_AWS_2026-04-26.md
|-- AUDITORIA_ARQUITETURA_MEU_AGITO_2026-04-25.md
`-- README.md
```

## 4. Stack principal

| Area | Tecnologia |
|---|---|
| Mobile | React Native, Expo, TypeScript |
| Navegacao | React Navigation |
| Estado mobile | Zustand, TanStack Query |
| HTTP mobile | Axios com interceptors e refresh token |
| Storage mobile | Expo SecureStore para tokens |
| Backend | NestJS, TypeScript |
| Banco | PostgreSQL via Prisma |
| Cache/rate limit/realtime | Redis ou Valkey |
| Tempo real | Socket.IO |
| Midia | MediaService com storage local dev ou S3 |
| CDN alvo | CloudFront |
| E-mail alvo | Amazon SES |
| Push alvo | AWS SNS Mobile Push |
| Observabilidade alvo | CloudWatch, CloudTrail, X-Ray opcional |
| Deploy alvo | ECS Fargate, ECR, RDS PostgreSQL, ElastiCache |

## 5. Arquitetura resumida

```text
App Expo
  |-- Auth, onboarding, feed, busca, chat, notificacoes, catalogo
  |-- ApiClient com Bearer token + refresh automatico
  |-- Socket.IO client no namespace /chat
  |
Backend NestJS
  |-- Controllers REST
  |-- Services de dominio
  |-- Guards JWT e ownership
  |-- ValidationPipe global
  |-- Exception filter global
  |-- Logs estruturados com requestId/correlationId
  |
PostgreSQL
  |-- Usuarios, posts, comentarios, likes, eventos, estabelecimentos,
      produtos, conversas, mensagens, notificacoes, push tokens,
      midias, audit logs e refresh tokens
  |
Redis/Valkey
  |-- Cache
  |-- Rate limit distribuido
  |-- Socket.IO adapter
  |
AWS alvo
  |-- ECS/Fargate + ALB + RDS + ElastiCache + S3 + CloudFront + SES + SNS
```

## 6. Backend desenvolvido

O backend fica em `backend/` e usa NestJS com Prisma.

### Base de runtime

Ja existe no codigo:

- bootstrap NestJS com `helmet`;
- CORS configuravel por `CORS_ORIGIN`;
- `trust proxy` configuravel para ambiente atras de ALB/proxy;
- `ValidationPipe` global com whitelist e bloqueio de campos extras;
- filtro global de excecao;
- interceptor de logging HTTP;
- request id e correlation id por requisicao;
- Swagger em `/api/docs` quando habilitado;
- health check em `/health`;
- validacao de ambiente em `backend/src/config/env.validation.ts`;
- Redis obrigatorio em producao para cache, throttling e Socket.IO distribuido;
- Dockerfile e `.dockerignore` no backend;
- scripts de build, teste, migrate e deploy prepare.

### Modulos principais

| Modulo | O que cobre |
|---|---|
| `auth` | signup, login, refresh, logout, reset de senha, verificacao de e-mail, 2FA TOTP |
| `users` | perfil, perfil publico, seguidores, seguindo, stats, avatar e soft delete |
| `feed` | posts, midia de post, feed principal, explore, comentarios, curtidas e `GET /feed/agito` |
| `search` | busca global, posts, usuarios, eventos, estabelecimentos, autocomplete e trending |
| `events` | CRUD de eventos, presenca, reviews, midia e busca com distancia |
| `establishments` | pagina de estabelecimento owner-only, listagem, favoritos, reviews e midia |
| `products` | vitrine publica de estabelecimento, detalhe de produto e imagem principal |
| `media` | upload generico, upload por entidade, midia publica e midia protegida |
| `chat` | conversas, mensagens, anexos, leitura, edicao, delete, arquivamento e Socket.IO |
| `notifications` | notificacoes in-app, contagem, leitura, exclusao, push tokens e push test |
| `legal` | politica de privacidade e termos de uso em HTML/JSON |
| `health` | status de app, banco e cache |

### API REST

A referencia canonica esta em `doc/04_BACKEND/01_REFERENCIA_API_BACKEND.md`.

Resumo por area:

| Area | Cobertura atual |
|---|---|
| Health | `GET /health` |
| Legal | politica e termos publicos |
| Media | upload, listagem por entidade, midia protegida e fallback local |
| Auth | 13 endpoints |
| Users | 15 endpoints |
| Feed/posts | 19 endpoints |
| Search | 7 endpoints |
| Events | 10 endpoints |
| Establishments | 11 endpoints |
| Products | 6 endpoints |
| Chat REST | 11 endpoints |
| Notifications | 9 endpoints |
| WebSocket | namespace `/chat` |

### Dados e Prisma

O schema principal fica em `backend/prisma/schema.prisma`.

Modelos principais ja implementados:

- `User`
- `UserLocation`
- `Follow`
- `Post`
- `Comment`
- `Like`
- `CommentLike`
- `Story`
- `Conversation`
- `Message`
- `Notification`
- `PushToken`
- `NotificationDelivery`
- `Media`
- `Establishment`
- `Product`
- `Event`
- `Review`
- `RefreshToken`
- `AuditLog`

Migrations presentes:

- `20260403050906_`
- `20260425103000_add_media_model`
- `20260426020000_remove_user_is_admin`
- `20260426103000_establishment_members_products_and_admin`
- `20260426170000_account_type_alignment`
- `20260426174500_push_tokens_and_notification_delivery`

Mesmo havendo migration historica com nome de members/admin, o schema atual esta alinhado ao modelo owner-only e nao expoe `EstablishmentMember` como entidade atual.

### Auth e seguranca

Ja desenvolvido:

- JWT access token;
- refresh token persistido com hash/token unico;
- logout invalidando refresh tokens;
- senha com bcrypt;
- reset de senha por token;
- verificacao de e-mail por token;
- 2FA TOTP com QR Code;
- desafio real de 2FA no login;
- guards JWT;
- checagens de ownership em recursos sensiveis;
- rate limit global com Redis em producao;
- validacao de DTOs;
- logs sem dump intencional de token/segredo;
- `AuditLog` para acoes criticas com contexto HTTP.

### Midia e storage

Ja desenvolvido:

- `MediaService`;
- `StorageService`;
- provider local para dev;
- provider S3 para ambiente alvo;
- URLs publicas e rota protegida para midia privada;
- suporte a entidade `AVATAR`, `POST`, `CHAT_ATTACHMENT`, `ESTABLISHMENT`, `EVENT` e `PRODUCT`;
- validacao de MIME/tamanho;
- checagem de ownership antes de upload sensivel;
- CloudFront opcional por `CLOUDFRONT_BASE_URL`.

### Redis, cache e realtime

Ja desenvolvido:

- `CacheService` com Redis e fallback em memoria apenas para dev/test;
- cache/invalidation para feed e usuarios;
- `RedisThrottlerStorage` para rate limit distribuido;
- `RedisIoAdapter` para Socket.IO;
- presenca online/offline em rooms por usuario;
- producao falha se Redis for exigido e nao estiver disponivel.

### E-mail, push e notificacoes

Ja desenvolvido:

- `EmailService` com Amazon SES como provider alvo;
- templates/fluxos para verificacao, reset, boas-vindas e notificacao;
- `NotificationService` com AWS SNS Mobile Push como provider alvo;
- registro e remocao de push tokens;
- `NotificationDelivery` para status de entrega;
- desativacao de token invalido;
- notificacoes in-app com `entityType`, `entityId`, `payload`, `readAt`;
- emissao realtime de notificacao via Socket.IO.

## 7. Frontend mobile desenvolvido

O frontend fica em `frontend/` e usa Expo/React Native com TypeScript.

### Base do app

Ja existe no codigo:

- bootstrap com Expo Splash Screen;
- `NavigationContainer`;
- `RootNavigator` separando auth flow e app autenticado;
- TanStack Query provider;
- Zustand stores;
- `ApiClient` com Axios, Bearer token, refresh automatico e SecureStore;
- resolucao de API por `EXPO_PUBLIC_API_URL`; em dev ha fallback local, em release a env e obrigatoria;
- registro de push token apos login/onboarding somente quando `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true`;
- `WebPreviewNavigator` para preview web de telas.

### Telas de autenticacao

Ja existem:

- `SplashScreen`
- `OnboardingScreen`
- `LoginScreen`
- `SignUpScreen`
- `ForgotPasswordScreen`
- `TwoFactorLoginScreen`
- `VerifyEmailScreen`
- `ProfileSelectionScreen`
- `PersonalSetupScreen`
- `BusinessSetupScreen`

O onboarding respeita o tipo `USER` ou `ESTABLISHMENT`. A conta de estabelecimento passa pelo setup empresarial e cria uma pagina real de estabelecimento no backend.

### Telas principais

Tabs principais:

- Home
- Feed
- Buscar
- Atividade
- Mapa
- Chat
- Perfil
- Config

Telas adicionais:

- Notificacoes
- Catalogo
- Item
- Favoritos de atividade
- Historico de atividade
- Minha conta
- Cidade
- Privacidade
- Seguranca
- Excluir conta
- telas auxiliares de configuracao

### Servicos mobile

Ja existem services para:

- Auth
- User
- Feed
- Chat
- Location
- Search
- Notifications
- Catalog
- Push registration
- Socket.IO
- Legal links

### Estado mobile

Stores principais:

- `authStore`
- `chatStore`
- `feedStore`
- `locationStore`
- `userStore`

### Design system

Tokens principais:

- tema dark;
- cor primaria `#E8640A`;
- background principal `#0D0D0D`;
- escala de espacamento;
- escala de fontes;
- tamanhos de componentes;
- tokens de estado: success, warning, error, info.

## 8. Fluxos ponta a ponta ja ligados

### Cadastro, login e onboarding

1. App abre no fluxo auth.
2. Usuario cadastra com dados obrigatorios e `profileType`.
3. Backend cria `User`, gera tokens e dispara e-mail quando habilitado.
4. App salva tokens no SecureStore.
5. Usuario completa setup pessoal ou empresarial.
6. Conta `ESTABLISHMENT` cria pagina real de estabelecimento.
7. App so entra na area principal quando autenticado e sem onboarding pendente.

### Login com 2FA

1. Usuario informa e-mail/senha.
2. Backend detecta conta com 2FA.
3. App navega para `TwoFactorLoginScreen`.
4. Usuario envia codigo TOTP.
5. Backend valida e retorna tokens definitivos.

### Feed social

1. `FeedSocialScreen` consome `FeedService`.
2. Service chama `GET /feed/agito`.
3. Backend entrega cursor pagination e modos `mixed`, `following`, `global`, `nearby`.
4. Posts exigem midia real no fluxo principal.
5. Likes, comentarios e invalidacao de cache estao implementados.

### Discovery, busca e mapa

1. App captura localizacao via Expo Location.
2. Home, busca e mapa usam services de API.
3. Backend calcula `distanceKm`.
4. Eventos e estabelecimentos podem ser ordenados por distancia.
5. Estabelecimentos suportam `category`, `subcategory` e `openNow`.

### Estabelecimento, catalogo e item

1. Conta `ESTABLISHMENT` cria a propria pagina.
2. Backend bloqueia mais de uma pagina ativa por dono.
3. Perfil publico carrega estabelecimento real.
4. Catalogo carrega produtos reais via `/establishments/:id/products`.
5. Item carrega produto real via `/products/:id`.
6. Upload de logo/capa/galeria/produto passa pela camada de media.

### Eventos

1. Eventos podem ser criados por usuario autenticado.
2. Listagem publica suporta filtros e distancia.
3. Detalhe de evento permite confirmar/cancelar presenca.
4. Reviews de evento estao implementadas.

### Chat realtime

1. App usa REST para criar/listar conversas e mensagens.
2. Socket.IO conecta no namespace `/chat` com token.
3. Eventos suportados incluem join/leave, envio, typing, leitura, edicao e delete.
4. Redis adapter prepara o runtime para multiplas instancias.

### Notificacoes e push

1. App solicita permissao de notificacao apos login/onboarding somente se `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true`.
2. App captura token nativo via `expo-notifications`.
3. App registra token em `POST /notifications/push-tokens`.
4. Backend persiste `PushToken`.
5. Notificacoes in-app podem ser listadas, lidas e deletadas.
6. Push real usa SNS quando `PUSH_PROVIDER=sns`.

## 9. Infra local

`docker-compose.yml` contem:

- `postgres`: banco local em `localhost:5434`;
- `postgres-test`: banco de teste em `localhost:5433`;
- `redis`: cache local em `localhost:6379`;
- `backend`: backend NestJS em `localhost:3001`;
- `pgadmin`: interface em `localhost:5050`.

Subir ambiente local completo:

```bash
docker compose up -d postgres postgres-test redis backend
```

Health check:

```bash
curl http://localhost:3001/health
```

Swagger local:

```text
http://localhost:3001/api/docs
```

## 10. Como rodar o backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:prod
npm run start:dev
```

Scripts principais:

| Script | Uso |
|---|---|
| `npm run build` | compila NestJS |
| `npm run start:dev` | sobe API em watch mode |
| `npm run start:prod` | roda `dist/main` |
| `npm run start:prod:migrate` | aplica migrations e roda prod |
| `npm run deploy:prepare` | generate + migrate deploy + build |
| `npm run lint` | ESLint com fix |
| `npm test` | testes unitarios |
| `npm run test:e2e` | e2e via `backend/scripts/run-e2e.js` |
| `npm run prisma:generate` | gera Prisma Client |
| `npm run prisma:migrate` | migration dev |
| `npm run prisma:migrate:prod` | migration deploy |
| `npm run prisma:seed` | seed |
| `npm run prisma:studio` | Prisma Studio |

## 11. Como rodar o frontend

```bash
cd frontend
npm install
npm start
```

Scripts principais:

| Script | Uso |
|---|---|
| `npm start` | Expo start |
| `npm run android` | roda Android via script local |
| `npm run android:setup` | bootstrap de SDK/JDK/local.properties no Windows |
| `npm run start:android:usb` | dev Android USB |
| `npm run start:android:usb:clear` | dev Android USB limpando cache |
| `npm run ios` | Expo iOS |
| `npm run web` | Expo web |
| `npm test` | Jest |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com fix |

Variavel principal do app:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Se `EXPO_PUBLIC_API_URL` nao estiver definida, o app usa fallback local em dev e `https://api.meuagito.com` em build nao-dev.

## 12. Variaveis de ambiente

Use `backend/.env.example` e `backend/.env.test.example` como base.

### Backend core

| Variavel | Quando | Observacao |
|---|---|---|
| `DATABASE_URL` | sempre | PostgreSQL |
| `JWT_SECRET` | sempre | access token |
| `REFRESH_TOKEN_SECRET` | sempre | refresh token |
| `PORT` | producao | porta do container/host |
| `NODE_ENV` | sempre | `development`, `test` ou `production` |
| `CORS_ORIGIN` | producao | nao pode ser `*` |
| `TRUST_PROXY` | deploy com proxy/ALB | controle de IP/origem |

### Integracoes

| Area | Variaveis principais |
|---|---|
| Redis | `ENABLE_REDIS`, `REDIS_URL` |
| Rate limit | `RATE_LIMIT_TTL_MS`, `RATE_LIMIT_LIMIT`, `RATE_LIMIT_BLOCK_MS` |
| Storage S3 | `STORAGE_PROVIDER=s3`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |
| CloudFront | `USE_CLOUDFRONT`, `CLOUDFRONT_BASE_URL` |
| SES | `ENABLE_EMAIL`, `EMAIL_PROVIDER=ses`, `AWS_SES_REGION`, `AWS_SES_FROM_EMAIL` |
| SNS | `PUSH_PROVIDER=sns`, `AWS_SNS_REGION`, ARNs de platform application |
| Mobile API/push | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION`, `EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID`, `EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_IOS` |
| Observabilidade | `APP_NAME`, `LOG_LEVEL`, `AWS_CLOUDWATCH_*`, `AWS_XRAY_*`, `SENTRY_*` |

## 13. Testes e validacao registrada

Validacao registrada em `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md`:

- backend `npm run lint`: OK;
- backend `npm run build`: OK;
- backend `npm test -- --runInBand`: OK, 14 suites / 157 testes;
- backend `npm run test:e2e`: OK, 2 suites / 2 testes;
- frontend `npx tsc --noEmit`: OK;
- frontend `npm run lint`: OK;
- Docker local com postgres, postgres-test, redis e backend: OK;
- `GET /health` local: OK.

Observacao: este README documenta a validacao registrada. Ao alterar codigo, rode novamente as validacoes relevantes.

## 14. Arquitetura AWS alvo

A decisao atual e AWS-first.

Servicos alvo:

- ECS Fargate para backend NestJS;
- ECR para imagem Docker;
- RDS PostgreSQL para banco;
- ElastiCache Redis/Valkey para cache, rate limit e Socket.IO adapter;
- S3 para midia;
- CloudFront para CDN;
- Application Load Balancer para HTTPS e WebSocket;
- ACM para certificados;
- SES para e-mail transacional;
- SNS Mobile Push para push notifications;
- Secrets Manager ou SSM Parameter Store para segredos;
- CloudWatch para logs e metricas;
- CloudTrail para auditoria AWS;
- X-Ray quando aplicavel;
- CloudFormation como direcao de IaC.

Documentos principais:

- `doc/aws doc/AWS_TARGET_ARCHITECTURE.md`
- `doc/aws doc/AWS_NETWORK_PLAN.md`
- `doc/aws doc/AWS_SECURITY_PLAN.md`
- `doc/aws doc/AWS_DATABASE_PLAN.md`
- `doc/aws doc/AWS_STORAGE_PLAN.md`
- `doc/aws doc/AWS_BACKEND_DEPLOY_PLAN.md`
- `doc/aws doc/AWS_OBSERVABILITY_PLAN.md`
- `doc/aws doc/AWS_OBSERVABILITY_RUNBOOK.md`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md`

## 15. O que ja esta forte

- Backend modular e bem separado por dominio.
- Prisma/PostgreSQL com modelos principais do MVP.
- Auth com JWT, refresh token e 2FA.
- Modelo `USER` / `ESTABLISHMENT` alinhado.
- Estabelecimento owner-only implementado.
- Feed social real com endpoint dedicado.
- Discovery com distancia real e filtro `openNow`.
- Produtos/vitrine publica ligados ao backend.
- Media service com S3/CloudFront como alvo.
- Chat REST + Socket.IO com Redis adapter.
- Notificacoes in-app e push token integrados.
- SES/SNS preparados como providers AWS.
- AuditLog e logs estruturados.
- Docker Compose local funcional.
- Baseline de lint/build/test documentada como aprovada.

## 16. Pendencias reais

O projeto ainda nao deve ser marcado como pronto para deploy publico real.

Pendencias abertas:

- aplicar observabilidade AWS na conta alvo;
- validar AWS real ponta a ponta;
- aplicar migrations no banco alvo;
- validar SES com identidade/remetente reais;
- validar SNS/APNs/FCM com credenciais reais;
- validar runtime com Redis externo do ambiente alvo;
- executar smoke manual mobile em dispositivo/emulador para auth, feed, busca, perfil, notificacoes e chat;
- revisar telas auxiliares de configuracao e fluxos fora do MVP que ainda podem ter comportamento parcial/estatico;
- revalidar build de imagem customizada do backend em host/runner com memoria estavel.

## 17. Leitura rapida por objetivo

| Se voce quer entender... | Leia |
|---|---|
| Estado atual do projeto | `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md` |
| Proximos passos | `doc/00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md` |
| Produto e MVP | `doc/01_PRODUTO/` |
| Telas e UX | `doc/02_UX_FLUXOS/` |
| Arquitetura tecnica | `doc/03_ARQUITETURA_E_ESTRATEGIA/` |
| API backend | `doc/04_BACKEND/01_REFERENCIA_API_BACKEND.md` |
| Socket.IO | `doc/05_REALTIME_SOCKET/` |
| Legal/LGPD | `doc/06_LEGAL/` |
| Deploy AWS | `doc/aws doc/` |

## 18. Conclusao objetiva

O Meu Agito ja tem um core tecnico relevante implementado: backend NestJS com auth, social, discovery, estabelecimentos, produtos, chat, notificacoes, media, Redis, SES/SNS e preparacao AWS; frontend Expo com fluxos reais de auth, onboarding, feed, busca, perfil, catalogo, item, chat, notificacoes e push.

O que falta nao e recomecar o produto. O proximo passo tecnico e fechar ambiente real: AWS, observabilidade, credenciais finais, migrations no banco alvo e smoke mobile/manual de release.
