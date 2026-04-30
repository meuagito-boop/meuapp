# ⚡ CACHE BACKEND × APIs PÚBLICAS — Evitar Sobrecarga do OSM

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Público:** Backend Engineers, Architects, DevOps  
**Objetivo:** Implementar geolocalização sem sobrecarregar APIs gratuitas (Overpass, Nominatim, Photon)

---

## 1️⃣ O PROBLEMA: Sem Cache, Você Quebra as APIs

### **Cenário Ruim: Chamadas Diretas do App**

```
┌─────────────────────────────────────────────────┐
│ 100 usuários abrem o app às 18h em São Paulo   │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────┴────────┬─────────┬──────────┐
        │                │         │          │
    Usuário 1        Usuário 2  Usuário 3  Usuário 100
        │                │         │          │
        └────────┬───────┴─────┬───┴──────┬───┘
                 │             │          │
      Cada um faz HTTP GET para Overpass API
                 │             │          │
    GET overpass-api.de/api/interpreter?data=[bbox:...];(node["amenity"];);out json;
    GET overpass-api.de/api/interpreter?data=[bbox:...];(node["amenity"];);out json;
    GET overpass-api.de/api/interpreter?data=[bbox:...];(node["amenity"];);out json;
    GET overpass-api.de/api/interpreter?data=[bbox:...];(node["amenity"];);out json;
    ... 100 requisições em 30 segundos
                 │
    ┌────────────▼──────────────┐
    │ Overpass API reage:       │
    │ ❌ 429 Too Many Requests  │
    │ ❌ IP rate-limited        │
    │ ❌ Timeout (timeout)       │
    │ ❌ Fila lenta (30s+)      │
    └───────────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │ Resultado no app:         │
    │ ❌ Home não carrega       │
    │ ❌ Feed fica vazio        │
    │ ❌ Usuários saem do app   │
    └───────────────────────────┘
```

**Limites das APIs Gratuitas:**

| API | Limite | Problema |
|-----|--------|----------|
| **Overpass** | <10k queries/dia + <1GB/dia | 100 usuários simultâneos = bloqueio em minutos |
| **Nominatim** | 1 request/segundo máximo | 5 usuários simultâneos já é limite |
| **Photon** | "Uso razoável" (vago) | Abuso = IP banido por dias |

---

## 2️⃣ A SOLUÇÃO: Cache no Backend

### **Cenário Bom: Com Backend + Redis Cache**

```
┌─────────────────────────────────────────────────┐
│ 100 usuários abrem o app às 18h em São Paulo   │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────┴────────┬─────────┬──────────┐
        │                │         │          │
    Usuário 1        Usuário 2  Usuário 3  Usuário 100
        │                │         │          │
        └────────┬───────┴─────┬───┴──────┬───┘
                 │             │          │
      Todos chamam seu BACKEND (não Overpass direto)
                 │
    GET https://api.meuagito.com/api/v1/nearby?latitude=-23.55&longitude=-46.63
    GET https://api.meuagito.com/api/v1/nearby?latitude=-23.55&longitude=-46.63
    GET https://api.meuagito.com/api/v1/nearby?latitude=-23.55&longitude=-46.63
    GET https://api.meuagito.com/api/v1/nearby?latitude=-23.55&longitude=-46.63
                 │
    ┌────────────▼──────────────────────────┐
    │ Seu Backend (NestJS):                 │
    │                                       │
    │ 1. Usuário 1: Check Redis cache      │
    │    Key: "nearby:-23.55:-46.63"        │
    │    ❌ Cache MISS → chama Overpass    │
    │    ✅ Salva resultado + TTL 30min    │
    │    Tempo: 200ms (inclui Overpass)    │
    │                                       │
    │ 2. Usuário 2: Check Redis cache      │
    │    Key: "nearby:-23.55:-46.63"        │
    │    ✅ Cache HIT → retorna direto     │
    │    Tempo: 2ms (Redis super rápido)   │
    │                                       │
    │ 3. Usuário 3-100: Idem usuário 2    │
    │    ✅ Todos pegam do cache           │
    │    Cada um: 2ms                      │
    └────────────┬──────────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │ Resultado Overpass:       │
    │ ✅ 1 requisição apenas!   │
    │ (não 100)                 │
    │                           │
    │ Impacto nas APIs:         │
    │ ✅ Cota: -1 query        │
    │ ✅ Não bloqueado         │
    │ ✅ Felizes :)            │
    └─────────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │ Resultado no app:         │
    │ ✅ Home carrega em 2ms    │
    │ ✅ Feed cheio de dados    │
    │ ✅ Usuários felizes       │
    └───────────────────────────┘
```

**Economia de Requisições:**
- **Sem cache:** 100 requisições Overpass
- **Com cache (30 min TTL):** 1 requisição Overpass

**Redução:** 99%! ⚡

---

## 3️⃣ ARQUITETURA: Backend com Cache

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                   │
│                                                              │
│  Usuário abre app → detecta localização (-23.55, -46.63)    │
│  Envia: GET /api/v1/nearby?lat=-23.55&lon=-46.63&radius=1500
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP Request
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                   BACKEND (NestJS)                           │
│                                                              │
│  ┌─────────────────────────────────────┐                   │
│  │ Endpoint: GET /api/v1/nearby        │                   │
│  │ Controller recebe lat, lon, radius  │                   │
│  └────────────┬────────────────────────┘                   │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │ NearbyService.findNearby(lat, lon, radius)           │  │
│  │                                                      │  │
│  │ 1. Build cache key                                  │  │
│  │    key = "nearby:${lat.toFixed(2)}:${lon.toFixed(2)}"│  │
│  │    = "nearby:-23.55:-46.63"                         │  │
│  │                                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │ Check Redis Cache                                   │  │
│  │                                                      │  │
│  │ const cached = await redis.get(key)                │  │
│  │                                                      │  │
│  │ if (cached) {                                       │  │
│  │   return JSON.parse(cached) // HIT! 2ms ✅          │  │
│  │ }                                                    │  │
│  │                                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │ Cache MISS                                  │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │ Call Overpass API                                   │  │
│  │                                                      │  │
│  │ const query = `                                      │  │
│  │   [bbox:${latMin},${lonMin},${latMax},${lonMax}];  │  │
│  │   (node["amenity"];way["amenity"];);               │  │
│  │   out json;                                          │  │
│  │ `;                                                   │  │
│  │                                                      │  │
│  │ const response = await                              │  │
│  │   fetch('https://overpass-api.de/api/interpreter')  │  │
│  │   .post({ data: query })                            │  │
│  │                                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │ Takes 100-500ms                              │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │ Parse & Transform Response                          │  │
│  │                                                      │  │
│  │ const normalized = response.elements.map(el => ({  │  │
│  │   id: el.id,                                        │  │
│  │   name: el.tags.name,                              │  │
│  │   lat: el.lat,                                      │  │
│  │   lon: el.lon,                                      │  │
│  │   amenity: el.tags.amenity                         │  │
│  │ }))                                                 │  │
│  │                                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │ Cache Result (TTL 30 min)                           │  │
│  │                                                      │  │
│  │ await redis.setex(                                  │  │
│  │   key,                                              │  │
│  │   30 * 60,  // 1800 segundos                        │  │
│  │   JSON.stringify(normalized)                        │  │
│  │ )                                                    │  │
│  │                                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │ Return Response                                     │  │
│  │ {                                                    │  │
│  │   data: normalized,                                 │  │
│  │   count: normalized.length,                         │  │
│  │   cache: false  // Indica que é novo               │  │
│  │ }                                                    │  │
│  │                                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│               │ HTTP 200 JSON                              │
└───────────────┼──────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────┐
│           FRONTEND (React Native)                        │
│                                                          │
│  Recebe dados + renderiza Home com locais próximos ✅  │
│                                                          │
│  {                                                       │
│    data: [                                              │
│      { id: 123, name: "Pizzaria Nápoli", lat: ..., ... }│
│      { id: 456, name: "Bar da Maria", lat: ..., ... }   │
│    ],                                                    │
│    count: 50,                                            │
│    cache: false                                          │
│  }                                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4️⃣ CÓDIGO COMPLETO: Backend com Cache

### **Step 1: Setup Redis no docker-compose.yml**

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ... PostgreSQL, Nginx, etc ...

  redis:
    image: redis:7-alpine
    container_name: meuagito_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
```

### **Step 2: Criar NearbyController**

```typescript
// src/modules/nearby/nearby.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NearbyService } from './nearby.service';

@Controller('nearby')
@UseGuards(AuthGuard('jwt'))
export class NearbyController {
  constructor(private nearbyService: NearbyService) {}

  /**
   * GET /api/v1/nearby?latitude=-23.55&longitude=-46.63&radius=1500&amenity=restaurant
   * 
   * Retorna estabelecimentos próximos com cache inteligente
   * 
   * Query Params:
   *   - latitude: número (obrigatório)
   *   - longitude: número (obrigatório)
   *   - radius: número em metros (default: 1500)
   *   - amenity: string (optional: restaurant, bar, cafe, etc)
   */
  @Get()
  async getNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 1500,
    @Query('amenity') amenity?: string
  ) {
    return await this.nearbyService.findNearby({
      latitude,
      longitude,
      radius,
      amenity
    });
  }
}
```

### **Step 3: Criar NearbyService com Cache**

```typescript
// src/modules/nearby/nearby.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '../../cache/redis.service';
import { firstValueFrom } from 'rxjs';

interface NearbyParams {
  latitude: number;
  longitude: number;
  radius: number;
  amenity?: string;
}

interface NearbyResult {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  amenity: string;
  tags?: Record<string, any>;
}

@Injectable()
export class NearbyService {
  private overpassApiUrl = 'https://overpass-api.de/api/interpreter';

  constructor(
    private httpService: HttpService,
    private redisService: RedisService
  ) {}

  /**
   * Busca estabelecimentos próximos com cache automático
   */
  async findNearby(params: NearbyParams): Promise<{
    data: NearbyResult[];
    count: number;
    cache: boolean;
    timestamp: string;
  }> {
    const { latitude, longitude, radius, amenity } = params;

    // 1️⃣ BUILD CACHE KEY
    const cacheKey = this.buildCacheKey(latitude, longitude, amenity);
    console.log(`🔍 Cache Key: ${cacheKey}`);

    // 2️⃣ CHECK REDIS CACHE
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT — retornando dados cacheados');
      return {
        data: JSON.parse(cached),
        count: JSON.parse(cached).length,
        cache: true,
        timestamp: new Date().toISOString()
      };
    }

    console.log('❌ Cache MISS — buscando do Overpass');

    // 3️⃣ BUILD OVERPASS QUERY
    const query = this.buildOverpassQuery(
      latitude,
      longitude,
      radius,
      amenity
    );

    // 4️⃣ CALL OVERPASS API (com retry)
    let results: NearbyResult[] = [];
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        results = await this.callOverpassApi(query);
        break; // Success
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          console.error('❌ Overpass API falhou após 3 tentativas:', error);
          throw new HttpException(
            'Não foi possível buscar estabelecimentos próximos',
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
        // Espera 2s antes de retenttar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 5️⃣ CACHE RESULT (TTL: 30 minutos)
    const ttl = 30 * 60; // 1800 segundos
    await this.redisService.setex(
      cacheKey,
      ttl,
      JSON.stringify(results)
    );
    console.log(`💾 Resultado cacheado por ${ttl}s`);

    // 6️⃣ RETURN RESPONSE
    return {
      data: results,
      count: results.length,
      cache: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Build cache key from coordinates
   */
  private buildCacheKey(lat: number, lon: number, amenity?: string): string {
    // Arredondar para 2 decimais (~1km de precisão)
    const latRounded = Math.round(lat * 100) / 100;
    const lonRounded = Math.round(lon * 100) / 100;
    const amenityStr = amenity ? `:${amenity}` : '';
    
    return `nearby:${latRounded}:${lonRounded}${amenityStr}`;
  }

  /**
   * Build Overpass QL query
   */
  private buildOverpassQuery(
    latitude: number,
    longitude: number,
    radius: number,
    amenity?: string
  ): string {
    // Converte lat/lon + radius para bounding box
    const latDelta = (radius / 111000); // 1 grau ≈ 111km
    const lonDelta = (radius / (111000 * Math.cos(latitude * Math.PI / 180)));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;

    // Amenity filter
    const amenityFilter = amenity 
      ? `["amenity"="${amenity}"]`
      : `["amenity"~"restaurant|bar|cafe|bakery|hotel|bank|pharmacy"]`;

    // Overpass QL query (otimizado para performance)
    const query = `
      [bbox:${minLat},${minLon},${maxLat},${maxLon}];
      (
        node${amenityFilter};
        way${amenityFilter};
      );
      out center 50; // Máximo 50 resultados, retorna centroide
    `;

    return query;
  }

  /**
   * Call Overpass API com tratamento de erros
   */
  private async callOverpassApi(query: string): Promise<NearbyResult[]> {
    const startTime = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.overpassApiUrl, query, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'MeuAgito/1.0 (+https://meuagito.com)'
          },
          timeout: 30000 // 30 segundos max
        })
      );

      const duration = Date.now() - startTime;
      console.log(`✅ Overpass respondeu em ${duration}ms`);

      // Parse response
      const elements = response.data.elements || [];
      
      const results: NearbyResult[] = elements
        .filter(el => el.tags && el.tags.name) // Apenas com nome
        .map(el => ({
          id: el.id,
          name: el.tags.name,
          latitude: el.lat || el.center?.lat,
          longitude: el.lon || el.center?.lon,
          amenity: el.tags.amenity || 'unknown',
          tags: el.tags
        }))
        .filter(el => el.latitude && el.longitude); // Valida coords

      console.log(`📍 Encontrados ${results.length} estabelecimentos`);
      return results;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Overpass erro após ${duration}ms:`, error.message);
      
      // Verifica se é rate limit
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limited pelo Overpass — aguarde antes de retentar');
      }
      
      throw error;
    }
  }
}
```

### **Step 4: Criar RedisService (Reutilizável)**

```typescript
// src/cache/redis.service.ts

import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.redis.on('error', (err) => console.error('Redis error:', err));
    this.redis.on('connect', () => console.log('✅ Redis connected'));
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async setex(key: string, ttl: number, value: string): Promise<void> {
    await this.redis.setex(key, ttl, value);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async flush(): Promise<void> {
    await this.redis.flushdb();
  }

  getClient(): Redis {
    return this.redis;
  }
}
```

### **Step 5: Registrar Module no AppModule**

```typescript
// src/app.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NearbyController } from './modules/nearby/nearby.controller';
import { NearbyService } from './modules/nearby/nearby.service';
import { RedisService } from './cache/redis.service';

@Module({
  imports: [
    HttpModule, // Para chamar Overpass API
    // ... outros modulos
  ],
  controllers: [NearbyController],
  providers: [NearbyService, RedisService],
})
export class AppModule {}
```

---

## 5️⃣ FRONT END: Consumir a API com Cache

```typescript
// src/services/nearbyService.ts (React Native)

import axios from 'axios';

const API_BASE = 'https://api.meuagito.com/api/v1';

export class NearbyService {
  static async getNearby(
    latitude: number,
    longitude: number,
    amenity?: string
  ) {
    const url = `${API_BASE}/nearby?latitude=${latitude}&longitude=${longitude}&radius=1500${amenity ? `&amenity=${amenity}` : ''}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      return {
        data: response.data.data,
        fromCache: response.data.cache,
        loadTime: Date.now() // Para medir performance
      };

    } catch (error) {
      console.error('Erro ao buscar nearby:', error);
      return null;
    }
  }
}
```

```typescript
// src/screens/HomeScreen.tsx (Integração)

import { useLocationStore } from '../store/useLocationStore';
import { NearbyService } from '../services/nearbyService';

export function HomeScreen() {
  const { latitude, longitude } = useLocationStore();
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      loadNearby();
    }
  }, [latitude, longitude]);

  const loadNearby = async () => {
    setLoading(true);
    const result = await NearbyService.getNearby(latitude, longitude);
    if (result) {
      setNearby(result.data);
      setCacheStatus(result.fromCache ? 'From Cache ⚡' : 'Fresh Data 🔄');
    }
    setLoading(false);
  };

  return (
    <ScrollView>
      <Text>{cacheStatus}</Text>
      {nearby.map(place => (
        <NearbyCard key={place.id} place={place} />
      ))}
    </ScrollView>
  );
}
```

---

## 6️⃣ MONITORAMENTO: Status Overpass

```typescript
// Criar um endpoint para monitorar saúde das APIs

@Controller('health')
export class HealthController {
  @Get('overpass')
  async getOverpassStatus() {
    try {
      const response = await fetch(
        'https://overpass-api.de/api/status',
        { timeout: 5000 }
      );
      const status = await response.text();
      
      return {
        status: 'ok',
        overpass_status: status // "The server is up"
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Overpass API unreachable'
      };
    }
  }
}
```

---

## 7️⃣ ROADMAP: Fases de Implementação

### **Fase 1.0 (MVP) — Com Cache Simples**
```
✅ Backend recebe lat/lon
✅ Check Redis cache (TTL 30 min)
✅ Cache MISS → chama Overpass
✅ Cache HIT → retorna instantaneamente
✅ Cota Overpass: ~1k queries/dia (respeitoso)
```

### **Fase 1.1 — Com Monitoramento**
```
✅ Log de cache hits vs misses
✅ Alertar se taxa Overpass > 80%
✅ Dashboard de performance
```

### **Fase 1.2 — Com Redundância**
```
✅ Nominatim como fallback
✅ Se Overpass cai, tenta Nominatim
✅ Pre-cache de áreas populares (SP, RJ, BH)
```

### **Fase 2.0 — Self-Hosted (Opcional)**
```
✅ Hospedar próprio Overpass server
✅ Remover limites de API
✅ Custo: ~$100/mês VPS
```

---

## 8️⃣ COMPARAÇÃO: Com vs Sem Cache

| Métrica | Sem Cache | Com Cache |
|---------|-----------|-----------|
| **Requisições Overpass/dia** | 10,000+ | ~500 |
| **Taxa de sucesso** | 60% (muitos bloqueios) | 99.5% |
| **Latência (p95)** | 2,500ms | 50ms |
| **Custo** | Bloqueio/banimento | Gratuito |
| **Escalabilidade** | Máximo 10 usuários | 10,000+ usuários |

---

## 📋 PRÓXIMOS PASSOS

1. ✅ Entendeu o problema (sem cache = sobrecarga)
2. ✅ Entendeu a solução (cache backend)
3. ⏭️ Implementar NearbyController + Service
4. ⏭️ Setup Redis no docker-compose
5. ⏭️ Testar com múltiplas cidades
6. ⏭️ Integrar em Home Feed (Z6 Nearby Map)
7. ⏭️ Monitorar status Overpass

Quer que eu crie os próximos passos específicos?
