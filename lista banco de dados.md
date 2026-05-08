# Tipos de Banco de Dados, Arquitetura e Tendência PACELC

## Objetivo do documento

Este documento apresenta uma visão técnica dos principais tipos de bancos de dados existentes, descrevendo:

1. modelo de dados;
2. arquitetura interna;
3. arquitetura distribuída;
4. finalidade para a qual foram desenvolvidos;
5. preferência arquitetural nativa;
6. tendência dentro do modelo PACELC;
7. cenários adequados de uso;
8. limitações e pontos de atenção.

O documento não apresenta opinião pessoal. A classificação considera a vocação arquitetural predominante de cada família de banco de dados. Em produtos específicos, o comportamento PACELC pode variar conforme configuração de replicação, quorum, consistência de leitura, consistência de escrita, topologia de cluster e estratégia de distribuição.

---

# 1. Conceito de PACELC

PACELC é uma extensão do teorema CAP. Ele analisa o comportamento de sistemas distribuídos em dois cenários:

1. quando existe uma partição de rede;
2. quando não existe partição de rede e o sistema opera normalmente.

A estrutura do PACELC é:

```text
P A/C - E L/C
```

Significa:

```text
If Partition, choose Availability or Consistency;
Else, choose Latency or Consistency.
```

Em português:

```text
Se houver Partição de rede, o sistema escolhe entre Disponibilidade e Consistência;
Caso contrário, escolhe entre Latência e Consistência.
```

## 1.1 Combinações principais

| Classificação | Significado                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| **PC/EC**     | Em partição, prefere consistência. Em operação normal, prefere consistência em vez de menor latência. |
| **PC/EL**     | Em partição, prefere consistência. Em operação normal, prefere menor latência.                        |
| **PA/EC**     | Em partição, prefere disponibilidade. Em operação normal, prefere consistência.                       |
| **PA/EL**     | Em partição, prefere disponibilidade. Em operação normal, prefere menor latência.                     |
| **Tunable**   | Permite configurar o equilíbrio entre consistência, disponibilidade e latência.                       |

## 1.2 Observação sobre bancos single-node

PACELC é mais relevante para bancos distribuídos. Em bancos locais, embutidos ou single-node, a noção de partição de rede não se aplica da mesma forma. Nesses casos, a análise deve ser feita pela consistência local, durabilidade, concorrência e modelo de transação.

---

# 2. Banco Relacional Tradicional — RDBMS

## Exemplos

```text
PostgreSQL
MySQL
MariaDB
SQL Server
Oracle Database
IBM Db2
```

## Modelo de dados

Utiliza tabelas, linhas, colunas, chaves primárias, chaves estrangeiras, constraints, índices e relações normalizadas.

## Arquitetura interna

A arquitetura típica inclui:

```text
motor SQL
otimizador de consultas
executor de queries
índices B-tree, Hash, GiST, GIN ou similares
WAL, redo log ou transaction log
MVCC ou locking transacional
buffer pool/cache de páginas
controle ACID
```

## Arquitetura distribuída

Tradicionalmente, bancos relacionais foram projetados para operação centralizada ou primary-replica. A escala horizontal pode ser adicionada por:

```text
réplicas de leitura
particionamento
sharding manual
extensões distribuídas
federation
cluster ativo-passivo
cluster ativo-ativo com restrições
```

## Finalidade de projeto

Foram desenvolvidos para dados estruturados, integridade transacional, relacionamento entre entidades e consistência forte.

## Preferência arquitetural nativa

```text
Consistência
Integridade
Transações ACID
Validação relacional
Durabilidade
```

## Tendência PACELC

```text
PC/EC
```

Em caso de partição, tendem a privilegiar consistência. Em operação normal, tendem a privilegiar consistência transacional em vez de menor latência.

## Cenários adequados

```text
usuários
contas
permissões
pedidos
pagamentos
estoque
cadastros
financeiro
assinaturas
operações críticas
sistemas administrativos
```

## Limitações

```text
escala horizontal menos natural que bancos distribuídos nativos
sharding pode ser complexo
joins distribuídos são difíceis
alta escrita global exige projeto cuidadoso
```

---

# 3. Banco Relacional Distribuído / NewSQL / Distributed SQL

## Exemplos

```text
Google Spanner
CockroachDB
YugabyteDB
TiDB
FoundationDB com camada SQL
```

## Modelo de dados

Mantém modelo relacional e SQL, mas com distribuição horizontal nativa.

## Arquitetura interna

A arquitetura típica inclui:

```text
SQL distribuído
sharding automático
consenso distribuído
Raft ou Paxos
replicação síncrona ou quorum-based
transações distribuídas
controle de timestamp lógico/físico
MVCC distribuído
balanceamento automático de partições
```

## Arquitetura distribuída

Foi projetado para múltiplos nós, zonas ou regiões. Os dados são divididos em ranges, tablets, shards ou partitions, replicados entre nós e coordenados por consenso distribuído.

## Finalidade de projeto

Foram desenvolvidos para combinar SQL, transações ACID e escala horizontal.

## Preferência arquitetural nativa

```text
Consistência distribuída
Transações fortes
Escalabilidade horizontal
Tolerância a falhas
```

## Tendência PACELC

```text
PC/EC
```

Em partições, tendem a bloquear ou rejeitar operações que comprometam consistência. Em operação normal, sacrificam parte da latência para preservar consistência distribuída.

## Cenários adequados

```text
SaaS multi-tenant
aplicações globais
sistemas financeiros distribuídos
catálogos críticos
operações multi-região
sistemas que exigem SQL e escala horizontal
```

## Limitações

```text
maior complexidade operacional
latência superior a bancos locais em transações distribuídas
custo de coordenação entre nós
modelagem deve considerar distribuição física dos dados
```

---

# 4. Banco Key-Value

## Exemplos

```text
Redis
DynamoDB
Riak
Aerospike
FoundationDB em camada key-value
Berkeley DB
```

## Modelo de dados

Armazena dados em formato simples:

```text
chave -> valor
```

O valor pode ser string, blob, JSON, estrutura binária ou estrutura de dados específica.

## Arquitetura interna

A arquitetura típica inclui:

```text
hash table
particionamento por chave
replicação por nó
TTL
armazenamento em memória ou disco
log de persistência
snapshot
consistent hashing
```

## Arquitetura distribuída

Muitos bancos key-value foram projetados para sharding horizontal por chave. A distribuição costuma ser simples porque cada registro é acessado diretamente pela chave.

## Finalidade de projeto

Foram desenvolvidos para leitura e escrita rápidas com acesso direto por chave.

## Preferência arquitetural nativa

```text
Baixa latência
Alta disponibilidade
Acesso simples
Escala horizontal por chave
```

## Tendência PACELC

```text
PA/EL ou Tunable
```

Bancos key-value distribuídos frequentemente preferem disponibilidade e baixa latência. Alguns produtos permitem consistência forte por configuração.

## Cenários adequados

```text
cache
sessões
tokens
rate limiting
carrinhos temporários
locks distribuídos com cautela
configurações rápidas
contadores
features flags
```

## Limitações

```text
consultas complexas limitadas
não é ideal para relacionamentos complexos
normalização não é natural
consistência pode variar por configuração
```

---

# 5. Banco de Documentos

## Exemplos

```text
MongoDB
CouchDB
Firestore
RavenDB
Amazon DocumentDB
Couchbase
```

## Modelo de dados

Armazena documentos, normalmente em JSON, BSON ou formato semelhante.

Exemplo conceitual:

```json
{
  "id": "123",
  "nome": "Estabelecimento X",
  "endereco": {
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "categorias": ["bar", "restaurante"]
}
```

## Arquitetura interna

A arquitetura típica inclui:

```text
coleções de documentos
índices secundários
armazenamento orientado a documento
replicação primary-secondary ou multi-master, dependendo do produto
sharding por chave
consulta por campos internos do documento
```

## Arquitetura distribuída

A distribuição geralmente ocorre por shard key. O desempenho e a escalabilidade dependem diretamente da escolha da chave de particionamento e do padrão de acesso.

## Finalidade de projeto

Foram desenvolvidos para dados semi-estruturados, flexibilidade de schema e desenvolvimento rápido com agregados documentais.

## Preferência arquitetural nativa

```text
Flexibilidade de estrutura
Agregação de dados relacionados no mesmo documento
Escala horizontal por documento
Evolução rápida de schema
```

## Tendência PACELC

```text
Tunable
```

A tendência depende do banco e da configuração.

Exemplos:

```text
MongoDB com write concern majority e read concern majority tende mais a PC/EC.
CouchDB com replicação multi-master tende mais a PA/EL e consistência eventual.
Firestore oferece diferentes comportamentos conforme operação, região e modo de leitura.
```

## Cenários adequados

```text
perfis de usuário
catálogos
conteúdo flexível
configurações por entidade
CMS
produtos com atributos variáveis
dados agregados por contexto
```

## Limitações

```text
risco de duplicação excessiva
joins limitados ou menos naturais
transações complexas podem ser mais restritas
schema flexível pode gerar inconsistência sem governança
shard key mal escolhida prejudica escala
```

---

# 6. Banco Wide-Column / Column-Family

## Exemplos

```text
Apache Cassandra
ScyllaDB
HBase
Google Bigtable
Amazon Keyspaces
```

## Modelo de dados

Utiliza linhas identificadas por chave, famílias de colunas e colunas variáveis. É otimizado para consultas por chave de partição e grandes volumes de escrita.

## Arquitetura interna

A arquitetura típica inclui:

```text
LSM-tree
memtable
SSTables
commit log
compaction
particionamento por chave
replicação distribuída
consistency levels
modelo append-heavy
```

## Arquitetura distribuída

Foi projetado para clusters grandes, com particionamento e replicação distribuída. Cassandra e ScyllaDB usam arquitetura sem nó primário único, enquanto HBase e Bigtable usam arquitetura baseada em regiões/tablets.

## Finalidade de projeto

Foram desenvolvidos para alta escrita, grande volume de dados e disponibilidade em escala horizontal.

## Preferência arquitetural nativa

```text
Alta disponibilidade
Alta taxa de escrita
Escalabilidade horizontal
Tolerância a falhas
Distribuição por chave
```

## Tendência PACELC

```text
PA/EL ou Tunable
```

Cassandra e ScyllaDB são geralmente PA/EL quando configurados para disponibilidade e latência, mas podem ajustar consistência via quorum.

HBase e Bigtable tendem mais a consistência por linha/região, aproximando-se de PC/EC em certos padrões operacionais.

## Cenários adequados

```text
telemetria
logs massivos
eventos
IoT
histórico de atividades
mensagens em grande escala
feeds
armazenamento por séries de chave-tempo
```

## Limitações

```text
modelagem orientada à consulta
consultas ad hoc limitadas
joins não são naturais
transações complexas são restritas
alterações de padrão de acesso podem exigir remodelagem
```

---

# 7. Banco de Grafos — Property Graph

## Exemplos

```text
Neo4j
JanusGraph
TigerGraph
Dgraph
ArangoDB em modo grafo
Amazon Neptune em modo property graph
```

## Modelo de dados

Utiliza:

```text
nós
arestas
propriedades
rótulos
relacionamentos direcionados ou não direcionados
```

## Arquitetura interna

A arquitetura típica inclui:

```text
armazenamento otimizado para travessia
índices de nós
índices de propriedades
adjacency lists
mecanismos de traversal
consultas Cypher, Gremlin ou GraphQL+-
```

## Arquitetura distribuída

Distribuir grafos é complexo porque relacionamentos atravessam partições. Alguns bancos de grafo escalam por replicação, outros por particionamento de grafos, e outros utilizam motores distribuídos especializados.

## Finalidade de projeto

Foram desenvolvidos para modelar e consultar relações complexas entre entidades.

## Preferência arquitetural nativa

```text
Consistência de relacionamento
Travessia eficiente
Consulta de conexões profundas
Integridade entre nós e arestas
```

## Tendência PACELC

```text
PC/EC
```

Bancos de grafo transacionais tendem a favorecer consistência porque a validade dos relacionamentos é parte central do modelo.

## Cenários adequados

```text
redes sociais
recomendação
fraude
permissões complexas
rotas
dependências
conhecimento conectado
análise de relacionamento
```

## Limitações

```text
particionamento difícil
custo alto para grafos extremamente distribuídos
não substitui banco relacional em todos os casos
consultas analíticas massivas podem exigir motores específicos
```

---

# 8. Banco RDF / Triplestore / Semantic Database

## Exemplos

```text
GraphDB
Stardog
Apache Jena
Virtuoso
Amazon Neptune em modo RDF
Blazegraph
```

## Modelo de dados

Utiliza triplas:

```text
sujeito -> predicado -> objeto
```

Exemplo:

```text
EstabelecimentoX -> localizadoEm -> SãoPaulo
```

## Arquitetura interna

A arquitetura típica inclui:

```text
índices SPO
índices POS
índices OPS
consulta SPARQL
ontologias
inferência semântica
vocabulários RDF/OWL
```

## Arquitetura distribuída

Pode ser distribuído, mas a inferência e as consultas semânticas complexas tornam a distribuição mais difícil que em bancos key-value ou wide-column.

## Finalidade de projeto

Foram desenvolvidos para representação semântica de conhecimento, interoperabilidade e inferência baseada em ontologias.

## Preferência arquitetural nativa

```text
Consistência semântica
Relações formais
Inferência
Interoperabilidade de conhecimento
```

## Tendência PACELC

```text
PC/EC
```

## Cenários adequados

```text
knowledge graphs
ontologias
dados científicos
governança de dados
integração semântica
catálogos corporativos complexos
```

## Limitações

```text
curva de aprendizado alta
SPARQL é menos comum que SQL
performance depende fortemente dos índices
pode ser excessivo para aplicações transacionais simples
```

---

# 9. Banco Time-Series

## Exemplos

```text
TimescaleDB
InfluxDB
QuestDB
Prometheus TSDB
VictoriaMetrics
OpenTSDB
```

## Modelo de dados

Organiza dados por tempo, métrica, tags e valores.

Exemplo conceitual:

```text
timestamp | metric | tags | value
```

## Arquitetura interna

A arquitetura típica inclui:

```text
particionamento temporal
compressão
retenção automática
downsampling
append-only writes
índices por tempo e tags
agregações por janela
```

## Arquitetura distribuída

Varia por produto. Alguns são single-node com alta eficiência; outros possuem clustering, replicação e particionamento distribuído.

## Finalidade de projeto

Foram desenvolvidos para armazenar, consultar e agregar dados ordenados temporalmente.

## Preferência arquitetural nativa

```text
Alta ingestão
Consulta temporal rápida
Compressão
Retenção por período
Agregação por intervalo
```

## Tendência PACELC

```text
PA/EL ou PC/EC, dependendo do motor
```

Exemplos:

```text
TimescaleDB herda características do PostgreSQL e tende a PC/EC.
InfluxDB, Prometheus e VictoriaMetrics tendem a favorecer ingestão, disponibilidade e latência, aproximando-se de PA/EL.
```

## Cenários adequados

```text
métricas
observabilidade
monitoramento
IoT
sensores
séries financeiras
telemetria
logs numéricos
```

## Limitações

```text
não é ideal para relacionamentos complexos
não substitui banco transacional
cardinalidade excessiva de tags pode degradar performance
retenção deve ser planejada
```

---

# 10. Banco de Busca / Search Engine Database

## Exemplos

```text
Elasticsearch
OpenSearch
Apache Solr
Typesense
Meilisearch
Vespa
```

## Modelo de dados

Utiliza documentos indexados para busca textual, filtros, ranking e agregações.

## Arquitetura interna

A arquitetura típica inclui:

```text
índice invertido
tokenização
analisadores linguísticos
segmentos imutáveis
shards
replicas
ranking por relevância
BM25 ou algoritmos similares
```

## Arquitetura distribuída

Normalmente baseada em shards e réplicas. Os documentos são indexados em partições e replicados para disponibilidade e paralelismo de busca.

## Finalidade de projeto

Foram desenvolvidos para busca textual rápida, filtragem, autocomplete, ranqueamento e consulta em documentos indexados.

## Preferência arquitetural nativa

```text
Baixa latência de busca
Alta disponibilidade de leitura
Indexação distribuída
Consulta textual eficiente
```

## Tendência PACELC

```text
PA/EL
```

A indexação frequentemente é eventual. O documento recém-criado no banco principal pode não aparecer imediatamente no índice de busca.

## Cenários adequados

```text
busca textual
autocomplete
filtros por relevância
logs pesquisáveis
catálogos pesquisáveis
busca geográfica indexada
ranking
```

## Limitações

```text
não deve ser fonte primária de verdade
consistência eventual de indexação
atualizações frequentes podem ter custo alto
modelagem de índice deve acompanhar padrões de busca
```

---

# 11. Banco Colunar Analítico / OLAP

## Exemplos

```text
ClickHouse
Apache Druid
Apache Pinot
Snowflake
BigQuery
Amazon Redshift
Databricks SQL
DuckDB em modo analítico local
```

## Modelo de dados

Organiza os dados por colunas, em vez de linhas, favorecendo leitura analítica e agregações massivas.

## Arquitetura interna

A arquitetura típica inclui:

```text
armazenamento colunar
compressão por coluna
execução vetorizada
particionamento
segmentação
processamento MPP
agregações distribuídas
leitura seletiva de colunas
```

## Arquitetura distribuída

Muitos bancos OLAP usam arquitetura MPP — Massively Parallel Processing — com separação entre armazenamento e computação em soluções cloud.

## Finalidade de projeto

Foram desenvolvidos para analytics, BI, agregações, relatórios e consultas sobre grandes volumes históricos.

## Preferência arquitetural nativa

```text
Throughput analítico
Compressão
Leitura massiva
Agregação rápida
Escalabilidade para relatórios
```

## Tendência PACELC

```text
PA/EL
```

Normalmente privilegiam performance analítica, disponibilidade de consulta e latência aceitável sobre consistência transacional imediata.

## Cenários adequados

```text
BI
dashboards
relatórios
analytics
funis de conversão
métricas de negócio
eventos históricos
análise de comportamento
```

## Limitações

```text
não é ideal para transações OLTP
updates linha a linha podem ser caros
consistência geralmente depende de pipelines de ingestão
não substitui banco operacional
```

---

# 12. Banco Vetorial / Vector Database

## Exemplos

```text
Pinecone
Milvus
Weaviate
Qdrant
Chroma
FAISS como biblioteca de índice
pgvector sobre PostgreSQL
OpenSearch Vector Search
Elasticsearch Vector Search
```

## Modelo de dados

Armazena vetores numéricos, normalmente embeddings, associados a metadados.

Exemplo conceitual:

```text
id -> vetor -> metadados
```

## Arquitetura interna

A arquitetura típica inclui:

```text
índices ANN
HNSW
IVF
PQ
busca por similaridade
cosine similarity
euclidean distance
dot product
filtros por metadados
```

## Arquitetura distribuída

Bancos vetoriais dedicados podem distribuir índices entre nós. A distribuição precisa equilibrar recall, latência, custo de memória e atualização dos índices.

## Finalidade de projeto

Foram desenvolvidos para busca por similaridade, recuperação semântica e aplicações de IA.

## Preferência arquitetural nativa

```text
Busca aproximada rápida
Baixa latência semântica
Recuperação por similaridade
Escala em embeddings
```

## Tendência PACELC

```text
PA/EL ou PC/EC, dependendo da implementação
```

Exemplos:

```text
Bancos vetoriais dedicados tendem a PA/EL para busca rápida em escala.
pgvector herda o comportamento do PostgreSQL e tende mais a PC/EC.
```

## Cenários adequados

```text
RAG
busca semântica
recomendação
classificação por similaridade
deduplicação semântica
memória de IA
pesquisa por embeddings
```

## Limitações

```text
busca aproximada pode não retornar sempre o resultado matematicamente perfeito
índices podem consumir muita memória
atualizações frequentes podem impactar performance
metadados complexos podem exigir banco auxiliar
```

---

# 13. Banco In-Memory

## Exemplos

```text
Redis
Memcached
DragonflyDB
KeyDB
SAP HANA
VoltDB
```

## Modelo de dados

Varia por produto. Pode ser key-value, relacional, estrutura de dados, cache ou analítico em memória.

## Arquitetura interna

A arquitetura típica inclui:

```text
armazenamento primário em RAM
eviction policies
TTL
snapshot
append-only file
replicação
clusterização
estruturas de dados nativas
```

## Arquitetura distribuída

Pode usar cluster por partição de chave, replicação e failover. A consistência depende da estratégia de persistência e replicação.

## Finalidade de projeto

Foram desenvolvidos para latência extremamente baixa.

## Preferência arquitetural nativa

```text
Latência mínima
Operações rápidas
Dados temporários
Cache
Processamento em memória
```

## Tendência PACELC

```text
PA/EL
```

Em bancos in-memory usados como cache, a preferência natural é latência e disponibilidade. Em bancos in-memory transacionais, o comportamento pode se aproximar de PC/EC.

## Cenários adequados

```text
cache
sessões
leaderboards
rate limiting
filas leves
dados temporários
contadores
locks de curta duração
```

## Limitações

```text
memória é mais cara que disco
perda de dados é possível se persistência não estiver configurada
não deve substituir banco transacional sem projeto específico
clusterização pode introduzir consistência eventual
```

---

# 14. Banco de Eventos / Event Store / Log Persistente

## Exemplos

```text
EventStoreDB
Apache Kafka
Redpanda
Apache Pulsar
NATS JetStream
Pravega
```

## Modelo de dados

Armazena eventos em logs append-only, normalmente organizados por stream, tópico ou partição.

## Arquitetura interna

A arquitetura típica inclui:

```text
log append-only
offsets
partições
replicação
retenção
consumers
consumer groups
acknowledgements
replay de eventos
compactação opcional
```

## Arquitetura distribuída

Distribui eventos por partição. A ordem é geralmente garantida dentro da partição, não necessariamente globalmente.

## Finalidade de projeto

Foram desenvolvidos para mensageria persistente, event sourcing, integração assíncrona e pipelines de dados.

## Preferência arquitetural nativa

```text
Alta disponibilidade
Throughput
Durabilidade de eventos
Desacoplamento
Processamento assíncrono
Replay
```

## Tendência PACELC

```text
PA/EL ou Tunable
```

Muitos sistemas de eventos priorizam disponibilidade e throughput. Com configuração de quorum e acknowledgements fortes, podem aumentar consistência por partição.

## Cenários adequados

```text
event sourcing
mensageria
integração entre serviços
pipelines de dados
auditoria por eventos
processamento assíncrono
streaming
```

## Limitações

```text
não substitui banco relacional para estado consultável complexo
ordenação global é difícil
consistência depende de consumidores e processamento
reprocessamento exige idempotência
```

---

# 15. Banco Ledger / Imutável / Auditável

## Exemplos

```text
Amazon QLDB
immudb
Hyperledger Fabric
TerminusDB
bancos append-only auditáveis
```

## Modelo de dados

Armazena registros com histórico verificável e, em alguns casos, prova criptográfica de integridade.

## Arquitetura interna

A arquitetura típica inclui:

```text
append-only log
Merkle tree
hash encadeado
histórico imutável
assinatura ou prova criptográfica
verificação de integridade
```

## Arquitetura distribuída

Pode ser centralizada, permissionada ou distribuída, dependendo do produto.

## Finalidade de projeto

Foram desenvolvidos para auditoria, rastreabilidade, compliance e integridade histórica.

## Preferência arquitetural nativa

```text
Integridade
Imutabilidade
Auditoria
Rastreabilidade
Não-repúdio
```

## Tendência PACELC

```text
PC/EC
```

A consistência e a integridade histórica são mais importantes que disponibilidade irrestrita ou latência mínima.

## Cenários adequados

```text
auditoria financeira
compliance
histórico legal
rastreabilidade de transações
cadeia de custódia
registros sensíveis
```

## Limitações

```text
não é banco genérico para alta mutabilidade
consultas operacionais podem ser menos flexíveis
armazenamento histórico cresce continuamente
complexidade maior que banco transacional comum
```

---

# 16. Banco Blockchain / Ledger Descentralizado

## Exemplos

```text
Bitcoin
Ethereum
Solana
Cardano
Hyperledger Fabric
Corda
```

## Modelo de dados

Armazena transações em ledger distribuído, com consenso entre participantes da rede.

## Arquitetura interna

A arquitetura típica inclui:

```text
blocos
transações
consenso distribuído
replicação entre nós
assinaturas criptográficas
estado global ou UTXO
smart contracts em algumas redes
```

## Arquitetura distribuída

É descentralizada por design. Nós independentes validam e replicam o estado da rede.

## Finalidade de projeto

Foram desenvolvidos para manter um registro compartilhado entre partes que não necessariamente confiam entre si.

## Preferência arquitetural nativa

```text
Descentralização
Imutabilidade
Resistência à censura
Consenso entre partes independentes
Verificabilidade pública ou permissionada
```

## Tendência PACELC

```text
PA/EL com consistência final, ou PC/EC em blockchains permissionadas específicas
```

Redes públicas normalmente aceitam latência alta e finalidade eventual. Redes permissionadas podem oferecer consistência mais forte com menor descentralização.

## Cenários adequados

```text
ativos digitais
contratos inteligentes
registro entre organizações sem autoridade central
rastreamento interorganizacional
tokens
liquidação descentralizada
```

## Limitações

```text
latência alta
baixo throughput comparado a bancos tradicionais
complexidade operacional
custo de transação
não é indicado quando existe autoridade central confiável
```

---

# 17. Banco Geoespacial

## Exemplos

```text
PostGIS
Oracle Spatial
SQL Server Spatial
MongoDB Geospatial
Elasticsearch Geo
OpenSearch Geo
```

## Modelo de dados

Armazena e consulta objetos espaciais:

```text
pontos
linhas
polígonos
multipolígonos
coordenadas
sistemas de referência espacial
```

## Arquitetura interna

A arquitetura típica inclui:

```text
índices espaciais
R-tree
GiST
SP-GiST
geohash
quadtrees
cálculos geométricos
operações de interseção, distância e contenção
```

## Arquitetura distribuída

Depende do motor base. PostGIS herda PostgreSQL; Elasticsearch Geo herda a arquitetura distribuída de search engine.

## Finalidade de projeto

Foram desenvolvidos para dados de localização, mapas, distância e análise espacial.

## Preferência arquitetural nativa

```text
Consulta espacial eficiente
Precisão geométrica
Filtragem por localização
Operações geográficas
```

## Tendência PACELC

```text
Depende do motor base
```

Exemplos:

```text
PostGIS sobre PostgreSQL tende a PC/EC.
Elasticsearch Geo tende a PA/EL.
MongoDB Geospatial tende a Tunable.
```

## Cenários adequados

```text
mapas
entregas
busca por proximidade
áreas de cobertura
rotas
geofencing
endereços
pontos de interesse
```

## Limitações

```text
consultas espaciais complexas podem ser custosas
precisão depende do sistema de coordenadas
indexação espacial deve ser planejada
operações geográficas podem exigir normalização dos dados
```

---

# 18. Banco Orientado a Objetos

## Exemplos

```text
ObjectDB
db4o
Versant
ObjectStore
```

## Modelo de dados

Persiste objetos diretamente, preservando estrutura próxima ao modelo da linguagem de programação.

## Arquitetura interna

A arquitetura típica inclui:

```text
identidade de objeto
referências entre objetos
serialização
persistência transparente
navegação por objetos
```

## Arquitetura distribuída

Geralmente limitada ou menos comum em arquiteturas modernas distribuídas.

## Finalidade de projeto

Foram desenvolvidos para reduzir a diferença entre modelo de objetos da aplicação e modelo persistente.

## Preferência arquitetural nativa

```text
Proximidade com orientação a objetos
Persistência transparente
Navegação por referência
Consistência local
```

## Tendência PACELC

```text
PC/EC ou não aplicável em uso local
```

## Cenários adequados

```text
sistemas embarcados específicos
aplicações fortemente orientadas a objetos
projetos legados
modelos com navegação de objetos persistentes
```

## Limitações

```text
baixa adoção moderna
menor interoperabilidade
dependência forte da linguagem
menor ecossistema que SQL e NoSQL populares
```

---

# 19. Banco Hierárquico

## Exemplos

```text
IBM IMS
sistemas mainframe legados
```

## Modelo de dados

Organiza dados em estrutura de árvore:

```text
pai -> filho -> subfilho
```

## Arquitetura interna

A arquitetura típica inclui:

```text
registros hierárquicos
navegação por caminho
estrutura pai-filho
armazenamento otimizado para hierarquias fixas
```

## Arquitetura distribuída

Normalmente associada a ambientes legados e mainframes, não a distribuição horizontal moderna.

## Finalidade de projeto

Foram desenvolvidos para estruturas naturalmente hierárquicas e acesso previsível por caminho.

## Preferência arquitetural nativa

```text
Consistência
Previsibilidade
Hierarquia rígida
Desempenho em caminhos conhecidos
```

## Tendência PACELC

```text
PC/EC ou não aplicável em ambientes single-node/mainframe
```

## Cenários adequados

```text
sistemas legados
mainframes
estruturas administrativas rígidas
registros altamente hierárquicos
```

## Limitações

```text
baixa flexibilidade
relacionamentos muitos-para-muitos são difíceis
não é comum para novos sistemas
consultas ad hoc são limitadas
```

---

# 20. Banco em Rede — Network Database

## Exemplos

```text
IDMS
TurboIMAGE
sistemas CODASYL
```

## Modelo de dados

Utiliza registros conectados por ponteiros, permitindo relacionamentos mais flexíveis que o modelo hierárquico.

## Arquitetura interna

A arquitetura típica inclui:

```text
registros
sets
ponteiros
navegação explícita
relacionamentos diretos entre registros
```

## Arquitetura distribuída

Normalmente associada a sistemas legados, com distribuição moderna limitada.

## Finalidade de projeto

Foi desenvolvido para representar relações complexas antes da ampla adoção do modelo relacional.

## Preferência arquitetural nativa

```text
Consistência
Controle explícito de navegação
Relacionamentos por ponteiros
Performance em caminhos conhecidos
```

## Tendência PACELC

```text
PC/EC ou não aplicável em uso local/legado
```

## Cenários adequados

```text
sistemas legados
ambientes mainframe
aplicações antigas com navegação por registros
```

## Limitações

```text
alta complexidade de manutenção
baixo uso moderno
consultas declarativas limitadas
forte acoplamento entre aplicação e estrutura física
```

---

# 21. Banco Multimodelo

## Exemplos

```text
ArangoDB
OrientDB
Azure Cosmos DB
Fauna
MarkLogic
Couchbase
SurrealDB
```

## Modelo de dados

Combina múltiplos modelos no mesmo sistema, como:

```text
documentos
grafos
key-value
relacional
busca
JSON
colunar
```

## Arquitetura interna

A arquitetura varia por produto. Normalmente oferece múltiplas APIs ou múltiplos mecanismos de consulta sobre um mesmo núcleo de armazenamento.

## Arquitetura distribuída

Pode ser distribuído por partição, replicação, região, quorum e consistência configurável, dependendo do produto.

## Finalidade de projeto

Foi desenvolvido para permitir múltiplos modelos de dados em uma única plataforma.

## Preferência arquitetural nativa

```text
Flexibilidade
Unificação de modelos
Redução de múltiplos bancos separados
APIs diversas
```

## Tendência PACELC

```text
Tunable
```

O comportamento depende fortemente do produto, da API usada e da configuração de consistência.

## Cenários adequados

```text
aplicações com documentos e grafos
sistemas com múltiplos padrões de acesso
projetos que precisam reduzir número de tecnologias
catálogos complexos
plataformas de dados flexíveis
```

## Limitações

```text
risco de complexidade conceitual
nem sempre cada modelo é tão eficiente quanto uma solução especializada
lock-in de plataforma
configuração de consistência pode ser complexa
```

---

# 22. Banco Embedded / Local

## Exemplos

```text
SQLite
DuckDB
RocksDB
LevelDB
LMDB
H2
HSQLDB
```

## Modelo de dados

Varia por produto:

```text
SQLite: relacional local
DuckDB: analítico local colunar
RocksDB/LevelDB/LMDB: key-value embutido
```

## Arquitetura interna

A arquitetura típica inclui:

```text
biblioteca embutida
arquivo local
engine no processo da aplicação
sem servidor dedicado
baixo overhead
persistência local
```

## Arquitetura distribuída

Não possui distribuição nativa no sentido clássico. A aplicação é responsável por sincronização, replicação ou backup externo.

## Finalidade de projeto

Foram desenvolvidos para armazenamento local, aplicações embarcadas, protótipos, dispositivos, testes e processamento local.

## Preferência arquitetural nativa

```text
Simplicidade
Baixa latência local
Portabilidade
Consistência local
Baixo custo operacional
```

## Tendência PACELC

```text
Não aplicável ou PC/EC local
```

Como não há cluster distribuído por padrão, PACELC não é o eixo principal de análise.

## Cenários adequados

```text
aplicações desktop
mobile
edge computing
prototipagem
testes automatizados
analytics local
cache persistente local
armazenamento embarcado
```

## Limitações

```text
não escala horizontalmente por padrão
concorrência pode ser limitada, dependendo do produto
sincronização entre dispositivos exige solução adicional
não substitui banco servidor em aplicações multiusuário grandes
```

---

# 23. Banco de Cache

## Exemplos

```text
Redis
Memcached
DragonflyDB
KeyDB
Hazelcast
```

## Modelo de dados

Normalmente key-value, com TTL e políticas de expiração. Alguns oferecem estruturas adicionais como listas, sets, sorted sets, hashes e streams.

## Arquitetura interna

A arquitetura típica inclui:

```text
RAM-first
eviction policy
TTL
replicação
cluster por chave
persistência opcional
pub/sub
estruturas de dados em memória
```

## Arquitetura distribuída

Pode usar particionamento por chave e réplicas para escalabilidade e disponibilidade.

## Finalidade de projeto

Foi desenvolvido para reduzir latência, descarregar o banco principal e armazenar dados temporários.

## Preferência arquitetural nativa

```text
Baixa latência
Alta disponibilidade
Dados temporários
Acesso rápido
Escala por chave
```

## Tendência PACELC

```text
PA/EL
```

O cache normalmente aceita inconsistência temporária porque não deve ser a fonte primária da verdade.

## Cenários adequados

```text
cache de consultas
cache de sessões
rate limiting
tokens temporários
cache de autenticação
filas leves
leaderboards
```

## Limitações

```text
não deve ser fonte principal de dados críticos
expiração e invalidação são difíceis
risco de cache stampede
consistência depende da estratégia de atualização
```

---

# 24. Banco de Fila / Message Queue Persistente

## Exemplos

```text
RabbitMQ
Apache Kafka
Redpanda
ActiveMQ
Apache Pulsar
NATS JetStream
Amazon SQS
Google Pub/Sub
```

## Modelo de dados

Trabalha com mensagens, filas, tópicos, consumidores, acknowledgements e reprocessamento.

## Arquitetura interna

A arquitetura típica inclui:

```text
brokers
queues
topics
partitions
acknowledgements
retry
dead-letter queue
retention
persistent log
consumer groups
```

## Arquitetura distribuída

Pode distribuir filas e tópicos entre brokers. Alguns sistemas priorizam ordenação por partição; outros priorizam roteamento e confirmação de mensagens.

## Finalidade de projeto

Foi desenvolvido para comunicação assíncrona, desacoplamento e processamento confiável de tarefas.

## Preferência arquitetural nativa

```text
Disponibilidade
Durabilidade de mensagens
Desacoplamento
Processamento assíncrono
Escala de consumidores
```

## Tendência PACELC

```text
PA/EL ou Tunable
```

Com acks e quorum fortes, pode favorecer consistência. Com foco em throughput e disponibilidade, tende a PA/EL.

## Cenários adequados

```text
jobs assíncronos
notificações
integração entre serviços
processamento em background
retentativas
pipelines de eventos
orquestração distribuída
```

## Limitações

```text
não substitui banco transacional
ordenação global é difícil
mensagens duplicadas podem ocorrer
consumidores devem ser idempotentes
observabilidade é essencial
```

---

# 25. Banco XML

## Exemplos

```text
BaseX
eXist-db
MarkLogic
Sedna
Oracle XML DB
```

## Modelo de dados

Armazena documentos XML e permite consultas por XPath e XQuery.

## Arquitetura interna

A arquitetura típica inclui:

```text
índices estruturais XML
índices textuais
XPath
XQuery
validação por schema
armazenamento documental
```

## Arquitetura distribuída

Depende do produto. Alguns são locais; outros, como MarkLogic, possuem arquitetura distribuída.

## Finalidade de projeto

Foi desenvolvido para documentos XML estruturados, integração enterprise e sistemas que dependem de padrões XML.

## Preferência arquitetural nativa

```text
Fidelidade documental
Consulta estrutural
Validação por schema
Compatibilidade com padrões XML
```

## Tendência PACELC

```text
PC/EC ou Tunable, dependendo do produto
```

## Cenários adequados

```text
documentos regulatórios
integração governamental
sistemas enterprise legados
XML normativo
publicação estruturada
```

## Limitações

```text
XML é menos usado em novos sistemas web que JSON
consultas podem ser complexas
ecossistema menor que bancos SQL e document JSON
pode ser excessivo para aplicações modernas simples
```

---

# 26. Banco de Conteúdo / ECM / Metadata Store

## Exemplos

```text
Alfresco
SharePoint
Documentum
Nuxeo
sistemas ECM
object storage com metadata database
```

## Modelo de dados

Armazena documentos, arquivos, metadados, permissões, versões e histórico.

## Arquitetura interna

A arquitetura típica inclui:

```text
storage de arquivo ou objeto
metadata database
índice de busca
controle de versão
permissões
workflow documental
auditoria
```

## Arquitetura distribuída

Normalmente combina banco transacional para metadados, storage distribuído para arquivos e search engine para busca textual.

## Finalidade de projeto

Foi desenvolvido para gestão documental, controle de arquivos, permissões e versionamento.

## Preferência arquitetural nativa

```text
Integridade de metadados
Controle de acesso
Versionamento
Auditoria
Disponibilidade de documentos
```

## Tendência PACELC

```text
Mista
```

Normalmente:

```text
metadados: PC/EC
busca textual: PA/EL
storage de arquivos: depende da arquitetura
```

## Cenários adequados

```text
gestão documental
arquivos corporativos
contratos
versionamento de documentos
repositórios institucionais
permissões documentais
```

## Limitações

```text
arquitetura composta
busca pode ser eventualmente consistente
permissões exigem modelagem cuidadosa
alto volume de arquivos exige política de storage
```

---

# 27. Banco de Dados em Grafo Analítico / Graph Analytics

## Exemplos

```text
TigerGraph
GraphX
GraphFrames
Neo4j Graph Data Science
Amazon Neptune Analytics
```

## Modelo de dados

Focado em grafos grandes para algoritmos analíticos.

## Arquitetura interna

A arquitetura típica inclui:

```text
processamento paralelo de grafos
algoritmos de centralidade
PageRank
community detection
shortest path
propagação em grafos
execução distribuída
```

## Arquitetura distribuída

Geralmente distribuída para processamento paralelo de grandes grafos.

## Finalidade de projeto

Foi desenvolvido para análise em massa de conexões e não apenas para transações de relacionamento em tempo real.

## Preferência arquitetural nativa

```text
Processamento analítico
Escala horizontal
Análise de relacionamento em massa
Throughput
```

## Tendência PACELC

```text
PA/EL ou PC/EC, dependendo se o foco é analítico ou transacional
```

## Cenários adequados

```text
fraude em larga escala
ranking de influência
clusters sociais
recomendação analítica
análise de rede
ciência de dados em grafos
```

## Limitações

```text
não substitui necessariamente um banco de grafo transacional
pode exigir pipelines de carga
resultados analíticos podem ser derivados e não transacionais
```

---

# 28. Banco de Dados para Data Lake / Lakehouse

## Exemplos

```text
Delta Lake
Apache Iceberg
Apache Hudi
Databricks Lakehouse
Athena sobre S3
Trino/Presto sobre lakehouse
```

## Modelo de dados

Organiza dados em arquivos colunares ou estruturados, normalmente em object storage, com metadados transacionais.

## Arquitetura interna

A arquitetura típica inclui:

```text
object storage
arquivos Parquet/ORC/Avro
catálogo de metadados
snapshots
schema evolution
particionamento
compaction
transações sobre arquivos
```

## Arquitetura distribuída

Computação e armazenamento são separados. Engines distribuídas consultam dados no storage.

## Finalidade de projeto

Foi desenvolvido para analytics, machine learning, histórico de dados e consolidação de dados em larga escala.

## Preferência arquitetural nativa

```text
Escala de armazenamento
Custo eficiente
Analytics
Histórico
Interoperabilidade entre engines
```

## Tendência PACELC

```text
PA/EL ou PC/EC parcial
```

Oferece consistência transacional em metadados e snapshots, mas a operação geral é voltada para analytics e pipelines, não OLTP de baixa latência.

## Cenários adequados

```text
data lake
data warehouse moderno
machine learning
histórico de eventos
analytics avançado
integração de dados brutos e tratados
```

## Limitações

```text
não é banco transacional operacional
latência de consulta pode ser maior
pequenos updates frequentes são menos naturais
governança de dados é essencial
```

---

# 29. Resumo geral por tipo

| Tipo de banco            | Finalidade principal         | Preferência nativa             | Tendência PACELC                   |
| ------------------------ | ---------------------------- | ------------------------------ | ---------------------------------- |
| Relacional tradicional   | Transações e integridade     | Consistência                   | **PC/EC**                          |
| Distributed SQL / NewSQL | SQL com escala horizontal    | Consistência distribuída       | **PC/EC**                          |
| Key-value                | Acesso rápido por chave      | Latência e disponibilidade     | **PA/EL ou Tunable**               |
| Documentos               | Dados flexíveis em JSON/BSON | Flexibilidade                  | **Tunable**                        |
| Wide-column              | Alta escrita distribuída     | Disponibilidade e escrita      | **PA/EL ou Tunable**               |
| Grafo transacional       | Relacionamentos complexos    | Consistência de relacionamento | **PC/EC**                          |
| RDF / Triplestore        | Conhecimento semântico       | Consistência semântica         | **PC/EC**                          |
| Time-series              | Métricas e dados temporais   | Ingestão e consulta temporal   | **PA/EL ou PC/EC**                 |
| Search engine            | Busca textual e ranking      | Latência de busca              | **PA/EL**                          |
| OLAP colunar             | Analytics e agregações       | Throughput analítico           | **PA/EL**                          |
| Vetorial                 | Busca semântica              | Latência e similaridade        | **PA/EL ou PC/EC**                 |
| In-memory                | Operações em RAM             | Latência mínima                | **PA/EL**                          |
| Event store/log          | Eventos e replay             | Durabilidade e throughput      | **PA/EL ou Tunable**               |
| Ledger                   | Auditoria e imutabilidade    | Integridade                    | **PC/EC**                          |
| Blockchain               | Consenso descentralizado     | Descentralização               | **PA/EL ou consistência final**    |
| Geoespacial              | Localização e mapas          | Consulta espacial              | **Depende do motor**               |
| Orientado a objetos      | Persistência de objetos      | Proximidade com código         | **PC/EC ou não aplicável**         |
| Hierárquico              | Estruturas em árvore         | Consistência e previsibilidade | **PC/EC ou não aplicável**         |
| Network DB               | Registros conectados         | Navegação por ponteiros        | **PC/EC ou não aplicável**         |
| Multimodelo              | Múltiplos modelos            | Flexibilidade                  | **Tunable**                        |
| Embedded/local           | Armazenamento local          | Simplicidade                   | **Não aplicável ou PC/EC local**   |
| Cache                    | Dados temporários rápidos    | Latência e disponibilidade     | **PA/EL**                          |
| Fila persistente         | Mensageria                   | Disponibilidade e durabilidade | **PA/EL ou Tunable**               |
| XML                      | Documentos XML               | Fidelidade estrutural          | **PC/EC ou Tunable**               |
| ECM/conteúdo             | Arquivos e metadados         | Integridade documental         | **Mista**                          |
| Graph analytics          | Análise massiva de grafos    | Processamento paralelo         | **PA/EL ou PC/EC**                 |
| Lakehouse                | Analytics em data lake       | Escala e histórico             | **PA/EL com consistência parcial** |

---

# 30. Agrupamento por tendência PACELC

## 30.1 Bancos que tendem a PC/EC

Esses bancos priorizam consistência e integridade, tanto em partição de rede quanto em operação normal.

```text
PostgreSQL
MySQL/InnoDB
SQL Server
Oracle
Google Spanner
CockroachDB
YugabyteDB
TiDB
Neo4j transacional
GraphDB
Stardog
Amazon QLDB
immudb
PostGIS sobre PostgreSQL
SQLite localmente
```

## Características comuns

```text
transações ACID
constraints
integridade forte
controle de concorrência
consistência de leitura/escrita
maior rigor sobre validade dos dados
```

## Usos típicos

```text
dados oficiais do sistema
pagamentos
contas
permissões
estoque
cadastros
contratos
registros legais
operações críticas
```

---

## 30.2 Bancos que tendem a PA/EL

Esses bancos priorizam disponibilidade e baixa latência, aceitando consistência eventual ou relaxada em certos cenários.

```text
Redis
Memcached
Cassandra
ScyllaDB
DynamoDB em leituras eventualmente consistentes
Elasticsearch
OpenSearch
ClickHouse
InfluxDB
Prometheus
VictoriaMetrics
Kafka
Redpanda
Pinecone
Milvus
Qdrant
Meilisearch
Typesense
```

## Características comuns

```text
alta disponibilidade
baixa latência
escala horizontal
consistência eventual
replicação assíncrona
alta ingestão
leitura rápida
```

## Usos típicos

```text
cache
busca
logs
métricas
eventos
analytics
telemetria
busca vetorial
mensageria
ranking
```

---

## 30.3 Bancos tunáveis

Esses bancos permitem ajustar consistência, disponibilidade e latência por configuração.

```text
MongoDB
Cassandra
ScyllaDB
DynamoDB
Cosmos DB
Couchbase
Riak
Aerospike
ArangoDB
Fauna
```

## Mecanismos de ajuste

```text
read concern
write concern
consistency level
quorum de leitura
quorum de escrita
replication factor
número de réplicas
região
modo multi-master
modo primary-replica
acknowledgements
```

## Observação técnica

Um mesmo banco tunável pode se comportar como PC/EC em uma configuração e como PA/EL em outra. A classificação correta depende da topologia real de execução.

---

# 31. Relação entre finalidade e PACELC

## Dados transacionais

```text
Preferência: Consistência
Tendência PACELC: PC/EC
```

Exemplos:

```text
usuários
pagamentos
pedidos
assinaturas
estoque
permissões
contabilidade
```

## Dados temporários

```text
Preferência: Latência
Tendência PACELC: PA/EL
```

Exemplos:

```text
cache
sessões
tokens temporários
rate limit
```

## Dados de busca

```text
Preferência: Latência e disponibilidade
Tendência PACELC: PA/EL
```

Exemplos:

```text
índices de texto
autocomplete
ranking
filtros de catálogo
```

## Dados analíticos

```text
Preferência: Throughput e leitura massiva
Tendência PACELC: PA/EL
```

Exemplos:

```text
relatórios
dashboards
métricas de negócio
histórico de eventos
```

## Dados semânticos ou relacionais complexos

```text
Preferência: Consistência de relacionamento
Tendência PACELC: PC/EC
```

Exemplos:

```text
grafos
ontologias
permissões complexas
fraude
relacionamentos profundos
```

## Dados de evento

```text
Preferência: Durabilidade, ordenação por partição e disponibilidade
Tendência PACELC: PA/EL ou Tunable
```

Exemplos:

```text
eventos de domínio
mensagens
pipelines
integração assíncrona
replay
```

---

# 32. Critérios técnicos para escolha de banco

A escolha do banco deve considerar:

```text
modelo de dados
volume de leitura
volume de escrita
necessidade de transação
necessidade de consistência forte
latência aceitável
padrão de consulta
necessidade de busca textual
necessidade de analytics
necessidade de distribuição geográfica
necessidade de tolerância a falhas
custo operacional
maturidade da equipe
complexidade de manutenção
```

## Perguntas técnicas de decisão

```text
O dado é fonte primária da verdade?
Exige transação ACID?
Pode ficar temporariamente inconsistente?
Precisa ser pesquisável por texto?
Precisa de agregações massivas?
Precisa de baixa latência extrema?
Precisa de escala horizontal nativa?
A consulta principal é por chave?
A consulta principal é por relacionamento?
A consulta principal é por tempo?
A consulta principal é por similaridade vetorial?
```

---

# 33. Conclusão técnica

Cada família de banco de dados foi projetada para resolver um tipo específico de problema.

Bancos relacionais e distributed SQL foram desenvolvidos para consistência, integridade e transações.

Bancos key-value, cache, search engines, wide-column, time-series, OLAP e vetoriais dedicados foram desenvolvidos para desempenho, disponibilidade, escala horizontal, leitura rápida ou alta ingestão.

Bancos de grafo e RDF foram desenvolvidos para representar relações e significado, favorecendo consistência estrutural ou semântica.

Bancos de eventos foram desenvolvidos para durabilidade, replay, mensageria e desacoplamento entre sistemas.

Bancos tunáveis permitem ajustar o comportamento conforme necessidade operacional.

Dentro do PACELC, a classificação de um banco não depende apenas do nome do produto. Ela depende de sua arquitetura, topologia, replicação, quorum e configuração de consistência. Ainda assim, cada família possui uma vocação arquitetural predominante, que orienta sua tendência natural entre consistência, disponibilidade e latência.
