# 🎉 MeuAgito — Lógica de Eventos

> Versão 1.0 | Documento técnico de regras de negócio

---

## 1. Visão Geral

Eventos no MeuAgito são **itens temporários** com data de início e fim. Diferente dos estabelecimentos (que são perfis permanentes), eventos expiram automaticamente. Eles podem vir de duas fontes:

- **Externos:** APIs de terceiros (Ticketmaster, PredictHQ, SerpApi, Meetup, OpenWeb Ninja) — exibidos ao vivo, não armazenados permanentemente
- **Internos:** criados diretamente por organizadores dentro do app — armazenados livremente

---

## 2. Fontes de Dados

### 2.1 APIs Externas

| API | Tipo de Evento | Armazenar? | Limite Gratuito |
|---|---|---|---|
| Ticketmaster | Shows, festivais, esportes | ❌ Exibir ao vivo | 5.000 chamadas/dia |
| PredictHQ | Qualquer (alto impacto) | ✅ Com Data License | Limitado no gratuito |
| SerpApi Google Events | Variedade geral | ❌ Máx 24h cache | 100 buscas/mês |
| Meetup API | Comunidade, tech | ❌ Exibir ao vivo | Gratuito com conta |
| OpenWeb Ninja | Geral + ingressos | ⚠️ Verificar plano | Via RapidAPI |

### 2.2 Eventos Internos
- Criados por donos de estabelecimentos verificados
- Criados por organizadores com conta verificada
- Armazenados permanentemente no PostgreSQL do MeuAgito
- Podem ter venda de ingressos integrada (futuro)

---

## 3. Ciclo de Vida do Evento

```
[RASCUNHO] → criado mas não publicado ainda
     ↓
[AGENDADO] → publicado, aguardando data de início
     ↓
[EM ANDAMENTO] → data_inicio <= NOW() <= data_fim
     ↓
[ENCERRADO] → data_fim < NOW() (some do feed, fica no histórico)
     ↓
[CANCELADO] → cancelado pelo organizador antes do início
     ↓
[REMOVIDO] → removido por moderação
```

---

## 4. Estrutura do Evento

### 4.1 Campos Obrigatórios
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único interno |
| `titulo` | VARCHAR(255) | Nome do evento |
| `data_inicio` | TIMESTAMP | Data e hora de início |
| `data_fim` | TIMESTAMP | Data e hora de fim |
| `lat` / `lng` | DECIMAL | Coordenadas do local |
| `geom` | GEOMETRY(Point) | PostGIS para queries espaciais |
| `cidade` | VARCHAR | Cidade do evento |
| `estado` | CHAR(2) | UF |
| `categoria` | ENUM | Categoria normalizada |
| `origem` | ENUM | ticketmaster, predicthq, serpapi, meetup, interno |
| `status` | ENUM | rascunho, agendado, em_andamento, encerrado, cancelado |

### 4.2 Campos Opcionais mas Recomendados
| Campo | Tipo | Descrição |
|---|---|---|
| `descricao` | TEXT | Descrição completa do evento |
| `foto_url` | TEXT | URL da imagem de capa |
| `preco_minimo` | DECIMAL(10,2) | Menor valor de ingresso (0 = gratuito) |
| `preco_maximo` | DECIMAL(10,2) | Maior valor de ingresso |
| `link_ingresso` | TEXT | Link externo para compra |
| `link_externo` | TEXT | Link original do evento na API de origem |
| `endereco` | TEXT | Endereço textual completo |
| `local_nome` | VARCHAR(255) | Nome do local (ex: "Allianz Parque") |
| `capacidade` | INT | Capacidade máxima do evento |
| `gratuito` | BOOLEAN | Se o evento é gratuito |

### 4.3 Campos de Sistema
| Campo | Tipo | Descrição |
|---|---|---|
| `external_id` | VARCHAR | ID na API de origem (evita duplicatas) |
| `score_ranking` | FLOAT | Score calculado de relevância (0-100) |
| `views_count` | INT | Visualizações no app |
| `saves_count` | INT | Usuários que salvaram |
| `shares_count` | INT | Compartilhamentos |
| `criado_por` | UUID | ID do organizador (se interno) |
| `estabelecimento_id` | UUID | Vínculo com perfil do estabelecimento |
| `expires_at` | TIMESTAMP | = data_fim (para limpeza automática) |
| `criado_em` | TIMESTAMP | Data de criação no banco |

---

## 5. Categorias de Eventos

Todas as categorias externas são mapeadas para o padrão interno do MeuAgito:

```
show_musical 🎵
  ← music, concert (Ticketmaster)
  ← concerts (PredictHQ)

festival 🎪
  ← festival (Ticketmaster / PredictHQ)

esporte ⚽
  ← sports (Ticketmaster / PredictHQ)

cultura_arte 🎨
  ← arts & theatre (Ticketmaster)
  ← performing-arts (PredictHQ)

gastronomia 🍽️
  ← food-drink (SerpApi / Meetup)

tech_negocios 💻
  ← conferences, expos (Ticketmaster)
  ← community (Meetup)

infantil_familia 👨‍👩‍👧
  ← family (Ticketmaster)

balada_noturno 🌙
  ← nightlife (SerpApi)

religioso_espiritual 🙏
  ← (mapeamento manual)

outro 📌
  ← qualquer categoria não mapeada
```

**Regra:** se a categoria externa não constar no mapa, o evento vai para `outro` e entra em fila de revisão para reclassificação.

---

## 6. Score de Ranking

Cada evento recebe um `score_ranking` recalculado periodicamente. Ele determina a ordem de exibição no feed.

### Fórmula
```
score = (proximidade × 0.40) + (urgência × 0.25) + (popularidade × 0.20) + (engajamento × 0.10) + (preferência × 0.05)
```

### Detalhamento dos Fatores

#### Proximidade (40%)
| Distância | Pontos |
|---|---|
| < 1 km | 100 |
| 1 – 5 km | 80 |
| 5 – 15 km | 60 |
| 15 – 30 km | 40 |
| > 30 km | 0 (só aparece em "Mais longe") |

#### Urgência (25%)
| Quando acontece | Pontos |
|---|---|
| Hoje | 100 |
| Amanhã | 80 |
| Em até 3 dias | 60 |
| Em até 7 dias | 40 |
| Mais de 7 dias | 20 |

#### Popularidade (20%)
- Vem do score de impacto do PredictHQ (0-100)
- Ou normalizado pelo número de views no Ticketmaster
- Para eventos internos: calculado pelo engajamento acumulado

#### Engajamento interno (10%)
```
engajamento = (views_count + saves_count × 2 + shares_count × 3)
normalizado pelo evento mais engajado do período (últimos 7 dias)
```

#### Preferência do usuário (5%)
| Situação | Pontos |
|---|---|
| Categoria está no top-3 do usuário | 100 |
| Categoria está no top-5 do usuário | 50 |
| Categoria não está no histórico | 0 |

---

## 7. Seções do Feed — Lógica de Montagem

### "Hoje perto de você 📍"
```sql
WHERE data_inicio::date = CURRENT_DATE
  AND ST_DWithin(geom, ponto_usuario, 15000) -- 15km
ORDER BY score_ranking DESC
LIMIT 10
```

### "Em alta agora 🔥"
```sql
WHERE score_ranking >= 70
  AND data_fim > NOW()
ORDER BY (popularidade × 0.6 + engajamento × 0.4) DESC
LIMIT 10
```

### "No fim de semana 🎊"
```sql
WHERE data_inicio BETWEEN
  próxima_sexta_18h AND próximo_domingo_23h59
  AND ST_DWithin(geom, ponto_usuario, 30000) -- 30km
ORDER BY score_ranking DESC
LIMIT 10
```

### "Por categoria"
- Uma seção para cada categoria do top-3 do usuário
- 5 eventos por seção, ordenados por score

### "Mais longe mas vale a pena 🚗"
```sql
WHERE ST_DWithin(geom, ponto_usuario, 100000) -- 100km
  AND score_ranking >= 80 -- só eventos muito relevantes
  AND NOT ST_DWithin(geom, ponto_usuario, 30000)
ORDER BY score_ranking DESC
LIMIT 5
```

---

## 8. Regras para Criação de Eventos Internos

### 8.1 Quem pode criar eventos
- Donos de estabelecimentos com perfil **VERIFICADO**
- Organizadores com conta verificada (role = `organizador`)
- Usuários comuns **não podem** criar eventos (apenas salvar e compartilhar)

### 8.2 Campos obrigatórios na criação manual
- Título (mín. 10, máx. 100 caracteres)
- Foto de capa (mínimo 800×400px)
- Data e hora de início
- Data e hora de fim
- Local com endereço ou coordenadas
- Categoria
- Descrição (mín. 50 caracteres)

### 8.3 Validações automáticas
- `data_fim` deve ser posterior a `data_inicio`
- `data_inicio` deve ser no mínimo 1 hora no futuro
- Não pode criar mais de 10 eventos ativos simultâneos (limite padrão)
- Foto passa por moderação automática antes de publicar
- Título e descrição passam por filtro de palavras proibidas

### 8.4 Vínculo com estabelecimento
- Se o organizador tem um estabelecimento verificado, o evento pode ser vinculado
- Evento vinculado aparece no perfil do estabelecimento automaticamente
- Um evento pode ter apenas um estabelecimento vinculado

---

## 9. Deduplicação de Eventos Externos

Antes de exibir ou inserir qualquer evento de API externa:

```
1. Verifica se existe registro com mesmo external_id + origem
2. Se existe → atualiza apenas campos mutáveis (score, foto, link)
3. Se não existe → cria novo registro
4. Eventos sem coordenadas válidas → quarentena (não aparecem no feed)
5. Eventos sem foto → usa placeholder da categoria
```

---

## 10. Jobs Agendados (Cron)

| Frequência | Ação |
|---|---|
| A cada 6 horas | Busca novos eventos nas APIs externas (raio 50km das cidades cobertas) |
| A cada 1 hora | Recalcula `score_ranking` dos eventos ativos |
| A cada 30 min | Atualiza status (AGENDADO → EM ANDAMENTO → ENCERRADO) |
| Diariamente às 3h | Expira eventos com `data_fim` < NOW() |
| Semanalmente | Remove do banco eventos expirados há mais de 30 dias |

---

## 11. Raio de Busca e Cobertura

| Contexto | Raio |
|---|---|
| Exibição padrão ao usuário | 25 km |
| Ingestão nas APIs externas | 50 km a partir do centro das cidades cobertas |
| "Mais longe mas vale a pena" | até 100 km, só score >= 80 |
| Eventos de grande porte (festivais nacionais) | Nacional — aparece para todos do estado |
| Configuração pelo usuário | Mín. 5 km / Máx. 100 km |

---

## 12. Conformidade com Termos de Uso das APIs

| API | Regra |
|---|---|
| Ticketmaster | Exibir ao vivo. Nunca armazenar. Attribution obrigatório: "Powered by Ticketmaster" |
| PredictHQ | Armazenar apenas no plano Data License. No gratuito, só exibição ao vivo |
| SerpApi | Cache máximo de 24h conforme ToS. Nunca armazenar permanentemente |
| Meetup | Exibir ao vivo. Links sempre apontam para o site original do Meetup |
| OpenWeb Ninja | Verificar ToS do plano contratado antes de qualquer armazenamento |
| Eventos internos | Armazenados livremente, sem restrições |

---

## 13. Relacionamentos

```
evento
  ├── pertence a → estabelecimento (opcional, se vinculado)
  ├── pertence a → organizador (usuario com role = organizador)
  ├── tem muitos → saves (usuários que salvaram)
  ├── tem muitos → compartilhamentos
  └── tem muitos → views (registro de visualizações)
```
