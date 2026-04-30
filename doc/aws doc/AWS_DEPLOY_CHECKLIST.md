# Meu Agito - AWS Deploy Checklist

## Objetivo

Consolidar o checklist final antes de criar infraestrutura e executar o deploy do Meu Agito na AWS.

Este arquivo nao cria recursos.
Ele serve como controle de prontidao tecnica, seguranca, custo e operacao.

---

## 1. Conta AWS

- [ ] Root com MFA ativo.
- [ ] Root nao usado para trabalho diario.
- [ ] IAM Identity Center habilitado.
- [ ] Usuario administrativo criado.
- [ ] MFA do usuario administrativo ativo.
- [ ] AWS CLI configurada com SSO.
- [ ] Profile AWS CLI validado.
- [ ] Regiao padrao definida como sa-east-1.

---

## 2. Controle de custo

- [ ] Budget de gasto zero criado.
- [ ] Budget mensal criado.
- [ ] Alertas de e-mail configurados.
- [ ] Custo estimado da arquitetura revisado.
- [ ] NAT Gateway revisado antes de criar.
- [ ] RDS revisado antes de criar.
- [ ] ElastiCache revisado antes de criar.
- [ ] ALB revisado antes de criar.
- [ ] CloudWatch retention definida.

---

## 3. Documentos criados

- [x] AWS_LOCAL_SETUP.md
- [x] AWS_TARGET_ARCHITECTURE.md
- [x] AWS_COST_CONTROL_PLAN.md
- [x] AWS_NETWORK_PLAN.md
- [x] AWS_SECURITY_PLAN.md
- [x] AWS_DATABASE_PLAN.md
- [x] AWS_STORAGE_PLAN.md
- [x] AWS_BACKEND_DEPLOY_PLAN.md
- [x] AWS_OBSERVABILITY_PLAN.md
- [x] AWS_DEPLOY_CHECKLIST.md

---

## 4. Rede

- [ ] VPC planejada.
- [ ] Subnets publicas planejadas.
- [ ] Subnets privadas planejadas.
- [ ] Internet Gateway planejado.
- [ ] NAT Gateway revisado e justificado, se necessario.
- [ ] Route tables planejadas.
- [ ] Security Group do ALB planejado.
- [ ] Security Group do ECS planejado.
- [ ] Security Group do RDS planejado.
- [ ] Security Group do Redis planejado.
- [ ] Banco sem acesso publico.
- [ ] Redis sem acesso publico.

---

## 5. Backend

- [x] Dockerfile validado.
- [x] Porta da aplicacao confirmada.
- [x] Health check confirmado.
- [ ] Variaveis obrigatorias documentadas.
- [x] Migrations Prisma planejadas.
- [ ] Estrategia de rollback definida.
- [x] ECR planejado.
- [x] ECS Fargate planejado.
- [x] ALB planejado.
- [x] HTTPS planejado com ACM.
- [x] WebSocket validado como requisito.

---

## 6. Banco

- [ ] RDS PostgreSQL planejado.
- [x] DATABASE_URL fora do codigo.
- [ ] Backups planejados.
- [ ] Storage inicial definido.
- [ ] Tamanho inicial da instancia definido.
- [ ] PostGIS decidido.
- [x] Migrations controladas.
- [ ] Health check de banco planejado.

---

## 7. Redis / Valkey

- [ ] ElastiCache planejado.
- [x] REDIS_URL fora do codigo.
- [x] Uso de Redis definido.
- [x] Cache definido.
- [x] Rate limit distribuido definido.
- [x] Presenca online definida.
- [x] Socket.IO adapter definido.
- [ ] Redis privado.

---

## 8. Storage / CDN

- [x] S3 planejado.
- [ ] Bucket unico ou buckets separados decidido.
- [ ] Prefixos definidos.
- [ ] Midias publicas definidas.
- [ ] Midias privadas definidas.
- [x] CloudFront planejado.
- [x] Upload com validacao definido.
- [x] Nenhum arquivo salvo no PostgreSQL.
- [x] Credenciais AWS fora do frontend.
- [ ] Lifecycle policy avaliada.

---

## 9. Secrets

- [ ] Secrets Manager ou SSM escolhido.
- [ ] DATABASE_URL protegido.
- [ ] REDIS_URL protegido.
- [ ] JWT_SECRET protegido.
- [ ] REFRESH_TOKEN_SECRET protegido.
- [ ] Credenciais S3 protegidas.
- [ ] Credenciais e-mail protegidas.
- [ ] Credenciais push protegidas.
- [ ] SENTRY_DSN tratado adequadamente.
- [ ] Nenhum secret versionado.

---

## 10. Push

- [x] Provider definido.
- [x] AWS SNS Mobile Push configurado ou planejado.
- [x] PushToken implementado.
- [x] Registro de token implementado.
- [x] Remocao de token implementada.
- [x] Envio de push implementado.
- [x] Tratamento de token invalido implementado.
- [ ] Teste de push planejado.

---

## 11. E-mail

- [x] Provider definido.
- [x] Amazon SES configurado como alvo principal.
- [ ] Remetente validado.
- [ ] Verificacao de e-mail validada.
- [ ] Reset de senha validado.
- [ ] Reenvio de verificacao validado.
- [x] Erros tratados sem 500 generico.
- [ ] Token de reset nao aparece em logs.

---

## 12. Observabilidade

- [ ] CloudWatch planejado.
- [ ] CloudWatch planejado como base de observabilidade.
- [ ] Sentry ou equivalente definido apenas se realmente necessario.
- [ ] Logs estruturados.
- [ ] RequestId/correlationId.
- [ ] Retencao de logs definida.
- [ ] Alarmes principais planejados.
- [ ] AuditLog implementado.
- [ ] Logs sem secrets.

---

## 13. Seguranca da aplicacao

- [ ] Env validation implementada.
- [ ] CORS restrito.
- [ ] Helmet ou equivalente.
- [ ] Rate limit de auth.
- [ ] ExceptionFilter global.
- [ ] DTO validation.
- [ ] JWT seguro.
- [ ] Refresh token seguro.
- [ ] Authorization guards.
- [ ] Ownership checks.
- [ ] Permissoes de estabelecimento.
- [ ] Upload validation.
- [ ] Protecao contra brute force.

---

## 14. Testes

- [x] Build backend aprovado.
- [x] Testes unitarios backend aprovados.
- [x] Testes e2e criticos aprovados.
- [ ] Build mobile aprovado.
- [x] Lint aprovado.
- [x] Typecheck aprovado.
- [ ] Teste de login.
- [ ] Teste de feed.
- [ ] Teste de chat.
- [ ] Teste de upload.
- [ ] Teste de estabelecimento.
- [ ] Teste de produto/vitrine.
- [ ] Teste de evento.
- [ ] Teste de push.
- [ ] Teste de e-mail.

---

## 15. Decisao final antes de criar recursos

Antes de criar qualquer recurso AWS, confirmar:

- [ ] Conta correta.
- [ ] Regiao correta.
- [ ] Profile correto.
- [ ] Custo revisado.
- [ ] Rede revisada.
- [ ] Seguranca revisada.
- [ ] Banco revisado.
- [ ] Storage revisado.
- [ ] Deploy revisado.
- [ ] Observabilidade revisada.

---

## Status

Este checklist deve ser revisado antes da criacao de infraestrutura e antes do primeiro deploy real.
