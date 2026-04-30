# Meu Agito - AWS Storage Plan

## Objetivo

Definir o plano de armazenamento de midia do Meu Agito usando Amazon S3 e Amazon CloudFront.

Este arquivo nao cria recursos.
Ele documenta as decisoes tecnicas que devem ser revisadas antes da criacao dos buckets, politicas e distribuicao CDN.

---

## Servicos alvo

- Amazon S3
- Amazon CloudFront

---

## Funcao do S3

O Amazon S3 sera usado para armazenar arquivos de midia do Meu Agito.

Tipos de midia previstos:

- avatars
- imagens de posts
- anexos de chat
- imagens de estabelecimentos
- imagens de eventos
- imagens de produtos/vitrine

---

## Funcao do CloudFront

O CloudFront sera usado para distribuir arquivos publicos ou controlados com menor latencia e melhor desempenho.

Uso previsto:

- CDN para midia publica
- entrega otimizada de imagens
- protecao de origem S3
- HTTPS para arquivos
- cache controlado

---

## Regra principal

O PostgreSQL nao deve armazenar arquivos pesados.

O banco deve armazenar apenas:

- URL publica ou URL controlada
- bucket
- storagePath
- mimeType
- size
- width
- height
- provider
- ownerId
- entityType
- entityId

---

## Estrutura de buckets ou prefixos

A estrutura final pode usar buckets separados ou um bucket com prefixos.

A decisao deve considerar:

- simplicidade operacional
- seguranca
- politicas de acesso
- custo de manutencao
- separacao entre midia publica e privada

---

## Prefixos recomendados

Se for usado um bucket principal, os prefixos recomendados sao:

- avatars/
- post-media/
- chat-attachments/
- establishment-media/
- event-media/
- product-media/

---

## Buckets separados opcionais

Se a decisao for por buckets separados, nomes logicos esperados:

- meu-agito-avatars
- meu-agito-post-media
- meu-agito-chat-attachments
- meu-agito-establishment-media
- meu-agito-event-media
- meu-agito-product-media

Os nomes finais devem ser definidos considerando disponibilidade global de nomes do S3.

---

## Midia publica

Pode ser publica ou distribuida via CloudFront:

- avatar publico
- imagem de post publico
- imagem de estabelecimento
- imagem de evento publico
- imagem de produto/vitrine

Mesmo midia publica nao deve exigir bucket publico aberto sem necessidade. Preferir CloudFront com origem S3 protegida quando possivel.

---

## Midia privada ou sensivel

Deve exigir cuidado adicional:

- anexos de chat
- midia removida
- midia em moderacao
- conteudo denunciado
- conteudo restrito

Estrategias possiveis:

- URLs assinadas
- CloudFront signed URLs/cookies
- rotas backend autorizadas
- separacao por prefixo ou bucket privado

---

## Seguranca obrigatoria

- Bloquear acesso publico amplo por padrao.
- Nao permitir escrita direta sem autorizacao.
- Validar MIME type.
- Validar tamanho maximo.
- Validar extensao quando aplicavel.
- Validar ownership.
- Nao confiar em nome original do arquivo.
- Gerar storagePath seguro.
- Nao expor secrets de AWS no frontend.
- Nao permitir overwrite indevido.
- Nao servir midia privada como publica.

---

## Integracao backend

O backend deve possuir uma camada propria de storage:

- StorageService
- MediaService
- provider configuravel
- integracao com S3
- geracao de path
- upload
- delete
- metadados
- tratamento de erro
- validacao de autorizacao

O codigo nao deve chamar S3 diretamente espalhado por controllers.

---

## Modelo de midia sugerido

Media:

- id
- ownerId
- entityType
- entityId
- provider
- bucket
- storagePath
- publicUrl
- mimeType
- size
- width
- height
- status
- createdAt
- updatedAt

Status sugeridos:

- ACTIVE
- PENDING
- DELETED
- BLOCKED

---

## Integracao frontend

O app mobile deve consumir URLs ou endpoints retornados pela API.

Regras:

- nao colocar credenciais AWS no app
- nao fazer upload direto ao S3 sem fluxo seguro
- exibir estados de loading, erro e vazio
- tratar falha de upload
- permitir retry quando aplicavel
- otimizar preview de imagens

---

## CloudFront

Configuracoes esperadas:

- HTTPS obrigatorio
- origem S3
- cache control adequado
- politicas de cache por tipo de midia
- compressao quando aplicavel
- protecao da origem S3
- dominio proprio ou subdominio no futuro

---

## Lifecycle

Avaliar lifecycle policies para:

- midia deletada
- arquivos temporarios
- anexos antigos
- versoes antigas
- uploads abandonados

Nao criar lifecycle destrutivo sem regra clara de produto.

---

## Observabilidade

Monitorar:

- erros de upload
- erros de download
- tamanho medio de arquivos
- uso de storage
- trafego CloudFront
- custos S3/CloudFront

---

## Criterios de aceite antes do deploy

- Nenhum avatar salvo como base64 no banco.
- Nenhum anexo de chat salvo como data URI no banco.
- Backend usa StorageService central.
- S3 armazena arquivos.
- Banco armazena somente metadados, URL e path.
- Upload valida MIME e tamanho.
- Upload valida autorizacao.
- Frontend consome URLs reais.
- Nao ha credenciais AWS no frontend.
- CloudFront planejado para midia publica.
- Midia privada nao fica exposta indevidamente.

---

## Pendencias antes da criacao dos recursos

- Definir bucket unico ou buckets separados.
- Definir nomes finais dos buckets.
- Definir quais midias sao publicas.
- Definir quais midias exigem URL assinada.
- Definir limites de tamanho por tipo de midia.
- Definir tipos MIME permitidos.
- Definir estrategia CloudFront.
- Definir retencao/lifecycle.

---

## Proximo documento relacionado

AWS_BACKEND_DEPLOY_PLAN.md
