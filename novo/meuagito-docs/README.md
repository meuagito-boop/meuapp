# 📚 MeuAgito — Documentação Técnica

> Índice geral dos documentos de lógica e arquitetura

---

## Documentos disponíveis

| Arquivo | Conteúdo |
|---|---|
| `01_estabelecimentos_pois.md` | Regras de negócio para perfis de estabelecimentos (POIs) |
| `02_eventos.md` | Regras de negócio para eventos, APIs externas e score |
| `03_database_schema.md` | Schema completo do PostgreSQL + PostGIS |

---

## Visão Geral da Arquitetura

```
[React Native App]
      ↓ lat/lng do usuário
[Node.js Backend]
      ↓ query espacial
[PostgreSQL + PostGIS]
      ↑ ingestão via cron
[OSM + CNPJ Aberto]     → estabelecimentos (base permanente)
[Ticketmaster, PredictHQ, SerpApi, Meetup] → eventos (ao vivo)
[Organizadores no app]  → eventos internos (armazenados)
```

---

## Stack Tecnológico

- **Mobile:** React Native (Expo)
- **Backend:** Node.js
- **Banco:** PostgreSQL + PostGIS
- **Geolocalização:** expo-location (app) + ST_DWithin / ST_Distance (banco)
- **APIs de eventos:** Ticketmaster, PredictHQ, SerpApi, Meetup, OpenWeb Ninja
- **Fontes de POIs:** OpenStreetMap (Overpass API) + CNPJ Aberto
