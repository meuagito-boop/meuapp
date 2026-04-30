MEU AGITO
T_AGITO — Feed Social
Arquitetura de tela — Especificação completa v3
Posição 1 da barra · Feed humano da rede social · Fotos · Vídeos · Check-ins · Reposts
1. Identificação da Tela
Código	T_AGITO
Nome	Feed Social — Rede Social do Meu Agito
Tipo	Feed social vertical com stories horizontais no topo. Foco em conteúdo visual.
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0 — publicação, curtidas, comentários, reposts. Fase 1.2+ — check-in integrado com agendamentos.
Como é acessado	Posição 1 da barra de navegação inferior — ícone 👥 Social
Perfil do usuário	Foto circular do próprio usuário na linha de stories — 1º item à esquerda. Toque abre T_PERFIL_USUARIO.
Criar conteúdo	Botão ✚ Criar na barra (posição 2) — modal com 3 opções: Foto · Vídeo · Check-in
Scroll	Vertical infinito. Header e barra de navegação fixos. Stories fixos durante o scroll do feed.
Filosofia	Rede social de lifestyle e marketing local. Foco em fotos e vídeos de lugares e experiências.

2. T_AGITO vs T06 Home — Complementares, não concorrentes
Aspecto	T06 Home	T_AGITO — Feed Social
Curadoria	Algoritmo forte — seções por intenção	Algoritmo leve — seguidos + cronológico
Conteúdo	Estabelecimentos e eventos — descoberta	Pessoas e negócios — conexão e engajamento
Interação	Passiva — consome e navega	Ativa — curtir, comentar, repostar, criar
Acesso	Botão ★ (centro da barra)	Posição 1 — ícone 👥 Social
Formato	Cards por seção temática	Feed vertical contínuo estilo Instagram/Threads
Dados gerados	Alimenta ranking e relevância	Alimenta prova social e viralização

3. Estrutura Geral da Tela
Zona	Nome	Comportamento	Conteúdo
Z1	Header padrão	Fixo no topo	Logo M · 💬 Mensagens · 🔔 Notificações · ⋯ Painel
Z2	Linha de stories	Fixa abaixo do header	Foto do perfil do usuário · Botão + criar · Stories dos seguidos
Z3	Banner 'Ver X novos'	Aparece quando chegam posts	Banner laranja clicável que leva ao topo do feed
Z4	Feed de posts	Scroll vertical infinito	Cards de post em ordem cronológica com algoritmo leve
Z5	Barra de navegação	Fixa no rodapé	👥 Social (ativo) · ✚ Criar · ★ Home · 📋 Atividade · ⚙ Config

4. Header Padrão Global
Logo M	Quadrado laranja #E8640A, 36x36px, border-radius 10px, letra M branca. Sem ação.
💬 Mensagens	Ícone envelope. Badge laranja com não lidas. Abre T_CHAT.
🔔 Notificações	Ícone sino. Badge laranja com não lidas. Abre T13.
⋯ Painel	Ícone 3 pontos. Área de toque 44x44px. Abre PAINEL de opções.

5. Linha de Stories / Momentos
Fixa abaixo do header. Scroll horizontal. Não some durante o scroll do feed.

Item	Especificação	Ação
1º — Foto do usuário	Avatar circular 56x56px com borda laranja 2.5px. Label 'Você' abaixo.	Toque: abre T_PERFIL_USUARIO próprio
2º — Botão criar	Círculo 56x56px borda tracejada laranja. Ícone + laranja. Label 'Momento'.	Toque: abre modal ✚ Criar (mesma ação da barra)
Stories não vistos	Anel gradiente laranja→vermelho. Avatar 48x48px com borda branca 2px.	Toque: abre T_STORY visualizador
Stories já vistos	Anel cinza #2A2A2A. Avatar igual. Visualmente mais apagado.	Toque: reabre o story
Dev: Stories ordenados — não vistos primeiro (por recência), depois vistos. Foto do usuário e botão + fixos nas duas primeiras posições.

6. Algoritmo do Feed
Fase 1 — Seguidos	Posts de quem o usuário segue, ordenados por relevância (recência + engajamento recente).
Fase 2 — Complemento	Quando posts de seguidos se esgotam, complementa com posts populares da cidade do usuário.
Usuário novo	Começa 100% com conteúdo popular da cidade. Evita feed vazio no primeiro acesso.
Dislike no algoritmo	Posts com muitos dislikes de um usuário aparecem menos para ele. Contador de dislike NÃO é público.
Endpoint	GET /api/feed/agito?pagina={n}&limite=15. Backend calcula o mix — app nunca ordena localmente.

7. Anatomia do Card de Post
7.1 Cabeçalho do post
Elemento	Especificação	Ação
Avatar	36x36px. Usuário: circular. Estabelecimento: border-radius 9px. Borda 1px #2A2A2A.	Abre T_PERFIL do autor
Nome	Arial Bold 13px branco.	Abre T_PERFIL do autor
Lugar marcado 📍	Ícone pin + nome em laranja 11px. Aparece quando há localização marcada.	Abre T_PERFIL do estabelecimento
Tempo decorrido	'agora', '2min', '1h', '3h', 'Ontem', 'Seg', '12 jan'. Arial Regular 11px #555.	Sem ação
Botão ⋯	Ícone 3 pontos à extrema direita. 32x32px.	Sheet de opções do post

7.2 Mídia do post
Foto única	Largura 100%. Altura proporcional — mínimo 240px, máximo 480px. Toque: abre visualizador.
Vídeo	Largura 100%. Ícone ▶ sobre miniatura. Som desativado por padrão. Toque: reproduz inline.
Sem mídia	Não existe — todo post no T_AGITO obrigatoriamente tem foto ou vídeo.
Carrossel	Fase 1.2+: múltiplas fotos com swipe horizontal. Dots indicadores na base.

7.3 Legenda do post
Formato	Nome do autor em bold + texto da legenda em sequência — estilo Instagram.
Limite	Máximo 200 caracteres. Se ultrapassar: truncado com '... ver mais' laranja. Expande inline.
Menções	@handle em laranja — toque abre T_PERFIL do mencionado.
Hashtags	#tema em laranja — Fase 1.2+: filtra por hashtag.

7.4 Barra de reações
4 botões em linha. Like e Dislike são mutuamente exclusivos — ativar um cancela o outro automaticamente. Regra válida em todos os níveis: posts, comentários e respostas.

Pos.	Ícone	Inativo	Ativo	Comportamento
1	👍 Like	👍 cinza + contador	👍 laranja + contador	Cancela dislike se ativo. Animação scale 1→1.4→1 em 300ms.
2	👎 Dislike	👎 cinza + contador	👎 laranja + contador	Cancela like se ativo. Contador NÃO é público — alimenta algoritmo.
3	💬 Comentar	💬 cinza + contador	Sem estado ativo	Abre T_COMENTARIOS com teclado aberto. É ação, não toggle.
4	↗ Repostar	↗ cinza + contador	↗ verde quando repostou	Sheet: campo de texto opcional + preview do post original.

8. Sistema de Repost
Atribuição permanente	Repost sempre mostra 'Repostado por @handle e +X usuários · Ver mais'. Não pode ser ocultado.
Comentário opcional	Ao repostar: campo de texto opcional acima do preview do post original.
Preview do original	Card do post original dentro do repost — com avatar, nome, mídia e legenda.
Contador de reposts	Exibido no botão ↗ do post original. Fica verde quando o usuário já repostou.
'Ver mais'	Abre lista de quem repostou — paginada.

9. Modal de Criação — Botão ✚ (Posição 2 da barra)
Abre por cima da tela atual (bottom sheet). 3 opções de criação de conteúdo. NÃO é uma tela de navegação — é um overlay. Ao fechar: retorna exatamente para onde estava.

Opção	O que faz	Próximo passo	Observação
📸 Foto	Abre câmera no modo foto. Após captura: editor de legenda (máx 200 chars) + marcação de lugar opcional.	Publica no T_AGITO e no T_PERFIL_USUARIO.	
🎬 Vídeo	Abre câmera no modo vídeo. Duração máxima: 60 segundos. Após gravação: editor de legenda + marcação.	Publica no T_AGITO e no T_PERFIL_USUARIO.	
📍 Check-in	Abre busca de estabelecimento. Seleciona lugar + frase curta + nota 1–5 opcional.	Alimenta Z5 do Home + perfil do estabelecimento.	Fase 1.2+ integra com agendamentos.

10. Comentários — T_COMENTARIOS
Profundidade	Infinita — respostas a respostas sem limite de nível.
Acesso	Toque no botão 💬 Comentar de qualquer post abre T_COMENTARIOS com teclado já aberto.
Like/Dislike	Mutuamente exclusivos em todos os níveis — post, comentário e resposta.
Menções	@handle em qualquer nível — notifica o mencionado.
Moderação	Autor do post pode excluir qualquer comentário. Usuário pode excluir os próprios.

11. Fluxo Completo de Navegação
Elemento tocado	Ação	Destino	Observação
👥 Social (barra)	Toque	T_AGITO — scroll ao topo se já ativo	
Foto do usuário (stories)	Toque	T_PERFIL_USUARIO próprio	
Botão + criar (stories)	Toque	Modal ✚ Criar	
Story de seguido	Toque	T_STORY — visualizador	
Avatar ou nome do post	Toque	T_PERFIL do autor	
Lugar marcado 📍	Toque	T_PERFIL do estabelecimento	
👍 Like	Toque	Toggle like — cancela dislike	
👎 Dislike	Toque	Toggle dislike — cancela like	
💬 Comentar	Toque	T_COMENTARIOS com teclado aberto	
↗ Repostar	Toque	Sheet de repost	
⋯ opções do post	Toque	Sheet: Denunciar | Silenciar | Copiar link	
💬 Mensagens (header)	Toque	T_CHAT	
🔔 Notificações (header)	Toque	T13	
⋯ Painel (header)	Toque	Painel de opções	
✚ Criar (barra)	Toque	Modal de criação (overlay)	Não navega
★ Home (barra)	Toque	T06 Home	

12. Todos os Elementos — Tabela Completa
Tipo	Elemento	Ação/Destino	Observações
VISUAL	Header padrão	💬 · 🔔 · ⋯	Logo M à esquerda.
VISUAL	Linha de stories	Scroll horizontal	Fixa abaixo do header.
AVATAR	Foto do usuário (1º story)	T_PERFIL_USUARIO próprio	Borda laranja 2.5px.
BOTÃO	Botão + criar (2º story)	Modal ✚ Criar	Borda tracejada laranja.
AVATAR	Stories de seguidos	T_STORY	Anel laranja = não visto. Cinza = visto.
VISUAL	Banner 'Ver X novos posts'	Scroll ao topo do feed	Aparece quando chegam posts novos.
VISUAL	Card de post	Vários destinos	Avatar + mídia + legenda + reações.
BOTÃO	👍 Like	Toggle like	Cancela dislike. Animação scale.
BOTÃO	👎 Dislike	Toggle dislike	Cancela like. Contador privado.
BOTÃO	💬 Comentar	T_COMENTARIOS	Com teclado já aberto.
BOTÃO	↗ Repostar	Sheet de repost	Verde quando já repostou.
BOTÃO	⋯ opções do post	Sheet de ações	Denunciar / Silenciar / Copiar.
VISUAL	Barra de navegação v3	Social · ✚ · ★ · Atividade · Config	Social ativo (branco + dot laranja).

13. Regras de Negócio
RN-01 — Like e Dislike mutuamente exclusivos
Em TODOS os níveis — post, comentário e resposta. Ativar um cancela o outro automaticamente. Regra sem exceção.
RN-02 — Contador de Dislike não é público
O número de dislikes alimenta o algoritmo interno mas nunca é exibido publicamente. Apenas o usuário que deu dislike sabe que o fez.
RN-03 — Todo post tem mídia obrigatória
Não existe post só de texto no T_AGITO. Todo post deve ter ao menos uma foto ou vídeo.
RN-04 — Repost com atribuição permanente
'Repostado por @handle e +X usuários · Ver mais' sempre aparece no repost. Não pode ser ocultado pelo quem repostou.
RN-05 — Modal ✚ Criar é overlay
O botão ✚ da barra não navega para nova tela. Abre um bottom sheet sobre a tela atual. Ao fechar: retorna exatamente para onde estava sem alterar o estado.
RN-06 — Usuário novo — feed com conteúdo da cidade
Se o usuário ainda não segue ninguém, o feed começa 100% com conteúdo popular da cidade. Evita feed vazio no primeiro acesso.
RN-07 — Profundidade infinita nos comentários
Respostas a respostas sem limite de nível. Respostas de segundo nível em diante ficam com padding esquerdo adicional.

Dev: Feed com FlatList e paginação. Endpoint: GET /api/feed/agito?pagina={n}&limite=15. Backend calcula o mix de seguidos + cidade. App nunca ordena localmente.

14. Mockup HTML — Referência Visual
O código abaixo é o mockup interativo do T_AGITO. Inclui feed completo com posts de usuários e estabelecimentos, linha de stories, repost com atribuição, like/dislike mutuamente exclusivos, comentários, modal de criação e sheet de opções.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T_AGITO Feed Social</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { background:#111; font-family:Arial,sans-serif; display:flex; justify-content:center; padding:30px 20px; min-height:100vh; }

  .phone {
    width:360px; height:780px;
    background:#0D0D0D;
    border-radius:40px;
    border:2px solid #2A2A2A;
    overflow:hidden;
    display:flex; flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,0.8);
    position:relative;
  }

  /* STATUS */
  .status { height:26px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:0 20px; font-size:11px; color:#888; background:#0D0D0D; }


  /* HEADER */
  .header { display:flex; align-items:center; justify-content:space-between; padding:8px 16px 10px; background:#0D0D0D; border-bottom:1px solid #1A1A1A; flex-shrink:0; }
  .header-logo { font-size:20px; font-weight:bold; color:#E8640A; letter-spacing:-0.5px; }
  .header-right { display:flex; align-items:center; gap:10px; }
  .h-icon { width:36px; height:36px; border-radius:50%; background:#1A1A1A; display:flex; align-items:center; justify-content:center; font-size:16px; color:#aaa; cursor:pointer; border:1px solid #2A2A2A; position:relative; }
  .h-badge { position:absolute; top:-3px; right:-3px; background:#E8640A; color:#fff; font-size:8px; font-weight:bold; width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1.5px solid #0D0D0D; }

  .h-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#E8640A,#FF8C42); display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; border:2px solid #E8640A; }

  /* SCROLL */
  .feed-scroll { flex:1; overflow-y:auto; overflow-x:hidden; }
  .feed-scroll::-webkit-scrollbar { display:none; }

  /* STORIES */
  .stories-wrap { background:#0D0D0D; border-bottom:1px solid #1A1A1A; padding:10px 0; flex-shrink:0; }
  .stories-row { display:flex; gap:12px; overflow-x:auto; padding:0 14px; }
  .stories-row::-webkit-scrollbar { display:none; }
  .story-item { flex-shrink:0; text-align:center; cursor:pointer; }
  .story-ring { width:56px; height:56px; border-radius:50%; padding:2px; display:flex; align-items:center; justify-content:center; margin:0 auto 4px; position:relative; }

  .story-ring.unseen { background:linear-gradient(135deg,#E8640A,#FF4500); }
  .story-ring.seen { background:#2A2A2A; }
  .story-ring.add { background:#1A1A1A; border:2px dashed #E8640A; }
  .story-inner { width:48px; height:48px; border-radius:50%; background:#1A1A1A; display:flex; align-items:center; justify-content:center; font-size:20px; border:2px solid #0D0D0D; }
  .story-inner.square { border-radius:10px; }
  .story-add-icon { font-size:20px; color:#E8640A; }
  .story-label { font-size:9px; color:#888; white-space:nowrap; max-width:56px; overflow:hidden; text-overflow:ellipsis; }

  /* NEW POSTS BANNER */
  .new-posts-banner { background:#E8640A; color:#fff; font-size:12px; font-weight:bold; text-align:center; padding:7px; cursor:pointer; display:none; }
  .new-posts-banner.show { display:block; }


  /* POST CARD */
  .post-card { border-bottom:1px solid #141414; background:#0D0D0D; }

  /* POST HEADER */
  .post-hd { display:flex; align-items:center; gap:8px; padding:10px 14px 8px; }
  .post-av { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; cursor:pointer; }
  .post-av.square { border-radius:9px; }
  .post-av-info { flex:1; }
  .post-name { font-size:13px; font-weight:bold; color:#fff; cursor:pointer; }
  .post-meta { font-size:11px; color:#555; display:flex; align-items:center; gap:4px; margin-top:1px; }
  .post-place { color:#E8640A; font-size:11px; }
  .post-time { color:#555; }
  .post-more { width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:18px; color:#555; cursor:pointer; border-radius:50%; flex-shrink:0; }

  .post-more:hover { background:#1A1A1A; }

  /* POST MEDIA */
  .post-media { width:100%; position:relative; cursor:pointer; overflow:hidden; }
  .post-media-img { width:100%; display:flex; align-items:center; justify-content:center; font-size:64px; min-height:260px; }
  .post-media-overlay { position:absolute; inset:0; background:transparent; }
  .post-media-play { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; color:#fff; }

  /* POST BODY */
  .post-body { padding:8px 14px 0; }
  .post-caption { font-size:13px; color:#ccc; line-height:1.5; }
  .post-caption .author { font-weight:bold; color:#fff; margin-right:4px; }
  .post-see-more { color:#E8640A; font-size:13px; cursor:pointer; }


  /* REPOST INFO */
  .repost-info { display:flex; align-items:center; gap:5px; padding:5px 14px; font-size:11px; color:#666; }
  .repost-info span { color:#E8640A; cursor:pointer; }
  .repost-see-more { color:#E8640A; cursor:pointer; }

  /* POST ACTIONS */
  .post-actions { display:flex; align-items:center; padding:8px 14px 10px; gap:16px; }
  .action-btn { display:flex; align-items:center; gap:4px; cursor:pointer; font-size:12px; color:#666; padding:4px 0; transition:color 0.15s; }
  .action-btn:active { transform:scale(0.92); }
  .action-btn .ico { font-size:20px; }
  .action-btn.liked .ico { color:#E8640A; }
  .action-btn.liked { color:#E8640A; font-weight:bold; }
  .action-btn.disliked .ico { color:#E8640A; }
  .action-btn.disliked { color:#E8640A; font-weight:bold; }
  .action-btn.reposted .ico { color:#1A7A4A; }

  .action-btn.reposted { color:#1A7A4A; }
  .action-spacer { flex:1; }

  /* COMMENT PREVIEW */
  .comment-preview { padding:2px 14px 10px; cursor:pointer; }
  .cp-text { font-size:12px; color:#888; }
  .cp-author { font-weight:bold; color:#aaa; }
  .cp-see-all { font-size:12px; color:#555; margin-top:3px; }

  /* ── MODAIS E OVERLAYS ── */
  .overlay { position:absolute; inset:0; background:rgba(0,0,0,0.6); z-index:100; display:none; }
  .overlay.open { display:block; }

  /* BOTTOM SHEET OPÇÕES */
  .options-sheet { position:absolute; bottom:0; left:0; right:0; background:#161616; border-radius:20px 20px 0 0; z-index:101; transform:translateY(100%); transition:transform 0.3s ease; }
  .options-sheet.open { transform:translateY(0); }
  .os-handle { width:36px; height:4px; background:#333; border-radius:2px; margin:12px auto 0; }

  .os-title { font-size:13px; color:#666; text-align:center; padding:10px 16px 14px; border-bottom:1px solid #1A1A1A; }
  .os-option { display:flex; align-items:center; gap:12px; padding:14px 20px; cursor:pointer; border-bottom:1px solid #0D0D0D; }
  .os-option:last-child { border-bottom:none; padding-bottom:20px; }
  .os-opt-icon { font-size:20px; width:28px; }
  .os-opt-text { font-size:14px; color:#fff; }
  .os-opt-text.danger { color:#C0392B; }

  /* BOTTOM SHEET REPOST */
  .repost-sheet { position:absolute; bottom:0; left:0; right:0; background:#161616; border-radius:20px 20px 0 0; z-index:101; transform:translateY(100%); transition:transform 0.3s ease; }
  .repost-sheet.open { transform:translateY(0); }
  .rs-handle { width:36px; height:4px; background:#333; border-radius:2px; margin:12px auto 0; }

  .rs-title { font-size:15px; font-weight:bold; color:#fff; text-align:center; padding:12px 16px 14px; border-bottom:1px solid #1A1A1A; }
  .rs-option { display:flex; align-items:center; gap:14px; padding:16px 20px; cursor:pointer; border-bottom:1px solid #0D0D0D; }
  .rs-option:last-child { border-bottom:none; padding-bottom:20px; }
  .rs-opt-icon { font-size:24px; width:32px; }
  .rs-opt-info { flex:1; }
  .rs-opt-title { font-size:14px; font-weight:bold; color:#fff; }
  .rs-opt-desc { font-size:11px; color:#666; margin-top:2px; }

  /* POST DETAIL (comentários) */
  .post-detail { position:absolute; inset:0; background:#0D0D0D; z-index:200; transform:translateX(100%); transition:transform 0.35s cubic-bezier(0.4,0,0.2,1); display:flex; flex-direction:column; }
  .post-detail.open { transform:translateX(0); }

  .pd-header { display:flex; align-items:center; gap:10px; padding:8px 14px; border-bottom:1px solid #1A1A1A; flex-shrink:0; background:#0D0D0D; }
  .pd-back { width:34px; height:34px; border-radius:50%; background:#1A1A1A; display:flex; align-items:center; justify-content:center; font-size:16px; color:#fff; cursor:pointer; border:1px solid #2A2A2A; }
  .pd-title { font-size:15px; font-weight:bold; color:#fff; }
  .pd-scroll { flex:1; overflow-y:auto; }
  .pd-scroll::-webkit-scrollbar { display:none; }

  /* COMMENT ITEM */
  .comment-item { padding:10px 14px; border-bottom:1px solid #0A0A0A; }
  .comment-item.reply { padding-left:52px; background:#080808; }
  .comment-item.reply2 { padding-left:80px; background:#060606; }
  .ci-row { display:flex; gap:8px; }
  .ci-av { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }

  .ci-av.sq { border-radius:7px; }
  .ci-body { flex:1; }
  .ci-name { font-size:12px; font-weight:bold; color:#fff; display:inline; }
  .ci-text { font-size:12px; color:#ccc; display:inline; margin-left:4px; line-height:1.5; }
  .ci-time { font-size:10px; color:#555; margin-top:3px; }
  .ci-actions { display:flex; gap:14px; margin-top:5px; align-items:center; }
  .ci-act { font-size:11px; color:#555; cursor:pointer; display:flex; align-items:center; gap:3px; }
  .ci-act.liked { color:#E8640A; font-weight:bold; }
  .ci-act.disliked { color:#E8640A; font-weight:bold; }
  .ci-like-ico { font-size:14px; }

  /* REPLY INPUT */
  .reply-input-bar { padding:10px 14px; border-top:1px solid #1A1A1A; background:#0D0D0D; display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .ri-av { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#E8640A,#FF8C42); display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; }

  .ri-field { flex:1; background:#1A1A1A; border-radius:20px; padding:7px 14px; font-size:13px; color:#fff; border:1px solid #2A2A2A; outline:none; font-family:Arial,sans-serif; }
  .ri-send { font-size:18px; color:#E8640A; cursor:pointer; padding:4px; }

  /* MODAL CRIAR POST */
  .create-modal { position:absolute; bottom:0; left:0; right:0; background:#161616; border-radius:20px 20px 0 0; z-index:101; transform:translateY(100%); transition:transform 0.3s ease; }
  .create-modal.open { transform:translateY(0); }
  .cm-handle { width:36px; height:4px; background:#333; border-radius:2px; margin:12px auto 4px; }
  .cm-title { font-size:15px; font-weight:bold; color:#fff; text-align:center; padding:8px 16px 16px; }
  .cm-options { display:flex; justify-content:space-around; padding:0 20px 24px; }

  .cm-opt { text-align:center; cursor:pointer; }
  .cm-opt-circle { width:64px; height:64px; border-radius:50%; background:#1A1A1A; border:1px solid #2A2A2A; display:flex; align-items:center; justify-content:center; font-size:26px; margin:0 auto 8px; transition:background 0.15s; }
  .cm-opt-circle:active { background:#252525; }
  .cm-opt-label { font-size:12px; color:#888; }

  /* BOTTOM NAV */
  .bottom-nav { border-top:1px solid #1A1A1A; display:flex; align-items:center; justify-content:space-around; padding:10px 0 16px; background:#0D0D0D; flex-shrink:0; }
  .nav-tab { text-align:center; cursor:pointer; }
  .nav-icon-b { font-size:22px; color:#fff; }
  .nav-icon-b.inactive { color:#555; }
  .nav-lbl { font-size:9px; color:#fff; margin-top:2px; }
  .nav-lbl.inactive { color:#555; }
  .nav-dot { width:4px; height:4px; border-radius:50%; background:#E8640A; margin:2px auto 0; }

  .nav-center { width:52px; height:52px; border-radius:50%; background:#E8640A; display:flex; align-items:center; justify-content:center; font-size:22px; margin-top:-10px; box-shadow:0 0 20px rgba(232,100,10,0.6); cursor:pointer; }

  /* LIKE ANIMATION */
  @keyframes heartPop { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
  .heart-pop { animation:heartPop 0.3s ease; }
  @keyframes fadeInDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .fade-in { animation:fadeInDown 0.3s ease; }
</style>
</head>
<body>
<div class="phone" id="phone">

  <div class="status"><span>21:30</span><span>📶 🔋 87%</span></div>

  <!-- HEADER PADRÃO -->
  <div class="header">
    <div class="header-logo">
      <div style="width:36px;height:36px;background:#E8640A;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;color:#fff">M</div>

    </div>
    <div class="header-right">
      <div class="h-icon" onclick="alert('Mensagens')">💬<div class="h-badge">3</div></div>
      <div class="h-icon" onclick="alert('Notificações')">🔔<div class="h-badge">7</div></div>
      <div class="h-icon" onclick="alert('Painel')">⋯</div>
    </div>
  </div>

  <!-- SCROLL PRINCIPAL -->
  <div class="feed-scroll" id="feedScroll">

    <!-- STORIES -->
    <div class="stories-wrap">
      <div class="stories-row">
        <!-- Foto do perfil -->
        <div style="flex-shrink:0;text-align:center;cursor:pointer" onclick="alert('Meu perfil')">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#E8640A,#FF8C42);display:flex;align-items:center;justify-content:center;font-size:24px;border:2.5px solid #E8640A;margin:0 auto 4px">😊</div>

          <div style="font-size:9px;color:#888;white-space:nowrap">Você</div>
        </div>
        <!-- Botão criar momento -->
        <div style="flex-shrink:0;text-align:center;cursor:pointer" onclick="openCreate()">
          <div style="width:56px;height:56px;border-radius:50%;background:#1A1A1A;border:2px dashed #E8640A;display:flex;align-items:center;justify-content:center;font-size:26px;color:#E8640A;margin:0 auto 4px">+</div>
          <div style="font-size:9px;color:#888;white-space:nowrap">Momento</div>
        </div>
        <!-- Stories não vistos -->
        <div class="story-item" onclick="alert('Story da Barbearia')">
          <div class="story-ring unseen">
            <div class="story-inner square">✂</div>
          </div>
          <div class="story-label">Barbearia</div>

        </div>
        <div class="story-item" onclick="alert('Story da Maria')">
          <div class="story-ring unseen">
            <div class="story-inner">👩</div>
          </div>
          <div class="story-label">@maria</div>
        </div>
        <div class="story-item" onclick="alert('Story da Pizzaria')">
          <div class="story-ring unseen">
            <div class="story-inner square">🍕</div>
          </div>
          <div class="story-label">Dom Pão</div>
        </div>
        <div class="story-item" onclick="alert('Story do João')">
          <div class="story-ring unseen">
            <div class="story-inner">👨</div>
          </div>
          <div class="story-label">@joao</div>
        </div>
        <!-- Stories vistos -->
        <div class="story-item" onclick="alert('Story do Café')">

          <div class="story-ring seen">
            <div class="story-inner square">☕</div>
          </div>
          <div class="story-label">Café Ponto</div>
        </div>
        <div class="story-item" onclick="alert('Story da Ana')">
          <div class="story-ring seen">
            <div class="story-inner">👩‍🦱</div>
          </div>
          <div class="story-label">@ana</div>
        </div>
      </div>
    </div>

    <!-- BANNER NOVOS POSTS -->
    <div class="new-posts-banner" id="newPostsBanner" onclick="scrollToTop()">
      ↑ Ver 3 novos posts
    </div>

    <!-- ── POST 1 — usuário com lugar marcado ── -->
    <div class="post-card">
      <div class="post-hd">
        <div class="post-av" style="background:linear-gradient(135deg,#1A0A1A,#3A1A3A)" onclick="alert('Perfil @maria')">👩</div>

        <div class="post-av-info">
          <div class="post-name" onclick="alert('Perfil @maria')">Maria Santos</div>
          <div class="post-meta">
            <span class="post-place">📍 Barbearia Vintage</span>
            <span>·</span>
            <span class="post-time">2h</span>
          </div>
        </div>
        <div class="post-more" onclick="openOptions('post1')">⋯</div>
      </div>
      <div class="post-media">
        <div class="post-media-img" style="background:linear-gradient(135deg,#0A0A1A,#1A1A3A)">💈</div>
      </div>
      <div class="post-body">
        <p class="post-caption"><span class="author">@maria</span>Levei meu marido aqui e ele saiu completamente diferente! Recomendo demais ✂🔥 <span class="post-see-more">ver menos</span></p>
      </div>
      <div class="post-actions">

        <div class="action-btn liked" id="like-p1" onclick="toggleLike('p1')">
          <span class="ico">👍</span><span id="like-count-p1">124</span>
        </div>
        <div class="action-btn" id="dislike-btn-p1" onclick="toggleDislike('p1')">
          <span class="ico" id="dislike-p1">👎</span><span id="dislike-count-p1">14</span>
        </div>
        <div class="action-btn" onclick="openPostDetail()">
          <span class="ico">💬</span><span>18</span>
        </div>
        <div class="action-btn reposted" onclick="openRepost()">
          <span class="ico">↗</span><span>32</span>
        </div>
      </div>
      <div class="repost-info">
        <span>♻</span> Repostado por <span onclick="alert('Perfil @joao')">@joao</span> e <span onclick="openRepostList()">+31 usuários · Ver mais</span>

      </div>
      <div class="comment-preview" onclick="openPostDetail()">
        <div class="cp-text"><span class="cp-author">@joao</span> Que lugar incrível! Já fui três vezes esse mês 😄</div>
        <div class="cp-see-all">Ver todos os 18 comentários</div>
      </div>
    </div>

    <!-- ── POST 2 — estabelecimento ── -->
    <div class="post-card">
      <div class="post-hd">
        <div class="post-av square" style="background:linear-gradient(135deg,#1A0A00,#3A1500)" onclick="alert('Perfil Pizzaria')">🍕</div>
        <div class="post-av-info">
          <div class="post-name" onclick="alert('Perfil Pizzaria')">Pizzaria Dom Pão</div>
          <div class="post-meta">
            <span class="post-place">📍 Pinheiros, SP</span>
            <span>·</span>
            <span class="post-time">4h</span>

          </div>
        </div>
        <div class="post-more" onclick="openOptions('post2')">⋯</div>
      </div>
      <div class="post-media">
        <div class="post-media-img" style="background:linear-gradient(135deg,#1A0500,#2A0800)">🍕</div>
      </div>
      <div class="post-body">
        <p class="post-caption"><span class="author">Pizzaria Dom Pão</span>Segunda especial! Margherita artesanal por R$45 🍅🧀 Válido até meia-noite!</p>
      </div>
      <div class="post-actions">
        <div class="action-btn" id="like-p2" onclick="toggleLike('p2')">
          <span class="ico">👍</span><span id="like-count-p2">87</span>
        </div>
        <div class="action-btn" id="dislike-btn-p2" onclick="toggleDislike('p2')">
          <span class="ico" id="dislike-p2">👎</span><span id="dislike-count-p2">3</span>

        </div>
        <div class="action-btn" onclick="openPostDetail()">
          <span class="ico">💬</span><span>5</span>
        </div>
        <div class="action-btn" onclick="openRepost()">
          <span class="ico">↗</span><span>14</span>
        </div>
      </div>
      <div class="comment-preview" onclick="openPostDetail()">
        <div class="cp-text"><span class="cp-author">@pedro</span> Melhor pizza da zona oeste! 🔥</div>
        <div class="cp-see-all">Ver todos os 5 comentários</div>
      </div>
    </div>

    <!-- ── POST 3 — check-in ── -->
    <div class="post-card">
      <div class="post-hd">
        <div class="post-av" style="background:linear-gradient(135deg,#001A10,#003A20)" onclick="alert('Perfil @pedro')">👦</div>
        <div class="post-av-info">
          <div class="post-name" onclick="alert('Perfil @pedro')">Pedro Alves</div>

          <div class="post-meta">
            <span class="post-place">📍 Café Ponto Certo · check-in ✓</span>
            <span>·</span>
            <span class="post-time">6h</span>
          </div>
        </div>
        <div class="post-more" onclick="openOptions('post3')">⋯</div>
      </div>
      <div class="post-media">
        <div class="post-media-img" style="background:linear-gradient(135deg,#1A0800,#2A1400)">☕</div>
      </div>
      <div class="post-body">
        <p class="post-caption"><span class="author">@pedro</span>Melhor café da tarde da minha vida ☕✨ <span class="post-see-more">ver mais</span></p>
      </div>
      <div class="post-actions">
        <div class="action-btn" id="like-p3" onclick="toggleLike('p3')">
          <span class="ico">👍</span><span id="like-count-p3">56</span>

        </div>
        <div class="action-btn" id="dislike-btn-p3" onclick="toggleDislike('p3')">
          <span class="ico" id="dislike-p3">👎</span><span id="dislike-count-p3">5</span>
        </div>
        <div class="action-btn" onclick="openPostDetail()">
          <span class="ico">💬</span><span>3</span>
        </div>
        <div class="action-btn" onclick="openRepost()">
          <span class="ico">↗</span><span>8</span>
        </div>
      </div>
      <div class="comment-preview" onclick="openPostDetail()">
        <div class="cp-see-all">Ver os 3 comentários</div>
      </div>
    </div>

    <!-- ── POST 4 — vídeo ── -->
    <div class="post-card">
      <div class="post-hd">
        <div class="post-av" style="background:linear-gradient(135deg,#1A001A,#3A003A)" onclick="alert('Perfil @ana')">👩‍🦱</div>

        <div class="post-av-info">
          <div class="post-name" onclick="alert('Perfil @ana')">Ana Costa</div>
          <div class="post-meta">
            <span class="post-place">📍 Smart Fit Augusta</span>
            <span>·</span>
            <span class="post-time">Ontem</span>
          </div>
        </div>
        <div class="post-more" onclick="openOptions('post4')">⋯</div>
      </div>
      <div class="post-media">
        <div class="post-media-img" style="background:linear-gradient(135deg,#001A1A,#003A3A)">💪</div>
        <div class="post-media-play">▶</div>
      </div>
      <div class="post-body">
        <p class="post-caption"><span class="author">@ana</span>Treino de hoje com a turma das 7h 🏋️ Energia boa demais!</p>
      </div>
      <div class="post-actions">
        <div class="action-btn" id="like-p4" onclick="toggleLike('p4')">

          <span class="ico">👍</span><span id="like-count-p4">203</span>
        </div>
        <div class="action-btn" id="dislike-btn-p4" onclick="toggleDislike('p4')">
          <span class="ico" id="dislike-p4">👎</span><span id="dislike-count-p4">9</span>
        </div>
        <div class="action-btn" onclick="openPostDetail()">
          <span class="ico">💬</span><span>27</span>
        </div>
        <div class="action-btn" onclick="openRepost()">
          <span class="ico">↗</span><span>61</span>
        </div>
      </div>
      <div class="repost-info">
        <span>♻</span> Repostado por <span>@carlos</span> e <span onclick="openRepostList()">+60 usuários · Ver mais</span>
      </div>
      <div class="comment-preview" onclick="openPostDetail()">
        <div class="cp-text"><span class="cp-author">@maria</span> Quero participar na próxima! 🔥</div>

        <div class="cp-see-all">Ver todos os 27 comentários</div>
      </div>
    </div>

    <!-- FIM DO FEED -->
    <div style="text-align:center;padding:24px 16px;font-size:13px;color:#333">
      Você está em dia com o feed 👋
    </div>

  </div><!-- /feed-scroll -->

  <!-- BOTTOM NAV -->
  <div class="bottom-nav">
    <div class="nav-tab">
      <div class="nav-icon-b">📱</div>
      <div class="nav-lbl">Social</div>
      <div class="nav-dot"></div>
    </div>
    <div class="nav-tab" onclick="openCreate()">
      <div class="nav-icon-b inactive">✚</div>
      <div class="nav-lbl inactive">Criar</div>
    </div>
    <div class="nav-center">🏠</div>
    <div class="nav-tab">
      <div class="nav-icon-b inactive">📋</div>
      <div class="nav-lbl inactive">Atividade</div>
    </div>

    <div class="nav-tab">
      <div class="nav-icon-b inactive">⚙</div>
      <div class="nav-lbl inactive">Config</div>
    </div>
  </div>

  <!-- ── OVERLAY ── -->
  <div class="overlay" id="overlay" onclick="closeAll()"></div>

  <!-- ── SHEET: OPÇÕES DO POST ── -->
  <div class="options-sheet" id="optionsSheet">
    <div class="os-handle"></div>
    <div class="os-title">Opções do post</div>
    <div class="os-option" onclick="closeAll()"><div class="os-opt-icon">🚫</div><div class="os-opt-text">Não desejo ver isso</div></div>
    <div class="os-option" onclick="closeAll()"><div class="os-opt-icon">👤</div><div class="os-opt-text">Não me mostrar posts deste perfil</div></div>
    <div class="os-option" onclick="closeAll()"><div class="os-opt-icon">🔗</div><div class="os-opt-text">Copiar link do post</div></div>

    <div class="os-option" onclick="closeAll()"><div class="os-opt-icon">⚠️</div><div class="os-opt-text danger">Denunciar post</div></div>
  </div>

  <!-- ── SHEET: REPOST ── -->
  <div class="repost-sheet" id="repostSheet">
    <div class="rs-handle"></div>
    <div class="rs-title">Repostar</div>
    <div style="padding:0 16px 12px">
      <!-- Campo de comentário opcional -->
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#E8640A,#FF8C42);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">😊</div>
        <textarea id="repostText" placeholder="Adicione um comentário (opcional)" style="flex:1;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:10px 12px;font-size:13px;color:#fff;font-family:Arial,sans-serif;resize:none;height:72px;outline:none;line-height:1.5" onfocus="this.style.borderColor='#E8640A'" onblur="this.style.borderColor='#2A2A2A'"></textarea>

      </div>
      <!-- Preview do post original -->
      <div style="border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:8px;padding:10px 12px 6px">
          <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#1A0A1A,#3A1A3A);display:flex;align-items:center;justify-content:center;font-size:12px">👩</div>
          <div>
            <div style="font-size:12px;font-weight:bold;color:#fff">Maria Santos</div>
            <div style="font-size:10px;color:#E8640A">📍 Barbearia Vintage · 2h</div>
          </div>
        </div>
        <div style="width:100%;height:80px;background:linear-gradient(135deg,#0A0A1A,#1A1A3A);display:flex;align-items:center;justify-content:center;font-size:32px">💈</div>

        <div style="padding:8px 12px;font-size:11px;color:#aaa">Levei meu marido aqui e ele saiu completamente diferente! ✂🔥</div>
      </div>
      <!-- Botão repostar -->
      <div onclick="doRepost()" style="background:#E8640A;color:#fff;font-size:14px;font-weight:bold;padding:12px;border-radius:12px;text-align:center;cursor:pointer">↗ Repostar</div>
      <div onclick="closeAll()" style="text-align:center;padding:12px 0 4px;font-size:13px;color:#666;cursor:pointer">Cancelar</div>
    </div>
  </div>

  <!-- ── SHEET: LISTA DE REPOSTS ── -->
  <div class="options-sheet" id="repostListSheet" style="max-height:60%">
    <div class="os-handle"></div>
    <div class="os-title">Repostado por 32 usuários</div>
    <div class="os-option"><div class="os-opt-icon">👨</div><div class="os-opt-text">@joao · há 1h</div></div>

    <div class="os-option"><div class="os-opt-icon">👩</div><div class="os-opt-text">@camila · há 2h</div></div>
    <div class="os-option"><div class="os-opt-icon">🧔</div><div class="os-opt-text">@roberto · há 3h</div></div>
    <div class="os-option"><div class="os-opt-icon">👩‍🦱</div><div class="os-opt-text">@patricia · há 4h</div></div>
    <div class="os-option" style="justify-content:center"><div class="os-opt-text" style="color:#E8640A">Ver mais 28 reposts...</div></div>
  </div>

  <!-- ── MODAL: CRIAR POST ── -->
  <div class="create-modal" id="createModal">
    <div class="cm-handle"></div>
    <div class="cm-title">O que você quer compartilhar?</div>
    <div class="cm-options">
      <div class="cm-opt" onclick="closeAll()">
        <div class="cm-opt-circle">📸</div>
        <div class="cm-opt-label">Foto</div>

      </div>
      <div class="cm-opt" onclick="closeAll()">
        <div class="cm-opt-circle">🎬</div>
        <div class="cm-opt-label">Vídeo</div>
      </div>
      <div class="cm-opt" onclick="closeAll()">
        <div class="cm-opt-circle">📍</div>
        <div class="cm-opt-label">Fui aqui</div>
      </div>
    </div>
  </div>

  <!-- ── TELA: POST DETAIL (comentários) ── -->
  <div class="post-detail" id="postDetail">
    <div class="pd-header">
      <div class="pd-back" onclick="closePostDetail()">←</div>
      <div class="pd-title">Comentários</div>
    </div>
    <div class="pd-scroll">

      <!-- Post resumido -->
      <div class="post-card" style="border-bottom:2px solid #1A1A1A">
        <div class="post-hd">
          <div class="post-av" style="background:linear-gradient(135deg,#1A0A1A,#3A1A3A)">👩</div>

          <div class="post-av-info">
            <div class="post-name">Maria Santos</div>
            <div class="post-meta"><span class="post-place">📍 Barbearia Vintage</span><span>·</span><span class="post-time">2h</span></div>
          </div>
          <div class="post-more" onclick="openOptions('detail')">⋯</div>
        </div>
        <div class="post-body" style="padding-bottom:8px">
          <p class="post-caption"><span class="author">@maria</span>Levei meu marido aqui e ele saiu completamente diferente! Recomendo demais ✂🔥</p>
        </div>
        <div class="post-actions">
          <div class="action-btn liked"><span class="ico">👍</span><span>124</span></div>
          <div class="action-btn"><span class="ico">👎</span></div>
          <div class="action-btn"><span class="ico">💬</span><span>18</span></div>

          <div class="action-btn reposted"><span class="ico">↗</span><span>32</span></div>
        </div>
      </div>

      <!-- Comentários com profundidade -->
      <div class="comment-item">
        <div class="ci-row">
          <div class="ci-av" style="background:linear-gradient(135deg,#001A10,#003A20)">👦</div>
          <div class="ci-body">
            <span class="ci-name">@joao</span><span class="ci-text">Que lugar incrível! Já fui três vezes esse mês 😄</span>
            <div class="ci-time">1h atrás</div>
            <div class="ci-actions">
              <div class="ci-act liked" id="cl-c1" onclick="toggleComment('c1')"><span class="ci-like-ico">👍</span><span id="clc-c1"> 12</span></div>
              <div class="ci-act" id="cd-c1" onclick="toggleCDislike('c1')"><span class="ci-like-ico">👎</span><span id="cdc-c1"> 3</span></div>

              <div class="ci-act" onclick="openPostDetail()">💬 Responder</div>
              <div class="ci-act" onclick="openRepost()">↗ Repostar</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resposta nível 1 -->
      <div class="comment-item reply">
        <div class="ci-row">
          <div class="ci-av" style="background:linear-gradient(135deg,#1A0A1A,#3A1A3A)">👩</div>
          <div class="ci-body">
            <span class="ci-name">@maria</span><span class="ci-text">É incrível mesmo! O barbeiro Carlos é demais 💈</span>
            <div class="ci-time">45min atrás</div>
            <div class="ci-actions">
              <div class="ci-act" id="cl-c7" onclick="toggleComment('c7')"><span class="ci-like-ico">👍</span><span id="clc-c7"> 5</span></div>

              <div class="ci-act" id="cd-c7" onclick="toggleCDislike('c7')"><span class="ci-like-ico">👎</span><span id="cdc-c7"> 0</span></div>
              <div class="ci-act" onclick="prefillReply(this)">💬 Responder</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resposta nível 2 -->
      <div class="comment-item reply2">
        <div class="ci-row">
          <div class="ci-av sq" style="background:linear-gradient(135deg,#1A0A00,#3A1500)">✂</div>
          <div class="ci-body">
            <span class="ci-name">Barbearia Vintage</span><span class="ci-text">Obrigado @maria! O Carlos agradece 🙏 Aguardamos vocês sempre!</span>
            <div class="ci-time">30min atrás</div>
            <div class="ci-actions">
              <div class="ci-act" id="cl-c8" onclick="toggleComment('c8')"><span class="ci-like-ico">👍</span><span id="clc-c8"> 8</span></div>

              <div class="ci-act" id="cd-c8" onclick="toggleCDislike('c8')"><span class="ci-like-ico">👎</span><span id="cdc-c8"> 0</span></div>
              <div class="ci-act" onclick="prefillReply(this)">💬 Responder</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Outro comentário -->
      <div class="comment-item">
        <div class="ci-row">
          <div class="ci-av" style="background:linear-gradient(135deg,#1A001A,#3A003A)">👩‍🦱</div>
          <div class="ci-body">
            <span class="ci-name">@ana</span><span class="ci-text">Preciso levar meu namorado aí! Qual o melhor horário?</span>
            <div class="ci-time">2h atrás</div>
            <div class="ci-actions">
              <div class="ci-act" id="cl-c4" onclick="toggleComment('c4')"><span class="ci-like-ico">👍</span><span id="clc-c4"> 3</span></div>

              <div class="ci-act" id="cd-c4" onclick="toggleCDislike('c4')"><span class="ci-like-ico">👎</span><span id="cdc-c4"> 2</span></div>
              <div class="ci-act" onclick="prefillReply(this)">💬 Responder</div>
              <div class="ci-act" onclick="openRepost()">↗ Repostar</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resposta nível 1 -->
      <div class="comment-item reply">
        <div class="ci-row">
          <div class="ci-av sq" style="background:linear-gradient(135deg,#1A0A00,#3A1500)">✂</div>
          <div class="ci-body">
            <span class="ci-name">Barbearia Vintage</span><span class="ci-text">@ana Qualquer horário é bem-vindo! Das 9h às 20h, de segunda a sábado 😊</span>
            <div class="ci-time">1h atrás</div>

            <div class="ci-actions">
              <div class="ci-act liked" id="cl-c3" onclick="toggleComment('c3')"><span class="ci-like-ico">👍</span><span id="clc-c3"> 8</span></div>
              <div class="ci-act" id="cd-c3" onclick="toggleCDislike('c3')"><span class="ci-like-ico">👎</span><span id="cdc-c3"> 0</span></div>
              <div class="ci-act" onclick="prefillReply(this)">💬 Responder</div>
            </div>
          </div>
        </div>
      </div>

      <div class="comment-item">
        <div class="ci-row">
          <div class="ci-av" style="background:linear-gradient(135deg,#001A1A,#003A3A)">🧔</div>
          <div class="ci-body">
            <span class="ci-name">@carlos</span><span class="ci-text">Melhor barbearia da Augusta sem dúvida! 🏆</span>
            <div class="ci-time">3h atrás</div>

            <div class="ci-actions">
              <div class="ci-act" id="cl-c6" onclick="toggleComment('c6')"><span class="ci-like-ico">👍</span><span id="clc-c6"> 15</span></div>
              <div class="ci-act" id="cd-c6" onclick="toggleCDislike('c6')"><span class="ci-like-ico">👎</span><span id="cdc-c6"> 1</span></div>
              <div class="ci-act" onclick="prefillReply(this)">💬 Responder</div>
              <div class="ci-act" onclick="openRepost()">↗ Repostar</div>
            </div>
          </div>
        </div>
      </div>

      <div style="height:16px"></div>
    </div>

    <!-- INPUT de resposta -->
    <div class="reply-input-bar">
      <div class="ri-av">😊</div>
      <input class="ri-field" placeholder="Adicione um comentário..." />
      <div class="ri-send">➤</div>

    </div>
  </div>

</div><!-- /phone -->

<script>
  let activeSheet = null;

  function openOptions(postId) {
    closeAll();
    document.getElementById('overlay').classList.add('open');
    document.getElementById('optionsSheet').classList.add('open');
    activeSheet = 'options';
  }

  function openRepost() {
    closeAll();
    document.getElementById('overlay').classList.add('open');
    document.getElementById('repostSheet').classList.add('open');
    activeSheet = 'repost';
  }

  function openRepostList() {
    closeAll();
    document.getElementById('overlay').classList.add('open');
    document.getElementById('repostListSheet').classList.add('open');
    activeSheet = 'repostList';
  }

  function openCreate() {
    closeAll();
    document.getElementById('overlay').classList.add('open');

    document.getElementById('createModal').classList.add('open');
    activeSheet = 'create';
  }

  function openPostDetail() {
    document.getElementById('postDetail').classList.add('open');
    setTimeout(() => {
      const field = document.querySelector('.ri-field');
      if (field) field.focus();
    }, 350);
  }

  function closePostDetail() {
    document.getElementById('postDetail').classList.remove('open');
  }

  function closeAll() {
    document.getElementById('overlay').classList.remove('open');
    document.getElementById('optionsSheet').classList.remove('open');
    document.getElementById('repostSheet').classList.remove('open');
    document.getElementById('repostListSheet').classList.remove('open');
    document.getElementById('createModal').classList.remove('open');
    activeSheet = null;

  }

  function toggleLike(postId) {
    const likeBtn = document.getElementById('like-' + postId);
    const likeCount = document.getElementById('like-count-' + postId);
    const likeIco = likeBtn.querySelector('.ico');

    const dislikeIco = document.getElementById('dislike-' + postId);
    const dislikeCount = document.getElementById('dislike-count-' + postId);
    const dislikeBtn = dislikeIco ? dislikeIco.closest('.action-btn') : null;

    if (likeBtn.classList.contains('liked')) {
      // desfaz like
      likeBtn.classList.remove('liked');
      likeCount.textContent = parseInt(likeCount.textContent) - 1;
    } else {
      // aplica like
      likeBtn.classList.add('liked');
      likeIco.classList.add('heart-pop');
      likeCount.textContent = parseInt(likeCount.textContent) + 1;

      setTimeout(() => likeIco.classList.remove('heart-pop'), 300);
      // cancela dislike se ativo
      if (dislikeBtn && dislikeBtn.classList.contains('disliked')) {
        dislikeBtn.classList.remove('disliked');
        dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
      }
    }
  }

  function toggleDislike(postId) {
    const dislikeIco = document.getElementById('dislike-' + postId);
    const dislikeCount = document.getElementById('dislike-count-' + postId);
    const dislikeBtn = dislikeIco.closest('.action-btn');

    const likeBtn = document.getElementById('like-' + postId);
    const likeCount = document.getElementById('like-count-' + postId);

    if (dislikeBtn.classList.contains('disliked')) {
      // desfaz dislike
      dislikeBtn.classList.remove('disliked');

      dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
    } else {
      // aplica dislike
      dislikeBtn.classList.add('disliked');
      dislikeIco.classList.add('heart-pop');
      dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
      setTimeout(() => dislikeIco.classList.remove('heart-pop'), 300);
      // cancela like se ativo
      if (likeBtn && likeBtn.classList.contains('liked')) {
        likeBtn.classList.remove('liked');
        likeCount.textContent = parseInt(likeCount.textContent) - 1;
      }
    }
  }

  function doRepost() {
    const text = document.getElementById('repostText') ? document.getElementById('repostText').value.trim() : '';
    closeAll();
    // Clear field
    if (document.getElementById('repostText')) document.getElementById('repostText').value = '';

    // Show feedback
    const banner = document.getElementById('newPostsBanner');
    banner.textContent = text ? '↗ Repostado com comentário!' : '↗ Repostado!';
    banner.classList.add('show');
    setTimeout(() => {
      banner.classList.remove('show');
      banner.textContent = '↑ Ver 3 novos posts';
    }, 2500);
  }

  function scrollToTop() {
    document.getElementById('feedScroll').scrollTo({top:0,behavior:'smooth'});
    document.getElementById('newPostsBanner').classList.remove('show');
  }

  function prefillReply(el) {
    // Get author name from parent comment
    const commentItem = el.closest('.comment-item');
    const nameEl = commentItem ? commentItem.querySelector('.ci-name') : null;
    const name = nameEl ? nameEl.textContent : '';
    const field = document.querySelector('.ri-field');

    if (field) {
      field.value = name + ' ';
      field.focus();
      // Move cursor to end
      field.selectionStart = field.selectionEnd = field.value.length;
    }
  }

  // Simula banner de novos posts após 8 segundos
  setTimeout(() => {
    document.getElementById('newPostsBanner').classList.add('show');
  }, 8000);

  function toggleComment(cId) {
    const likeBtn = document.getElementById('cl-' + cId);
    const likeCount = document.getElementById('clc-' + cId);
    const dislikeBtn = document.getElementById('cd-' + cId);
    const dislikeCount = document.getElementById('cdc-' + cId);
    if (likeBtn.classList.contains('liked')) {
      likeBtn.classList.remove('liked');
      likeCount.textContent = ' ' + (parseInt(likeCount.textContent) - 1);
    } else {
      likeBtn.classList.add('liked');

      likeCount.textContent = ' ' + (parseInt(likeCount.textContent) + 1);
      if (dislikeBtn && dislikeBtn.classList.contains('disliked')) {
        dislikeBtn.classList.remove('disliked');
        dislikeCount.textContent = ' ' + (parseInt(dislikeCount.textContent) - 1);
      }
    }
  }

  function toggleCDislike(cId) {
    const dislikeBtn = document.getElementById('cd-' + cId);
    const dislikeCount = document.getElementById('cdc-' + cId);
    const likeBtn = document.getElementById('cl-' + cId);
    const likeCount = document.getElementById('clc-' + cId);
    if (dislikeBtn.classList.contains('disliked')) {
      dislikeBtn.classList.remove('disliked');
      dislikeCount.textContent = ' ' + (parseInt(dislikeCount.textContent) - 1);
    } else {
      dislikeBtn.classList.add('disliked');

      dislikeCount.textContent = ' ' + (parseInt(dislikeCount.textContent) + 1);
      if (likeBtn && likeBtn.classList.contains('liked')) {
        likeBtn.classList.remove('liked');
        likeCount.textContent = ' ' + (parseInt(likeCount.textContent) - 1);
      }
    }
  }
</script>
</body>
</html>

