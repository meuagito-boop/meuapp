# Estado Atual Validado (2026-04-30)

## Escopo da validacao

Snapshot tecnico validado em 30/04/2026 comparando:
- codigo real em `backend/` e `frontend/`
- contratos canonicos em `doc/`
- diretrizes ativas em `.codex/`
- relatorios AWS-first gerados na raiz em `2026-04-26`

## Backend

- `npm run lint`: OK.
- `npm run build`: OK.
- `npm test -- --runInBand`: OK.
  - 14 suites.
  - 157 testes.
- `npm run test:e2e`: OK.
  - 2 suites.
  - 2 testes.
  - banco de teste validado em `localhost:5433`

## Docker local

- `docker compose up -d postgres postgres-test redis backend`: OK.
- `meuagito-postgres`: healthy em `localhost:5434`.
- `meuagito-postgres-test`: healthy em `localhost:5433`.
- `meuagito-redis`: healthy em `localhost:6379`.
- `meuagito-backend`: healthy em `localhost:3001`.
- `GET /health`: OK.

## Backend validado em codigo

- Auth alinhado ao modelo `USER` / `ESTABLISHMENT`.
- Fluxo de admin global antigo removido do runtime principal.
- SES consolidado como provider de e-mail.
- SNS consolidado como provider principal de push.
- `PushToken` e `NotificationDelivery` presentes no schema e no modulo `notifications`.
- `AuditLog` implementado com heranca de contexto HTTP.
- Redis distribuido usado para cache, throttling e adapter Socket.IO.
- `GET /feed/agito` ativo com cursor pagination.
- `distanceKm`, `openNow` e ordenacao por distancia ativos em discovery.
- `Media`, `Product` e upload protegido ativos no backend.

## Frontend

- `npx tsc --noEmit`: OK.
- `npm run lint`: OK.

## Frontend validado em codigo

- onboarding respeita `USER` / `ESTABLISHMENT`
- feed social consome `GET /feed/agito`
- home, busca, perfil de estabelecimento, catalogo, item de produto e item de evento usam API real
- notificacoes usam listagem real, leitura real e atualizacao via socket
- push token e permissao nativa estao integrados ao backend
- login com e-mail e senha respeita o desafio real de 2FA quando a conta exige autenticacao em dois fatores

## Lacunas reais ainda abertas

1. Observabilidade AWS ainda nao foi aplicada na conta alvo.
   - o repositorio tem script e runbook
   - a execucao real depende de sessao AWS valida e identificadores finais de ECS/ALB/RDS/Redis

2. Deploy AWS ainda nao foi validado ponta a ponta.
   - faltam migracoes no banco alvo
   - faltam credenciais reais de SES/SNS/APNs/FCM no ambiente final

3. Validacao mobile manual ainda esta pendente.
   - falta smoke real em dispositivo/emulador para fluxos principais
   - falta revalidacao de push real com credenciais finais

4. `ActivityFavorites` e `ActivityHistory` nao tinham backend real equivalente e nao devem simular dados como se estivessem prontos.

5. Ainda existem telas auxiliares de configuracoes e fluxos fora do MVP com comportamento parcial ou estatico.
   - isso nao bloqueia o core backend
   - mas ainda impede classificar o frontend inteiro como totalmente pronto para release publico sem triagem adicional

6. A documentacao canonica de estado e API estava atrasada em relacao ao codigo AWS-first e precisou ser reaberta nesta rodada.

7. O build local da imagem customizada do backend via BuildKit ainda nao esta confiavel neste host.
   - o Compose local foi fechado por caminho robusto de runtime
   - a validacao de imagem para CI/ECR deve ser refeita em host/runner com memoria estavel

## Conclusao objetiva

- O backend esta tecnicamente consistente e validado para continuar avancando.
- O maior bloqueio atual nao e mais Docker local nem modelagem/core; e fechamento de ambiente AWS e validacao manual de release.
- O projeto ainda nao deve ser marcado como pronto para deploy real enquanto observabilidade AWS, banco alvo e smoke mobile nao forem fechados.
