# Meu Agito - AWS Observability Runbook

## Objetivo

Consolidar o caminho operacional para aplicar e diagnosticar observabilidade AWS do backend.

## Script versionado

O repositório agora possui um script de aplicação em:

- `backend/scripts/aws/apply-observability.ps1`

Esse script:

- valida a sessão AWS;
- garante log group com retention;
- cria metric filters para falhas da aplicação;
- cria alarmes base de ECS, ALB, RDS e Redis quando os identificadores são informados;
- publica dashboard CloudWatch;
- garante CloudTrail de management events quando configurado.

## Convenções adotadas

- Log group padrão: `/aws/ecs/meuagito-prod-backend`
- Namespace padrão: `MeuAgito/prod`
- Retention padrão: `30` dias
- Trail padrão: `meuagito-management-trail`

## Pré-requisitos

1. AWS CLI instalada
2. profile `meuagito-admin`
3. sessão SSO válida
4. identificadores reais do ambiente:
   - cluster ECS
   - service ECS
   - ALB full name
   - RDS instance identifier
   - Redis cluster id
   - SNS topic ARN para alarmes, se adotado

## Aplicação inicial

Exemplo:

```powershell
aws sso login --profile meuagito-admin

.\backend\scripts\aws\apply-observability.ps1 `
  -Profile meuagito-admin `
  -Region sa-east-1 `
  -AppName meuagito `
  -EnvironmentName prod `
  -EcsClusterName meuagito-prod-cluster `
  -EcsServiceName meuagito-backend `
  -AlbFullName app/meuagito-prod-alb/1234567890abcdef `
  -RdsInstanceIdentifier meuagito-prod-db `
  -RedisClusterId meuagito-prod-redis-001 `
  -AlarmTopicArn arn:aws:sns:sa-east-1:123456789012:meuagito-prod-alerts `
  -CloudTrailS3Bucket meuagito-prod-cloudtrail
```

Preview sem aplicar:

```powershell
.\backend\scripts\aws\apply-observability.ps1 -Profile meuagito-admin -Region sa-east-1 -WhatIf
```

## Verificações rápidas

Tail de logs:

```powershell
aws logs tail /aws/ecs/meuagito-prod-backend --follow --since 30m --profile meuagito-admin --region sa-east-1
```

Alarmes:

```powershell
aws cloudwatch describe-alarms --alarm-name-prefix meuagito-prod --profile meuagito-admin --region sa-east-1
```

Dashboard:

```powershell
aws cloudwatch get-dashboard --dashboard-name meuagito-prod-observability --profile meuagito-admin --region sa-east-1
```

CloudTrail:

```powershell
aws cloudtrail get-trail-status --name meuagito-management-trail --profile meuagito-admin --region sa-east-1
```

## Troubleshooting

### API indisponível

1. Verificar alarmes `ecs-*` e `alb-*`
2. Tail do log group do backend
3. Validar health check do ALB e `UnHealthyHostCount`

### Erro de banco

1. Verificar alarmes `rds-*`
2. Conferir logs estruturados `http.request.failed`
3. Conferir conexões e storage livre no RDS

### Erro de Redis

1. Verificar alarme `redis-cpu-high`
2. Conferir logs do backend para `rate_limit` e `chat.socket`
3. Validar conectividade do `REDIS_URL`

### Falha de push

1. Verificar métrica `PushDeliveryFailures`
2. Conferir logs `notification.send_to_device.failed`
3. Revisar ARNs de platform application e endpoint ARN salvo

### Falha de e-mail

1. Verificar métrica `EmailSendFailures`
2. Conferir logs `email.send.failed`
3. Revisar identidade SES, sandbox e remetente configurado

### Traços X-Ray ausentes

1. Confirmar `AWS_XRAY_ENABLED=true`
2. Confirmar `AWS_XRAY_DAEMON_ADDRESS`
3. Validar sidecar/daemon no runtime ECS
4. Verificar header `x-amzn-trace-id` chegando ao backend
