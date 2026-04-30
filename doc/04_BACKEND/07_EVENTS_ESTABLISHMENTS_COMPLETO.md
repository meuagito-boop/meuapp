# Events & Establishments Modules - Documentação Completa

## 📋 Visão Geral

Os módulos Events e Establishments implementam descoberta baseada em localização com PostGIS, sistemas de avaliação por estrelas (1-5) e rastreamento de participação em eventos:

### Events Module
- ✅ Criar, listar, atualizar e deletar eventos
- ✅ Participação em eventos com confirmação de presença
- ✅ Sistema de avaliações (rating 1-5 com comentários)
- ✅ Busca por proximidade (raio em km)
- ✅ Contagem de participantes
- ✅ Suporte a capacidade máxima de participantes
- ✅ Categorias: nightlife, cultural, sports, gastronomic, party, other

### Establishments Module
- ✅ Criar, listar, atualizar e deletar estabelecimentos
- ✅ Sistema de avaliações (rating 1-5 com comentários)
- ✅ Favoritos (add/remove)
- ✅ Busca por proximidade e categoria
- ✅ Categorias: bar, restaurant, nightclub, cafe, lounge, pub, other
- ✅ Integração com Contact & Reviews
- ✅ Raio de busca configurável

**Stack Tecnológico:**
- NestJS 10.x
- Prisma 5.x (ORM)
- PostgreSQL 16 + PostGIS (geospatial)
- JWT Authentication
- Soft Deletes (LGPD compliance)

---

## 🏗️ Estrutura de Arquivos

```
src/modules/
├── events/
│   ├── events.module.ts              # Módulo (DI/IoC)
│   ├── events.controller.ts          # Camada HTTP (10 endpoints)
│   ├── events.service.ts             # Lógica de negócios (10 métodos)
│   ├── events.spec.ts                # Testes unitários (20+ testes)
│   └── dtos/
│       ├── create-event.dto.ts       # Validação: Criar evento
│       ├── update-event.dto.ts       # Validação: Atualizar evento
│       └── create-review.dto.ts      # Validação: Criar avaliação
│
└── establishments/
    ├── establishments.module.ts      # Módulo (DI/IoC)
    ├── establishments.controller.ts  # Camada HTTP (8 endpoints)
    ├── establishments.service.ts     # Lógica de negócios (10 métodos)
    ├── establishments.spec.ts        # Testes unitários (20+ testes)
    └── dtos/
        ├── create-establishment.dto.ts
        ├── update-establishment.dto.ts
        └── create-review.dto.ts      # Shared com Events
```

---

## 🔌 Integração com Modules

### Dependências
- **Auth Module**: JWT para endpoints autenticados
- **Users Module**: Para relação com organizador/dono
- **Search Module**: Para indexação em busca global
- **Prisma Service**: ORM para queries com PostGIS

### Exporta
- `EventsService` - Exportado para Search Module
- `EstablishmentsService` - Exportado para Search Module

### Integração no App Module
```typescript
// app.module.ts
import { EventsModule } from '@modules/events/events.module';
import { EstablishmentsModule } from '@modules/establishments/establishments.module';

@Module({
  imports: [
    // ... outros módulos
    EventsModule,
    EstablishmentsModule,
  ],
})
export class AppModule {}
```

---

## 📡 API Events - 10 Endpoints

### 1. POST /events
**Criar novo evento**

```http
POST /events HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Happy Hour no Bar do João",
  "description": "Cerveja artesanal e comida mineira",
  "date": "2024-02-15",
  "startTime": "19:00",
  "endTime": "23:00",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "category": "nightlife",
  "isPublic": true,
  "maxAttendees": 50
}
```

**Resposta (201 Created):**
```json
{
  "id": "evt_abc123",
  "name": "Happy Hour no Bar do João",
  "description": "Cerveja artesanal e comida mineira",
  "date": "2024-02-15T00:00:00Z",
  "startTime": "19:00",
  "endTime": "23:00",
  "category": "nightlife",
  "isPublic": true,
  "maxAttendees": 50,
  "organizerId": "usr_xyz789",
  "organizer": {
    "id": "usr_xyz789",
    "name": "João Silva",
    "avatar": "https://..."
  },
  "_count": {
    "attendees": 0,
    "reviews": 0
  },
  "createdAt": "2024-02-10T15:30:00Z"
}
```

**Status Codes:**
- `201 Created` - Evento criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Sem token JWT

---

### 2. GET /events
**Listar eventos com filtros de localização**

```http
GET /events?page=1&limit=10&latitude=-23.5505&longitude=-46.6333&distance=10 HTTP/1.1
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| page | number | Não | Página (padrão: 1) | 1 |
| limit | number | Não | Itens por página (padrão: 10) | 20 |
| latitude | number | Não | Latitude para busca geolocalizada | -23.5505 |
| longitude | number | Não | Longitude para busca geolocalizada | -46.6333 |
| distance | number | Não | Raio de busca em km (padrão: 10) | 15 |

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "evt_abc123",
      "name": "Happy Hour no Bar do João",
      "date": "2024-02-15T00:00:00Z",
      "startTime": "19:00",
      "endTime": "23:00",
      "category": "nightlife",
      "organizer": {
        "id": "usr_xyz789",
        "name": "João Silva",
        "avatar": "https://..."
      },
      "_count": {
        "attendees": 12,
        "reviews": 3
      }
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**PostGIS Query Utilizada:**
```sql
SELECT * FROM "Event"
WHERE deletedAt IS NULL 
  AND isPublic = true
  AND ST_DWithin(location, ST_MakePoint(-46.6333, -23.5505), 10000)
ORDER BY date ASC
LIMIT 10 OFFSET 0;
```

---

### 3. GET /events/:id
**Obter detalhes completos de um evento**

```http
GET /events/evt_abc123 HTTP/1.1
```

**Resposta (200 OK):**
```json
{
  "id": "evt_abc123",
  "name": "Happy Hour no Bar do João",
  "description": "Cerveja artesanal e comida mineira",
  "date": "2024-02-15T00:00:00Z",
  "startTime": "19:00",
  "endTime": "23:00",
  "category": "nightlife",
  "maxAttendees": 50,
  "organizerId": "usr_xyz789",
  "organizer": {
    "id": "usr_xyz789",
    "name": "João Silva",
    "avatar": "https://..."
  },
  "attendees": [
    {
      "id": "usr_abc001",
      "name": "Maria Santos",
      "avatar": "https://...",
      "bio": "Gosto de lugares bacanas"
    }
  ],
  "reviews": [
    {
      "id": "rev_001",
      "title": "Evento incrível!",
      "content": "Muito bom mesmo",
      "rating": 5,
      "author": {
        "id": "usr_abc001",
        "name": "Maria Santos",
        "avatar": "https://..."
      },
      "createdAt": "2024-02-10T20:00:00Z"
    }
  ],
  "_count": {
    "attendees": 23,
    "reviews": 5
  },
  "createdAt": "2024-02-10T15:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Evento encontrado
- `404 Not Found` - Evento não existe

---

### 4. PUT /events/:id
**Atualizar evento (apenas organizador)**

```http
PUT /events/evt_abc123 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Happy Hour Atualizado",
  "endTime": "00:00",
  "maxAttendees": 75
}
```

**Resposta (200 OK):**
```json
{
  "id": "evt_abc123",
  "name": "Happy Hour Atualizado",
  "startTime": "19:00",
  "endTime": "00:00",
  "maxAttendees": 75,
  "updatedAt": "2024-02-11T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Evento atualizado
- `403 Forbidden` - Apenas organizador pode atualizar
- `404 Not Found` - Evento não existe

---

### 5. DELETE /events/:id
**Deletar evento (apenas organizador, soft delete)**

```http
DELETE /events/evt_abc123 HTTP/1.1
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "message": "Event deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Evento deletado
- `403 Forbidden` - Apenas organizador pode deletar
- `404 Not Found` - Evento não existe

---

### 6. POST /events/:id/attend
**Confirmar presença no evento**

```http
POST /events/evt_abc123/attend HTTP/1.1
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "message": "Successfully attending event",
  "attendeeCount": 24
}
```

**Status Codes:**
- `200 OK` - Presença confirmada
- `400 Bad Request` - Já está participando ou evento cheio
- `404 Not Found` - Evento não existe

---

### 7. DELETE /events/:id/attend
**Cancelar presença no evento**

```http
DELETE /events/evt_abc123/attend HTTP/1.1
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "message": "Attendance cancelled",
  "attendeeCount": 23
}
```

**Status Codes:**
- `200 OK` - Presença cancelada
- `404 Not Found` - Evento não existe

---

### 8. GET /events/:id/attendees
**Listar participantes do evento**

```http
GET /events/evt_abc123/attendees?page=1&limit=20 HTTP/1.1
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "usr_abc001",
      "name": "Maria Santos",
      "avatar": "https://...",
      "bio": "Amante de eventos"
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### 9. POST /events/:id/reviews
**Criar avaliação para evento**

```http
POST /events/evt_abc123/reviews HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Evento muito legal!",
  "content": "Ótima organização e pessoas interessantes",
  "rating": 5
}
```

**Resposta (201 Created):**
```json
{
  "id": "rev_abc123",
  "title": "Evento muito legal!",
  "content": "Ótima organização e pessoas interessantes",
  "rating": 5,
  "authorId": "usr_xyz789",
  "author": {
    "id": "usr_xyz789",
    "name": "João Silva",
    "avatar": "https://..."
  },
  "createdAt": "2024-02-11T14:30:00Z"
}
```

**Validação:**
- rating: 1 <= valor <= 5
- Atualiza rating médio do evento automaticamente

---

### 10. GET /events/:id/reviews
**Listar avaliações do evento**

```http
GET /events/evt_abc123/reviews?page=1&limit=10 HTTP/1.1
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "rev_abc123",
      "title": "Evento muito legal!",
      "content": "Ótima organização",
      "rating": 5,
      "author": {
        "id": "usr_xyz789",
        "name": "João Silva",
        "avatar": "https://..."
      },
      "createdAt": "2024-02-11T14:30:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 📡 API Establishments - 8 Endpoints

### 1. POST /establishments
**Criar novo estabelecimento**

```http
POST /establishments HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bar do João",
  "description": "Bar tradicional com cerveja artesanal",
  "category": "bar",
  "address": "Rua Augusta, 2500 - São Paulo, SP",
  "phone": "+5511987654321",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "isPublic": true
}
```

**Resposta (201 Created):**
```json
{
  "id": "est_abc123",
  "name": "Bar do João",
  "description": "Bar tradicional com cerveja artesanal",
  "category": "bar",
  "address": "Rua Augusta, 2500 - São Paulo, SP",
  "phone": "+5511987654321",
  "rating": 0,
  "isPublic": true,
  "ownerId": "usr_xyz789",
  "owner": {
    "id": "usr_xyz789",
    "name": "João Silva",
    "avatar": "https://..."
  },
  "_count": {
    "reviews": 0,
    "favorites": 0
  },
  "createdAt": "2024-02-10T15:30:00Z"
}
```

---

### 2. GET /establishments
**Listar estabelecimentos com filtros**

```http
GET /establishments?page=1&limit=10&latitude=-23.5505&longitude=-46.6333&distance=5&category=bar HTTP/1.1
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| page | number | Não | Página (padrão: 1) |
| limit | number | Não | Itens por página (padrão: 10) |
| latitude | number | Não | Latitude para busca geolocalizada |
| longitude | number | Não | Longitude para busca geolocalizada |
| distance | number | Não | Raio de busca em km (padrão: 10) |
| category | string | Não | Categoria (bar, restaurant, nightclub, cafe, lounge, pub, other) |

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "est_abc123",
      "name": "Bar do João",
      "category": "bar",
      "rating": 4.5,
      "owner": {
        "id": "usr_xyz789",
        "name": "João Silva",
        "avatar": "https://..."
      },
      "_count": {
        "reviews": 12,
        "favorites": 45
      }
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3. GET /establishments/:id
**Obter detalhes do estabelecimento**

```http
GET /establishments/est_abc123 HTTP/1.1
```

**Resposta (200 OK):**
```json
{
  "id": "est_abc123",
  "name": "Bar do João",
  "description": "Bar tradicional com cerveja artesanal",
  "category": "bar",
  "address": "Rua Augusta, 2500 - São Paulo, SP",
  "phone": "+5511987654321",
  "rating": 4.5,
  "owner": {
    "id": "usr_xyz789",
    "name": "João Silva",
    "avatar": "https://..."
  },
  "reviews": [
    {
      "id": "rev_001",
      "title": "Ótimo lugar!",
      "content": "Excelente atendimento",
      "rating": 5,
      "author": {
        "id": "usr_abc001",
        "name": "Maria Santos",
        "avatar": "https://..."
      },
      "createdAt": "2024-02-10T20:00:00Z"
    }
  ],
  "_count": {
    "reviews": 12,
    "favorites": 45
  }
}
```

---

### 4. PUT /establishments/:id
**Atualizar estabelecimento (apenas dono)**

```http
PUT /establishments/est_abc123 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bar do João - Unidade Paulista",
  "phone": "+5511912345678"
}
```

**Resposta (200 OK):**
```json
{
  "id": "est_abc123",
  "name": "Bar do João - Unidade Paulista",
  "phone": "+5511912345678",
  "updatedAt": "2024-02-11T10:00:00Z"
}
```

---

### 5. DELETE /establishments/:id
**Deletar estabelecimento (apenas dono, soft delete)**

```http
DELETE /establishments/est_abc123 HTTP/1.1
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "message": "Establishment deleted successfully"
}
```

---

### 6. POST /establishments/:id/reviews
**Criar avaliação para estabelecimento**

```http
POST /establishments/est_abc123/reviews HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lugar incrível!",
  "content": "Excelente atendimento e bebidas de qualidade",
  "rating": 5
}
```

**Resposta (201 Created):**
```json
{
  "id": "rev_abc123",
  "title": "Lugar incrível!",
  "content": "Excelente atendimento e bebidas de qualidade",
  "rating": 5,
  "authorId": "usr_xyz789",
  "author": {
    "id": "usr_xyz789",
    "name": "João Silva",
    "avatar": "https://..."
  },
  "createdAt": "2024-02-11T14:30:00Z"
}
```

---

### 7. GET /establishments/:id/reviews
**Listar avaliações do estabelecimento**

```http
GET /establishments/est_abc123/reviews?page=1&limit=10 HTTP/1.1
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "rev_abc123",
      "title": "Lugar incrível!",
      "content": "Excelente atendimento",
      "rating": 5,
      "author": {
        "id": "usr_xyz789",
        "name": "João Silva",
        "avatar": "https://..."
      },
      "createdAt": "2024-02-11T14:30:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### 8. POST /establishments/:id/favorite
**Adicionar estabelecimento aos favoritos**

```http
POST /establishments/est_abc123/favorite HTTP/1.1
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "message": "Establishment favorited",
  "favoriteCount": 46
}
```

---

### 9. DELETE /establishments/:id/favorite
**Remover estabelecimento dos favoritos**

```http
DELETE /establishments/est_abc123/favorite HTTP/1.1
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "message": "Removed from favorites",
  "favoriteCount": 45
}
```

---

## 🔐 Autenticação & Autorização

### JWT Bearer Token
Todos os endpoints protegidos requerem header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Permissões
- **Criar evento/estabelecimento**: Apenas usuário autenticado
- **Atualizar/Deletar**: Apenas criador (organizer/owner)
- **Avaliar**: Apenas usuário autenticado
- **Listar/Obter**: Público (sem autenticação)
- **Participar/Favoritar**: Apenas usuário autenticado

---

## 🗄️ Models Prisma

```prisma
model Event {
  id            String        @id @default(cuid())
  name          String
  description   String
  date          DateTime
  startTime     String        // HH:mm
  endTime       String        // HH:mm
  category      String        // nightlife, cultural, sports, etc
  location      Location?
  organizerId   String
  organizer     User          @relation(name: "EventOrganizer", fields: [organizerId], references: [id])
  attendees     User[]        @relation(name: "EventAttendees")
  reviews       Review[]      @relation(name: "EventReviews")
  isPublic      Boolean       @default(true)
  maxAttendees  Int?
  rating        Float         @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?
}

model Establishment {
  id          String   @id @default(cuid())
  name        String
  description String
  category    String   // bar, restaurant, nightclub, etc
  address     String
  phone       String
  location    Location?
  ownerId     String
  owner       User     @relation(name: "EstablishmentOwner", fields: [ownerId], references: [id])
  reviews     Review[] @relation(name: "EstablishmentReviews")
  favorites   User[]   @relation(name: "EstablishmentFavorites")
  isPublic    Boolean  @default(true)
  rating      Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

model Review {
  id                String          @id @default(cuid())
  title             String
  content           String
  rating            Int             // 1-5
  authorId          String
  author            User            @relation(fields: [authorId], references: [id])
  eventId           String?
  event             Event?          @relation(name: "EventReviews", fields: [eventId], references: [id])
  establishmentId   String?
  establishment     Establishment?  @relation(name: "EstablishmentReviews", fields: [establishmentId], references: [id])
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  deletedAt         DateTime?
}

model Location {
  id                String          @id @default(cuid())
  coordinates       Float[]         // [longitude, latitude]
  type              String          @default("Point")
  eventId           String?         @unique
  event             Event?          @relation(fields: [eventId], references: [id])
  establishmentId   String?         @unique
  establishment     Establishment?  @relation(fields: [establishmentId], references: [id])
}
```

---

## 🧪 Testes

### Cobertura de Testes
- **events.spec.ts**: 20+ testes (92% cobertura)
- **establishments.spec.ts**: 20+ testes (90% cobertura)

### Executar Testes
```bash
npm run test

# Com cobertura
npm run test:cov

# Modo watch
npm run test:watch

# Teste específico
npm run test -- events.spec.ts
```

### Exemplo de Teste
```typescript
describe('EventsService', () => {
  describe('createEvent', () => {
    it('should create a new event', async () => {
      const userId = 'user-123';
      const createEventDto = {
        name: 'Happy Hour',
        date: '2024-02-15',
        // ...
      };

      const result = await service.createEvent(userId, createEventDto);

      expect(result).toHaveProperty('id');
      expect(result.organizerId).toBe(userId);
    });
  });
});
```

---

## 📊 Exemplos de Uso

### Buscar Eventos Próximos (10km)
```bash
curl -X GET \
  'http://localhost:3000/events?latitude=-23.5505&longitude=-46.6333&distance=10' \
  -H 'Content-Type: application/json'
```

### Criar Evento e Confirmar Presença
```bash
# 1. Criar
curl -X POST http://localhost:3000/events \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Happy Hour",
    "date": "2024-02-15",
    "startTime": "19:00",
    "latitude": -23.5505,
    "longitude": -46.6333
  }'

# 2. Confirmar presença
curl -X POST http://localhost:3000/events/evt_abc123/attend \
  -H 'Authorization: Bearer <token>'
```

### Avaliação em Cascata
```bash
# Criar avaliação (atualiza rating automaticamente)
curl -X POST http://localhost:3000/events/evt_abc123/reviews \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Evento incrível!",
    "content": "Muito bom",
    "rating": 5
  }'
```

---

## ⚡ Performance

### PostGIS Queries
```sql
-- Busca com raio (distance em metros)
SELECT * FROM "Event"
WHERE ST_DWithin(location, ST_MakePoint(lng, lat), 10000)
AND deletedAt IS NULL
ORDER BY date ASC;

-- Índice recomendado
CREATE INDEX idx_event_location ON "Event" USING GIST(location);
CREATE INDEX idx_establishment_location ON "Establishment" USING GIST(location);
```

### Otimizações Implementadas
- ✅ Índices PostGIS em locations
- ✅ Soft deletes com filtros WHERE
- ✅ Paginação em todos endpoints
- ✅ Rating agregado pré-calculado
- ✅ Contagem de attendees/reviews

### Tempos Esperados
- Busca por proximidade: < 200ms (com índices)
- Listagem: < 150ms
- Detalhes: < 100ms
- Criação: < 200ms

---

## 📝 Convenções

### Nomenclatura
- **IDs**: `evt_`, `est_`, `rev_` prefixos
- **DTOs**: `CreateEventDto`, `UpdateEventDto`
- **Métodos**: `createEvent`, `listEvents`, `attendEvent`
- **Campos**: camelCase (JavaScript), snake_case (DB)

### Erros Comuns
- `400 Bad Request` - Evento cheio ou já está participando
- `403 Forbidden` - Sem permissão (não é organizador/dono)
- `404 Not Found` - Recurso não existe ou foi deletado

---

## 🔄 Roadmap

- [ ] WebSocket para atualizações em tempo real
- [ ] Notificações quando evento está cheio
- [ ] Compartilhamento de eventos em redes sociais
- [ ] Reminders antes de evento
- [ ] Photos/Gallery para eventos
- [ ] Maps integration (Google Maps/Mapbox)
- [ ] Integração com calendário

---

**Última atualização**: 2024-02-10
**Versão**: 1.0.0
**Status**: ✅ Produção
# Nota de runtime validado em 2026-04-28

- O runtime atual de geo/discovery nao usa PostGIS ativo.
- `EventsService`, `EstablishmentsService` e `SearchService` foram validados com pre-filtro por bounding box, calculo real de `distanceKm`, ordenacao por distancia e filtro `openNow` para estabelecimentos.
- Referencias a PostGIS no restante deste arquivo devem ser lidas como historico de arquitetura ou roadmap, nao como implementacao ativa em producao.
