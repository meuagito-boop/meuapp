# 📁 COMPLETE FILE TREES — Frontend + Backend

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Propósito:** Guia exato de estrutura de arquivos para implementação

---

## 🔙 BACKEND FILE TREE (Node.js + NestJS)

```
meu-agito-backend/
│
├── src/
│   ├── main.ts
│   │   └── Bootstrap principal, config Sentry, listen port 3000
│   │
│   ├── app.module.ts
│   │   └── Root module, imports todos os feature modules
│   │
│   ├── config/
│   │   ├── database.config.ts         # Prisma client initialization
│   │   ├── jwt.config.ts              # JWT strategy options
│   │   ├── redis.config.ts            # Redis client + connection options
│   │   ├── aws.config.ts              # S3 client initialization
│   │   ├── email.config.ts            # SendGrid client initialization
│   │   ├── sms.config.ts              # Twilio client initialization
│   │   ├── cache.config.ts            # Cache strategy (TTLs)
│   │   ├── env.ts                     # zod schema para validação de .env
│   │   ├── constants.ts               # Constantes globais (CACHE_TTLs, limits)
│   │   └── index.ts                   # Re-exports
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts         # POST /auth/login, /register, /refresh, /logout
│   │   ├── auth.service.ts            # AuthService (core auth logic)
│   │   ├── jwt.strategy.ts            # Passport JWT strategy
│   │   ├── jwt-refresh.strategy.ts    # Refresh token strategy
│   │   ├── google.strategy.ts         # OAuth Google
│   │   ├── apple.strategy.ts          # OAuth Apple
│   │   ├── sms-otp.strategy.ts        # SMS OTP verification
│   │   ├── auth.guard.ts              # JwtAuthGuard
│   │   ├── auth.repository.ts         # Database queries
│   │   ├── dto/
│   │   │   ├── login-email.dto.ts     # { email, password }
│   │   │   ├── login-sms.dto.ts       # { phone, otp }
│   │   │   ├── login-google.dto.ts    # { idToken }
│   │   │   ├── register.dto.ts        # { email, password, username, firstName, lastName }
│   │   │   ├── refresh-token.dto.ts   # { refreshToken }
│   │   │   └── logout.dto.ts          # { }
│   │   ├── entities/
│   │   │   └── auth-response.ts       # { accessToken, refreshToken, user: UserDto }
│   │   └── tests/
│   │       ├── auth.controller.spec.ts
│   │       └── auth.service.spec.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts        # GET /users/:id, PUT /users/:id, DELETE /users/:id
│   │   ├── users.service.ts           # UserService (CRUD + profile logic)
│   │   ├── users.repository.ts        # Database queries
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts     # { email, username, firstName, lastName }
│   │   │   ├── update-user.dto.ts     # { firstName, lastName, bio, avatarUrl, city, neighborhood }
│   │   │   ├── user-profile.dto.ts    # Response DTO
│   │   │   └── change-password.dto.ts # { currentPassword, newPassword }
│   │   ├── entities/
│   │   │   ├── user.entity.ts         # User model com decoradores
│   │   │   └── user-profile.entity.ts
│   │   └── tests/
│   │       └── users.service.spec.ts
│   │
│   ├── posts/
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts        # CRUD /posts, /posts/:id/like, /posts/:id/comment
│   │   ├── posts.service.ts           # PostService (create, update, delete, engage)
│   │   ├── posts.repository.ts        # Database queries + pagination
│   │   ├── comments.service.ts        # CommentService (nested comment logic)
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts     # { content, media[], visibility }
│   │   │   ├── update-post.dto.ts     # { content }
│   │   │   ├── like-post.dto.ts       # { postId }
│   │   │   ├── dislike-post.dto.ts    # { postId }
│   │   │   ├── create-comment.dto.ts  # { content, parentCommentId? }
│   │   │   ├── post-filter.dto.ts     # { userId?, limit, cursor }
│   │   │   └── post-response.dto.ts
│   │   ├── entities/
│   │   │   ├── post.entity.ts
│   │   │   ├── comment.entity.ts
│   │   │   ├── like.entity.ts
│   │   │   └── dislike.entity.ts
│   │   └── tests/
│   │       └── posts.service.spec.ts
│   │
│   ├── search/
│   │   ├── search.module.ts
│   │   ├── search.controller.ts       # GET /search (com body categories, filters)
│   │   ├── search.service.ts          # SearchService (query builder + FTS)
│   │   ├── search.repository.ts       # Raw queries (PostgreSQL full-text)
│   │   ├── elasticsearch.service.ts   # Stub para Phase 1.2+
│   │   ├── dto/
│   │   │   ├── search-query.dto.ts    # { q, categories[], distance, rating, type, openNow }
│   │   │   ├── search-result.dto.ts
│   │   │   └── search-filter.dto.ts
│   │   └── tests/
│   │       └── search.service.spec.ts
│   │
│   ├── establishments/
│   │   ├── establishments.module.ts
│   │   ├── establishments.controller.ts # CRUD /establishments
│   │   ├── establishments.service.ts    # EstablishmentService
│   │   ├── establishments.repository.ts
│   │   ├── duplicate-detection/
│   │   │   ├── duplicate-detection.service.ts # 4-factor scoring algorithm
│   │   │   ├── levenshtein.util.ts            # String distance calculation
│   │   │   └── duplicate-detection.dto.ts
│   │   ├── dto/
│   │   │   ├── create-establishment.dto.ts  # { name, cnpj, address, phone, email, etc }
│   │   │   ├── update-establishment.dto.ts
│   │   │   └── establishment-response.dto.ts
│   │   ├── entities/
│   │   │   └── establishment.entity.ts
│   │   └── tests/
│   │       └── establishments.service.spec.ts
│   │
│   ├── messages/
│   │   ├── messages.module.ts
│   │   ├── messages.controller.ts     # CRUD /messages
│   │   ├── messages.service.ts        # MessageService (store + notification)
│   │   ├── messages.gateway.ts        # WebSocket gateway (@SubscribeMessage)
│   │   ├── messages.repository.ts
│   │   ├── dto/
│   │   │   ├── create-message.dto.ts  # { recipientId, content, messageType, mediaUrl? }
│   │   │   ├── send-typing.dto.ts
│   │   │   └── conversation.dto.ts
│   │   ├── entities/
│   │   │   └── message.entity.ts
│   │   └── tests/
│   │       └── messages.gateway.spec.ts
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts    # GET /notifications (list)
│   │   ├── notifications.service.ts       # NotificationService (create + send)
│   │   ├── notifications.repository.ts
│   │   ├── fcm.service.ts                 # Firebase Cloud Messaging
│   │   ├── apns.service.ts                # Apple Push Notification service
│   │   ├── dto/
│   │   │   ├── create-notification.dto.ts
│   │   │   ├── notification-response.dto.ts
│   │   │   └── push-config.dto.ts
│   │   ├── templates/
│   │   │   ├── social-notification.template.ts     # Like, comment, follow
│   │   │   ├── business-notification.template.ts   # New item, new photo
│   │   │   ├── order-notification.template.ts      # Order status
│   │   │   └── system-notification.template.ts     # Security alerts
│   │   ├── entities/
│   │   │   └── notification.entity.ts
│   │   └── tests/
│   │       └── notifications.service.spec.ts
│   │
│   ├── stories/
│   │   ├── stories.module.ts
│   │   ├── stories.controller.ts      # POST (create), GET (list), DELETE (own only)
│   │   ├── stories.service.ts         # StoriesService (TTL: 24h auto-delete)
│   │   ├── stories.repository.ts
│   │   ├── dto/
│   │   │   ├── create-story.dto.ts    # { mediaUrl, mediaType, textOverlay?, visibility }
│   │   │   └── story-response.dto.ts
│   │   ├── entities/
│   │   │   └── story.entity.ts
│   │   └── tests/
│   │       └── stories.service.spec.ts
│   │
│   ├── files/
│   │   ├── files.module.ts
│   │   ├── files.controller.ts        # POST /files/upload, /files/upload-avatar
│   │   ├── files.service.ts           # FileService (validation + S3 upload)
│   │   ├── s3.service.ts              # Wrapper AWS S3 SDK
│   │   ├── image-processing.service.ts # Sharp (resize, EXIF removal)
│   │   ├── pipes/
│   │   │   ├── file-validation.pipe.ts # Size, format, MIME type validation
│   │   │   └── image-validation.pipe.ts
│   │   ├── dto/
│   │   │   └── upload-response.dto.ts
│   │   └── tests/
│   │       └── files.service.spec.ts
│   │
│   ├── items/
│   │   ├── items.module.ts
│   │   ├── items.controller.ts        # CRUD /items
│   │   ├── items.service.ts           # ItemService (7 templates)
│   │   ├── items.repository.ts
│   │   ├── dto/
│   │   │   ├── create-item.dto.ts     # { name, template, price, images[], templateData }
│   │   │   ├── update-item.dto.ts
│   │   │   └── item-response.dto.ts
│   │   ├── entities/
│   │   │   └── item.entity.ts
│   │   └── tests/
│   │       └── items.service.spec.ts
│   │
│   ├── catalogs/
│   │   ├── catalogs.module.ts
│   │   ├── catalogs.controller.ts     # CRUD /catalogs
│   │   ├── catalogs.service.ts
│   │   ├── catalogs.repository.ts
│   │   └── dto/
│   │       └── catalog-response.dto.ts
│   │
│   ├── ratings/
│   │   ├── ratings.module.ts
│   │   ├── ratings.controller.ts      # POST /ratings, GET /ratings
│   │   ├── ratings.service.ts         # RatingService (CRUD + average calculation)
│   │   ├── ratings.repository.ts
│   │   ├── dto/
│   │   │   ├── create-rating.dto.ts   # { establishmentId, rating, comment }
│   │   │   └── rating-response.dto.ts
│   │   └── tests/
│   │       └── ratings.service.spec.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser() injects req.user
│   │   │   ├── public.decorator.ts          # @Public() bypass auth
│   │   │   ├── roles.decorator.ts           # @Roles("admin", "moderator")
│   │   │   └── cache.decorator.ts           # @Cacheable()
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts     # Global exception handling
│   │   │   ├── prisma-exception.filter.ts   # Prisma error mapping
│   │   │   └── validation-error.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── ownership.guard.ts           # Check user owns resource
│   │   │   └── rate-limit.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts       # Log all requests
│   │   │   ├── response.interceptor.ts      # Standardize response format
│   │   │   ├── timeout.interceptor.ts       # Request timeout (5s default)
│   │   │   └── transform.interceptor.ts     # DTO serialization
│   │   ├── middleware/
│   │   │   ├── request-logger.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   └── security.middleware.ts       # Helmet, CSP headers
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts           # class-validator
│   │   │   └── parse-uuid.pipe.ts
│   │   ├── services/
│   │   │   ├── logger.service.ts            # Winston logger wrapper
│   │   │   ├── cache.service.ts             # Redis wrapper (get/set/del)
│   │   │   ├── email.service.ts             # SendGrid wrapper
│   │   │   ├── sms.service.ts               # Twilio wrapper
│   │   │   ├── s3.service.ts                # AWS S3 wrapper
│   │   │   ├── stripe.service.ts            # Payment (Phase 1.2+)
│   │   │   └── geolocation.service.ts       # Google Places API
│   │   └── utils/
│   │       ├── crypto.util.ts               # AES-256 encryption/decryption
│   │       ├── pagination.util.ts           # Cursor-based pagination helper
│   │       ├── validation.util.ts
│   │       ├── formatters.ts                # Date, currency formatting
│   │       ├── strings.util.ts              # Slug, trim, etc
│   │       └── errors.util.ts               # Custom error classes
│   │
│   ├── jobs/
│   │   ├── jobs.module.ts
│   │   ├── jobs.service.ts            # Bull queue initialization
│   │   ├── processors/
│   │   │   ├── email.processor.ts      # Send verification emails, password reset
│   │   │   ├── image-processing.processor.ts  # Resize, EXIF removal
│   │   │   ├── search-index.processor.ts      # Index posts to ES (v1.2+)
│   │   │   ├── notification.processor.ts      # Batch send push notifications
│   │   │   └── duplicate-detection.processor.ts # Async duplicate scoring
│   │   └── queue-names.ts             # Enum of queue names
│   │
│   ├── app.controller.ts              # GET /health (health check)
│   ├── app.service.ts
│   └── main.ts                        # Application entry point
│
├── prisma/
│   ├── schema.prisma                  # 15+ models, relationships, indexes
│   ├── migrations/
│   │   ├── 001_initial_schema/
│   │   │   └── migration.sql
│   │   ├── 002_add_soft_delete/
│   │   │   └── migration.sql
│   │   ├── 003_add_indexes/
│   │   │   └── migration.sql
│   │   └── ... (numbered)
│   └── seed.ts                        # Development data seeding
│
├── tests/
│   ├── e2e/
│   │   ├── auth.e2e.spec.ts           # Full auth flow testing
│   │   ├── posts.e2e.spec.ts
│   │   ├── search.e2e.spec.ts
│   │   └── messages.e2e.spec.ts
│   └── fixtures/
│       ├── user.fixture.ts            # Mock data
│       ├── post.fixture.ts
│       └── establishment.fixture.ts
│
├── .env.example                       # Environment template (all vars documented)
├── .env.local                         # Local secrets (git-ignored)
├── .env.prod                          # Production secrets
├── .eslintrc.json                     # ESLint config (Prettier integration)
├── .prettierrc                        # Code formatter config
├── tsconfig.json                      # TypeScript strict mode enabled
├── jest.config.js                     # Unit test configuration
├── docker-compose.yml                 # Local dev (PostgreSQL, Redis, Nginx)
├── Dockerfile                         # Multi-stage build
├── .dockerignore
├── .gitignore
├── package.json                       # Dependencies + scripts
├── yarn.lock                          # (or package-lock.json)
├── README.md                          # Development guide
├── DEPLOYMENT.md                      # CI/CD + deployment steps
└── API_DOCS.md                        # API endpoint documentation
```

---

## 🎯 FRONTEND FILE TREE (React Native)

```
meu-agito-mobile/
│
├── src/
│   ├── App.tsx
│   │   └── Root component: Redux provider, RootNavigator, Sentry init
│   │
│   ├── index.js
│   │   └── Application entry point (Expo or native entry)
│   │
│   ├── app/
│   │   ├── store.ts                   # Redux store configuration
│   │   ├── rootReducer.ts             # Combined reducers
│   │   ├── slices/
│   │   │   ├── authSlice.ts           # { user, token, loading, error }
│   │   │   ├── userSlice.ts           # { profile, avatar, settings }
│   │   │   ├── feedSlice.ts           # { zones, cursor, loading }
│   │   │   ├── postsSlice.ts          # { posts[], cursor, totalLikes }
│   │   │   ├── searchSlice.ts         # { results[], filters, cursor }
│   │   │   ├── messagesSlice.ts       # { conversations[], messages[] }
│   │   │   ├── notificationsSlice.ts  # { notifications[], unreadCount }
│   │   │   └── settingsSlice.ts       # { theme, notifSettings, privacy }
│   │   ├── thunks/
│   │   │   ├── authThunks.ts          # async login, register, refresh
│   │   │   ├── feedThunks.ts          # async fetch feed zones
│   │   │   ├── searchThunks.ts        # async search with debounce
│   │   │   ├── messagesThunks.ts      # async fetch messages
│   │   │   └── postsThunks.ts         # async fetch posts, like/comment
│   │   ├── hooks.ts                   # useAppDispatch, useAppSelector, custom
│   │   ├── middleware/
│   │   │   ├── persistStorage.ts      # AsyncStorage hydration
│   │   │   └── errorHandling.ts       # Redux error middleware
│   │   └── index.ts                   # Re-exports
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx          # Root stack: auth ? AuthStack : AppStack
│   │   ├── AuthStack.tsx
│   │   │   └── T01 (Splash) → T02 (Onboarding) → T03 (Login) → T04 (Profile choice) → T05a/b (Config)
│   │   ├── AppStack.tsx
│   │   │   └── BottomTabNavigator + modals (CityModal, ShareModal, etc)
│   │   ├── BottomTabNavigator.tsx     # 6 main tabs: Home, Feed, Search, Chat, Activity, Config
│   │   ├── HomeNavigator.tsx          # T06 stack
│   │   ├── FeedNavigator.tsx          # T_AGITO stack + post detail modal
│   │   ├── SearchNavigator.tsx        # T07 (2 moments) stack
│   │   ├── ChatNavigator.tsx          # T_CHAT stack + conversation detail
│   │   ├── ActivityNavigator.tsx      # T_ATIVIDADE stack
│   │   ├── ConfigNavigator.tsx        # T_CONFIG + 17 child screens
│   │   ├── linking.ts                 # Deep linking: app://post/123, app://profile/:id
│   │   ├── types.ts                   # RootStackParamList, TabParamList, etc
│   │   └── utils.ts                   # Navigation helper functions
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.tsx       # T01
│   │   │   │   └── Token validation, GPS request, branching logic
│   │   │   ├── OnboardingScreen.tsx   # T02
│   │   │   │   └── 3-slide carousel (Lottie + text)
│   │   │   ├── LoginScreen.tsx        # T03 (entry point)
│   │   │   │   └── 4 buttons: Google, Apple, SMS, Email
│   │   │   ├── LoginEmailScreen.tsx   # T03 substep
│   │   │   │   └── Email input + password input + forgot password link
│   │   │   ├── LoginSmsScreen.tsx     # T03 substep
│   │   │   │   └── Phone input → OTP screen
│   │   │   ├── LoginGoogleScreen.tsx  # T03 substep (handled mostly by Passport/OIDC)
│   │   │   ├── LoginAppleScreen.tsx   # T03 substep (handled mostly by Passport/OIDC)
│   │   │   ├── ProfileChoiceScreen.tsx # T04
│   │   │   │   └── Binary: Pessoal ou Empresarial
│   │   │   ├── PersonalSetupScreen.tsx # T05a
│   │   │   │   └── 4-step: identidade → localidade → interesses → confirmação
│   │   │   └── BusinessSetupScreen.tsx # T05b
│   │   │       └── 5-step: dados básicos → localização → contato → fotos → confirmação + duplicate detection
│   │   │
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx         # T06
│   │   │   │   └── 7 zones: MegaEvents, Feed, Urgent, Trending, Friends, Nearby, MostSearched
│   │   │   ├── FeedScreen.tsx         # T_AGITO
│   │   │   │   └── Infinite scroll posts + like/dislike/comment + repost
│   │   │   ├── SearchScreen.tsx       # T07 (two moments)
│   │   │   │   ├── Moment 1: category selection
│   │   │   │   └── Moment 2: results + filters + map toggle
│   │   │   ├── ChatScreen.tsx         # T_CHAT
│   │   │   │   └── 2 tabs: Pessoas | Estabelecimentos + conversation list
│   │   │   ├── ActivityScreen.tsx     # T_ATIVIDADE
│   │   │   │   └── 5 cards: Favoritos, Pedidos, Agendamentos, Reservas, Histórico
│   │   │   └── ConfigScreen.tsx       # T_CONFIG
│   │   │       └── 8 sections: Conta, Localidade, Privacidade, Notificações, Segurança, Sobre, Legal, Suporte
│   │   │
│   │   ├── components/
│   │   │   ├── ProfileScreen.tsx      # T_PERFIL
│   │   │   │   ├── User profile: avatar, name, bio, posts grid
│   │   │   │   └── Business profile: logo, banner, hours, contact, catalog
│   │   │   ├── ItemScreen.tsx         # T_ITEM (7 templates)
│   │   │   │   └── Dynamic rendering based on template type
│   │   │   ├── CatalogScreen.tsx      # T_CATALOGO
│   │   │   │   └── Search + filter + paginated list
│   │   │   ├── NotificationsScreen.tsx # T13
│   │   │   │   └── Chronological list, 4 types
│   │   │   ├── StoryViewerScreen.tsx  # T_STORY
│   │   │   │   └── Full-screen, progress bars, reply button
│   │   │   ├── CityModalScreen.tsx    # M01
│   │   │   │   └── Bottom sheet, reverse geocoding, 3 states
│   │   │   ├── DrawerScreen.tsx       # PAINEL
│   │   │   │   └── Side drawer (Phase 1.0 placeholder)
│   │   │   └── SubConfigScreens.tsx   # 17 config child screens
│   │   │       ├── T_CONFIG.01 - Edit Profile
│   │   │       ├── T_CONFIG.02 - Edit Username
│   │   │       ├── T_CONFIG.03 - Edit Email
│   │   │       ├── T_CONFIG.04 - Change Password
│   │   │       ├── T_CONFIG.05 - Delete Account
│   │   │       ├── T_CONFIG.06 - Download Data
│   │   │       ├── T_CONFIG.07 - Edit City
│   │   │       ├── T_CONFIG.08 - Favorite Cities
│   │   │       ├── T_CONFIG.09 - GPS Toggle
│   │   │       ├── T_CONFIG.10 - Privacy Settings
│   │   │       ├── T_CONFIG.11 - Block Users
│   │   │       ├── T_CONFIG.12 - Notification Settings
│   │   │       ├── T_CONFIG.13 - Security Settings
│   │   │       ├── T_CONFIG.14 - About App
│   │   │       ├── T_CONFIG.15 - Changelog
│   │   │       ├── T_CONFIG.16 - FAQ
│   │   │       └── T_CONFIG.17 - Report Bug
│   │   │
│   │   └── other/
│   │       ├── PostDetailScreen.tsx
│   │       ├── EstablishmentDetailScreen.tsx
│   │       ├── ConversationDetailScreen.tsx
│   │       ├── CommentDetailScreen.tsx
│   │       └── etc
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── common/
│   │   │   ├── Header.tsx             # Top navigation bar
│   │   │   ├── BottomTabBar.tsx       # Custom bottom navigation (6 tabs)
│   │   │   ├── SafeAreaContainer.tsx  # Safe area wrapper
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Button.tsx             # Reusable button (variants)
│   │   │   ├── Input.tsx              # Text input wrapper
│   │   │   ├── Chip.tsx               # Tag component
│   │   │   └── Badge.tsx              # Notification count
│   │   │
│   │   ├── feed/
│   │   │   ├── PostCard.tsx           # Reusable post component
│   │   │   ├── CommentThread.tsx      # Nested comments
│   │   │   ├── PostActions.tsx        # Like/dislike/comment buttons
│   │   │   ├── FeedList.tsx           # Infinite scroll wrapper
│   │   │   ├── PostImage.tsx          # Single image with progress
│   │   │   └── PostFooter.tsx         # Engagement stats
│   │   │
│   │   ├── search/
│   │   │   ├── CategoryChips.tsx      # Multi-select categories
│   │   │   ├── SearchFilters.tsx      # Distance, rating, openNow, etc
│   │   │   ├── MapView.tsx            # Google Maps integration
│   │   │   ├── ResultsList.tsx        # Paginated results
│   │   │   ├── SearchEmpty.tsx
│   │   │   └── FilterBottomSheet.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx      # Avatar + name + stats
│   │   │   ├── FollowButton.tsx
│   │   │   ├── PostGrid.tsx           # 3-col grid
│   │   │   ├── ProfileStats.tsx       # Followers/following counts
│   │   │   ├── ProfileActions.tsx     # Message, Share, Report buttons
│   │   │   └── ProfileInfo.tsx        # Bio, location
│   │   │
│   │   ├── item/
│   │   │   ├── ItemGallery.tsx        # Carrossel with horizontal swipe
│   │   │   ├── ItemIdentity.tsx       # Nome + estabelecimento + descrição
│   │   │   ├── ItemPrice.tsx          # Preço + moeda + variações
│   │   │   ├── ItemRatings.tsx        # Star rating + reviews
│   │   │   ├── ItemCatalogBlock.tsx   # Template-specific blocks (INGREDIENTES, HORARIO, DURACAO, etc)
│   │   │   ├── ItemCTA.tsx            # Agendar / Comprar buttons
│   │   │   └── ItemMap.tsx            # Location map
│   │   │
│   │   ├── message/
│   │   │   ├── ConversationList.tsx   # List of conversations
│   │   │   ├── MessageBubble.tsx      # Individual message bubble
│   │   │   ├── TypingIndicator.tsx    # "User is typing..."
│   │   │   ├── MessageInput.tsx       # Input + attachment buttons
│   │   │   ├── AudioPlayer.tsx        # Play audio message
│   │   │   └── MediaPreview.tsx       # Image/video preview
│   │   │
│   │   ├── notification/
│   │   │   ├── NotificationItem.tsx   # Single notification
│   │   │   ├── NotificationBadge.tsx  # Unread count
│   │   │   └── NotificationList.tsx   # Scrollable list
│   │   │
│   │   ├── story/
│   │   │   ├── StoryProgressBar.tsx   # Multiple progress bars
│   │   │   ├── StoryContent.tsx       # Full-screen viewer
│   │   │   ├── StoryReplyButton.tsx   # Reply action
│   │   │   ├── StoryViewCount.tsx     # View counter + list
│   │   │   └── StoryCreator.tsx       # Create story UI
│   │   │
│   │   ├── establishment/
│   │   │   ├── EstablishmentCard.tsx  # Compact business card
│   │   │   ├── EstablishmentHeader.tsx # Logo + banner
│   │   │   ├── EstablishmentInfo.tsx  # Hours + contact + website
│   │   │   ├── EstablishmentRatings.tsx # Rating distribution
│   │   │   └── EstablishmentMap.tsx   # Location map
│   │   │
│   │   └── modals/
│   │       ├── CityModal.tsx          # M01 city selector
│   │       ├── ShareModal.tsx         # Share post/profile
│   │       ├── ReportModal.tsx        # Report content
│   │       ├── PermissionsModal.tsx   # GPS, camera, etc
│   │       ├── ConfirmModal.tsx
│   │       ├── ImagePicker.tsx        # Photo library/camera
│   │       └── DateTimePicker.tsx
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts                 # Auth state + login/logout/register
│   │   ├── useUser.ts                 # User profile fetch + update
│   │   ├── useFeed.ts                 # Feed fetching + pagination
│   │   ├── useSearch.ts               # Search with debounce (300ms)
│   │   ├── useMessages.ts             # WebSocket messages + notifications
│   │   ├── useNotifications.ts        # Push notification handling
│   │   ├── useGeoLocation.ts          # GPS + reverse geocoding
│   │   ├── useInfiniteScroll.ts       # Pagination helper
│   │   ├── useDebounce.ts             # Debounce utility
│   │   ├── useThrottle.ts             # Throttle utility
│   │   ├── useCache.ts                # AsyncStorage wrapper
│   │   ├── usePosts.ts                # Post CRUD operations
│   │   ├── useEstablishments.ts       # Establishment CRUD
│   │   ├── useLike.ts                 # Like/dislike toggle
│   │   ├── useComments.ts             # Comment CRUD
│   │   ├── useFollows.ts              # Follow/unfollow
│   │   └── useNetworkState.ts         # Online/offline detection
│   │
│   ├── api/
│   │   ├── apiClient.ts               # Axios instance (with cert pinning setup)
│   │   ├── endpoints/
│   │   │   ├── auth.ts                # /auth/* endpoints
│   │   │   ├── users.ts               # /users/* endpoints
│   │   │   ├── posts.ts               # /posts/* endpoints
│   │   │   ├── search.ts              # /search endpoints
│   │   │   ├── messages.ts            # /messages/* endpoints
│   │   │   ├── notifications.ts       # /notifications/* endpoints
│   │   │   ├── files.ts               # /files/upload endpoints
│   │   │   ├── establishments.ts      # /establishments/* endpoints
│   │   │   ├── items.ts               # /items/* endpoints
│   │   │   ├── stories.ts             # /stories/* endpoints
│   │   │   ├── ratings.ts             # /ratings/* endpoints
│   │   │   ├── favorites.ts           # /favorites/* endpoints
│   │   │   └── follows.ts             # /follows/* endpoints
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts    # Token refresh on 401
│   │       ├── error.interceptor.ts   # Error handling + retry logic
│   │       └── logging.interceptor.ts # Request/response logging
│   │
│   ├── utils/
│   │   ├── constants.ts               # Colors, sizes, API URLs
│   │   ├── formatters.ts              # Date, distance, currency
│   │   ├── validators.ts              # Email, phone, URL validation
│   │   ├── storage.ts                 # SecureStore + AsyncStorage wrappers
│   │   ├── analytics.ts               # Firebase Analytics
│   │   ├── logger.ts                  # Console + Sentry logging
│   │   ├── debounce.ts                # Debounce function
│   │   ├── throttle.ts                # Throttle function
│   │   ├── permissions.ts             # GPS, camera, contact permissions
│   │   ├── platform.ts                # Platform detection (iOS vs Android)
│   │   ├── image.ts                   # Image processing utilities
│   │   └── errors.ts                  # Error parsing + user messages
│   │
│   ├── theme/
│   │   ├── colors.ts                  # #0D0D0D (bg), #E8640A (accent), etc
│   │   ├── typography.ts              # Font families, sizes, weights
│   │   ├── spacing.ts                 # Margin/padding scale (4, 8, 12, 16, 20, 24...)
│   │   ├── borderRadius.ts            # Radius scale (4, 8, 12, 16, 20...)
│   │   ├── shadows.ts                 # Elevation scale
│   │   ├── theme.ts                   # Consolidated theme object
│   │   └── darkTheme.ts               # Dark mode styling (only theme in Phase 1.0)
│   │
│   ├── types/
│   │   ├── auth.types.ts              # Login, User, Token types
│   │   ├── user.types.ts              # User profile, Establishment types
│   │   ├── post.types.ts              # Post, Comment, Like/Dislike types
│   │   ├── message.types.ts           # Message, Conversation types
│   │   ├── notification.types.ts      # Notification types
│   │   ├── search.types.ts            # Search query, results, filters
│   │   ├── item.types.ts              # Item, Catalog types (7 templates)
│   │   ├── establishment.types.ts     # Establishment, Operating hours
│   │   ├── api.types.ts               # API responses, errors
│   │   └── navigation.types.ts        # Navigation params
│   │
│   └── services/
│       ├── websocket.service.ts       # Socket.io connection
│       ├── notification.service.ts    # Push notification handling
│       ├── storage.service.ts         # AsyncStorage + SecureStore
│       ├── geolocation.service.ts     # GPS + reverse geocoding
│       ├── camera.service.ts          # Camera/library access
│       └── permission.service.ts      # Permission requests
│
├── assets/
│   ├── images/
│   │   ├── splash-logo.png
│   │   ├── splash-logo@2x.png
│   │   ├── splash-logo@3x.png
│   │   ├── onboarding-1.png
│   │   ├── onboarding-1@2x.png
│   │   ├── onboarding-1@3x.png
│   │   ├── icon-home.png
│   │   ├── icon-feed.png
│   │   ├── icon-search.png
│   │   ├── icon-chat.png
│   │   ├── icon-activity.png
│   │   ├── icon-config.png
│   │   └── ... (all icons 2x + 3x)
│   │
│   ├── animations/
│   │   ├── onboarding-1.json          # Lottie animations
│   │   ├── onboarding-2.json
│   │   ├── onboarding-3.json
│   │   ├── loading.json
│   │   ├── empty-state.json
│   │   └── success.json
│   │
│   └── fonts/
│       └── (if custom fonts needed)
│
├── .env.example
├── .env.local                         # Local config
├── eas.json                           # Expo build configuration
├── app.json                           # Expo/React Native config
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── jest.config.js                     # Unit tests configuration
├── jest.setup.js
├── package.json                       # Dependencies + scripts
├── yarn.lock                          # (or package-lock.json)
├── .gitignore
├── README.md                          # Development guide
├── SETUP.md                           # Local environment setup
└── DEPLOYMENT.md                      # Build + distribution guide
```

---

## 🔧 CONFIGURATION FILES

### Backend Essential Config Files

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**`.env.example`**
```env
# All required environment variables documented with examples
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meuagito_dev?schema=public"

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=meu-agito-uploads-dev

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Apple OAuth
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=your-private-key

# Email
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@meuagito.local

# SMS
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+5511999999999

# Sentry
SENTRY_DSN=your-sentry-dsn

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email

# External APIs (backend-proxied)
GOOGLE_PLACES_API_KEY=your-api-key
```

**`docker-compose.yml`**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: meuagito_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  nginx:
    image: nginx:1.25
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  backend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    env_file: .env.local

volumes:
  postgres_data:
```

### Frontend Essential Config Files

**`app.json`**
```json
{
  "expo": {
    "name": "Meu Agito",
    "slug": "meu-agito",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "splash": {
      "image": "./assets/images/splash-logo.png"
    },
    "ios": {
      "supportsTabletMode": false,
      "bundleIdentifier": "com.meuagito.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/splash-logo.png"
      },
      "package": "com.meuagito.app"
    },
    "plugins": [
      "@react-native-google-signin/google-signin",
      "@react-native-community/hooks",
      "react-native-maps"
    ]
  }
}
```

**`tsconfig.json`**
```json
{
  "extends": "expo/tsconfig",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@components/*": ["./src/components/*"],
      "@api/*": ["./src/api/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

---

**Próximo passo:** Step 6 — Step-by-Step Implementation Guide (35-40 passos)
