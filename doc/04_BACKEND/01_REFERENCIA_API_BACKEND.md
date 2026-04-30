# REFERENCIA API BACKEND (CANONICA)

Atualizado em: 2026-04-30
Fonte de verdade: controllers em `backend/src/modules/**/**.controller.ts`

## Base URL

- Local API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## Autenticacao

- Rotas protegidas usam `Authorization: Bearer <accessToken>`.
- Refresh token usa `POST /auth/refresh` com `Authorization: Bearer <refreshToken>`.
- WebSocket (namespace `/chat`) aceita token em `handshake.auth.token` ou header `Authorization`.

## Health (1 endpoint)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/health` | Nao | Health check da aplicacao + banco + cache |

## Legal publico (4 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/legal/privacy-policy` | Nao | HTML publico da politica de privacidade |
| GET | `/legal/terms-of-use` | Nao | HTML publico dos termos de uso |
| GET | `/legal/privacy-policy.json` | Nao | JSON estruturado da politica |
| GET | `/legal/terms-of-use.json` | Nao | JSON estruturado dos termos |

## Media (5 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| POST | `/media/upload/:entityType` | Access token | Upload generico de midia (`avatar`, `post`, `chat`, `event`, `establishment`, `product`) |
| POST | `/media/products/:productId` | Access token | Upload de midia de produto |
| GET | `/media/entity/:entityType/:entityId` | Nao | Lista midias de uma entidade |
| GET | `/media/protected/:mediaId` | Access token | Serve midia protegida com autorizacao |
| GET | `/media/local/:folder/:filename` | Nao | Fallback local de desenvolvimento |

## Auth (13 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| POST | `/auth/signup` | Nao | Cadastro com `profileType`, `email`, `firstName`, `lastName`, `birthDate`, `password`, `passwordConfirm` |
| POST | `/auth/login` | Nao | Login email/senha |
| POST | `/auth/refresh` | Refresh token | Renovacao de tokens |
| POST | `/auth/logout` | Access token | Invalida refresh tokens do usuario |
| POST | `/auth/request-password-reset` | Nao | Solicita reset |
| POST | `/auth/reset-password` | Nao | Reset com token |
| POST | `/auth/change-password` | Access token | Troca senha autenticado |
| POST | `/auth/verify-email` | Nao | Verifica email por token |
| POST | `/auth/resend-verification-email` | Nao | Reenvia verificacao |
| POST | `/auth/enable-2fa` | Access token | Gera secret + QR |
| POST | `/auth/verify-2fa` | Access token | Ativa 2FA |
| POST | `/auth/disable-2fa` | Access token | Desativa 2FA |
| POST | `/auth/verify-2fa-login` | Nao | Valida 2FA no fluxo de login |

## Users (15 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/users/me` | Access token | Usuario autenticado |
| GET | `/users/:id/public-profile` | Nao | Perfil publico |
| GET | `/users/:id/stats` | Nao | Estatisticas |
| GET | `/users/:id/is-following` | Access token | Se usuario logado segue `:id` |
| GET | `/users/:id/followers` | Nao | Lista seguidores |
| GET | `/users/:id/following` | Nao | Lista seguindo |
| GET | `/users` | Nao | Lista paginada |
| GET | `/users/:id` | Nao | Usuario por id |
| PUT | `/users/me` | Access token | Atualiza usuario logado |
| PUT | `/users/:id` | Access token | Atualiza usuario pelo proprio dono |
| PUT | `/users/me/profile` | Access token | Atualiza bio/avatar/location etc |
| POST | `/users/me/avatar` | Access token | Upload multipart do avatar (`file`) |
| DELETE | `/users/:id` | Access token | Soft delete da propria conta |
| POST | `/users/:id/follow` | Access token | Seguir usuario |
| DELETE | `/users/:id/follow` | Access token | Deixar de seguir |

## Feed social e posts (19 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/feed/agito` | Access token | Feed social principal com cursor pagination e modos `mixed`, `following`, `global`, `nearby` |
| POST | `/posts` | Access token | Criar post |
| POST | `/posts/media` | Access token | Upload de midia de post |
| GET | `/posts/feed` | Access token | Feed personalizado legado |
| GET | `/posts/explore` | Nao | Feed publico |
| GET | `/posts/:id` | Nao | Post por id |
| GET | `/posts/user/:userId` | Nao | Posts de usuario |
| PUT | `/posts/:id` | Access token | Atualizar post |
| DELETE | `/posts/:id` | Access token | Deletar post |
| POST | `/posts/:id/like` | Access token | Curtir post |
| DELETE | `/posts/:id/like` | Access token | Descurtir post |
| GET | `/posts/:id/liked` | Access token | Verificar curtida |
| GET | `/posts/:id/likes` | Nao | Lista curtidas |
| POST | `/posts/:id/comments` | Access token | Criar comentario |
| GET | `/posts/:id/comments` | Nao | Listar comentarios |
| PUT | `/posts/comments/:commentId` | Access token | Editar comentario |
| DELETE | `/posts/comments/:commentId` | Access token | Deletar comentario |
| POST | `/posts/comments/:commentId/like` | Access token | Curtir comentario |
| DELETE | `/posts/comments/:commentId/like` | Access token | Descurtir comentario |

## Search (7 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/search/global` | Access token | Busca global |
| GET | `/search/posts` | Nao | Busca avancada de posts |
| GET | `/search/users` | Nao | Busca usuarios |
| GET | `/search/events` | Nao | Busca eventos com `distanceKm` quando houver coordenadas |
| GET | `/search/establishments` | Nao | Busca estabelecimentos com `distanceKm`, `subcategory` e `openNow` |
| GET | `/search/autocomplete` | Nao | Sugestoes |
| GET | `/search/trending` | Nao | Tendencias publicas |

## Events (10 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| POST | `/events` | Access token | Criar evento |
| GET | `/events` | Nao | Listar eventos |
| GET | `/events/:id` | Nao | Evento por id |
| PUT | `/events/:id` | Access token | Atualizar evento |
| DELETE | `/events/:id` | Access token | Deletar evento |
| POST | `/events/:id/attend` | Access token | Confirmar presenca |
| DELETE | `/events/:id/attend` | Access token | Cancelar presenca |
| GET | `/events/:id/attendees` | Nao | Lista attendees |
| POST | `/events/:id/reviews` | Access token | Criar review |
| GET | `/events/:id/reviews` | Nao | Listar reviews |

## Establishments (11 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| POST | `/establishments` | Access token | Criar estabelecimento |
| POST | `/establishments/:id/media` | Access token | Upload de `gallery`, `logo` ou `cover` |
| GET | `/establishments` | Nao | Listar estabelecimentos |
| GET | `/establishments/me/owned` | Access token | Pagina da conta `ESTABLISHMENT` autenticada |
| GET | `/establishments/:id` | Nao | Estabelecimento por id |
| PUT | `/establishments/:id` | Access token | Atualizar estabelecimento |
| DELETE | `/establishments/:id` | Access token | Deletar estabelecimento |
| POST | `/establishments/:id/reviews` | Access token | Criar review |
| GET | `/establishments/:id/reviews` | Nao | Listar reviews |
| POST | `/establishments/:id/favorite` | Access token | Favoritar |
| DELETE | `/establishments/:id/favorite` | Access token | Desfavoritar |

## Products / vitrine publica (6 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/establishments/:id/products` | Nao | Lista produtos publicos de um estabelecimento |
| GET | `/products/:id` | Nao | Detalhe publico de um produto |
| POST | `/establishments/:id/products` | Access token | Criar item da vitrine |
| PUT | `/establishments/:id/products/:productId` | Access token | Atualizar item da vitrine |
| DELETE | `/establishments/:id/products/:productId` | Access token | Arquivar item da vitrine |
| POST | `/establishments/:id/products/:productId/media` | Access token | Upload de imagem principal do produto |

## Chat REST (11 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| POST | `/chat/conversations` | Access token | Criar/obter conversa |
| GET | `/chat/conversations` | Access token | Listar conversas |
| GET | `/chat/conversations/:id` | Access token | Detalhes da conversa |
| GET | `/chat/conversations/:id/messages` | Access token | Historico de mensagens |
| POST | `/chat/conversations/:id/messages` | Access token | Enviar mensagem com anexo opcional |
| PUT | `/chat/messages/:id` | Access token | Editar mensagem |
| DELETE | `/chat/messages/:id` | Access token | Deletar mensagem |
| PUT | `/chat/conversations/:id/read` | Access token | Marcar como lida |
| GET | `/chat/conversations/search/query` | Access token | Buscar conversas (`q`) |
| GET | `/chat/conversations/unread/count` | Access token | Contagem de nao lidas |
| DELETE | `/chat/conversations/:id` | Access token | Arquivar conversa |

## Notifications (9 endpoints)

| Metodo | Rota | Auth | Observacao |
|---|---|---|---|
| GET | `/notifications` | Access token | Listar notificacoes |
| GET | `/notifications/unread/count` | Access token | Contagem de nao lidas |
| GET | `/notifications/push-tokens` | Access token | Listar push tokens do usuario |
| POST | `/notifications/push-tokens` | Access token | Registrar push token |
| DELETE | `/notifications/push-tokens/:id` | Access token | Desativar um push token |
| POST | `/notifications/push-test` | Access token | Enviar push de teste para o usuario atual |
| PUT | `/notifications/:id/read` | Access token | Marcar uma notificacao como lida |
| PUT | `/notifications/read-all` | Access token | Marcar todas como lidas |
| DELETE | `/notifications/:id` | Access token | Excluir notificacao |

## WebSocket (namespace `/chat`)

### Client -> Server
- `conversation:join` (`{ conversationId }`)
- `conversation:leave` (`{ conversationId }`)
- `message:send` (`{ conversationId, content, fileUrl? }`)
- `typing:start` (`{ conversationId }`)
- `typing:stop` (`{ conversationId }`)
- `message:read` (`{ conversationId }`)
- `message:edit` (`{ messageId, conversationId, content }`)
- `message:delete` (`{ messageId, conversationId }`)

### Server -> Client
- `auth:error`
- `user:online`
- `user:offline`
- `conversation:joined`
- `conversation:left`
- `message:received`
- `message:error`
- `typing:user`
- `message:marked_read`
- `message:edited`
- `message:deleted`
- `notification`

## Observacoes de contrato

- Os contratos detalhados de body/response devem ser conferidos no Swagger para cada rota.
- O frontend normaliza `notification` como `notification:new` na camada de socket.
- Este arquivo e canonico para rotas e cobertura real dos modulos.
