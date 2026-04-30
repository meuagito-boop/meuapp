MEU AGITO
T_ATIVIDADE
Arquitetura de tela — Especificação completa v1
Favoritos · Pedidos · Agendamentos · Reservas · Histórico
1. Identificação da Tela
Código	T_ATIVIDADE
Nome	Atividade — Hub pessoal do usuário
Tipo	Tela hub com 5 cards — cada card abre uma tela filha dedicada
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0: Favoritos e Histórico ativos. Fase 1.2+: Pedidos, Agendamentos e Reservas.
Como é acessado	Posição 4 da barra de navegação inferior — ícone 📋 Atividade
Badge	Sem badge — ícone 📋 nunca exibe número
Tela anterior	Qualquer tela do app com a barra de navegação visível
Telas filhas	T_ATIVIDADE_FAVORITOS · T_ATIVIDADE_PEDIDOS · T_ATIVIDADE_AGENDAMENTOS · T_ATIVIDADE_RESERVAS · T_ATIVIDADE_HISTORICO
Prioridade	Alta — segunda tela de uso frequente após o Home

2. Conceito
O T_ATIVIDADE é o espaço pessoal do usuário dentro do app — um hub que centraliza tudo que ele fez, salvou ou tem pendente. A estrutura em cards verticais permite escaneamento rápido e crescimento natural com novas seções nas fases futuras.

Decisão de design: cada card abre uma tela nova (não expande inline). Isso garante espaço adequado para filtros, listas e ações dentro de cada seção.

3. Tela Principal — 5 Cards
#	Card	Fase	Preview no card	Tela filha
1	Meus Favoritos	1.0 — Ativo	Thumbnails dos últimos 4 + contador	T_ATIVIDADE_FAVORITOS
2	Meus Pedidos	1.2+ — Em breve	Sem preview	T_ATIVIDADE_PEDIDOS
3	Meus Agendamentos	1.2+ — Em breve	Sem preview	T_ATIVIDADE_AGENDAMENTOS
4	Minhas Reservas	1.2+ — Em breve	Sem preview	T_ATIVIDADE_RESERVAS
5	Histórico de Atividades	1.0 — Ativo	Sem preview	T_ATIVIDADE_HISTORICO

Card ativo	Background #1A1A1A. Borda 1px #2A2A2A. Cursor pointer. Toque: abre tela filha.
Card em breve	Background #1A1A1A. Borda 1px dashed #2A2A2A. Opacidade 0.6. Toque: sem ação (ou toast 'Em breve').
Ícone do card	44x44px border-radius 13px. Cor de fundo específica por seção.
Chevron ›	Ícone 16px #444. Só em cards ativos. Indica navegação.
Badge contador	Chip laranja pequeno com número. Aparece no card de Favoritos com a quantidade.

4. Meus Favoritos — T_ATIVIDADE_FAVORITOS
Fase	1.0 — Ativo desde o lançamento
O que é	Lista de tudo que o usuário salvou com ♡ em qualquer parte do app
Tipos de item	Lugares (T_PERFIL_ESTABELECIMENTO) · Eventos (T_ITEM template=evento) · Itens de catálogo (T_ITEM)
Filtros	Todos · Lugares · Eventos · Itens — chips horizontais fixos abaixo do header
Ordenação	Mais recente primeiro (ordem de quando foi salvo)
Item da lista	Thumbnail 54px + nome bold + categoria/meta + ♥ laranja à direita
Toque no item	Navega para T_PERFIL ou T_ITEM conforme o tipo
Swipe esquerdo	Revela botão vermelho 'Remover'. Confirmação inline — sem dialog.
Botão Editar	Header direito. Entra em modo de seleção múltipla para remover vários de uma vez.
Lista vazia	Ícone ♡ + 'Nenhum favorito ainda' + 'Salve lugares, eventos e itens tocando em ♡'

5. Meus Pedidos — T_ATIVIDADE_PEDIDOS
Fase	1.2+ — Em breve. Card visível mas inativo na Fase 1.0.
O que é	Histórico de pedidos de delivery e compras feitos pelo app
Filtros	Todos · Em andamento · Entregues · Cancelados
Card de pedido	Avatar do estabelecimento + nome + status + thumbnails dos itens (máx 3) + data + total
Status	Em andamento (laranja) · Entregue (verde) · Cancelado (vermelho)
Toque no card	Abre detalhe do pedido com itens completos (foto + nome + preço), endereço e timeline de status
Lista vazia	'Nenhum pedido ainda' + 'Seus pedidos aparecerão aqui quando esta funcionalidade estiver disponível'

6. Meus Agendamentos — T_ATIVIDADE_AGENDAMENTOS
Fase	1.2+ — Em breve. Card visível mas inativo na Fase 1.0.
O que é	Todos os agendamentos de serviços e procedimentos feitos pelo app
Filtros	Próximos · Passados · Cancelados
Card de agendamento	Box de data (dia + mês em laranja) + serviço bold + estabelecimento + horário + duração + profissional
Botões	'✕ Cancelar' (vermelho) · '↺ Reagendar' (laranja). Ambos abrem confirmação antes de executar.
Toque no card	Expande com todos os detalhes ou abre tela de detalhe do agendamento
Lista vazia	'Nenhum agendamento ainda' + CTA para explorar serviços

7. Minhas Reservas — T_ATIVIDADE_RESERVAS
Fase	1.2+ — Em breve. Card visível mas inativo na Fase 1.0.
O que é	Reservas de hotel e mesa de restaurante feitas pelo app
Tipos de reserva	Hotel: datas check-in/out + tipo de quarto | Mesa: data + horário + número de pessoas
Filtros	Próximas · Passadas · Canceladas
Card de reserva	Banner 60px (foto do lugar) + badge de tipo (Hotel/Mesa) + nome + datas + botões de ação
Botões	Hotel: 'Cancelar' + 'Alterar datas' | Mesa: 'Cancelar' apenas
Ingressos	Ingressos de evento NÃO ficam aqui — confirmação de presença é gerenciada pelo T_ITEM.
Lista vazia	'Nenhuma reserva ainda' + CTA para explorar hotéis e restaurantes

8. Histórico de Atividades — T_ATIVIDADE_HISTORICO
Fase	1.0 — Ativo desde o lançamento
O que é	Registro cronológico das ações do usuário no app, organizado por 6 sub-seções
Layout	Tela única com sub-seções empilhadas em scroll vertical. Cada sub-seção tem header + lista compacta.
Modo normal	Cada item clicável — toque volta para a tela/contexto original
Modo edição	Botão 'Editar' no header ativa checkboxes em todos os itens de todas as sub-seções visíveis
Rodapé edição	'Selecionar tudo' + '🗑 Excluir (N)' em vermelho. Aparece somente no modo edição.
Cancelar edição	Botão 'Cancelar' no header — sai do modo sem apagar nada
Confirmação	Toast '✓ X itens removidos' após exclusão. Sem dialog de confirmação — ação imediata.

8.1 Sub-seções do Histórico
#	Sub-seção	Ícone	O que registra
1	Check-ins	📍	Todos os check-ins feitos pelo botão ✚ Criar → Check-in. Mostra: nome do lugar + categoria + data.
2	Buscas recentes	🔍	Todos os termos buscados no T07 Busca Completa. Toque: preenche o T07 com aquele termo.
3	Vistos recentemente	👁	Perfis de estabelecimentos e itens de catálogo visitados. Toque: volta para T_PERFIL ou T_ITEM.
4	Pedidos	🛒	Histórico de pedidos finalizados (Fase 1.2+). Vinculado com T_ATIVIDADE_PEDIDOS.
5	Agendamentos	📅	Histórico de agendamentos passados (Fase 1.2+). Vinculado com T_ATIVIDADE_AGENDAMENTOS.
6	Reservas	🏨	Histórico de reservas passadas (Fase 1.2+). Vinculado com T_ATIVIDADE_RESERVAS.

Sub-seções 4, 5 e 6 do histórico aparecem na Fase 1.2+ quando as funcionalidades correspondentes forem ativadas. Na Fase 1.0, o histórico exibe apenas Check-ins, Buscas e Vistos recentemente.

9. Fluxo de Navegação
De onde	Ação	Para onde	Observação
Qualquer tela	Toque em 📋 Atividade (barra)	T_ATIVIDADE — tela principal	
T_ATIVIDADE	Toque no card Favoritos	T_ATIVIDADE_FAVORITOS	Fase 1.0
T_ATIVIDADE	Toque no card Histórico	T_ATIVIDADE_HISTORICO	Fase 1.0
T_ATIVIDADE	Toque em Pedidos/Agendamentos/Reservas	Toast 'Em breve'	Fase 1.2+
T_ATIVIDADE_FAVORITOS	Toque em item	T_PERFIL ou T_ITEM	Conforme tipo do item
T_ATIVIDADE_FAVORITOS	Swipe esquerdo no item	Botão 'Remover' vermelho	Remoção imediata
T_ATIVIDADE_HISTORICO	Toque em item	Tela original do item	Check-in → T_PERFIL; Busca → T07
T_ATIVIDADE_HISTORICO	Botão Editar	Modo de seleção	Checkboxes aparecem
Modo edição	'🗑 Excluir (N)'	Remove itens + toast	Sem dialog
Modo edição	'Cancelar'	Sai do modo edição	Nada é apagado
Qualquer tela filha	← Voltar	T_ATIVIDADE principal	Estado preservado

10. Regras de Negócio
RN-01 — Sem badge no ícone 📋
O ícone Atividade na barra de navegação nunca exibe número. Nenhum contador de nenhum tipo.
RN-02 — Cards Em breve são visíveis mas inativos
Pedidos, Agendamentos e Reservas aparecem na tela principal desde o lançamento, com borda tracejada e opacidade reduzida. Toque exibe toast 'Em breve'.
RN-03 — Ingressos de evento ficam no T_ITEM
Confirmação de presença em eventos gratuitos é gerenciada no T_ITEM. Não existe seção de ingressos no T_ATIVIDADE.
RN-04 — Exclusão do histórico sem dialog
Ao confirmar a exclusão no modo edição, os itens são removidos imediatamente com animação de colapso e toast de confirmação. Sem dialog intermediário.
RN-05 — Sub-seções do histórico aparecem por fase
Na Fase 1.0 o histórico exibe apenas Check-ins, Buscas e Vistos. As sub-seções de Pedidos, Agendamentos e Reservas aparecem quando as funcionalidades 1.2+ forem ativadas.
RN-06 — Favoritos é a lista ativa — não histórico
'Meus Favoritos' mostra o que o usuário tem salvo agora. Remover desfaz o salvamento. Não é um log de quando salvou.

Dev: T_ATIVIDADE_HISTORICO — dados em cache local (AsyncStorage). Cada sub-seção tem chave própria: 'meuagito_hist_checkins', 'meuagito_hist_buscas', 'meuagito_hist_vistos'. Exclusão atualiza o cache localmente sem chamar o servidor.

11. Mockup HTML — Referência Visual
O código abaixo é o mockup completo do T_ATIVIDADE. Inclui tela principal com 5 cards, tela de Favoritos com filtros e lista, telas Em breve de Pedidos/Agendamentos/Reservas com previews do que virá, e Histórico nos dois modos (normal e edição/seleção).

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T_ATIVIDADE</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a; font-family: Arial, sans-serif;
    padding: 40px 20px; color: white;
    display: flex; flex-direction: column; align-items: center;
  }
  .page-title { color: #E8640A; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; text-align: center; }
  .page-sub   { color: #444; font-size: 11px; margin-bottom: 40px; text-align: center; }

  .section-div {
    display: flex; align-items: center; gap: 16px;
    margin: 48px 0 28px; width: 100%; max-width: 1200px;
  }
  .section-div .line  { flex: 1; height: 1px; background: #1e1e1e; }

  .section-div .label { color: #E8640A; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; white-space: nowrap; }

  .phones-row { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; }
  .phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .phone-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  .phone {
    width: 270px; height: 600px;
    background: #0D0D0D; border-radius: 40px;
    border: 6px solid #1e1e1e; overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex; flex-direction: column;
  }
  .notch { height: 22px; background: #1e1e1e; border-radius: 0 0 14px 14px; width: 86px; margin: 0 auto; flex-shrink: 0; }

  /* ── Header genérico ── */

  .t-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 14px 10px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .t-back {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: white; flex-shrink: 0;
  }
  .t-title  { font-size: 16px; font-weight: 900; color: white; flex: 1; text-align: center; }
  .t-action { font-size: 12px; color: #E8640A; cursor: pointer; }

  /* ── Scroll ── */
  .t-scroll { flex: 1; overflow-y: auto; }
  .t-scroll::-webkit-scrollbar { display: none; }

  /* ── Chips de filtro ── */
  .filter-row {
    display: flex; gap: 6px; overflow-x: auto;
    padding: 8px 12px; flex-shrink: 0;

    border-bottom: 1px solid #111;
  }
  .filter-row::-webkit-scrollbar { display: none; }
  .fchip {
    padding: 5px 12px; border-radius: 16px; font-size: 10px;
    border: 1px solid #2a2a2a; color: #666; background: #1a1a1a;
    white-space: nowrap; flex-shrink: 0;
  }
  .fchip.active { background: #E8640A; border-color: #E8640A; color: white; font-weight: 700; }

  /* ── Barra de navegação v3 ── */
  .bottom-nav {
    border-top: 1px solid #1A1A1A;
    display: flex; align-items: center; justify-content: space-around;
    padding: 10px 0 14px; background: #0D0D0D; flex-shrink: 0;
  }
  .nav-tab   { text-align: center; cursor: pointer; }
  .nav-icon  { font-size: 20px; color: #555; }
  .nav-lbl   { font-size: 9px; color: #555; margin-top: 2px; }
  .nav-icon.active  { color: white; }
  .nav-lbl.active   { color: white; }

  .nav-center {
    width: 48px; height: 48px; border-radius: 50%;
    background: #E8640A; display: flex; align-items: center;
    justify-content: center; font-size: 19px; margin-top: -9px;
    box-shadow: 0 0 16px rgba(232,100,10,0.6);
  }

  /* ════════════════════════════════
     TELA PRINCIPAL — 5 cards
  ════════════════════════════════ */
  .main-scroll { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
  .main-scroll::-webkit-scrollbar { display: none; }

  .section-card {
    border-radius: 16px; border: 1px solid #2a2a2a;
    overflow: hidden; cursor: pointer; background: #1a1a1a;
  }
  .section-card.coming { border-style: dashed; opacity: 0.6; cursor: default; }

  .sc-body {
    display: flex; align-items: center; gap: 12px;
    padding: 14px;

  }
  .sc-icon {
    width: 44px; height: 44px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .sc-info { flex: 1; }
  .sc-title { font-size: 14px; font-weight: 700; color: white; margin-bottom: 3px; }
  .sc-sub   { font-size: 11px; color: #555; }
  .sc-chevron { font-size: 16px; color: #444; flex-shrink: 0; }
  .sc-badge {
    background: rgba(232,100,10,0.15); border: 1px solid rgba(232,100,10,0.3);
    color: #E8640A; font-size: 9px; font-weight: 700;
    padding: 2px 8px; border-radius: 20px; margin-left: 6px;
  }
  .sc-coming {
    font-size: 9px; font-weight: 700; color: #444;
    background: #111; border: 1px solid #2a2a2a;
    padding: 2px 8px; border-radius: 20px; margin-left: 6px;
  }

  /* Preview de thumbs no card de favoritos */

  .sc-thumbs { display: flex; gap: 3px; padding: 0 14px 12px; }
  .sc-thumb {
    width: 52px; height: 44px; border-radius: 8px;
    background: #111; border: 1px solid #222;
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .sc-thumb-more {
    width: 52px; height: 44px; border-radius: 8px;
    background: #111; border: 1px solid #222;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: #555;
  }

  /* ════════════════════════════════
     MEUS FAVORITOS
  ════════════════════════════════ */
  .fav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-bottom: 1px solid #111; cursor: pointer;
  }
  .fav-thumb {
    width: 54px; height: 54px; border-radius: 12px;
    background: #111; border: 1px solid #222;

    display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;
  }
  .fav-thumb.round { border-radius: 50%; }
  .fav-info { flex: 1; min-width: 0; }
  .fav-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 2px; }
  .fav-meta { font-size: 11px; color: #555; }
  .fav-heart { font-size: 18px; color: #E8640A; flex-shrink: 0; }

  /* ════════════════════════════════
     MEUS PEDIDOS — Em breve
  ════════════════════════════════ */
  .pedido-card {
    margin: 8px 12px; background: #111; border-radius: 12px;
    border: 1px solid #1e1e1e; padding: 12px; cursor: pointer;
  }
  .pedido-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .pedido-avatar { width: 36px; height: 36px; border-radius: 10px; background: #1a1a1a; border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }

  .pedido-name   { font-size: 13px; font-weight: 700; color: white; flex: 1; }
  .pedido-status { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
  .status-entregue  { background: rgba(39,174,96,0.2); color: #27ae60; }
  .status-andamento { background: rgba(232,100,10,0.2); color: #E8640A; }
  .status-cancelado { background: rgba(231,76,60,0.2); color: #e74c3c; }
  .pedido-itens { display: flex; gap: 5px; margin-bottom: 8px; }
  .pedido-item-thumb { width: 42px; height: 42px; border-radius: 8px; background: #1a1a1a; border: 1px solid #222; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .pedido-footer { display: flex; align-items: center; justify-content: space-between; }
  .pedido-data  { font-size: 10px; color: #444; }
  .pedido-total { font-size: 13px; font-weight: 700; color: #E8640A; }


  /* ════════════════════════════════
     MEUS AGENDAMENTOS — Em breve
  ════════════════════════════════ */
  .agenda-card {
    margin: 8px 12px; background: #111; border-radius: 12px;
    border: 1px solid #1e1e1e; padding: 12px; cursor: pointer;
  }
  .agenda-header { display: flex; gap: 10px; margin-bottom: 8px; }
  .agenda-date-box {
    width: 44px; background: #1a1a1a; border-radius: 10px;
    border: 1px solid #2a2a2a; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 5px 0; flex-shrink: 0;
  }
  .agenda-day   { font-size: 18px; font-weight: 900; color: #E8640A; line-height: 1; }
  .agenda-month { font-size: 9px; color: #666; text-transform: uppercase; }
  .agenda-info  { flex: 1; }
  .agenda-serv  { font-size: 12px; font-weight: 700; color: white; margin-bottom: 2px; }

  .agenda-local { font-size: 10px; color: #666; margin-bottom: 2px; }
  .agenda-hora  { font-size: 10px; color: #888; }
  .agenda-prof  { font-size: 10px; color: #555; }
  .agenda-footer { display: flex; gap: 6px; }
  .agenda-btn {
    flex: 1; height: 30px; border-radius: 8px; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-family: Arial, sans-serif; border: none;
  }
  .btn-cancelar { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }
  .btn-reagendar { background: rgba(232,100,10,0.15); color: #E8640A; border: 1px solid rgba(232,100,10,0.3); }

  /* ════════════════════════════════
     MINHAS RESERVAS — Em breve
  ════════════════════════════════ */
  .reserva-card {
    margin: 8px 12px; background: #111; border-radius: 12px;

    border: 1px solid #1e1e1e; overflow: hidden; cursor: pointer;
  }
  .reserva-banner {
    width: 100%; height: 60px; background: #1a1a1a;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    position: relative;
  }
  .reserva-tipo {
    position: absolute; top: 6px; left: 8px;
    font-size: 9px; font-weight: 700; padding: 2px 7px;
    border-radius: 4px;
  }
  .tipo-hotel { background: rgba(52,152,219,0.8); color: white; }
  .tipo-mesa  { background: rgba(39,174,96,0.8); color: white; }
  .reserva-body { padding: 10px 12px; }
  .reserva-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 4px; }
  .reserva-info { display: flex; gap: 10px; font-size: 10px; color: #666; margin-bottom: 8px; }
  .reserva-footer { display: flex; gap: 6px; }


  /* ════════════════════════════════
     HISTÓRICO — Sub-seções
  ════════════════════════════════ */
  .hist-section { margin-bottom: 4px; }
  .hist-section-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px 6px;
  }
  .hist-section-title { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: #555; letter-spacing: 1px; text-transform: uppercase; }
  .hist-section-icon  { font-size: 13px; }
  .hist-edit-btn { font-size: 10px; color: #E8640A; cursor: pointer; }

  .hist-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; border-bottom: 1px solid #0a0a0a; cursor: pointer;
  }
  .hist-thumb {
    width: 38px; height: 38px; border-radius: 10px;
    background: #1a1a1a; border: 1px solid #222;

    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }
  .hist-thumb.round { border-radius: 50%; }
  .hist-row-info  { flex: 1; min-width: 0; }
  .hist-row-name  { font-size: 12px; font-weight: 700; color: white; margin-bottom: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hist-row-meta  { font-size: 10px; color: #555; }
  .hist-row-time  { font-size: 10px; color: #333; flex-shrink: 0; }

  /* Modo seleção */
  .hist-row.selectable { padding-left: 8px; }
  .hist-checkbox {
    width: 18px; height: 18px; border-radius: 50%;
    border: 1.5px solid #333; display: flex;
    align-items: center; justify-content: center;
    font-size: 10px; flex-shrink: 0;
  }
  .hist-checkbox.checked { background: #E8640A; border-color: #E8640A; color: white; }


  /* Rodapé modo seleção */
  .select-footer {
    padding: 8px 12px 16px; background: #0D0D0D;
    border-top: 1px solid #1a1a1a; flex-shrink: 0;
    display: flex; gap: 8px;
  }
  .btn-select-all {
    flex: 1; height: 38px; border-radius: 10px;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    color: #888; font-size: 11px; font-weight: 700;
    font-family: Arial, sans-serif; cursor: pointer;
  }
  .btn-delete-sel {
    flex: 1; height: 38px; border-radius: 10px;
    background: rgba(231,76,60,0.15); border: 1px solid rgba(231,76,60,0.4);
    color: #e74c3c; font-size: 11px; font-weight: 700;
    font-family: Arial, sans-serif; cursor: pointer;
  }

  /* Coming soon overlay */
  .coming-overlay {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;

    gap: 10px; padding: 30px 20px; text-align: center;
  }
  .coming-emoji { font-size: 44px; opacity: 0.4; }
  .coming-title { font-size: 14px; font-weight: 700; color: #444; }
  .coming-sub   { font-size: 11px; color: #333; line-height: 1.6; }
</style>
</head>
<body>

  <div class="page-title">T_ATIVIDADE</div>
  <div class="page-sub">Tela principal com 5 cards · Cada um abre tela própria</div>

  <!-- ════════ TELA PRINCIPAL ════════ -->
  <div class="section-div"><div class="line"></div><div class="label">Tela Principal</div><div class="line"></div></div>
  <div class="phones-row">
    <div class="phone-wrap">
      <div class="phone-label">Tela Principal</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div style="width:32px;"></div>

          <div class="t-title">Atividade</div>
          <div style="width:32px;"></div>
        </div>

        <div class="main-scroll">

          <!-- 1. Favoritos -->
          <div class="section-card">
            <div class="sc-body">
              <div class="sc-icon" style="background:rgba(232,100,10,0.12);">❤️</div>
              <div class="sc-info">
                <div class="sc-title">Meus Favoritos <span class="sc-badge">12</span></div>
                <div class="sc-sub">Lugares, eventos e itens salvos</div>
              </div>
              <div class="sc-chevron">›</div>
            </div>
            <div class="sc-thumbs">
              <div class="sc-thumb">✂️</div>
              <div class="sc-thumb">🍕</div>
              <div class="sc-thumb">☕</div>
              <div class="sc-thumb">🏨</div>

              <div class="sc-thumb-more">+8</div>
            </div>
          </div>

          <!-- 2. Pedidos -->
          <div class="section-card coming">
            <div class="sc-body">
              <div class="sc-icon" style="background:rgba(52,152,219,0.1);">🛒</div>
              <div class="sc-info">
                <div class="sc-title">Meus Pedidos <span class="sc-coming">Em breve</span></div>
                <div class="sc-sub">Histórico de pedidos e entregas</div>
              </div>
              <div class="sc-chevron">›</div>
            </div>
          </div>

          <!-- 3. Agendamentos -->
          <div class="section-card coming">
            <div class="sc-body">
              <div class="sc-icon" style="background:rgba(155,89,182,0.1);">📅</div>
              <div class="sc-info">

                <div class="sc-title">Meus Agendamentos <span class="sc-coming">Em breve</span></div>
                <div class="sc-sub">Serviços e procedimentos marcados</div>
              </div>
              <div class="sc-chevron">›</div>
            </div>
          </div>

          <!-- 4. Reservas -->
          <div class="section-card coming">
            <div class="sc-body">
              <div class="sc-icon" style="background:rgba(39,174,96,0.1);">🏨</div>
              <div class="sc-info">
                <div class="sc-title">Minhas Reservas <span class="sc-coming">Em breve</span></div>
                <div class="sc-sub">Hotéis e mesas de restaurante</div>
              </div>
              <div class="sc-chevron">›</div>
            </div>
          </div>

          <!-- 5. Histórico -->

          <div class="section-card">
            <div class="sc-body">
              <div class="sc-icon" style="background:rgba(255,255,255,0.05);">🕐</div>
              <div class="sc-info">
                <div class="sc-title">Histórico de Atividades</div>
                <div class="sc-sub">Check-ins, buscas, vistos e mais</div>
              </div>
              <div class="sc-chevron">›</div>
            </div>
          </div>

        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon active">📋</div><div class="nav-lbl active">Atividade</div></div>

          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ════════ MEUS FAVORITOS ════════ -->
  <div class="section-div"><div class="line"></div><div class="label">Meus Favoritos — Fase 1.0</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- Lista com filtros -->
    <div class="phone-wrap">
      <div class="phone-label">Lista de favoritos</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div class="t-back">←</div>
          <div class="t-title">Meus Favoritos</div>
          <div class="t-action">Editar</div>
        </div>
        <div class="filter-row">
          <div class="fchip active">Todos (12)</div>
          <div class="fchip">Lugares (8)</div>

          <div class="fchip">Eventos (2)</div>
          <div class="fchip">Itens (2)</div>
        </div>
        <div class="t-scroll">
          <div class="fav-item">
            <div class="fav-thumb">✂️</div>
            <div class="fav-info">
              <div class="fav-name">Barbearia Vintage</div>
              <div class="fav-meta">✂️ Beleza · 320m</div>
            </div>
            <div class="fav-heart">♥</div>
          </div>
          <div class="fav-item">
            <div class="fav-thumb">🍕</div>
            <div class="fav-info">
              <div class="fav-name">Pizzaria Dom Pão</div>
              <div class="fav-meta">🍕 Gastronomia · 800m</div>
            </div>
            <div class="fav-heart">♥</div>
          </div>
          <div class="fav-item">
            <div class="fav-thumb">☕</div>

            <div class="fav-info">
              <div class="fav-name">Café Ponto Certo</div>
              <div class="fav-meta">☕ Gastronomia · 400m</div>
            </div>
            <div class="fav-heart">♥</div>
          </div>
          <div class="fav-item">
            <div class="fav-thumb">🏨</div>
            <div class="fav-info">
              <div class="fav-name">Hotel Paulista Garden</div>
              <div class="fav-meta">🏨 Hospedagem · 1.4km</div>
            </div>
            <div class="fav-heart">♥</div>
          </div>
          <div class="fav-item">
            <div class="fav-thumb">🎸</div>
            <div class="fav-info">
              <div class="fav-name">Rock in Rio — Dia 3</div>
              <div class="fav-meta">🎵 Evento · Hoje 18h</div>
            </div>

            <div class="fav-heart">♥</div>
          </div>
          <div class="fav-item">
            <div class="fav-thumb" style="background:#f5f5f5;">👟</div>
            <div class="fav-info">
              <div class="fav-name">Tênis Urban Street</div>
              <div class="fav-meta">🛍️ Produto · Loja Estilo</div>
            </div>
            <div class="fav-heart">♥</div>
          </div>
        </div>
        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon active">📋</div><div class="nav-lbl active">Atividade</div></div>

          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>

  </div>

  <!-- ════════ PEDIDOS / AGENDAMENTOS / RESERVAS ════════ -->
  <div class="section-div"><div class="line"></div><div class="label">Pedidos · Agendamentos · Reservas — Em breve</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- Pedidos -->
    <div class="phone-wrap">
      <div class="phone-label">Meus Pedidos</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div class="t-back">←</div>
          <div class="t-title">Meus Pedidos</div>
          <div style="width:40px;"></div>
        </div>
        <div class="coming-overlay">
          <div class="coming-emoji">🛒</div>

          <div class="coming-title">Em breve</div>
          <div class="coming-sub">Aqui você vai acompanhar e rever todos os seus pedidos — com itens, preços e status de entrega.</div>
        </div>
        <!-- Preview do que virá -->
        <div style="padding: 0 0 8px;">
          <div style="padding: 8px 12px; font-size: 9px; color: #333; letter-spacing: 1px; text-transform: uppercase; font-weight: 700;">PRÉVIA DO QUE VIRÁ</div>
          <div class="pedido-card" style="opacity:0.4;">
            <div class="pedido-header">
              <div class="pedido-avatar">🍕</div>
              <div class="pedido-name">Pizzaria Dom Pão</div>
              <div class="pedido-status status-entregue">Entregue</div>
            </div>
            <div class="pedido-itens">
              <div class="pedido-item-thumb">🍕</div>

              <div class="pedido-item-thumb">🥤</div>
              <div style="font-size:10px; color:#555; display:flex; align-items:center;">+1 item</div>
            </div>
            <div class="pedido-footer">
              <div class="pedido-data">12 mar · 20h34</div>
              <div class="pedido-total">R$ 53,00</div>
            </div>
          </div>
        </div>
        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon active">📋</div><div class="nav-lbl active">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>

        </div>
      </div>
    </div>

    <!-- Agendamentos -->
    <div class="phone-wrap">
      <div class="phone-label">Meus Agendamentos</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div class="t-back">←</div>
          <div class="t-title">Agendamentos</div>
          <div style="width:40px;"></div>
        </div>
        <div class="coming-overlay" style="flex:0; padding: 20px;">
          <div class="coming-emoji">📅</div>
          <div class="coming-title">Em breve</div>
          <div class="coming-sub">Gerencie e cancele seus agendamentos.</div>
        </div>
        <div style="padding: 0 0 8px;">
          <div style="padding: 8px 12px; font-size: 9px; color: #333; letter-spacing: 1px; text-transform: uppercase; font-weight: 700;">PRÉVIA DO QUE VIRÁ</div>

          <div class="agenda-card" style="opacity:0.4;">
            <div class="agenda-header">
              <div class="agenda-date-box">
                <div class="agenda-day">28</div>
                <div class="agenda-month">Mar</div>
              </div>
              <div class="agenda-info">
                <div class="agenda-serv">Combo Completo</div>
                <div class="agenda-local">Barbearia Vintage</div>
                <div class="agenda-hora">⏰ 14h30 · ~70 min</div>
                <div class="agenda-prof">👤 Barbeiro: João</div>
              </div>
            </div>
            <div class="agenda-footer">
              <button class="agenda-btn btn-cancelar">✕ Cancelar</button>
              <button class="agenda-btn btn-reagendar">↺ Reagendar</button>
            </div>

          </div>
        </div>
        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon active">📋</div><div class="nav-lbl active">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>

    <!-- Reservas -->
    <div class="phone-wrap">
      <div class="phone-label">Minhas Reservas</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div class="t-back">←</div>

          <div class="t-title">Reservas</div>
          <div style="width:40px;"></div>
        </div>
        <div class="coming-overlay" style="flex:0; padding: 20px;">
          <div class="coming-emoji">🏨</div>
          <div class="coming-title">Em breve</div>
          <div class="coming-sub">Hotéis e mesas com cancelamento fácil.</div>
        </div>
        <div style="padding: 0 0 8px;">
          <div style="padding: 8px 12px; font-size: 9px; color: #333; letter-spacing: 1px; text-transform: uppercase; font-weight: 700;">PRÉVIA DO QUE VIRÁ</div>
          <div class="reserva-card" style="opacity:0.4;">
            <div class="reserva-banner">
              🌇
              <div class="reserva-tipo tipo-hotel">Hotel</div>
            </div>
            <div class="reserva-body">
              <div class="reserva-name">Hotel Paulista Garden</div>

              <div class="reserva-info">
                <span>📅 28–30 mar</span>
                <span>🛏 Suíte Vista</span>
              </div>
              <div class="reserva-footer">
                <button class="agenda-btn btn-cancelar" style="flex:1;">✕ Cancelar</button>
                <button class="agenda-btn btn-reagendar" style="flex:1;">↺ Alterar datas</button>
              </div>
            </div>
          </div>
          <div class="reserva-card" style="opacity:0.4; margin-top:8px;">
            <div class="reserva-banner" style="background:linear-gradient(135deg,#0a1a0a,#1a3a1a);">
              🍽️
              <div class="reserva-tipo tipo-mesa">Mesa</div>
            </div>
            <div class="reserva-body">
              <div class="reserva-name">Restaurante Bom Sabor</div>

              <div class="reserva-info">
                <span>📅 29 mar · 20h</span>
                <span>👥 2 pessoas</span>
              </div>
              <div class="reserva-footer">
                <button class="agenda-btn btn-cancelar" style="flex:1;">✕ Cancelar</button>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon active">📋</div><div class="nav-lbl active">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>

        </div>
      </div>
    </div>

  </div>

  <!-- ════════ HISTÓRICO ════════ -->
  <div class="section-div"><div class="line"></div><div class="label">Histórico de Atividades — Fase 1.0</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- Histórico: modo normal -->
    <div class="phone-wrap">
      <div class="phone-label">Modo normal</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div class="t-back">←</div>
          <div class="t-title">Histórico</div>
          <div class="t-action">Editar</div>
        </div>

        <div class="t-scroll">

          <!-- Check-ins -->
          <div class="hist-section">
            <div class="hist-section-head">
              <div class="hist-section-title"><span class="hist-section-icon">📍</span> Check-ins</div>

              <div class="hist-edit-btn">Ver todos</div>
            </div>
            <div class="hist-row">
              <div class="hist-thumb">✂️</div>
              <div class="hist-row-info">
                <div class="hist-row-name">Barbearia Vintage</div>
                <div class="hist-row-meta">✂️ Beleza · Vila Madalena</div>
              </div>
              <div class="hist-row-time">hoje</div>
            </div>
            <div class="hist-row">
              <div class="hist-thumb">🍕</div>
              <div class="hist-row-info">
                <div class="hist-row-name">Pizzaria Dom Pão</div>
                <div class="hist-row-meta">🍕 Gastronomia</div>
              </div>
              <div class="hist-row-time">ontem</div>
            </div>
          </div>

          <!-- Buscas -->

          <div class="hist-section">
            <div class="hist-section-head">
              <div class="hist-section-title"><span class="hist-section-icon">🔍</span> Buscas recentes</div>
              <div class="hist-edit-btn">Limpar</div>
            </div>
            <div class="hist-row">
              <div class="hist-thumb" style="border-radius:50%; background:#111;">🔍</div>
              <div class="hist-row-info">
                <div class="hist-row-name">barbearia vila madalena</div>
                <div class="hist-row-meta">Busca no T07</div>
              </div>
              <div class="hist-row-time">2h</div>
            </div>
            <div class="hist-row">
              <div class="hist-thumb" style="border-radius:50%; background:#111;">🔍</div>
              <div class="hist-row-info">

                <div class="hist-row-name">restaurante aberto agora</div>
                <div class="hist-row-meta">Busca no T07</div>
              </div>
              <div class="hist-row-time">ontem</div>
            </div>
          </div>

          <!-- Vistos recentemente -->
          <div class="hist-section">
            <div class="hist-section-head">
              <div class="hist-section-title"><span class="hist-section-icon">👁</span> Vistos recentemente</div>
              <div class="hist-edit-btn">Ver todos</div>
            </div>
            <div class="hist-row">
              <div class="hist-thumb">🏨</div>
              <div class="hist-row-info">
                <div class="hist-row-name">Hotel Paulista Garden</div>
                <div class="hist-row-meta">🏨 Hospedagem · Perfil</div>

              </div>
              <div class="hist-row-time">3h</div>
            </div>
            <div class="hist-row">
              <div class="hist-thumb" style="background:#f5f5f5;">👟</div>
              <div class="hist-row-info">
                <div class="hist-row-name">Tênis Urban Street</div>
                <div class="hist-row-meta">🛍️ Item · Loja Estilo</div>
              </div>
              <div class="hist-row-time">5h</div>
            </div>
          </div>

        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>

          <div class="nav-tab"><div class="nav-icon active">📋</div><div class="nav-lbl active">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>

    <!-- Histórico: modo edição/seleção -->
    <div class="phone-wrap">
      <div class="phone-label">Modo edição (seleção)</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="t-header">
          <div class="t-back" style="font-size:11px; color:#E8640A; background:transparent; border:none;">Cancelar</div>
          <div class="t-title">Selecionar</div>
          <div class="t-action">Selec. tudo</div>
        </div>

        <div class="t-scroll">

          <div class="hist-section">
            <div class="hist-section-head">

              <div class="hist-section-title"><span class="hist-section-icon">📍</span> Check-ins</div>
              <div style="font-size:10px; color:#555;">2 selecionados</div>
            </div>
            <div class="hist-row selectable">
              <div class="hist-checkbox checked">✓</div>
              <div class="hist-thumb" style="margin-left:4px;">✂️</div>
              <div class="hist-row-info">
                <div class="hist-row-name">Barbearia Vintage</div>
                <div class="hist-row-meta">hoje</div>
              </div>
            </div>
            <div class="hist-row selectable">
              <div class="hist-checkbox checked">✓</div>
              <div class="hist-thumb" style="margin-left:4px;">🍕</div>
              <div class="hist-row-info">
                <div class="hist-row-name">Pizzaria Dom Pão</div>

                <div class="hist-row-meta">ontem</div>
              </div>
            </div>
          </div>

          <div class="hist-section">
            <div class="hist-section-head">
              <div class="hist-section-title"><span class="hist-section-icon">🔍</span> Buscas recentes</div>
            </div>
            <div class="hist-row selectable">
              <div class="hist-checkbox"></div>
              <div class="hist-thumb" style="border-radius:50%; background:#111; margin-left:4px;">🔍</div>
              <div class="hist-row-info">
                <div class="hist-row-name">barbearia vila madalena</div>
                <div class="hist-row-meta">2h</div>
              </div>
            </div>
            <div class="hist-row selectable">
              <div class="hist-checkbox"></div>

              <div class="hist-thumb" style="border-radius:50%; background:#111; margin-left:4px;">🔍</div>
              <div class="hist-row-info">
                <div class="hist-row-name">restaurante aberto agora</div>
                <div class="hist-row-meta">ontem</div>
              </div>
            </div>
          </div>

        </div>

        <div class="select-footer">
          <button class="btn-select-all">Selecionar tudo</button>
          <button class="btn-delete-sel">🗑 Excluir (2)</button>
        </div>
      </div>
    </div>

  </div>

</body>
</html>

