# Meu Agito - Backend

Backend da aplicação Meu Agito, desenvolvido com NestJS, PostgreSQL e Redis.

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (opcional)

## 🚀 Começar Rápido com Docker

```bash
# Na raiz do projeto
docker-compose up -d

# Aplicar migrations
docker exec meuagito-backend npm run prisma:migrate

# Seed inicial (opcional)
docker exec meuagito-backend npm run prisma:seed

# Verificar saúde
curl http://localhost:3001/health
```

## 📦 Instalação Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar Prisma client
npm run prisma:generate

# Aplicar migrations
npm run prisma:migrate

# Seed inicial
npm run prisma:seed

# Iniciar em desenvolvimento
npm run start:dev
```

## 📚 API Documentation

Documentação interativa disponível em: `http://localhost:3001/api/docs`

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📁 Estrutura do Projeto

```
src/
├── modules/           # Módulos da aplicação
│   ├── auth/         # Autenticação
│   ├── users/        # Gerenciamento de usuários
│   ├── posts/        # Posts sociais
│   ├── feed/         # Feed
│   ├── search/       # Sistema de busca
│   ├── chat/         # Mensagens
│   ├── events/       # Eventos
│   ├── establishments/ # Estabelecimentos
│   └── health/       # Health checks
├── common/           # Código compartilhado
│   ├── prisma/      # Serviço Prisma
│   ├── filters/     # Exception filters
│   ├── guards/      # Auth guards
│   ├── pipes/       # Validation pipes
│   └── interceptors/# Response interceptors
├── config/           # Configurações
├── app.module.ts    # Módulo principal
└── main.ts          # Arquivo de inicialização
```

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | String de conexão PostgreSQL | - |
| `REDIS_URL` | URL do Redis | redis://localhost:6379 |
| `JWT_SECRET` | Chave secreta JWT | - |
| `PORT` | Porta do servidor | 3001 |
| `NODE_ENV` | Ambiente | development |

## 📊 Banco de Dados

Schema incluí 15 tabelas principais:
- User, UserLocation, Follow
- Post, Comment, Like, Story
- Message, Notification
- Establishment, Event
- RefreshToken, AuditLog

```bash
# Acessar Prisma Studio (GUI)
npm run prisma:studio
```

## 🛡️ Segurança

- JWT authentication com refresh tokens
- Password hashing com bcrypt
- CORS configurado
- Rate limiting por endpoint
- Input validation automática
- SQL injection prevention (via Prisma)

## 🐛 Debugging

```bash
# Modo debug com Node inspector
npm run start:debug

# Logs detalhados
export LOG_LEVEL=debug && npm run start:dev
```

## 📝 Licença

MIT
