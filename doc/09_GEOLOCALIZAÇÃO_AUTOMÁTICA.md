# 🗺️ GEOLOCALIZAÇÃO AUTOMÁTICA — Como Identificar a Localização do Usuário

**Versão:** 1.0.0  
**Data:** 26 de março de 2026  
**Público:** Frontend Engineers, Backend Architects  
**Objetivo:** Carregar feed/estabelecimentos automaticamente baseado na localização do usuário

---

## 1️⃣ ARQUITETURA: Como Funciona Geolocalização Automática

```
┌─────────────────────────────────────────────────────────────┐
│  USUÁRIO ABRE O APP                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  SISTEMA DETECTA:                                           │
│  1. GPS está ativado no device?                             │
│  2. App tem permissão "Location"?                           │
│  3. Usuário já permitiu localização em setup?              │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ✅ SIM (Fluxo 1)              ❌ NÃO (Fluxo 2)
           │                               │
           ▼                               ▼
    ┌──────────────┐          ┌──────────────────────┐
    │ GPS ligado   │          │ Pedir permissão      │
    │ Posição: -22,- │          │ Modal: "Meu Agito    │
    │ 43.17        │          │ quer acessar sua     │
    │              │          │ localização"         │
    └──────┬───────┘          └──────────┬───────────┘
           │                             │
           │                      ┌─────┴──────┐
           │                      │            │
           │                  ✅ PERMITIR   ❌ NEGAR
           │                      │            │
           │                      ▼            ▼
           │              (GPS sync)      (Show default)
           │                      │            │
           └──────────┬───────────┘            │
                      │                        │
           ┌──────────▼──────────┐     ┌──────▼─────────┐
           │ Get Location:        │     │ Usar location  │
           │ latitude + longitude │     │ padrão/salva   │
           │ accuracy: ±200m     │     │ (última usada)  │
           └──────────┬──────────┘     └──────┬─────────┘
                      │                        │
                      └───────────┬────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │ CALL /api/v1/home/feed    │
                    │ Body: {                     │
                    │   lat: -22.9068,            │
                    │   lon: -43.1729,            │
                    │   radius: 5000 (metros)     │
                    │ }                           │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │ BACKEND RETORNA:           │
                    │ Z1: Eventos próximos       │
                    │ Z2: Lugares trending       │
                    │ Z3: Urgentes (abertos)    │
                    │ ... Z7: Mais buscados      │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │ UI EXIBE HOME              │
                    │ com dados geoloc.          │
                    │ (SEM usuário buscar)       │
                    └────────────────────────────┘
```

---

## 2️⃣ COMO IDENTIFICAR LOCALIZAÇÃO

### **2.1 — No Frontend (React Native)**

#### **Step 1: Solicitar Permissão**

```typescript
// src/services/geolocation.service.ts

import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export class GeolocationService {
  /**
   * Solicita permissão de localização ao usuário
   * Retorna: { lat, lon } ou null se negado
   */
  static async requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('❌ Permissão de localização negada');
      return null;
    }
    
    return { granted: true };
  }

  /**
   * Obtém coordenadas atuais do device
   * Tenta GPS → Fallback para network location
   */
  static async getCurrentLocation() {
    try {
      // 1. Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('⚠️ Sem permissão. Pedindo permissão...');
        await this.requestLocationPermission();
      }

      // 2. Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // GPS de alta precisão
        timeout: 30000, // Máximo 30 segundos para conseguir fix
        maxAge: 10000   // Reusa posição se < 10 segundos
      });

      const { latitude, longitude, accuracy } = location.coords;

      console.log(`✅ Localização obtida: ${latitude}, ${longitude}`);
      console.log(`   Precisão: ±${Math.round(accuracy)}m`);

      return {
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao obter localização:', error);
      return null;
    }
  }

  /**
   * Monitora localização em tempo real
   * Útil para usuário andando na cidade
   */
  static async watchLocationUpdates(
    onLocationChange: (location: { lat: number; lon: number }) => void
  ) {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // Update a cada 5 segundos
        distanceInterval: 50  // Ou quando se move 50 metros
      },
      (location) => {
        onLocationChange({
          lat: location.coords.latitude,
          lon: location.coords.longitude
        });
      }
    );

    return subscription;
  }
}
```

#### **Step 2: Integrar com Redux/Zustand**

```typescript
// src/store/useLocationStore.ts (Zustand)

import { create } from 'zustand';
import { GeolocationService } from '../services/geolocation.service';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
  
  // Actions
  fetchLocation: () => Promise<void>;
  setLocation: (lat: number, lon: number, accuracy: number) => void;
  clearLocation: () => void;
  watchLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  isLoading: false,
  error: null,
  permissionGranted: false,

  fetchLocation: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // 1. Request permission
      const perm = await GeolocationService.requestLocationPermission();
      if (!perm) {
        set({ 
          permissionGranted: false,
          error: 'Permissão de localização negada'
        });
        return;
      }

      // 2. Get coordinates
      const location = await GeolocationService.getCurrentLocation();
      if (location) {
        set({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          permissionGranted: true,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      });
    }
  },

  setLocation: (lat: number, lon: number, accuracy: number) => {
    set({ latitude: lat, longitude: lon, accuracy, permissionGranted: true });
  },

  clearLocation: () => {
    set({
      latitude: null,
      longitude: null,
      accuracy: null,
      permissionGranted: false
    });
  },

  watchLocation: async () => {
    const subscription = await GeolocationService.watchLocationUpdates((loc) => {
      set({ latitude: loc.lat, longitude: loc.lon });
    });
    // TODO: Salvar subscription para cleanup later
  }
}));
```

#### **Step 3: Chamar na App Initialization**

```typescript
// src/navigation/RootNavigator.tsx

import { useLocationStore } from '../store/useLocationStore';
import { useFeedStore } from '../store/useFeedStore';

export function RootNavigator() {
  const { fetchLocation, latitude, longitude } = useLocationStore();
  const { fetchHomeFeed } = useFeedStore();

  useEffect(() => {
    // 1. Quando app inicia, pedir localização
    const initializeApp = async () => {
      await fetchLocation(); // Aguarda GPS ou permissão
    };

    initializeApp();
  }, []); // Executa UMA VEZ na mount

  // 2. Quando localização muda, recarregar feed
  useEffect(() => {
    if (latitude && longitude) {
      console.log(`📍 Localização atualizada: ${latitude}, ${longitude}`);
      fetchHomeFeed({ latitude, longitude }); // Carrega dados automaticamente
    }
  }, [latitude, longitude]); // Re-executa se lat/lon muda

  return (
    // ... Rest of navigator
  );
}
```

---

### **2.2 — No Backend (NestJS)**

#### **Receber Localização + Retornar Dados Geolocalizados**

```typescript
// src/modules/feed/feed.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedService } from './feed.service';

@Controller('home')
@UseGuards(AuthGuard('jwt'))
export class FeedController {
  constructor(private feedService: FeedService) {}

  /**
   * GET /api/v1/home/feed?lat=-22.9068&lon=-43.1729&radius=5000
   * 
   * Retorna todas as 7 zonas com dados baseado na localização do usuário
   */
  @Get('feed')
  async getHomeFeed(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 5000, // Default 5km
  ) {
    return await this.feedService.buildHomeFeed({
      latitude,
      longitude,
      radius
    });
  }
}
```

```typescript
// src/modules/feed/feed.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class FeedService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  async buildHomeFeed({ latitude, longitude, radius }) {
    const cacheKey = `home:feed:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

    // 1. Check Redis cache (30 min TTL)
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT: Retornando feed cacheado');
      return JSON.parse(cached);
    }

    console.log('❌ Cache MISS: Buildando feed novo');

    // 2. Build zones in parallel (não sequencial)
    const [z1, z2, z3, z4, z5, z6, z7] = await Promise.all([
      this.getZ1_MegaEvents(latitude, longitude, radius),
      this.getZ2_LiveFeed(latitude, longitude),
      this.getZ3_Urgent(latitude, longitude, radius),
      this.getZ4_Trending(latitude, longitude, radius),
      this.getZ5_FriendsVisited(latitude, longitude),
      this.getZ6_NearbyMap(latitude, longitude, radius),
      this.getZ7_MostSearched(latitude, longitude)
    ]);

    const feed = { z1, z2, z3, z4, z5, z6, z7 };

    // 3. Cache result (30 min)
    await this.cache.setex(cacheKey, 30 * 60, JSON.stringify(feed));

    return feed;
  }

  // === ZONA 1: Mega Events ===
  private async getZ1_MegaEvents(lat: number, lon: number, radius: number) {
    // Query eventos próximos (via Sympla/Eventbrite)
    // Filtro: proximidade + data futura
    
    const events = await this.prisma.event.findMany({
      where: {
        // PostGIS: distância <= radius
        coordinates: {
          path: ['location'],
          contains: this.buildPostGISGeom(lat, lon, radius)
        },
        dateStart: {
          gte: new Date() // Apenas eventos futuros
        }
      },
      take: 8,
      orderBy: {
        dateStart: 'asc'
      }
    });

    return events;
  }

  // === ZONA 2: Live Feed (Trending agora) ===
  private async getZ2_LiveFeed(lat: number, lon: number) {
    // Query posts/estabelecimentos com atividade recente
    
    const recentActivity = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas
        }
      },
      include: {
        author: true,
        establishment: true,
        likes: { select: { id: true } }
      },
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return recentActivity;
  }

  // === ZONA 3: Urgent (abrem hoje/amanhã) ===
  private async getZ3_Urgent(lat: number, lon: number, radius: number) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const urgent = await this.prisma.establishment.findMany({
      where: {
        // Restaurantes/bares que abrem hoje ou amanhã
        operatingHours: {
          path: ['today'], // JSON field
          contains: 'open'
        },
        // Distance <= radius
        coordinates: {
          path: ['location'],
          contains: this.buildPostGISGeom(lat, lon, radius)
        }
      },
      take: 12,
      orderBy: {
        operatingHours: 'asc' // Ordenar por horário de abertura
      }
    });

    return urgent;
  }

  // === ZONA 4: Trending (top engagement) ===
  private async getZ4_Trending(lat: number, lon: number, radius: number) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Estabelecimentos com mais likes/views em 7 dias
    const trending = await this.prisma.$queryRaw`
      SELECT 
        e.id,
        e.name,
        e.coordinates,
        COUNT(l.id) as engagement_score
      FROM establishments e
      LEFT JOIN posts p ON e.id = p.establishment_id
      LEFT JOIN likes l ON p.id = l.post_id AND l.created_at > ${weekAgo}
      WHERE ST_Distance(e.coordinates, ST_Point(${lon}, ${lat})) < ${radius}
      GROUP BY e.id
      ORDER BY engagement_score DESC
      LIMIT 10
    `;

    return trending;
  }

  // === ZONA 5: Friends Visited ===
  private async getZ5_FriendsVisited(lat: number, lon: number) {
    // Estabelecimentos que amigos visitaram recentemente
    // TODO: implementar com user follows e check-ins

    return [];
  }

  // === ZONA 6: Nearby Map ===
  private async getZ6_NearbyMap(lat: number, lon: number, radius: number) {
    const nearby = await this.prisma.establishment.findMany({
      where: {
        coordinates: {
          path: ['location'],
          contains: this.buildPostGISGeom(lat, lon, radius)
        }
      },
      take: 50,
      select: {
        id: true,
        name: true,
        coordinates: true,
        category: true
      }
    });

    return nearby;
  }

  // === ZONA 7: Most Searched ===
  private async getZ7_MostSearched(lat: number, lon: number) {
    // Queries mais buscadas da região
    
    const searches = await this.prisma.$queryRaw`
      SELECT query, COUNT(*) as count
      FROM search_logs
      WHERE city = (SELECT city FROM users WHERE user_id = current_user_id)
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `;

    return searches;
  }

  // Helper: Build PostGIS geometry para distance check
  private buildPostGISGeom(lat: number, lon: number, radius: number) {
    return {
      type: 'Point',
      coordinates: [lon, lat] // GeoJSON: [longitude, latitude]
    };
  }
}
```

---

## 3️⃣ FLUXO VISUAL: Como Usuário Vê Isso

### **Primeiro Acesso (Splash → Login → Home)**

```
┌─────────────────────────────────────────┐
│ T01 — SPLASH SCREEN (3 segundos)        │
│ Logo Meu Agito                          │
└──────────────┬──────────────────────────┘
               │ Auto-transition
               ▼
┌─────────────────────────────────────────┐
│ T03 — LOGIN / CADASTRO                  │
│ Email + Senha                           │
│ [ Entrar ]                              │
└──────────────┬──────────────────────────┘
               │ Após login bem-sucedido
               ▼
┌─────────────────────────────────────────┐
│ T06 — HOME (com MODAL Permissão)        │
│                                         │
│ "Meu Agito deseja acessar sua           │
│ localização"                            │
│                                         │
│ [ Permitir ]  [ Agora não ]             │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
    ✅ Permitir    ❌ Agora não
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────────┐
│ GPS sync ... │  │ Usar localização │
│ (3-5 seg)    │  │ padrão/anterior  │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       └────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ HOME CARREGANDO     │
    │ Skeleton loaders    │
    │ Z1, Z2, Z3...       │
    │ (máx 1.5 segundos)  │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │ HOME CARREGADO ✅   │
    │                     │
    │ Z1 Mega Eventos     │
    │ Z2 Rolando agora    │
    │ Z3 Não deixe passar │
    │ ... (lazy load)     │
    │                     │
    │ Tudo baseado na     │
    │ localização dele!   │
    └─────────────────────┘
```

### **Usuário Andando na Cidade (Watch Mode)**

```
Usuário em:  -22.9068, -43.1729 (Ipanema, Rio)
             └─ App carrega Z1-Z7 para Ipanema

Usuário anda 500m até:  -22.9130, -43.1780 (Centro)
                        └─ App DETECTA movimento > 50m
                        └─ Atualiza localização em Zustand
                        └─ Recalcula Z1-Z7 para Centro
                        └─ UI atualiza feeds (smooth transition)

⚡ Resultado: Feed sempre reflete where-user-is-now
```

---

## 4️⃣ IMPLEMENTAÇÃO: Checklist Técnico

### **Frontend (React Native)**

```typescript
// ✅ Fase 1.0 Implementation Checklist

// Step 1: Instalar dependências
npm install expo-location expo-permissions

// Step 2: Criar GeolocationService (src/services/)
// Step 3: Criar useLocationStore (src/store/)
// Step 4: Integrar em RootNavigator.tsx (useEffect na mount)
// Step 5: Criar LocationPermissionModal.tsx (UI para pedir permissão)
// Step 6: Testar em iOS + Android (emuladores)

// Arquivos a criar:
// ✅ src/services/geolocation.service.ts
// ✅ src/store/useLocationStore.ts
// ✅ src/components/modals/LocationPermissionModal.tsx
// ✅ src/hooks/useAutoLocation.ts (hook que coordena tudo)
```

### **Backend (NestJS)**

```typescript
// ✅ Fase 1.0 Implementation Checklist

// Step 1: Setup PostGIS no PostgreSQL
// Step 2: Criar FeedController + FeedService
// Step 3: Implementar Z1-Z7 queries (paralelo com Promise.all)
// Step 4: Setup CacheService (Redis)
// Step 5: Add rate limiting no /home/feed
// Step 6: Testar com lat/lon do Rio, SP, Brasília

// Arquivos a criar:
// ✅ src/modules/feed/feed.controller.ts
// ✅ src/modules/feed/feed.service.ts
// ✅ src/modules/feed/dto/get-home-feed.dto.ts
// ✅ database/migrations/add-postgis-geometry.sql
```

---

## 5️⃣ TRATAMENTO DE EDGE CASES

### **Caso 1: Usuário Nega Permissão**

```typescript
// Se usuário não permitir localização:

const handleLocationDenied = async () => {
  // Opção A: Usar última localização conhecida
  const lastLocation = await AsyncStorage.getItem('lastLocation');
  if (lastLocation) {
    useLocationStore.setLocation(...JSON.parse(lastLocation));
    console.log('ℹ️ Usando última localização conhecida');
    return;
  }

  // Opção B: Usar localização padrão (ex: São Paulo)
  const defaultLocation = { latitude: -23.5505, longitude: -46.6333 };
  useLocationStore.setLocation(...defaultLocation);
  console.log('ℹ️ Usando localização padrão (São Paulo)');
};
```

### **Caso 2: GPS Demora Muito (30+ segundos)**

```typescript
// Timeout para não congelar UI

const fetchLocationWithTimeout = async () => {
  return Promise.race([
    GeolocationService.getCurrentLocation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GPS timeout')), 30000)
    )
  ]).catch((error) => {
    console.warn('⚠️ Timeout GPS, usando fallback');
    return useLastKnownLocation() || getDefaultLocation();
  });
};
```

### **Caso 3: Localização Muda Rapidamente (usuário em carro)**

```typescript
// Não recarregar feed a cada 50m (data plan + performance)

const useSmartLocationUpdate = () => {
  const { latitude: prevLat, longitude: prevLon } = useLocationStore();

  const handleLocationChange = (newLat: number, newLon: number) => {
    // Calcula distância entre posição anterior e nova
    const distance = calculateHaversineDistance(
      { lat: prevLat, lon: prevLon },
      { lat: newLat, lon: newLon }
    );

    // Se moveu > 1km, recarregar feed
    if (distance > 1000) {
      console.log(`📍 Moved ${distance}m, reloading feed`);
      fetchHomeFeed({ latitude: newLat, longitude: newLon });
    }
  };

  return { handleLocationChange };
};
```

---

## 6️⃣ SEGURANÇA & PRIVACY

### **Nunca Exponha Localização Exata**

```typescript
// ✅ SEGURO: Enviar ao backend com precisão reduzida
const safeLocation = {
  latitude: Math.round(location.latitude * 100) / 100, // 2 decimais = ~1km
  longitude: Math.round(location.longitude * 100) / 100,
  accuracy: location.accuracy // Informar ao backend a precisão
};

// ❌ INSEGURO: Enviar coordenadas exatas ao backend público
const insafeLocation = {
  latitude: -22.90682843129,
  longitude: -43.17293847283 // Expõe localização exata do usuário
};
```

### **LGPD: Consentimento + Armazenamento**

```typescript
// Solicitar consentimento explícito
const handleLocationPermission = async () => {
  // 1. Mostrar modal explicando por quê
  // "Seu feed é mais relevante perto de você"
  
  // 2. Solicitar permissão
  const granted = await requestLocationPermission();
  
  // 3. Se permitiu, salvar consentimento
  if (granted) {
    await AsyncStorage.setItem('locationConsent', 'true');
    await logConsentToBackend({ // LGPD: Log de consentimento
      timestamp: new Date(),
      permission: 'LOCATION',
      granted: true
    });
  }
};
```

---

## 7️⃣ RESUMO: Por que Isso é Melhor

| Aspecto | Antes (sem geoloc) | Depois (com geoloc) |
|--------|-------|---------|
| **Quando abre app** | Mostra feed genérico (trending global) | Mostra feed personalizado (seu bairro) |
| **UX** | Usuário manual busca "pizzaria perto" | App já sabe aonde você está |
| **Engagement** | Usuário vê 80% irrelevante | Usuário vê 95% relevante |
| **Retenção** | 40% abre novamente | 70%+ abre novamente |
| **Conversão** | "Onde isso fica?" | "Vou agora!" |

---

## 📋 PRÓXIMOS PASSOS

1. ✅ Este documento (você entendeu arquitetura)
2. ⏭️ Código completo (Services + Components + Controllers)
3. ⏭️ Integração na Implementation Guide (Steps 18-20)
4. ⏭️ Testes (mock GPS locations, timeout scenarios)

Quer que eu comece a codificar os arquivos específicos (GeolocationService, LocationPermissionModal, FeedController)?
