# Meu Agito - Backend

Backend do Meu Agito (NestJS + Prisma + PostgreSQL + Redis + Socket.IO).

## Pre-requisitos

- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (obrigatorio em producao; opcional so em dev/test quando `ENABLE_REDIS=false`)
- Docker e Docker Compose (opcional)

## Execucao local (Docker)

```bash
# na raiz do projeto
docker compose up -d postgres postgres-test redis

# no backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:prod
npm run start:dev
```

## Execucao local (sem Docker)

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

## Pipeline de migration (producao)

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate:prod
npm run build
npm run start:prod
```

Atalhos:
- `npm run deploy:prepare`
- `npm run start:prod:migrate`

## API docs

- Swagger (dev): `http://localhost:3001/api/docs`

## Testes

```bash
# unitarios
npm test -- --runInBand

# e2e (aplica migrate deploy no banco de teste)
npm run test:e2e
```

## Variaveis obrigatorias (core)

| Variavel | Quando | Observacao |
|----------|--------|------------|
| `DATABASE_URL` | sempre | conexao PostgreSQL |
| `JWT_SECRET` | sempre | segredo do access token |
| `REFRESH_TOKEN_SECRET` | sempre | segredo do refresh token |
| `NODE_ENV` | sempre | `development`, `test`, `production` |
| `CORS_ORIGIN` | producao | nao pode ser `*` |
| `PORT` | producao | porta exposta do container |

## Variaveis por integracao

| Integracao | Variaveis |
|-----------|-----------|
| Redis | `ENABLE_REDIS=true` + `REDIS_URL` |
| Rate limit distribuido | `RATE_LIMIT_TTL_MS`, `RATE_LIMIT_LIMIT`, `RATE_LIMIT_BLOCK_MS` |
| S3 | `STORAGE_PROVIDER=s3` + `S3_BUCKET`/`AWS_S3_BUCKET`, `S3_REGION`/`AWS_REGION`, `S3_ACCESS_KEY_ID`/`AWS_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`/`AWS_SECRET_ACCESS_KEY` |
| CloudFront | `USE_CLOUDFRONT=true` + `CLOUDFRONT_BASE_URL` |
| Email SES | `EMAIL_PROVIDER=ses` + `AWS_SES_REGION` + `AWS_SES_FROM_EMAIL` |
| Push SNS | `PUSH_PROVIDER=sns` + `AWS_SNS_REGION` e ARNs de platform application quando aplicável |
| Observabilidade | `APP_NAME`, `LOG_LEVEL`, `AWS_CLOUDWATCH_LOG_GROUP`, `AWS_CLOUDWATCH_LOG_RETENTION_DAYS`, `AWS_CLOUDWATCH_NAMESPACE`, `AWS_XRAY_ENABLED`, `AWS_XRAY_DAEMON_ADDRESS`, `AWS_XRAY_CONTEXT_MISSING`, `AWS_XRAY_SERVICE_NAME`, `SENTRY_ENABLED`, `SENTRY_DSN` |

## Diretrizes AWS usadas nesta etapa (Bloco 1)

- ECS/Fargate: task definition deve usar env vars/secret refs, sem segredo hardcoded.
- ALB: backend deve responder health check e aceitar configuracao de HTTPS listener no balanceador.
- RDS/ElastiCache: conexoes por env vars, sem credenciais no codigo.
- S3/CloudFront: configuracao por env vars, com validacao condicional.
- SSM Parameter Store / Secrets Manager: recomendado para segredos em producao.
- CloudWatch: logs estruturados em stdout/stderr compativeis com ECS/CloudWatch.
- X-Ray: tracing opcional habilitavel via env e sidecar/daemon.
- Sentry: complemento opcional, nunca dependência principal da stack AWS.

## Seguranca aplicada

- Exception filter global com resposta padronizada
- Validation pipe global
- Rate limit global com storage Redis distribuida quando `ENABLE_REDIS=true` + limites especificos em auth
- Request ID por requisicao
- Logs estruturados (sem dump de segredo/token)
