# Meu Agito — AWS Local Setup

## Perfil AWS CLI

Profile: meuagito-admin  
Region: sa-east-1  
Account: 139023234711  
Access: IAM Identity Center / AWSReservedSSO  
Permission set: MeuAgito-AdminAccess  

## Observações

- Não usar root para trabalho diário.
- Usar este profile para comandos AWS CLI.
- Não criar infraestrutura sem revisão prévia.
- Não versionar secrets, tokens, access keys ou credenciais.

## Comandos mínimos de validação

```bash
# confirmar profiles visíveis
aws configure list-profiles

# renovar sessão SSO quando o token expirar
aws sso login --profile meuagito-admin

# validar a conta autenticada
aws sts get-caller-identity --profile meuagito-admin
```

## Comandos locais úteis para este repositório

```bash
# validar ferramentas base
git --version
docker --version
docker compose version
aws --version

# subir dependências locais do projeto
docker compose up -d postgres postgres-test redis

# validar compose deste repositório
docker compose config --services
```

## Validacao Docker local do backend

```bash
# subir infra local usada pelo backend
docker compose up -d postgres postgres-test redis backend

# validar containers e healthchecks
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# validar health do backend local
Invoke-WebRequest http://localhost:3001/health
```

## Observacoes operacionais importantes

- `backend/.env.test` usa `localhost:5433` para o `postgres-test`.
- O Compose local atual sobe o backend em runtime via `node:20-alpine`, com bootstrap automatico de dependencias, `prisma generate` e `prisma migrate deploy`.
- Se o `postgres-test` estiver no ar, o problema remanescente mais provavel do `npm run test:e2e` passa a ser memoria do host, nao indisponibilidade de banco.
- Na validacao real desta maquina, `docker compose build backend` e `docker build --target development -t meu-agito-backend-dev backend` falharam com `failed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF`.
- Depois da reconfiguracao do Compose local e do reequilibrio de memoria do host, o `npm run test:e2e` voltou a passar.
- Leitura correta: a configuracao Docker local do projeto esta funcional; a pendencia remanescente ficou no build da imagem customizada em host/runner com memoria mais estavel.

## Observação operacional atual

- Se `aws sts get-caller-identity --profile meuagito-admin` falhar com token expirado, o próximo passo correto é rodar `aws sso login --profile meuagito-admin`.
