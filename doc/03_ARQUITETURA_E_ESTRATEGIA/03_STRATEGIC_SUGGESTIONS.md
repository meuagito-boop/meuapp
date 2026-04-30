# 🚀 STRATEGIC SUGGESTIONS & OPTIMIZATION (Phase 1.0 + Roadmap)

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Público:** Product Managers, Tech Leads, Founders  
**Escopo:** Performance, Security, Scalability, LGPD, Testing, Deployment

---

## 🔥 RECOMENDAÇÕES CRÍTICAS (Phase 1.0)

### 1. Search Strategy — PostgreSQL Full-Text (v1.0) → Elasticsearch (v1.2+)

**Phase 1.0 (MVP):**
- PostgreSQL native full-text search (GIN indexes)
- Limite esperado: até 100k estabelecimentos
- Latência aceitável: 200-800ms
- Custo: $0 (included with RDS)

**Implementação:**
```sql
-- Index para FTS
CREATE INDEX idx_establishments_search 
ON establishments 
USING GIN(to_tsvector('portuguese', name || ' ' || description));

-- Query
SELECT * FROM establishments 
WHERE to_tsvector('portuguese', name || ' ' || description) 
@@ plainto_tsquery('portuguese', 'pizza')
AND ST_Distance(coordinates, ST_Point($1, $2)) < 10000
ORDER BY ts_rank(vector, query) DESC;
```

**Phase 1.2+ (Scaling):**
- Migrar para Elasticsearch
- Suportar 1M+ estabelecimentos
- Latência: <200ms (p95)
- Features: synonym expansion, typo tolerance, ranking customization
- Custo: +$100/mês (AWS OpenSearch)

**Action Items:**
- ✅ Phase 1.0: Implementar PostgreSQL FTS com indexes corretos
- 📋 Phase 1.2: Planejar Elasticsearch migration (data re-indexing strategy)
- 📊 Monitoring: Alertar se query tempo > 1s

---

### 2. Database Optimization — Indexes + Query Tuning

**Critical Indexes (Phase 1.0):**
```sql
-- User searches
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_isDeleted ON users(isDeleted);

-- Post engagement
CREATE INDEX idx_posts_userId_createdAt ON posts(userId, createdAt DESC);
CREATE INDEX idx_posts_createdAt ON posts(createdAt DESC);
CREATE INDEX idx_likes_userId_postId ON likes(userId, postId);

-- Location-based
CREATE INDEX idx_establishments_coordinates 
ON establishments USING GIST(coordinates);

-- Foreign keys (automatic but explicit)
CREATE INDEX idx_posts_establishmentId ON posts(establishmentId);
CREATE INDEX idx_messages_senderId_recipientId ON messages(senderId, recipientId);
```

**Query Optimization:**
- Use EXPLAIN ANALYZE para identificar sequential scans
- N+1 prevention: SELECT * FROM posts WHERE userId IN (...) (batch)
- Connection pooling: PgBouncer (min 20, max 50 connections)
- Statement caching: Prepared statements via Prisma

**Monitoring:**
- Query performance dashboard (DataDog)
- Slow query log (queries > 100ms)
- Autovacuum tuning (aggressive para writes altos)

**Checklist:**
- ✅ All indexes criados em migration
- ✅ EXPLAIN ANALYZE run em todas queries críticas
- ✅ Connection pooling configurado

---

### 3. Cache Strategy — Redis Tiers + Event-Driven Invalidation

**Implementation Pattern:**
```typescript
// Service-level cache decorator
@Cacheable({
  key: 'home:feed:{{userId}}',
  ttl: 30 * 60 * 1000 // 30 min
})
async getHomeFeed(userId: string) {
  return this.buildFeed(userId);
}

// Manual invalidation on events
@EventListener()
onPostCreated(event: PostCreatedEvent) {
  // Invalidate all user home feeds
  const followers = await this.followService.getFollowers(event.userId);
  for (const follower of followers) {
    this.cache.delete(`home:feed:${follower.id}`);
  }
}
```

**Cache Warming:**
- Background job: pre-cache top 100 feeds hourly
- Reduz latência percebida para 90% de users

**Cache Eviction Strategy:**
- LRU (Least Recently Used) + TTL
- Redis maxmemory-policy: `allkeys-lru`
- Size limit: 2GB (Phase 1.0), escalable a 8GB

**Monitoring:**
- Cache hit rate (target: >70% for home feed)
- Redis memory usage
- Cache invalidation events

---

### 4. Security Hardening — Checklist Completo

#### A. API Security
```typescript
// Helmet para headers de segurança
import helmet from '@nestjs/helmet';
app.use(helmet());

// CORS restritivo
app.enableCors({
  origin: ['https://meuagito.com', 'https://app.meuagito.com'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // Requests por IP
}));

// Input validation (class-validator)
@IsEmail()
@IsString()
email: string;
```

#### B. Authentication & Encryption
- ✅ JWT + refresh tokens (1h + 7d)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ AES-256-GCM para dados sensíveis (CNPJ, SSN)
- ✅ HTTPS/TLS 1.3 obrigatório
- ✅ Certificate pinning (auth endpoints no mobile)

#### C. Database Security
```sql
-- Row-level security (PostgreSQL)
CREATE POLICY select_own_data ON users
USING (auth.uid() = id);

-- Encrypt sensitive columns
ALTER TABLE establishments 
ADD COLUMN cnpj_encrypted BYTEA;

-- Audit logging
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  userId UUID,
  action VARCHAR(50),
  resourceId UUID,
  timestamp TIMESTAMP DEFAULT now()
);
```

#### D. API Key Management
- ✅ Zero API keys no app mobile (backend proxy all external calls)
- ✅ Rotate keys a cada 90 dias
- ✅ AWS Secrets Manager para production keys
- ✅ Separate keys por environment (dev, staging, prod)

#### E. File Upload Security
```typescript
// Whitelist MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw BadRequestException();
}

// Size limit
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_SIZE) {
  throw BadRequestException();
}

// Remove EXIF + metadata
const buffer = await sharp(file.buffer)
  .rotate() // Apply EXIF rotation
  .withMetadata(false) // Remove all metadata
  .toBuffer();

// Scan para malware (Phase 1.2+)
// await scanFile(buffer); // ClamAV
```

#### F. Secrets Management
```env
# .env.local (git-ignored)
DATABASE_URL="postgresql://..."
JWT_SECRET="min-32-chars-random"
AWS_SECRET_ACCESS_KEY="..."

# .env.prod (AWS Secrets Manager)
# Never in version control
```

#### G. Dependency Scanning
```bash
# npm audit
yarn audit

# Update regularly
yarn upgrade-interactive --latest

# OWASP scanning (Phase 1.2+)
npm audit --audit-level=moderate
```

**Checklist Compliance:**
- [ ] All endpoints have rate limiting
- [ ] Passwords bcrypt with 10+ rounds
- [ ] HTTPS/TLS 1.3 enforced
- [ ] No API keys in code
- [ ] EXIF removed from uploads
- [ ] Input validation on all endpoints
- [ ] Security headers present (Helmet)
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection
- [ ] CORS configured restrictively

---

### 5. LGPD Compliance — Brazilian Data Protection

**Key Requirements:**
1. **Consent Management**
   - Log all consent (when, what, how long)
   - User can withdraw anytime
   - Explicit opt-in (not opt-out)

   ```typescript
   // Track consent
   const consent = await prisma.consent.create({
     data: {
       userId,
       type: 'terms_of_service',
       version: '1.0',
       acceptedAt: new Date(),
       ipAddress: req.ip
     }
   });
   ```

2. **Data Retention**
   - Delete data on account deletion (30-day grace period)
   - Message retention: 90 days
   - Log retention: 30 days
   - Backup retention: 6 months (encrypted, isolated)

   ```typescript
   // Scheduled hard delete
   @Cron('0 0 * * *')
   async hardDeleteScheduled() {
     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
     await prisma.user.deleteMany({
       where: {
         isDeleted: true,
         deletedAt: { lt: thirtyDaysAgo }
       }
     });
   }
   ```

3. **Right to Portability**
   - Export user data em JSON/CSV
   - Include: profile, posts, messages, ratings
   - Processado em 15 dias úteis

   ```typescript
   // GET /users/me/export
   async exportUserData(userId: string) {
     const user = await prisma.user.findUnique({ where: { id: userId } });
     const posts = await prisma.post.findMany({ where: { userId } });
     const messages = await prisma.message.findMany({
       where: { OR: [{ senderId: userId }, { recipientId: userId }] }
     });
     
     return {
       profile: user,
       posts,
       messages,
       // ... other data
     };
   }
   ```

4. **Right to Be Forgotten**
   - User pode pedir deletion
   - Hard delete após 30 dias
   - Não pode ser negado (com exceções)

5. **Privacy Policy**
   - Claro sobre coleta de dados (geo, cookies, analytics)
   - Quem acessa os dados
   - Quanto tempo retém
   - Direitos do usuário

6. **Third-Party Data Sharing**
   - ❌ Não vender dados
   - ✅ Apenas compartilhar com provedores essenciais (AWS)
   - ✅ Data Processing Agreements (DPA) assinados

7. **Breach Notification**
   - Notificar usuários em 72 horas se breach
   - Autoridades dentro de 3 dias
   - Log de todas as incidentes

**Audit Checklist:**
- [ ] Privacy Policy atualizada + links em app
- [ ] Terms of Service menciona LGPD
- [ ] Consent log tracked
- [ ] Data export funciona
- [ ] Hard delete schedule implementado
- [ ] DPA assinado com AWS e demais operadores realmente usados
- [ ] Incident response plan documentado

---

### 6. Testing Strategy — Cobertura > 80%

**Unit Tests (Jest):**
- Services: `auth.service.spec.ts` (80%+ coverage)
- Utils: `levenshtein.util.spec.ts`
- Helpers: `pagination.util.spec.ts`

```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens on valid email+password', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = await authService.login(user.email, 'password');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw on invalid password', async () => {
      await expect(
        authService.login('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

**Integration Tests (Supertest):**
- Auth routes: `auth.e2e.spec.ts`
- Posts routes: `posts.e2e.spec.ts`
- Search routes: `search.e2e.spec.ts`

```typescript
describe('Auth E2E', () => {
  it('POST /auth/login returns tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
  });
});
```

**E2E Tests (Cypress/Detox):**
- Complete user flows
- Login → Create post → Comment → Like
- Search → Open detail → Favoritar

```typescript
// Cypress (web/desktop testing)
describe('User can create post', () => {
  it('login → write post → publish', () => {
    cy.visit('/');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password');
    cy.get('[data-testid=login-button]').click();
    
    cy.get('[data-testid=post-input]').type('Hello world');
    cy.get('[data-testid=post-submit]').click();
    
    cy.contains('Hello world').should('be.visible');
  });
});
```

**Coverage Goals:**
- Unit tests: 80%+ (critical services)
- Integration: 70%+ (API routes)
- E2E: 50%+ (key user flows)
- Overall: >75% codebase

**CI Pipeline:**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn test:unit --coverage
      - run: yarn test:integration
      - run: yarn test:e2e
      - uses: codecov/codecov-action@v3
```

---

### 7. Performance Optimization — <1.5s Home Feed

**Problemas Comuns & Soluções:**

| Problema | Causa | Solução |
|----------|-------|--------|
| Home feed lento | N+1 queries | Batch queries com Prisma `.include()` |
| Search lento | Sequential scan | Adicionar GIN indexes em full-text |
| Image load lento | Sem compressão | Sharp + WebP conversion |
| API timeout | Queries caras | Pagination + cursor-based |
| Cold start | Container | Multi-stage Docker build |

**Otimizações específicas:**

1. **Query Optimization**
```typescript
// ❌ Bad: N+1 queries
const posts = await prisma.post.findMany({ take: 20 });
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.userId } }); // N queries
}

// ✅ Good: Single query with include
const posts = await prisma.post.findMany({
  take: 20,
  include: {
    author: true,
    likes: { select: { userId: true } }, // Count optimization
    comments: { select: { id: true }, take: 3 }
  }
});
```

2. **Pagination**
```typescript
// Cursor-based pagination (better for large datasets)
const posts = await prisma.post.findMany({
  where: { createdAt: { lt: cursor } },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

3. **Image Optimization**
```typescript
// Resize + optimize server-side
await sharp(buffer)
  .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile('image_800.webp');

// Serve multiple resolutions
// img srcset="image_400.webp 400w, image_800.webp 800w"
```

4. **Caching**
```typescript
// Cache expensive operations
@Cacheable({ ttl: 30 * 60 * 1000 })
async getHomeFeed(userId: string) {
  // This is called once per 30 min
}
```

5. **Code Splitting (Frontend)**
```typescript
// React Native: lazy load screens
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

// Only load quando necessário
```

**Monitoring & Alerts:**
```typescript
// APM with DataDog/New Relic
const endTime = Date.now();
const duration = endTime - startTime;

if (duration > 1500) {
  logger.warn(`Slow query detected: ${duration}ms`);
  sentry.captureMessage(`Slow: ${endpoint}`, 'warning');
}
```

**Load Testing (Vegeta):**
```bash
# Simulate 100 concurrent users
echo "GET https://api.meuagito.com/feed" | \
vegeta attack -duration=30s -rate=100 | \
vegeta report

# Target: p95 < 500ms, p99 < 1000ms
```

---

## 📈 ROADMAP — Phase 1.2+ (Próximos 6 meses)

### Phase 1.1 (Jun 2026) — Stabilization
**Objetivo:** Production-ready + security audit

- ✅ Load testing (10k concurrent users)
- ✅ Security audit (OWASP Top 10)
- ✅ LGPD audit (final compliance check)
- ✅ Performance optimization (< 1.5s feed)
- ✅ UI polish + animations
- ✅ Documentation complete

---

### Phase 1.2 (Sep 2026) — Advanced Features + Scaling

**Features:**
- 🔄 Real-time features (socket.io for messaging, typing)
- 🔄 Business dashboard (analytics, insights, promoted items)
- 🔄 Premium profiles (badges, featured items, ads-free)
- 🔄 Advanced search (Elasticsearch, autocomplete, synonyms)
- 🔄 Audio/video messages
- 🔄 Admin dashboard (moderation, content management)
- 🔄 AI recommendations (trending, personalized feed)

**Infrastructure:**
- 🔄 Elasticsearch cluster (1M+ items)
- 🔄 Multi-region deployment (2+ regions for failover)
- 🔄 CDN (CloudFront) for image distribution
- 🔄 Database read replicas (read-scaling)
- 🔄 Microservices decomposition (search, notifications isolated)

**Security:**
- 🔄 Two-factor authentication (SMS + TOTP)
- 🔄 Advanced fraud detection (behavioral analysis)
- 🔄 End-to-end encryption for messages (Phase 1.2+)

---

### Phase 2.0+ (2027) — Marketplace

**Features:**
- 💳 Pagamentos (Stripe integration)
- 🛒 Carrinho de compras (pedidos)
- 📦 Fulfillment (rastreamento, delivery)
- ⭐ Avaliações (já tem, mas enhance com fotos)
- 🎯 Promoções (coupons, discounts)

**Geographic Expansion:**
- 🌍 Multi-city (5+ cidades)
- 🌍 Multi-language support
- 🌍 Web app (React web version)

---

## 🎯 KEY SUCCESS METRICS (Phase 1.0)

### Engagement
- DAU (Daily Active Users): 5k → 50k (3 months)
- MAU (Monthly Active Users): 10k → 100k
- Avg session time: >2 minutes
- Posts per user: >0.5/week
- Favoritas salvas: >10% users

### Quality
- Crash rate: <0.1%
- API error rate: <0.5%
- Average rating: >4.5 stars
- Duplicate detection accuracy: >95%

### Technical
- Home feed load: <1.5s (p90)
- Search response: <800ms (p99)
- Uptime: >99.5%
- Cache hit rate: >70%

### Business
- Cost per user: <$1/month (infrastructure)
- User acquisition cost: <$5 (organic + referral)
- LTV:CAC ratio: >3:1 (Phase 1.2 monetization)

---

## 🚨 RISK MITIGATION

### Risco Alto
| Risco | Probabilidade | Impacto | Mitigation |
|-------|---------------|--------|-----------|
| Duplicate detection falha | Media | Alto | Manual review queue + human validation |
| Database performance | Media | Alto | Indexes + query optimization + monitoring |
| Cost overrun | Alta | Médio | Capacity planning + auto-scaling limits |

### Risco Médio
| Risco | Probabilidade | Impacto | Mitigation |
|-------|---------------|--------|-----------|
| iOS/Android release delay | Média | Médio | EAS Build + beta testing |
| API abuse | Baixa | Médio | Rate limiting + monitoring |
| Data breach | Baixa | Alto | Security audit + encryption + compliance |

### Risco Baixo
| Risco | Probabilidade | Impacto | Mitigation |
|-------|---------------|--------|-----------|
| Minor UI bugs | Alta | Baixo | QA testing + bug tracking |
| Typos em docs | Alta | Baixo | Code review + spell check |

---

## 💡 ADDITIONAL RECOMMENDATIONS

### Developer Experience
- Set up linting + formatting (ESLint + Prettier)
- Git hooks (pre-commit tests)
- Docker Compose for local development
- Comprehensive API documentation (Swagger)
- Code templates for new modules

### Operations
- Comprehensive runbook for on-call
- Incident response playbook
- Scheduled backup testing (restore drills)
- Capacity planning (quarterly review)
- Cost optimization (AWS cost explorer)

### Community
- Public changelog (feature releases)
- Status page (api.status.meuagito.com)
- User feedback loop (in-app surveys)
- Bug bounty program (Phase 1.2+)

---

**Este documento representa a arquitetura estratégica completa para Phase 1.0 e roadmap futuro.**

**Próximo passo:** Implement according to Step-by-Step Implementation Guide (05_IMPLEMENTATION_GUIDE.md)
