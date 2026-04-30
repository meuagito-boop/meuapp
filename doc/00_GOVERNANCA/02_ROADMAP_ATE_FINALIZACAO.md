# Roadmap Ate Finalizacao

Data base atualizada: 2026-04-30

## Objetivo
Definir o caminho minimo, verificavel e honesto para sair do estado AWS-first atual e chegar a um deploy real com risco controlado.

## Fase 1 - Baseline tecnica do codigo
### Meta
Fechar o core backend/frontend e eliminar divergencias estruturais do MVP.
### Entregas
- [x] Build backend estabilizado.
- [x] Lint backend estabilizado.
- [x] Build/lint/typecheck frontend estabilizados.
- [x] Auth alinhado a `USER` / `ESTABLISHMENT`.
- [x] Feed social real com `GET /feed/agito`.
- [x] Discovery real com `distanceKm`, `openNow` e ordenacao por distancia.
- [x] SES, SNS, media, produtos e audit log fechados em codigo.
### Criterio de saida
- [x] Core tecnico consistente em codigo e validado por build/testes unitarios.

## Fase 2 - Confiabilidade automatizada
### Meta
Ter uma baseline reproduzivel de validacao automatizada antes do deploy.
### Entregas
- [x] Testes unitarios backend passando (14 suites / 157 testes na validacao de 30/04).
- [x] `tsc --noEmit` do frontend passando.
- [x] `eslint` do frontend passando.
- [x] `eslint` do backend passando.
- [x] `test:e2e` reproduzido com `postgres-test` ativo no host atual.
### Criterio de saida
- [x] Pipeline local repetivel com `build`, `lint`, `unit` e `e2e` usando o Compose local validado em 30/04.

## Fase 3 - Fechamento funcional do app
### Meta
Remover simulacoes enganosas e validar os fluxos reais do MVP mobile.
### Entregas
- [x] Auth, onboarding, home, busca, feed, perfil de estabelecimento, catalogo, item de produto e item de evento ligados a API real.
- [x] Login com desafio 2FA ligado ao backend real quando a conta exige autenticacao em dois fatores.
- [ ] Revisar telas ainda penduradas em preview/mock ou placeholder, principalmente em configuracoes auxiliares e fluxos fora do MVP.
- [ ] Validar estados de loading/erro/vazio nas telas prioritarias.
- [ ] Smoke manual em dispositivo ou emulador para auth, feed, busca, perfil, notificacoes e chat.
### Criterio de saida
- [ ] Fluxos MVP reais validados no app, sem mascarar lacuna com dado fake.

## Fase 4 - Realtime e operacao
### Meta
Confirmar a camada distribuida que ja existe em codigo.
### Entregas
- [x] Adapter Redis do Socket.IO em codigo.
- [x] Presenca distribuida em codigo.
- [x] Throttling distribuido em codigo.
- [ ] Validar cenarios reais de reconexao, leitura, typing e notificacao com 2 usuarios.
- [ ] Validar runtime com Redis externo compativel com ambiente alvo.
### Criterio de saida
- [ ] Chat e notificacoes realtime validados fora do modo puramente local.

## Fase 5 - Readiness de deploy e release
### Meta
Fechar ambiente AWS, observabilidade e checklist final de lancamento.
### Entregas
- [ ] Aplicar observabilidade AWS real com sessao/conta validas.
- [ ] Informar IDs reais de ECS/ALB/RDS/Redis e bucket do CloudTrail.
- [ ] Aplicar migrations no banco alvo.
- [ ] Validar SES com identidade/remetente reais.
- [ ] Validar SNS/APNs/FCM no ambiente final.
- [ ] Revisar privacidade/termos para release publico.
- [ ] Fechar checklist tecnico final.
### Criterio de saida
- [ ] Projeto apto para primeiro deploy AWS com riscos conhecidos, documentados e monitorados.
