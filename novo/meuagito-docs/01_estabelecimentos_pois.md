# 📍 MeuAgito — Lógica de Estabelecimentos (POIs)

> Versão 1.0 | Documento técnico de regras de negócio

---

## 1. Visão Geral

Estabelecimentos no MeuAgito são **perfis de negócios locais** (restaurantes, bares, salões, hotéis, comércio, serviços, etc.) que funcionam como páginas em uma rede social. Eles podem ser criados de duas formas:

- **Automática:** pré-cadastro via OSM (OpenStreetMap) + CNPJ Aberto
- **Manual:** criado diretamente pelo dono do negócio no app

---

## 2. Fontes de Dados para Pré-Cadastro

### 2.1 OpenStreetMap (OSM)
- Fornece: nome, coordenadas, categoria, endereço, telefone, site, horário
- Ingestão via **Overpass API**
- Dados podem ser armazenados livremente (licença ODbL)
- Frequência de atualização: **1x por mês**

### 2.2 CNPJ Aberto (dados.gov.br)
- Fornece: razão social, nome fantasia, CNPJ, endereço completo, CNAE (categoria), telefone
- Download em CSV por estado
- 100% gratuito e livre para armazenar
- Cruzamento com OSM pelo nome + endereço para enriquecer o perfil

### 2.3 Regra de Cruzamento OSM + CNPJ
```
1. Busca no CNPJ pelo nome fantasia + município
2. Calcula similaridade de string (> 80% = match)
3. Confirma pelo CEP ou coordenadas próximas (< 100m)
4. Se match confirmado → enriquece o perfil com dados do CNPJ
5. Se não → perfil fica só com dados do OSM
```

---

## 3. Ciclo de Vida do Perfil

```
[PENDENTE] → pré-cadastrado via OSM/CNPJ, dono não reivindicou ainda
     ↓
[REIVINDICADO] → dono identificou e iniciou o processo de verificação
     ↓
[VERIFICADO] ✅ → dono confirmou identidade e completou o perfil
     ↓
[SUSPENSO] ⚠️ → violação de regras ou denúncias
     ↓
[REMOVIDO] ❌ → encerrado definitivamente
```

---

## 4. Estrutura do Perfil

### 4.1 Campos Obrigatórios (perfil mínimo — pré-cadastro)
| Campo | Tipo | Origem |
|---|---|---|
| `id` | UUID | Sistema |
| `nome` | VARCHAR(255) | OSM / CNPJ |
| `slug` | VARCHAR(100) | Gerado automaticamente do nome |
| `categoria_principal` | ENUM | OSM / CNPJ (CNAE) |
| `lat` / `lng` | DECIMAL | OSM |
| `geom` | GEOMETRY(Point) | PostGIS |
| `cidade` | VARCHAR | OSM / CNPJ |
| `estado` | CHAR(2) | OSM / CNPJ |
| `status` | ENUM | Sistema |
| `criado_em` | TIMESTAMP | Sistema |

### 4.2 Campos Completados pelo Dono
| Campo | Tipo | Obrigatório para Verificação |
|---|---|---|
| `foto_perfil_url` | TEXT | ✅ Sim |
| `foto_capa_url` | TEXT | Não |
| `descricao` | TEXT (max 500) | ✅ Sim |
| `telefone` | VARCHAR(20) | ✅ Sim |
| `whatsapp` | VARCHAR(20) | Não |
| `site` | VARCHAR(255) | Não |
| `email_contato` | VARCHAR(255) | ✅ Sim |
| `horario_funcionamento` | JSONB | ✅ Sim |
| `categorias_secundarias` | ARRAY | Não |
| `servicos` | ARRAY | Não |
| `cnpj` | VARCHAR(18) | ✅ Sim (para verificação) |

### 4.3 Campos Gerados pelo Sistema
| Campo | Tipo | Descrição |
|---|---|---|
| `username` | VARCHAR(50) | @handle único do perfil |
| `seguidores_count` | INT | Total de seguidores |
| `avaliacoes_count` | INT | Total de avaliações |
| `media_avaliacao` | DECIMAL(2,1) | Média das avaliações (0-5) |
| `views_hoje` | INT | Visualizações nas últimas 24h |
| `score_relevancia` | FLOAT | Score para ordenação no feed |
| `verificado` | BOOLEAN | Perfil verificado pelo dono |
| `osm_id` | BIGINT | ID de origem no OSM |
| `cnpj` | VARCHAR(18) | CNPJ validado |

---

## 5. Regras de Negócio — Criação do Perfil

### 5.1 Pré-Cadastro Automático
- Todo estabelecimento importado do OSM/CNPJ recebe status `PENDENTE`
- Foto inicial: **placeholder com emoji da categoria** (ex: 🍕 para pizzaria)
- Username gerado automaticamente: `@nomefantasia_cidade` (slug sem espaços)
- Perfis pendentes aparecem no feed com badge "Reivindique este negócio"
- Perfis pendentes **não podem** receber mensagens diretas

### 5.2 Reivindicação pelo Dono
```
1. Dono busca o estabelecimento no app
2. Clica em "Este é meu negócio"
3. Informa CNPJ
4. Sistema valida CNPJ na Receita Federal (API pública)
5. Dono recebe código por SMS ou email cadastrado no CNPJ
6. Confirma código → status muda para REIVINDICADO
7. Dono preenche campos obrigatórios
8. Sistema analisa (automático + revisão manual se necessário)
9. Status muda para VERIFICADO ✅
```

### 5.3 Criação Manual (sem pré-cadastro)
- Dono pode criar perfil do zero se o negócio não existir no banco
- Exige todos os campos obrigatórios desde o início
- Passa por fila de moderação antes de aparecer publicamente
- Prazo de análise: até 48 horas

### 5.4 Regras de Username
- Mínimo 3, máximo 30 caracteres
- Apenas letras, números e underscore
- Não pode ser igual a outro username existente
- Não pode conter palavras reservadas (admin, meuagito, suporte, etc.)
- Dono pode alterar 1x a cada 90 dias

---

## 6. Categorias de Estabelecimentos

```
gastronomia/
  ├── restaurante
  ├── bar
  ├── cafeteria
  ├── pizzaria
  ├── hamburgueria
  ├── sorveteria
  └── outros_gastronomia

beleza_saude/
  ├── salao_cabelo
  ├── barbearia
  ├── estetica
  ├── academia
  ├── clinica
  └── outros_beleza

hospedagem/
  ├── hotel
  ├── pousada
  ├── hostel
  └── outros_hospedagem

comercio/
  ├── moda_vestuario
  ├── eletronicos
  ├── mercado
  ├── farmacia
  └── outros_comercio

servicos/
  ├── financeiro
  ├── educacao
  ├── automotivo
  └── outros_servicos

cultura_lazer/
  ├── teatro
  ├── cinema
  ├── museu
  ├── parque
  └── outros_cultura

entretenimento/
  ├── balada
  ├── karaoke
  ├── boliche
  └── outros_entretenimento
```

---

## 7. Score de Relevância do Estabelecimento

O `score_relevancia` determina a ordem de exibição no feed e nos resultados de busca.

### Fórmula
```
score = (proximidade × 0.35) + (avaliacao × 0.25) + (engajamento × 0.20) + (completude × 0.15) + (atividade × 0.05)
```

### Fatores
| Fator | Peso | Cálculo |
|---|---|---|
| Proximidade | 35% | 100pts < 500m / 80pts < 2km / 60pts < 5km / 40pts < 15km / 20pts < 30km |
| Avaliação | 25% | (media_avaliacao / 5) × 100, com peso maior se > 10 avaliações |
| Engajamento | 20% | views + seguidores×2 + saves×3, normalizado |
| Completude do perfil | 15% | % de campos preenchidos (foto, descrição, horário, serviços) |
| Atividade recente | 5% | Postou algo nos últimos 7 dias = 100pts, 30 dias = 50pts, inativo = 0pts |

---

## 8. Regras de Moderação

### 8.1 Conteúdo Permitido
- Fotos do estabelecimento, produtos e serviços
- Descrições em português ou inglês
- Informações de contato reais e verificáveis
- Promoções e ofertas

### 8.2 Conteúdo Proibido
- Fotos de terceiros sem autorização
- Informações falsas ou enganosas
- Conteúdo adulto ou ofensivo
- Links para sites externos suspeitos
- Múltiplos perfis para o mesmo CNPJ

### 8.3 Denúncias
- Usuários podem denunciar um perfil
- 3 denúncias → revisão manual automática
- 5 denúncias → suspensão temporária até revisão
- Dono notificado por email/push em caso de suspensão

---

## 9. Horário de Funcionamento

Formato JSONB no banco:

```json
{
  "segunda": { "aberto": true, "abre": "09:00", "fecha": "18:00" },
  "terca":   { "aberto": true, "abre": "09:00", "fecha": "18:00" },
  "quarta":  { "aberto": true, "abre": "09:00", "fecha": "18:00" },
  "quinta":  { "aberto": true, "abre": "09:00", "fecha": "18:00" },
  "sexta":   { "aberto": true, "abre": "09:00", "fecha": "20:00" },
  "sabado":  { "aberto": true, "abre": "10:00", "fecha": "16:00" },
  "domingo": { "aberto": false }
}
```

O sistema calcula automaticamente o status `ABERTO` / `FECHADO` em tempo real comparando com o horário local do estabelecimento.

---

## 10. Relacionamentos

```
estabelecimento
  ├── tem muitos → eventos (criados pelo dono)
  ├── tem muitos → avaliacoes (feitas por usuários)
  ├── tem muitos → seguidores (usuários que seguem)
  ├── tem muitos → momentos (posts/mídia)
  ├── tem muitos → servicos_oferecidos
  └── pertence a → dono (usuario com role = estabelecimento)
```

---

## 11. Notificações Automáticas

| Gatilho | Notificação |
|---|---|
| Perfil pré-cadastrado existe mas não reivindicado | Email/SMS para telefone do CNPJ: "Seu negócio está no MeuAgito" |
| Nova avaliação recebida | Push para o dono |
| Novo seguidor | Push para o dono |
| Perfil incompleto há 7 dias | Push: "Complete seu perfil para aparecer mais" |
| Score caindo por inatividade | Push: "Poste algo para manter sua visibilidade" |
