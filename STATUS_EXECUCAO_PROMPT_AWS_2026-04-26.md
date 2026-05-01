# Status de Execucao do Prompt AWS - 2026-04-26

## Objetivo

Consolidar o que ja foi executado no projeto em relacao ao prompt `.codex/PROMPT_melhorias_objetivas.md` e deixar claro o que ainda falta antes de considerar o projeto pronto para deploy profissional em AWS.

## Escopo desta atualizacao

- auth e account type
- SES e SNS
- AuditLog
- notificacoes in-app e push no backend
- documentacao AWS e documentacao ativa
- limpeza segura de worktree

## O que foi feito

### Bloco 1 - Base de producao

Feito:
- `.dockerignore` adicionado no backend
- `env.validation.ts` endurecido
- Redis em producao sem fallback silencioso
- base de bootstrap backend mantida compativel com ECS

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- o relatorio ainda carregava achados que ja tinham sido corrigidos no codigo
- a pendencia de observabilidade AWS real pertence ao Bloco 14, nao ao Bloco 1

### Bloco 2 - Storage e midia

Feito:
- direcao AWS-first consolidada em docs e env
- `STORAGE_PROVIDER` reduzido para rota principal S3
- anexos privados de chat agora sao servidos por rota protegida
- `MediaService` passou a distinguir midia publica e privada no contrato entregue ao cliente

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- o backend ainda aceitava configuracao antiga fora da direcao AWS-first
- nao havia fechamento real para entrega protegida de anexo privado

Observacao:
- lifecycle e refinamentos operacionais de S3/CloudFront ainda podem evoluir, mas nao bloqueiam a aprovacao deste bloco

### Bloco 3 - Auth, JWT e permissoes

Feito:
- `profileType` alinhado para `USER` / `ESTABLISHMENT`
- remocao de `isAdmin`
- remocao de qualquer nocao de admin global do fluxo atual
- claims JWT simplificadas
- `req.user` coerente com o modelo atual
- migracao de alinhamento de account type criada
- fluxo mobile de cadastro agora respeita a escolha `USER` / `ESTABLISHMENT`
- onboarding passa a bloquear a entrada na area autenticada ate a configuracao inicial

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- o backend ja estava quase alinhado, mas o app ainda pulava partes do fluxo de account type e onboarding

Observacao:
- validacao manual em emulador continua desejavel, mas a ressalva saiu do bloco de implementacao e fica concentrada no Bloco 15

### Bloco 4 - Conta de estabelecimento

Feito:
- mantido modelo de dono unico da propria conta
- sem `EstablishmentMember`, `OWNER`, `ADMIN`, `EDITOR`
- ownership preservado
- `ESTABLISHMENT` agora so pode criar uma unica pagina ativa
- backend ganhou `GET /establishments/me/owned` para a propria pagina do dono
- onboarding empresarial deixou de ser prototipo e passou a criar estabelecimento real com geocode, horario e upload de midia
- perfil publico de estabelecimento deixou de depender de mocks no app

Status atual:
- `APROVADO`

Observacao:
- validacao manual Android continua desejavel, mas nao ha ressalva tecnica aberta neste bloco

### Bloco 5 - Produtos / vitrine publica

Feito:
- backend de produtos/vitrine mantido
- auditoria de produto adicionada
- upload/imagem principal de produto com trilha auditavel
- `CatalogScreen` passou a consumir vitrine real do estabelecimento
- `ItemScreen` passou a consumir produto real via API, sem variantes/carrinho mockados
- navegacao `Home` e `Search` passou a abrir a pagina publica do estabelecimento antes da vitrine

Status atual:
- `APROVADO`

Observacao:
- validacao manual ponta a ponta no app continua desejavel, mas nao ha ressalva tecnica aberta neste bloco

### Bloco 6 - Feed social

Feito:
- endpoint social real `GET /feed/agito` criado para o T_AGITO
- cursor pagination adicionada ao feed social principal
- modos `mixed`, `following`, `global` e `nearby` expostos no backend
- invalidacao de cache corrigida para create/update/delete/like/comment
- posts sociais passaram a exigir midia real no backend
- `FeedSocialScreen` deixou de usar mocks e passou a consumir API real
- stories incompletos sairam do fluxo principal em vez de permanecerem fake
- backend do feed mantido com trilha auditavel para post/comentario/like

Status atual:
- `APROVADO`

Motivo da reprovacao anterior:
- a tela principal do feed ainda era 100 por cento mockada
- o contrato social principal ainda dependia de `page/limit` com `skip/take`
- havia falha real de cache/invalidation apos mutacoes
- stories fake ainda mascaravam um fluxo nao implementado

Observacao:
- mocks estaticos do `HomeScreen.tsx` permanecem fora deste bloco porque pertencem ao T06 Home e a discovery/geo, nao ao contrato do T_AGITO

### Bloco 7 - Geo / Discovery

Feito:
- `distanceKm` real calculado no backend para eventos e estabelecimentos
- ordenacao por distancia real nas listagens geograficas
- filtros `category`, `subcategory` e `openNow` fechados no backend
- parsing correto de boolean para `openNow`
- busca publica reforcada para nao expor eventos e estabelecimentos privados em `search`, `autocomplete` e `trending`
- `SearchScreen` deixou de mascarar a busca com calculo local e passou a consumir o contrato real do backend
- `HomeScreen` deixou de usar mocks de discovery e ficou restrito a secoes sustentadas por API real
- helpers compartilhados de geo e horario aplicados em `events`, `establishments` e `search`

Status atual:
- `APROVADO`

Motivo da reprovacao anterior:
- a implementacao antiga parava no bounding box e nao entregava distancia real nem ordenacao por distancia
- faltava filtro `aberto agora`
- a discovery do app ainda era parcialmente mascarada por mocks e calculo de distancia no cliente

Observacao:
- validacoes manuais extras continuam desejaveis no Bloco 15, mas nao ha ressalva remanescente de codigo ou configuracao neste bloco

### Bloco 8 - Chat e tempo real

Feito:
- chat backend mantido
- auditoria adicionada para conversa e mensagem
- adapter Redis do Socket.IO conectado no bootstrap do backend
- presenca online/offline passou a usar room distribuida por usuario
- producao agora exige `ENABLE_REDIS=true` para clustering do chat/socket

Status atual:
- `APROVADO`

Observacao:
- a ressalva anterior era apenas validacao manual multi-instancia, sem lacuna tecnica aberta em codigo ou configuracao

### Bloco 9 - Redis / Valkey

Feito:
- politica de Redis endurecida no backend
- Redis agora sustenta adapter de socket no runtime
- Redis passou a sustentar presenca distribuida do chat
- throttling global passou a usar storage Redis distribuida
- `ENABLE_REDIS=true` passou a ser obrigatorio em producao
- fallback em memoria para cache e rate limit ficou restrito a `development` e `test`
- `RATE_LIMIT_BLOCK_MS` passou a fazer parte da configuracao explicita

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- o backend ainda usava storage local do `@nestjs/throttler`
- `CacheService` ainda aceitava producao sem Redis

Observacao:
- validacao manual com ElastiCache externo continua util no Bloco 15, mas nao ha ressalva remanescente de codigo ou configuracao neste bloco

### Bloco 10 - Push notifications

Feito:
- provider principal movido para AWS SNS
- `PushToken` model adicionado
- `NotificationDelivery` model adicionado
- endpoints backend para:
  - listar tokens
  - registrar token
  - desativar token
  - enviar push de teste
- service comum de push reescrito para SNS
- app mobile passou a solicitar permissao de notificacao
- app mobile passou a capturar token nativo e registrar no backend quando autenticado
- logout do app passou a desativar o push token registrado localmente
- falha terminal de push agora desativa token invalido no backend
- testes dedicados de push backend adicionados

Status atual:
- `APROVADO`

Observacao:
- credenciais reais SNS/APNs/FCM e aplicacao de migration no banco alvo continuam como atividade de ambiente/deploy, nao como lacuna tecnica de codigo ou configuracao versionada

### Bloco 11 - Notificacoes in-app

Feito:
- `Notification` enriquecida com `entityType`, `entityId` e `payload`
- integracao com `NotificationDelivery`
- auditoria de leitura/exclusao
- tela mobile consome listagem real, marcar como lida e exclusao via backend
- frontend passou a entender `entityType` e `payload` para navegacao basica
- backend passou a emitir `notification:new` em tempo real pelo websocket
- tela de notificacoes passou a reagir a eventos de notificacao em tempo real quando aberta

Status atual:
- `APROVADO`

Observacao:
- a ressalva anterior era apenas validacao manual ponta a ponta, sem lacuna tecnica aberta em codigo ou configuracao

### Bloco 12 - E-mail

Feito:
- `EmailService` consolidado em Amazon SES
- dependencia `resend` removida
- docs e env alinhados para SES
- fluxos de verificacao e reset foram cobertos por testes automatizados sem retorno 500 generico
- testes dedicados de `EmailService` adicionados

Status atual:
- `APROVADO`

Observacao:
- validacao de identidade/remetente e sandbox do SES no ambiente AWS real continua como atividade de ambiente/deploy, nao como lacuna tecnica de codigo ou configuracao versionada

### Bloco 13 - AuditLog

Feito:
- `AuditLogService` implementado
- auth, users, establishments, events, feed, products, chat e notifications com trilha auditavel
- sanitizacao de dados sensiveis no payload do log
- captura automatica de `ipAddress` e `userAgent` via contexto de request
- `AuditLogService` passou a herdar contexto HTTP sem depender de parametros manuais em cada service

Status atual:
- `APROVADO`

Motivo da ressalva anterior:
- `ipAddress` e `userAgent` ainda dependiam de preenchimento manual e podiam ficar nulos em boa parte das trilhas

Observacao:
- futuras expansoes de cobertura podem acontecer sem reabrir este bloco, porque a base auditavel ja esta consistente em codigo e configuracao

### Bloco 14 - Observabilidade AWS

Feito:
- documentacao alinhada para CloudWatch/X-Ray/CloudTrail como alvo
- logs estruturados passaram a carregar `service`, `environment`, `requestId`, `correlationId` e `traceId`
- backend ganhou bootstrap unico de observabilidade com X-Ray opcional e Sentry opcional
- clientes AWS de `S3`, `SES` e `SNS` passaram a ficar prontos para instrumentacao X-Ray
- `backend/scripts/aws/apply-observability.ps1` passou a versionar criacao de log group, retention, metric filters, alarmes, dashboard e garantia de CloudTrail
- runbook operacional versionado em `doc/aws doc/AWS_OBSERVABILITY_RUNBOOK.md`

Status atual:
- `REPROVADO`

Falta:
- aplicar os recursos na conta AWS com sessao SSO valida
- informar `CloudTrailS3Bucket` real para criacao/garantia do trail
- executar o script com os identificadores reais de ECS/ALB/RDS/Redis do ambiente alvo

### Bloco 15 - Testes e validacao

Feito:
- `npm run prisma:generate`
- `npm run lint`
- `npm run build`
- `npm run test -- --runInBand`
- `npm run test:e2e`

Resultado atual:
- backend lint passando
- backend compilando
- 14 suites passando
- 157 testes passando
- `e2e` com 2 suites passando
- `e2e` com 2 testes passando
- frontend com `tsc --noEmit` passando
- frontend com `eslint` passando

Status atual:
- `APROVADO COM RESSALVAS`

Falta:
- build nativo Android continua dependente de SDK/adb restaurados no ambiente local
- validacao mobile/frontend ponta a ponta continua pendente

## Git e worktree

Feito:
- `.gitignore` atualizado para ignorar `.codex/recovery/`
- recovery artifacts removidos do indice do Git
- nenhuma limpeza destrutiva aplicada sobre mudancas amplas ja existentes

Status atual:
- worktree ainda esta grande e em reorganizacao
- sem bloqueio critico imediato

## AWS readiness atual

Status:
- `NAO PRONTO`

Melhorias concretas ja aplicadas:
- auth coerente com a regra de negocio
- SES como provider de email
- SNS como provider principal de push
- schema e migracoes avancadas para notificacao/push
- audit log real no backend

Bloqueios remanescentes principais:
- observabilidade AWS ainda incompleta
- push mobile ainda depende de credenciais reais SNS/APNs/FCM e migration aplicada no banco alvo
- SES ainda depende de identidade/remetente validados no ambiente AWS
- deploy AWS real ainda nao validado ponta a ponta

## Arquivos principais alterados neste ciclo

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260426170000_account_type_alignment/migration.sql`
- `backend/prisma/migrations/20260426174500_push_tokens_and_notification_delivery/migration.sql`
- `backend/src/common/email/email.service.ts`
- `backend/src/common/notification/notification.service.ts`
- `backend/src/common/audit/audit-log.service.ts`
- `backend/src/config/env.validation.ts`
- `backend/src/modules/auth/**`
- `backend/src/modules/feed/feed.service.ts`
- `backend/src/modules/events/events.service.ts`
- `backend/src/modules/products/products.service.ts`
- `backend/src/modules/chat/chat.service.ts`
- `backend/src/modules/notifications/**`
- `README.md`
- `AUDITORIA_PROMPT_AWS_2026-04-26.md`
- `doc/aws doc/**`

## Proximo alvo tecnico recomendado

1. aplicar observabilidade AWS real com `aws sso login --profile meuagito-admin`
2. criar/confirmar bucket do CloudTrail e executar `backend/scripts/aws/apply-observability.ps1`
3. aplicar migrations no banco alvo AWS
4. validar SES e SNS com credenciais reais

## Intervencao do usuario

No estado atual, nao existe bloqueio critico que exija sua intervencao imediata para o backend continuar evoluindo.

## Atualizacao complementar - 2026-04-29 (America/Sao_Paulo)

### Leitura desta rodada

Foi executada uma nova rodada de comparacao entre:
- codigo real do repositório
- documentacao canonica em `doc/`
- relatorios de auditoria/status da raiz

### O que foi confirmado

- o backend AWS-first continua consistente em codigo
- o frontend principal continua alinhado nos fluxos reais de auth, feed, busca, perfil de estabelecimento, catalogo e item
- observabilidade AWS continua como principal bloqueio de ambiente/deploy

### O que precisou ser corrigido nesta rodada

- a documentacao canonica ainda nao refletia totalmente a situacao atual do codigo
- a referencia canonica de API estava atrasada em relacao aos endpoints atuais
- `ActivityFavorites` e `ActivityHistory` ainda simulavam dados locais como se os recursos estivessem fechados

### Atualizacoes aplicadas

- snapshot canonico de estado atualizado para refletir a baseline atual
- roadmap canonico atualizado para separar backlog de codigo, backlog de ambiente e backlog de validacao manual
- referencia canonica da API atualizada com os contratos reais do backend
- telas de atividade ajustadas para expor o status real do recurso, sem mock enganoso

### Validacao executada

- `npm run lint` em `backend`: OK
- `npm run build` em `backend`: OK
- `npm test -- --runInBand` em `backend`: OK
- `npx tsc --noEmit` em `frontend`: OK
- `npm run lint` em `frontend`: OK
- `npm run test:e2e` em `backend`: NAO REPRODUZIDO nesta rodada

### Motivo objetivo do `e2e` nao reproduzido

- o banco de teste em `localhost:5433` estava indisponivel no host
- a checagem `Test-NetConnection localhost -Port 5433` retornou `TcpTestSucceeded=False`

### Leitura atualizada do status geral

Status do codigo versionado:
- forte

Status do ambiente de deploy real:
- ainda pendente

Status da documentacao canonica:
- realinhada nesta rodada, mas deve continuar sendo atualizada junto com novas validacoes

Status da validacao ponta a ponta:
- ainda pendente em mobile/manual

### Proximo alvo tecnico recomendado apos esta rodada

1. restaurar `postgres-test` em `localhost:5433` e reexecutar `npm run test:e2e`
2. decidir oficialmente se `favorites/history` entram no MVP com backend real ou permanecem fora do escopo atual
3. aplicar observabilidade AWS real na conta alvo
4. validar SES/SNS/migrations no ambiente AWS

## Atualizacao complementar - 2026-04-29 (America/Sao_Paulo) - Docker local

### O que foi revalidado

- `docker compose config`: OK
- `docker compose up -d postgres postgres-test redis`: OK
- `postgres`, `postgres-test` e `redis` subiram `healthy`
- `npm run prisma:migrate:prod` apontando para `localhost:5434`: OK
- as 6 migrations atuais foram aplicadas no banco principal Docker

### Ajustes aplicados no versionado para alinhar Docker com o backend

- `backend/Dockerfile` realinhado para fluxo multi-stage coerente com desenvolvimento e runtime
- `backend/.dockerignore` corrigido para nao excluir `src` do contexto de build
- `docker-compose.yml` corrigido com variaveis obrigatorias de ambiente, volume coerente do backend e bootstrap de migrations no container

### Situacao do banco de teste Docker

- `backend/.env.test` continua apontando para `localhost:5433`
- o container `postgres-test` voltou a subir corretamente
- o schema do banco de teste estava vazio logo apos a subida do container
- nesta rodada, as migrations SQL foram aplicadas diretamente no `postgres-test` para reconstituir o schema local

### Bloqueio objetivo restante

- `docker compose build backend`: FALHOU
- `docker build --target development -t meu-agito-backend-dev backend`: FALHOU
- padrao objetivo do erro: `failed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF`
- `docker info` mostrou Docker Desktop com apenas `2.842GiB` para a VM Linux
- o host Windows, no momento da validacao, estava com `FreePhysicalMemory=375948 KB` e `FreeVirtualMemory=142104 KB`
- o `npm run test:e2e` deixou de falhar por `5433` indisponivel e passou a falhar por `process out of memory`

### Leitura operacional correta agora

- o Compose do repositorio esta estruturalmente alinhado com o backend
- o banco principal Docker esta pronto com schema aplicado
- o banco de teste Docker pode ser reconstituido no container, mas o fluxo automatizado continua sensivel a memoria do host
- o bloqueio atual do build da imagem e do `e2e` e de ambiente local/memoria, nao de schema Prisma nem de incompatibilidade evidente do codigo versionado

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - Docker local finalizado

### O que foi fechado nesta rodada

- `docker compose up -d postgres postgres-test redis backend`: OK
- `meuagito-postgres`, `meuagito-postgres-test`, `meuagito-redis` e `meuagito-backend`: `healthy`
- `GET http://localhost:3001/health`: OK
- `npm run test:e2e` em `backend`: OK

### Ajuste final aplicado no versionado

- o `docker-compose.yml` local deixou de depender do build da imagem customizada para subir o backend em desenvolvimento
- o backend local passou a usar `node:20-alpine` com bootstrap em runtime, `node_modules` em volume nomeado e `healthcheck` explicito
- o `Dockerfile` continua util para pipeline/CI/ECR, mas nao e mais gargalo para subir o stack local

### Leitura correta do estado Docker apos o fechamento

- a parte Docker local necessaria para continuar evoluindo o codigo esta funcional
- o backend, o banco principal, o banco de teste e o Redis estao de pe no Compose
- o `e2e` voltou a passar com o `postgres-test` recriado e migrado automaticamente
- o gap restante ficou restrito a validacao do build da imagem customizada em host/runner com memoria estavel

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - fechamento adicional de codigo

### Correcoes aplicadas depois do fechamento Docker

- `ItemScreen` deixou de tratar evento como card generico e passou a carregar detalhe real via API
- o fluxo de login passou a respeitar o desafio real de 2FA no frontend
- a tela de configuracao de 2FA deixou de ser estatica e passou a usar `enable-2fa`, `verify-2fa` e `disable-2fa`
- `UsersService.getUserStats` deixou de retornar `postsCount` e `likesCount` fixos em `0`
- o roadmap canonico e o checklist AWS foram realinhados com o estado validado atual

### Revalidacao objetiva desta rodada complementar

- `npm run lint` em `frontend`: OK
- `npx tsc --noEmit` em `frontend`: OK
- `npm run lint` em `backend`: OK
- `npm run build` em `backend`: OK
- `npm test -- --runInBand` em `backend`: OK
- `npm run test:e2e` em `backend`: OK

### Leitura correta apos esta rodada

- o core backend continua fechado e validado
- o frontend ficou mais alinhado ao backend real e menos exposto a placeholder enganoso em fluxos de auth/evento/seguranca
- mesmo assim o projeto ainda nao pode ser classificado como totalmente pronto para deploy e producao
- continuam pendentes: observabilidade AWS real, ambiente AWS final, smoke mobile/manual e triagem das telas auxiliares ainda parciais fora do MVP

## Atualizacao complementar - 2026-04-30 (America/Sao_Paulo) - health/readiness expandido

### Correção aplicada

- `HealthService` deixou de responder apenas DB/cache simples e passou a consolidar:
  - DB via `SELECT 1`;
  - Redis/cache como dependencia obrigatoria quando `ENABLE_REDIS=true` ou `NODE_ENV=production`;
  - storage local/S3 via `StorageService.getHealthStatus()`.
- `StorageService` ganhou health de storage:
  - local: cria/acessa o diretório configurado;
  - S3: valida bucket/regiao e pode executar `HeadBucket` quando `HEALTHCHECK_VERIFY_STORAGE=true`.
- erros detalhados de dependencia sao redigidos em producao para nao expor host, credencial, bucket ou mensagem sensivel.
- `backend/.env.example`, `.env.test` e `.env.test.example` ganharam `HEALTHCHECK_VERIFY_STORAGE=false`.

### Validação executada

- `cd backend && npx jest src/modules/health/health.service.spec.ts --runInBand`: OK.
- `cd backend && npm run build`: OK com `NODE_OPTIONS=--max-old-space-size=4096`.
- `git diff --check`: OK.

### Leitura correta apos esta rodada

- o P0 local "health check expandido" fica RESOLVIDO no codigo.
- continua pendente de ambiente: validar `/health` no AWS staging real com RDS, ElastiCache Redis/Valkey e S3 reais atras do ALB.
