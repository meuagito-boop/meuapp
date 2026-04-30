MEU AGITO
PAINEL — Drawer de Acesso Rápido
Arquitetura de componente — Especificação v1
⚠ INATIVO NA FASE 1.0 — Estrutura reservada para versão futura
Drawer da direita · ⋯ no header · Conteúdo a ser definido
1. Identificação
Código	PAINEL
Nome	Painel — Drawer de Acesso Rápido
Tipo	Drawer lateral — desliza da direita para a esquerda sobre a tela atual
Acesso	Ícone ⋯ (3 pontos) no header padrão. Presente em todas as telas com header.
Status Fase 1.0	INATIVO — drawer abre mas exibe apenas placeholder. Estrutura técnica implementada.
Status futuro	Hub de atalhos rápidos. Conteúdo a ser definido em versão futura do produto.
Intenção declarada	Possível hub para: Atividade rápida · Configurações rápidas · Outros atalhos a definir
Não substitui	Não substitui T_ATIVIDADE nem T_CONFIG — são telas completas. O Painel será atalhos rápidos.

2. Comportamento Técnico
Animação de abertura	Drawer desliza da direita para a esquerda em 280ms. Easing: ease-out. Overlay faz fade-in simultâneo.
Animação de fechamento	Drawer desliza de volta para a direita em 240ms. Easing: ease-in. Overlay faz fade-out simultâneo.
Overlay	rgba(0,0,0,0.5) cobrindo a tela inteira atrás do drawer. Toque fecha o drawer.
Largura do drawer	72% da largura da tela. 28% do conteúdo original fica visível à esquerda (com overlay).
Altura	100% da tela — do topo ao rodapé, incluindo notch e safe area.
Fundo do drawer	#161616 — levemente mais claro que o fundo do app #0D0D0D.
Borda esquerda	1px solid #2A2A2A — separa o drawer do overlay.
Ícone ⋯ ativo	Quando drawer aberto: ícone ⋯ muda para fundo #E8640A15 e borda laranja #E8640A.

3. Formas de Fechar
Gesto/Ação	Comportamento	Observação
Botão ✕ no drawer	Fecha com animação padrão	Canto superior direito do drawer
Toque no overlay	Fecha com animação padrão	Área à esquerda do drawer
Swipe para a direita	Fecha se velocidade > 400px/s ou arraste > 40%	Gesto no corpo do drawer
Botão Voltar (Android)	Fecha o drawer — não navega para tela anterior	Prioridade sobre navegação

4. Estado Fase 1.0 — Placeholder
Header do drawer	'Painel' bold 16px branco + botão ✕. Border-bottom 1px #1A1A1A.
Corpo	Centralizado: ícone 🚧 + 'Em construção' + subtítulo explicativo.
Rodapé	Sem botões — nenhuma ação disponível na Fase 1.0.
Interatividade	Apenas fechar. Nenhum item clicável no corpo.

Decisão de produto: o Painel abre normalmente na Fase 1.0 para familiarizar o usuário com o gesto e o ícone ⋯. O placeholder evita confusão sobre o que está pendente.

5. Regras de Negócio
RN-01 — Drawer, não bottom sheet nem modal
O Painel usa drawer lateral exclusivamente — desliza da direita para a esquerda. Não é um bottom sheet nem um modal centrado.
RN-02 — Estrutura implementada desde o lançamento
A estrutura técnica do drawer está presente desde a Fase 1.0. Apenas o conteúdo está pendente de definição.
RN-03 — Não substitui telas completas
O Painel será um hub de atalhos rápidos — não substituirá T_ATIVIDADE nem T_CONFIG, que continuam sendo telas completas acessadas pela barra de navegação.
RN-04 — Android: Voltar fecha o drawer
No Android, o botão físico Voltar fecha o drawer sem navegar para a tela anterior.

6. Mockup HTML — Referência Visual
O código abaixo mostra o PAINEL em dois estados: ⋯ visível no header (drawer fechado) e drawer aberto com placeholder Fase 1.0. Inclui especificações de animação e comportamento.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — PAINEL</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a; font-family: Arial, sans-serif;
    padding: 40px 20px; color: white;
    display: flex; flex-direction: column; align-items: center;
  }
  .page-title { color: #E8640A; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; text-align: center; }
  .page-sub   { color: #444; font-size: 11px; margin-bottom: 16px; text-align: center; }

  .status-badge {
    background: rgba(232,100,10,0.1); border: 1px solid rgba(232,100,10,0.3);
    color: #E8640A; font-size: 11px; font-weight: 700;

    padding: 6px 18px; border-radius: 20px; margin-bottom: 40px;
  }

  .section-div {
    display: flex; align-items: center; gap: 16px;
    margin: 40px 0 24px; width: 100%; max-width: 900px;
  }
  .section-div .line  { flex: 1; height: 1px; background: #1e1e1e; }
  .section-div .label { color: #E8640A; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; white-space: nowrap; }

  .phones-row { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .phone-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  .phone {
    width: 280px; height: 580px;
    background: #0D0D0D; border-radius: 40px;
    border: 6px solid #1e1e1e; overflow: hidden;

    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex; flex-direction: column; position: relative;
  }
  .notch { height: 22px; background: #1e1e1e; border-radius: 0 0 14px 14px; width: 88px; margin: 0 auto; flex-shrink: 0; }

  /* Header padrão */
  .app-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 14px 10px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .logo-box {
    width: 34px; height: 34px; background: #E8640A;
    border-radius: 9px; display: flex; align-items: center;
    justify-content: center; font-size: 16px; font-weight: 900; color: white;
  }
  .header-icons { display: flex; gap: 8px; }
  .h-icon {
    width: 34px; height: 34px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;

    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: #aaa; position: relative;
  }
  .h-badge {
    position: absolute; top: -3px; right: -3px;
    width: 14px; height: 14px; border-radius: 50%;
    background: #E8640A; color: white; font-size: 8px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid #0D0D0D;
  }
  /* ícone ⋯ com destaque de "ativo" */
  .h-icon.painel-active {
    background: rgba(232,100,10,0.15);
    border-color: #E8640A;
    color: #E8640A;
  }

  /* Conteúdo de fundo (home blur) */
  .bg-content {
    flex: 1; display: flex; flex-direction: column;
    gap: 8px; padding: 12px; filter: blur(2px); opacity: 0.35;
  }
  .bg-card {
    height: 80px; background: #1a1a1a;
    border-radius: 12px; border: 1px solid #2a2a2a;

  }

  /* Overlay escuro */
  .overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 10;
  }

  /* Drawer da direita */
  .drawer {
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 72%;
    background: #161616;
    border-left: 1px solid #2a2a2a;
    z-index: 20;
    display: flex; flex-direction: column;
  }

  .drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 34px 14px 12px;
    border-bottom: 1px solid #1a1a1a;
  }
  .drawer-title { font-size: 16px; font-weight: 900; color: white; }
  .drawer-close {
    width: 28px; height: 28px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;

    font-size: 12px; color: #aaa; cursor: pointer;
  }

  /* Conteúdo do drawer — placeholder */
  .drawer-body {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 20px; text-align: center;
  }
  .drawer-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.3; }
  .drawer-coming-title { font-size: 14px; font-weight: 700; color: #444; margin-bottom: 8px; }
  .drawer-coming-sub   { font-size: 11px; color: #2a2a2a; line-height: 1.6; }

  /* Barra inferior */
  .bottom-nav {
    border-top: 1px solid #1A1A1A;
    display: flex; align-items: center; justify-content: space-around;
    padding: 10px 0 14px; background: #0D0D0D; flex-shrink: 0;
  }
  .nav-tab   { text-align: center; }
  .nav-icon  { font-size: 20px; color: #555; }
  .nav-lbl   { font-size: 9px; color: #555; margin-top: 2px; }

  .nav-center {
    width: 48px; height: 48px; border-radius: 50%;
    background: #E8640A; display: flex; align-items: center;
    justify-content: center; font-size: 19px; margin-top: -9px;
    box-shadow: 0 0 16px rgba(232,100,10,0.6);
  }

  /* Info box */
  .info-box {
    width: 100%; max-width: 680px;
    background: #111; border-radius: 16px; padding: 24px; margin-top: 40px;
  }
  .info-title { color: #E8640A; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; text-align: center; }
  .info-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid #1a1a1a;
    font-size: 11px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #E8640A; font-weight: 700; flex-shrink: 0; width: 140px; }

  .info-val   { color: #666; line-height: 1.5; }
</style>
</head>
<body>

  <div class="page-title">PAINEL</div>
  <div class="page-sub">Acessado pelo ⋯ no header · Drawer da direita para esquerda</div>
  <div class="status-badge">⚠ Inativo na Fase 1.0 — funcionalidade reservada para versão futura</div>

  <div class="section-div"><div class="line"></div><div class="label">Comportamento visual</div><div class="line"></div></div>

  <div class="phones-row">

    <!-- Estado: fechado (⋯ no header) -->
    <div class="phone-wrap">
      <div class="phone-label">⋯ Visível no header</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="app-header">
          <div class="logo-box">M</div>
          <div class="header-icons">
            <div class="h-icon">💬<div class="h-badge">3</div></div>

            <div class="h-icon">🔔<div class="h-badge">5</div></div>
            <div class="h-icon">⋯</div>
          </div>
        </div>
        <div class="bg-content">
          <div class="bg-card"></div>
          <div class="bg-card" style="height:120px;"></div>
          <div class="bg-card"></div>
          <div class="bg-card" style="height:60px;"></div>
        </div>
        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:17px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>

        </div>
      </div>
    </div>

    <!-- Estado: drawer aberto -->
    <div class="phone-wrap">
      <div class="phone-label">Drawer aberto (Fase 1.0)</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="app-header">
          <div class="logo-box">M</div>
          <div class="header-icons">
            <div class="h-icon">💬<div class="h-badge">3</div></div>
            <div class="h-icon">🔔<div class="h-badge">5</div></div>
            <div class="h-icon painel-active">⋯</div>
          </div>
        </div>
        <div class="bg-content">
          <div class="bg-card"></div>
          <div class="bg-card" style="height:120px;"></div>
          <div class="bg-card"></div>
        </div>
        <div class="bottom-nav" style="position:relative;z-index:5;">

          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:17px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>

        <!-- Overlay -->
        <div class="overlay"></div>

        <!-- Drawer -->
        <div class="drawer">
          <div class="drawer-header">
            <div class="drawer-title">Painel</div>
            <div class="drawer-close">✕</div>
          </div>
          <div class="drawer-body">
            <div class="drawer-icon">🚧</div>

            <div class="drawer-coming-title">Em construção</div>
            <div class="drawer-coming-sub">Esta área vai abrigar atalhos rápidos em uma versão futura.</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Info box -->
  <div class="info-box">
    <div class="info-title">Especificação Técnica</div>
    <div class="info-row">
      <div class="info-label">Acesso</div>
      <div class="info-val">Ícone ⋯ (3 pontos) no header padrão do app. Presente em todas as telas que exibem o header.</div>
    </div>
    <div class="info-row">
      <div class="info-label">Animação de abertura</div>
      <div class="info-val">Drawer desliza da direita para esquerda em 280ms com easing ease-out. Overlay faz fade-in simultâneo (rgba 0,0,0,0.5).</div>
    </div>
    <div class="info-row">

      <div class="info-label">Animação de fechamento</div>
      <div class="info-val">Drawer desliza de volta para a direita em 240ms. Overlay faz fade-out simultâneo.</div>
    </div>
    <div class="info-row">
      <div class="info-label">Formas de fechar</div>
      <div class="info-val">Botão ✕ no drawer · Toque no overlay · Swipe para a direita no drawer · Botão físico Voltar (Android).</div>
    </div>
    <div class="info-row">
      <div class="info-label">Largura do drawer</div>
      <div class="info-val">72% da largura da tela. Deixa 28% do conteúdo original visível à esquerda (com overlay escuro).</div>
    </div>
    <div class="info-row">
      <div class="info-label">Status Fase 1.0</div>
      <div class="info-val">Drawer abre normalmente mas exibe apenas placeholder "Em construção". A estrutura técnica está implementada e pronta para receber conteúdo.</div>

    </div>
    <div class="info-row">
      <div class="info-label">Intenção futura</div>
      <div class="info-val">Possível hub de atalhos para Atividade, Configurações e outros recursos de acesso rápido. A definição do conteúdo será feita em versão futura do produto.</div>
    </div>
  </div>

</body>
</html>

