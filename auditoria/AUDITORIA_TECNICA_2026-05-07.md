# AUDITORIA TÉCNICA COMPLETA — MEU AGITO
**Data:** 2026-05-07 | **Branch:** `chore/reorganizacao-baseline` | **Responsável:** Líder Técnico Principal

---

## Leitura do Projeto

**Entendimento geral:** Meu Agito é um aplicativo mobile de descoberta local e interação social focado em Guarulhos. Combina feed social, descoberta de eventos/estabelecimentos, chat em tempo real, geolocalização e notificações push.

**Objetivo percebido:** Lançar MVP funcional e coeso com foco em experiência mobile de qualidade, preparado para infraestrutura AWS.

**Estado atual percebido:** Projeto em estágio avançado de desenvolvimento — backend NestJS com 20+ módulos implementados, frontend React Native com fluxo completo de auth e telas principais. Está em fase de refinamento visual (branch atual). Há separação clara entre backend e frontend, design system parcialmente funcional e preparação AWS bem documentada. Porém, existem **buracos críticos de segurança, ausências arquiteturais e inconsistências** que impedem a consideração de produção agora.

---

## Visão de Liderança Técnica

**Avaliação geral:** Projeto bem intencionado e com boa estrutura base. A stack escolhida (NestJS + Prisma + React Native + Redis) é coerente com o produto. A documentação de arquitetura AWS está bem pensada. Porém, o nível de maturidade técnica atual ainda não é de produção.

**Maturidade atual:** 65/100 — Estrutura sólida, mas com falhas sérias de segurança no frontend, ausências críticas no schema de banco e issues de qualidade de código que precisam ser resolvidas antes de qualquer lançamento.

**Principais forças:**
- Estrutura modular NestJS bem organizada
- Validação de ambiente robusta (env.validation.ts)
- Audit log bem implementado com sanitização automática
- Cache com fallback Redis → Memory
- Rate limiting distribuído com Lua script atômico
- Design system com tokens definidos (colors.ts, design.ts)
- Cursor pagination no feed
- Refresh token com subscriber pattern (evita race conditions)

**Principais fragilidades:**
- Tokens de autenticação persistidos em AsyncStorage (texto plano) — risco crítico
- Sem PostGIS — queries geográficas ineficientes em escala
- Healthcheck do Dockerfile quebrado (wget não existe no Alpine)
- Bug lógico em `isFollowingUser()` — testa coluna errada (`followers` vs `following`)
- Cores hardcoded em RootNavigator (quebra design system)
- Acessibilidade ausente nos componentes base (Button, Input)
- Ícones de tabs são apenas letras (H, F, S) — UX fraca

---

## O que está certo

| Área | O que está bom | Por que preservar |
|---|---|---|
| **Backend — Auth** | JWT + Refresh Token + 2FA completo, bcrypt 10 rounds | Implementação segura e completa. Não mexer. |
| **Backend — Config** | `env.validation.ts` com validators condicionais por DEPLOY_ENV | Padrão raro e correto. Preservar. |
| **Backend — Exception Filter** | Redige detalhes em produção | Prática de segurança correta. Não alterar. |
| **Backend — Audit Log** | Sanitização automática de campos sensíveis | Implementação madura. Preservar. |
| **Backend — Structured Log** | Redaction de Bearer tokens, detecção de circular references | Código de produção. Não alterar. |
| **Backend — Rate Limit** | Lua script atômico + fallback memory + circuit breaker | Correto para multi-instância. Preservar. |
| **Backend — Cache** | Reconexão com retry strategy + SCAN pattern | Sólido para produção. Preservar. |
| **Backend — Health** | Verificação condicional de Redis, diferente por env | Correto. Não alterar. |
| **Backend — Geo Utils** | Fórmula Haversine matematicamente correta | Correto. Preservar. |
| **Frontend — Design System** | `colors.ts` e `design.ts` com tokens definidos | Base sólida. Atualizar cores, preservar estrutura. |
| **Frontend — AuthStore** | Subscriber pattern de refresh token | Padrão correto. Preservar lógica, corrigir storage. |
| **Frontend — FeedStore** | Cursor pagination + deduplicação + optimistic updates | Bem implementado. Preservar. |
| **Infra — docker-compose** | Healthchecks com retry, named volumes, networks | Prática correta. Preservar estrutura. |
| **Infra — .env.production** | Documentação AWS-first bem feita | Referência de qualidade. Preservar. |

---

## O que está errado

### CRÍTICO

**1. Tokens de auth em AsyncStorage (frontend/authStore.ts)**
- Problema: `AsyncStorage` armazena em texto plano. Tokens acessíveis em backup/root.
- Impacto: Comprometimento de conta. Risco legal (LGPD).

**2. Healthcheck do Dockerfile quebrado**
- Problema: `wget` não existe na imagem `node:20-alpine`.
- Impacto: ECS Fargate detecta container como unhealthy.

**3. Bug lógico em `isFollowingUser()` (userStore.ts)**
- Problema: Verifica `followers` (quem me segue) em vez de `following` (quem eu sigo).
- Impacto: UI mostra estado de follow invertido.

**4. Push tokens em AsyncStorage (PushRegistrationService.ts)**
- Problema: Device push tokens armazenados em texto plano.

### ALTO

**5. Ausência de PostGIS no schema Prisma**
- Problema: Geolocalização como Float lat/lng sem extensão geo.
- Impacto: Queries de raio não escalam. Full table scan com Haversine em cada registro.

**6. Backup codes gerados com Math.random() (auth.service.ts)**
- Problema: Math.random() não é criptograficamente seguro.
- Impacto: Backup codes de 2FA previsíveis.

**7. Cores hardcoded em RootNavigator**
- Problema: `#E8640A`, `#0D0D0D`, `#666` escritos diretamente no componente.
- Impacto: Drift visual com o design system ao longo do tempo.

**8. `loadMoreFeed()` sem proteção de double-fetch (feedStore.ts)**
- Problema: Linha ~512 sem verificação de `isLoadingFeed`.
- Impacto: Posts duplicados em scroll rápido.

**9. Validação de MIME type vulnerável (media.service.ts)**
- Problema: `startsWith('image/')` contornável.
- Impacto: Upload de arquivo não-imagem disfarçado.

**10. Email templates com interpolação direta (email.service.ts)**
- Problema: Conteúdo de usuário interpolado sem escaping em HTML.
- Impacto: Possível injeção em clientes de email HTML.

---

## O que está faltando

| Item | Relevância | Impacto da ausência |
|---|---|---|
| PostGIS / índices geográficos | Alta | Queries de distância não escalam |
| expo-secure-store para tokens | Alta | Segurança de credenciais comprometida |
| accessibilityLabel/Role em Button e Input | Alta | App inacessível para screen reader |
| testID nos componentes | Média | Testes E2E impossíveis |
| Índice em Message (conversationId, createdAt) | Média | Listagem de chat lenta com volume |
| Retry com exponential backoff no ApiClient | Média | Falhas transitórias de rede não recuperadas |
| Circuit breaker para SNS | Média | Falha em push bloqueia fluxo |
| USER node no Dockerfile | Média | Container roda como root |
| Estados empty em telas principais | Média | UX confusa: sem dados vs erro |
| isConnected dinâmico no useSocket | Média | Chat não reflete desconexão em tempo real |
| PostCard component | Alta | Componente mais importante do módulo social — ausente |
| CustomTabBar com FAB central | Alta | Navegação fraca com letras soltas |
| StoriesBar component | Média | Funcionalidade visual do produto ausente |
| SkeletonLoader, EmptyState, Avatar, BottomSheet | Alta | Estados de UI fundamentais ausentes |

---

## O que precisa ser corrigido primeiro

1. **[SEGURANÇA CRÍTICA]** Mover tokens de AsyncStorage → `expo-secure-store` / memória
2. **[BLOQUEADOR DE INFRA]** Corrigir healthcheck do Dockerfile (remover wget)
3. **[BUG LÓGICO]** Corrigir `isFollowingUser()` → usar `following`, não `followers`
4. **[CONCORRÊNCIA]** Adicionar guard `isLoadingFeed` em `loadMoreFeed()`
5. **[SEGURANÇA ALTA]** Backup codes com `crypto.randomBytes()`
6. **[VALIDAÇÃO]** Whitelist de MIME types em media.service
7. **[DESIGN SYSTEM]** Corrigir hardcoded colors em RootNavigator
8. **[ACESSIBILIDADE]** Adicionar accessibilityLabel/Role em Button, Input, tabs
9. **[DOCKER SEGURANÇA]** Adicionar `USER node` ao Dockerfile
10. **[ÍNDICES]** Adicionar (conversationId, createdAt) em Message via migration

---

## O que pode ser melhorado

| Melhoria | Ganho esperado | Custo/Risco |
|---|---|---|
| Extrair CACHE_TTL para ConfigService | Elimina ~8 duplicações | Baixo |
| Type guards nos sanitize*() methods | Elimina any types | Médio custo |
| Template engine para emails | Elimina interpolação direta | Médio |
| Logger frontend com severity + timestamp | Debugabilidade em produção | Baixo |
| Retry com exponential backoff no ApiClient | Resiliência a falhas | Médio |
| Soft delete consistente em todos os modelos | Consistência arquitetural | Requer migration |
| @nestjs/terminus para health checks | Padronização | Baixo risco |
| Atualizar AWS SDK de 3.1037 → 3.600+ | Bugfixes de performance | Baixo |

---

## O que não deve ser mexido sem necessidade

| Área | Razão |
|---|---|
| env.validation.ts | Validação condicional por deploy env — rara e correta |
| global-exception.filter.ts | Redaction de dados em produção, estrutura consistente |
| audit-log.service.ts | Sanitização de valores sensíveis completa |
| structured-log.ts | Detecção de circular refs + redaction de Bearer tokens |
| redis-throttler.storage.ts | Lua script atômico para rate limit distribuído |
| auth.service.ts — core de auth | JWT + 2FA + soft delete + refresh token bem estruturados |
| Fluxo de refresh token no ApiClient | Subscriber pattern evita race conditions |
| Cursor pagination no feed | Decisão correta de performance para feeds em escala |
| Schema Prisma — modelos existentes | Qualquer alteração exige migration cuidadosa |

---

## Riscos atuais do projeto

### Segurança
- CRÍTICO: Tokens JWT em AsyncStorage (texto plano)
- ALTO: Backup codes de 2FA com Math.random()
- ALTO: MIME type validation contornável
- MÉDIO: Email templates com interpolação não-escapada
- MÉDIO: Container Docker rodando como root

### Técnicos
- ALTO: Ausência de PostGIS — queries geográficas não escalam
- ALTO: Healthcheck do Dockerfile quebrado
- MÉDIO: Memory cache sem limite de tamanho
- MÉDIO: Sem circuit breaker para push notifications
- MÉDIO: isFollowingUser() com lógica invertida

### Produto
- MÉDIO: Acessibilidade ausente — exclui usuários com deficiência visual
- MÉDIO: Estados empty/error ausentes em telas principais
- MÉDIO: Chat sem indicação de desconexão de socket
- BAIXO: Ícones de abas são apenas letras — UX fraca

### Manutenção
- MÉDIO: any types em múltiplos serviços
- MÉDIO: Hardcoded colors fora do design system
- MÉDIO: CACHE_TTL duplicado em 8+ lugares

### Release
- CRÍTICO: App não pode ir para produção com tokens em AsyncStorage
- ALTO: ECS deployment pode falhar por healthcheck quebrado
- MÉDIO: iOS SNS Platform Application ARN vazio — push iOS não funcionará

---

## Análise por Perspectiva

**Strategist:** O produto tem core bem definido. MVP claramente escopo-delimitado. Risco estratégico é tentar lançar antes de resolver os problemas de segurança.

**Mobile Dev:** Arquitetura de stores Zustand está bem pensada. AsyncStorage para tokens deve ser corrigido antes de qualquer teste com usuários. Bug em isFollowingUser causa confusão imediata. loadMoreFeed sem proteção gera duplicações.

**Backend Dev:** Backend bem estruturado e modularizado. Sem PostGIS, discovery de proximidade vai degradar rapidamente. Recomendado implementar antes do lançamento.

**QA:** Sem testID = testes E2E impossíveis. Bug de isFollowingUser só detectável com testes específicos. Ausência de estados de erro dificulta verificação de happy path vs error path.

**Security:** Dois problemas críticos: tokens em AsyncStorage e backup codes com Math.random(). Ambos devem ser corrigidos imediatamente. Restante do código de segurança backend está bem implementado.

**Designer:** Design system tem boa base mas inconsistência de uso. Acessibilidade ausente nos componentes base. Ícones de tabs são apenas letras.

**Release Review:** BLOQUEAR para produção. Falhas de segurança reais impedem release responsável.

---

## Plano Recomendado

### Ações Imediatas (Esta semana)
1. Corrigir authStore.ts — tokens para expo-secure-store / memória
2. Corrigir Dockerfile — healthcheck sem wget
3. Corrigir userStore.ts — isFollowingUser com following
4. Corrigir feedStore.ts — guard isLoadingFeed em loadMoreFeed
5. Corrigir auth.service.ts — backup codes com crypto.randomBytes()

### Ações de Curto Prazo (2-4 semanas)
6. Whitelist de MIME types em media.service
7. Corrigir hardcoded colors em RootNavigator
8. accessibilityLabel/Role em Button, Input, tabs
9. testID nos componentes de formulário
10. USER node no Dockerfile
11. Índices em Message via migration
12. Configurar SNS Platform Application ARN para iOS

### Ações de Médio Prazo (1-2 meses)
13. Implementar PostGIS ou função de distância SQL
14. Extrair CACHE_TTL para ConfigService
15. Eliminar any types nos sanitize*() methods
16. Retry com exponential backoff no ApiClient
17. Circuit breaker para notificações SNS
18. Template engine para emails
19. Estados empty em todas as telas principais
20. Melhorar logger frontend

---

## Resumo Executivo Final

**Situação:** Projeto com arquitetura sólida, backend NestJS funcionalmente completo, frontend com design system e fluxos implementados. Porém, há duas falhas de segurança críticas no frontend, um bug lógico de UI e um bloqueador de infraestrutura.

**Recomendação:** Não lançar em produção no estado atual. Resolver os 5 itens críticos esta semana, depois avançar para staging. O projeto está a 2-3 semanas de um release responsável.

**Nível de prioridade:** CRÍTICO — problemas de segurança devem ser tratados antes de qualquer exposição a usuários reais.
