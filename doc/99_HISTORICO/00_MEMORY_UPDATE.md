# 🧠 ATUALIZAÇÃO DA MEMÓRIA DO PROJETO — MEU AGITO

**Data de Geração:** 26 de março de 2026  
**Status:** Fase 1.0 (MVP)  
**Versão:** 1.0.0 (build 42)  
**Responsável:** Central Brain (AI Architect)

---

## 📋 CONTEXTO DO PROJETO — ATUALIZADO

| Campo | Valor |
|-------|-------|
| **Nome do App** | Meu Agito |
| **Tipo do App** | Social Discovery Mobile (Híbrido iOS/Android) |
| **Público-Alvo** | Brasileiros 18-45 anos em cidades grandes · Busca experiências locais e networking |
| **Proposta de Valor** | Descobrir e conectar com estabelecimentos, eventos e pessoas da sua cidade em tempo real |
| **Modelo de Negócios** | Freemium social + Premium features · Monetização via anúncios de estabelecimentos e eventos (Fase 1.2+) |
| **Status Fase** | Phase 1.0 — MVP social discovery com feed, search, perfis, notificações |
| **Lançamento Previsto** | Q2 2026 |

---

## 🏗️ TECH STACK — DEFINIÇÃO FINAL

### **Frontend**
- **Framework:** React Native v0.74 (Expo managed + EAS Build)
- **Linguagem:** TypeScript 5.3
- **State Management:** Redux Toolkit + Redux Persist (AsyncStorage cache)
- **Navigation:** React Navigation 6 (Tab + Stack)
- **UI Components:** React Native Paper 5.x + Custom components
- **HTTP Client:** Axios + interceptors para auth/cache
- **Async Storage:** AsyncStorage (react-native-async-storage)
- **Animations:** Reanimated 3.x + Lottie
- **Maps:** react-native-maps + Google Maps SDK
- **Image Processing:** react-native-image-crop-picker + sharp (backend)
- **Notifications:** @notifee/react-native + Firebase Cloud Messaging
- **Security:** MMKV (encrypted storage) · Certificate pinning via axios-pinning

### **Backend**
- **Framework:** NestJS 10.x
- **Linguagem:** TypeScript 5.3
- **Database:** PostgreSQL 15.x
- **ORM:** Prisma 5.x
- **API:** RESTful (GraphQL em Fase 1.2+)
- **Authentication:** JWT + Refresh Tokens · Google/Apple OAuth
- **Real-time:** WebSocket (socket.io) para typing indicators + Fase 1.2+
- **Queue/Jobs:** Bull/Redis para processamento async (resizing imagens, envio de email)
- **Logging:** Winston + Sentry para observability
- **Cache:** Redis 7.x (sessões, rate limiting, dados quentes)
- **File Storage:** AWS S3 (imagens/vídeos) com signed URLs
- **Search:** PostgreSQL full-text search (Fase 1.0) · Elasticsearch (Fase 1.2+)
- **Validation:** class-validator + class-transformer
- **API Documentation:** Swagger/OpenAPI

### **Infrastructure**
- **Hosting Frontend:** Vercel ou Expo Application Services (EAS)
- **Hosting Backend:** Docker + Railway ou AWS ECS
- **Database Hosting:** Render.com PostgreSQL ou AWS RDS
- **Cache:** Redis Cloud ou Upstash
- **File Storage:** AWS S3
- **Monitoring:** Sentry (errors) + NewRelic (APM) + Grafana (logs)
- **CI/CD:** GitHub Actions
- **Staging/Production:** Separate environments com variáveis de ambiente

### **External APIs**
- **Geolocation:** Google Places API (autocomplete, reverse geocoding)
- **Events:** Sympla API (integration com ticketing)
- **Events:** Eventbrite API (integration com ticketing)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Analytics:** Mixpanel ou Firebase Analytics
- **Email:** SendGrid ou Brevo
- **SMS (2FA):** Twilio

---

## 🎯 FUNCIONALIDADES PRINCIPAIS — FASE 1.0

### **Autenticação & Onboarding**
✅ Sign-up (Email/SMS/Google/Apple)  
✅ Sign-in (todos os métodos)  
✅ 2FA via SMS (Phase 1.0)  
✅ Password recovery  
✅ Onboarding 3-slide  
✅ Profile choice (personal vs business)  
✅ Account setup (4 passos pessoal, 5 passos empresarial)  

### **Discovery & Search**
✅ Home feed com 7 zonas temáticas  
✅ Advanced search (6 entry points, dual visualization)  
✅ Location-based filtering  
✅ Event discovery (Sympla/Eventbrite)  
✅ Business profiles  
✅ Favorites/bookmarking  

### **Social Network**
✅ User profiles  
✅ Business profiles  
✅ Stories (24h expiration)  
✅ Feed social (fotos, vídeos, check-ins)  
✅ Comments com threading infinito  
✅ Like/Dislike (mutuamente exclusivos)  
✅ Reposts com atribuição  
✅ Mentions (@usuario) · Notificações  

### **Messaging**
✅ Direct messages (pessoa-pessoa, pessoa-negócio)  
✅ Chat typing indicators  
✅ Message types: text, photo, audio, story reference  
✅ Message status (sent/delivered) — read status em 1.2+  

### **Notificações**
✅ Central de notificações unificada  
✅ 4 tipos: sociais, estabelecimentos, sistema, pedidos/agendamentos  
✅ Push via FCM + APNs  
✅ Máximo 5 push/dia por usuário  
✅ Notificações de segurança (não desativável)  

### **Settings & Privacy**
✅ Account management (foto, nome, username, bio, email, telefone)  
✅ City/location settings  
✅ Search radius (500m–20km)  
✅ Notification preferences  
✅ Privacy controls (conta pública, mensagens)  
✅ Security (senha, 2FA, histórico acessos)  
✅ Account deactivation/deletion  
✅ User blocking  

### **Catálogo Universal**
✅ T_CATALOGO com 7 templates:  
  - prato (restaurantes)  
  - produto (lojas)  
  - quarto (hotéis)  
  - plano (academias)  
  - procedimento (clínicas)  
  - serviço (barbearias)  
  - evento (shows)  

✅ T_ITEM universal (detalhes + avaliações)  

---

## 🔐 SEGURANÇA & COMPLIANCE

- **LGPD Compliance:** Consent explicit · Data retention policies · Right to erasure
- **Certificate Pinning:** TLS 1.3+ · API key protection
- **Encryption:** AES-256 para dados sensíveis · JWT signed
- **Rate Limiting:** 100 req/min por IP · 1000 req/dia por usuário
- **EXIF Removal:** server-side image processing
- **Input Validation:** Sanitização em todos os endpoints
- **SQL Injection Prevention:** Prisma ORM com parameterized queries
- **CORS:** Whitelist domínios específicos
- **CSRF Protection:** Token-based em forms
- **XSS Prevention:** React escaping automático + DOMPurify

---

## 📊 ARQUITETURA DE DADOS

### **Entidades Principais (18 tabelas)**
1. `users` — Cadastro de usuários
2. `establishments` — Perfis de negócios
3. `stories` — Moments/stories 24h
4. `posts` — Posts de usuários
5. `comments` — Comments com threading
6. `likes` — Like/dislike de posts e comments
7. `reposts` — Reposts com atribuição
8. `favorites` — Bookmarks de usuários
9. `follows` — Relacionamento de seguir
10. `blocks` — Bloqueios de usuários
11. `messages` — Direct messages
12. `message_attachments` — Fotos/áudios em mensagens
13. `notifications` — Central de notificações
14. `events` — Eventos (Sympla/Eventbrite)
15. `catalogs` — Cardápios universais
16. `catalog_items` — Itens do catálogo
17. `reviews` — Avaliações de itens
18. `locations` — Cache de cidades/geolocalização

### **Fluxo de Dados Principal**
```
User → Auth (JWT) → App State (Redux) → API (NestJS) → PostgreSQL
                         ↓
                    AsyncStorage (cache)
                         ↓
                    Redis (sessões)
                         ↓
                    S3 (mídia)
```

---

## 🚀 ROADMAP — FASES

### **Phase 1.0 (MVP) — Q1-Q2 2026**
- ✅ Social discovery com feed 7-zonas
- ✅ Search avançada com map view
- ✅ Autenticação completa
- ✅ Perfis de usuários e negócios
- ✅ Catálogo universal (7 templates)
- ✅ Notificações
- ✅ Messaging básico
- ✅ LGPD compliance

### **Phase 1.2 (Social Enhance) — Q3 2026**
- 📅 Like/repost/mention notifications
- 📅 Message read receipts
- 📅 Voice calls (VoIP)
- 📅 Bookings/agendamentos
- 📅 Pedidos/checkout
- 📅 Advanced 2FA (app authenticator)
- 📅 GraphQL endpoint

### **Phase 2.0 (Monetization) — Q4 2026+**
- 💳 Ads para estabelecimentos
- 💳 Premium features
- 💳 Creator monetization
- 💳 Analytics dashboard para negócios
- 💳 Affiliate marketplace

---

## ⚡ CONSTRAINTS & REQUISITOS NÃO-FUNCIONAIS

- **Performance:** <1.5s initial load · FCP <800ms · LCP <2.5s
- **Offline:** AsyncStorage cache para feed · 30-min TTL
- **Uptime:** 99.5% SLA
- **Latency:** P95 <200ms (API response)
- **Concurrency:** 10k simultaneous users (Phase 1.0)
- **Storage:** ~500MB app size (antes gzip)
- **Battery:** <5% battery drain/hora (background)
- **Network:** Funcionar em 3G (min 1 Mbps)
- **Acessibilidade:** WCAG 2.1 AA · Suporte a TalkBack/VoiceOver
- **Internacionalização:** PT-BR (1.0) + EN, ES (1.2+)

---

## 🔄 DECISÕES ARQUITETURAIS CRÍTICAS

1. **React Native vs Next.js:** React Native escolhido porque app é mobile-first · Web em roadmap (Expo Web)
2. **NestJS vs Express:** NestJS para scalability · Estrutura opinionada · Decorators + Dependency Injection
3. **PostgreSQL vs NoSQL:** PostgreSQL para relações complexas (users-posts-comments-likes) · ACID compliance
4. **Redux vs Zustand:** Redux escolhido para persist state + devtools debugging em fase de desenvolvimento
5. **Monolith vs Microservices:** Monolith (NestJS) Phase 1.0 · Microservices em 2.0 (search, messaging, notifications como serviços)
6. **Server-rendered vs Client-rendered:** Client-rendered (React Native) · Backend stateless (JWT)

---

**Este documento é a fonte da verdade de todas as decisões futuras.**  
**Próximo passo:** Step 1 — Diagnóstico Profundo
