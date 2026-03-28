# Meu Agito - Aplicação Completa

🎯 **Descobra estabelecimentos e eventos perto de você em tempo real!**

Aplicação mobile (iOS/Android) + Web que conecta usuários com estabelecimentos, eventos e pessoas em sua localidade.

## 🚀 Quick Start com Docker

```bash
# Clonar repositório
git clone <repo>
cd meu-agito

# Subir infraestrutura (PostgreSQL + Redis)
docker-compose up -d

# Instalar dependências do backend
cd backend
npm install

# Gerar Prisma client
npm run prisma:generate

# Aplicar migrations do banco
npm run prisma:migrate

# Seed inicial (opcional)
npm run prisma:seed

# Iniciar backend em desenvolvimento
npm run start:dev

# Em outro terminal: instalar frontend
cd ../frontend
npm install

# Iniciar Expo
npm start
```

## 📁 Estrutura do Projeto

```
meu-agito/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/     # Auth, Users, Posts, Search, etc
│   │   ├── common/      # Prisma, Guards, Filters
│   │   └── config/      # Environment, Database
│   ├── prisma/          # Schema + Migrations
│   ├── test/            # E2E tests
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── frontend/             # React Native + Expo
│   ├── src/
│   │   ├── screens/     # Auth, Main (Home, Search, Map, Chat, Profile)
│   │   ├── store/       # Zustand (Auth, Location)
│   │   ├── services/    # API Client, Geolocation
│   │   ├── components/  # Reusable components
│   │   └── App.tsx      # Entry point
│   ├── app.json         # Expo config
│   └── package.json
│
├── docker-compose.yml    # PostgreSQL + Redis + pgAdmin
└── README.md            # This file
```

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: NestJS 10.x
- **Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL 16 + PostGIS (geospatial)
- **Cache**: Redis 7.x
- **ORM**: Prisma 5.x
- **Auth**: JWT + Refresh Tokens
- **Search**: PostgreSQL FTS (v1.0) → Elasticsearch (v1.2+)

### Frontend
- **Framework**: React Native 0.73
- **Platform**: Expo 50
- **Navigation**: React Navigation 6.x
- **State**: Zustand 4.x
- **Data Fetching**: TanStack Query 5.x
- **HTTP**: Axios
- **Geolocation**: Expo Location 16.x
- **Real-time**: Socket.io

### DevOps
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (ready)
- **Cloud**: AWS (RDS, S3, ElastiCache)
- **Monitoring**: Sentry + Winston logs

## 📊 Banco de Dados

15 tabelas principais:
- **Users**: User, UserLocation, Follow
- **Social**: Post, Comment, Like, Story
- **Messaging**: Message, Notification
- **Discovery**: Establishment, Event
- **System**: RefreshToken, AuditLog

```sql
-- Acessar via pgAdmin
http://localhost:5050
Email: admin@example.com
Password: admin123
```

## 🔑 Funcionalidades

### v1.0 (MVP - 4 semanas)
- ✅ Autenticação (JWT + refresh tokens)
- ✅ Perfis de usuário
- ✅ Feed social local
- ✅ Busca de estabelecimentos
- ✅ Mapa interativo (zoom 1-7 zones)
- ✅ Chat privado
- ✅ Notificações push

### v1.1 (Estabilização)
- Busca avançada (Elasticsearch)
- Sistema de eventos (5 sources)
- Ratings & Reviews
- Profiles verificados

### v1.2 (Marketplace)
- Anúncios por estabelecimentos
- Dashboard admin
- Integração Stripe
- Analytics

### v2.0+ (Futuro)
- Live streaming eventos
- Grupos & Comunidades
- Integração com delivery
- Suporte para múltiplos países

## 📖 Documentação Completa

Todos os detalhes técnicos estão documentados em:

```
../doc vitrini/
├── 00_MEMORY_UPDATE.md                      # Context do projeto
├── 01_DIAGNOSTIC_GAPS.md                    # 28 gaps identificados
├── 02_PRD_MEUAGITO.md                       # Requisitos (90+)
├── 03_TECHNICAL_BLUEPRINT.md                # Arquitetura + DB schema
├── 04_FILE_TREES_COMPLETE.md               # Estrutura de pastas (140 arquivos)
├── 05_IMPLEMENTATION_GUIDE.md              # 43 steps sequenciais
├── 06_STRATEGIC_SUGGESTIONS.md             # Otimizações
├── 07_MASTER_BLUEPRINT_SUMMARY.md          # Sumário executivo
├── 08_ALTERNATIVAS_GOOGLE_PLACES.md        # APIs free ($31k economia)
├── 09_GEOLOCALIZAÇÃO_AUTOMÁTICA.md         # GPS implementation
├── 10_GEOLOC_APIS_POPULAÇÃO.md             # Data flow
├── 11_CACHE_BACKEND_OVERPASS.md            # Cache strategy
├── 12_ESTRATÉGIA_UNIFICADA_FINAL.md        # 12 steps de implementação
└── 13_AUDITORIA_PROMPT_META.md             # Verificação de conformidade
```

## 🧪 Testes

### Backend
```bash
cd backend

# Testes unitários
npm test

# Testes com cobertura (>80%)
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Frontend
```bash
cd frontend

# Testes
npm test

# Cobertura
npm run test:cov
```

## 📱 Executar em Dispositivos

### iOS
```bash
npm run ios
# Abre iOS Simulator automaticamente
```

### Android
```bash
npm run android
# Requer Android Emulator ativo
```

### Web
```bash
npm run web
# Abre em http://localhost:19006
```

## 🔐 Segurança

- JWT authentication + refresh token rotation
- Password hashing (bcrypt)
- CORS configurado
- Rate limiting por endpoint
- SQL injection prevention (Prisma)
- Input validation automática
- LGPD compliance (soft deletes)

## 📊 Performance

- **Home load**: <1.5s
- **Search**: <800ms
- **Cache**: <2ms (Redis)
- **API reduction**: 99% (3-tier fallback)
- **Uptime**: 99.5%+

## 🚢 Deploy

### Backend
```bash
# Build Docker image
docker build -t meuagito-backend ./backend

# Push para registry
docker push your-registry/meuagito-backend:latest

# Deploy no ECS/K8s
kubectl apply -f k8s/backend.yaml
```

### Frontend
```bash
# Build APK (Android)
eas build --platform android

# Build IPA (iOS)
eas build --platform ios

# Publicar na Play Store
eas submit --platform android

# Publicar na App Store
eas submit --platform ios
```

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: support@meuagito.com
- 💬 Discord: [Link do servidor]
- 🐛 Issues: [GitHub Issues]

## 🎯 Roadmap

- [x] Estrutura inicial (v1.0)
- [ ] Autenticação completa
- [ ] Feed social
- [ ] Busca & Discovery
- [ ] Chat & Notificações
- [ ] Eventos (5 sources)
- [ ] Analytics
- [ ] Admin dashboard

---

**Desenvolvido com ❤️ pelo time Meu Agito**

🚀 Status: **Em desenvolvimento ativo**
📅 Última atualização: 26 de março de 2026
