# Meu Agito — Melhorias Objetivas antes do Deploy em AWS

Data: 2026-04-26  
Projeto: Meu Agito  
Escopo: aplicativo mobile atual de rede social + descoberta local.  
Infraestrutura-alvo: AWS.

---

## 1. Objetivo

Este documento define o que deve ser implementado, corrigido e validado no projeto **Meu Agito** antes do deploy profissional em AWS.

O objetivo é preparar o aplicativo para produção com base segura, escalável, auditável e coerente com uma arquitetura AWS de longo prazo.

Este documento substitui qualquer orientação anterior que sugira Railway, Render, Supabase, Aiven, Upstash, Firebase como backend principal, Sentry obrigatório ou Resend obrigatório como arquitetura-alvo.

---

## 2. Escopo do produto atual

O Meu Agito é o app mobile atual.

Ele combina:

- rede social;
- feed social;
- perfis;
- posts;
- comentários;
- curtidas;
- seguidores;
- chat em tempo real;
- eventos próximos;
- estabelecimentos/comércios próximos;
- páginas públicas de estabelecimentos;
- vitrine pública de produtos/serviços;
- notificações;
- localização.

Não fazem parte deste escopo:

- gestor de pedidos;
- painel web operacional;
- PDV;
- pagamento;
- carrinho;
- cozinha/produção;
- marketplace de pedidos.

O gestor de pedidos será outro projeto separado, futuro, web, integrado por API. Não misturar esse escopo agora.

---

## 3. Regra correta de tipo de conta

No cadastro do Meu Agito, a conta deve escolher um tipo principal:

- usuário final;
- estabelecimento/comerciante.

A pessoa que cria a conta de estabelecimento já é dona da própria conta.

Portanto, neste momento, **não deve existir estrutura de múltiplos perfis internos de estabelecimento**, como:

- admin de estabelecimento;
- editor de estabelecimento;
- membro de estabelecimento;
- equipe de estabelecimento.

Não criar `EstablishmentMember`, `OWNER`, `ADMIN`, `EDITOR` ou estrutura equivalente agora.

A autorização deve ser simples e direta:

- se a conta é do tipo estabelecimento, ela pode gerenciar a própria página/vitrine;
- se a conta é usuário final, ela pode criar/editar seus próprios recursos de usuário;
- admin global do sistema é outra coisa e não deve ser confundido com admin de estabelecimento.

---

## 4. Decisão técnica principal

Manter o core do projeto:

- NestJS;
- Prisma;
- PostgreSQL;
- React Native/Expo;
- Socket.IO;
- JWT/Refresh Token.

Não recomeçar o projeto.

Não trocar o core sem justificativa crítica.

A infraestrutura e os serviços gerenciados devem ser AWS, sempre que existir serviço AWS adequado.

---

## 5. Arquitetura AWS alvo

### Backend

- Amazon ECS Fargate
- Amazon ECR
- Application Load Balancer
- AWS Certificate Manager

### Banco

- Amazon RDS for PostgreSQL
- PostGIS quando necessário para geo/discovery

### Cache e tempo real distribuído

- Amazon ElastiCache for Redis/Valkey

### Storage e mídia

- Amazon S3
- Amazon CloudFront

### Segredos e configuração

- AWS Secrets Manager ou AWS Systems Manager Parameter Store

### Observabilidade

- Amazon CloudWatch
- AWS X-Ray, quando aplicável
- AWS CloudTrail para auditoria de ações AWS

### E-mail

- Amazon SES

Resend não deve ser arquitetura-alvo principal. Pode permanecer apenas como fallback temporário se já existir no código, mas a direção oficial é AWS SES.

### Push notifications

- Amazon SNS Mobile Push como camada AWS de envio;
- credenciais FCM/APNs podem ser necessárias por exigência das plataformas móveis;
- não usar Firebase como backend principal;
- não usar Firebase como arquitetura principal do app.

### Infraestrutura como código

- AWS CloudFormation como base inicial;
- AWS CDK pode ser avaliado depois, se for mais produtivo.

---

## 6. Blocos obrigatórios

### Bloco 1 — Base de produção

Implementar e validar:

- validação central de variáveis de ambiente;
- ExceptionFilter global;
- logs estruturados;
- trust proxy;
- CORS de produção;
- rate limit para autenticação;
- tratamento padronizado de erros;
- pipeline/estratégia de migrations;
- health check expandido;
- compatibilidade com ECS/Fargate;
- logs em stdout/stderr.

Critérios de aceite:

- backend não sobe em production sem envs obrigatórias;
- secrets não ficam hardcoded;
- CORS não fica aberto indevidamente;
- erros são padronizados;
- logs não vazam token, senha ou segredo.

### Bloco 2 — Storage e mídia

Objetivo: remover arquivos pesados do PostgreSQL.

Implementar:

- MediaModule ou equivalente;
- MediaService;
- StorageService;
- integração com Amazon S3;
- compatibilidade com CloudFront;
- upload de avatar;
- upload de imagem de post;
- upload de anexo de chat;
- upload de imagem de evento;
- upload de imagem de estabelecimento;
- upload de imagem de produto/vitrine.

Critérios de aceite:

- avatar não é salvo como base64;
- anexo de chat não é salvo como data URI/base64;
- banco guarda apenas URL/path/metadados;
- upload valida MIME;
- upload valida tamanho;
- upload valida ownership;
- frontend não tem credencial AWS;
- app consome URLs reais.

### Bloco 3 — Auth, JWT e permissões

Implementar/corrigir:

- JWT com claims corretas;
- req.user completo;
- isAdmin global funcional;
- guards/policies por recurso;
- ownership checks padronizados;
- autorização explícita para ações sensíveis;
- campo de tipo de conta.

Tipos de conta esperados:

- USER;
- ESTABLISHMENT.

Critérios de aceite:

- usuário comum não acessa ação administrativa;
- usuário só altera os próprios recursos;
- conta de estabelecimento só altera a própria página/vitrine;
- admin global funciona de forma separada;
- não existe admin/editor/membro por estabelecimento neste momento.

### Bloco 4 — Conta de estabelecimento e página pública

Implementar/corrigir:

- accountType ou equivalente;
- perfil de estabelecimento vinculado diretamente à conta proprietária;
- página pública do estabelecimento;
- categoria;
- subcategoria;
- WhatsApp;
- website;
- horário de funcionamento;
- localização;
- logo/capa/fotos via Media/S3;
- status de verificação.

Não implementar agora:

- EstablishmentMember;
- OWNER/ADMIN/EDITOR por estabelecimento;
- convite de equipe;
- painel de equipe;
- permissões internas de estabelecimento.

Critérios de aceite:

- quem cria conta de estabelecimento é dono da própria conta;
- a conta de estabelecimento gerencia sua própria página;
- usuário final não edita estabelecimento de outro usuário;
- página pública tem dados suficientes para descoberta/vitrine;
- mídia usa S3/CloudFront.

### Bloco 5 — Produtos / vitrine pública

Implementar:

- Product ou CatalogItem;
- vínculo direto com estabelecimento;
- status do produto;
- imagem via Media/S3;
- rotas públicas de leitura;
- integração real no frontend;
- remoção de mock local onde já existir API.

Status mínimo:

- ACTIVE;
- INACTIVE;
- OUT_OF_STOCK.

Fora de escopo:

- pedido;
- carrinho;
- pagamento;
- checkout;
- gestor operacional.

Critérios de aceite:

- app lista produtos reais por estabelecimento;
- produto inativo não aparece publicamente;
- mídia usa S3/CloudFront;
- frontend não depende de mock.

### Bloco 6 — Feed social

Implementar/corrigir:

- cursor pagination;
- feed global;
- feed seguindo;
- feed local/próximo;
- mídia real em posts;
- cache corrigido;
- invalidação correta;
- stories com API real ou remoção temporária do fluxo incompleto.

### Bloco 7 — Geo / Discovery

Implementar/corrigir:

- PostGIS quando aplicável;
- busca por distância real;
- ordenação por distância;
- filtro aberto agora;
- filtro por categoria/subcategoria;
- busca textual melhorada;
- índices geográficos;
- módulo geo/discovery organizado.

### Bloco 8 — Chat e tempo real escalável

Manter Socket.IO.

Implementar/corrigir:

- PresenceService;
- presença distribuída;
- Redis adapter para Socket.IO;
- anexos via Storage/S3;
- autenticação robusta no socket;
- suporte a múltiplas instâncias ECS.

### Bloco 9 — Redis/Valkey

Usar Amazon ElastiCache Redis/Valkey.

Implementar/corrigir:

- REDIS_URL configurável;
- cache de feed;
- cache de users/profile/stats;
- cache de establishments/discovery;
- rate limit distribuído;
- presença online;
- Socket.IO adapter.

Critérios de aceite:

- fallback em memória só para development/test;
- production falha de forma clara se Redis for obrigatório e estiver ausente;
- compatível com ElastiCache.

### Bloco 10 — Push notifications

Usar AWS SNS Mobile Push como camada AWS de envio.

Implementar/corrigir:

- PushToken;
- NotificationDelivery;
- endpoint para registrar token;
- endpoint para remover token;
- endpoint de teste push;
- captura de token no app;
- envio pelo backend via SNS;
- tratamento de falhas;
- desativação de token inválido.

Observação técnica:

- Android/iOS podem exigir credenciais FCM/APNs por regra das plataformas móveis.
- Essas credenciais devem ficar em Secrets Manager ou SSM.
- Firebase não deve ser usado como backend principal.

### Bloco 11 — Notificações in-app

Implementar/corrigir:

- tipos de notificação;
- entityType;
- entityId;
- payload/dataJson;
- readAt;
- createdAt;
- entrega por WebSocket;
- integração com push;
- listagem;
- marcação como lida;
- contagem de não lidas.

Tipos mínimos:

- LIKE;
- COMMENT;
- FOLLOW;
- MESSAGE;
- EVENT;
- ESTABLISHMENT;
- SYSTEM.

### Bloco 12 — E-mail

Usar Amazon SES como arquitetura-alvo.

Implementar/corrigir:

- provider SES;
- validação de credenciais;
- validação de remetente/domínio;
- templates organizados;
- verificação de e-mail;
- reset de senha;
- reenvio de verificação;
- falhas sem erro 500 genérico;
- tokens não aparecem em logs.

### Bloco 13 — AuditLog

Implementar escrita real de AuditLog para:

- login sensível;
- alteração de perfil;
- alteração de estabelecimento;
- alteração de permissão;
- ações administrativas;
- moderação;
- eventos de segurança.

Critérios:

- actor;
- action;
- entity;
- timestamp;
- sem dados sensíveis.

### Bloco 14 — Observabilidade AWS

Usar:

- CloudWatch;
- CloudTrail;
- X-Ray quando aplicável;
- logs estruturados;
- requestId/correlationId;
- retention definida;
- alarmes básicos.

Sentry não deve ser obrigatório como arquitetura-alvo. Pode ser avaliado depois, mas a decisão principal é AWS-first.

### Bloco 15 — Testes e validação

Executar/validar:

- build backend;
- testes unitários backend;
- testes e2e críticos;
- build mobile;
- lint;
- typecheck;
- login;
- feed;
- chat;
- upload;
- estabelecimento;
- vitrine;
- evento;
- push;
- e-mail.

Não declarar pronto se não testou.

---

## 7. AWS readiness

Antes do deploy, validar:

- Dockerfile;
- .dockerignore;
- Prisma Client no build/runtime;
- schema.prisma e migrations disponíveis;
- estratégia de migrate deploy;
- ausência de secrets na imagem;
- PORT configurável;
- health check compatível com ALB;
- logs em stdout/stderr;
- CORS configurável;
- S3 configurável;
- Redis configurável;
- RDS via DATABASE_URL;
- SES configurável;
- SNS push configurável;
- CloudWatch compatível.

---

## 8. Git, cache e worktree

Antes de auditorias finais, o Codex deve avaliar se existe histórico, cache, worktree ou estado antigo confundindo a análise.

Avaliar:

- git status;
- git branch;
- git worktree list;
- git stash list;
- arquivos não rastreados;
- arquivos gerados antigos;
- dist/build/cache;
- logs temporários;
- node_modules quando estiver interferindo;
- caches do Expo/Metro;
- caches de teste;
- arquivos .tmp;
- worktrees antigas;
- branches antigas que não fazem parte do fluxo atual.

Regra crítica:

- não apagar nada sem listar primeiro;
- não executar limpeza destrutiva sem autorização explícita;
- usar dry-run quando aplicável;
- separar arquivos do projeto de artefatos temporários;
- nunca apagar código, migrations, documentação ou arquivos de configuração sem confirmação.

---

## 9. Decisão final

O Meu Agito deve seguir AWS-first:

- ECS Fargate;
- ECR;
- RDS PostgreSQL;
- ElastiCache Redis/Valkey;
- S3;
- CloudFront;
- ALB;
- ACM;
- SES;
- SNS Mobile Push;
- Secrets Manager ou SSM;
- CloudWatch;
- CloudTrail;
- X-Ray quando aplicável;
- CloudFormation.

Não criar recursos AWS sem revisão de custo, segurança e plano de rede.
