# Meu Agito - AWS Observability Plan

## Objetivo

Definir o plano de observabilidade do Meu Agito na AWS.

Este arquivo nao cria recursos.
Ele documenta logs, metricas, erros, alertas e diagnostico antes da criacao da infraestrutura.

---

## Servicos alvo

- Amazon CloudWatch
- AWS CloudTrail
- AWS X-Ray, quando aplicavel
- Sentry ou equivalente, opcional
- Logs do ECS
- Logs do Application Load Balancer
- Logs do RDS, quando aplicavel
- Logs do ElastiCache, quando aplicavel
- Metricas do CloudFront e S3

---

## Funcao do CloudWatch

O CloudWatch sera usado para:

- armazenar logs do backend
- visualizar metricas operacionais
- criar alarmes
- acompanhar saude do ECS
- acompanhar saude do ALB
- acompanhar uso de RDS
- acompanhar uso de ElastiCache
- apoiar diagnostico de incidentes

---

## Funcao do CloudTrail

O CloudTrail deve ser usado para auditoria de acoes na conta AWS.

Uso previsto:

- registrar chamadas de API da AWS
- investigar mudancas de infraestrutura
- identificar acoes administrativas
- apoiar seguranca e auditoria

---

## Funcao de crash monitoring opcional

Sentry ou equivalente pode ser usado para:

- erros do backend
- erros do app mobile
- stack traces controladas
- contexto de usuario sem expor dados sensiveis
- alertas de regressao
- analise de crashes e falhas

---

## Logs do backend

Requisitos:

- logs estruturados
- requestId ou correlationId
- timestamp
- nivel de log
- contexto da rota ou operacao
- erro tratado
- sem tokens
- sem senhas
- sem secrets
- sem payload sensivel desnecessario

Niveis esperados:

- error
- warn
- info
- debug apenas em development ou troubleshooting controlado

---

## Logs do ECS

Requisitos:

- enviar stdout/stderr do container para CloudWatch
- criar log group especifico do Meu Agito
- definir retencao de logs
- evitar log infinito sem retencao
- padronizar nome dos streams

Padrao versionado nesta etapa:

- log group padrao: `/aws/ecs/meuagito-prod-backend`
- namespace padrao: `MeuAgito/prod`
- retencao padrao: `30` dias
- script operacional: `backend/scripts/aws/apply-observability.ps1`

---

## Logs do ALB

Uso previsto:

- investigar erros 4xx e 5xx
- verificar latencia
- verificar origem de requests
- diagnosticar problemas de WebSocket
- validar health check

Decisao:

- habilitar quando houver necessidade operacional ou antes de producao publica
- armazenar em S3 se habilitado
- definir politica de retencao

---

## Metricas principais

### Backend / ECS

Monitorar:

- CPU
- memoria
- task restarts
- numero de tasks saudaveis
- latencia da API
- taxa de erro
- health check failures

### ALB

Monitorar:

- TargetResponseTime
- HTTPCode_Target_5XX_Count
- HTTPCode_Target_4XX_Count
- UnHealthyHostCount
- RequestCount

### RDS PostgreSQL

Monitorar:

- CPU
- memoria
- conexoes
- storage livre
- IOPS
- latencia
- locks
- queries lentas quando aplicavel

### ElastiCache Redis/Valkey

Monitorar:

- CPU
- memoria
- conexoes
- evictions
- cache hit/miss quando aplicavel
- latencia

### S3 / CloudFront

Monitorar:

- erros 4xx/5xx
- trafego
- requisicoes
- tamanho armazenado
- custos
- cache hit ratio do CloudFront

---

## Alertas iniciais recomendados

Criar alertas para:

- custo acima do esperado
- backend indisponivel
- ALB com targets unhealthy
- aumento de erros 5xx
- RDS com pouco storage livre
- RDS com CPU alta persistente
- Redis com memoria alta
- falhas recorrentes de push
- falhas recorrentes de e-mail
- aumento de erros em ferramenta opcional de crash monitoring

---

## Retencao de logs

Definir retencao para:

- logs backend
- logs ECS
- logs ALB
- logs de auditoria
- logs de troubleshooting

Regra:

- nao manter logs indefinidamente sem justificativa
- nao apagar logs criticos cedo demais
- balancear custo e necessidade de diagnostico

---

## AuditLog da aplicacao

A aplicacao deve registrar acoes criticas no banco:

- login sensivel
- alteracao de perfil
- alteracao de estabelecimento
- alteracao de permissao
- acoes administrativas
- moderacao
- eventos de seguranca

AuditLog da aplicacao nao substitui CloudTrail.
CloudTrail audita AWS.
AuditLog audita comportamento dentro do Meu Agito.

---

## Privacidade

Regras:

- nao logar senhas
- nao logar JWT
- nao logar refresh token
- nao logar secrets
- nao logar dados sensiveis de localizacao sem necessidade
- mascarar e-mails quando apropriado
- minimizar dados pessoais em ferramentas externas

---

## Troubleshooting

Documentar procedimentos para:

- API fora do ar
- erro de banco
- erro de Redis
- falha de upload
- falha de push
- falha de e-mail
- erro de login
- erro de WebSocket
- consumo inesperado de custo

Runbook associado:

- `doc/aws doc/AWS_OBSERVABILITY_RUNBOOK.md`

---

## Criterios de aceite antes do deploy real

- Logs do backend aparecem no CloudWatch.
- Erros criticos aparecem no CloudWatch e, se adotado, em ferramenta opcional de crash monitoring.
- Health check e monitoramento basico existem.
- Retencao de logs esta definida.
- Logs nao vazam secrets.
- Alarmes principais estao planejados.
- Custo esta coberto por budgets.
- Existe caminho de diagnostico para falhas principais.

---

## Proximo documento relacionado

AWS_DEPLOY_CHECKLIST.md
