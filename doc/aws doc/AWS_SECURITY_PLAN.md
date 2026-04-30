# Meu Agito — AWS Security Plan

## Objetivo

Definir as regras de segurança para hospedar o Meu Agito na AWS com controle profissional de acesso, segredos, rede, logs e permissões.

Este arquivo não cria recursos.  
Ele documenta os requisitos de segurança que devem ser revisados antes da criação da infraestrutura.

---

## Identidade e acesso

### Root account

Regras:

- Não usar root para trabalho diário.
- Manter MFA ativo.
- Não criar access keys para root.
- Usar root apenas para tarefas que realmente exigem root.
- Guardar credenciais root com segurança.

---

### IAM Identity Center

Status esperado:

- IAM Identity Center habilitado.
- Usuário administrativo criado.
- MFA ativo no usuário administrativo.
- Acesso diário feito pelo AWS Access Portal.
- Profile AWS CLI configurado com SSO.

Profile:

~~~txt
meuagito-admin
~~~

Permission set:

~~~txt
MeuAgito-AdminAccess
~~~

---

## Princípio de menor privilégio

Durante a fase inicial, o usuário administrativo pode ter acesso amplo para configuração.

Antes de produção real, devem ser criados acessos separados por função:

- Administrador.
- Deploy/CI.
- Leitura/observabilidade.
- Suporte operacional.
- Segurança.
- Automação.

Cada acesso deve possuir apenas as permissões necessárias.

---

## Segredos e variáveis sensíveis

Segredos não devem ficar:

- No código.
- No Git.
- Em arquivos .env versionados.
- Em prints.
- Em documentos públicos.
- Em prompts enviados sem necessidade.

Segredos devem ser armazenados em:

- AWS Secrets Manager.
- AWS Systems Manager Parameter Store.

Segredos previstos:

- DATABASE_URL.
- REDIS_URL.
- JWT_SECRET.
- REFRESH_TOKEN_SECRET.
- Credenciais de S3.
- Credenciais de e-mail.
- Credenciais de push.
- observability DSN opcional, quando adotado.
- Qualquer token externo.

---

## Rede

Regras obrigatórias:

- RDS PostgreSQL privado.
- ElastiCache Redis/Valkey privado.
- ECS atrás do Application Load Balancer.
- ALB como ponto público de entrada.
- HTTPS obrigatório em produção.
- Security Groups restritivos.
- Não liberar portas administrativas para internet.
- Não usar 0.0.0.0/0 em banco ou Redis.
- Backend só deve receber tráfego do ALB.

---

## Storage

### Amazon S3

Regras:

- Não usar bucket público sem necessidade explícita.
- Bloquear acesso público por padrão.
- Definir políticas por caso de uso.
- Usar CloudFront para distribuição pública de mídia quando aplicável.
- Validar MIME e tamanho no backend.
- Impedir upload não autorizado.
- Não armazenar arquivos sensíveis em paths públicos.

### CloudFront

Regras:

- Usar HTTPS.
- Aplicar cache control adequado.
- Separar mídia pública de mídia privada.
- Avaliar signed URLs/cookies se houver mídia privada.

---

## Banco de dados

### Amazon RDS PostgreSQL

Regras:

- Acesso apenas pelo backend.
- Não expor publicamente.
- Backups habilitados.
- Credenciais em Secrets Manager ou SSM.
- Migrations controladas.
- PostGIS habilitado somente se necessário.
- Não armazenar arquivos em base64 no banco.

---

## Redis / Valkey

### Amazon ElastiCache

Regras:

- Acesso apenas pelo backend.
- Não expor publicamente.
- Uso para cache, presença, rate limit e Socket.IO adapter.
- Não usar Redis como banco principal.
- Não guardar dados sensíveis sem necessidade.

---

## Backend

Requisitos:

- Validação central de envs.
- CORS restrito.
- Rate limit para auth.
- Helmet ou equivalente.
- DTO validation.
- ExceptionFilter global.
- Logs estruturados.
- RequestId/correlationId.
- Não vazar stack trace em produção.
- Não logar tokens, senhas ou secrets.

---

## Autenticação do app

Requisitos:

- JWT e refresh token seguros.
- Secrets fortes.
- Expiração adequada.
- Revogação de refresh token.
- MFA/2FA se aplicável.
- Bloqueio ou mitigação contra brute force.
- Validação real de e-mail.
- Reset de senha com token seguro.

---

## Permissões do app

Requisitos:

- Usuário só altera recursos próprios.
- Admin só deve ser usado para ações administrativas.
- Permissões de estabelecimento devem usar vínculo explícito.
- Ações críticas devem gerar AuditLog.
- Ownership checks devem ser consistentes.

---

## Push notifications

Regras:

- Tokens de dispositivo vinculados ao usuário.
- Tokens inválidos devem ser desativados.
- Credenciais do provider em Secrets Manager ou SSM.
- Erros de envio devem ser rastreados.
- Não expor tokens no frontend além do necessário.

---

## E-mail

Regras:

- Provider configurável.
- Remetente validado.
- Falhas tratadas sem erro genérico.
- Templates revisados.
- Não vazar token de reset em logs.
- Domínio validado antes de uso público.

---

## Logs e observabilidade

Requisitos:

- CloudWatch para logs operacionais.
- CloudWatch como base de logs e Sentry ou equivalente apenas como complemento opcional.
- Retenção de logs definida.
- Alertas básicos.
- Logs sem segredos.
- AuditLog para ações críticas.

---

## Checklist antes da produção

- [ ] MFA root ativo.
- [ ] Root não usado no dia a dia.
- [ ] IAM Identity Center ativo.
- [ ] Usuário administrativo com MFA.
- [ ] Budgets ativos.
- [ ] RDS privado.
- [ ] Redis privado.
- [ ] Backend atrás do ALB.
- [ ] HTTPS ativo.
- [ ] Secrets fora do código.
- [ ] S3 sem público amplo indevido.
- [ ] CloudFront planejado.
- [ ] Logs sem secrets.
- [ ] CORS restrito.
- [ ] Rate limit de auth.
- [ ] AuditLog em ações críticas.
- [ ] Push tokens protegidos.
- [ ] E-mail validado.
- [ ] Migrations controladas.

---

## Próximo documento relacionado

AWS_DATABASE_PLAN.md
