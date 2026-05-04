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

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - Catalogo/Item sem fallback fake

### Correção aplicada

- `CatalogScreen` deixou de manter `MOCK_CATALOGS` para prato, quarto, plano, procedimento, servico e evento.
- `CatalogScreen` agora usa apenas `catalogService.getEstablishmentProducts(establishmentId)` para listar produtos reais de estabelecimento.
- Catalogo aberto sem `establishmentId` passa a mostrar estado honesto de rota sem contexto, sem busca/filtros/cards simulados.
- O indicador visual `SHR` sem acao foi removido do cabecalho do Catalogo.
- `ItemScreen` deixou de criar `item-fallback`.
- `ItemScreen` deixou de exibir botoes genericos de pedido, reserva, agenda, assinatura ou carrinho quando nao existe backend real para o template.
- Produto e evento continuam usando APIs reais: `CatalogService.getProduct`, `LocationService.getEvent`, `attendEvent` e `cancelAttendance`.

### Validação executada

- `cd frontend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- Varredura no recorte `CatalogScreen.tsx`, `ItemScreen.tsx` e `CatalogService.ts`: sem `MOCK_CATALOGS`, `item-fallback`, `Fluxo fora do MVP`, `em breve`, `fake`, `dummy`, `sample`, `TODO`, `FIXME` ou `console.log`.

### Leitura correta apos esta rodada

- o P0 local "Catalog/Item sem fallback fake" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging com estabelecimento real, produto real, evento real e banco vazio sem seed.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - Delete account com senha validada

### Correção aplicada

- `SettingsDeleteAccountScreen` passou a enviar a senha digitada para `userStore.deleteAccount(password)`.
- `UserService.deleteAccount(password)` passou a chamar `DELETE /users/me` com body `{ password }`.
- `backend/src/modules/users/dtos/delete-account.dto.ts` foi criado para exigir senha no contrato.
- `UsersController` ganhou `DELETE /users/me` autenticado.
- `DELETE /users/:id` tambem passou a exigir senha para evitar bypass do endpoint antigo.
- `UsersService.softDelete(id, password)` passou a validar `bcrypt.compare`, bloquear senha invalida e revogar refresh tokens via `refreshToken.deleteMany`.
- Cache de perfil/stats do usuario e invalidado apos exclusao.

### Validação executada

- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK.
- `cd backend && npm test -- --runInBand`: OK, 15 suites e 162 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK com `NODE_OPTIONS=--max-old-space-size=8192`.
- `cd frontend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- Varredura de chamadas frontend: `deleteAccount` agora recebe senha nos pontos encontrados.

### Leitura correta apos esta rodada

- o P0 local "Delete account validando senha no backend" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging com senha correta, senha incorreta, logout apos exclusao e tentativa de refresh token apos soft delete.
- continua pendente de produto/LGPD: politica final de retencao/anonimizacao e suporte ao titular.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - Minha Conta real

### Correcao aplicada

- `SettingsMyAccountScreen` deixou de usar dados fixos, loading por timer, save simulado e botoes de foto sem acao.
- A tela passou a carregar o perfil autenticado via `userStore.getProfile()` ao entrar em foco.
- `UserService.updateAccount()` foi criado para salvar dados de conta em `PUT /users/me`.
- `UserService.updateProfile()` passou a salvar dados de perfil em `PUT /users/me/profile`.
- `SettingsMyAccountScreen` salva nome, e-mail, username, telefone e bio em endpoints reais e atualiza o estado com a resposta do backend.
- Upload de avatar passou a usar `expo-image-picker` e `POST /users/me/avatar`.
- `userStore` passou a expor `updateAccount` e a retornar o perfil atualizado em `getProfile`, `updateProfile` e `uploadAvatar`.
- `UpdateUserDto` passou a aceitar `username` e `phoneNumber`.
- `UsersService.update()` normaliza e-mail, username e telefone, marca `emailVerified=false` somente quando o e-mail muda e trata conflitos de unicidade com mensagens especificas.
- `UsersService.updateProfile()` permite limpar `bio` e continua usando o contrato de perfil.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd backend && npm run build`: OK.
- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK, 21 testes.
- `cd backend && npm test -- --runInBand`: OK, 15 suites e 162 testes.
- `cd frontend && npm run lint`: OK.
- `cd backend && npm run lint`: OK com `NODE_OPTIONS=--max-old-space-size=8192`.
- Varredura no recorte `SettingsMyAccountScreen.tsx`, `UserService.ts` e `userStore.ts`: sem `Joao`, `setTimeout` de simulacao, `onPress: () => {}` em foto, `console.log`, `TODO`, `FIXME`, `mock`, `fake`, `dummy` ou `sample`.

### Leitura correta apos esta rodada

- o P0 local "Minha Conta com dados fixos/upload vazio/save simulado" fica RESOLVIDO no codigo.
- o contrato `UserService.updateProfile` -> `PUT /users/me/profile` fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging salvando conta, bio e avatar em usuario real.
- continua pendente de infraestrutura: S3/CloudFront real para avatar.
- continua pendente de produto/seguranca: validar erro de e-mail/username duplicado e decidir fluxo final de verificacao quando e-mail for alterado.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - Refresh token sem sobrescrever Authorization

### Correcao aplicada

- `ApiClient` passou a preservar `Authorization` quando a chamada ja trouxe header explicito.
- O request interceptor agora injeta o access token apenas quando nao existe `Authorization` explicito.
- O response interceptor nao tenta fazer refresh automatico quando a propria chamada que retornou 401 e `/auth/refresh`.
- `AuthService.refreshToken(refreshToken)` continua usando `apiClient.post('/auth/refresh')`, mas o bearer de refresh nao e mais sobrescrito pelo access token em memoria/secure store.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "AuthService.refreshToken passando pelo interceptor que injeta access token" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging com access token expirado, refresh token valido, refresh token invalido, logout apos falha e app reiniciado com tokens persistidos.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - FeedService sem campo video invalido

### Correcao aplicada

- `FeedService` deixou de declarar `video` em `Post` e `CreatePostRequest`.
- `FeedService.createPost()` deixou de enviar `video` no payload de `POST /posts`.
- `FeedService.updatePost()` deixou de enviar `video` no payload de `PUT /posts/:id`.
- `feedStore.createPost()` e `feedStore.updatePost()` deixaram de aceitar/repassar argumento `video`.
- O contrato mobile agora bate com `CreatePostDto` e `UpdatePostDto`, que aceitam `content`, `imageUrls/images` e nao aceitam `video`.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `frontend/src`: sem ocorrencias de campo `video`; restaram apenas chamadas `createPost`/`updatePost` sem esse argumento.

### Leitura correta apos esta rodada

- o P0 local "FeedService enviando video para DTO que rejeita campo extra" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging criando post sem midia, criando post com imagem real e editando post existente.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - SignUp sem loading infinito

### Correcao aplicada

- `SignUpScreen` deixou de renderizar `ActivityIndicator` infinito quando aberta sem `profileType`.
- A tela agora exibe uma mensagem acionavel informando que o usuario precisa escolher o tipo de conta.
- O botao `Escolher tipo de conta` executa `navigation.replace('ProfileSelection')`.
- O link secundario direciona para `Login`.
- O fluxo normal de `ProfileSelection` para `SignUp` permanece com `profileType` e `nextSetupScreen`.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "SignUp sem profileType em loading infinito" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile abrindo cadastro pelo fluxo normal e abrindo `SignUp` diretamente sem parametros.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - MapScreen com navegacao real

### Correcao aplicada

- `MapScreen` passou a usar `useNavigation`.
- Item de lista deixou de ser `TouchableOpacity` sem acao e agora chama `handleOpenItem`.
- Evento navega para `Item` com `template: 'evento'` e id real do evento.
- Estabelecimento navega para `Profile` com `type: 'establishment'` e `establishmentId` real.
- Markers tambem ganharam `onCalloutPress` com o mesmo roteamento.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "MapScreen com item clicavel sem onPress" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging alternando mapa/lista, abrindo evento real, abrindo estabelecimento real, testando lista vazia e permissao/localizacao.

## Atualizacao complementar - 2026-05-01 (America/Sao_Paulo) - PersonalSetup real

### Correcao aplicada

- `PersonalSetupScreen` deixou de simular disponibilidade de username com `setTimeout`/`includes('taken')`.
- Backend recebeu `GET /users/username/availability`, protegido por JWT, com DTO e validacao de formato.
- `UsersService.isUsernameAvailable()` normaliza username, rejeita formato invalido e considera disponivel o username que ja pertence ao usuario autenticado.
- `UpdateUserDto` passou a validar o mesmo formato de username.
- Mobile passou a chamar `UserService.checkUsernameAvailability()`.
- Avatar do setup pessoal passou a usar `expo-image-picker` e `userStore.uploadAvatar()` contra `POST /users/me/avatar`.
- Botao de localizacao deixou de definir `Sao Paulo, SP` fixo e passou a usar `GeolocationService.getCurrentLocation()` + reverse geocode.
- Finalizacao do onboarding pessoal passou a persistir `PUT /users/me`, `PUT /users/me/profile` e so depois executar `completeOnboarding({ tab: 'Home' })`.
- A etapa de interesses foi removida do fluxo atual porque nao existe model/endpoint canonico para persistir preferencias/interesses sem criar backend novo.

### Validacao executada

- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `PersonalSetupScreen.tsx` para `setTimeout`, `taken`, `Sao Paulo`, `INTERESTS`, `selectedInterests`, `Pular`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log` e `onPress={() => {}}`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P0 local "PersonalSetup com username/GPS/avatar/finalizacao fake" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging com usuario pessoal novo, DB vazio, username livre/duplicado/invalido, permissao de localizacao concedida/negada e upload real em S3/CloudFront.
- continua pendente de produto/backend futuro: preferencias/interesses pessoais so podem voltar a UI depois de model/migration/DTO/controller/service reais ou decisao formal de escopo.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - SettingsCity real

### Correcao aplicada

- `SettingsCityScreen` deixou de usar `CITY_OPTIONS`, `recentCities`, lista fixa e historico local.
- O card "Usar minha localizacao" deixou de selecionar `Sao Paulo, SP` fixo.
- A tela passou a carregar o perfil real via `userStore.getProfile()` quando necessario.
- GPS passou a usar `GeolocationService.getCurrentLocation()` + `reverseGeocodeCoordinates()`.
- Cidade manual passou a ser validada e revisada antes da confirmacao.
- Confirmar cidade passou a chamar `userStore.updateProfile({ location })`, que usa `PUT /users/me/profile`, antes de voltar.
- Estados de loading, erro, localizacao em andamento e salvamento foram adicionados.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsCityScreen.tsx` para `CITY_OPTIONS`, `recentCities`, `Sao Paulo`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve` e `coming_soon`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P0 local "SettingsCity com cidade/GPS/recentes fake e confirmacao sem persistencia" fica RESOLVIDO no codigo.
- continua pendente de ambiente: smoke mobile/staging com cidade manual, permissao de localizacao concedida/negada, perfil recarregado apos salvar e impacto da cidade nos fluxos de descoberta.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Settings Security real parcial

### Correcao aplicada

- `useAuth` passou a expor `changePassword()`.
- `SettingsChangePasswordScreen` deixou de ser scaffold visual e passou a ter formulario real.
- A tela valida senha atual, nova senha, confirmacao e impede nova senha igual a atual antes de chamar backend.
- O submit chama `authStore.changePassword()` -> `AuthService.changePassword()` -> `POST /auth/change-password`.
- `SettingsSecurityScreen` removeu comentario vazio, texto mojibake e atalhos visiveis para dispositivos/historico sem backend.
- `SettingsDevicesScreen` e `SettingsAccessHistoryScreen` deixaram de exibir `Windows Chrome`, `Android Pixel`, cidades e horarios fixos.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsSecurityScreen.tsx` e `SettingsAuxScreens.tsx` para `Load security settings`, `Windows Chrome`, `Android Pixel`, `Sao Paulo, BR`, `Santos, BR`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve`, `coming_soon` e textos mojibake de seguranca: sem ocorrencias nos arquivos alterados.

### Leitura correta apos esta rodada

- o P0 local "SettingsChangePassword scaffold sem backend real" fica RESOLVIDO no codigo.
- o P1/P0 local "Dispositivos/historico com dados inventados visiveis pelo menu de seguranca" fica RESOLVIDO no codigo local para o caminho visivel.
- continua pendente de ambiente: smoke mobile/staging com senha atual correta, senha atual incorreta, confirmacao divergente, token expirado e 2FA.
- continua pendente de produto/backend futuro: sessoes/dispositivos/historico de acesso so devem voltar ao menu com endpoint real de sessoes/audit log.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Privacidade fora do caminho visivel

### Correcao aplicada

- A entrada `Privacidade` saiu do menu principal de Settings.
- `SettingsPrivacyScreen` deixou de usar `useFocusEffect`, `Switch`, radios locais, `publicAccount`, `messages`, `checkins` e `blockedCount`.
- A tela nao altera mais preferencias apenas em estado local.
- `SettingsBlockedUsersScreen` deixou de exibir lista vazia como se fosse dado real de bloqueios.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsPrivacyScreen.tsx`, `SettingsScreen.tsx` e `SettingsAuxScreens.tsx` para `Load privacy settings`, `publicAccount`, `setPublicAccount`, `messages`, `setMessages`, `checkins`, `setCheckins`, `SettingsPrivacy`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve` e `coming_soon`: sem ocorrencias relevantes, exceto a exportacao da tela registrada para rota interna.

### Leitura correta apos esta rodada

- o P0 local "Privacidade com switches/radios local-only" fica RESOLVIDO no codigo para o caminho visivel.
- continua pendente de produto/backend futuro: privacidade, mensagens, check-ins e bloqueios so devem voltar ao menu com model/migration/DTO/controller/service reais.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Settings sem preferencias auxiliares local-only

### Correcao aplicada

- `SettingsScreen` removeu `gpsEnabled`, `Switch`, fallback vazio de toggle e o item `Permissao de GPS`.
- `SettingsScreen` removeu as entradas `Raio de Busca`, `Notificacoes`, `Idioma` e `Desativar Conta` do caminho visivel.
- A zona de perigo manteve somente `Excluir Conta`, que ja usa backend real.
- `SettingsLinkedAccountsScreen`, `SettingsSearchRadiusScreen`, `SettingsNotificationsPrefsScreen` e `SettingsLanguageScreen` deixaram de exibir provedores, raios, switches e idiomas fixos caso sejam abertas indiretamente.
- Strings visiveis tocadas em `SettingsScreen` foram normalizadas para ASCII.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsScreen.tsx` e `SettingsAuxScreens.tsx` para `gpsEnabled`, `setGpsEnabled`, `SettingsSearchRadius`, `SettingsNotifications`, `SettingsLanguage`, `Desativar Conta`, `Conta desativada`, valores fixos de raio, provedores fixos, idiomas fixos, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve`, `coming_soon` e mojibake: sem ocorrencias relevantes, exceto exports de rotas auxiliares registradas.

### Leitura correta apos esta rodada

- o P0/P1 local "Settings com GPS/raio/notificacoes/idioma/desativar local-only" fica RESOLVIDO no codigo para o caminho visivel.
- continua pendente de produto/backend futuro: GPS como preferencia persistida, raio de busca, preferencias de notificacao, idioma, contas vinculadas e desativacao temporaria so devem voltar ao menu com contratos reais.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Activity sem cards futuros

### Correcao aplicada

- `ActivityScreen` foi reduzida a estado vazio simples.
- Cards de Pedidos, Agendamentos, Reservas, Favoritos e Historico sairam do hub de Activity.
- `Alert.alert('Em breve')` e `coming_soon` foram removidos.
- `ActivityFavoritesScreen` e `ActivityHistoryScreen` deixaram de mostrar textos de auditoria/backend/roadmap e passaram a estados vazios simples.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `ActivityScreen.tsx`, `ActivityFavoritesScreen.tsx` e `ActivityHistoryScreen.tsx` para `coming_soon`, `Em breve`, `STATUS REAL`, `backend`, `fake`, `mock`, `fora do escopo`, `MVP`, `proximo passo`, `lacuna`, `contrato`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Pedidos`, `Agendamentos` e `Reservas`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P1/P0 local "Activity com cards futuros/Em breve/textos de auditoria na UI" fica RESOLVIDO no codigo para o caminho visivel.
- continua pendente de produto/backend futuro: favoritos, historico, pedidos, agendamentos e reservas so devem voltar ao hub com endpoints/telas reais.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Search sem buscas recentes fixas

### Correcao aplicada

- Constante `RECENT_SEARCHES` removida de `SearchScreen`.
- Handler `handleRecentPress` removido.
- Secao `Buscas rapidas` removida.
- Tela inicial de busca mostra categorias/taxonomia local e a busca continua consumindo `searchService.searchEstablishments()`.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SearchScreen.tsx` para `RECENT_SEARCHES`, `Buscas rapidas`, `recent`, `historico`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log` e `onPress={() => {}}`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P1 local "Search com buscas recentes fixas" fica RESOLVIDO no codigo.
- continua pendente de produto/backend futuro: historico real de busca so deve voltar com storage/endpoint real ou sugestao editorial explicitamente definida.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Notificacoes sem placeholders e com roteamento por entidade

### Correcao aplicada

- `NotificationsScreen` deixou de exibir `??` e `?` como placeholders visuais.
- Avatares de tipo agora usam labels textuais curtos (`SO`, `ES`, `PD`, `SI`).
- Clique em notificacao de conversa abre `MainTabs -> Chat -> ChatDetail` com `conversationId` e `recipientName`.
- Clique em notificacao de estabelecimento abre `Profile` com `establishmentId`.
- Clique em notificacao de produto abre `Item` com `template: produto` e `productId`.
- Clique em notificacao de evento abre `Item` com `template: evento` e `item.id`.
- Historico da rodada: `relatedUserId` nao foi roteado naquela execucao porque o destino ainda nao carregava perfil publico por `userId`. Status posterior: corrigido na atualizacao seguinte de perfil publico por userId.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `NotificationsScreen.tsx` para `??`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve`, `coming soon`, `placeholder` e `console.log`: apenas `??` de nullish coalescing em `item.isRead ?? false`, sem placeholder visual.

### Leitura correta apos esta rodada

- o P1 local "Notifications com placeholders visuais e perda de parametros de conversa/entidade" fica RESOLVIDO parcialmente no codigo.
- status posterior: perfil publico por `relatedUserId` foi implementado na atualizacao seguinte; continua pendente smoke com payload real em staging/device.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Perfil publico por userId conectado

### Correcao aplicada

- `UsersService.getPublicProfile()` retorna explicitamente apenas campos publicos e inclui `postsCount`.
- `UserService` recebeu `PublicUserProfile` e `getPublicProfile(userId)` apontando para `GET /users/:id/public-profile`.
- `ProfileScreen` passou a consumir `route.params.userId` para carregar perfil publico real.
- `FeedSocialScreen` agora navega para `Profile` com `{ type: 'user', userId }`, contrato consumido pelo destino.
- `NotificationsScreen` reativou `relatedUserId` para abrir perfil publico real.
- Texto de auditoria/roadmap visivel no perfil pessoal foi removido.

### Validacao executada

- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK, 27 testes.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `ProfileScreen.tsx`, `FeedSocialScreen.tsx` e `NotificationsScreen.tsx` para `blocos`, `tratado`, `alvo`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `Em breve` e `coming soon`: sem texto de auditoria/roadmap visivel; ocorrencia restante de `placeholder` e placeholder de input no modal de comentario.

### Leitura correta apos esta rodada

- o P1 local "perfil publico por userId ignorado pelo destino" fica RESOLVIDO no codigo.
- o `relatedUserId` de notificacoes passa a ter destino real.
- continua pendente: smoke com autor usuario, autor estabelecimento, usuario inexistente e notificacao real.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Rotas auxiliares de Settings fora do release

### Correcao aplicada

- `RootNavigator.tsx` deixou de registrar `SettingsLinkedAccounts`, `SettingsSearchRadius`, `SettingsNotifications`, `SettingsPrivacy`, `SettingsBlockedUsers`, `SettingsDevices`, `SettingsAccessHistory` e `SettingsLanguage`.
- Permanecem no `SettingsStack` somente os fluxos de release atual: minha conta, cidade, seguranca, alterar senha, 2FA, sobre e excluir conta.
- Os arquivos das telas auxiliares foram mantidos como backlog documentado; elas so devem voltar com backend/escopo real.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `RootNavigator.tsx` para as rotas removidas: sem ocorrencias.

### Leitura correta apos esta rodada

- o P1 local "Settings auxiliares sem backend ainda registradas no navigator" fica RESOLVIDO no codigo.
- continua pendente: criar contratos reais antes de reexibir privacidade, bloqueios, dispositivos, historico de acessos, contas vinculadas, raio, preferencias de notificacao e idioma.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Item sem texto visivel de auditoria

### Correcao aplicada

- `ItemScreen` deixou de exibir cards "Escopo atual" em produto e evento.
- Produto/evento continuam consumindo backend real; apenas saiu a explicacao tecnica visivel ao usuario final.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `ItemScreen.tsx` para `Escopo atual`, `fora do escopo`, `backend`, `contrato`, `bloco`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve`, `coming soon` e `placeholder`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P1 local "Item com texto de auditoria/escopo visivel" fica RESOLVIDO no codigo.
- continua pendente: smoke de produto real, evento real, presenca, rota invalida e banco vazio em staging/device.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Home sem badge falso de evento futuro

### Correcao aplicada

- `HomeScreen.formatEventBadge()` deixou de retornar `EM BREVE` quando o evento vem sem data.
- O fallback agora e `SEM DATA`, estado honesto para dado ausente.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `HomeScreen.tsx` para `EM BREVE`, `coming soon`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME` e `console.log`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P2 local "Home com `EM BREVE` para evento sem data" fica RESOLVIDO no codigo.
- continua pendente: smoke de Home com evento com data, evento sem data, resultado vazio e erro de API.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Validacao de ambiente bloqueia producao sem AWS real

### Correcao aplicada

- `backend/src/config/env.validation.ts` passou a bloquear `NODE_ENV=production` sem `STORAGE_PROVIDER=s3`.
- Producao com S3 agora exige `USE_CLOUDFRONT=true` e `CLOUDFRONT_BASE_URL` ou `AWS_CLOUDFRONT_URL`.
- Producao agora exige `EMAIL_PROVIDER=ses`.
- Producao agora exige `PUSH_PROVIDER=sns`.
- Producao com SNS agora exige `AWS_SNS_PLATFORM_APPLICATION_ARN` ou `AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID`, preservando primeiro release Android-only sem exigir APNs/iOS antes da decisao de release.
- Criado `backend/src/config/env.validation.spec.ts` para cobrir dev sem AWS, producao bloqueada sem providers, lacunas de CloudFront/SNS e producao completa.

### Validacao executada

- `cd backend && npx jest src/config/env.validation.spec.ts --runInBand`: OK, 4 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "backend permite producao com S3/CloudFront/SES/SNS desligados" fica RESOLVIDO no codigo.
- continua pendente: criar staging AWS real, secrets reais, healthcheck expandido em ambiente real, smoke de upload S3/CloudFront, envio SES e push SNS em dispositivo real.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - 2FA sem comentario incorreto de placeholder

### Correcao aplicada

- `backend/src/modules/auth/auth.service.ts` nao diz mais que a verificacao 2FA usa placeholder.
- O comentario agora reflete o codigo real: `setupTwoFactorAuth()` gera secret real, persiste `twoFactorSecret` e `verifyTwoFactorAuth()` valida TOTP com esse segredo.
- O plano foi atualizado para nao tratar o 2FA como stub runtime; a pendencia restante e smoke real.

### Validacao executada

- `cd backend && npx jest src/modules/auth/auth.spec.ts --runInBand`: OK, 12 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P2 local "comentario 2FA diz placeholder apesar do codigo usar secret persistido" fica RESOLVIDO no codigo.
- continua pendente: smoke de ativar 2FA, login com 2FA e desativar 2FA em staging/device.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - ItemScreen sem CTAs genericos sem backend

### Correcao aplicada

- Nao houve alteracao de runtime nesta rodada; a tarefa foi sincronizar o plano com o codigo atual.
- `ItemScreen` foi revalidado e nao contem mais `Agendar`, `Reservar`, `Assinar`, carrinho ou alerta de fluxo fora do MVP.
- Produto real abre estabelecimento e evento real confirma/cancela presenca via backend.
- Templates sem backend real caem em estado `Item indisponivel`, sem CTA fake.

### Validacao executada

- Varredura em `frontend/src/screens/main/ItemScreen.tsx` para `Agendar`, `Reservar`, `Assinar`, `Carrinho`, `Comprar`, `pedido`, `MVP`, `fora do escopo`, `Fluxo fora`, `Em breve`, `coming soon`, `mock`, `fake`, `dummy`, `sample`, `TODO` e `FIXME`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P1 local "CTAs genericos de Item sem backend" fica RESOLVIDO no codigo.
- continua pendente: smoke de produto real, evento real, presenca, rota invalida e banco vazio em staging/device.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - CatalogScreen sem MOCK_CATALOGS no codigo atual

### Correcao aplicada

- Nao houve alteracao de runtime nesta rodada; a tarefa foi sincronizar o plano com o codigo atual.
- `CatalogScreen` foi revalidado e nao contem `MOCK_CATALOGS` nem dados fake de catalogo.
- Sem `establishmentId`, a tela mostra estado honesto de catalogo indisponivel.
- Com `establishmentId`, a tela usa `catalogService.getEstablishmentProducts(establishmentId)` e navega para `Item` com `productId`.

### Validacao executada

- Varredura em `frontend/src/screens/main/CatalogScreen.tsx` para `MOCK_CATALOGS`, `mock`, `fake`, `dummy`, `sample`, `item-fallback`, `Em breve`, `coming soon`, `TODO` e `FIXME`: sem ocorrencias.
- Leitura de `frontend/src/services/api/CatalogService.ts`: `getEstablishmentProducts()` e `getProduct()` usam endpoints reais.

### Leitura correta apos esta rodada

- o P0 local "CatalogScreen com MOCK_CATALOGS" fica RESOLVIDO no codigo.
- continua pendente: smoke de perfil de estabelecimento real, vitrine vazia, vitrine com produtos e rota sem `establishmentId` em staging/device.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - API URL mobile obrigatoria em release build

### Correcao aplicada

- `frontend/src/utils/runtimeApiUrl.ts` deixou de usar fallback hardcoded para `https://api.meuagito.com`.
- Runtime nao-dev agora exige `EXPO_PUBLIC_API_URL`.
- Runtime nao-dev bloqueia API URL local (`localhost`, `127.0.0.1`, `0.0.0.0`, `10.0.2.2`).
- Desenvolvimento continua com fallback local/host Expo.
- Criado `frontend/src/utils/runtimeApiUrl.test.ts` cobrindo dev sem env, release sem env, release com URL local e release com URL real.

### Validacao executada

- `cd frontend && npx jest src/utils/runtimeApiUrl.test.ts --runInBand`: OK, 4 testes.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "build mobile pode apontar silenciosamente para API default sem `EXPO_PUBLIC_API_URL`" fica RESOLVIDO no codigo.
- continua pendente: definir `EXPO_PUBLIC_API_URL` real no build staging/prod e validar chamadas em dispositivo real.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Registro automatico de push protegido por feature flag

### Correcao aplicada

- `PushRegistrationService.registerCurrentDevice()` nao solicita permissao nem registra token se `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION` nao estiver habilitado.
- A flag aceita `1`, `true`, `yes` ou `on`.
- `README.md` foi atualizado para refletir que o registro de push token apos login/onboarding e opcional por flag.
- O fluxo SNS/backend continua preparado, mas o app nao aciona push incompleto por default enquanto Android/iOS via SNS + FCM/APNs nao estiver validado.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P1/P0 condicional "app solicita permissao/registra push automaticamente antes de validar estrategia SNS + FCM/APNs" fica RESOLVIDO parcialmente no codigo.
- continua pendente: decidir se push entra no primeiro release; se entrar, validar token nativo Android via FCM como transporte tecnico, APNs/iOS, SNS platform ARNs e smoke em dispositivo real.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Decisao sobre modernizacao Android pos-APK

### Decisao registrada

- A geracao do APK staging deve priorizar a stack atual do projeto para nao misturar smoke funcional com upgrade estrutural.
- A modernizacao de tecnologia Android fica documentada como fase posterior ao APK staging aprovado em aparelho fisico.
- A fase futura deve revisar Expo SDK, React Native, Gradle Wrapper, Android Gradle Plugin, Kotlin, JDK de build e dependencias Expo/RN.
- Para a stack atual Expo 50 / React Native 0.73 / Android Gradle Plugin 8.1.1, JDK 17 e o caminho pragmatico de build; upgrade para JDK/Gradle mais novos deve ocorrer em fase propria e validada.
- Push Android oficial continua sendo AWS SNS como orquestrador, com FCM apenas como transporte tecnico necessario para entrega nativa no Android. Firebase Auth/Firestore/Storage/Functions continuam fora da arquitetura.

### Criterio para executar essa modernizacao

- Executar somente depois que o APK staging estiver instalado em aparelho fisico e os fluxos principais forem aprovados contra o backend AWS staging.
- Antes da loja, rodar `npx expo install --check`, `npm run lint`, `npx tsc --noEmit`, build Android release e smoke real no dispositivo.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Build APK staging bloqueado por pagefile do Windows

### Validacoes/correcoes executadas

- JDK 17 local completo instalado em `F:\Android\jdk-17`.
- `frontend/scripts/bootstrap-android-env.ps1` passou a usar `F:\Android\jdk-17` como padrao de build.
- `frontend/android/build.gradle` teve a dependencia `com.google.gms:google-services` removida.
- `frontend/android/app/build.gradle` teve o plugin `com.google.gms.google-services` removido.
- `frontend/android/app/src/main/AndroidManifest.xml` recebeu `android:usesCleartextTraffic="true"` para APK staging HTTP.
- `expo-secure-store` alinhado para `~12.8.1`.
- Pacotes nativos alinhados com Expo SDK 50 via `npx expo install`; `npx expo install --check`: OK.
- `frontend/android/gradle.properties` ajustado para reduzir consumo de memoria no host local.

### Evidencia do bloqueio

- `assembleRelease` avancou ate compilacao nativa C++ do NDK.
- Falha final do NDK/clang: `O arquivo de paginacao e muito pequeno para que esta operacao seja concluida. (0x5AF)`.
- Diagnostico do Windows: `AutomaticManagedPagefile=false`; memoria virtual total igual a memoria fisica, indicando pagefile desativado/insuficiente.
- O PowerShell atual nao esta em modo administrador (`IsAdmin=false`), portanto nao consegue ajustar pagefile.

### Leitura correta

- O bloqueio atual nao e backend, API, Expo matrix nem Firebase.
- O bloqueio atual e ambiente local Windows: pagefile desativado/insuficiente para compilar C++ nativo Android (`react-native-reanimated`/`expo-modules-core`).
- Proximo passo obrigatorio: ativar pagefile no Windows em PowerShell Administrador e reiniciar a maquina antes de repetir `assembleRelease`.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Gestao owner basica de produtos conectada

### Correcao aplicada

- `CatalogService` recebeu metodos reais para criar, editar, arquivar e enviar imagem principal de produto.
- Criada `ProductManagementScreen` com lista real, formulario de criacao/edicao, arquivamento com confirmacao e upload via `expo-image-picker` + multipart.
- `RootNavigator` registrou a rota `ProductManagement`.
- `ProfileScreen` exibe `Gerenciar vitrine` apenas no perfil owner do estabelecimento.
- `README.md` e plano foram atualizados para marcar a lacuna owner de produtos como resolvida em codigo.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- `cd backend && npx jest src/modules/products/products.spec.ts --runInBand`: OK, 5 testes.
- Varredura em `ProductManagementScreen.tsx` para `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve`, `coming soon`, `console.log` e `onPress={() => {}}`: sem ocorrencias.

### Leitura correta apos esta rodada

- o P1 local "backend de gestao de produtos sem UI owner" fica RESOLVIDO no codigo.
- continua pendente: smoke de criar, editar, arquivar e enviar imagem principal em staging/device; validar 403 para nao owner e S3/CloudFront real.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Consentimento legal persistido no cadastro

### Correcao aplicada

- `User` recebeu campos de consentimento legal: `termsAcceptedAt`, `termsVersion`, `privacyPolicyAcceptedAt` e `privacyPolicyVersion`.
- Criada migration `20260502190000_add_user_legal_consents`.
- `SignUpDto` passou a exigir `termsAccepted=true` e `privacyPolicyAccepted=true`.
- `AuthService.signup()` valida consentimento tambem em chamada direta ao service e grava as versoes atuais de `LEGAL_DOCUMENTS`.
- Mobile envia os aceites no payload de signup apos o checkbox obrigatorio.
- `README.md` e plano foram atualizados para registrar que o aceite legal versionado esta resolvido no codigo local.

### Validacao executada

- `cd backend && npx prisma generate`: OK.
- `cd backend && npx jest src/modules/auth/auth.spec.ts --runInBand`: OK, 13 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "cadastro exige aceite visual, mas backend nao registra consentimento/versionamento" fica RESOLVIDO no codigo.
- continuam pendentes: aplicar migration em staging/prod, validar signup em device/staging, revisar conteudo juridico final, definir suporte monitorado e fechar retencao/anonimizacao LGPD.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Suporte configuravel e obrigatorio em release

### Correcao aplicada

- Backend passa a exigir `SUPPORT_EMAIL` em `NODE_ENV=production`.
- `SUPPORT_EMAIL` e validado como e-mail quando informado.
- Documentos legais usam `SUPPORT_EMAIL` como contato do controlador, com fallback somente local/dev.
- Mobile resolve suporte por `EXPO_PUBLIC_SUPPORT_EMAIL`; build de release sem essa env falha explicitamente ao tentar abrir suporte.
- Criado `frontend/.env.example` com API URL, suporte e flags publicas de push.
- `README.md` e plano foram atualizados para registrar o suporte configuravel.

### Validacao executada

- `cd backend && npx jest src/config/env.validation.spec.ts --runInBand`: OK, 5 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npx jest src/services/legal/LegalLinks.test.ts --runInBand`: OK, 4 testes.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "suporte/contato hardcoded sem env de producao" fica RESOLVIDO no codigo.
- continuam pendentes: definir caixa/canal real monitorado, configurar envs em staging/prod, validar abertura do suporte em device e revisar conteudo juridico final.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Redacao central de logs sensiveis

### Correcao aplicada

- `logStructured` passou a sanitizar o contexto antes de serializar para console/CloudWatch.
- Chaves sensiveis como senha, token, refresh token, Authorization, cookie, secret, api key e chaves AWS sao redigidas como `[REDACTED]`.
- Strings com `Bearer <token>` e padroes `token=...`/`password=...` tambem sao redigidas.
- O sanitizador cobre objetos aninhados, arrays, datas e referencia circular.
- `README.md` e plano foram atualizados para registrar que a redacao central existe no codigo local.

### Validacao executada

- `cd backend && npx jest src/common/logging/structured-log.spec.ts src/common/audit/audit-log.service.spec.ts --runInBand`: OK, 5 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "logs estruturados sem redacao central de senha/token/secret" fica RESOLVIDO no codigo.
- continua pendente: validar logs reais em staging/CloudWatch com falhas de auth, email, push, upload e requests 4xx/5xx.

## Atualizacao complementar - 2026-05-02 (America/Sao_Paulo) - Deep links de e-mail para verificacao e reset

### Correcao aplicada

- `frontend/app.json` registrou o scheme `meuagito`.
- `NavigationContainer` passou a receber config `linking` fora do modo web preview.
- Criado `frontend/src/screens/navigation/linking.ts` com rotas `verify-email` e `reset-password`.
- `VerifyEmailScreen` e `ForgotPasswordScreen` agora leem `route.params.token` e preenchem o campo de codigo quando abertos por deep link.
- `backend/.env.example` documenta uso de `FRONTEND_URL=meuagito://` para links de e-mail mobile em staging/prod.
- `README.md` e plano foram atualizados com o fluxo de links de e-mail.

### Validacao executada

- `cd frontend && npx jest src/screens/navigation/linking.test.ts --runInBand`: OK, 1 teste.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "email link aponta para rota sem deep link mobile configurado" fica RESOLVIDO no codigo.
- continuam pendentes: validar deep links em device real, SES real e `FRONTEND_URL` staging/prod.

## Atualizacao complementar - 2026-05-03 (America/Sao_Paulo) - Separacao staging economico e producao real

### Correcao aplicada

- Criado `DEPLOY_ENV` para separar staging economico de producao publica sem criar duas bases de codigo.
- `NODE_ENV=production` + `DEPLOY_ENV=staging` permite rodar backend otimizado em EC2/RDS/S3 sem Redis obrigatorio inicialmente, mantendo S3 obrigatorio para validar midia real.
- `DEPLOY_ENV=production` continua exigindo Redis/Valkey, S3, CloudFront, SES e SNS para release publico.
- Cache, Socket.IO adapter, rate limit e health check agora usam `DEPLOY_ENV=production` para decidir quando Redis e obrigatorio.
- Validador de env deixou de exigir access key fixa para S3 quando a AWS fornece credenciais por IAM role.
- Criados `backend/.env.staging.example` e `backend/.env.production.example`.
- `README.md` e plano foram atualizados com a decisao de staging economico antes de producao real.

### Validacao executada

- `cd backend && npx jest src/config/env.validation.spec.ts src/common/rate-limit/redis-throttler.storage.spec.ts --runInBand`: OK, 12 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

### Leitura correta apos esta rodada

- o P0 local "staging AWS economico fica bloqueado por Redis/SES/SNS/CloudFront obrigatorios" fica RESOLVIDO no codigo.
- continuam pendentes: provisionar staging EC2/RDS/S3/Secrets/SSM/IAM, aplicar migrations no RDS staging, configurar mobile para API staging e executar smoke manual em device real.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Staging AWS economico online

### Infra criada e validada

- S3 staging `meuagito-staging-media-139023234711` criado com public access block, AES256 e ownership enforced.
- IAM role `MeuAgitoStagingEc2Role` e instance profile `MeuAgitoStagingEc2InstanceProfile` criados/validados.
- Security groups criados: EC2 `sg-0f6fc4722cf33221f`; RDS `sg-04eaa9e032f0faa61`.
- RDS PostgreSQL staging `meuagito-staging-postgres` criado em `db.t4g.micro`, privado, storage encrypted, database `meuagito_staging`.
- SSM SecureString criado para senha RDS, `DATABASE_URL`, `JWT_SECRET` e `REFRESH_TOKEN_SECRET`.
- EC2 staging `i-0153e08df4575df4e` criada em Amazon Linux 2023 ARM, `t4g.micro`, SSM online, Node `v20.20.2`.
- Backend extraido em `/opt/meuagito/backend`, migrations aplicadas e servico systemd `meuagito-backend` habilitado.

### Validacao executada

- `npx prisma migrate deploy`: OK, 7 migrations aplicadas no RDS staging.
- `npx prisma generate`: OK.
- `npm run build`: OK na EC2.
- `systemctl status meuagito-backend --no-pager -l`: `active (running)`.
- Servico `meuagito-backend` esta `enabled`; continua rodando ao fechar SSM/PowerShell, reinicia se o processo Node cair e sobe no boot da EC2.
- `curl http://127.0.0.1:3001/health` na EC2: `status=ok`, database ok, storage s3 ok.
- `Invoke-RestMethod http://18.228.6.219:3001/health`: `status=ok`, database ok, storage s3 ok.

### Leitura correta apos esta rodada

- staging AWS economico esta online para smoke de API backend.
- backend permanece online fora da sessao SSM porque roda por `systemd`.
- Redis, SES, SNS, CloudFront, ALB/ACM e ECS/Fargate continuam fora deste staging inicial por decisao de custo.
- Pendente: smoke de auth/signup/login, upload S3 real, endpoints principais e apontamento do mobile para `http://18.228.6.219:3001`.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke signup staging

### Validacao executada

- `POST http://18.228.6.219:3001/auth/signup`: OK.
- Usuario staging criado no RDS: `smoke+20260504003829@meuagito.com`.
- Tokens de acesso/refresh retornados: OK.
- `verificationEmailSent=false`: esperado neste staging inicial porque `EMAIL_PROVIDER=none`.
- Senha e resposta completa com tokens foram salvas apenas em `.local-secrets` com DPAPI, sem plaintext versionavel.

### Leitura correta apos esta rodada

- cadastro real no backend AWS staging esta validado.
- pendente: smoke login, `/users/me`, upload S3 real e apontamento do mobile para staging.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke login staging

### Validacao executada

- `POST http://18.228.6.219:3001/auth/login`: OK.
- Usuario autenticado: `smoke+20260504003829@meuagito.com`.
- Access token e refresh token retornados: OK.
- `expiresIn=900`: OK.
- Resposta completa com tokens foi salva apenas em `.local-secrets` com DPAPI.

### Leitura correta apos esta rodada

- login real no backend AWS staging esta validado.
- pendente: smoke `/users/me`, upload S3 real e apontamento do mobile para staging.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke usuario autenticado staging

### Validacao executada

- `GET http://18.228.6.219:3001/users/me` com Bearer token: OK.
- Usuario retornado: `smoke+20260504003829@meuagito.com`.
- `emailVerified=false`: esperado porque SES esta desativado neste staging inicial.

### Leitura correta apos esta rodada

- cadeia `signup -> login -> JWT -> users/me` esta validada no backend AWS staging.
- pendente: upload S3 real e apontamento do mobile para staging.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke upload S3 staging

### Validacao executada

- `POST http://18.228.6.219:3001/media/upload/avatar?entityId=...` com Bearer token: OK.
- `Provider=S3`.
- Bucket usado: `meuagito-staging-media-139023234711`.
- Media criada: `cmoqnn0th0008ubvh0nqar5nw`.
- Storage path criado em `avatars/...png`.
- `aws s3api head-object`: OK, `ContentLength=68`, `ContentType=image/png`, `ServerSideEncryption=AES256`.

### Leitura correta apos esta rodada

- upload/midia real para S3 esta validado no backend AWS staging.
- pendente: smoke de endpoints principais restantes e apontamento do mobile para staging.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke feed vazio staging

### Validacao executada

- `GET http://18.228.6.219:3001/feed/agito` sem token: retornou `UNAUTHORIZED`, comportamento esperado.
- `GET http://18.228.6.219:3001/feed/agito` com Bearer token: OK.
- Resposta autenticada: `data=[]`, `mode=mixed`, `limit=15`, `hasMore=false`, `nextCursor=null`.

### Leitura correta apos esta rodada

- feed autenticado funciona com banco vazio e nao retornou mock/fake.
- pendente: smoke de busca/listagens, estabelecimentos/produtos se aplicavel, e apontamento do mobile para staging.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke busca vazia staging

### Validacao executada

- `GET http://18.228.6.219:3001/search/global?q=naoexiste-smoke-20260504` sem token: retornou `UNAUTHORIZED`, comportamento esperado.
- `GET http://18.228.6.219:3001/search/global?q=naoexiste-smoke-20260504` com Bearer token: OK.
- Resposta autenticada: `posts=[]`, `users=[]`, `events=[]`, `establishments=[]`, `total=0`.

### Leitura correta apos esta rodada

- busca autenticada funciona com banco vazio e nao retornou mock/fake.
- pendente: smoke de listagem de estabelecimentos/produtos quando houver dado minimo, e apontamento do mobile para staging.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke estabelecimentos vazios staging

### Validacao executada

- `GET http://18.228.6.219:3001/establishments`: OK.
- Resposta: `data=[]`, `total=0`, `page=1`, `limit=10`, `totalPages=0`.

### Leitura correta apos esta rodada

- listagem publica de estabelecimentos funciona com banco vazio e nao retornou mock/fake.
- pendente: criar dado minimo real de estabelecimento/produto, validar catalogo, e apontar mobile para staging.

## Decisao registrada - 2026-05-04 (America/Sao_Paulo) - CSV de estabelecimentos e reivindicacao

- CSV de estabelecimentos pode ser usado para popular o banco em momento posterior.
- Importacao nao deve criar contas reais de donos.
- Dados importados devem ser tratados como estabelecimentos pre-cadastrados/nao reivindicados.
- Fluxo correto futuro: usuario empresarial cria conta, busca estabelecimento, solicita reivindicacao e recebe acesso apos validacao/aprovacao.
- Antes de producao publica, validar origem/licenca dos dados de scraping e riscos juridicos.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke permissao de estabelecimento

### Validacao executada

- `POST http://18.228.6.219:3001/establishments` com token de conta `USER`: retornou `FORBIDDEN`.
- Mensagem: `Only ESTABLISHMENT accounts can create an establishment page`.

### Leitura correta apos esta rodada

- regra de permissao para criacao de estabelecimento esta ativa no staging.
- proximo teste deve usar conta `ESTABLISHMENT`.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke conta empresarial staging

### Validacao executada

- `POST http://18.228.6.219:3001/auth/signup` com `profileType=ESTABLISHMENT`: OK.
- Usuario empresarial criado: `smoke-business+20260504005654@meuagito.com`.
- Tokens de acesso/refresh retornados: OK.
- `verificationEmailSent=false`: esperado neste staging inicial porque `EMAIL_PROVIDER=none`.
- Senha e resposta completa com tokens foram salvas apenas em `.local-secrets` com DPAPI.

### Leitura correta apos esta rodada

- conta empresarial real no backend AWS staging esta validada.
- pendente: criar estabelecimento real com token empresarial.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke estabelecimento staging

### Validacao executada

- `POST http://18.228.6.219:3001/establishments` com token empresarial: OK.
- Estabelecimento criado: `Smoke Bar Staging`.
- ID: `cmoqo5mfy000fubvhz5khnkio`.
- Owner ID: `cmoqo47rv0009ubvhni0owr7h`.
- `isPublic=true`.
- Resposta completa foi salva apenas em `.local-secrets` com DPAPI.

### Leitura correta apos esta rodada

- criacao real de estabelecimento no backend AWS staging esta validada.
- pendente: validar listagem/detalhe e produtos/catalogo.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke listagem de estabelecimento com dado real

### Validacao executada

- `GET http://18.228.6.219:3001/establishments`: OK.
- `total=1`.
- Primeiro item: `cmoqo5mfy000fubvhz5khnkio`, `Smoke Bar Staging`, categoria `bar`.

### Leitura correta apos esta rodada

- listagem publica retorna dado real criado no RDS staging.
- pendente: validar detalhe e produtos/catalogo.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke detalhe de estabelecimento

### Validacao executada

- `GET http://18.228.6.219:3001/establishments/cmoqo5mfy000fubvhz5khnkio`: OK.
- Retornou `Smoke Bar Staging`, owner correto e `isPublic=true`.
- Produtos antes da criacao: `null`/`0`, comportamento esperado.

### Leitura correta apos esta rodada

- detalhe publico de estabelecimento real esta validado no staging.
- pendente: criar produto real e validar catalogo/listagem.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke produto staging

### Validacao executada

- `POST http://18.228.6.219:3001/establishments/cmoqo5mfy000fubvhz5khnkio/products` com token do dono: OK.
- Produto criado: `Combo Smoke Staging`.
- ID: `cmoqobh70000iubvhxnldzovo`.
- Preco: `39.9`.
- Status: `ACTIVE`.
- Resposta completa foi salva apenas em `.local-secrets` com DPAPI.

### Leitura correta apos esta rodada

- criacao real de produto/catalogo esta validada no backend AWS staging.
- pendente: validar listagem publica e detalhe de produto.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke listagem publica de produtos

### Validacao executada

- `GET http://18.228.6.219:3001/establishments/cmoqo5mfy000fubvhz5khnkio/products`: OK.
- Produto retornado: `Combo Smoke Staging`.
- `mainImageUrl=null` e `imageUrl=null`: esperado antes de upload de imagem do produto.

### Leitura correta apos esta rodada

- catalogo publico do estabelecimento retorna produto real criado no RDS staging.
- pendente: validar detalhe de produto e imagem de produto se necessario.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Smoke detalhe de produto

### Validacao executada

- `GET http://18.228.6.219:3001/products/cmoqobh70000iubvhxnldzovo`: OK.
- Produto retornado: `Combo Smoke Staging`, categoria `Combos`, preco `39.9`, status `ACTIVE`.
- `establishmentId=cmoqo5mfy000fubvhz5khnkio`.

### Leitura correta apos esta rodada

- detalhe publico de produto real esta validado no backend AWS staging.
- proximo bloco recomendado: apontar mobile para staging e executar smoke manual no app.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Tratamento de 409 no cadastro empresarial mobile

### Evidencia no codigo

- Backend `POST /auth/signup` retorna `409 Conflict` quando o e-mail ja existe (`Email already in use`).
- Backend `POST /establishments` retorna `409 Conflict` quando a conta `ESTABLISHMENT` ja possui uma vitrine ativa.
- Frontend reaproveitava o `AxiosError` cru, entao a UI podia exibir apenas `Request failed with status code 409`.
- `BusinessSetupScreen` nao tentava recuperar a vitrine existente apos um 409 de criacao de estabelecimento.

### Correcao aplicada

- `frontend/src/services/api/ApiClient.ts`: erros HTTP agora sao convertidos para `ApiRequestError` com `statusCode`, `code`, `details` e mensagem legivel ao usuario.
- `frontend/src/services/api/ApiClient.ts`: `Email already in use` agora aparece como orientacao clara para usar outro e-mail ou fazer login.
- `frontend/src/screens/auth/BusinessSetupScreen.tsx`: se `POST /establishments` retornar 409, o app busca `/establishments/me/owned` e continua o onboarding com a vitrine ja existente.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Validacao externa contra `http://18.228.6.219:3001/health`: pendente nesta rodada por timeout no acesso publico local e SSO AWS expirado.

### Leitura correta apos esta rodada

- 409 por e-mail duplicado e comportamento esperado do backend; o app deve orientar o usuario.
- 409 por vitrine ja existente tambem e comportamento esperado; o app agora tenta recuperar a vitrine e continuar o fluxo.
- Pendente: gerar novo APK com esta correcao e repetir smoke no celular.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Logout visivel no mobile

### Evidencia no codigo

- `frontend/src/stores/authStore.ts` ja possuia `logout`, com:
  - desconexao de Socket.IO;
  - tentativa de desregistro de push token;
  - chamada `POST /auth/logout`;
  - limpeza local de tokens/sessao mesmo se o servidor falhar.
- Nao havia acao visivel de logout em `frontend/src/screens/main/SettingsScreen.tsx`.

### Correcao aplicada

- `frontend/src/screens/main/SettingsScreen.tsx`: adicionada opcao `Sair da conta` em `Configuracoes > Conta`.
- A acao exibe confirmacao nativa antes de encerrar sessao.
- Durante a saida, a linha fica desabilitada e exibe `Saindo...`.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

### Leitura correta apos esta rodada

- Logout agora tem ponto de acesso claro no app.
- Pendente: gerar novo APK e validar manualmente no celular que o app volta para o fluxo de auth apos confirmar logout.

## Atualizacao operacional - 2026-05-04 (America/Sao_Paulo) - Auditoria visual via HTML embutido em Markdown

### Referencias encontradas

Nao existem arquivos `.html` soltos em `doc`. As referencias visuais estao embutidas como HTML dentro dos arquivos `.md`.

Principais referencias canônicas usadas nesta rodada:

| Documento | Tela/fluxo representado | Tela Expo correspondente |
|---|---|---|
| `doc/02_UX_FLUXOS/03_T03_LOGIN_CADASTRO.md` | Login, cadastro, recuperacao, 2FA/SMS visual | `LoginScreen`, `SignUpScreen`, `ForgotPasswordScreen`, `TwoFactorLoginScreen` |
| `doc/02_UX_FLUXOS/04_T04_ESCOLHA_PERFIL.md` | Escolha entre conta pessoal e empresarial | `ProfileSelectionScreen` |
| `doc/02_UX_FLUXOS/07_T06_HOME.md` | Home/feed urbano, header, busca falsa de home, cards | `HomeScreen` |
| `doc/02_UX_FLUXOS/08_T07_BUSCA_COMPLETA.md` | Busca, filtros, resultados, mapa | `SearchScreen`, `MapScreen` |
| `doc/02_UX_FLUXOS/09_T13_CENTRAL_NOTIFICACOES.md` | Central de notificacoes | `NotificationsScreen` |
| `doc/02_UX_FLUXOS/10_T_PERFIL_TEMPLATE_UNIVERSAL.md` | Perfil usuario/estabelecimento | `ProfileScreen` |
| `doc/02_UX_FLUXOS/11_T_ITEM_UNIVERSAL.md` | Detalhe de item/produto/evento | `ItemScreen` |
| `doc/02_UX_FLUXOS/12_T_CATALOGO_UNIVERSAL.md` | Catalogo | `CatalogScreen`, `ProductManagementScreen` |
| `doc/02_UX_FLUXOS/13_T_AGITO_FEED_SOCIAL.md` | Feed social | `FeedSocialScreen` |
| `doc/02_UX_FLUXOS/14_T_ATIVIDADE.md` | Atividade, favoritos, historico | `ActivityScreen`, `ActivityFavoritesScreen`, `ActivityHistoryScreen` |
| `doc/02_UX_FLUXOS/15_T_CONFIG_CONFIGURACOES.md` | Configuracoes, privacidade, seguranca, exclusao | `SettingsScreen`, `SettingsPrivacyScreen`, `SettingsSecurityScreen`, `SettingsDeleteAccountScreen`, auxiliares |

### Primeiro lote aplicado

- Criados componentes visuais reutilizaveis em `frontend/src/components/ScreenPrimitives.tsx`:
  - `ScreenHeader`;
  - `SectionLabel`;
  - `InfoCard`;
  - `ActionRow`.
- Exportacao adicionada em `frontend/src/components/index.ts`.
- `SettingsScreen` passou a usar header, divisores e linhas padronizadas conforme referencia de configuracoes.
- `SettingsPrivacyScreen` passou a usar card informativo e linhas padronizadas.
- `SettingsDeleteAccountScreen` teve header e cards de aviso padronizados e passou a usar `Button` real do design system.

### Decisao sobre hibernacao e exclusao em 3 dias

- Regra de produto definida: hibernar conta deve inativar perfil/conteudos e reativar no login.
- Regra de produto definida: excluir conta deve agendar exclusao definitiva em 3 dias, permitindo cancelamento durante o prazo.
- Para conta empresarial, a opcao escolhida foi apagar/ocultar estabelecimento e catalogo junto com a conta.
- Nao foi adicionada acao falsa no app porque o backend atual ainda expõe `DELETE /users/me` como soft delete imediato.
- Pendencia P0: implementar backend, Prisma, job e fluxo mobile real antes de exibir hibernacao ou cancelamento de exclusao no app.

### Validacao executada

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
