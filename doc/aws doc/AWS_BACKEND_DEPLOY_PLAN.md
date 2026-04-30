# Meu Agito - AWS Backend Deploy Plan

## Objetivo

Definir o plano de deploy do backend NestJS do Meu Agito na AWS.

Este arquivo nao cria recursos.
Ele documenta a arquitetura de deploy, os componentes envolvidos e os criterios de aceite antes da criacao da infraestrutura.

---

## Servicos alvo

- Amazon ECR
- Amazon ECS Fargate
- Application Load Balancer
- AWS Certificate Manager
- Amazon RDS PostgreSQL
- Amazon ElastiCache Redis/Valkey
- Amazon S3
- Amazon CloudWatch
- AWS Secrets Manager ou AWS Systems Manager Parameter Store

---

## Funcao do ECR

O Amazon ECR sera usado para armazenar a imagem Docker do backend.

Uso previsto:

- versionar imagens do backend
- separar build de execucao
- permitir rollback por tag
- servir imagem para o ECS Fargate

---

## Funcao do ECS Fargate

O ECS Fargate sera usado para executar o backend NestJS sem gerenciar servidores diretamente.

Uso previsto:

- rodar a API REST
- rodar Socket.IO
- conectar com RDS
- conectar com ElastiCache
- conectar com S3
- enviar e-mails
- enviar push notifications
- gerar logs no CloudWatch

---

## Funcao do Application Load Balancer

O Application Load Balancer sera o ponto publico de entrada do backend.

Uso previsto:

- receber trafego HTTPS
- encaminhar requisicoes para o ECS
- suportar WebSocket/Socket.IO
- executar health checks
- permitir escalabilidade horizontal
- centralizar exposicao publica da API

---

## Funcao do ACM

O AWS Certificate Manager sera usado para gerenciar certificados TLS/SSL.

Uso previsto:

- HTTPS da API
- certificado do dominio ou subdominio
- renovacao gerenciada pela AWS

---

## Estrutura esperada

Fluxo de requisicao:

App mobile
-> HTTPS / WebSocket
-> Application Load Balancer
-> ECS Fargate
-> Backend NestJS
-> RDS PostgreSQL / ElastiCache / S3 / provedores externos

---

## Regras obrigatorias

- O backend nao deve ficar exposto diretamente a internet sem ALB.
- O backend deve rodar em container.
- A imagem deve ser armazenada no ECR.
- Secrets nao devem ficar na imagem Docker.
- Secrets devem vir de Secrets Manager ou SSM.
- Banco deve ficar privado.
- Redis deve ficar privado.
- HTTPS deve ser obrigatorio.
- WebSocket deve funcionar via ALB.
- Logs devem ir para CloudWatch.
- Health check deve ser funcional.
- Migrations devem ter processo controlado.

---

## Variaveis esperadas

As variaveis finais devem ser definidas conforme o codigo real.

Variaveis provaveis:

- NODE_ENV
- PORT
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- CORS_ORIGIN
- STORAGE_PROVIDER
- AWS_REGION
- AWS_S3_BUCKET
- AWS_CLOUDFRONT_URL
- EMAIL_PROVIDER
- AWS_SES_REGION
- AWS_SES_FROM_EMAIL
- PUSH_PROVIDER
- AWS_SNS_REGION
- AWS_SNS_DEFAULT_TOPIC_ARN, quando configurado
- AWS_SNS_TOPIC_ARN_PREFIX, quando configurado
- AWS_SNS_PLATFORM_APPLICATION_ARN ou ARNs especificos por plataforma, quando configurados
- SENTRY_DSN opcional

Nenhuma dessas variaveis deve ser versionada com valor real.

---

## Porta da aplicacao

A porta final deve respeitar o codigo real do backend.

Regras:

- usar variavel PORT quando existente
- ALB deve encaminhar para a porta exposta pela task ECS
- health check deve usar endpoint real do backend
- nao assumir porta sem verificar o codigo

---

## Health check

Endpoint esperado:

- /health

Regras:

- health check deve validar pelo menos disponibilidade da aplicacao
- idealmente deve validar banco
- futuramente pode validar Redis e Storage
- ALB deve usar endpoint de health estavel

---

## Migrations Prisma

O projeto usa Prisma e PostgreSQL.

Regras:

- migrations devem ser executadas de forma controlada
- migration nao deve rodar de forma concorrente em multiplas tasks
- evitar que cada task execute migration automaticamente sem estrategia
- definir processo claro para migrate deploy
- rollback deve ser considerado antes de mudancas criticas

---

## Estrategia de deploy

A estrategia deve ser definida antes da primeira criacao real de recursos.

Opcoes:

1. Deploy manual controlado
2. Deploy via pipeline
3. Deploy com etapa separada de migration
4. Deploy blue/green no futuro

Decisao inicial recomendada:

- comecar com deploy controlado
- manter migration como etapa explicita
- evoluir para pipeline depois que a infraestrutura estiver validada

---

## Logs

Requisitos:

- logs da aplicacao devem ir para CloudWatch
- logs nao devem conter secrets
- logs devem conter contexto suficiente para depuracao
- requestId/correlationId deve ser considerado
- tempo de retencao deve ser definido

---

## Seguranca

Requisitos:

- ECS recebe trafego apenas do ALB
- RDS recebe trafego apenas do ECS
- ElastiCache recebe trafego apenas do ECS
- secrets nao ficam no Dockerfile
- secrets nao ficam no repositorio
- CORS de producao deve ser restrito
- stack trace nao deve vazar em production
- IAM roles devem seguir menor privilegio quando possivel

---

## Escalabilidade

Preparar para:

- aumentar numero de tasks ECS
- usar Redis adapter para Socket.IO
- usar cache distribuido
- separar migrations do runtime
- monitorar CPU, memoria, latencia e erros
- configurar auto scaling quando houver metrica confiavel

---

## Observabilidade

Integrar com:

- CloudWatch para logs operacionais
- CloudWatch como base operacional e Sentry ou equivalente apenas como complemento opcional
- health checks
- metricas basicas
- alarmes de falha

---

## Checklist antes da criacao da infraestrutura

- [ ] Dockerfile validado.
- [ ] Build local do backend validado.
- [ ] Porta da aplicacao confirmada.
- [ ] Endpoint /health confirmado.
- [ ] Variaveis obrigatorias documentadas.
- [ ] Secrets definidos fora do codigo.
- [ ] RDS planejado.
- [ ] Redis planejado.
- [ ] S3 planejado.
- [ ] ALB planejado.
- [ ] Certificado ACM planejado.
- [ ] Estrategia de migration definida.
- [ ] Estrategia de rollback definida.
- [ ] Logs CloudWatch planejados.
- [ ] Custos revisados.

---

## Criterios de aceite antes do deploy real

- Backend sobe em container.
- Backend conecta no RDS.
- Backend conecta no Redis quando habilitado.
- Backend acessa S3 quando necessario.
- /health responde pelo ALB.
- HTTPS funciona.
- WebSocket funciona.
- Logs aparecem no CloudWatch.
- Secrets nao aparecem em logs.
- Migrations foram aplicadas de forma controlada.
- App mobile consegue acessar a API publica.

---

## Proximo documento relacionado

AWS_OBSERVABILITY_PLAN.md
