# 28 — Tecnologias do Projeto Meu Agito

> Documento gerado automaticamente em 26/03/2026
> Total de tecnologias únicas: **70+**

---

## Índice

1. [Frontend — Aplicativo Mobile](#1-frontend--aplicativo-mobile)
2. [Backend — API Server](#2-backend--api-server)
3. [Banco de Dados](#3-banco-de-dados)
4. [DevOps & Infraestrutura](#4-devops--infraestrutura)
5. [Testes](#5-testes)
6. [Estilização & Design System](#6-estilização--design-system)
7. [Ferramentas de Build & Transpilação](#7-ferramentas-de-build--transpilação)
8. [Qualidade de Código & Linting](#8-qualidade-de-código--linting)
9. [Segurança](#9-segurança)
10. [APIs Externas](#10-apis-externas)
11. [Resumo Geral](#11-resumo-geral)

---

## 1. Frontend — Aplicativo Mobile

### Framework & Runtime

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React Native** | ^0.73.0 | Framework mobile cross-platform |
| **Expo** | ^50.0.0 | Plataforma/toolchain de desenvolvimento React Native |
| **React** | ^18.2.0 | Biblioteca de interface do usuário |
| **TypeScript** | ^5.3.3 | Superset tipado de JavaScript |

### Navegação

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **@react-navigation/native** | ^6.1.9 | Container de navegação principal |
| **@react-navigation/native-stack** | ^6.9.17 | Navegador de pilha nativo |
| **@react-navigation/bottom-tabs** | ^6.5.11 | Navegador de abas inferiores |

### Gerenciamento de Estado & Dados

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Zustand** | ^4.4.7 | Gerenciamento de estado leve (stores: auth, location, chat, feed, user) |
| **@tanstack/react-query** | ^5.28.0 | Gerenciamento de estado do servidor / data fetching |
| **Axios** | ^1.6.5 | Cliente HTTP (com interceptor JWT e auto-refresh) |

### Módulos Expo

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **expo-constants** | ^15.4.5 | Acesso a constantes do sistema |
| **expo-font** | ^11.10.3 | Carregamento de fontes customizadas |
| **expo-secure-store** | ~12.3.0 | Armazenamento seguro key-value |
| **expo-image-picker** | ^14.7.1 | Seleção de imagens (câmera/galeria) |
| **expo-location** | ^16.5.5 | Serviços de geolocalização GPS |
| **expo-local-authentication** | ~13.8.0 | Autenticação biométrica (Face ID / Digital) |
| **expo-splash-screen** | ^0.26.5 | Gerenciamento de splash screen |
| **expo-status-bar** | ^1.11.1 | Configuração da barra de status |
| **expo-app-loading** | ^2.1.1 | Estado de carregamento do app |

### UI React Native & Gestos

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **react-native-gesture-handler** | ^2.14.1 | Tratamento de gestos |
| **react-native-reanimated** | ^3.5.4 | Animações avançadas |
| **react-native-safe-area-context** | ^4.8.2 | Inserções de área segura |
| **react-native-screens** | ^3.27.0 | Contêineres de tela nativos |
| **react-native-svg** | ^13.14.0 | Renderização de SVG |
| **react-native-maps** | ^1.10.0 | Mapas interativos (Google Maps / Apple Maps) |
| **react-native-keyboard-aware-scroll-view** | ^0.9.5 | Scroll com suporte ao teclado |
| **lottie-react-native** | ^6.4.0 | Animações Lottie |

### Comunicação em Tempo Real

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **socket.io-client** | ^4.7.2 | Comunicação WebSocket em tempo real |
| **react-native-socket.io-client** | ^1.4.8 | Cliente Socket.IO específico para RN |

### Utilitários

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **moment** | ^2.29.4 | Manipulação de data/hora |
| **@react-native-async-storage/async-storage** | ^1.21.0 | Armazenamento local persistente |
| **@react-native-community/geolocation** | ^2.0.8 | Módulo de geolocalização da comunidade |
| **@react-native-community/hooks** | ^3.0.0 | Hooks para React Native |
| **@react-native-clipboard/clipboard** | ^1.13.2 | Acesso à área de transferência |

### Fontes Customizadas

- Montserrat Bold (.ttf)
- Montserrat Regular (.ttf)
- Montserrat SemiBold (.ttf)

---

## 2. Backend — API Server

### Framework & Runtime

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **NestJS** | ^10.2.10 | Framework Node.js empresarial |
| **Node.js** | 20 LTS (Alpine) | Runtime JavaScript (via Dockerfile) |
| **TypeScript** | ^5.3.3 | JavaScript tipado |
| **RxJS** | ^7.8.1 | Extensões reativas para operações assíncronas |

### Ecossistema NestJS

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **@nestjs/common** | ^10.2.10 | Decorators e utilitários principais |
| **@nestjs/core** | ^10.2.10 | Framework principal |
| **@nestjs/platform-express** | ^10.2.10 | Adaptador HTTP Express |
| **@nestjs/config** | ^3.1.1 | Gerenciamento de configuração (.env) |
| **@nestjs/swagger** | ^7.1.14 | Documentação OpenAPI/Swagger |
| **@nestjs/jwt** | ^11.0.1 | Gerenciamento de tokens JWT |
| **@nestjs/passport** | ^10.0.3 | Integração de autenticação Passport |
| **@nestjs/websockets** | ^10.2.10 | Suporte a WebSocket |
| **@nestjs/cli** | ^10.2.1 | Ferramentas CLI (devDep) |
| **@nestjs/schematics** | ^10.0.3 | Geração de código (devDep) |
| **@nestjs/testing** | ^10.2.10 | Utilitários de teste (devDep) |

### Autenticação & Segurança

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Passport** | ^0.7.0 | Middleware de autenticação |
| **passport-jwt** | ^4.0.1 | Estratégia de autenticação JWT |
| **bcryptjs** | ^2.4.3 | Hash de senhas |
| **helmet** | ^7.1.0 | Cabeçalhos de segurança HTTP |
| **swagger-ui-express** | ^5.0.0 | UI de documentação da API |

### Estratégias de Autenticação Implementadas

- JWT Strategy (bearer token)
- Refresh Token Strategy (rotação de tokens)
- Local Strategy (email/senha)

### Validação & Transformação

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **class-validator** | ^0.14.0 | Decorators de validação de DTOs |
| **class-transformer** | ^0.5.1 | Transformação de objetos |

### Tempo Real

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Socket.IO** | ^4.7.2 | Servidor WebSocket (gateway de chat) |

### Cache

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **cache-manager** | ^5.4.0 | Cache em memória/distribuído |

### Utilitários

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **reflect-metadata** | ^0.1.13 | Reflexão de metadados de decorators |
| **rimraf** | ^5.0.5 | Remoção de arquivos cross-platform |

### Módulos do Backend

- **Auth** — JWT + refresh tokens + local strategy
- **Users** — Perfis e gerenciamento de usuários
- **Feed** — Feed social (posts, stories, likes, comentários)
- **Search** — Busca global e avançada
- **Events** — Gerenciamento de eventos
- **Establishments** — Gerenciamento de estabelecimentos
- **Chat** — Gateway WebSocket para mensagens
- **Health** — Health checks da aplicação

---

## 3. Banco de Dados

### Tecnologias de Persistência

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **PostgreSQL** | 16 (Alpine) | Banco de dados relacional principal |
| **Prisma** | ^5.7.1 | ORM de banco de dados (schema, migrations, client) |
| **@prisma/client** | ^5.7.1 | Cliente runtime do Prisma |
| **Redis** | 7 (Alpine) | Cache em memória / store de sessões |

### Schema do Banco (16 Models)

| Modelo | Descrição |
|---|---|
| **User** | Usuários do sistema |
| **UserLocation** | Localização dos usuários |
| **Follow** | Relacionamentos de seguimento |
| **Post** | Publicações do feed |
| **Comment** | Comentários em posts |
| **Like** | Curtidas em posts |
| **CommentLike** | Curtidas em comentários |
| **Story** | Stories efêmeros |
| **Conversation** | Conversas de chat |
| **Message** | Mensagens individuais |
| **Notification** | Notificações do sistema |
| **Establishment** | Estabelecimentos |
| **Event** | Eventos |
| **Review** | Avaliações |
| **RefreshToken** | Tokens de atualização JWT |
| **AuditLog** | Log de auditoria |

### Recursos do PostgreSQL Utilizados

- Chaves primárias CUID
- Colunas JSON (AuditLog.changes)
- Colunas de array (Post.imageUrls, Event.sourceApis)
- Índices compostos (geolocalização lat/lng, por zona)
- Soft deletes (isDeleted + deletedAt)
- Conformidade LGPD

---

## 4. DevOps & Infraestrutura

### Containerização

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Docker** | — | Containerização de aplicações |
| **Docker Compose** | 3.9 | Orquestração multi-contêiner |
| **pgAdmin** | latest (dpage/pgadmin4) | UI de gerenciamento do PostgreSQL |
| **Node.js** | 20-alpine | Imagem Docker base (build multi-estágio) |

### Serviços Docker

| Serviço | Imagem | Porta | Finalidade |
|---|---|---|---|
| **postgres** | postgres:16-alpine | 5432 | Banco de dados relacional |
| **redis** | redis:7-alpine | 6379 | Cache e sessões |
| **backend** | node:20-alpine (build multi-estágio) | 3000 | API NestJS |
| **pgadmin** | dpage/pgadmin4 | 5050 | Gerenciamento visual do banco |

### Cloud Services Planejados/Referenciados

| Tecnologia | Finalidade |
|---|---|
| **AWS S3** | Armazenamento de arquivos (uploads) |
| **AWS RDS** | PostgreSQL gerenciado (produção) |
| **AWS ElastiCache** | Redis gerenciado (produção) |
| **GitHub Actions** | CI/CD (referenciado no README) |
| **EAS Build** | Expo Application Services para builds mobile |
| **EAS Submit** | Submissão à App Store / Play Store |

---

## 5. Testes

### Frameworks & Bibliotecas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Jest** | ^29.7.0 | Test runner (frontend e backend) |
| **ts-jest** | ^29.1.1 | Transformador TypeScript para Jest (backend) |
| **jest-expo** | ^50.0.0 | Preset Jest específico para Expo (frontend) |
| **@testing-library/react-native** | ^12.4.2 | Testes de componentes React Native |
| **@testing-library/jest-native** | ^5.4.3 | Matchers Jest para React Native |
| **@types/jest** | ^29.5.8 | Definições de tipos do Jest |

### Tipos de Teste Configurados

| Comando | Finalidade |
|---|---|
| `npm test` | Testes unitários |
| `npm run test:cov` | Testes com cobertura |
| `npm run test:e2e` | Testes end-to-end (backend) |
| `npm run test:watch` | Modo watch para desenvolvimento |

---

## 6. Estilização & Design System

### Abordagem de Estilização

| Tecnologia | Abordagem |
|---|---|
| **React Native StyleSheet** | Estilos inline via `StyleSheet.create()` |
| **Custom Design System** | Design tokens em `src/constants/colors.ts` e `design.ts` |
| **Montserrat Font Family** | Bold, Regular, SemiBold (fontes customizadas) |
| **Dark Theme** | Fundo escuro (#0D0D0D), acento laranja (#E8640A) |

### Tokens de Design

| Token | Valor | Uso |
|---|---|---|
| Background | `#0D0D0D` | Fundo principal (dark) |
| Accent | `#E8640A` | Cor de destaque (laranja) |
| Font Primary | Montserrat Regular | Texto corpo |
| Font Heading | Montserrat Bold | Títulos |
| Font SemiBold | Montserrat SemiBold | Subtítulos |

---

## 7. Ferramentas de Build & Transpilação

### Frontend (Expo/Metro)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Babel** | ^7.23.5 | Transpilador JavaScript |
| **@babel/core** | ^7.23.5 | Compilador principal do Babel |
| **@babel/preset-react** | ^7.23.3 | Transformação JSX do React |
| **@babel/preset-typescript** | ^7.23.3 | Transformação TypeScript |
| **babel-preset-expo** | ^10.0.0 | Preset Babel específico do Expo |
| **babel-plugin-module-resolver** | — | Resolução de aliases de caminho (@components, @screens, etc.) |
| **react-native-reanimated/plugin** | — | Plugin Babel do Reanimated |
| **Metro** | (incluso no Expo) | Bundler do React Native |

### Backend (NestJS)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **ts-loader** | ^9.5.1 | Loader TypeScript (webpack) |
| **ts-node** | ^10.9.2 | Execução TypeScript direta |
| **tsconfig-paths** | ^4.2.0 | Resolução de aliases em runtime |

---

## 8. Qualidade de Código & Linting

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **ESLint** | ^8.55.0 | Linter JavaScript/TypeScript |
| **@typescript-eslint/parser** | ^6.13.2 | Parser TypeScript para ESLint |
| **@typescript-eslint/eslint-plugin** | ^6.13.2 | Regras de lint específicas do TypeScript |
| **eslint-config-prettier** | ^9.1.0 | Desabilita regras ESLint conflitantes com Prettier |
| **eslint-plugin-prettier** | ^5.0.1 | Executa Prettier como regra ESLint |
| **Prettier** | ^3.1.0 | Formatador de código |

### Configuração Prettier

| Opção | Valor |
|---|---|
| Semicolons | Sim |
| Trailing Commas | ES5 |
| Quotes | Simples |
| Print Width | 100 |
| Tab Width | 2 (espaços) |
| End of Line | LF |

---

## 9. Segurança

| Tecnologia/Padrão | Implementação |
|---|---|
| **JWT Access Tokens** | Expiração de 15 minutos |
| **Refresh Token Rotation** | Expiração de 7 dias com revogação |
| **bcrypt Password Hashing** | Salt rounds = 10 |
| **Helmet.js** | Cabeçalhos de segurança HTTP |
| **CORS** | Whitelist de origens configurável |
| **ValidationPipe** | Whitelist + transform + proibir não-whitelisted |
| **Prisma ORM** | Prevenção de SQL injection |
| **Conformidade LGPD** | Soft deletes em todo conteúdo do usuário |

---

## 10. APIs Externas

| API | Finalidade |
|---|---|
| **Overpass API** | Consulta de dados do OpenStreetMap (estabelecimentos) |
| **Nominatim** | Geocodificação / geocodificação reversa |

---

## 11. Resumo Geral

### Contagem de Dependências

| Categoria | Quantidade |
|---|---|
| Dependências de produção (Frontend) | 33 pacotes |
| Dependências de desenvolvimento (Frontend) | 13 pacotes |
| Dependências de produção (Backend) | 21 pacotes |
| Dependências de desenvolvimento (Backend) | 12 pacotes |
| Serviços Docker | 4 (postgres, redis, backend, pgadmin) |
| **Total de tecnologias únicas** | **70+** |

### Stack Resumida

```
┌─────────────────────────────────────────────────────────────┐
│                    MEU AGITO - TECH STACK                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MOBILE          BACKEND           DATA         INFRA       │
│  ─────           ───────           ────         ─────       │
│  React Native    NestJS 10         PostgreSQL   Docker      │
│  Expo 50         Node.js 20        Prisma 5     Docker      │
│  TypeScript 5    TypeScript 5      Redis 7      Compose     │
│  Zustand         Passport JWT                  GitHub       │
│  React Query     Socket.IO                     Actions      │
│  Axios           class-validator               AWS S3       │
│  React Maps      Helmet.js                     AWS RDS      │
│  Socket.IO                                        EAS        │
│  Lottie                                           Build      │
│                                                             │
│  TESTING         CODE QUALITY      DESIGN                   │
│  ───────         ────────────      ──────                   │
│  Jest 29         ESLint 8          Dark Theme               │
│  Testing         Prettier 3        Montserrat               │
│  Library         TypeScript        Orange Accent            │
│                  ESLint                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Arquitetura Geral

```
meu-agito/
├── backend/                      # NestJS API (Node.js 20)
│   ├── src/
│   │   ├── modules/              # 8 módulos: auth, chat, establishments,
│   │   │                         # events, feed, health, search, users
│   │   ├── common/               # Serviço Prisma, DTOs
│   │   ├── app.module.ts         # Módulo raiz
│   │   └── main.ts               # Ponto de entrada (Swagger + Helmet + CORS)
│   ├── prisma/
│   │   ├── schema.prisma         # 16 models
│   │   └── seed.ts               # Dados de teste
│   ├── test/                     # Testes E2E
│   ├── Dockerfile                # Build multi-estágio
│   ├── .env / .env.example
│   └── package.json
│
├── frontend/                     # React Native + Expo 50
│   ├── src/
│   │   ├── screens/              # 19 telas (auth: 4, main: 15)
│   │   ├── components/           # Button, Input, Loading
│   │   ├── store/                # Zustand: useAuthStore, useLocationStore
│   │   ├── stores/               # Zustand: auth, chat, feed, location, user
│   │   ├── services/             # API client, geolocation, Socket.IO manager
│   │   ├── hooks/                # useAuth, useChat, useFeed, useLocation,
│   │   │                         # useSearch, useUser
│   │   ├── constants/            # colors.ts, design.ts
│   │   ├── types/                # Definições de tipos
│   │   └── App.tsx               # Ponto de entrada
│   ├── assets/                   # Ícones, splash, fontes (Montserrat)
│   ├── app.json                  # Configuração Expo
│   ├── .env
│   └── package.json
│
├── docker-compose.yml            # PostgreSQL 16 + Redis 7 + pgAdmin + Backend
├── setup.sh                      # Script de setup automatizado
└── README.md                     # Documentação principal
```

---

*Documento gerado automaticamente pelo agente Kilo em 26/03/2026.*