# Auditoria e Alinhamento AWS do Meu Agito

Data: 2026-04-26
Branch analisada: `chore/reorganizacao-baseline`

## Objetivo

Auditar o estado real do projeto Meu Agito contra o prompt `.codex/PROMPT_melhorias_objetivas.md`, a diretriz `.codex/melhorias_objetivas.md` e a documentação AWS disponível no repositório antes de mudanças estruturais para deploy em AWS.

## Escopo analisado

- `.codex/AGENTS.md`
- `.codex/PERFIL.MD`
- `.codex/PROJECT_CONTEXT.md`
- `.codex/PROMPT_melhorias_objetivas.md`
- `.codex/melhorias_objetivas.md`
- `.codex/skills/*.md`
- `doc/aws doc/*.md`
- `backend/**`
- `frontend/**`
- `backend/prisma/schema.prisma`
- `docker-compose.yml`
- `backend/Dockerfile`
- `README.md`

## Estado Git e worktree

### Git status

- Branch atual: `chore/reorganizacao-baseline`
- Worktree principal: `F:/Bruno/Projetos/meu-agito`
- Há grande volume de arquivos modificados, adicionados, deletados e não rastreados.
- Há recovery artifacts em `.codex/recovery/**`.
- Há stashes antigos:
  - `stash@{0}: On master: pre-reorg-leftovers-20260420-233250`
  - `stash@{1}: On master: pre-reorg-20260420-233204`

### Risco operacional

- O repositório está em estado de reorganização ativa.
- Há risco real de misturar código atual com histórico intermediário.
- Não é seguro executar limpeza destrutiva sem decisão explícita posterior.

## Documentação analisada

### Fontes principais

- `.codex/PROMPT_melhorias_objetivas.md`
- `.codex/melhorias_objetivas.md`
- `doc/aws doc/AWS_LOCAL_SETUP.md`
- `doc/aws doc/AWS_TARGET_ARCHITECTURE.md`
- `doc/aws doc/AWS_COST_CONTROL_PLAN.md`
- `doc/aws doc/AWS_NETWORK_PLAN.md`
- `doc/aws doc/AWS_SECURITY_PLAN.md`
- `doc/aws doc/AWS_DATABASE_PLAN.md`
- `doc/aws doc/AWS_STORAGE_PLAN.md`
- `doc/aws doc/AWS_BACKEND_DEPLOY_PLAN.md`
- `doc/aws doc/AWS_OBSERVABILITY_PLAN.md`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md`

### Inconsistências documentais

1. O prompt cita `docs/aws/*.md`, mas o repositório usa `doc/aws doc/*.md`.
2. `AWS_TARGET_ARCHITECTURE.md` ainda cita:
   - `Firebase Cloud Messaging` como push principal
   - `Resend ou AWS SES` como e-mail alvo
   - `Sentry` como parte principal de observabilidade
3. O prompt e `melhorias_objetivas.md` já definem outra decisão:
   - `AWS SNS Mobile Push` como camada principal de push
   - `Amazon SES` como provider alvo
   - `CloudWatch/CloudTrail/X-Ray` como eixo principal, com Sentry não obrigatório

## Arquivos analisados

### Backend

- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/config/env.validation.ts`
- `backend/src/common/cache/cache.service.ts`
- `backend/src/common/email/email.service.ts`
- `backend/src/common/notification/notification.service.ts`
- `backend/src/common/observability/sentry.bootstrap.ts`
- `backend/src/modules/auth/**`
- `backend/src/modules/chat/**`
- `backend/src/modules/establishments/**`
- `backend/src/modules/events/**`
- `backend/src/modules/feed/**`
- `backend/src/modules/health/**`
- `backend/src/modules/media/**`
- `backend/src/modules/notifications/**`
- `backend/src/modules/products/**`
- `backend/src/modules/search/**`
- `backend/src/modules/users/**`
- `backend/prisma/schema.prisma`
- `backend/Dockerfile`

### Frontend

- `frontend/src/App.tsx`
- `frontend/src/screens/main/HomeScreen.tsx`
- `frontend/src/screens/main/FeedSocialScreen.tsx`
- `frontend/src/screens/main/ProfileScreen.tsx`
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx`
- `frontend/src/screens/main/ActivityHistoryScreen.tsx`
- `frontend/src/services/api/**`
- `frontend/src/stores/**`
- `frontend/src/services/socket/SocketIOManager.ts`

## Resultado por bloco

### Bloco 1 - Base de produção
Status: APROVADO COM RESSALVAS

Evidências:
- `ValidationPipe`, `helmet`, `requestId`, `trust proxy`, `ExceptionFilter`, `HttpLoggingInterceptor` em `backend/src/main.ts`
- `ThrottlerGuard` global em `backend/src/app.module.ts`
- validação central de envs em `backend/src/config/env.validation.ts`
- health check com banco e cache em `backend/src/modules/health/health.service.ts`

Problemas encontrados:
- `.dockerignore` ausente
- fallback de cache em memória continua disponível fora de um contrato explícito por ambiente
- observabilidade principal ainda gira em torno de Sentry opcional, não AWS observability real

Risco: MÉDIO

Correção necessária:
- adicionar `.dockerignore`
- endurecer política Redis em produção
- alinhar observabilidade com AWS-first

Prioridade: P1

### Bloco 2 - Storage e mídia
Status: APROVADO COM RESSALVAS

Evidências:
- `Media` model em `backend/prisma/schema.prisma`
- `StorageService` com S3/local e compatibilidade CloudFront
- uploads de avatar, chat, produto, evento e estabelecimento no backend
- `feed.service.ts` já rejeita base64/data URI em fluxo real

Problemas encontrados:
- `STORAGE_PROVIDER` ainda aceita `supabase`, contrariando a direção AWS-first
- não há separação formal entre mídia pública e privada
- falta fechamento operacional para lifecycle, signed URLs e políticas privadas

Risco: MÉDIO

Correção necessária:
- remover alvo Supabase da arquitetura principal
- consolidar política S3/CloudFront e tipos de mídia

Prioridade: P1

### Bloco 3 - Auth, JWT e permissões
Status: REPROVADO

Evidências:
- refresh token persistido e `jwtid: randomUUID()` em `backend/src/modules/auth/auth.service.ts`
- ownership guard existente
- parte do backend já foi movida para `USER` / `ESTABLISHMENT`, mas o alinhamento ainda estava incompleto entre schema, contratos e documentação ativa

Problemas encontrados:
- havia inconsistência entre nomenclatura antiga e nomenclatura alvo de account type
- claims JWT e contratos ainda carregavam campos fora da regra de negócio
- documentação ativa ainda expunha nomenclatura antiga em pontos do backend

Risco: ALTO

Correção necessária:
- alinhar account type
- revisar claims JWT e contratos
- remover qualquer noção de admin global do modelo de auth

Prioridade: P0

### Bloco 4 - Conta de estabelecimento
Status: APROVADO COM RESSALVAS

Evidências:
- `Establishment` possui owner, categoria, subcategoria, WhatsApp, website, horário e localização
- não há `EstablishmentMember`, `OWNER`, `ADMIN` ou `EDITOR` por estabelecimento

Problemas encontrados:
- a semântica de conta proprietária ainda depende do `profileType` antigo
- frontend público e perfil ainda têm áreas mockadas

Risco: MÉDIO

Correção necessária:
- alinhar tipo de conta
- remover mock de fluxos críticos ligados a estabelecimento

Prioridade: P1

### Bloco 5 - Produtos / vitrine
Status: APROVADO COM RESSALVAS

Evidências:
- `Product` model existe
- rotas públicas e privadas reais em `backend/src/modules/products/**`
- `CatalogService` e `CatalogScreen` já consomem API

Problemas encontrados:
- ainda existe inconsistência entre backend real e telas do app que seguem em modo protótipo
- não houve validação executada fim a fim nesta auditoria

Risco: MÉDIO

Correção necessária:
- validar fluxo completo de vitrine
- remover dependências de mock ao redor da jornada comercial

Prioridade: P1

### Bloco 6 - Feed
Status: REPROVADO

Evidências:
- backend possui feed real com cache
- frontend de feed social permanece mockado em `frontend/src/screens/main/FeedSocialScreen.tsx`
- paginação ainda é `page/limit` com `skip/take`

Problemas encontrados:
- ausência de cursor pagination
- presença de stories e posts mockados na UI principal
- `HomeScreen.tsx` também mantém blocos estáticos locais

Risco: ALTO

Correção necessária:
- trocar mock por API real
- migrar paginação crítica para cursor onde fizer sentido
- remover stories incompletos ou integrá-los de verdade

Prioridade: P0

### Bloco 7 - Geo / Discovery
Status: REPROVADO

Evidências:
- eventos, estabelecimentos e search usam bounding-box simples
- não há PostGIS nem ordenação por distância real

Problemas encontrados:
- geodiscovery não está pronto para produção com qualidade de relevância
- ausência de índices geográficos e filtro `aberto agora`

Risco: ALTO

Correção necessária:
- planejar PostGIS
- substituir aproximações simples por distância real

Prioridade: P0

### Bloco 8 - Chat e tempo real
Status: APROVADO COM RESSALVAS

Evidências:
- Socket.IO funcional
- autenticação socket existe
- anexos de chat usam upload real

Problemas encontrados:
- presença em memória no gateway
- ausência de Redis adapter
- não está preparado para múltiplas instâncias ECS

Risco: ALTO

Correção necessária:
- introduzir presença distribuída
- introduzir adapter Redis para Socket.IO

Prioridade: P0

### Bloco 9 - Redis / Valkey
Status: APROVADO COM RESSALVAS

Evidências:
- `REDIS_URL` e `ENABLE_REDIS` já existem
- cache Redis já existe no backend

Problemas encontrados:
- fallback memória continua ativo como fallback geral
- Redis ainda não sustenta rate limit distribuído, presença e adapter de socket

Risco: ALTO

Correção necessária:
- endurecer uso de Redis em produção
- ampliar Redis para presença e socket

Prioridade: P0

### Bloco 10 - Push
Status: NÃO IMPLEMENTADO

Evidências:
- backend atual ainda gira em torno de Firebase FCM
- não existem `PushToken` nem `NotificationDelivery`

Problemas encontrados:
- arquitetura real diverge do alvo SNS Mobile Push
- app não demonstra captura formal de token no fluxo analisado

Risco: ALTO

Correção necessária:
- modelar tokens e entregas
- criar registro/remoção/teste de push
- alinhar provider para SNS

Prioridade: P0

### Bloco 11 - Notificações in-app
Status: APROVADO COM RESSALVAS

Evidências:
- model `Notification` existe
- listagem, marcação como lida, contagem e exclusão existem

Problemas encontrados:
- modelo é simples demais para integração robusta com push
- faltam `entityType`, `entityId` genérico e payload estruturado

Risco: MÉDIO

Correção necessária:
- enriquecer modelo e fluxo de entrega

Prioridade: P1

### Bloco 12 - E-mail
Status: REPROVADO

Evidências:
- `EMAIL_PROVIDER=ses` já é aceito na validação
- `EmailService` atual só implementa Resend

Problemas encontrados:
- arquitetura alvo não está implementada no código
- documentação legal ainda cita Resend como provider operacional

Risco: ALTO

Correção necessária:
- implementar SES
- manter Resend apenas como fallback transitório, se necessário

Prioridade: P0

### Bloco 13 - AuditLog
Status: NÃO IMPLEMENTADO

Evidências:
- model `AuditLog` existe no schema
- não foi encontrada escrita real consistente em `backend/src`

Problemas encontrados:
- ausência de trilha auditável para ações críticas

Risco: ALTO

Correção necessária:
- implementar escrita real de AuditLog

Prioridade: P0

### Bloco 14 - Observabilidade AWS
Status: REPROVADO

Evidências:
- logs estruturados e requestId existem
- há bootstrap opcional de Sentry

Problemas encontrados:
- não há integração operacional real com CloudWatch/CloudTrail/X-Ray no projeto
- documentação ainda mistura AWS-first com Sentry como dependência principal em alguns pontos

Risco: ALTO

Correção necessária:
- alinhar documentação e contratos de runtime para AWS observability

Prioridade: P1

### Bloco 15 - Testes
Status: APROVADO COM RESSALVAS

Evidências:
- backend possui testes unitários e e2e no repositório
- frontend possui poucos testes reais

Problemas encontrados:
- typecheck não aparece como script explícito no frontend
- não houve execução nesta auditoria
- cobertura prática de push, e-mail e AWS-specific flows não foi evidenciada

Risco: ALTO

Correção necessária:
- executar build, testes e validações críticas após correções

Prioridade: P0

## AWS readiness

Status: NÃO PRONTO

Evidências:
- `backend/Dockerfile` existe
- `PORT` configurável existe
- `DATABASE_URL`, `REDIS_URL`, `S3` e `SES` já aparecem na env validation
- `/health` existe
- backend já está parcialmente estruturado para container

Bloqueios:
- `.dockerignore` ausente
- modelo de conta desalinhado
- SES não implementado
- SNS push não implementado
- Redis/socket distribuído não implementado
- feed principal ainda com mock
- geo/discovery sem distância real
- AuditLog sem escrita real
- documentação AWS inconsistente

Ajustes necessários:
- corrigir os bloqueios acima antes de considerar deploy profissional

## Conflitos com a decisão atual

- `profileType` ainda usa nomenclatura antiga em backend e contratos
- `STORAGE_PROVIDER` ainda aceita `supabase`
- push principal ainda aponta para Firebase/FCM no código atual
- e-mail real ainda depende de Resend no código
- documentação AWS ainda mistura FCM, Resend/SES e Sentry principal
- ainda existem mocks onde já deveria haver API real:
  - `frontend/src/screens/main/FeedSocialScreen.tsx`
  - `frontend/src/screens/main/ProfileScreen.tsx`
  - `frontend/src/screens/main/HomeScreen.tsx`
  - `frontend/src/screens/main/ActivityFavoritesScreen.tsx`
  - `frontend/src/screens/main/ActivityHistoryScreen.tsx`

## Testes executados

NÃO EXECUTADO.

Motivo:
- esta etapa corresponde à auditoria inicial do prompt;
- ainda não houve fechamento das correções críticas para validar build/testes finais sem ruído.

## Riscos remanescentes

- CRÍTICO: deploy em AWS com arquitetura de push/e-mail incompleta
- ALTO: inconsistência entre conta `USER/ESTABLISHMENT` e contratos atuais
- ALTO: frontend principal ainda parcialmente protótipo
- ALTO: falta de AuditLog real
- ALTO: chat não preparado para múltiplas instâncias
- ALTO: geo/discovery ainda simplificado
- MÉDIO: documentação AWS conflitante
- MÉDIO: worktree suja pode confundir revisões futuras

## O que está aprovado

- base backend de produção
- camada de mídia centralizada
- produtos/vitrine no backend
- health check básico
- logs estruturados e requestId

## O que precisa corrigir antes de continuar

1. alinhar modelo de conta
2. implementar SES
3. definir caminho real para push AWS
4. implementar AuditLog
5. preparar Redis/socket para múltiplas instâncias
6. remover mocks críticos do frontend
7. corrigir inconsistências documentais AWS

## O que pode ficar para depois

- refinamentos avançados de CloudFront privado
- auto scaling fino
- blue/green deploy
- X-Ray detalhado
- alertas finos por custo e operação

## Recomendação final

BLOQUEAR

## Próximo passo recomendado

1. corrigir os itens P0 do backend e da arquitetura AWS-first
2. fechar inconsistências documentais
3. validar build/testes
4. só então reavaliar AWS readiness

## Atualização após execução

Itens já corrigidos depois desta auditoria inicial:

- modelo de conta alinhado para `USER` / `ESTABLISHMENT` no schema e nos contratos principais;
- remoção completa de `isAdmin` e da noção de admin global do fluxo de auth/JWT;
- migração reescrita para alinhar apenas account type;
- `EmailService` consolidado em Amazon SES;
- `NotificationService` reescrito para base AWS SNS;
- documentação ativa e documentação AWS ajustadas para AWS-first;
- `.gitignore` atualizado para ignorar `.codex/recovery/`;
- artefatos temporários de recovery removidos do índice do Git.

Validação executada após as correções:

- `npm run prisma:generate`
- `npm run build`
- `npm test -- --runInBand`

Resultado:

- backend compilando;
- 10 suites de teste passando;
- 143 testes passando;
- frontend com `tsc --noEmit` passando;
- frontend com `eslint` passando.

## Reclassificacao dos blocos 1 a 3 apos a rodada de correcao

### Bloco 1 - Base de producao

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- o texto original ainda carregava itens ja corrigidos como `.dockerignore` e endurecimento de Redis
- a pendencia de observabilidade AWS real continua valida, mas pertence ao Bloco 14

### Bloco 2 - Storage e midia

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- ainda faltava fechamento real para midia privada

Correcao aplicada:
- `MediaService` passou a distinguir midia publica e privada
- `MediaController` ganhou `GET /media/protected/:mediaId`
- anexos de chat agora exigem autenticacao e validacao de participacao

### Bloco 3 - Auth, JWT e permissoes

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- o backend ja estava quase alinhado, mas o app mobile ainda nao amarrava a escolha `USER` / `ESTABLISHMENT` ao cadastro real
- onboarding podia ser contornado pela navegacao autenticada

Correcao aplicada:
- `LoginScreen` passou a abrir `ProfileSelection`
- `ProfileSelectionScreen` envia `profileType` real para `SignUp`
- `SignUpScreen`, `SplashScreen`, `RootNavigator` e telas de setup passaram a respeitar o onboarding antes da area autenticada

## Atualizacao adicional - Redis, Socket.IO e presenca distribuida

### Bloco 8 - Chat e tempo real

Status atual:
- `APROVADO COM RESSALVAS`

Evolucao aplicada:
- `main.ts` passou a registrar `RedisIoAdapter` para o Socket.IO
- o backend agora conecta pub/sub Redis quando `ENABLE_REDIS=true`
- `ChatGateway` passou a considerar a room do usuario como fonte de presenca distribuida
- online/offline agora depende da contagem de sockets na malha Socket.IO, nao apenas de mapa local em memoria

Ressalva remanescente:
- ainda falta validacao real com mais de uma instancia e Redis/ElastiCache externo

### Bloco 9 - Redis / Valkey

Status atual:
- `APROVADO COM RESSALVAS`

Evolucao aplicada:
- Redis deixou de ser apenas cache e passou a sustentar o adapter de socket do runtime
- em `NODE_ENV=production`, o bootstrap do adapter falha se `ENABLE_REDIS` estiver desligado

Ressalva remanescente:
- rate limit distribuido ainda nao foi fechado ponta a ponta

## Atualizacao adicional - Push mobile e notificacoes no app

### Bloco 10 - Push

Status atual:
- `APROVADO COM RESSALVAS`

Evolucao aplicada:
- o app passou a solicitar permissao de notificacao quando o usuario autenticado entra na area principal
- o app passou a capturar token nativo via `expo-notifications`
- o app passou a registrar o token no backend usando `POST /notifications/push-tokens`
- o logout passou a desativar o token previamente registrado no backend

Ressalva remanescente:
- ainda falta validacao com credenciais reais SNS/APNs/FCM em dispositivo compatível

### Bloco 11 - Notificacoes in-app

Status atual:
- `APROVADO COM RESSALVAS`

Evolucao aplicada:
- o frontend ja consome listagem real de notificacoes
- marcar como lida e exclusao continuam funcionais via API
- o app passou a entender `entityType` e `payload` para navegacao basica quando houver contexto de conversa
- o backend passou a emitir `notification:new` pelo websocket
- a tela de notificacoes passou a reagir ao evento em tempo real quando aberta

Ressalva remanescente:
- ainda falta validacao manual ponta a ponta com cliente conectado e evento real disparado

## Atualizacao adicional - Feed social real e contrato T_AGITO

### Bloco 6 - Feed

Status atual:
- `APROVADO`

Evolucao aplicada:
- `FeedSocialScreen` deixou de usar `MOCK_POSTS` e `MOCK_STORIES`
- o app passou a consumir `GET /feed/agito`
- o backend ganhou cursor pagination no contrato principal do feed social
- o backend passou a expor modos `mixed`, `following`, `global` e `nearby`
- posts sem midia deixaram de ser aceitos no fluxo social principal
- a invalidacao de cache foi corrigida para post e comentario apos mutacoes criticas
- a linha de stories foi removida do fluxo principal enquanto nao existir API real de stories

Arquivos principais:
- `backend/src/modules/feed/agito-feed.controller.ts`
- `backend/src/modules/feed/dtos/agito-feed-query.dto.ts`
- `backend/src/modules/feed/feed.service.ts`
- `backend/src/common/cache/cache.service.ts`
- `frontend/src/services/api/ApiClient.ts`
- `frontend/src/services/api/FeedService.ts`
- `frontend/src/stores/feedStore.ts`
- `frontend/src/screens/main/FeedSocialScreen.tsx`

Reclassificacao objetiva:
- a ressalva anterior de `HomeScreen.tsx` nao bloqueia mais este bloco porque pertence ao T06 Home e aos blocos de discovery/geo
- o contrato social principal agora esta alinhado ponta a ponta entre backend, store e tela mobile

## Atualizacao adicional - Geo / Discovery real

### Bloco 7 - Geo / Discovery

Status atual:
- `APROVADO`

Evolucao aplicada:
- `EventsService` e `SearchService` passaram a calcular `distanceKm` real e ordenar eventos por distancia quando ha coordenadas
- `EstablishmentsService` e `SearchService` passaram a calcular `distanceKm`, expor `isOpenNow` e filtrar `openNow`
- filtros `category` e `subcategory` foram alinhados com comparacao case-insensitive no backend
- `SearchController` passou a normalizar `openNow=false` corretamente, sem o bug classico de string booleana
- `autocomplete` e `trending` foram endurecidos para nao expor eventos e estabelecimentos privados
- `HomeScreen` deixou de usar mocks de discovery e ficou restrito a secoes com API real
- `SearchScreen` deixou de calcular distancia localmente e passou a usar o contrato real do backend

Arquivos principais:
- `backend/src/common/geo/geo.utils.ts`
- `backend/src/common/time/opening-hours.utils.ts`
- `backend/src/modules/events/events.service.ts`
- `backend/src/modules/establishments/dtos/list-establishments-query.dto.ts`
- `backend/src/modules/establishments/establishments.service.ts`
- `backend/src/modules/search/search.controller.ts`
- `backend/src/modules/search/search.service.ts`
- `backend/src/modules/search/search.spec.ts`
- `frontend/src/services/api/SearchService.ts`
- `frontend/src/services/api/LocationService.ts`
- `frontend/src/screens/main/HomeScreen.tsx`
- `frontend/src/screens/main/SearchScreen.tsx`

Reclassificacao objetiva:
- a reprovacao anterior deixava de fazer sentido depois que `distanceKm`, `openNow`, ordenacao por distancia e consumo real no app foram fechados ponta a ponta
- a ultima ressalva tecnica restante era o risco de exposicao indevida em `autocomplete` e `trending`, corrigido e coberto por teste nesta rodada

## Atualizacao adicional - Rate limit distribuido e endurecimento Redis

### Bloco 9 - Redis / Valkey

Status atual:
- `APROVADO`

Evolucao aplicada:
- o backend ganhou `RedisThrottlerStorage` para o `@nestjs/throttler`
- o `ThrottlerModule` passou a subir com storage Redis distribuida no guard global
- `ENABLE_REDIS=true` passou a ser obrigatorio em producao tambem para cache/throttling, nao apenas para o adapter de Socket.IO
- `CacheService` deixou de aceitar fallback em memoria em producao
- `RATE_LIMIT_BLOCK_MS` passou a ser variavel explicita de configuracao
- os exemplos de env e os READMEs foram alinhados ao comportamento novo

Arquivos principais:
- `backend/src/common/rate-limit/rate-limit.module.ts`
- `backend/src/common/rate-limit/redis-throttler.storage.ts`
- `backend/src/common/rate-limit/redis-throttler.storage.spec.ts`
- `backend/src/app.module.ts`
- `backend/src/common/cache/cache.service.ts`
- `backend/src/config/env.validation.ts`
- `backend/.env.example`
- `backend/.env.test.example`
- `backend/README.md`
- `README.md`

Reclassificacao objetiva:
- a ressalva anterior de rate limit distribuido foi eliminada
- o requisito do prompt de fallback em memoria apenas em `dev/test` agora esta refletido em codigo, env validation e documentacao

## Atualizacao adicional - Contexto HTTP no AuditLog

### Bloco 13 - AuditLog

Status atual:
- `APROVADO`

Evolucao aplicada:
- o backend ganhou `RequestContextService` com `AsyncLocalStorage`
- o middleware global passou a registrar `requestId`, `ipAddress` e `userAgent` por request
- `AuditLogService` passou a herdar automaticamente esse contexto quando os campos nao sao enviados explicitamente
- a consistencia de trilha auditavel subiu sem precisar propagar parametros HTTP por todos os services
- testes unitarios novos cobrem heranca de contexto e preservacao de valores explicitamente informados

Arquivos principais:
- `backend/src/common/request-context/request-context.module.ts`
- `backend/src/common/request-context/request-context.service.ts`
- `backend/src/common/middleware/request-id.middleware.ts`
- `backend/src/common/audit/audit.module.ts`
- `backend/src/common/audit/audit-log.service.ts`
- `backend/src/common/audit/audit-log.service.spec.ts`
- `backend/src/main.ts`

Reclassificacao objetiva:
- a unica ressalva tecnica relevante deste bloco era a captura inconsistente de `ipAddress` e `userAgent`
- essa lacuna foi fechada em infraestrutura comum, sem solucao fragmentada por modulo

## Reclassificacao dos blocos 4 e 5 apos fechamento end-to-end

### Bloco 4 - Conta de estabelecimento

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- o modelo owner-only existia no backend, mas a jornada mobile ainda parava em fluxo prototipado
- o app nao criava a pagina empresarial real nem consumia a propria pagina do dono por contrato dedicado

Correcao aplicada:
- `EstablishmentsService` passou a exigir `profileType=ESTABLISHMENT` e a bloquear mais de uma pagina ativa por conta
- o backend ganhou `GET /establishments/me/owned` para a pagina publica do proprietario autenticado
- `BusinessSetupScreen` passou a executar geocode, criar establishment real, montar `openingHours` e subir logo/capa/galeria
- `ProfileScreen` deixou de usar mock para pagina empresarial e passou a consumir establishment real com produtos reais

Arquivos principais:
- `backend/src/modules/establishments/establishments.service.ts`
- `backend/src/modules/establishments/establishments.controller.ts`
- `backend/src/modules/establishments/establishments.spec.ts`
- `frontend/src/screens/auth/BusinessSetupScreen.tsx`
- `frontend/src/screens/main/ProfileScreen.tsx`
- `frontend/src/services/api/LocationService.ts`
- `frontend/src/screens/navigation/RootNavigator.tsx`
- `frontend/src/stores/authStore.ts`

### Bloco 5 - Produtos / vitrine publica

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- o backend de produto ja existia, mas o app ainda misturava tela real com detalhe prototipado
- a navegacao ainda pulava direto para catalogo em pontos que deveriam entrar pela pagina publica do estabelecimento

Correcao aplicada:
- `CatalogScreen` passou a carregar a vitrine publica real do estabelecimento e a derivar filtros dos itens reais
- `ItemScreen` passou a carregar `GET /products/:id` de forma real, sem carrinho, pagamento ou variantes artificiais
- `HomeScreen` e `SearchScreen` passaram a navegar primeiro para o perfil publico do estabelecimento
- `ProfileScreen` passou a listar servicos/produtos reais e a abrir o detalhe real de item

Arquivos principais:
- `frontend/src/screens/main/CatalogScreen.tsx`
- `frontend/src/screens/main/ItemScreen.tsx`
- `frontend/src/screens/main/ProfileScreen.tsx`
- `frontend/src/screens/main/HomeScreen.tsx`
- `frontend/src/screens/main/SearchScreen.tsx`
- `frontend/src/services/api/CatalogService.ts`
- `frontend/src/services/api/LocationService.ts`

## Reclassificacao dos blocos 8 e 11 apos reauditoria de ressalvas

### Bloco 8 - Chat e tempo real

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- a unica ressalva restante era validacao manual multi-instancia com Redis/ElastiCache externo

Reclassificacao objetiva:
- a malha de runtime ja ficou tecnicamente fechada com adapter Redis, presenca distribuida e exigencia de `ENABLE_REDIS=true` em producao
- como a ressalva restante era apenas validacao manual, ela sai do bloco e permanece concentrada no Bloco 15

### Bloco 11 - Notificacoes in-app

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- a unica ressalva restante era validacao manual ponta a ponta do evento em tempo real no app

Reclassificacao objetiva:
- o contrato backend/frontend ja esta fechado com listagem real, leitura, exclusao, `entityType`, `payload` e evento `notification:new`
- como a ressalva restante era apenas validacao manual, ela sai do bloco e permanece concentrada no Bloco 15

## Atualizacao adicional - Fundacao de observabilidade AWS

### Bloco 14 - Observabilidade AWS

Status atual:
- `REPROVADO`

Evolucao aplicada:
- `structured-log.ts` passou a enriquecer logs com `service`, `environment`, `requestId`, `correlationId` e `traceId`
- o middleware global passou a propagar `x-correlation-id` e a capturar `x-amzn-trace-id`
- `GlobalExceptionFilter` e `HttpLoggingInterceptor` passaram a refletir melhor a correlacao de request
- o backend ganhou `observability.bootstrap.ts` com inicializacao opcional de X-Ray e Sentry
- `S3Client`, `SESv2Client` e `SNSClient` passaram a ficar prontos para instrumentacao X-Ray
- o repositório ganhou `backend/scripts/aws/apply-observability.ps1` para log group, retention, metric filters, alarmes, dashboard e garantia de CloudTrail
- o repositório ganhou `doc/aws doc/AWS_OBSERVABILITY_RUNBOOK.md` com runbook operacional

Arquivos principais:
- `backend/src/common/logging/structured-log.ts`
- `backend/src/common/logging/structured-log.spec.ts`
- `backend/src/common/request-context/request-context.service.ts`
- `backend/src/common/middleware/request-id.middleware.ts`
- `backend/src/common/interceptors/http-logging.interceptor.ts`
- `backend/src/common/filters/global-exception.filter.ts`
- `backend/src/common/observability/observability.bootstrap.ts`
- `backend/src/common/notification/notification.service.ts`
- `backend/src/common/email/email.service.ts`
- `backend/src/modules/media/storage.service.ts`
- `backend/src/config/env.validation.ts`
- `backend/.env.example`
- `backend/.env.test.example`
- `backend/scripts/aws/apply-observability.ps1`
- `doc/aws doc/AWS_OBSERVABILITY_PLAN.md`
- `doc/aws doc/AWS_OBSERVABILITY_RUNBOOK.md`
- `backend/README.md`

Bloqueio real remanescente:
- a sessao `aws sso` do profile `meuagito-admin` segue expirada no ambiente local
- a aplicacao real do bloco ainda depende de `CloudTrailS3Bucket` e dos identificadores finais de ECS/ALB/RDS/Redis do ambiente AWS
- sem esses dados e sem sessao valida, a observabilidade ainda nao foi materializada na conta

Validacao executada nesta rodada:
- `npm run build`
- `npm run test -- --runInBand`
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\aws\\apply-observability.ps1 -Profile meuagito-admin -Region sa-east-1 -WhatIf`

Resultado:
- backend compilando;
- 11 suites de teste passando;
- 145 testes passando;
- script operacional gerado e executando em `WhatIf`;
- preview do script confirmou o bloqueio real de `CloudTrailS3Bucket` para criacao do trail.

## Reclassificacao dos blocos 10 e 12 apos endurecimento de push e e-mail

### Bloco 10 - Push

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- ainda faltava tratamento mais forte para token invalido no backend
- ainda nao havia cobertura automatizada dedicada para os fluxos centrais de push

Correcao aplicada:
- `NotificationsService` passou a desativar `PushToken` quando a falha de entrega indica endpoint/token terminalmente invalido
- `NotificationDelivery` passou a registrar esse caso como `DISABLED`, em vez de misturar com falha transiente
- o backend ganhou testes dedicados para registro de token, teste de push sem token ativo e desativacao automatica de token invalido

Arquivos principais:
- `backend/src/modules/notifications/notifications.service.ts`
- `backend/src/modules/notifications/notifications.spec.ts`

Reclassificacao objetiva:
- os requisitos do prompt para `PushToken`, `NotificationDelivery`, registrar/remover token, envio de teste, falhas e token invalido ficaram cobertos em codigo
- credenciais reais SNS/APNs/FCM e aplicacao da migration no banco alvo permanecem como atividade de ambiente/deploy

### Bloco 12 - E-mail

Status atual:
- `APROVADO`

Motivo da classificacao anterior:
- faltava prova automatizada de que os fluxos de verificacao/reset mantinham comportamento seguro quando a entrega falhava

Correcao aplicada:
- `AuthService` ganhou cobertura para `requestPasswordReset` com resposta generica mesmo quando o envio falha
- `AuthService` ganhou cobertura para `resendVerificationEmail` com `verificationEmailSent=false` sem explodir em 500 generico
- `EmailService` ganhou testes dedicados para provider desabilitado, envio SES bem-sucedido e rejeicao do SES

Arquivos principais:
- `backend/src/modules/auth/auth.spec.ts`
- `backend/src/common/email/email.service.spec.ts`

Reclassificacao objetiva:
- os requisitos do prompt para SES como alvo, verificacao, reset, reenvio e erro sem 500 generico ficaram cobertos em codigo e teste
- identidade/remetente e sandbox do SES no ambiente AWS real permanecem como atividade de ambiente/deploy

## Atualizacao adicional - Bloco 15

Status atual:
- `APROVADO COM RESSALVAS`

Evolucao aplicada:
- `backend lint` passou a fazer parte da validacao da rodada
- o backend ganhou `media.service.spec.ts` para cobrir upload/avatar, anexo privado e bloqueio de permissao em chat
- a suite total de unitarios subiu para `14` suites e `157` testes
- push e e-mail deixaram de ser lacunas sem cobertura automatizada no backend
- o `test:e2e` voltou a passar depois que o Docker e o banco de teste em `localhost:5433` foram restaurados no ambiente local

Validacao executada:
- `npm run lint`
- `npm run build`
- `npm run test -- --runInBand`
- `npm run test:e2e`

Resultado:
- backend lint passando;
- backend compilando;
- 14 suites de teste passando;
- 157 testes passando;
- `e2e` com 2 suites passando;
- `e2e` com 2 testes passando.

## Atualizacao complementar - 2026-04-29 (America/Sao_Paulo)

### Objetivo desta atualizacao

Registrar a revalidacao posterior da baseline e os ajustes feitos sem remover o historico da auditoria original.

### Revalidacao executada

- `npm run lint` em `backend`: OK
- `npm run build` em `backend`: OK
- `npm test -- --runInBand` em `backend`: OK
  - 14 suites
  - 157 testes
- `npx tsc --noEmit` em `frontend`: OK
- `npm run lint` em `frontend`: OK
- `npm run test:e2e` em `backend`: NAO REPRODUZIDO nesta rodada

### Divergencia encontrada em relacao ao estado anterior

- nesta revalidacao, o `test:e2e` nao confirmou o resultado anterior porque o Postgres de teste em `localhost:5433` nao estava disponivel no host
- a checagem objetiva com `Test-NetConnection localhost -Port 5433` retornou `TcpTestSucceeded=False`
- a falha observada foi de ambiente local, nao de TypeScript, lint ou testes unitarios

### Lacunas adicionais confirmadas

- a documentacao canonica em `doc/` ainda estava atrasada em relacao ao backend AWS-first atual
- as telas `ActivityFavorites` e `ActivityHistory` ainda exibiam dados locais fake como se o recurso estivesse pronto
- essas duas lacunas nao reabrem os blocos core de backend, mas afetam governanca documental e honestidade do frontend

### Correcoes aplicadas nesta rodada

- a documentacao canonica de estado atual foi reaberta para refletir a baseline AWS-first vigente
- o roadmap canonico foi atualizado para separar claramente:
  - core tecnico ja fechado
  - validacao automatizada repetivel ainda pendente
  - smoke mobile/manual ainda pendente
  - deploy AWS real ainda pendente
- a referencia canonica da API foi atualizada com os contratos reais atuais:
  - `GET /feed/agito`
  - `GET /establishments/me/owned`
  - rotas de `media`
  - rotas de `products`
  - rotas de `notifications/push-tokens` e `push-test`
- `ActivityScreen`, `ActivityFavoritesScreen` e `ActivityHistoryScreen` deixaram de mascarar lacunas com listas mockadas

### Impacto na leitura desta auditoria

- os blocos backend fechados em 26/04 permanecem fechados
- o bloqueio principal continua concentrado em:
  - observabilidade AWS materializada na conta
  - ambiente real de deploy
  - validacao mobile/manual
- a unica ressalva nova relevante desta rodada foi a necessidade de registrar oficialmente que o `e2e` depende novamente do banco de teste local estar ativo

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - Docker local finalizado

### Evidencia nova

- `docker compose up -d postgres postgres-test redis backend`: OK
- `meuagito-backend` respondeu `GET /health` com sucesso em `localhost:3001`
- `npm run test:e2e`: PASSOU com `postgres-test` em `localhost:5433`

### Interpretacao revisada

- o bloqueio local de Docker deixou de ser impeditivo para continuidade do projeto
- a solucao pragmatica validada para desenvolvimento local foi subir o backend em runtime via `node:20-alpine` no Compose
- a pendencia remanescente ficou restrita ao build da imagem customizada em ambiente com memoria mais estavel

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - reauditoria de frontend e readiness

### Ajustes comprovados nesta rodada

- `ItemScreen` passou a consumir detalhe real de evento e a executar confirmacao/cancelamento de presenca pela API
- o login frontend deixou de expor social auth inexistente como se estivesse pronto
- o desafio real de 2FA agora continua no frontend em tela dedicada
- a configuracao de 2FA nas configuracoes deixou de ser apenas mock estatico
- `UsersService.getUserStats` passou a calcular `postsCount` e `likesCount` reais

### Validacao executada apos as correcoes

- `npm run lint` em `frontend`: OK
- `npx tsc --noEmit` em `frontend`: OK
- `npm run lint` em `backend`: OK
- `npm run build` em `backend`: OK
- `npm test -- --runInBand` em `backend`: OK
- `npm run test:e2e` em `backend`: OK

### Conclusao revisada desta auditoria

- nao e correto afirmar que todos os blocos do prompt/documentacao estao 100% finalizados
- os blocos locais de codigo e baseline automatizada estao fortes
- o que continua aberto nao esta mais concentrado em core backend; esta concentrado em release real:
  - observabilidade AWS materializada na conta
  - SES/SNS/APNs/FCM no ambiente final
  - migrations no banco alvo
  - smoke mobile/manual
  - triagem final de telas auxiliares ainda parciais fora do MVP
