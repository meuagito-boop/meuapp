MEU AGITO
T13 — Central de Notificações
Arquitetura de tela — Especificação completa v3
Acessado pelo 🔔 no header · Lista cronológica única · 4 tipos · Push via FCM + APNs
1. Identificação da Tela
Código	T13
Nome	Central de Notificações
Tipo	Tela completa — substitui o Home durante a visita. Barra de navegação inferior permanece visível.
Fase	Fase 1.0 — presente desde o lançamento. Notificações sociais ativas na Fase 1.2+.
Como é acessada	Toque no ícone 🔔 no header | Toque em notificação push recebida | Toque no badge laranja do sino
Acesso via barra	NÃO — o sino está no header, não na barra inferior. Correção v3 aplicada.
Tela anterior	T06 Home ou qualquer tela do app que tenha o header com o sino visível
Telas seguintes	T_PERFIL Estabelecimento | T_PERFIL Usuario | T_AGITO | T_PEDIDO_DETALHE | T_AGENDAMENTO_DETALHE | T_CONFIG
Badge no sino	Número de não lidas. Some ao entrar na tela — não ao receber. Máximo exibido: '99+'.
Scroll	Vertical — lista cronológica. Header fixo. Barra inferior fixa.
Prioridade	Alta — canal direto de comunicação com o usuário

2. Conceito e Filosofia
A Central de Notificações é o painel de comunicação do Meu Agito com o usuário. Todos os tipos — social, comercial, pedidos e sistema — chegam em uma única lista cronológica. O usuário vê tudo em um lugar, sem abas.

Notificações relevantes	Notificações devem ser relevantes e no momento certo — nunca spam.
Ação clara ao tocar	Cada notificação leva o usuário para uma ação clara e específica.
Controle do usuário	O usuário tem controle total sobre quais tipos recebe — via T_CONFIG Notificações.
Não lidas vs lidas	Itens não lidos ficam visualmente distintos — sem apagar o histórico.
Limite de push	Máximo 5 notificações push por dia por usuário — qualidade acima de quantidade.
Segurança não desativável	Notificações de segurança não podem ser desativadas — obrigatório por policy.

3. Estrutura Geral da Tela
Header da tela (fixo)	Botão ← Voltar + título 'Notificações' + botão 'Marcar lidas' (só quando há não lidas). Fundo #0D0D0D. 56px.
Contador não lidas	Linha fixa abaixo do header. '🔔 X novas notificações' — número em laranja. Aparece só se houver não lidas.
Lista de notificações	Scroll vertical — cronológica (mais recente primeiro). Agrupada por data.
Agrupamento por data	Separadores: HOJE / ONTEM / dia da semana (Seg, Ter...) / data (12 jan).
Estado vazio	Ícone 🔔 + 'Nenhuma notificação ainda' + subtítulo amigável.
Barra inferior	Barra de navegação v3 — Social | ✚ Criar | ★ | Atividade | Config. Nenhuma aba marcada como ativa.

4. Header da Tela
Elemento	Especificação	Ação
Botão ← Voltar	Ícone seta esquerda. Branco 24px. Padding 20px. Área de toque 44x44px.	Retorna à tela anterior.
Título 'Notificações'	Arial Bold 18px branco. Centralizado.	Sem ação.
Botão 'Marcar lidas'	Arial Regular 13px laranja. Padding 20px direito. Aparece APENAS quando há não lidas.	Marca todas como lidas. Badge do sino vai a zero. Toast 'Todas marcadas ✓'.
Contador não lidas	'🔔 X novas notificações' — número em laranja Bold 14px. Fundo #1A1A1A abaixo do header.	Some (fade 200ms) ao marcar todas como lidas.

5. Anatomia de um Item de Notificação
Cada item segue a mesma estrutura visual base, com variações por tipo.

Elemento	Especificação	Variação por tipo
Dot não lida	Ponto laranja #E8640A 7px no canto superior esquerdo. Só em não lidas.	Igual para todos os tipos.
Avatar / ícone	Área circular 44x44px à esquerda. Foto de usuário, logo de estabelecimento ou ícone do sistema.	Social: foto. Estab: logo. Sistema: ícone laranja. Pedido: ícone da categoria.
Badge de tipo	Ícone 18x18px no canto inferior direito do avatar. Indica a categoria com cor específica.	Cor e ícone variam por tipo — ver seção 6.
Texto principal	Arial Regular 15px branco (não lida) ou #888 (lida). Máx 2 linhas. Nomes em Bold.	Bold no nome do ator e do objeto da notificação.
Tempo decorrido	Arial Regular 12px #555. Abaixo do texto. Formato relativo: 'agora', '2min', '1h', 'Ontem', data.	Igual para todos os tipos.
Miniatura	Imagem 44x44px, border-radius 8px, canto direito. Aparece quando há conteúdo visual associado.	Só em notificações com conteúdo visual (foto de post, imagem do lugar).
Fundo não lida	#161616 — destaque sutil.	Igual para todos os não lidos.
Fundo lida	#0D0D0D — mesmo fundo da tela. Item se 'funde' com o fundo.	Igual para todos os lidos.
Swipe esquerda	Revela botão vermelho 'Excluir'. Toque confirma exclusão com animação de colapso.	Igual para todos os tipos.
Toque no item	Marca como lido + navega para destino específico do tipo.	Destino varia — ver seção 6.

6. Tipos de Notificação — Detalhamento Completo
6.1 Notificações Sociais — Fase 1.2+
Badge	Cor	Texto da notificação	Destino ao tocar
👤 azul	Azul #3498DB	@João Silva começou a te seguir.	T_PERFIL do usuário João
❤ vermelho	Vermelho #E74C3C	@Maria e outras 4 pessoas curtiram sua foto.	Post curtido no T_AGITO
💬 cinza	Cinza #888	@Pedro comentou: 'Que lugar incrível!'	Post com comentário no T_AGITO
@ laranja	Laranja #E8640A	@Ana te mencionou em um post.	Post de Ana no T_AGITO
⭐ amarelo	Amarelo #F39C12	@Lucas curtiu sua avaliação do Bar do Zé.	T_PERFIL do Bar do Zé
🏅 roxo	Roxo #9B59B6	@Camila fez uma declaração sobre o Salão Beleza Total.	T_PERFIL do salão
↩ cinza	Cinza #888	@Felipe respondeu seu comentário.	Comentário no T_AGITO

6.2 Notificações de Estabelecimentos — Fase 1.0
Badge	Cor	Texto da notificação	Destino ao tocar
▶ laranja	Laranja #E8640A	Barbearia Vintage publicou um novo Momento.	Story da Barbearia no T_AGITO
% verde	Verde #27AE60	Restaurante Dom Pão tem promoção hoje: 20% off no almoço.	T_PERFIL do restaurante
📷 cinza	Cinza #555	Salão Glam publicou uma novidade.	Post no T_AGITO ou T_PERFIL
🟢 verde	Verde #27AE60	Café Ponto está aberto agora e fica a 400m de você.	T_PERFIL do café

6.3 Pedidos e Agendamentos — Fase 1.2+
Badge	Cor	Texto da notificação	Destino ao tocar
✓ laranja	Laranja #E8640A	Seu agendamento na Barbearia Vintage foi confirmado.	T_AGENDAMENTO_DETALHE
✕ vermelho	Vermelho #E74C3C	Seu agendamento de amanhã foi cancelado pelo estabelecimento.	T_AGENDAMENTO_DETALHE
🚀 azul	Azul #3498DB	Seu pedido saiu para entrega. Previsão: 25 min.	T_PEDIDO_DETALHE
✓ verde	Verde #27AE60	Pedido entregue com sucesso! Como foi sua experiência?	T_PEDIDO_DETALHE + avaliação

6.4 Sistema — Fase 1.0
Badge	Cor	Texto da notificação	Destino ao tocar
M laranja	Laranja #E8640A	Bem-vindo ao Meu Agito! Explore o que está rolando na sua cidade.	Sem ação
! laranja	Laranja #E8640A	Novo acesso detectado na sua conta. Se não foi você, proteja agora.	T_CONFIG Segurança — NÃO DESATIVÁVEL
⬆️ cinza	Cinza #888	Nova versão disponível. Atualize para a melhor experiência.	Abre App Store ou Google Play

7. Fluxo Completo de Navegação
De onde	Ação	Para onde	Observação
Qualquer tela (header)	Toca ícone 🔔	T13 — abre a lista	Badge some ao entrar
Push notification	Toca na notificação	T13 ou destino direto	Depende da config do app
T13 — item social	Toca item	T_PERFIL ou T_AGITO	Marca como lido
T13 — item estab.	Toca item	T_PERFIL ou Story no T_AGITO	Marca como lido
T13 — item pedido	Toca item	T_PEDIDO_DETALHE ou T_AGENDAMENTO	Marca como lido
T13 — item sistema	Toca item	Destino específico ou sem ação	Marca como lido
T13	Toca 'Marcar lidas'	Todos marcados — badge zero	Toast '✓ Todas marcadas'
T13 — item	Swipe esquerda	Botão Excluir vermelho	Toque confirma exclusão
T13	Botão ← Voltar	Tela anterior	Estado preservado

8. Todos os Elementos — Tabela Completa
Tipo	Elemento	Ação/Destino	Observações
BOTÃO	← Voltar	Tela anterior	Círculo #1A1A1A 34px. Área 44px.
VISUAL	Título 'Notificações'	Sem ação	Bold 18px branco. Centralizado.
BOTÃO	'Marcar lidas'	Marca todas — badge zero	Laranja 13px. Só quando há não lidas.
VISUAL	Contador '🔔 X novas'	Sem ação	Laranja. Fundo #1A1A1A. Some ao marcar.
VISUAL	Separador de data	Sem ação	Cinza #444. 10px. Hoje/Ontem/Data.
VISUAL	Dot não lida (laranja)	Sem ação	7px. Canto sup. esq. do item.
VISUAL	Avatar circular 44px	Toque no item navega	Foto/logo/ícone do sistema.
VISUAL	Badge de tipo (18px)	Toque no item navega	Canto inf. dir. do avatar. Cor por tipo.
VISUAL	Texto principal	Toque no item navega	Branco (não lida) / #888 (lida). 2 linhas.
VISUAL	Tempo decorrido	Sem ação	Cinza #555. 12px. Formato relativo.
VISUAL	Miniatura 44x44px	Toque no item navega	Só em notif. com conteúdo visual.
GESTO	Swipe esquerda no item	Botão Excluir vermelho	Exclusão com animação de colapso.
TOUCH	Toque no item	Marca lido + navega	Destino específico por tipo.
VISUAL	Estado vazio	Sem ação	Ícone 🔔 + título + subtítulo.
NAV	Barra de navegação v3	Destino por aba	Social|Criar|★|Atividade|Config. Nenhuma ativa.

9. Regras de Negócio
RN-01 — Acesso pelo 🔔 no header — não pela barra inferior
O sino está no header do app (v3). A barra inferior não tem aba de notificações. Quando o usuário está no T13, nenhuma aba da barra fica marcada como ativa.
RN-02 — Badge some ao entrar na tela
O número de não lidas no badge some ao entrar no T13 — não ao receber cada notificação. Ao sair, o badge reflete eventuais novas notificações recebidas durante a visita.
RN-03 — Máximo 5 push por dia
O sistema nunca envia mais de 5 notificações push por dia por usuário. Prioridade: segurança > pedidos/agendamentos > estabelecimentos > sociais.
RN-04 — Notificações de segurança não podem ser desativadas
Alertas de segurança (novo acesso, login suspeito) são enviados independente das preferências do usuário. É a única categoria obrigatória por policy.
RN-05 — Lista cronológica única sem abas
Todos os tipos de notificação aparecem na mesma lista, ordenados por recência. Sem abas por categoria — o usuário vê tudo em um lugar.
RN-06 — Agrupamento por data
Itens são agrupados com separadores de data: HOJE / ONTEM / dia da semana abreviado (Seg, Ter...) / data completa (12 jan). Separador aparece ao mudar de grupo.
RN-07 — Swipe para excluir
Swipe esquerdo em qualquer item revela botão vermelho 'Excluir'. Toque no botão confirma com animação de colapso vertical. Sem undo — exclusão permanente.
RN-08 — Notificações sociais na Fase 1.2+
Curtidas, comentários, seguidores e menções só são gerados quando a rede social estiver construída (Fase 1.2+). Na Fase 1.0 apenas notificações de estabelecimentos e sistema são enviadas.

Dev: Push via FCM (Android) + APNs (iOS). Biblioteca: @notifee/react-native ou expo-notifications. Token de push armazenado no backend vinculado ao usuário — renovado a cada login.

10. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui os 3 estados (com não lidas, todas lidas, vazio), os 4 tipos de notificação com badges coloridos e destinos, e barra de navegação v3.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T13 Notificações</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    font-family: Arial, sans-serif;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .page-title { color: #E8640A; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; text-align: center; }
  .page-sub   { color: #444; font-size: 11px; margin-bottom: 40px; text-align: center; }

  .phones-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 40px;
  }
  .phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }

  .phone-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  .phone {
    width: 290px;
    height: 620px;
    background: #0D0D0D;
    border-radius: 42px;
    border: 6px solid #1e1e1e;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex;
    flex-direction: column;
  }
  .notch {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 92px; height: 22px;
    background: #1e1e1e;
    border-radius: 0 0 14px 14px;
    z-index: 20;
  }

  /* Header da tela T13 */
  .t13-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 36px 16px 10px;
    background: #0D0D0D;
    border-bottom: 1px solid #1A1A1A;

    flex-shrink: 0;
  }
  .back-btn {
    width: 34px; height: 34px;
    background: #1a1a1a;
    border-radius: 50%;
    border: 1px solid #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    color: white;
    flex-shrink: 0;
  }
  .t13-title { font-size: 17px; font-weight: 900; color: white; }
  .mark-all  { font-size: 11px; color: #E8640A; }

  /* Contador não lidas */
  .unread-bar {
    background: #1A1A1A;
    padding: 10px 16px;
    font-size: 12px;
    color: #aaa;
    flex-shrink: 0;
    border-bottom: 1px solid #111;
  }
  .unread-bar span { color: #E8640A; font-weight: 700; }

  /* Agrupador de data */
  .date-group {
    padding: 10px 16px 4px;
    font-size: 10px;
    font-weight: 700;
    color: #444;
    letter-spacing: 1px;

    text-transform: uppercase;
    flex-shrink: 0;
  }

  /* Notif list */
  .notif-list {
    flex: 1;
    overflow-y: auto;
  }
  .notif-list::-webkit-scrollbar { display: none; }

  /* Item de notificação */
  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid #111;
    position: relative;
    cursor: pointer;
  }
  .notif-item.unread { background: #161616; }
  .notif-item.read   { background: #0D0D0D; }

  /* Dot não lida */
  .unread-dot {
    position: absolute;
    top: 14px; left: 4px;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #E8640A;
  }

  /* Avatar / ícone */
  .notif-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;

    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    position: relative;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
  }
  .notif-badge {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 18px; height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    border: 1.5px solid #0D0D0D;
  }

  /* Corpo do texto */
  .notif-body { flex: 1; min-width: 0; }
  .notif-text {
    font-size: 12px;
    line-height: 1.45;
    margin-bottom: 3px;
  }
  .notif-text.unread { color: white; }
  .notif-text.read   { color: #777; }
  .notif-text b      { color: white; }
  .notif-time        { font-size: 10px; color: #444; }

  /* Miniatura */
  .notif-thumb {
    width: 44px; height: 44px;

    border-radius: 8px;
    background: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    border: 1px solid #2a2a2a;
  }

  /* Estado vazio */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
  }
  .empty-icon  { font-size: 48px; }
  .empty-title { font-size: 15px; font-weight: 700; color: #555; text-align: center; }
  .empty-sub   { font-size: 12px; color: #333; text-align: center; line-height: 1.5; }

  /* Barra de navegação v3 */
  .bottom-nav {
    border-top: 1px solid #1A1A1A;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px 0 16px;
    background: #0D0D0D;

    flex-shrink: 0;
  }
  .nav-tab   { text-align: center; cursor: pointer; }
  .nav-icon  { font-size: 20px; color: #555; }
  .nav-lbl   { font-size: 9px; color: #555; margin-top: 2px; }
  .nav-center {
    width: 50px; height: 50px;
    border-radius: 50%;
    background: #E8640A;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-top: -10px;
    box-shadow: 0 0 18px rgba(232,100,10,0.6);
    cursor: pointer;
  }

  /* Info section */
  .info-section {
    width: 100%; max-width: 980px;
    background: #111;
    border-radius: 16px;
    padding: 24px;
    margin-top: 10px;
  }
  .info-title {
    color: #E8640A; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 16px; text-align: center;
  }
  .types-grid {

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  .type-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #2a2a2a;
  }
  .tc-title { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px; }
  .tc-row {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 5px 0; border-bottom: 1px solid #1e1e1e;
    font-size: 10px;
  }
  .tc-row:last-child { border-bottom: none; }
  .tc-badge {
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; flex-shrink: 0; margin-top: 1px;
  }
  .tc-info { flex: 1; }
  .tc-event { color: #888; }
  .tc-dest  { color: #E8640A; font-size: 9px; margin-top: 1px; }

</style>
</head>
<body>

  <div class="page-title">T13 — Central de Notificações</div>
  <div class="page-sub">Acessado pelo 🔔 no header · Lista cronológica única · 4 tipos de notificação</div>

  <div class="phones-row">

    <!-- Estado: com notificações não lidas -->
    <div class="phone-wrap">
      <div class="phone-label">Com não lidas</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t13-header">
          <div class="back-btn">←</div>
          <div class="t13-title">Notificações</div>
          <div class="mark-all">Marcar lidas</div>
        </div>

        <div class="unread-bar">🔔 <span>3 novas notificações</span></div>

        <div class="notif-list">
          <div class="date-group">HOJE</div>

          <!-- Social: curtida -->
          <div class="notif-item unread">

            <div class="unread-dot"></div>
            <div class="notif-avatar">
              👩
              <div class="notif-badge" style="background:#e74c3c;">❤</div>
            </div>
            <div class="notif-body">
              <div class="notif-text unread"><b>@maria</b> e outras 4 pessoas curtiram sua foto na Pizzaria Dom Pão.</div>
              <div class="notif-time">agora</div>
            </div>
            <div class="notif-thumb">🍕</div>
          </div>

          <!-- Estabelecimento: story -->
          <div class="notif-item unread">
            <div class="unread-dot"></div>
            <div class="notif-avatar">
              ✂️
              <div class="notif-badge" style="background:#E8640A;">▶</div>
            </div>
            <div class="notif-body">
              <div class="notif-text unread"><b>Barbearia Vintage</b> publicou um novo Momento.</div>

              <div class="notif-time">2min</div>
            </div>
            <div class="notif-thumb">💈</div>
          </div>

          <!-- Estabelecimento: promoção -->
          <div class="notif-item unread">
            <div class="unread-dot"></div>
            <div class="notif-avatar">
              🍕
              <div class="notif-badge" style="background:#27ae60;">%</div>
            </div>
            <div class="notif-body">
              <div class="notif-text unread"><b>Pizzaria Dom Pão</b> tem promoção hoje: 20% off no almoço.</div>
              <div class="notif-time">14min</div>
            </div>
          </div>

          <!-- Social: novo seguidor — lida -->
          <div class="notif-item read">
            <div class="notif-avatar" style="opacity:0.6;">
              👨

              <div class="notif-badge" style="background:#3498db;">👤</div>
            </div>
            <div class="notif-body">
              <div class="notif-text read"><b style="color:#aaa;">@joao</b> começou a te seguir.</div>
              <div class="notif-time">1h</div>
            </div>
          </div>

          <div class="date-group">ONTEM</div>

          <!-- Sistema -->
          <div class="notif-item read">
            <div class="notif-avatar" style="background:#1a0f05; border-color:#E8640A44; opacity:0.7;">
              📍
              <div class="notif-badge" style="background:#E8640A;">M</div>
            </div>
            <div class="notif-body">
              <div class="notif-text read">Bem-vindo ao <b style="color:#aaa;">Meu Agito</b>! Explore o que está rolando na sua cidade.</div>

              <div class="notif-time">Ontem às 19:42</div>
            </div>
          </div>

          <!-- Favorito abriu -->
          <div class="notif-item read">
            <div class="notif-avatar" style="opacity:0.6;">
              ☕
              <div class="notif-badge" style="background:#27ae60;">🟢</div>
            </div>
            <div class="notif-body">
              <div class="notif-text read"><b style="color:#aaa;">Café Ponto Certo</b> está aberto agora e fica a 400m de você.</div>
              <div class="notif-time">Ontem</div>
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:18px;">✚</div><div class="nav-lbl">Criar</div></div>

          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>

    <!-- Estado: todas lidas -->
    <div class="phone-wrap">
      <div class="phone-label">Todas lidas</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t13-header">
          <div class="back-btn">←</div>
          <div class="t13-title">Notificações</div>
          <div style="width:70px;"></div>
        </div>

        <div class="notif-list">
          <div class="date-group">HOJE</div>

          <div class="notif-item read">
            <div class="notif-avatar" style="opacity:0.6;">👩<div class="notif-badge" style="background:#e74c3c;">❤</div></div>

            <div class="notif-body">
              <div class="notif-text read"><b style="color:#aaa;">@maria</b> e outras 4 pessoas curtiram sua foto.</div>
              <div class="notif-time">1h</div>
            </div>
            <div class="notif-thumb" style="opacity:0.5;">🍕</div>
          </div>

          <div class="notif-item read">
            <div class="notif-avatar" style="opacity:0.6;">✂️<div class="notif-badge" style="background:#E8640A;">▶</div></div>
            <div class="notif-body">
              <div class="notif-text read"><b style="color:#aaa;">Barbearia Vintage</b> publicou um novo Momento.</div>
              <div class="notif-time">2h</div>
            </div>
            <div class="notif-thumb" style="opacity:0.5;">💈</div>
          </div>

          <div class="notif-item read">

            <div class="notif-avatar" style="opacity:0.6;">🍕<div class="notif-badge" style="background:#27ae60;">%</div></div>
            <div class="notif-body">
              <div class="notif-text read"><b style="color:#aaa;">Pizzaria Dom Pão</b> tem promoção hoje: 20% off.</div>
              <div class="notif-time">3h</div>
            </div>
          </div>

          <div class="date-group">ONTEM</div>

          <div class="notif-item read">
            <div class="notif-avatar" style="background:#1a0f05; border-color:#E8640A44; opacity:0.7;">📍<div class="notif-badge" style="background:#E8640A;">M</div></div>
            <div class="notif-body">
              <div class="notif-text read">Bem-vindo ao <b style="color:#aaa;">Meu Agito</b>!</div>
              <div class="notif-time">Ontem</div>

            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:18px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>

    <!-- Estado: vazio -->
    <div class="phone-wrap">
      <div class="phone-label">Estado vazio</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t13-header">
          <div class="back-btn">←</div>

          <div class="t13-title">Notificações</div>
          <div style="width:70px;"></div>
        </div>

        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <div class="empty-title">Nenhuma notificação ainda</div>
          <div class="empty-sub">Quando alguém interagir com você ou com seus lugares favoritos, você verá aqui.</div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:18px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>

        </div>
      </div>
    </div>

  </div>

  <!-- Tipos de notificação -->
  <div class="info-section">
    <div class="info-title">4 Tipos de Notificação — Badges e Destinos</div>
    <div class="types-grid">

      <div class="type-card">
        <div class="tc-title">TIPO 1 — SOCIAIS (Fase 1.2+)</div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#3498db;">👤</div>
          <div class="tc-info">
            <div class="tc-event">Novo seguidor</div>
            <div class="tc-dest">→ T_PERFIL do usuário</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#e74c3c;">❤</div>
          <div class="tc-info">
            <div class="tc-event">Curtida em post</div>
            <div class="tc-dest">→ Post no T_AGITO</div>

          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#888;">💬</div>
          <div class="tc-info">
            <div class="tc-event">Comentário em post</div>
            <div class="tc-dest">→ Post no T_AGITO</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#E8640A;">@</div>
          <div class="tc-info">
            <div class="tc-event">Menção em post</div>
            <div class="tc-dest">→ Post no T_AGITO</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#f39c12;">⭐</div>
          <div class="tc-info">
            <div class="tc-event">Curtida em avaliação</div>
            <div class="tc-dest">→ T_PERFIL do lugar</div>

          </div>
        </div>
      </div>

      <div class="type-card">
        <div class="tc-title">TIPO 2 — ESTABELECIMENTOS (Fase 1.0)</div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#E8640A;">▶</div>
          <div class="tc-info">
            <div class="tc-event">Novo Story publicado</div>
            <div class="tc-dest">→ Story no T_AGITO</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#27ae60;">%</div>
          <div class="tc-info">
            <div class="tc-event">Promoção publicada</div>
            <div class="tc-dest">→ T_PERFIL Estabelecimento</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#555;">📷</div>

          <div class="tc-info">
            <div class="tc-event">Novo post publicado</div>
            <div class="tc-dest">→ Post no T_AGITO</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#27ae60;">🟢</div>
          <div class="tc-info">
            <div class="tc-event">Favorito abriu agora</div>
            <div class="tc-dest">→ T_PERFIL Estabelecimento</div>
          </div>
        </div>
      </div>

      <div class="type-card">
        <div class="tc-title">TIPO 3 — PEDIDOS / AGENDAMENTOS (Fase 1.2+)</div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#E8640A;">✓</div>
          <div class="tc-info">
            <div class="tc-event">Agendamento confirmado</div>
            <div class="tc-dest">→ T_AGENDAMENTO_DETALHE</div>

          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#e74c3c;">✕</div>
          <div class="tc-info">
            <div class="tc-event">Agendamento cancelado</div>
            <div class="tc-dest">→ T_AGENDAMENTO_DETALHE</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#3498db;">🚀</div>
          <div class="tc-info">
            <div class="tc-event">Pedido saiu para entrega</div>
            <div class="tc-dest">→ T_PEDIDO_DETALHE</div>
          </div>
        </div>
      </div>

      <div class="type-card">
        <div class="tc-title">TIPO 4 — SISTEMA (Fase 1.0)</div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#E8640A;">M</div>

          <div class="tc-info">
            <div class="tc-event">Boas-vindas</div>
            <div class="tc-dest">→ Sem ação</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#E8640A;">!</div>
          <div class="tc-info">
            <div class="tc-event">Alerta de segurança</div>
            <div class="tc-dest">→ T_CONFIG Segurança</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#888;">⬆️</div>
          <div class="tc-info">
            <div class="tc-event">Atualização disponível</div>
            <div class="tc-dest">→ Abre loja de apps</div>
          </div>
        </div>
        <div class="tc-row">
          <div class="tc-badge" style="background:#E8640A; font-size:7px;">NÃO DESATIVÁVEL</div>

          <div class="tc-info">
            <div class="tc-event">Segurança não pode ser desativada</div>
            <div class="tc-dest">Obrigatório por policy</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Regras gerais -->
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Acessado pelo 🔔 no header — não pela barra inferior</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Badge some ao entrar na tela — não ao receber</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Lista cronológica única — sem abas por tipo</div>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Máx 5 push por dia por usuário</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Swipe esquerdo no item → botão Excluir</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Agrupamento por data (Hoje / Ontem / Seg / ...)</div>
      <div style="background:#1a1a1a; border:1px solid #E8640A44; border-radius:20px; padding:6px 12px; font-size:10px; color:#E8640A;">Notificações de segurança não podem ser desativadas</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Push via FCM (Android) + APNs (iOS)</div>

    </div>
  </div>

</body>
</html>

