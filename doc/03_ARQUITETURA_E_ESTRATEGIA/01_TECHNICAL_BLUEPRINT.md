# 🏗️ TECHNICAL BLUEPRINT — Arquitetura Completa

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Público:** Backend, Frontend, DevOps  
**Status:** Phase 1.0 Architecture

---

## 1️⃣ TECH STACK OFICIAL

### Frontend (Mobile)
```
React Native:        0.73.x LTS
TypeScript:         5.x
Navigation:         React Navigation 6.x
State Mgmt:         Redux Toolkit + Redux Thunk
Async Storage:      @react-native-async-storage
HTTP Client:        axios 1.x + axios-pinning
Real-time:          Socket.io-client 4.x
Image Handling:     react-native-image-crop-picker
Animations:         Lottie React Native
Maps:               react-native-maps + Google Places SDK
Media Player:       react-native-video
QR/Barcode:         react-native-camera
Push Notif:         AWS SNS Mobile Push (APNs/FCM credentials managed in SNS)
Analytics:          CloudWatch metrics + product analytics TBD
Testing:            Jest 29.x + Detox (e2e)
Build:              EAS Build (Expo) or native CLI
```

### Backend
```
Runtime:            Node.js 20.x LTS
Framework:          NestJS 10.x
Language:           TypeScript 5.x
ORM:                Prisma 5.x
Database:           PostgreSQL 15.x
Caching:            Redis 7.x
Message Queue:      Bull (Redis-backed)
Search:             PostgreSQL full-text (v1.0), Elasticsearch (v1.2+)
Authentication:     Passport.js + JWT
API Documentation:  Swagger/OpenAPI 3.1
Validation:         class-validator + zod
Logging:            Structured logs + CloudWatch
File Storage:       AWS S3 v3 SDK
CDN:                CloudFront (Phase 1.1+)
Testing:            Jest 29.x + Supertest
Email:              Amazon SES
SMS:                Amazon SNS
Maps API:           Google Places API (backend proxy)
Event Calendar:     Sympla/Eventbrite API
```

### Infrastructure
```
Deployment:         Docker containers
Orchestration:      Kubernetes (Phase 1.2+) / Docker Compose (1.0)
CI/CD:              GitHub Actions
Monitoring:         CloudWatch + X-Ray (Sentry optional)
Database Backup:    AWS RDS automated backup
Secrets Manager:    AWS Secrets Manager
Load Balancer:      Nginx + AWS ALB (Phase 1.2+)
Reverse Proxy:      Nginx
```

---

## 2️⃣ ARQUITETURA DO SISTEMA

### Diagrama de Componentes (ASCII)
```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (Mobile)                  │
│  React Native App (iOS 14+ | Android 8+)                   │
│  - Redux store                                              │
│  - React Navigation stack                                   │
│  - Async local cache (30-min TTL)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/TLS 1.3
                           │ Certificate Pinning (auth screens)
┌──────────────────────────▼──────────────────────────────────┐
│                    API GATEWAY LAYER                        │
│  Nginx reverse proxy                                         │
│  - SSL/TLS termination                                      │
│  - Rate limiting (token bucket)                             │
│  - Request logging                                          │
│  - Gzip compression                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  API APPLICATION LAYER                      │
│  NestJS Application (Node.js 20.x)                          │
│  ┌──────────────────────────────────────┐                  │
│  │ Controllers (HTTP endpoints)         │                  │
│  │ - AuthController (/auth)             │                  │
│  │ - PostController (/posts)            │                  │
│  │ - SearchController (/search)         │                  │
│  │ - MessageController (/messages)      │                  │
│  │ - etc (15+ controllers)              │                  │
│  └──────────────────────────────────────┘                  │
│  ┌──────────────────────────────────────┐                  │
│  │ Services (Business Logic)            │                  │
│  │ - AuthService, PostService,          │                  │
│  │ - SearchService, NotificationService │                  │
│  │ - (15+ services)                     │                  │
│  └──────────────────────────────────────┘                  │
│  ┌──────────────────────────────────────┐                  │
│  │ Middleware & Guards                  │                  │
│  │ - JwtAuthGuard, RolesGuard           │                  │
│  │ - ValidationPipe, ExceptionFilter    │                  │
│  │ - RequestLoggerMiddleware            │                  │
│  └──────────────────────────────────────┘                  │
└──────────┬──────────────┬────────────────┬──────────────────┘
           │              │                │
    ┌──────▼────┐  ┌─────▼──────┐  ┌─────▼──────┐
    │ Database  │  │ Cache      │  │ File Stor. │
    │ Layer     │  │ Layer      │  │ Layer      │
    └──────┬────┘  └─────┬──────┘  └─────┬──────┘
           │              │                │
    ┌──────▼────┐  ┌─────▼──────┐  ┌─────▼──────┐
    │ PostgreSQL│  │ Redis      │  │ AWS S3     │
    │ 15.x      │  │ 7.x        │  │ + CloudFront
    │ (15 tables)   │ (Cache TTL)│  │ (Phase 1.1+)
    └───────────┘  └────────────┘  └────────────┘

┌────────────────────────────────────────────────────────────┐
│                 BACKGROUND JOBS LAYER                      │
│  Bull Queue (Redis-backed job processor)                   │
│  - Email sending (verification, password reset)            │
│  - Image processing (resize, EXIF removal)                 │
│  - Search indexing                                         │
│  - Notification batch send                                 │
│  - Duplicate detection scoring                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                         │
│  - Google Places API (location, reverse geocoding)         │
│  - AWS SNS Mobile Push                                     │
│  - Amazon SNS                                              │
│  - Amazon SES                                              │
│  - AWS Secrets Manager                                     │
│  - CloudWatch / X-Ray                                      │
└────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ ESTRUTURA DO PROJETO

### Backend (Node.js + NestJS)
```
meu-agito-backend/
├── src/
│   ├── main.ts                         # Entry point
│   ├── app.module.ts                   # Root module
│   ├── config/
│   │   ├── database.config.ts          # Prisma config
│   │   ├── jwt.config.ts               # JWT strategy
│   │   ├── redis.config.ts             # Redis connection
│   │   ├── aws.config.ts               # S3 client config
│   │   ├── email.config.ts             # SES config
│   │   └── env.ts                      # Environment validation (zod)
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts          # POST /auth/login, /register, /refresh
│   │   ├── auth.service.ts             # AuthService
│   │   ├── jwt.strategy.ts             # Passport JWT strategy
│   │   ├── google.strategy.ts          # OAuth Google
│   │   ├── apple.strategy.ts           # OAuth Apple
│   │   ├── sms.strategy.ts             # SMS OTP
│   │   ├── auth.guard.ts               # JwtAuthGuard
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── refresh.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts         # GET/PUT /users/{id}
│   │   ├── users.service.ts            # UserService (CRUD + search)
│   │   ├── users.repository.ts         # Database queries
│   │   ├── entities/
│   │   │   ├── user.entity.ts          # User model + decorators
│   │   │   └── profile.entity.ts       # Profile metadata
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── posts/
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts         # CRUD posts
│   │   ├── posts.service.ts
│   │   ├── posts.repository.ts
│   │   ├── entities/
│   │   │   ├── post.entity.ts
│   │   │   ├── comment.entity.ts
│   │   │   └── like.entity.ts
│   │   └── dto/
│   │       ├── create-post.dto.ts
│   │       └── post-filter.dto.ts
│   ├── search/
│   │   ├── search.module.ts
│   │   ├── search.controller.ts        # GET /search
│   │   ├── search.service.ts           # QueryBuilder + PostgreSQL FTS
│   │   ├── elasticsearch.service.ts    # Phase 1.2+
│   │   └── dto/
│   │       └── search-query.dto.ts
│   ├── establishments/
│   │   ├── establishments.module.ts
│   │   ├── establishments.controller.ts
│   │   ├── establishments.service.ts
│   │   ├── duplicate-detection/
│   │   │   ├── duplicate-detection.service.ts  # 4-factor scoring
│   │   │   └── levenshtein.util.ts             # Distance algorithm
│   │   ├── entities/
│   │   │   └── establishment.entity.ts
│   │   └── dto/
│   │       └── create-establishment.dto.ts
│   ├── messages/
│   │   ├── messages.module.ts
│   │   ├── messages.controller.ts
│   │   ├── messages.service.ts
│   │   ├── messages.gateway.ts         # WebSocket @SubscribeMessage
│   │   ├── entities/
│   │   │   └── message.entity.ts
│   │   └── dto/
│   │       └── create-message.dto.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts    # AWS SNS Mobile Push
│   │   ├── notifications.controller.ts
│   │   ├── entities/
│   │   │   └── notification.entity.ts
│   │   └── templates/
│   │       ├── social.template.ts
│   │       ├── system.template.ts
│   │       └── etc
│   ├── stories/
│   │   ├── stories.module.ts
│   │   ├── stories.service.ts          # TTL: auto-delete 24h
│   │   └── stories.controller.ts
│   ├── files/
│   │   ├── files.module.ts
│   │   ├── files.service.ts            # S3 upload + EXIF removal
│   │   ├── files.controller.ts         # POST /files/upload
│   │   └── pipes/
│   │       └── file-validation.pipe.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── response.interceptor.ts
│   │   ├── middleware/
│   │   │   ├── request-logger.middleware.ts
│   │   │   └── error-handler.middleware.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── services/
│   │   │   ├── logger.service.ts       # Winston
│   │   │   ├── cache.service.ts        # Redis wrapper
│   │   │   ├── email.service.ts        # SES wrapper
│   │   │   ├── sms.service.ts          # Amazon SNS wrapper
│   │   │   └── s3.service.ts           # AWS S3 wrapper
│   │   └── utils/
│   │       ├── crypto.util.ts          # AES-256 encryption
│   │       ├── pagination.util.ts      # Cursor-based
│   │       ├── validation.util.ts
│   │       └── formatters.ts
│   ├── jobs/
│   │   ├── jobs.module.ts
│   │   ├── email.queue.ts              # Bull queues
│   │   ├── image-processing.queue.ts
│   │   ├── search-index.queue.ts
│   │   └── notification.queue.ts
│   └── app.controller.ts               # Health check
├── prisma/
│   ├── schema.prisma                   # 15+ models (detailed schema.md)
│   ├── migrations/
│   │   ├── 001_initial_schema
│   │   ├── 002_add_soft_delete
│   │   └── ... (numbered migrations)
│   └── seed.ts                         # Dev data seeding
├── .env.example                         # Environment variables template
├── .env.local                          # Local secrets (git-ignored)
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json                       # TypeScript strict mode
├── jest.config.js                      # Unit tests config
├── docker-compose.yml                  # Local dev environment
├── Dockerfile
├── package.json
└── README.md
```

### Frontend (React Native)
```
meu-agito-mobile/
├── src/
│   ├── App.tsx                         # Root component
│   ├── index.js                        # Entry point
│   ├── app/
│   │   ├── store.ts                    # Redux store
│   │   ├── rootReducer.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts            # Authentication state
│   │   │   ├── userSlice.ts            # User profile state
│   │   │   ├── feedSlice.ts            # Home feed state
│   │   │   ├── postsSlice.ts           # Social feed state
│   │   │   ├── searchSlice.ts          # Search results state
│   │   │   ├── messagesSlice.ts        # Chat state
│   │   │   ├── notificationsSlice.ts   # Notifications state
│   │   │   └── settingsSlice.ts        # User settings state
│   │   ├── hooks.ts                    # useAppDispatch, useAppSelector
│   │   └── middleware/
│   │       ├── persistStorage.ts       # AsyncStorage hydration
│   │       └── errorHandling.ts        # Redux error middleware
│   ├── navigation/
│   │   ├── RootNavigator.tsx           # Root stack (auth vs app)
│   │   ├── AuthStack.tsx               # T01-T05b (splash, login, config)
│   │   ├── BottomTabNavigator.tsx      # Main 6 tabs (Home, Feed, Search, Chat, Activity, Config)
│   │   ├── HomeNavigator.tsx           # T06 (Home) + linked screens
│   │   ├── FeedNavigator.tsx           # T_AGITO + modals
│   │   ├── SearchNavigator.tsx         # T07 search stack
│   │   ├── ChatNavigator.tsx           # T_CHAT stack
│   │   ├── ActivityNavigator.tsx       # T_ATIVIDADE stack
│   │   ├── ConfigNavigator.tsx         # T_CONFIG + 17 substacks
│   │   ├── linking.ts                  # Deep link configuration
│   │   └── types.ts                    # Navigation type definitions
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.tsx        # T01
│   │   │   ├── OnboardingScreen.tsx    # T02
│   │   │   ├── LoginScreen.tsx         # T03 main
│   │   │   ├── LoginEmailScreen.tsx    # T03 substep
│   │   │   ├── LoginSmsScreen.tsx      # T03 substep
│   │   │   ├── LoginGoogleScreen.tsx   # T03 substep (handled by Passport)
│   │   │   ├── LoginAppleScreen.tsx    # T03 substep (handled by Passport)
│   │   │   ├── ProfileChoiceScreen.tsx # T04
│   │   │   ├── PersonalSetupScreen.tsx # T05a
│   │   │   └── BusinessSetupScreen.tsx # T05b
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx          # T06 (7 zones)
│   │   │   ├── FeedScreen.tsx          # T_AGITO
│   │   │   ├── SearchScreen.tsx        # T07 (2 moments)
│   │   │   ├── ChatScreen.tsx          # T_CHAT (2 tabs)
│   │   │   ├── ActivityScreen.tsx      # T_ATIVIDADE (5 cards)
│   │   │   └── ConfigScreen.tsx        # T_CONFIG
│   │   ├── components/
│   │   │   ├── ProfileScreen.tsx       # T_PERFIL (person + business)
│   │   │   ├── ItemScreen.tsx          # T_ITEM (7 templates)
│   │   │   ├── CatalogScreen.tsx       # T_CATALOGO
│   │   │   ├── NotificationsScreen.tsx # T13
│   │   │   ├── StoryViewerScreen.tsx   # T_STORY
│   │   │   ├── CityModalScreen.tsx     # M01
│   │   │   ├── DrawerScreen.tsx        # PAINEL
│   │   │   └── SubConfigScreens.tsx    # 17 config child screens
│   │   └── other/
│   │       ├── PostDetailScreen.tsx
│   │       ├── EstablishmentDetailScreen.tsx
│   │       └── etc
│   ├── components/                      # Reusable components
│   │   ├── common/
│   │   │   ├── Header.tsx              # Top bar with back/title/actions
│   │   │   ├── BottomTabBar.tsx        # Custom bottom navigation
│   │   │   ├── SafeAreaContainer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── feed/
│   │   │   ├── PostCard.tsx            # Reusable post component
│   │   │   ├── CommentThread.tsx       # Nested comments
│   │   │   ├── PostActions.tsx         # Like/dislike/comment buttons
│   │   │   └── FeedList.tsx            # Infinite scroll
│   │   ├── search/
│   │   │   ├── CategoryChips.tsx       # Multi-select categories
│   │   │   ├── SearchFilters.tsx       # Advanced filters
│   │   │   ├── MapView.tsx             # Google Maps integration
│   │   │   └── ResultsList.tsx         # Paginated results
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx       # Avatar + name + stats
│   │   │   ├── FollowButton.tsx
│   │   │   ├── PostGrid.tsx            # 3-col grid
│   │   │   └── ProfileStats.tsx        # Followers/following
│   │   ├── item/
│   │   │   ├── ItemGallery.tsx         # Carrossel fotos
│   │   │   ├── ItemIdentity.tsx        # Nome + descrição
│   │   │   ├── ItemPrice.tsx           # Preço + variações
│   │   │   ├── ItemRatings.tsx         # Avaliações
│   │   │   ├── ItemCatalogBlock.tsx    # Template-specific blocks
│   │   │   └── ItemCTA.tsx             # Agendar/Comprar buttons
│   │   ├── message/
│   │   │   ├── ConversationList.tsx    # Mensagens
│   │   │   ├── MessageBubble.tsx       # Individual message
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── MessageInput.tsx        # Input bar com attachments
│   │   ├── notification/
│   │   │   ├── NotificationItem.tsx
│   │   │   └── NotificationBadge.tsx
│   │   ├── story/
│   │   │   ├── StoryProgressBar.tsx    # Multiple bars
│   │   │   ├── StoryContent.tsx        # Full-screen viewer
│   │   │   ├── StoryReplyButton.tsx
│   │   │   └── StoryViewCount.tsx
│   │   ├── establishment/
│   │   │   ├── EstablishmentCard.tsx   # Compact business card
│   │   │   ├── EstablishmentHeader.tsx # Logo + banner
│   │   │   ├── EstablishmentInfo.tsx   # Hours + contact
│   │   │   └── EstablishmentRatings.tsx
│   │   └── modals/
│   │       ├── CityModal.tsx           # M01
│   │       ├── ShareModal.tsx
│   │       ├── ReportModal.tsx
│   │       ├── PermissionsModal.tsx
│   │       └── ConfirmModal.tsx
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.ts                  # Authentication logic
│   │   ├── useUser.ts                  # User profile logic
│   │   ├── useFeed.ts                  # Feed fetching + pagination
│   │   ├── useSearch.ts                # Search with debounce
│   │   ├── useMessages.ts              # WebSocket + messages
│   │   ├── useNotifications.ts         # Push notification handling
│   │   ├── useGeoLocation.ts           # GPS + reverse geocoding
│   │   ├── useInfiniteScroll.ts        # Pagination helper
│   │   ├── useDebounce.ts              # Debounce utility
│   │   ├── useThrottle.ts              # Throttle utility
│   │   └── useCache.ts                 # AsyncStorage wrapper
│   ├── api/
│   │   ├── apiClient.ts                # Axios instance (with pinning)
│   │   ├── endpoints/
│   │   │   ├── auth.ts                 # /auth endpoints
│   │   │   ├── users.ts                # /users endpoints
│   │   │   ├── posts.ts                # /posts endpoints
│   │   │   ├── search.ts               # /search endpoints
│   │   │   ├── messages.ts             # /messages endpoints
│   │   │   ├── notifications.ts        # /notifications endpoints
│   │   │   ├── files.ts                # /files endpoints
│   │   │   ├── establishments.ts       # /establishments endpoints
│   │   │   └── etc
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts     # Token refresh on 401
│   │       ├── error.interceptor.ts    # Error handling + retry
│   │       └── logging.interceptor.ts  # Request/response logging
│   ├── utils/
│   │   ├── constants.ts                # Colors, sizes, URLs
│   │   ├── formatters.ts               # Date, currency, distance
│   │   ├── validators.ts               # Email, phone, etc
│   │   ├── storage.ts                  # SecureStore wrapper
│   │   ├── analytics.ts                # Product analytics wrapper
│   │   ├── logger.ts                   # Console logging
│   │   ├── debounce.ts
│   │   └── throttle.ts
│   ├── theme/
│   │   ├── colors.ts                   # #0D0D0D, #E8640A, etc
│   │   ├── typography.ts               # Fonts, sizes
│   │   ├── spacing.ts                  # Margin/padding scale
│   │   ├── borderRadius.ts             # Border radius scale
│   │   ├── shadows.ts                  # Elevation scale
│   │   └── theme.ts                    # Consolidated theme
│   └── types/
│       ├── auth.types.ts
│       ├── user.types.ts
│       ├── post.types.ts
│       ├── message.types.ts
│       ├── notification.types.ts
│       └── api.types.ts
├── assets/
│   ├── images/
│   │   ├── splash-logo.png
│   │   ├── onboarding-1.png
│   │   └── ... (all images 2x + 3x)
│   ├── animations/
│   │   ├── onboarding-1.json            # Lottie files
│   │   ├── loading.json
│   │   └── etc
│   └── fonts/
│       └── (if custom fonts)
├── .env.example
├── .env.local                           # Local config
├── eas.json                             # Expo build config
├── app.json                             # Expo/RN config
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── package.json
└── README.md
```

---

## 4️⃣ BANK DATABASE SCHEMA

### Modelo de Dados (Prisma)
```prisma
// 15 modelos principais + relacionamentos

model User {
  id                String          @id @default(cuid())
  email             String          @unique
  phone             String?         @unique
  username          String          @unique
  passwordHash      String?
  firstName         String
  lastName          String
  bio               String?         @db.VarChar(200)
  avatarUrl         String?
  bannerUrl         String?
  type              UserType        // "personal" ou "business"
  
  // Location
  city              String
  neighborhood      String?
  
  // Account metadata
  emailVerified     DateTime?
  phoneVerified     DateTime?
  lastLogin         DateTime?
  isActive          Boolean         @default(true)
  isDeleted         Boolean         @default(false)
  deletedAt         DateTime?
  
  // OAuth
  googleId          String?         @unique
  appleId           String?         @unique
  
  // Preferences
  preferences       Json            // { theme, notificationSettings, privacy }
  
  // Relationships
  posts             Post[]
  comments          Comment[]
  likes             Like[]
  dislikes          Dislike[]
  stories           Story[]
  followers         Follows[]       @relation("following")
  following         Follows[]       @relation("follower")
  sentMessages      Message[]       @relation("sender")
  receivedMessages  Message[]       @relation("recipient")
  savedItems        Favorite[]
  notifications     Notification[]
  blockedUsers      Block[]         @relation("blocker")
  blockedBy         Block[]         @relation("blocked")
  
  // For business users
  establishment     Establishment?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([email])
  @@index([username])
  @@index([city])
  @@index([isDeleted])
}

model Establishment {
  id                String          @id @default(cuid())
  userId            String          @unique
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name              String
  cnpj              String          @unique // AES-256 encrypted
  description       String?         @db.Text
  category          String          // "restaurante", "loja", etc
  
  // Location
  address           String
  addressNumber     String
  neighborhood      String
  city              String
  state             String
  zipCode           String
  coordinates       Geometry        // PostGIS point
  latitude          Float
  longitude         Float
  
  // Contact
  phone             String
  email             String
  website           String?
  
  // Media
  logoUrl           String?
  bannerUrl         String?
  
  // Operating hours
  operatingHours    Json            // { mon: { open, close }, tue: ... }
  
  // Verification
  verificationScore Float           @default(0)  // Duplicate detection score
  isVerified        Boolean         @default(false)
  verifiedAt        DateTime?
  
  // Metadata
  followerCount     Int             @default(0)
  ratingCount       Int             @default(0)
  averageRating     Float           @default(0)
  
  isActive          Boolean         @default(true)
  isDeleted         Boolean         @default(false)
  deletedAt         DateTime?
  
  // Relationships
  items             Item[]
  ratings           Rating[]
  catalogs          Catalog[]
  posts             Post[]
  favorites         Favorite[]
  notifications     Notification[]
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([city])
  @@index([category])
  @@index([coordinates])
  @@index([isDeleted])
  @@index([isVerified])
}

model Post {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  establishmentId   String?         // Se post é de estabelecimento
  establishment     Establishment?  @relation(fields: [establishmentId], references: [id])
  
  content           String          @db.Text
  media             String[]        // URLs
  visibility        Visibility      // "public" ou "followers_only"
  
  // Engagement
  likeCount         Int             @default(0)
  dislikeCount      Int             @default(0)  // Private (not shown)
  commentCount      Int             @default(0)
  repostCount       Int             @default(0)
  
  // Soft delete
  isDeleted         Boolean         @default(false)
  deletedAt         DateTime?
  
  // Relationships
  likes             Like[]
  dislikes          Dislike[]
  comments          Comment[]
  reposts           Repost[]
  notifications     Notification[]
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([userId])
  @@index([establishmentId])
  @@index([createdAt])
  @@index([isDeleted])
}

model Comment {
  id                String          @id @default(cuid())
  postId            String
  post              Post            @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  parentCommentId   String?         // For nested comments
  parentComment     Comment?        @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: Cascade)
  replies           Comment[]       @relation("CommentReplies")
  
  content           String          @db.Text
  
  // Engagement
  likeCount         Int             @default(0)
  dislikeCount      Int             @default(0)
  replyCount        Int             @default(0)
  
  // Relationships
  likes             Like[]          @relation("CommentLikes")
  dislikes          Dislike[]       @relation("CommentDislikes")
  
  // Soft delete
  isDeleted         Boolean         @default(false)
  deletedAt         DateTime?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([postId])
  @@index([userId])
  @@index([isDeleted])
}

model Like {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId            String?
  post              Post?           @relation(fields: [postId], references: [id], onDelete: Cascade)
  commentId         String?
  comment           Comment?        @relation("CommentLikes", fields: [commentId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime        @default(now())
  
  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@index([userId])
  @@index([postId])
  @@index([commentId])
}

model Dislike {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId            String?
  post              Post?           @relation(fields: [postId], references: [id], onDelete: Cascade)
  commentId         String?
  comment           Comment?        @relation("CommentDislikes", fields: [commentId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime        @default(now())
  
  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@index([userId])
  @@index([postId])
  @@index([commentId])
}

model Repost {
  id                String          @id @default(cuid())
  postId            String
  post              Post            @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime        @default(now())
  
  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}

model Story {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  mediaUrl          String
  mediaType         String          // "image" ou "video"
  textOverlay       String?         @db.VarChar(100)
  visibility        Visibility      // "public" ou "followers_only"
  
  viewCount         Int             @default(0)
  viewers           String[]        // Array de userIds (denormalized for perf)
  
  // TTL: 24 hours from createdAt
  createdAt         DateTime        @default(now())
  expiresAt         DateTime        @db.Timestamp
  
  @@index([userId])
  @@index([expiresAt])
}

model Message {
  id                String          @id @default(cuid())
  senderId          String
  sender            User            @relation("sender", fields: [senderId], references: [id], onDelete: Cascade)
  recipientId       String
  recipient         User            @relation("recipient", fields: [recipientId], references: [id], onDelete: Cascade)
  
  content           String          @db.Text
  messageType       MessageType     // "text", "photo", "audio", "story_ref"
  mediaUrl          String?
  
  isRead            Boolean         @default(false)
  readAt            DateTime?
  
  isDeleted         Boolean         @default(false)
  deletedAt         DateTime?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([senderId, recipientId])
  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
  @@index([isDeleted])
}

model Notification {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type              NotificationType
  title             String
  body              String
  deepLink          String?         // app://post/123
  
  relatedUserId     String?         // Who triggered this
  relatedPostId     String?         // Related post
  relatedEstablishmentId String?    // Related establishment
  
  isRead            Boolean         @default(false)
  readAt            DateTime?
  
  createdAt         DateTime        @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([isRead])
}

model Item {
  id                String          @id @default(cuid())
  establishmentId   String
  establishment     Establishment   @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  
  name              String
  description       String?         @db.Text
  template          ItemTemplate    // "evento", "servico", "prato", etc
  
  // Pricing
  price             Float
  priceCurrency     String          @default("BRL")
  variations        Json?           // { size: [...], color: [...] }
  
  // Media
  images            String[]        // URLs
  
  // Metadata
  ratingCount       Int             @default(0)
  averageRating     Float           @default(0)
  
  isActive          Boolean         @default(true)
  isDeleted         Boolean         @default(false)
  deletedAt         DateTime?
  
  // Template-specific fields (stored as JSON)
  templateData      Json            // { duration, capacity, ingredients, etc }
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([establishmentId])
  @@index([template])
  @@index([isDeleted])
}

model Catalog {
  id                String          @id @default(cuid())
  establishmentId   String
  establishment     Establishment   @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  
  name              String
  description       String?
  template          ItemTemplate    // "prato", "produto", "quarto", etc
  
  isActive          Boolean         @default(true)
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([establishmentId])
}

model Rating {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  establishmentId   String
  establishment     Establishment   @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  
  rating            Int             // 1-5
  comment           String?         @db.Text
  
  isHelpful         Boolean?        // User feedback (not part of average)
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@unique([userId, establishmentId])
  @@index([establishmentId])
}

model Favorite {
  id                String          @id @default(cuid())
  userId            String
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  establishmentId   String
  establishment     Establishment   @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime        @default(now())
  
  @@unique([userId, establishmentId])
  @@index([userId])
}

model Follows {
  id                String          @id @default(cuid())
  followerId        String
  follower          User            @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  followingId       String
  following         User            @relation("following", fields: [followingId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime        @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

model Block {
  id                String          @id @default(cuid())
  blockerId         String
  blocker           User            @relation("blocker", fields: [blockerId], references: [id], onDelete: Cascade)
  blockedId         String
  blocked           User            @relation("blocked", fields: [blockedId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime        @default(now())
  
  @@unique([blockerId, blockedId])
  @@index([blockerId])
}

// Enums
enum UserType {
  personal
  business
}

enum Visibility {
  public
  followers_only
}

enum MessageType {
  text
  photo
  audio
  story_ref
}

enum NotificationType {
  social_like
  social_comment
  social_repost
  social_follow
  business_new_photo
  business_new_item
  business_reply
  order_status
  booking_reminder
  system_alert
}

enum ItemTemplate {
  evento
  servico
  prato
  produto
  quarto
  plano
  procedimento
}
```

---

## 5️⃣ API RESPONSE FORMAT & ERROR CODES

### Sucesso (200)
```json
{
  "data": {
    "id": "user_123",
    "username": "joao",
    "email": "joao@example.com"
  },
  "meta": {
    "timestamp": "2026-03-26T10:30:00Z",
    "version": "1.0"
  }
}
```

### Lista Paginada (200)
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyJ9",
    "hasMore": true,
    "count": 20
  },
  "meta": {
    "timestamp": "2026-03-26T10:30:00Z",
    "version": "1.0"
  }
}
```

### Erro (4xx/5xx)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid RFC 5321 email",
        "value": "invalid-email"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-26T10:30:00Z",
    "requestId": "req_abc123def456",
    "version": "1.0"
  }
}
```

### Error Codes
| Code | HTTP | Significado | Retry |
|------|------|-------------|-------|
| `VALIDATION_ERROR` | 400 | Entrada inválida | Não |
| `AUTHENTICATION_FAILED` | 401 | Token inválido/expirado | Sim (refresh token) |
| `TOKEN_EXPIRED` | 401 | Access token expirado | Sim (use refresh) |
| `INSUFFICIENT_PERMISSIONS` | 403 | Sem permissão | Não |
| `RESOURCE_NOT_FOUND` | 404 | Recurso não existe | Não |
| `RATE_LIMIT_EXCEEDED` | 429 | Muito rápido | Sim (expo backoff) |
| `CONFLICT` | 409 | Email/username já existe | Não |
| `INTERNAL_SERVER_ERROR` | 500 | Erro servidor | Sim (exponential backoff) |

---

## 6️⃣ CACHE STRATEGY

### Redis Tiers
```
Tier 1 (Hot): 1 min TTL
  - User auth tokens
  - Typing indicators
  - Rate limit counters

Tier 2 (Warm): 30 min TTL
  - Home feed zones (Z1-Z7)
  - User profiles
  - Search results
  - Establishment details

Tier 3 (Cold): 24h TTL
  - Category list
  - City lists
  - Static configurations

Tier 4 (Persistent): No TTL
  - Session data
  - User preferences
```

### Cache Invalidation
```
Event-driven:
- User creates post → invalidate [home:feed, user:posts]
- User likes post → invalidate [post:engagement, home:feed]
- User follows someone → invalidate [user:followers, user:feed]

Time-based:
- Every 30 min: refresh home feed
- Every 1h: refresh trending
```

---

## 7️⃣ CICD/DEPLOYMENT

### GitHub Actions Workflow
```yaml
On push to main:
  1. Run linter (ESLint)
  2. Run unit tests (Jest)
  3. Build Docker image
  4. Push to registry
  5. Deploy to staging
  6. Run e2e tests (Cypress)
  7. Deploy to production (if e2e pass)

On push to develop:
  1-4. Same as above, deploy to dev env
```

### Docker Compose (Local Dev)
```yaml
services:
  backend:
    image: meu-agito-backend:local
    ports: ["3000:3000"]
    env_file: .env.local
  postgres:
    image: postgres:15
    volumes: ["postgres_data:/var/lib/postgresql/data"]
  redis:
    image: redis:7
    ports: ["6379:6379"]
  nginx:
    image: nginx:1.25
    ports: ["80:80", "443:443"]
```

---

## 8️⃣ ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/meuagito?schema=public"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="meu-agito-uploads"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="https://api.meuagito.com/auth/google/callback"

# Apple OAuth
APPLE_TEAM_ID="..."
APPLE_KEY_ID="..."
APPLE_PRIVATE_KEY="..."

# Email
SENDGRID_API_KEY="..."
SENDGRID_FROM_EMAIL="noreply@meuagito.com"

# SMS
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+5511999999999"

# External APIs
GOOGLE_PLACES_API_KEY="... (backend-proxied)"
SYMPLA_API_KEY="..."

# Sentry
SENTRY_DSN="..."
SENTRY_ENVIRONMENT="production"

# Push
AWS_SNS_REGION="..."
AWS_SNS_PLATFORM_APPLICATION_ARN="..."
AWS_SNS_DEFAULT_TOPIC_ARN="..."

# Analytics
MIX

PANEL_TOKEN="..."

# App
NODE_ENV="production"
PORT=3000
LOG_LEVEL="info"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

---

**Próximo passo:** Step 5 — Complete File Trees (Frontend + Backend)
