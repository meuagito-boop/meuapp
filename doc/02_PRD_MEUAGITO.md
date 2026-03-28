# 📋 PRODUCT REQUIREMENTS DOCUMENT — Meu Agito v1.0

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Status:** Phase 1.0 - Especificação Completa  
**Público-alvo:** Product Managers, UX/UI, Frontend, Backend, QA

---

## 📌 VISÃO GERAL DO PRODUTO

### Definição
**Meu Agito** é um aplicativo mobile (iOS + Android) que funciona como rede social e descoberta de locais para uma experiência hiperlocal. Conecta usuários a estabelecimentos, eventos e experiências em suas proximidades, com foco em economia local brasileira.

### Missão
Democratizar a descoberta de oportunidades locais, empoderando pessoas a encontrar o que fazer perto de casa e pequenos negócios a alcançar seus clientes ideais.

### Visão (Phase 1.2+)
Tornar-se a plataforma de descoberta #1 para mercado local em 5 cidades brasileiras até 2026.

### Valores
- 🌍 **Hiperlocal:** Tudo começa por proximidade geográfica
- 🤝 **Comunidade:** Conexões reais, não apenas transações
- ⚡ **Velocidade:** Lazy loading, <1.5s load time
- 🔐 **Privacidade:** LGPD-first, sem venda de dados

---

## 👥 PERSONAS

### Persona 1: João (Usuário Pessoal)
- **Idade:** 24 anos
- **Profissão:** Designer freelancer
- **Objetivo:** Descobrir cafés, bares, eventos no seu bairro
- **Comportamento:** Scroll feed + busca por categorias + salva favoritos
- **Tamanho:** 60% da base (prioritário)

### Persona 2: Maria (Dona de Pequeno Negócio)
- **Idade:** 38 anos
- **Negócio:** Pequeno restaurante vegetariano
- **Objetivo:** Ganhar visibilidade sem pagar ads cara
- **Comportamento:** Publica fotos, responde comentários, monitora favoritos
- **Tamanho:** 35% da base
- **Monetização futura:** Premium features (1.2+)

### Persona 3: Admin (Moderador)
- **Objetivo:** Manter qualidade, deletar spam, resolver disputes
- **Ferramentas:** Dashboard (não incluído em 1.0)
- **Tamanho:** 5% (equipe interna)

---

## 🎯 OBJETIVOS & MÉTRICAS

### OKR (Objectives & Key Results) Phase 1.0

**O1: Viabilidade de Produto**
- KR1: Atingir 5k usuários ativos mensais em 90 dias
- KR2: Manter >80% retention after 7 days
- KR3: <1.5s feed load time (90th percentile)

**O2: Qualidade de Conteúdo**
- KR1: >90% estabelecimentos com foto de capa
- KR2: <5% taxa de denúncias por estabelecimento
- KR3: Duplicate business detection score >95%

**O3: Engajamento**
- KR1: >2 min tempo médio no app
- KR2: >30% usuários com ≥1 post/month
- KR3: >50% das transações têm avaliação

---

## 📱 REQUISITOS FUNCIONAIS

### RF-001: Autenticação & Onboarding

#### RF-001.1: Login com Email
- ✅ Recebe email + password
- ✅ Validação: RFC 5321 email, min 8 caracteres password
- ✅ Rate limit: 5 tentativas erradas = 15 min lock
- ✅ Retorna: JWT access token + refresh token
- ✅ Token expiry: 1 hora (access), 7 dias (refresh)

**Fluxo Alternativo - Token Expirado:**
- Request com expired access token
- Retorna 401 + "token_expired"
- Client usa refresh token para novo access token

#### RF-001.2: Login com SMS
- ✅ Recebe número telefônico
- ✅ Envia OTP via SMS (ex: Twilio)
- ✅ OTP válido por 5 minutos
- ✅ Max 3 OTP requests por número por hora
- ✅ OTP regex: 6 dígitos

#### RF-001.3: Login Social (Google/Apple)
- ✅ Integração com OIDC
- ✅ Recebe id_token do provider
- ✅ Backend valida assinatura do id_token
- ✅ Cria usuário se não existir
- ✅ Fallback se Google/Apple indisponível: mensagem "Service temporarily unavailable"

#### RF-001.4: Onboarding (3 slides)
- ✅ Slide 1: "Encontre locais"
- ✅ Slide 2: "Conecte com pessoas"
- ✅ Slide 3: "Compartilhe experiências"
- ✅ Lottie animations (200ms each)
- ✅ Pule com botão "Pular" ou swipe
- ✅ Analytics: track se pulou

#### RF-001.5: Configuração Pessoal (T05a)
4-step flow:
1. **Identidade:** Nome, @username (validar: alphanumeric + underscore, 3-20 chars), foto
2. **Localidade:** GPS (se aceito) ou manual input (city + neighborhood)
3. **Interesses:** Multi-select de 5+ categorias (Restaurantes, Bares, Eventos, etc)
4. **Confirmação:** Review + criar account

**Validações:**
- Username única (case-insensitive, banco valida com constraint)
- Foto: max 5MB, remove EXIF server-side
- Localidade: reverse geocoding se GPS

#### RF-001.6: Configuração Empresarial (T05b)
5-step flow com duplicate detection:
1. **Dados Básicos:** Nome, @username, CNPJ (encrypt AES-256)
2. **Localização:** Endereço completo (rua, número, bairro, complemento)
3. **Contato:** Telefone, email, website
4. **Fotos & Descrição:** Logo, foto capa, bio (max 500 chars)
5. **Confirmação:** Review + duplicata detection scoring

**Duplicate Detection Algorithm:**
```
Score = (nome_similarity × 0.35) + 
        (distance_meters × 0.35) + 
        (category_match × 0.20) + 
        (phone_match × 0.10)

Resultado:
- Score ≥ 70 → Possível duplicata (flag para review)
- Score 40-69 → Aviso ao usuário ("Encontramos algo similar")
- Score < 40 → Aceitar criar
```

Nome similarity: Levenshtein distance (agrupa variações como "Cafeteria Azul" ≈ "Cafeteria Azul Bar")

---

### RF-002: Home Feed (T06)

7 Zones com lazy loading:

1. **Zona 1 (Z1):** Mega Events Carousel
   - Top 5 eventos do mês
   - Imagem grande + título
   - Load imediato

2. **Zona 2 (Z2):** Live Feed (Posts sociais)
   - Posts de pessoas que segue + empresas salvas
   - Infinite scroll
   - Load imediato

3. **Zona 3 (Z3):** Urgent Items
   - Estabelecimentos com novos posts/stories nos últimos 2 horas
   - Load após Z2

4. **Zona 4 (Z4):** Trending
   - Top estabelecimentos por engagement (últimos 7 dias)
   - Load após Z3

5. **Zona 5 (Z5):** Friends Visited
   - Estabelecimentos que amigos visitaram recentemente
   - Load após Z4

6. **Zona 6 (Z6):** Nearby (Mapa)
   - Estabelecimentos a 5km do usuário
   - Mapa com pins
   - Load após Z5

7. **Zona 7 (Z7):** Most Searched
   - Trending searches da região
   - Load após Z6

**Paginação:** Cada zona = 1 request, cursor-based pagination

**Cache:** 30 min ou invalidate ao criar novo post

---

### RF-003: Social Feed (T_AGITO)

#### RF-003.1: Criar Post
- ✅ Tipo: Texto, foto, vídeo (MVP apenas texto + foto)
- ✅ Conteúdo: min 1, max 500 caracteres
- ✅ Fotos: max 5, 5MB cada, remove EXIF
- ✅ Tags: estabelecimentos (autocomplete), usuários (@mention)
- ✅ Privacidade: público ou followers-only

**Fluxo:**
1. Usuário escreve + seleciona fotos
2. Frontend valida
3. Upload fotos → S3 com signed URLs (1 hora validade)
4. POST /api/v1/posts com foto URLs + texto
5. Server cria post + indexa para search
6. Notifica estabelecimentos tagged

#### RF-003.2: Like/Dislike
- ✅ Ações mutuamente exclusivas (não pode dar like AND dislike)
- ✅ Like: visível publicamente (contador)
- ✅ Dislike: privado (apenas para algoritmo)
- ✅ Toggle: clicar novamente remove (idempotent)
- ✅ Notifica autor: "X pessoa(s) curtiu seu post"

#### RF-003.3: Comentários (Infinite Depth)
- ✅ Texto: min 1, max 200 chars
- ✅ Aninhamento: replies infinitas
- ✅ Notificações: tagger + reply chains
- ✅ Delete próprio comentário: soft delete
- ✅ Like/dislike em comentários: igual ao post

#### RF-003.4: Repost (Retweet-like)
- ✅ Botão: "Repostar"
- ✅ Adiciona: "Repostado por @meuusername e +X"
- ✅ Attribution: permanente, não pode ocultar
- ✅ Notifica: autor original

#### RF-003.5: Feed Pagination
- ✅ Cursor-based: $TIMESTAMP | $ID
- ✅ Limit: 20 posts default
- ✅ Sort: cronológico descendente
- ✅ Filtros: por pessoa/estabelecimento

---

### RF-004: Busca Completa (T07)

#### RF-004.1: Dois Momentos

**Momento 1 (Seleção de Categorias):**
- ✅ Chips de categorias: Restaurantes, Bares, Eventos, Compras, etc
- ✅ Multi-select
- ✅ Search input: filter categorias
- ✅ Localização: seleciona city/neighborhood

**Momento 2 (Resultados):**
- ✅ Resultados paginados
- ✅ Mapa com pins (alternável)
- ✅ Filtros avançados:
  - Distância: 1km, 5km, 10km, 50km
  - Rating: ⭐4+, ⭐3+, etc
  - Tipo: evento, serviço, produto
  - Aberto agora: toggle
  - Promoções: toggle

#### RF-004.2: 6 Entry Points
1. Busca bar em Home
2. Tab Busca (navigation)
3. Estabelecimento → estabelecimentos similares
4. Story → "Mais do @username"
5. Categoria chip em Post
6. Location sharing

**Preservação de estado:** Volta à busca anterior ao clicar back

---

### RF-005: Perfil Universal (T_PERFIL)

#### RF-005.1: Pessoa (User Profile)
- ✅ Foto de perfil + banner
- ✅ @username + verificado (acesso próprio)
- ✅ Bio (max 200 chars)
- ✅ Seguidores/Seguindo (números + lista paginada)
- ✅ Posts: grid, 3 cols, lazy load
- ✅ Botões: Seguir, Message, Share, Report (se não é você)

#### RF-005.2: Estabelecimento (Business Profile)
- ✅ Logo + banner (hero)
- ✅ Nome + categoria + rating (agregado)
- ✅ Localização + distância do usuário
- ✅ Telefone/email/website clicáveis
- ✅ Horário de funcionamento
- ✅ Galeria de fotos
- ✅ Catálogo: se tem produtos/cardápio (T_CATALOGO)
- ✅ Posts + avaliações
- ✅ Botões: Favoritar, Message, Share, Denunciar
- ✅ Avaliação: Form (texto + rating 1-5)

#### RF-005.3: Ratings & Avaliacoes
- ✅ Usuário pode avaliar 1x por estabelecimento
- ✅ Display: média de ratings + distribuição (% 5⭐, 4⭐, etc)
- ✅ Sort: recentes primeiro
- ✅ Filtro: por rating
- ✅ Helpful: útil/não útil (não conta para média)

---

### RF-006: Item Universal (T_ITEM)

Template sistema de renderização para 7 tipos de conteúdo:

| Template | Blocos | Exemplos |
|----------|--------|----------|
| **evento** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, MAPA, CRONOGRAMA | Shows, workshops, palestras |
| **servico** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, HORARIO | Personal trainer, design gráfico |
| **prato** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, INGREDIENTES | Pizzas, pratos à la carte |
| **produto** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, TAMANHO/COR | Camisetas, eletrônicos |
| **quarto** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, CAPACIDADE, AMENIDADES | Airbnb, pousadas |
| **plano** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, FEATURES | Academia, assinatura |
| **procedimento** | GALERIA, IDENTIDADE, PREÇO, AVALIACOES_ITEM, TEMPO_DURACAO | Corte cabelo, massagem |

**Bloco Padrão (renderizado para todos):**
- Galeria: fotos, carrossel swipeable
- Identidade: nome, estabelecimento, descrição
- Preço: valor, moeda (R$), variações
- Avaliações: rating + reviews
- Ação CTA: Agendar, Comprar, Reservar, etc

---

### RF-007: Catálogo Universal (T_CATALOGO)

- ✅ Search em tempo real (debounce 300ms)
- ✅ Filtros por categoria (chips multi-select)
- ✅ Ordering: relevância, preço (asc/desc), rating
- ✅ Paginação: 30 itens por página
- ✅ Estado preservado: volta à scroll position

---

### RF-008: Mensagens (T_CHAT)

#### RF-008.1: Estrutura
- ✅ 2 tabs: Pessoas | Estabelecimentos
- ✅ Lista de conversas com last message preview
- ✅ Ordenação: by last message date

#### RF-008.2: Tipos de Mensagem
- ✅ Texto (max 500 chars)
- ✅ Foto (max 5MB, remove EXIF)
- ✅ Audio (MVP: Phase 1.2+)
- ✅ Reference a post/story (card preview)

#### RF-008.3: Typing Indicator
- ✅ "Usuário está digitando..." em tempo real
- ✅ Socket.io connection
- ✅ Timeout: 3 segundos sem digitação

#### RF-008.4: Notificações
- ✅ Mensagem não-lida: badge counter
- ✅ Notification sound: customizável em settings

#### RF-008.5: Funcionalidades Futuras (Phase 1.2+)
- ❌ Message read confirmations (✓✓ blue)
- ❌ Voice/Video calls
- ❌ Reactions/Stickers

---

### RF-009: Notificações (T13)

#### RF-009.1: Tipos
1. **Social:** Post liked, comentário, repost, follow
2. **Establishment:** Nova foto, novo item em catálogo, resposta comentário
3. **Orders/Bookings:** Status mudou, lembrete reserva
4. **System:** App updates, security alerts

#### RF-009.2: Configuração
- ✅ 5 notificações push por dia (max)
- ✅ Silencioso: 22:00 - 08:00 (timezone do usuário)
- ✅ Disable por tipo (EXCETO security alerts)
- ✅ Settings: Notificações seção

#### RF-009.3: Display
- ✅ Single list, cronológico (descending)
- ✅ Mark as read: swipe/click
- ✅ Delete: swipe (soft delete)
- ✅ Deep link: click notification abre item relevante

---

### RF-010: Stories (T_STORY)

#### RF-010.1: Criar Story
- ✅ Foto/vídeo (max 15 segundos)
- ✅ Texto overlay (max 100 chars)
- ✅ Filter: blur, brightness (básico)
- ✅ TTL: 24 horas
- ✅ Privacy: público ou followers-only

#### RF-010.2: Visualizar Story
- ✅ Full-screen view
- ✅ Progress bars por story
- ✅ Swipe left/right: próximo/anterior
- ✅ Tap hold: pausa
- ✅ Reply button: mensagem privada

#### RF-010.3: Story Metrics
- ✅ View counter (visível ao criador)
- ✅ List de visualizadores (nome/foto)
- ✅ Auto-delete: 24 horas
- ✅ Archive own stories (Phase 1.2+)

---

### RF-011: Favoritos

- ✅ Botão "Favoritar" em estabelecimentos
- ✅ Desfavoritar
- ✅ Collection: "Salvos"
- ✅ Sync com servidor
- ✅ Ordernar: data saved desc
- ✅ Filtrar por categoria

---

### RF-012: Configurações & Privacidade (T_CONFIG)

#### Seção 1: Conta
- RF-012.1: Editar nome/bio/foto
- RF-012.2: Username (requer verificação de disponibilidade)
- RF-012.3: Email (verificar novo email antes de mudar)
- RF-012.4: Trocar senha (requer senha atual)
- RF-012.5: Deletar conta (soft delete, aguarda 30 dias)
- RF-012.6: Download dados (LGPD direito ao portability)

#### Seção 2: Localidade
- RF-012.7: Cidade principal (via M01 modal)
- RF-012.8: Cidades favoritas (max 5)
- RF-012.9: GPS: on/off
- RF-012.10: Precisão localização (exato vs aproximado)

#### Seção 3: Privacidade
- RF-012.11: Perfil privado (followers-only feed)
- RF-012.12: Bloquear usuários
- RF-012.13: Silenciar notificações de usuário
- RF-012.14: Visibility options (quem vê quando visitei)
- RF-012.15: Data de nascimento (privado, apenas para age verification)

#### Seção 4: Notificações
- RF-012.16: Disable por tipo (social, business, orders, system)
- RF-012.17: Sound: on/off
- RF-012.18: Vibração: on/off
- RF-012.19: Horário silencioso (22:00-08:00)

#### Seção 5: Segurança
- RF-012.20: Two-factor (SMS ou TOTP) — Phase 1.2+
- RF-012.21: Login activity log (last 10 logins)
- RF-012.22: Devices conectados (revoke access)
- RF-012.23: Sessions ativas (logout remoto)

#### Seção 6: Sobre
- RF-012.24: Versão do app
- RF-012.25: Changelog (últimas features)
- RF-012.26: Créditos

#### Seção 7: Legal
- RF-012.27: Termos de uso
- RF-012.28: Política de privacidade
- RF-012.29: LGPD information

#### Seção 8: Suporte
- RF-012.30: FAQ (busca + categorias)
- RF-012.31: Report bug: form + screenshot
- RF-012.32: Contact support: email form
- RF-012.33: Status page: server status

---

## 📊 REQUISITOS NÃO-FUNCIONAIS

### RNF-001: Performance
- **Load time home feed:** <1.5s (90th percentile)
- **Search query response:** <800ms (99th percentile)
- **Image load:** <500ms (via CDN + compression)
- **API response time:** <200ms (p95)

### RNF-002: Escalabilidade
- **Concurrent users:** 10k simultâneos em Phase 1.2
- **Database:** Suporta 1M registros de usuários
- **API calls:** 100k requisições/hora
- **Storage:** 500GB initial, 5TB roadmap

### RNF-003: Disponibilidade
- **Uptime:** 99.5% (Phase 1.0), 99.9% (Phase 1.2+)
- **Graceful degradation:** Se backend down, app mostra cache
- **Failover:** Multi-region backup (Phase 1.2+)

### RNF-004: Segurança
- **Authentication:** JWT + refresh tokens, expiry 1h/7d
- **Password:** bcrypt hash (min 10 rounds)
- **Encryption:** HTTPS/TLS 1.3, AES-256 for sensitive data
- **API keys:** Zero em mobile, backend-proxied
- **Rate limiting:** 5 tentativas login, 3 SMS/número/hora
- **LGPD:** Consent logging, right to deletion, data portability

### RNF-005: Usabilidade
- **Dark theme:** #0D0D0D background, #E8640A accent
- **Accessibility:** WCAG 2.1 Level AA (Phase 1.2+)
- **Orientation:** Portrait only (not landscape)
- **Responsiveness:** Test iPad Mini até iPhone 13+
- **RTL support:** Phase 1.2+ (futuro suporte português)

### RNF-006: Compatibilidade
- **iOS:** 14.0+
- **Android:** 8.0+ (API 26)
- **React Native:** 0.73.x LTS

### RNF-007: Data Retention
- **Story:** Auto-delete 24h
- **Message:** 90 dias
- **Deleted user data:** 30 dias (soft delete)
- **Logs:** 30 dias (compliance)

---

## 🗺️ ROADMAP

### Phase 1.0 (MVP) — Atual
- ✅ Authentication (email, SMS, Google, Apple)
- ✅ Social feed + posts + comments
- ✅ Home feed com 7 zones
- ✅ Search com categorias
- ✅ Profiles (pessoa + estabelecimento)
- ✅ Messages (texto + foto)
- ✅ Stories (24h)
- ✅ Notifications (push)
- ✅ Settings (básico)
- ✅ Duplicate detection (scoring)

### Phase 1.1 (Stabilization) — Jun 2026
- 🔄 Load testing (10k concurrent)
- 🔄 Security audit
- 🔄 LGPD audit
- 🔄 Performance optimization
- 🔄 UI polish

### Phase 1.2 (Premium) — Sep 2026
- ⏳ Business dashboard (analytics)
- ⏳ Premium profiles (badges, featured)
- ⏳ Promoted items (advertência paga)
- ⏳ Advanced search (Elasticsearch)
- ⏳ Real-time features (socket.io)
- ⏳ Audio/video messages
- ⏳ Admin dashboard

### Phase 2.0+ (Scaling) — 2027
- ⏳ Marketplace (pedidos + pagamentos)
- ⏳ Multi-city expansion
- ⏳ Web app
- ⏳ API marketplace (third-party integrations)

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Para Phase 1.0 Release
- [ ] 95% user flows testados (e2e)
- [ ] Load testing: 10k usuarios sustain <1.5s home feed
- [ ] Security audit: 0 critical, <3 high
- [ ] LGPD audit: compliant
- [ ] Documentation: API + SDK completo
- [ ] Analytics: eventos rastreados

---

**Próximo passo:** Step 4 — Technical Blueprint (Arquitetura + Tech Stack + Database)
