# Meu Agito — AWS Target Architecture

## Objetivo

Documentar a arquitetura AWS alvo para hospedar o Meu Agito de forma profissional, duradoura e escalável.

Este arquivo não cria infraestrutura.  
Ele apenas define o que será planejado antes da criação dos recursos.

---

## Região principal

Region: sa-east-1  
Nome: América do Sul (São Paulo)

---

## Serviços AWS alvo

### 1. Rede

- Amazon VPC
- Subnets públicas
- Subnets privadas
- Internet Gateway
- NAT Gateway, se necessário
- Security Groups
- Route Tables

### 2. Backend

- Amazon ECR
- Amazon ECS Fargate
- ECS Cluster
- ECS Service
- ECS Task Definition
- Application Load Balancer
- Target Group
- Health Check

### 3. Banco de dados

- Amazon RDS for PostgreSQL
- PostgreSQL como banco principal
- Backups automáticos
- Security Group privado
- Acesso somente pelo backend
- PostGIS quando aplicável

### 4. Cache / tempo real distribuído

- Amazon ElastiCache for Redis/Valkey
- Cache de feed
- Cache de discovery
- Cache de estabelecimentos
- Rate limit distribuído
- Presença online
- Socket.IO adapter

### 5. Storage de mídia

- Amazon S3
- Avatars
- Post media
- Chat attachments
- Establishment media
- Event media
- Product media

### 6. CDN

- Amazon CloudFront
- Distribuição de mídia pública
- Redução de latência
- Proteção de acesso quando aplicável

### 7. HTTPS e domínio

- AWS Certificate Manager
- Application Load Balancer com HTTPS
- Domínio ou subdomínio apontando para o ALB
- CloudFront com certificado quando aplicável

### 8. Secrets e configuração

- AWS Secrets Manager ou SSM Parameter Store
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- S3 configuration
- Push provider credentials
- Email provider credentials
- observability DSN opcional, quando adotado

### 9. Logs e observabilidade

- Amazon CloudWatch
- Logs do ECS
- Métricas básicas
- Alarmes
- CloudTrail para auditoria AWS
- AWS X-Ray quando aplicável
- Sentry opcional, não obrigatório

### 10. Push notifications

- AWS SNS Mobile Push como camada principal
- Credenciais FCM/APNs apenas quando exigidas pelas plataformas
- Registro de tokens no backend
- Envio de push pelo backend

### 11. E-mail transacional

- Amazon SES como provider alvo
- Verificação de e-mail
- Reset de senha
- Reenvio de verificação

---

## Princípios obrigatórios

- Não usar root para trabalho diário.
- Não armazenar arquivos no PostgreSQL.
- Não versionar secrets.
- Não criar infraestrutura sem revisão prévia.
- Não expor banco diretamente à internet.
- Não expor Redis diretamente à internet.
- Não deixar CORS aberto em produção.
- Não criar serviços fora de sa-east-1 sem justificativa.
- Não trocar o core do projeto sem necessidade.

---

## Stack do projeto mantida

- NestJS
- Prisma
- PostgreSQL
- React Native/Expo
- Socket.IO
- JWT/Refresh Token

---

## Fora de escopo neste momento

- Pedidos
- Pagamento
- PDV
- Gestor operacional
- Dashboard web
- Marketplace de pedidos

---

## Próximos documentos técnicos

1. AWS_NETWORK_PLAN.md
2. AWS_SECURITY_PLAN.md
3. AWS_DATABASE_PLAN.md
4. AWS_STORAGE_PLAN.md
5. AWS_BACKEND_DEPLOY_PLAN.md
6. AWS_OBSERVABILITY_PLAN.md
7. AWS_COST_CONTROL_PLAN.md
