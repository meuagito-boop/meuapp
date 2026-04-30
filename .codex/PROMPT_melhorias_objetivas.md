# Prompt para Codex — Auditoria e Alinhamento AWS do Meu Agito

Você é o responsável técnico principal pelo projeto **Meu Agito**.

Sua tarefa é alinhar, auditar e corrigir a execução das melhorias objetivas antes do deploy em AWS.

Antes de implementar qualquer coisa, leia obrigatoriamente:

- AGENTS.md
- PERFIL.MD
- PROJECT_CONTEXT.md
- backend-dev_SKILL.md
- mobile-dev_SKILL.md
- designer_SKILL.md
- qa_SKILL.md
- security_SKILL.md
- release-review_SKILL.md
- strategist_SKILL.md
- docs/aws/AWS_LOCAL_SETUP.md
- docs/aws/AWS_TARGET_ARCHITECTURE.md
- docs/aws/AWS_COST_CONTROL_PLAN.md
- docs/aws/AWS_NETWORK_PLAN.md
- docs/aws/AWS_SECURITY_PLAN.md
- docs/aws/AWS_DATABASE_PLAN.md
- docs/aws/AWS_STORAGE_PLAN.md
- docs/aws/AWS_BACKEND_DEPLOY_PLAN.md
- docs/aws/AWS_OBSERVABILITY_PLAN.md
- docs/aws/AWS_DEPLOY_CHECKLIST.md

Também considere a documentação AWS baixada em `doc/aws doc`, se existir no repositório.

---

## Correção de entendimento obrigatória

No Meu Agito, a conta deve escolher no cadastro se é:

- usuário final;
- estabelecimento/comerciante.

Quem cria uma conta de estabelecimento já é o dono da própria conta.

Portanto, **não criar e não exigir** neste momento:

- EstablishmentMember;
- admin de estabelecimento;
- editor de estabelecimento;
- membro de estabelecimento;
- equipe interna de estabelecimento;
- OWNER/ADMIN/EDITOR por estabelecimento.

A autorização correta agora é:

- conta USER gerencia seus próprios recursos;
- conta ESTABLISHMENT gerencia sua própria página, vitrine e mídia;
- admin global do sistema é separado e não é admin de estabelecimento.

Se você já implementou estrutura de membros/roles de estabelecimento, audite e recomende remoção ou simplificação antes de continuar.

---

## Decisão AWS-first

O projeto deve ser preparado para AWS de forma profissional e centralizada.

Serviços AWS alvo:

- ECS Fargate para backend NestJS;
- ECR para imagens Docker;
- RDS PostgreSQL para banco;
- ElastiCache Redis/Valkey para cache, presença, Socket.IO adapter e rate limit;
- S3 para mídia;
- CloudFront para CDN;
- Application Load Balancer para HTTPS e WebSocket;
- ACM para certificados;
- SES para e-mail;
- SNS Mobile Push para push notifications;
- Secrets Manager ou SSM Parameter Store para segredos;
- CloudWatch para logs e métricas;
- CloudTrail para auditoria AWS;
- X-Ray quando aplicável;
- CloudFormation para infraestrutura como código.

Não usar como arquitetura-alvo principal:

- Railway;
- Render;
- Supabase;
- Aiven;
- Upstash;
- Firebase como backend;
- Resend como provider principal;
- Sentry como dependência obrigatória.

Observação técnica sobre push:
Android/iOS podem exigir credenciais FCM/APNs. Essas credenciais podem existir apenas como requisito de plataforma, guardadas em Secrets Manager/SSM. A camada principal de envio deve ser AWS SNS Mobile Push.

---

## Stack que deve ser preservada

Manter:

- NestJS;
- Prisma;
- PostgreSQL;
- React Native/Expo;
- Socket.IO;
- JWT/Refresh Token.

Não recomeçar o projeto.

Não trocar o core sem justificativa crítica.

---

## Objetivo da tarefa

Auditar o que já foi implementado e alinhar o código/documentação a esta decisão:

1. conta USER ou ESTABLISHMENT, sem papéis internos de estabelecimento;
2. AWS-first para infraestrutura e serviços gerenciados;
3. projeto pronto para ECS/RDS/ElastiCache/S3/CloudFront/SES/SNS/CloudWatch;
4. remover ambiguidade causada por arquivos antigos, cache, worktree, dist, branches ou histórico local.

---

## Primeiro passo obrigatório — Auditoria sem alteração

Antes de alterar código, responda:

### 1. Estado Git

Verifique e relate:

- git status;
- branch atual;
- git branch;
- git worktree list;
- git stash list;
- arquivos modificados;
- arquivos não rastreados;
- arquivos temporários;
- arquivos gerados;
- possíveis caches que podem confundir a análise.

Não apague nada ainda.

### 2. Estado de documentação

Verifique se existem versões antigas ou conflitantes dos arquivos:

- melhorias_objetivas.md;
- PROMPT_melhorias_objetivas.md;
- docs/aws/*.md;
- documentos em `doc/aws doc`.

Relate inconsistências.

### 3. Estado de implementação

Audite os blocos abaixo e classifique cada um como:

- APROVADO;
- APROVADO COM RESSALVAS;
- REPROVADO;
- NÃO IMPLEMENTADO;
- NÃO FOI POSSÍVEL VALIDAR.

Sempre cite arquivos analisados.

---

## Blocos obrigatórios de auditoria

### Bloco 1 — Base de produção
Verificar env validation, ExceptionFilter, logs, trust proxy, CORS production, rate limit auth, erros, migrations, health check e compatibilidade ECS.

### Bloco 2 — Storage e mídia
Verificar MediaModule/MediaService/StorageService, S3, CloudFront, avatar/anexos fora do banco, metadados no banco, validação MIME/tamanho/ownership e frontend sem credenciais AWS.

### Bloco 3 — Auth, JWT e permissões
Verificar claims JWT, req.user completo, isAdmin global, accountType USER/ESTABLISHMENT, ownership checks e ausência de papéis internos de estabelecimento.

### Bloco 4 — Conta de estabelecimento
Verificar conta de estabelecimento como dona da própria página, página pública, categoria, subcategoria, WhatsApp, website, horário, localização, mídia via Media e inexistência de admin/editor/membro por estabelecimento.

### Bloco 5 — Produtos/vitrine
Verificar Product/CatalogItem, vínculo com estabelecimento, status, imagem via Media/S3, rotas públicas, frontend sem mock e sem pedido/carrinho/pagamento.

### Bloco 6 — Feed
Verificar cursor pagination, feed global, seguindo, local/próximo, mídia real, cache/invalidação e stories com API real ou removidos do fluxo incompleto.

### Bloco 7 — Geo/Discovery
Verificar PostGIS ou preparação real, distância real, ordenação por distância, aberto agora, categoria/subcategoria e índices geográficos.

### Bloco 8 — Chat e tempo real
Verificar Socket.IO, PresenceService, Redis adapter, anexos via S3, autenticação socket e múltiplas instâncias.

### Bloco 9 — Redis/Valkey
Verificar REDIS_URL, ElastiCache, cache, rate limit, presença, Socket.IO adapter e fallback memória apenas em dev/test.

### Bloco 10 — Push
Verificar SNS Mobile Push como alvo, PushToken, NotificationDelivery, registrar/remover token, teste push, captura no app, falhas e token inválido.

### Bloco 11 — Notificações in-app
Verificar tipos, payload, entityType/entityId, readAt, WebSocket, integração com push, listagem, marcação como lida e contagem.

### Bloco 12 — E-mail
Verificar Amazon SES como alvo, templates, verificação de e-mail, reset, reenvio, erro sem 500 genérico e token não logado.

### Bloco 13 — AuditLog
Verificar ações críticas, actor, action, entity, timestamp e ausência de dados sensíveis.

### Bloco 14 — Observabilidade AWS
Verificar CloudWatch, CloudTrail, X-Ray quando aplicável, logs estruturados, requestId/correlationId, retention, alarmes e troubleshooting.

### Bloco 15 — Testes
Verificar build backend, testes unitários, e2e, build mobile, lint, typecheck, login, feed, chat, upload, estabelecimento, vitrine, evento, push e e-mail.

---

## AWS readiness

Verificar:

- Dockerfile;
- .dockerignore;
- Prisma Client no build/runtime;
- schema.prisma e migrations disponíveis;
- estratégia migrate deploy;
- ausência de secrets na imagem;
- PORT configurável;
- health check para ALB;
- logs stdout/stderr;
- CORS configurável;
- S3 configurável;
- Redis configurável;
- RDS por DATABASE_URL;
- SES configurável;
- SNS configurável;
- CloudWatch compatível.

Classificar:

- PRONTO PARA AWS;
- PRONTO COM RESSALVAS;
- NÃO PRONTO.

---

## Git, cache e worktree

Avaliar:

- git worktree list;
- worktrees antigas;
- branches antigas;
- stash antigo;
- arquivos untracked;
- dist/build/cache;
- logs temporários;
- caches Expo/Metro;
- caches de testes;
- arquivos .tmp;
- node_modules, apenas se estiver interferindo;
- qualquer histórico local que possa fazer a IA interpretar código antigo como atual.

Regra obrigatória:

- primeiro listar;
- depois recomendar;
- só limpar com autorização explícita;
- usar dry-run quando aplicável;
- nunca apagar migrations, documentação, código fonte, configuração ou assets sem confirmação.

---

## Formato obrigatório da resposta

Responda nesta estrutura:

## Objetivo

## Escopo analisado

## Estado Git e worktree

## Documentação analisada

## Arquivos analisados

## Resultado por bloco

Para cada bloco:

### Bloco X — Nome
Status:
Evidências:
Problemas encontrados:
Risco:
Correção necessária:
Prioridade:

## AWS readiness

Status:
Evidências:
Bloqueios:
Ajustes necessários:

## Conflitos com a decisão atual

Liste especialmente:

- qualquer admin/editor/membro de estabelecimento;
- qualquer dependência principal fora da AWS;
- qualquer uso de Resend como obrigatório;
- qualquer uso de Firebase como backend;
- qualquer uso de Sentry como obrigatório;
- qualquer mock onde deve existir API real.

## Testes executados

Liste comando e resultado.

Se não executar, diga:

NÃO EXECUTADO + motivo.

## Riscos remanescentes

Classifique como CRÍTICO, ALTO, MÉDIO ou BAIXO.

## O que está aprovado

## O que precisa corrigir antes de continuar

## O que pode ficar para depois

## Recomendação final

Use uma decisão:

- APROVAR;
- APROVAR COM RESSALVAS;
- BLOQUEAR.

## Próximo passo recomendado

Regra final:
Não implemente nada sem autorização explícita após a auditoria.
Primeiro audite, depois recomende.
