Nota de runtime validado em 2026-04-28
- A implementacao ativa da Home foi reduzida ao discovery real que ja existe no backend.
- As secoes em uso hoje sao: `Eventos por perto`, `Nao deixe passar`, `Aberto agora`, `Mais bem avaliados por perto` e `Perto de voce`.
- Blocos que dependiam de agregadores externos ou dados sociais ainda nao entram no fluxo ativo enquanto nao houver backend real correspondente.

MEU AGITO
T06 — Home
Arquitetura de tela — Especificação completa v3
O jornal vivo da cidade — 7 zonas de feed · Header v3 · Barra de navegação v3
Documento unificado: T06 Home v2 + T06 Adendo (eliminação T10 + eventos via T_ITEM)
1. Identificação da Tela
Código	T06
Nome	Home — Tela Principal do App
Plataforma	App Mobile — iOS 14+ e Android 8+
Fase	Fase 1.0 — Presente desde o lançamento
Acesso	Todos os usuários logados — pessoal e empresarial
Tela anterior	T05a ou T05b no primeiro acesso | T01 Splash Screen nos acessos subsequentes
Tela padrão?	Sim — primeira tela ao abrir o app com sessão ativa. Botão ★ na barra sempre retorna aqui.
Orientação	Portrait apenas — sem suporte a landscape
Scroll	Vertical contínuo. Header e barra de navegação fixos durante o scroll.
Atualização	Pull-to-refresh: usuário puxa de cima para baixo. Indicador laranja.
Performance	Carregamento inicial em menos de 1.5 segundos. Lazy loading das zonas Z3–Z7.
Dados	Google Places API + Sympla API + Eventbrite API + dados internos do app
T10 Eventos	ELIMINADA — eventos abrem T_ITEM com template='evento'. Ver seção 7.

2. Conceito e Psicologia do Home
O Home do Meu Agito não é um menu de categorias nem um feed social. É um jornal vivo da cidade do usuário — personalizado, com urgência e contexto social. Cada zona foi projetada para disparar um gatilho emocional específico.

Zona	Gatilho emocional	Resultado esperado
Z1 — Mega Eventos	FOMO — medo de perder algo grande	Usuário salva ou compartilha o evento
Z2 — Rolando agora	Curiosidade — o que está acontecendo	Usuário explora e descobre lugares
Z3 — Não deixe passar	Urgência — acaba hoje ou amanhã	Usuário age imediatamente
Z4 — Mais hypado	Validação social — todo mundo vai	Usuário segue a tendência da cidade
Z5 — Amigos foram	Prova social pessoal — alguém de conf.	Usuário confia e considera visitar
Z6 — Perto de você	Conveniência — está do seu lado	Usuário resolve algo próximo sem esforço
Z7 — Mais buscado	Pertencimento — o que a cidade usa	Usuário sente que faz parte da comunidade

3. Header — Especificação Definitiva v3
O header é fixo no topo — nunca some durante o scroll. Especificação aplicada conforme ADENDO GLOBAL v3.

v3: Cidade removida do header. Carrinho (T14) removido do escopo Fase 1.0. Header agora: Logo · 💬 Mensagens · 🔔 Notificações · ⋯ Painel.

Elemento	Especificação	Ação
Logo Meu Agito	Quadrado laranja #E8640A, 38x38px, border-radius 10px, letra M branca. Padding esquerdo 20px.	Sem ação — identidade visual
💬 Mensagens	Ícone envelope. Cor #aaa (sem msgs) ou #fff (com msgs). Badge laranja com não lidas. Máx '99+'.	Abre T_CHAT — histórico de conversas
🔔 Notificações	Ícone sino. Cor #aaa (sem) ou #fff (com). Badge laranja com não lidas. Máx '99+'. Padding dir. 20px.	Abre T13 — Central de Notificações
⋯ Painel	Ícone 3 pontos. Cor #aaa. 22px. Área de toque 44x44px.	Abre Painel de opções
Fundo	#0D0D0D com blur sutil — frosted glass. Borda inferior 1px #1A1A1A.	Sem ação
Altura	56px fixos.	—
Cidade	NÃO aparece no header. Gerenciada em Config → Localidade via M01.	—

4. Barra de Navegação Inferior — Especificação Definitiva v3
v3 ADENDO: Barra redesenhada. Removidos Perfil, Favoritos e Mensagens da barra. Adicionados Social e Atividade.

Pos.	Nome	Ícone	Destino	Badge	Comportamento
1	Social	Rede/pessoas	T_AGITO — Feed Social	Sem badge	Foto do usuário logado no feed → toque abre T_PERFIL próprio
2	Criar	✚ mais	Modal de criação — 3 opções	Sem badge	Abre modal: 📸 Foto · 🎬 Vídeo · 📍 Check-in. Nunca navega para nova tela.
3 ★	Home	Ícone casa	T06 — Home do app	Sem badge	Botão circular laranja #E8640A elevado 14px. 56px diâmetro. Âncora do app.
4	Atividade	Lista/check	T_ATIVIDADE — Favoritos/histórico	Badge numérico	Badge: novos favoritos sugeridos + atualizações de pedidos.
5	Config	⚙ engrenagem	T_CONFIG — Configurações	Sem badge	Conta, localidade, privacidade, segurança, preferências.

5. Campo de Busca — Zona 0
Posicionado logo abaixo do header. Não é um input real — é um botão estilizado. O teclado nunca abre no Home. Ao tocar, navega para T07 Busca Completa.

Container	Fundo #1A1A1A. Border-radius 14px. Altura 52px. Borda 1px #2A2A2A.
Ícone lupa	Outline, cor #666666, 18px. Padding esquerdo 16px.
Placeholder	'O que você quer encontrar hoje?' — cor #555555 — Arial Regular 15px.
Ícone filtros ⚙	Cor laranja #E8640A. 20px. Padding direito 16px. Separador vertical #2A2A2A.
Toque no campo	Navega para T07 Busca com teclado já aberto.
Toque no filtro ⚙	Navega para T07 com painel de filtros avançados já expandido.
Animação	Ao tocar: background vai de #1A1A1A para #222222 em 80ms.

6. As 7 Zonas do Feed
Z1 — Carrossel de Mega Eventos  |  Gatilho: FOMO — medo de perder algo grande
Fonte de dados	Sympla API + Eventbrite API + Google Places type=event. Via backend — nunca diretamente.
Scroll	Horizontal, snap por card. Mostra levemente o próximo (peek 10%).
Largura do card	90% da largura da tela.
Altura do card	220px fixos. Imagem preenche 100% com overlay gradiente.
Auto-play	Avança a cada 5 segundos sem interação. Pausa ao tocar. Retoma após 3s.
Número de cards	Mínimo 3, máximo 8. Se API retornar <3: seção não exibida.
Badge de urgência	HOJE (vermelho #C0392B) | EM ALTA 🔥 | ESTE FIM DE SEMANA | EM BREVE (laranja).
Ícone salvar ♡	Canto superior direito. Animação scale 0.8→1.2→1.0 em 300ms + háptico leve.
Toque no card	→ T_ITEM com template='evento'. T10 ELIMINADA.
Link 'Ver todos →'	→ T07 filtrado por categoria='evento'.
Título da seção	'🎉 Eventos que você não pode perder' — Bold 18px. Link 'Ver todos →' laranja à direita.

Z2 — O que está rolando agora 🔥  |  Gatilho: Curiosidade — feed misto e variado
Fonte de dados	Google Places nearbysearch + dados internos (views, buscas, check-ins).
Tipo de conteúdo	Feed infinito, misto — qualquer categoria. Barbearia ao lado de restaurante ao lado de evento.
Layout	Cards em coluna única, largura total, padding 20px. Scroll vertical contínuo.
Badge 'ao vivo'	Dot laranja pulsante + texto 'ao vivo' 11px laranja ao lado do título.
Foto principal	Largura 100%, altura 180px. Border-radius 14px no topo. Overlay gradiente.
Ícone de categoria	Canto superior esquerdo. Fundo semi-transparente.
Ícone ♡ salvar	Canto superior direito. Preenchido laranja quando salvo.
Toque no card	→ T_PERFIL do estabelecimento (tipo='estabelecimento') | → T_ITEM template='evento' (tipo='evento').
Campo 'tipo'	Backend sempre retorna o campo 'tipo' em cada item. App lê e navega corretamente — nunca infere.
Link 'Ver mais →'	→ T07 com ordenação 'Mais popular'.

Z3 — Não deixe passar ⏰  |  Gatilho: Urgência — acaba hoje ou amanhã
Fonte de dados	Google Places opennow + Sympla API (eventos hoje/amanhã).
Layout	Cards horizontais pequenos — scroll horizontal. 160px largura, 150px altura.
Badge	HOJE (vermelho) | AMANHÃ (laranja). Posição: canto superior esquerdo do card.
Toque no card evento	→ T_ITEM com template='evento'.
Toque no card lugar	→ T_PERFIL do estabelecimento.
Link 'Ver agenda →'	→ T07 filtrado por categoria='evento' + filtro='Hoje e amanhã'.
Campo 'tipo'	Backend retorna 'tipo' em cada item. App navega conforme o valor.

Z4 — Mais hypado da semana 📈  |  Gatilho: Validação social — todo mundo vai
Fonte de dados	Google Places rating + user_ratings_total + dados internos (views/buscas da semana).
Layout	Lista vertical de ranking — 5 posições. Card com borda esquerda laranja no #1.
Reinício	Ranking reinicia semanalmente. Timer regressivo exibido abaixo do título.
Elementos do card	Número + avatar + nome + categoria + distância | Nota + contagem de views.
Toque no item	→ T_PERFIL do estabelecimento.
Link 'Ver ranking →'	→ T07 com ordenação 'Mais popular' da categoria.

Z5 — Seus amigos foram aqui 👥  |  Gatilho: Prova social pessoal
Fonte de dados	Fase 1.0: Google Places reviews. Fase 1.2+: dados sociais internos (check-ins de amigos).
Layout	Cards horizontais — scroll horizontal. 180px largura, 180px altura.
Elementos	Foto do lugar + avatar do amigo sobreposto + nome do lugar + '@handle foi · ★★★★★'.
Toque no card	→ T_PERFIL do estabelecimento.

Z6 — Perto de você agora 📍  |  Gatilho: Conveniência — está do seu lado
Fonte de dados	Google Places nearbysearch + opennow=true + horário atual do dispositivo.
Layout	Cards horizontais — scroll horizontal. 150px largura, 170px altura.
Badge ABERTO	Verde #1A7A4A no canto do card. Só quando efetivamente aberto.
Distância	Exibida em metros e tempo a pé. Ex: '280m · ~3min a pé'.
Toque no card	→ T_PERFIL do estabelecimento.
Link 'Ver tudo →'	→ T07 com filtro 'Aberto agora' + ordenação 'Mais próximo'.

Z7 — Mais buscado da cidade 🏆  |  Gatilho: Pertencimento — o que a cidade usa
Fonte de dados	Dados internos do app: buscas + visualizações de perfil por cidade na semana.
Layout	Chips de categoria (scroll horizontal) + card campeão da categoria selecionada.
Chip padrão	Primeira categoria ativa ao abrir. Toque troca a categoria e atualiza o campeão.
Card campeão	Avatar 56px + badge '#1 em [categoria] esta semana' + nome + categoria + distância + nota.
Borda esquerda	4px laranja #E8640A no card campeão.
Toque no card	→ T_PERFIL do estabelecimento.
Link 'Ver ranking →'	→ T07 com filtro da categoria ativa.

7. Adendo — Eliminação da T10 e Navegação de Eventos
Este documento incorpora o T06 Adendo (T06_home_adendo.docx), que atualizou a navegação após a criação do T_ITEM.

T10 Eventos foi eliminada do projeto. Todos os cards e links de evento em qualquer parte do app levam para T_ITEM com template='evento'.

Elemento	ANTES (v2)	AGORA (v3 — definitivo)
Card carrossel Z1 — evento	T10 Eventos ou T_PERFIL	T_ITEM com template='evento'
Card Z3 — não deixe passar	T10 ou T_PERFIL	T_ITEM template='evento' (se tipo=evento) ou T_PERFIL (se tipo=lugar)
Link 'Ver todos →' Z1	T10 — Eventos	T07 filtrado: categoria='evento'
Link 'Ver agenda →' Z3	T10 — Eventos	T07 filtrado: categoria='evento' + hoje e amanhã

Regra definitiva: o backend sempre retorna o campo 'tipo' em cada item do feed. O app lê o campo e navega para T_ITEM (evento) ou T_PERFIL (estabelecimento). Nunca infere o tipo pelo visual do card.

8. Arquitetura de Dados — Transição API → Interno
Período	Google Places API	Dados internos	Observação
Dias 1–30	90%	10%	App recém-lançado — base de dados interna ainda pequena
Meses 1–3	70%	30%	Crescimento gradual de usuários e conteúdo orgânico
Meses 3–6	50%	50%	Equilíbrio entre dados externos e internos
Após mês 6	20%	80%	Plataforma madura — dados internos dominam o feed

Segurança: app mobile NUNCA chama APIs externas diretamente. Tudo passa pelo backend (SEC-02). Cidade do usuário usada apenas para filtrar chamadas internas — nunca enviada a APIs externas em tempo real sem consentimento (SEC-01).

9. Fluxo Completo de Navegação
Elemento tocado	Condição	Destino	Observação
Campo de busca	Qualquer toque	T07 — Busca (teclado aberto)	E1
Ícone filtros ⚙ na busca	Toque no filtro	T07 — filtros expandidos	E2
Card Z1/Z2/Z3	tipo = 'evento'	T_ITEM template='evento'	T10 eliminada
Card Z1/Z2/Z3	tipo = 'estabelecimento'	T_PERFIL Estabelecimento	
Link 'Ver todos →' Z1	—	T07 cat='evento'	
Link 'Ver mais →' Z2	—	T07 ordenação 'Mais popular'	E3
Link 'Ver agenda →' Z3	—	T07 cat='evento' + hoje/amanhã	E4
Card Z4/Z5/Z6/Z7	—	T_PERFIL Estabelecimento	
Link 'Ver tudo →' Z6	—	T07 filtro 'Aberto agora' + próximo	E5
Link 'Ver ranking →' Z7	—	T07 filtro categoria ativa	E6
Ícone ♡ salvar	Qualquer card	Salva em favoritos	Sem navegar
💬 Mensagens (header)	—	T_CHAT	
🔔 Notificações (header)	—	T13 — Notificações	
⋯ Painel (header)	—	Painel de opções	
👥 Social (barra)	—	T_AGITO — Feed Social	
✚ Criar (barra)	—	Modal de criação	Foto/Vídeo/Check-in
★ Home (barra)	—	T06 — scroll ao topo	Se já no Home
📋 Atividade (barra)	—	T_ATIVIDADE	
⚙ Config (barra)	—	T_CONFIG	
Pull-to-refresh	—	Recarrega todos os feeds	Indicador laranja

10. Regras de Negócio
RN-01 — Cidade não aparece no header
O header v3 não exibe cidade. A cidade do usuário é gerenciada exclusivamente em Config → Localidade via M01. Qualquer referência anterior ao texto 'São Paulo ▾' no header está obsoleta.
RN-02 — T10 Eventos eliminada
A tela T10 não existe mais. Qualquer card ou link de evento em qualquer parte do app leva para T_ITEM com template='evento'. Listas de eventos passam pelo T07 com filtro categoria='evento'.
RN-03 — Campo 'tipo' é obrigatório no payload
O backend sempre retorna o campo 'tipo' em cada item do feed (valores: 'evento' | 'estabelecimento'). O app nunca infere o tipo pelo visual — sempre lê o campo.
RN-04 — Botão ★ Home é a âncora do app
O botão central da barra de navegação é circular laranja #E8640A, 56px, elevado 14px. É o ponto de retorno principal. Quando o usuário já está no Home, um toque sobe o scroll ao topo sem recarregar dados.
RN-05 — Lazy loading das zonas Z3–Z7
Z1 e Z2 carregam ao abrir o Home. Z3 a Z7 carregam ao se aproximar pelo scroll. Isso garante o tempo de carregamento inicial menor que 1.5s.
RN-06 — APIs externas nunca chamadas pelo app
O app nunca chama Google Places, Sympla ou Eventbrite diretamente. Todas as chamadas passam pelo backend do Meu Agito, que retorna dados já formatados (SEC-02).
RN-07 — Pull-to-refresh recarrega tudo
Ao puxar de cima para baixo, todos os feeds são recarregados do início. O indicador de loading é laranja #E8640A.
RN-08 — Seção Z1 some se API retornar <3 eventos
Se a API de eventos retornar menos de 3 itens, a seção Z1 (carrossel) não é exibida. Sem espaço vazio — o feed continua direto para Z2.

Dev: Feed implementado com FlatList (React Native). Zonas como componentes com lazy loading. Cache de 30 minutos no servidor para chamadas às APIs de eventos.

11. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui as 7 zonas do feed, header v3 (sem cidade, sem carrinho), barra de navegação v3 (Social | ✚ Criar | ★ | Atividade | Config) e todos os elementos visuais.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T06 Home v3</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#111; font-family:Arial,sans-serif; display:flex; justify-content:center; padding:30px 20px; min-height:100vh; }

  .phone {
    width:360px;
    background:#0D0D0D;
    border-radius:40px;
    border:2px solid #2A2A2A;
    overflow:hidden;
    position:relative;
    box-shadow:0 20px 60px rgba(0,0,0,0.8);
  }

  /* STATUS BAR */
  .status { height:28px; background:#0D0D0D; display:flex; align-items:center; justify-content:space-between; padding:0 22px; font-size:11px; color:#888; }

  /* HEADER */
  .header {
    display:flex; align-items:center; justify-content:space-between;

    padding:8px 20px 10px;
    background:#0D0D0D;
    position:sticky; top:0; z-index:50;
    border-bottom:1px solid #1A1A1A;
  }
  .logo { width:38px; height:38px; background:#E8640A; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; color:#fff; }
  /* Cidade removida do header — v3 ADENDO: acesso via Config → Localidade */
  .header-icons { display:flex; gap:14px; align-items:center; }
  .hicon { position:relative; font-size:20px; color:#aaa; cursor:pointer; }
  .badge { position:absolute; top:-4px; right:-6px; background:#E8640A; color:#fff; font-size:9px; font-weight:bold; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1.5px solid #0D0D0D; }

  /* SCROLL AREA */

  .scroll { overflow-y:auto; height:calc(100% - 180px); }
  .scroll::-webkit-scrollbar { display:none; }

  /* BUSCA */
  .search-wrap { padding:10px 16px 14px; background:#0D0D0D; }
  .search-box { background:#1A1A1A; border-radius:14px; height:48px; display:flex; align-items:center; padding:0 14px; gap:8px; border:1px solid #2A2A2A; cursor:pointer; }
  .search-box span:first-child { font-size:16px; color:#555; }
  .search-text { flex:1; font-size:13px; color:#555; }
  .search-filter { font-size:16px; color:#E8640A; padding-left:8px; border-left:1px solid #2A2A2A; }

  /* SEÇÃO GENÉRICA */
  .sec-header { display:flex; align-items:center; justify-content:space-between; padding:16px 16px 8px; }
  .sec-title { font-size:16px; font-weight:bold; color:#fff; }
  .sec-link { font-size:12px; color:#E8640A; cursor:pointer; }

  .live-dot { display:inline-block; width:7px; height:7px; background:#E8640A; border-radius:50%; margin-right:5px; animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* Z1 — CARROSSEL MEGA EVENTOS */
  .carousel-wrap { padding:0 0 4px; }
  .carousel { display:flex; gap:12px; overflow-x:auto; padding:0 16px 4px; scroll-snap-type:x mandatory; }
  .carousel::-webkit-scrollbar { display:none; }
  .carousel-card {
    flex-shrink:0; width:300px; height:200px; border-radius:18px;
    position:relative; overflow:hidden; scroll-snap-align:start; cursor:pointer;
    border:1px solid #2A2A2A;
  }
  .carousel-card .bg { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:60px; }
  .carousel-card .overlay { position:absolute; bottom:0; left:0; right:0; height:100px; background:linear-gradient(transparent, rgba(0,0,0,0.92)); }

  .carousel-card .card-badge { position:absolute; top:12px; left:12px; background:#C0392B; color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:6px; }
  .carousel-card .card-badge.em-alta { background:#E8640A; }
  .carousel-card .card-save { position:absolute; top:12px; right:12px; width:30px; height:30px; background:rgba(0,0,0,0.5); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; }
  .carousel-card .card-info { position:absolute; bottom:12px; left:14px; right:14px; }
  .carousel-card .card-name { font-size:15px; font-weight:bold; color:#fff; margin-bottom:3px; }
  .carousel-card .card-meta { font-size:11px; color:#ccc; }
  .carousel-dots { display:flex; justify-content:center; gap:5px; padding:6px 0 2px; }

  .dot { width:6px; height:6px; border-radius:50%; background:#333; }
  .dot.active { width:18px; border-radius:3px; background:#E8640A; }

  /* FEED CARD (Z2) */
  .feed-card {
    background:#1A1A1A; border-radius:14px; margin:0 16px 12px; overflow:hidden;
    border:1px solid #222; cursor:pointer;
  }
  .feed-card .fc-img { width:100%; height:160px; object-fit:cover; display:flex; align-items:center; justify-content:center; font-size:50px; background:#222; position:relative; }
  .fc-cat-badge { position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.7); color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:6px; }
  .fc-save { position:absolute; top:8px; right:10px; font-size:20px; cursor:pointer; }
  .feed-card .fc-body { padding:10px 12px 12px; }
  .fc-name { font-size:15px; font-weight:bold; color:#fff; margin-bottom:3px; }

  .fc-meta { display:flex; align-items:center; gap:6px; font-size:12px; color:#888; margin-bottom:4px; }
  .fc-open { background:#1A7A4A; color:#fff; font-size:9px; font-weight:bold; padding:1px 5px; border-radius:3px; }
  .fc-stars { font-size:12px; color:#E8640A; }
  .fc-social { font-size:12px; color:#E8640A; margin-top:3px; }

  /* Z3 — NÃO DEIXE PASSAR */
  .horiz-scroll { display:flex; gap:10px; overflow-x:auto; padding:0 16px 4px; }
  .horiz-scroll::-webkit-scrollbar { display:none; }
  .small-card { flex-shrink:0; width:160px; height:150px; border-radius:14px; overflow:hidden; position:relative; cursor:pointer; background:#1A1A1A; border:1px solid #222; }
  .small-card .sc-img { width:100%; height:100px; display:flex; align-items:center; justify-content:center; font-size:36px; background:#222; }

  .small-card .sc-badge-hoje { position:absolute; top:8px; left:8px; background:#C0392B; color:#fff; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; }
  .small-card .sc-badge-amanha { position:absolute; top:8px; left:8px; background:#E8640A; color:#fff; font-size:9px; font-weight:bold; padding:2px 6px; border-radius:4px; }
  .small-card .sc-body { padding:6px 8px; }
  .small-card .sc-name { font-size:12px; font-weight:bold; color:#fff; }
  .small-card .sc-dist { font-size:10px; color:#666; }

  /* Z4 — MAIS HYPADO */
  .ranking-wrap { padding:0 16px; }
  .rank-item { display:flex; align-items:center; gap:10px; background:#1A1A1A; border-radius:12px; padding:10px 12px; margin-bottom:8px; cursor:pointer; border:1px solid #222; }
  .rank-item.first { border-left:3px solid #E8640A; }

  .rank-num { font-size:20px; font-weight:bold; color:#E8640A; width:24px; flex-shrink:0; }
  .rank-num.gray { color:#555; font-size:16px; }
  .rank-avatar { width:48px; height:48px; border-radius:50%; background:#2A2A2A; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .rank-info { flex:1; }
  .rank-name { font-size:14px; font-weight:bold; color:#fff; }
  .rank-cat { font-size:11px; color:#888; margin-top:1px; }
  .rank-right { text-align:right; }
  .rank-nota { font-size:15px; font-weight:bold; color:#fff; }
  .rank-views { font-size:10px; color:#555; }

  /* Z5 — AMIGOS FORAM */
  .friends-card { flex-shrink:0; width:180px; height:180px; border-radius:14px; overflow:hidden; position:relative; cursor:pointer; background:#1A1A1A; border:1px solid #222; }

  .friends-card .fr-img { width:100%; height:120px; display:flex; align-items:center; justify-content:center; font-size:40px; background:#222; position:relative; }
  .friend-avatar { position:absolute; bottom:6px; left:8px; width:30px; height:30px; border-radius:50%; background:#E8640A; border:2px solid #1A1A1A; display:flex; align-items:center; justify-content:center; font-size:14px; }
  .friends-card .fr-body { padding:7px 9px; }
  .fr-name { font-size:12px; font-weight:bold; color:#fff; }
  .fr-social { font-size:10px; color:#E8640A; }

  /* Z6 — PERTO DE VOCÊ */
  .near-card { flex-shrink:0; width:150px; height:170px; border-radius:14px; overflow:hidden; position:relative; cursor:pointer; background:#1A1A1A; border:1px solid #222; }
  .near-card .nc-img { width:100%; height:110px; display:flex; align-items:center; justify-content:center; font-size:36px; background:#222; position:relative; }

  .nc-open { position:absolute; top:7px; left:7px; background:#1A7A4A; color:#fff; font-size:9px; font-weight:bold; padding:2px 5px; border-radius:3px; }
  .near-card .nc-body { padding:7px 9px; }
  .nc-name { font-size:12px; font-weight:bold; color:#fff; }
  .nc-dist { font-size:10px; color:#888; display:flex; align-items:center; gap:3px; }

  /* Z7 — MAIS BUSCADO */
  .chips-row { display:flex; gap:8px; overflow-x:auto; padding:0 16px 10px; }
  .chips-row::-webkit-scrollbar { display:none; }
  .chip { flex-shrink:0; padding:6px 14px; border-radius:20px; font-size:12px; cursor:pointer; border:1px solid #2A2A2A; color:#888; background:#1A1A1A; white-space:nowrap; }
  .chip.active-chip { background:#E8640A; color:#fff; font-weight:bold; border-color:#E8640A; }

  .champ-card { margin:0 16px 8px; background:#1A1A1A; border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:12px; border:1px solid #222; border-left:4px solid #E8640A; cursor:pointer; }

  .champ-avatar { width:56px; height:56px; border-radius:50%; background:#2A2A2A; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
  .champ-info { flex:1; }
  .champ-badge { font-size:11px; color:#E8640A; margin-bottom:2px; }
  .champ-name { font-size:15px; font-weight:bold; color:#fff; }
  .champ-cat { font-size:11px; color:#888; }
  .champ-nota { font-size:18px; font-weight:bold; color:#E8640A; }

  /* BOTTOM NAV */
  .bottom-nav {
    position:sticky; bottom:0;
    background:#0D0D0D; border-top:1px solid #1A1A1A;
    display:flex; align-items:center; justify-content:space-around;
    padding:10px 0 16px; z-index:50;
  }
  .nav-tab { text-align:center; cursor:pointer; }
  .nav-icon-b { font-size:22px; color:#555; }
  .nav-label { font-size:9px; color:#555; margin-top:2px; }

  .nav-center-btn {
    width:54px; height:54px; border-radius:50%;
    background:#E8640A;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; margin-top:-10px;
    box-shadow:0 0 20px rgba(232,100,10,0.6);
    cursor:pointer;
  }

  /* SPACER */
  .spacer { height:16px; }
</style>
</head>
<body>

<div class="phone">
  <div class="status"><span>21:30</span><span>📶 🔋 87%</span></div>

  <!-- HEADER -->
  <div class="header">
    <div class="logo">M</div>
    <div class="header-icons">
      <div class="hicon">💬<div class="badge">3</div></div>
      <div class="hicon">🔔<div class="badge">5</div></div>
      <div class="hicon" style="font-size:18px; color:#aaa;">⋯</div>
    </div>
  </div>

  <!-- SCROLL -->
  <div class="scroll">

    <!-- BUSCA -->
    <div class="search-wrap">

      <div class="search-box">
        <span>🔍</span>
        <span class="search-text">O que você quer encontrar hoje?</span>
        <span class="search-filter">⚙</span>
      </div>
    </div>

    <!-- Z1 — MEGA EVENTOS -->
    <div class="carousel-wrap">
      <div class="sec-header">
        <span class="sec-title">🎉 Eventos que você não pode perder</span>
        <span class="sec-link">Ver todos →</span>
      </div>
      <div class="carousel">
        <div class="carousel-card">
          <div class="bg" style="background:linear-gradient(135deg,#1A0010,#4A0030)">🎸</div>
          <div class="overlay"></div>
          <div class="card-badge">HOJE</div>
          <div class="card-save">♡</div>
          <div class="card-info">
            <div class="card-name">Rock in Rio — Dia 3</div>

            <div class="card-meta">📍 Cidade do Rock · 45km · Hoje 18h</div>
          </div>
        </div>
        <div class="carousel-card">
          <div class="bg" style="background:linear-gradient(135deg,#001A10,#004A20)">🎵</div>
          <div class="overlay"></div>
          <div class="card-badge em-alta">EM ALTA 🔥</div>
          <div class="card-save">♡</div>
          <div class="card-info">
            <div class="card-name">Festival Lollapalooza SP</div>
            <div class="card-meta">📍 Autódromo · 12km · Sáb e Dom</div>
          </div>
        </div>
        <div class="carousel-card">
          <div class="bg" style="background:linear-gradient(135deg,#1A1000,#4A2800)">🎭</div>
          <div class="overlay"></div>
          <div class="card-badge em-alta">ESTE FIM DE SEMANA</div>

          <div class="card-save">♡</div>
          <div class="card-info">
            <div class="card-name">Feira Cultural da Vila Madalena</div>
            <div class="card-meta">📍 Vila Madalena · 3.2km · Sáb 10h</div>
          </div>
        </div>
      </div>
      <div class="carousel-dots">
        <div class="dot active"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>

    <!-- Z2 — O QUE ESTÁ ROLANDO AGORA -->
    <div class="sec-header">
      <span class="sec-title"><span class="live-dot"></span>O que está rolando agora 🔥</span>
      <span class="sec-link">Ver mais →</span>
    </div>

    <div class="feed-card">
      <div class="fc-img">
        🍕
        <div class="fc-cat-badge">Gastronomia</div>
        <div class="fc-save">♡</div>

      </div>
      <div class="fc-body">
        <div class="fc-name">Pizzaria Dom Pão</div>
        <div class="fc-meta">
          <span>🍕 Pizzaria</span>
          <span>·</span>
          <span>800m</span>
          <span class="fc-open">ABERTO</span>
        </div>
        <div class="fc-meta">
          <span class="fc-stars">★★★★★</span>
          <span style="color:#888">4.9 (312 aval.)</span>
        </div>
        <div class="fc-social">🔥 87 pessoas viram hoje</div>
      </div>
    </div>

    <div class="feed-card">
      <div class="fc-img" style="background:#1A1A2A">
        ✂
        <div class="fc-cat-badge">Beleza</div>
        <div class="fc-save">♡</div>
      </div>
      <div class="fc-body">
        <div class="fc-name">Barbearia Vintage</div>
        <div class="fc-meta">

          <span>✂ Barbearia</span>
          <span>·</span>
          <span>320m</span>
          <span class="fc-open">ABERTO</span>
        </div>
        <div class="fc-meta">
          <span class="fc-stars">★★★★★</span>
          <span style="color:#888">4.8 (184 aval.)</span>
        </div>
        <div class="fc-social">👥 Seu amigo João foi aqui</div>
      </div>
    </div>

    <div class="feed-card">
      <div class="fc-img" style="background:#1A2A1A">
        🏨
        <div class="fc-cat-badge">Hospedagem</div>
        <div class="fc-save">♡</div>
      </div>
      <div class="fc-body">
        <div class="fc-name">Hotel Paulista Garden</div>
        <div class="fc-meta">
          <span>🏨 Hotel</span>
          <span>·</span>
          <span>1.4km</span>
        </div>
        <div class="fc-meta">

          <span class="fc-stars">★★★★☆</span>
          <span style="color:#888">4.5 (97 aval.)</span>
        </div>
        <div class="fc-social">📈 Mais buscado da semana</div>
      </div>
    </div>

    <!-- Z3 — NÃO DEIXE PASSAR -->
    <div class="sec-header">
      <span class="sec-title">Não deixe passar ⏰</span>
      <span class="sec-link">Ver agenda →</span>
    </div>
    <div class="horiz-scroll">
      <div class="small-card">
        <div class="sc-img">🎭</div>
        <div class="sc-badge-hoje">HOJE às 20h</div>
        <div class="sc-body">
          <div class="sc-name">Peça no Teatro Cultura</div>
          <div class="sc-dist">📍 2.1km</div>
        </div>
      </div>
      <div class="small-card">
        <div class="sc-img">🍻</div>
        <div class="sc-badge-hoje">Hoje · Últimas vagas</div>

        <div class="sc-body">
          <div class="sc-name">Happy Hour Bar 5Skin</div>
          <div class="sc-dist">📍 650m</div>
        </div>
      </div>
      <div class="small-card">
        <div class="sc-img">🎵</div>
        <div class="sc-badge-amanha">AMANHÃ 19h</div>
        <div class="sc-body">
          <div class="sc-name">Show Samba do Quintal</div>
          <div class="sc-dist">📍 1.8km</div>
        </div>
      </div>
      <div class="small-card">
        <div class="sc-img">🏋️</div>
        <div class="sc-badge-amanha">AMANHÃ</div>
        <div class="sc-body">
          <div class="sc-name">Aula grátis de CrossFit</div>
          <div class="sc-dist">📍 900m</div>
        </div>
      </div>
    </div>

    <!-- Z4 — MAIS HYPADO -->
    <div class="sec-header">
      <span class="sec-title">Mais hypado da semana 📈</span>

      <span class="sec-link">Ver ranking →</span>
    </div>
    <div style="padding:0 16px 4px; font-size:11px; color:#E8640A">⏱ Ranking reinicia em 3 dias</div>
    <div class="ranking-wrap">
      <div class="rank-item first">
        <div class="rank-num">#1</div>
        <div class="rank-avatar">🍕</div>
        <div class="rank-info">
          <div class="rank-name">Pizzaria Dom Pão</div>
          <div class="rank-cat">Gastronomia · 800m</div>
        </div>
        <div class="rank-right">
          <div class="rank-nota">★ 4.9</div>
          <div class="rank-views">1.2k views</div>
        </div>
      </div>
      <div class="rank-item">
        <div class="rank-num gray">#2</div>
        <div class="rank-avatar">✂</div>
        <div class="rank-info">
          <div class="rank-name">Barbearia Vintage</div>

          <div class="rank-cat">Beleza · 320m</div>
        </div>
        <div class="rank-right">
          <div class="rank-nota">★ 4.8</div>
          <div class="rank-views">847 views</div>
        </div>
      </div>
      <div class="rank-item">
        <div class="rank-num gray">#3</div>
        <div class="rank-avatar">☕</div>
        <div class="rank-info">
          <div class="rank-name">Café Ponto Certo</div>
          <div class="rank-cat">Gastronomia · 400m</div>
        </div>
        <div class="rank-right">
          <div class="rank-nota">★ 4.7</div>
          <div class="rank-views">612 views</div>
        </div>
      </div>
      <div class="rank-item">
        <div class="rank-num gray">#4</div>
        <div class="rank-avatar">💪</div>
        <div class="rank-info">

          <div class="rank-name">Smart Fit Augusta</div>
          <div class="rank-cat">Fitness · 1.1km</div>
        </div>
        <div class="rank-right">
          <div class="rank-nota">★ 4.5</div>
          <div class="rank-views">490 views</div>
        </div>
      </div>
      <div class="rank-item">
        <div class="rank-num gray">#5</div>
        <div class="rank-avatar">🏨</div>
        <div class="rank-info">
          <div class="rank-name">Hotel Paulista Garden</div>
          <div class="rank-cat">Hospedagem · 1.4km</div>
        </div>
        <div class="rank-right">
          <div class="rank-nota">★ 4.5</div>
          <div class="rank-views">381 views</div>
        </div>
      </div>
    </div>

    <!-- Z5 — AMIGOS FORAM -->
    <div class="sec-header">
      <span class="sec-title">Seus amigos foram aqui 👥</span>

    </div>
    <div class="horiz-scroll">
      <div class="friends-card">
        <div class="fr-img">
          🍕
          <div class="friend-avatar">👨</div>
        </div>
        <div class="fr-body">
          <div class="fr-name">Pizzaria Dom Pão</div>
          <div class="fr-social">@joao foi · ★★★★★</div>
        </div>
      </div>
      <div class="friends-card">
        <div class="fr-img" style="background:#1A1A2A">
          ✂
          <div class="friend-avatar">👩</div>
        </div>
        <div class="fr-body">
          <div class="fr-name">Barbearia Vintage</div>
          <div class="fr-social">@maria foi · ★★★★★</div>
        </div>
      </div>
      <div class="friends-card">
        <div class="fr-img" style="background:#1A2A2A">
          ☕
          <div class="friend-avatar">👦</div>

        </div>
        <div class="fr-body">
          <div class="fr-name">Café Ponto Certo</div>
          <div class="fr-social">@pedro foi · ★★★★☆</div>
        </div>
      </div>
    </div>

    <!-- Z6 — PERTO DE VOCÊ AGORA -->
    <div class="sec-header">
      <span class="sec-title">Perto de você agora 📍</span>
      <span class="sec-link">Ver tudo →</span>
    </div>
    <div style="padding:0 16px 8px; font-size:12px; color:#888">Boa noite! Que tal um jantar? 🌙</div>
    <div class="horiz-scroll">
      <div class="near-card">
        <div class="nc-img">🍔<div class="nc-open">ABERTO</div></div>
        <div class="nc-body">
          <div class="nc-name">Burger King Augusta</div>
          <div class="nc-dist">📍 280m · ~3min a pé</div>
        </div>
      </div>
      <div class="near-card">

        <div class="nc-img">🍣<div class="nc-open">ABERTO</div></div>
        <div class="nc-body">
          <div class="nc-name">Sushi Naka</div>
          <div class="nc-dist">📍 550m · ~6min a pé</div>
        </div>
      </div>
      <div class="near-card">
        <div class="nc-img">🍺<div class="nc-open">ABERTO</div></div>
        <div class="nc-body">
          <div class="nc-name">Bar da Esquina</div>
          <div class="nc-dist">📍 720m · ~9min a pé</div>
        </div>
      </div>
      <div class="near-card">
        <div class="nc-img">🍦<div class="nc-open">ABERTO</div></div>
        <div class="nc-body">
          <div class="nc-name">Sorvete Gelato Fino</div>
          <div class="nc-dist">📍 380m · ~4min a pé</div>
        </div>
      </div>
    </div>

    <!-- Z7 — MAIS BUSCADO DA CIDADE -->

    <div class="sec-header">
      <span class="sec-title">Mais buscado da cidade 🏆</span>
      <span class="sec-link">Ver ranking →</span>
    </div>
    <div style="padding:0 16px 6px; font-size:11px; color:#888">São Paulo essa semana</div>
    <div class="chips-row">
      <div class="chip active-chip">🍽 Restaurantes</div>
      <div class="chip">✂ Beleza</div>
      <div class="chip">🏥 Saúde</div>
      <div class="chip">🎵 Eventos</div>
      <div class="chip">🏨 Hospedagem</div>
    </div>
    <div class="champ-card">
      <div class="champ-avatar">🍕</div>
      <div class="champ-info">
        <div class="champ-badge">🏆 #1 em Restaurantes esta semana</div>
        <div class="champ-name">Pizzaria Dom Pão</div>
        <div class="champ-cat">Gastronomia · 800m · Aberto agora</div>

      </div>
      <div class="champ-nota">★ 4.9</div>
    </div>

    <div class="spacer"></div>
    <div class="spacer"></div>

  </div><!-- /scroll -->

  <!-- BOTTOM NAV — v3 ADENDO: Social | ✚ Criar | ★ Home | Atividade | Config -->
  <div class="bottom-nav">
    <div class="nav-tab">
      <div class="nav-icon-b">👥</div>
      <div class="nav-label">Social</div>
    </div>
    <div class="nav-tab">
      <div class="nav-icon-b" style="font-size:20px;">✚</div>
      <div class="nav-label">Criar</div>
    </div>
    <div class="nav-center-btn">★</div>
    <div class="nav-tab">
      <div class="nav-icon-b">📋</div>
      <div class="nav-label">Atividade</div>
    </div>
    <div class="nav-tab">
      <div class="nav-icon-b">⚙</div>
      <div class="nav-label">Config</div>
    </div>

  </div>

</div><!-- /phone -->

</body>
</html>

