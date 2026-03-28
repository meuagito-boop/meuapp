# 🗄️ MeuAgito — Schema do Banco de Dados (PostgreSQL + PostGIS)

> Versão 1.0 | Script completo de criação das tabelas

---

## Setup Inicial

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- para busca por similaridade de texto
```

---

## Tabela: usuarios

```sql
CREATE TABLE usuarios (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome              VARCHAR(100) NOT NULL,
  username          VARCHAR(50)  UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  telefone          VARCHAR(20),
  foto_url          TEXT,
  bio               TEXT,
  role              VARCHAR(20)  NOT NULL DEFAULT 'usuario',
                    -- valores: usuario, organizador, estabelecimento, admin
  status            VARCHAR(20)  NOT NULL DEFAULT 'ativo',
                    -- valores: ativo, suspenso, removido
  lat               DECIMAL(10,8),
  lng               DECIMAL(11,8),
  cidade            VARCHAR(100),
  estado            CHAR(2),
  categorias_favoritas TEXT[],   -- top categorias do usuário para score
  criado_em         TIMESTAMP    NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
```

---

## Tabela: estabelecimentos

```sql
CREATE TABLE estabelecimentos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome                VARCHAR(255) NOT NULL,
  username            VARCHAR(50)  UNIQUE,
  slug                VARCHAR(100) UNIQUE,
  descricao           TEXT,
  categoria_principal VARCHAR(100) NOT NULL,
  categorias_secundarias TEXT[],
  servicos            TEXT[],

  -- Localização
  lat                 DECIMAL(10,8) NOT NULL,
  lng                 DECIMAL(11,8) NOT NULL,
  geom                GEOMETRY(Point, 4326),
  endereco            TEXT,
  cidade              VARCHAR(100),
  estado              CHAR(2),
  cep                 VARCHAR(9),

  -- Contato
  telefone            VARCHAR(20),
  whatsapp            VARCHAR(20),
  email_contato       VARCHAR(255),
  site                VARCHAR(255),

  -- Mídia
  foto_perfil_url     TEXT,
  foto_capa_url       TEXT,

  -- Horário (JSONB)
  horario_funcionamento JSONB,
  /*
    Formato:
    {
      "segunda":  { "aberto": true,  "abre": "09:00", "fecha": "18:00" },
      "terca":    { "aberto": true,  "abre": "09:00", "fecha": "18:00" },
      "quarta":   { "aberto": true,  "abre": "09:00", "fecha": "18:00" },
      "quinta":   { "aberto": true,  "abre": "09:00", "fecha": "18:00" },
      "sexta":    { "aberto": true,  "abre": "09:00", "fecha": "20:00" },
      "sabado":   { "aberto": true,  "abre": "10:00", "fecha": "16:00" },
      "domingo":  { "aberto": false }
    }
  */

  -- Métricas
  seguidores_count    INT          NOT NULL DEFAULT 0,
  avaliacoes_count    INT          NOT NULL DEFAULT 0,
  media_avaliacao     DECIMAL(2,1) NOT NULL DEFAULT 0,
  views_hoje          INT          NOT NULL DEFAULT 0,
  score_relevancia    FLOAT        NOT NULL DEFAULT 0,

  -- Status e verificação
  status              VARCHAR(20)  NOT NULL DEFAULT 'pendente',
                      -- pendente, reivindicado, verificado, suspenso, removido
  verificado          BOOLEAN      NOT NULL DEFAULT FALSE,
  cnpj                VARCHAR(18)  UNIQUE,
  dono_id             UUID         REFERENCES usuarios(id),

  -- Origem dos dados
  osm_id              BIGINT       UNIQUE,
  cnpj_aberto_id      VARCHAR(50),

  criado_em           TIMESTAMP    NOT NULL DEFAULT NOW(),
  atualizado_em       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índice espacial (essencial para queries por proximidade)
CREATE INDEX idx_estabelecimentos_geom ON estabelecimentos USING GIST(geom);
CREATE INDEX idx_estabelecimentos_status ON estabelecimentos(status);
CREATE INDEX idx_estabelecimentos_categoria ON estabelecimentos(categoria_principal);
CREATE INDEX idx_estabelecimentos_cidade ON estabelecimentos(cidade, estado);

-- Trigger para popular geom automaticamente a partir de lat/lng
CREATE OR REPLACE FUNCTION atualizar_geom_estabelecimento()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_geom_estabelecimento
BEFORE INSERT OR UPDATE OF lat, lng ON estabelecimentos
FOR EACH ROW EXECUTE FUNCTION atualizar_geom_estabelecimento();
```

---

## Tabela: eventos

```sql
CREATE TABLE eventos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo            VARCHAR(255) NOT NULL,
  descricao         TEXT,
  foto_url          TEXT,

  -- Tempo
  data_inicio       TIMESTAMP    NOT NULL,
  data_fim          TIMESTAMP    NOT NULL,
  expires_at        TIMESTAMP    GENERATED ALWAYS AS (data_fim) STORED,

  -- Localização
  lat               DECIMAL(10,8),
  lng               DECIMAL(11,8),
  geom              GEOMETRY(Point, 4326),
  endereco          TEXT,
  local_nome        VARCHAR(255),
  cidade            VARCHAR(100),
  estado            CHAR(2),

  -- Classificação
  categoria         VARCHAR(100) NOT NULL DEFAULT 'outro',
  gratuito          BOOLEAN      NOT NULL DEFAULT FALSE,
  preco_minimo      DECIMAL(10,2),
  preco_maximo      DECIMAL(10,2),

  -- Links
  link_ingresso     TEXT,
  link_externo      TEXT,

  -- Origem
  origem            VARCHAR(50)  NOT NULL DEFAULT 'interno',
                    -- interno, ticketmaster, predicthq, serpapi, meetup, openweb
  external_id       VARCHAR(255),

  -- Métricas
  score_ranking     FLOAT        NOT NULL DEFAULT 0,
  views_count       INT          NOT NULL DEFAULT 0,
  saves_count       INT          NOT NULL DEFAULT 0,
  shares_count      INT          NOT NULL DEFAULT 0,

  -- Status
  status            VARCHAR(20)  NOT NULL DEFAULT 'agendado',
                    -- rascunho, agendado, em_andamento, encerrado, cancelado, removido

  -- Relacionamentos
  criado_por        UUID         REFERENCES usuarios(id),
  estabelecimento_id UUID        REFERENCES estabelecimentos(id),

  criado_em         TIMESTAMP    NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),

  -- Restrição de unicidade para evitar duplicatas de APIs externas
  UNIQUE(external_id, origem)
);

-- Índices
CREATE INDEX idx_eventos_geom ON eventos USING GIST(geom);
CREATE INDEX idx_eventos_data ON eventos(data_inicio, data_fim);
CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_eventos_categoria ON eventos(categoria);
CREATE INDEX idx_eventos_score ON eventos(score_ranking DESC);
CREATE INDEX idx_eventos_origem ON eventos(origem);

-- Trigger para popular geom e atualizar status automaticamente
CREATE OR REPLACE FUNCTION atualizar_evento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;

  -- Atualiza status baseado na data atual
  IF NEW.data_fim < NOW() THEN
    NEW.status = 'encerrado';
  ELSIF NEW.data_inicio <= NOW() AND NEW.data_fim >= NOW() THEN
    NEW.status = 'em_andamento';
  END IF;

  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_evento
BEFORE INSERT OR UPDATE ON eventos
FOR EACH ROW EXECUTE FUNCTION atualizar_evento();
```

---

## Tabela: seguidores

```sql
CREATE TABLE seguidores (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estabelecimento_id UUID NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  criado_em         TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(usuario_id, estabelecimento_id)
);

CREATE INDEX idx_seguidores_usuario ON seguidores(usuario_id);
CREATE INDEX idx_seguidores_estabelecimento ON seguidores(estabelecimento_id);
```

---

## Tabela: avaliacoes

```sql
CREATE TABLE avaliacoes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id          UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estabelecimento_id  UUID         NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  nota                DECIMAL(2,1) NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario          TEXT,
  fotos               TEXT[],
  criado_em           TIMESTAMP    NOT NULL DEFAULT NOW(),

  UNIQUE(usuario_id, estabelecimento_id) -- 1 avaliação por usuário por estabelecimento
);

CREATE INDEX idx_avaliacoes_estabelecimento ON avaliacoes(estabelecimento_id);
```

---

## Tabela: eventos_salvos

```sql
CREATE TABLE eventos_salvos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id   UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  criado_em   TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(usuario_id, evento_id)
);
```

---

## Tabela: momentos (posts do estabelecimento)

```sql
CREATE TABLE momentos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estabelecimento_id  UUID NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
  tipo                VARCHAR(20) NOT NULL DEFAULT 'foto',
                      -- foto, video, promocao, aviso
  midia_url           TEXT        NOT NULL,
  legenda             TEXT,
  likes_count         INT         NOT NULL DEFAULT 0,
  criado_em           TIMESTAMP   NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMP   -- null = não expira (tipo Stories = 24h)
);

CREATE INDEX idx_momentos_estabelecimento ON momentos(estabelecimento_id);
```

---

## Query Principal — Feed de Estabelecimentos por Proximidade

```sql
-- Parâmetros: $1 = lat usuário, $2 = lng usuário, $3 = raio em km
SELECT
  e.id,
  e.nome,
  e.username,
  e.categoria_principal,
  e.foto_perfil_url,
  e.media_avaliacao,
  e.avaliacoes_count,
  e.verificado,
  e.views_hoje,
  ROUND(
    ST_Distance(e.geom::geography, ST_MakePoint($2, $1)::geography) / 1000,
    1
  ) AS distancia_km,
  e.score_relevancia
FROM estabelecimentos e
WHERE
  e.status = 'verificado'
  AND ST_DWithin(
    e.geom::geography,
    ST_MakePoint($2, $1)::geography,
    $3 * 1000
  )
ORDER BY
  (e.score_relevancia * 0.7) +
  (1.0 / (ST_Distance(e.geom::geography, ST_MakePoint($2, $1)::geography) + 1) * 1000 * 0.3)
  DESC
LIMIT 50;
```

---

## Query Principal — Feed de Eventos por Proximidade e Score

```sql
-- Parâmetros: $1 = lat usuário, $2 = lng usuário, $3 = raio em km
SELECT
  ev.id,
  ev.titulo,
  ev.categoria,
  ev.foto_url,
  ev.data_inicio,
  ev.data_fim,
  ev.gratuito,
  ev.preco_minimo,
  ev.local_nome,
  ev.origem,
  ROUND(
    ST_Distance(ev.geom::geography, ST_MakePoint($2, $1)::geography) / 1000,
    1
  ) AS distancia_km,
  ev.score_ranking
FROM eventos ev
WHERE
  ev.status IN ('agendado', 'em_andamento')
  AND ev.data_fim > NOW()
  AND ST_DWithin(
    ev.geom::geography,
    ST_MakePoint($2, $1)::geography,
    $3 * 1000
  )
ORDER BY
  (ev.score_ranking * 0.7) +
  (1.0 / (ST_Distance(ev.geom::geography, ST_MakePoint($2, $1)::geography) + 1) * 1000 * 0.3)
  DESC
LIMIT 50;
```
