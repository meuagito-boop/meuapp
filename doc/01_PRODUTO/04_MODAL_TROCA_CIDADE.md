MEU AGITO
M01 — Modal Troca de Cidade
Arquitetura de modal — Especificação completa v3
Permite ao usuário controlar qual cidade o feed está exibindo
1. Identificação
Código	M01
Nome	Modal — Troca de Cidade
Tipo	Bottom Sheet Modal — sobe por cima da tela atual sem substituí-la
Fase	Fase 1.0 — Presente desde o lançamento
Como é acessado	Config → Localidade (v3). A cidade NÃO aparece mais no header do app.
Tela de origem	T_CONFIG — Configurações gerais. Futuramente: acessível também em T07 Busca.
Tela de fundo	A tela de origem permanece visível e escurecida atrás do modal (overlay 60% opacidade)
Como é fechado	(1) Botão 'Cancelar' | (2) Swipe para baixo | (3) Toque no overlay | (4) Cidade confirmada
Impacto ao confirmar	Salva nova cidade no cache local → recarrega Home com dados da nova cidade
Prioridade	Alta — impacta diretamente o conteúdo exibido no Home inteiro

2. Conceito e Objetivo
O modal de troca de cidade permite ao usuário controlar qual cidade o feed está exibindo — sem alterar a permissão de GPS do dispositivo. É um controle manual que garante flexibilidade: o usuário pode estar fisicamente em São Paulo mas querer ver o que está rolando no Rio de Janeiro antes de viajar.

Por que este modal existe
Planejamento de viagem	Usuário quer explorar outra cidade antes de chegar
GPS negado	Usuário negou permissão de GPS — precisa de forma manual de definir a cidade
Alternância de cidades	Usuário está em cidade diferente da sua base e quer alternar entre as duas
GPS impreciso	GPS detectou cidade errada (comum em fronteiras) — usuário corrige manualmente

3. Estrutura Visual do Modal
O modal é um Bottom Sheet — sobe de baixo da tela como uma gaveta. Ocupa aproximadamente 65% da altura da tela.

Fundo do modal	#161616 — levemente mais claro que o fundo do app
Border-radius	24px nos cantos superiores. Cantos inferiores sem arredondamento.
Handle (alça)	Barra cinza #333333 centralizada no topo. 40x4px. Indica que pode ser arrastado.
Overlay de fundo	Preto rgba(0,0,0,0.6) cobrindo a tela atrás do modal. Toque fecha sem salvar.
Animação de entrada	Slide up — sobe de baixo para cima em 300ms com easing ease-out. Overlay fade in simultâneo.
Animação de saída	Slide down — desce em 250ms com easing ease-in. Overlay fade out simultâneo.
Gesto de fechar	Swipe para baixo com velocidade ≥500px/s ou arraste ≥40% da altura do modal.
Altura dinâmica	Expande quando teclado está aberto para não cobrir o campo de busca. Máximo 80% da tela.
Teclado	Ao abrir o campo de busca: modal sobe junto com o teclado. KeyboardAvoidingView obrigatório.

4. Estados do Modal — 3 Estados Distintos
Estado 1 — Inicial (ao abrir)
Exibe a cidade atual em destaque, opção de GPS e acesso ao campo de busca manual.

Elemento	Especificação	Ação
Handle (alça)	Barra cinza 40x4px centralizada no topo. Border-radius 2px.	Swipe down fecha
Título	'Sua localização' — bold 20px branco. Padding esquerdo 20px.	Sem ação
Botão Cancelar	Arial Regular 15px #888. Canto superior direito. Área de toque 44x44px.	Fecha sem salvar
Card — Cidade atual	Fundo #1E1E1E. Borda 1.5px laranja. Ícone pin laranja. Nome bold 16px. Subtítulo 'Cidade atual'. Check ✓ laranja.	Toque: confirma cidade atual e fecha
Botão GPS	Fundo #1A1A1A. Ícone alvo laranja. Texto + subtítulo. Chevron cinza à direita.	Solicita GPS → detecta cidade → Estado 3
Divisor	Linha #2A2A2A com texto 'ou busque uma cidade' centralizado.	Sem ação
Campo de busca	Fundo #1A1A1A. Ícone lupa. Placeholder 'Digite o nome da cidade...' Borda laranja ao tocar.	Toque: abre teclado → Estado 2

Estado 2 — Buscando (campo de texto ativo)
Usuário está digitando o nome de uma cidade. Resultados aparecem em tempo real abaixo do campo.

Elemento	Especificação	Ação
Campo de busca ativo	Borda laranja 1.5px. Cursor piscante. Ícone X aparece à direita quando há texto.	Ícone X: limpa campo e volta ao Estado 1
Skeleton de loading	3 linhas cinza animadas (shimmer) enquanto aguarda resultados. Debounce 300ms.	Sem ação — feedback visual
Lista de resultados	Até 5 resultados. Ícone pin cinza + nome bold + UF cinza. Altura 52px por item. Separador 1px.	Toque: vai para Estado 3
Cidades recentes	Até 3 buscas anteriores com ícone de relógio. Título 'Buscas recentes'. Aparece antes de digitar.	Toque: vai para Estado 3
Nenhum resultado	Ícone lupa + 'Nenhuma cidade encontrada' + 'Verifique o nome e tente novamente'.	Sem ação

Dev: Google Places Autocomplete API com types=(cities) e componentRestrictions={country:'br'}. Chamar via backend (SEC-02). Debounce 300ms. Mínimo 2 caracteres para disparar a busca.

Estado 3 — Confirmação de cidade selecionada
Usuário selecionou uma cidade (por busca ou GPS). Tela pede confirmação antes de aplicar a mudança.

Elemento	Especificação	Ação
Ícone de confirmação	Ícone pin laranja 48px centralizado. Animação scale 0→1 em 300ms com spring.	Sem ação
Nome da cidade	Nome completo + UF. Arial Bold 22px branco. Centralizado. Ex: 'Rio de Janeiro, RJ'.	Sem ação
Subtítulo	'O Meu Agito vai mostrar o que está rolando nessa cidade.' — Arial Regular 14px #888.	Sem ação
Botão 'Ver [cidade]'	Fundo laranja. Texto 'Ver [nome da cidade]'. 100% largura. Altura 48px. Radius 14px.	Salva cidade → fecha → recarrega Home
Link '← Escolher outra'	Arial Regular 14px laranja. Centralizado. Abaixo do botão.	Volta para Estado 2 com campo ativo

5. Fluxo Completo de Navegação
Ação do usuário	Estado atual	Resultado	Observação
Abre Config → Localidade	—	Modal abre — Estado 1	Slide up 300ms
Toca 'Cancelar'	1, 2 ou 3	Modal fecha — cidade não muda	Slide down 250ms
Toca no overlay	1, 2 ou 3	Modal fecha — cidade não muda	Mesmo comportamento do Cancelar
Swipe para baixo	1, 2 ou 3	Modal fecha — cidade não muda	Limiar: 40% altura ou 500px/s
Toca no card da cidade atual	1	Modal fecha — cidade confirmada sem alterar	Sem recarregamento do Home
Toca em 'Usar minha localização'	1	Solicita GPS → detecta cidade → Estado 3	Se GPS negado: alerta (ver RN-04)
Toca no campo de busca	1	Teclado abre → Estado 2	Modal expande. Campo com borda laranja.
Digita 2+ chars (debounce 300ms)	2	Skeleton → lista de resultados	Chama Google Places via backend
Toca em resultado da lista	2	Estado 3 — confirmação	Cidade selecionada exibida
Toca em cidade recente	2	Estado 3 — confirmação	Histórico local
Toca 'Ver [cidade]'	3	Salva → fecha → recarrega Home	Cache local atualizado
Toca '← Escolher outra'	3	Estado 2 — campo de busca ativo	Cidade descartada

6. Todos os Elementos — Tabela Completa
Tipo	Elemento	Ação/Destino	Estado	Observações
VISUAL	Handle (alça cinza)	Swipe down → fecha	Todos	40x4px. Border-radius 2px.
BOTÃO	Cancelar	Fecha sem salvar	Todos	#888. 15px. Área 44px.
CARD	Cidade atual com borda laranja	Confirma e fecha	1	Borda #E8640A 1.5px.
BOTÃO	Usar minha localização (GPS)	Solicita permissão → Estado 3	1	Só se GPS não negado antes.
INPUT	Campo de busca	Teclado → Estado 2	1	Borda laranja ao ativar.
VISUAL	Ícone X (limpar)	Limpa campo → Estado 1	2	Aparece com texto. Some vazio.
VISUAL	Skeleton de loading	Sem ação — feedback	2	Shimmer animado. 3 linhas.
LISTA	Resultados de cidades	Toque → Estado 3	2	Até 5. Google Places API.
LISTA	Cidades recentes	Toque → Estado 3	2	Até 3. Ícone relógio.
VISUAL	Mensagem sem resultado	Sem ação	2	Ícone lupa + texto.
VISUAL	Ícone pin confirmação	Sem ação	3	48px. Animação spring.
VISUAL	Nome da cidade selecionada	Sem ação	3	Bold 22px. Centralizado.
BOTÃO	'Ver [cidade]'	Salva → fecha → recarrega Home	3	Laranja. 100% largura.
LINK	'← Escolher outra cidade'	Volta ao Estado 2	3	Laranja. 14px.

7. Regras de Negócio
RN-01 — Acesso exclusivo via Config → Localidade
O M01 é acessado somente via Configurações → Localidade. A cidade NÃO aparece no header do app. Esta é a correção aplicada na v3 — qualquer referência anterior ao 'São Paulo ▾' clicável no header está obsoleta.
RN-02 — Cidade não é exibida no header
O header padrão exibe apenas: Logo · 💬 Mensagens · 🔔 Notificações · ⋯ Painel. Sem cidade, sem pin, sem texto clicável.
RN-03 — Coordenadas GPS nunca chegam ao app
O app solicita permissão de GPS e repassa ao backend. O backend faz o reverse geocoding e retorna apenas o nome da cidade. O app nunca processa coordenadas brutas (SEC-01 LGPD).
RN-04 — GPS negado não bloqueia o modal
Se o usuário negou GPS antes, o botão 'Usar minha localização' exibe um alerta explicando como habilitar o GPS nas configurações do sistema. O campo manual permanece disponível.
RN-05 — Busca apenas cidades brasileiras
Google Places Autocomplete configurado com componentRestrictions={country:'br'} e types=(cities). Cidades de outros países não aparecem nos resultados.
RN-06 — Confirmar recarrega o Home inteiro
Ao confirmar uma nova cidade, o cache local é atualizado e o T06 Home recarrega todos os feeds com dados da nova cidade. O usuário é levado ao topo do Home.
RN-07 — Fechar sem confirmar não altera nada
Cancelar, swipe down ou toque no overlay fecham o modal sem alterar a cidade atual. Nenhuma chamada ao servidor é feita neste caso.
RN-08 — Histórico de buscas recentes
As últimas 3 cidades buscadas são exibidas quando o campo está ativo mas vazio. Armazenadas no AsyncStorage local. Cada item pode ser removido individualmente.

Dev: Chamar Google Places via backend — nunca expor a API key no app (SEC-02). Cache da cidade no AsyncStorage — chave: 'meuagito_cidade_atual'. Ao confirmar: dispatch Redux/Context + refetch dos feeds.

8. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual deste modal. Inclui os 3 estados (inicial, buscando com skeleton e resultados, confirmação), painel de acesso v3 e regras de comportamento.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — M01 Modal Troca de Cidade</title>
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
  .page-title {
    color: #E8640A;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
    text-align: center;
  }
  .page-sub {
    color: #444;
    font-size: 11px;
    margin-bottom: 40px;
    text-align: center;
  }
  .phones-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;

    margin-bottom: 40px;
  }
  .phone-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .phone-label {
    color: #555;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* Phone frame */
  .phone {
    width: 290px;
    height: 580px;
    background: #0D0D0D;
    border-radius: 42px;
    border: 6px solid #1e1e1e;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
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

  /* Background screen (T06 behind modal) */
  .bg-screen {
    position: absolute;

    inset: 0;
    background: #0D0D0D;
    display: flex;
    flex-direction: column;
  }
  .bg-header {
    height: 56px;
    background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    margin-top: 24px;
  }
  .bg-logo {
    width: 34px; height: 34px;
    background: #E8640A;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .bg-icons { display: flex; gap: 10px; }
  .bg-icon  { font-size: 18px; }
  .bg-content {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    filter: blur(2px);
    opacity: 0.4;
  }
  .bg-card {
    height: 80px;
    background: #1a1a1a;
    border-radius: 12px;

    border: 1px solid #2a2a2a;
  }

  /* Overlay */
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 5;
  }

  /* Modal bottom sheet */
  .modal {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: #161616;
    border-radius: 24px 24px 0 0;
    z-index: 10;
    padding: 12px 18px 28px;
  }

  /* Handle */
  .handle {
    width: 40px; height: 4px;
    background: #333;
    border-radius: 2px;
    margin: 0 auto 16px;
  }

  /* Modal header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .modal-title { font-size: 16px; font-weight: 900; color: white; }
  .btn-cancel  { font-size: 13px; color: #888; cursor: pointer; }

  /* Cidade atual card */

  .current-city {
    background: #1E1E1E;
    border: 1.5px solid #E8640A;
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .city-pin { font-size: 20px; }
  .city-info { flex: 1; }
  .city-name { font-size: 14px; font-weight: 700; color: white; }
  .city-sub  { font-size: 10px; color: #888; margin-top: 2px; }
  .city-check { color: #E8640A; font-size: 16px; font-weight: 700; }

  /* GPS button */
  .gps-btn {
    background: #1A1A1A;
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    cursor: pointer;
    border: 1px solid #2a2a2a;
  }
  .gps-icon { font-size: 20px; color: #E8640A; }
  .gps-info { flex: 1; }

  .gps-label { font-size: 13px; color: white; }
  .gps-sub   { font-size: 10px; color: #666; margin-top: 2px; }
  .gps-arrow { color: #555; font-size: 14px; }

  /* Divider */
  .divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .div-line { flex: 1; height: 1px; background: #2A2A2A; }
  .div-text { font-size: 10px; color: #555; white-space: nowrap; }

  /* Search input */
  .search-input {
    width: 100%;
    height: 44px;
    background: #1A1A1A;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: text;
  }
  .search-input.active { border-color: #E8640A; }
  .search-icon { font-size: 14px; color: #666; }
  .search-ph   { font-size: 12px; color: #444; flex: 1; }

  .search-txt  { font-size: 12px; color: white; flex: 1; }
  .search-x    { font-size: 12px; color: #555; }

  /* Results list */
  .result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 0;
    border-bottom: 1px solid #1E1E1E;
    cursor: pointer;
  }
  .result-item:last-child { border-bottom: none; }
  .result-pin  { font-size: 14px; color: #666; }
  .result-name { font-size: 13px; color: white; }
  .result-uf   { font-size: 11px; color: #666; margin-left: 4px; }

  /* Skeleton */
  .skeleton {
    height: 40px;
    background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
    border-radius: 8px;
    margin-bottom: 6px;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }

    100% { background-position: -200% 0; }
  }

  /* Confirmation state */
  .confirm-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8px 0;
  }
  .confirm-icon { font-size: 44px; margin-bottom: 12px; }
  .confirm-city { font-size: 20px; font-weight: 900; color: white; margin-bottom: 6px; }
  .confirm-sub  { font-size: 12px; color: #888; line-height: 1.5; margin-bottom: 18px; }
  .btn-confirm {
    width: 100%;
    height: 48px;
    background: #E8640A;
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: Arial, sans-serif;
    cursor: pointer;
    margin-bottom: 10px;
  }
  .btn-back-city {
    font-size: 12px;
    color: #E8640A;
    text-decoration: underline;

    cursor: pointer;
    text-align: center;
  }

  /* Info section */
  .info-section {
    width: 100%;
    max-width: 920px;
    background: #111;
    border-radius: 16px;
    padding: 24px;
    margin-top: 10px;
  }
  .info-title {
    color: #E8640A;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 16px;
    text-align: center;
  }
  .flow-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .flow-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #2a2a2a;
  }
  .fc-title { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px; }
  .fc-row {
    display: flex;
    gap: 6px;
    align-items: flex-start;

    padding: 4px 0;
    border-bottom: 1px solid #1e1e1e;
    font-size: 10px;
  }
  .fc-row:last-child { border-bottom: none; }
  .fc-from { color: #555; flex: 1; }
  .fc-to   { color: #E8640A; font-weight: 700; }
</style>
</head>
<body>

  <div class="page-title">M01 — Modal Troca de Cidade</div>
  <div class="page-sub">Acessado via Config → Localidade · 3 estados · Bottom sheet</div>

  <div class="phones-row">

    <!-- Estado 1: Inicial -->
    <div class="phone-wrap">
      <div class="phone-label">Estado 1 — Inicial</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="bg-screen">
          <div class="bg-header">
            <div class="bg-logo">📍</div>
            <div class="bg-icons">
              <span class="bg-icon">💬</span>
              <span class="bg-icon">🔔</span>

              <span class="bg-icon">⋯</span>
            </div>
          </div>
          <div class="bg-content">
            <div class="bg-card"></div>
            <div class="bg-card" style="height:60px;"></div>
            <div class="bg-card"></div>
          </div>
        </div>
        <div class="overlay"></div>
        <div class="modal">
          <div class="handle"></div>
          <div class="modal-header">
            <div class="modal-title">Sua localização</div>
            <div class="btn-cancel">Cancelar</div>
          </div>

          <div class="current-city">
            <div class="city-pin">📍</div>
            <div class="city-info">
              <div class="city-name">São Paulo, SP</div>
              <div class="city-sub">Cidade atual</div>
            </div>

            <div class="city-check">✓</div>
          </div>

          <div class="gps-btn">
            <div class="gps-icon">🎯</div>
            <div class="gps-info">
              <div class="gps-label">Usar minha localização atual</div>
              <div class="gps-sub">Detectar cidade pelo GPS</div>
            </div>
            <div class="gps-arrow">›</div>
          </div>

          <div class="divider">
            <div class="div-line"></div>
            <div class="div-text">ou busque uma cidade</div>
            <div class="div-line"></div>
          </div>

          <div class="search-input">
            <div class="search-icon">🔍</div>
            <div class="search-ph">Digite o nome da cidade...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado 2: Buscando -->

    <div class="phone-wrap">
      <div class="phone-label">Estado 2 — Buscando</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="bg-screen">
          <div class="bg-header">
            <div class="bg-logo">📍</div>
            <div class="bg-icons">
              <span class="bg-icon">💬</span>
              <span class="bg-icon">🔔</span>
              <span class="bg-icon">⋯</span>
            </div>
          </div>
          <div class="bg-content">
            <div class="bg-card"></div>
            <div class="bg-card" style="height:60px;"></div>
            <div class="bg-card"></div>
          </div>
        </div>
        <div class="overlay"></div>
        <div class="modal" style="height:72%;">
          <div class="handle"></div>
          <div class="modal-header">

            <div class="modal-title">Sua localização</div>
            <div class="btn-cancel">Cancelar</div>
          </div>

          <div class="search-input active" style="margin-bottom:14px;">
            <div class="search-icon">🔍</div>
            <div class="search-txt">Rio de Jan</div>
            <div class="search-x">✕</div>
          </div>

          <!-- Skeleton loading -->
          <div class="skeleton"></div>
          <div class="skeleton" style="opacity:0.7;"></div>
          <div class="skeleton" style="opacity:0.4;"></div>

          <!-- Resultados (aparecem após debounce) -->
          <div style="margin-top:6px;">
            <div class="result-item">
              <div class="result-pin">📍</div>
              <div><span class="result-name">Rio de Janeiro</span><span class="result-uf">· RJ</span></div>

            </div>
            <div class="result-item">
              <div class="result-pin">📍</div>
              <div><span class="result-name">Rio das Pedras</span><span class="result-uf">· SP</span></div>
            </div>
            <div class="result-item">
              <div class="result-pin">📍</div>
              <div><span class="result-name">Rio Claro</span><span class="result-uf">· SP</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado 3: Confirmação -->
    <div class="phone-wrap">
      <div class="phone-label">Estado 3 — Confirmação</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="bg-screen">
          <div class="bg-header">
            <div class="bg-logo">📍</div>
            <div class="bg-icons">

              <span class="bg-icon">💬</span>
              <span class="bg-icon">🔔</span>
              <span class="bg-icon">⋯</span>
            </div>
          </div>
          <div class="bg-content">
            <div class="bg-card"></div>
            <div class="bg-card" style="height:60px;"></div>
            <div class="bg-card"></div>
          </div>
        </div>
        <div class="overlay"></div>
        <div class="modal">
          <div class="handle"></div>
          <div class="modal-header">
            <div class="modal-title">Sua localização</div>
            <div class="btn-cancel">Cancelar</div>
          </div>

          <div class="confirm-content">
            <div class="confirm-icon">📍</div>
            <div class="confirm-city">Rio de Janeiro, RJ</div>
            <div class="confirm-sub">O Meu Agito vai mostrar o que está rolando nessa cidade.</div>

            <button class="btn-confirm">Ver Rio de Janeiro</button>
            <div class="btn-back-city">← Escolher outra cidade</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Info section -->
  <div class="info-section">
    <div class="info-title">Fluxo de Navegação e Acesso</div>

    <!-- Acesso correto -->
    <div style="background:#1a0f05; border:1px solid #E8640A44; border-radius:12px; padding:14px; margin-bottom:16px;">
      <div style="font-size:10px; color:#E8640A; font-weight:700; margin-bottom:6px; letter-spacing:1px;">ACESSO — v3 ATUALIZADO</div>
      <div style="font-size:12px; color:#ccc;">
        O M01 é acessado exclusivamente via <span style="color:#E8640A; font-weight:700;">Config → Localidade</span>.<br>
        <span style="color:#555; font-size:11px;">A cidade NÃO aparece no header. Não existe mais o texto "São Paulo ▾" clicável no header.</span>

      </div>
    </div>

    <div class="flow-grid">
      <div class="flow-card">
        <div class="fc-title">FLUXO — ESTADO 1 → 2 → 3</div>
        <div class="fc-row"><span class="fc-from">Toca no campo de busca</span><span class="fc-to">→ Estado 2</span></div>
        <div class="fc-row"><span class="fc-from">Digita 2+ chars (debounce 300ms)</span><span class="fc-to">→ Resultados</span></div>
        <div class="fc-row"><span class="fc-from">Toca em resultado</span><span class="fc-to">→ Estado 3</span></div>
        <div class="fc-row"><span class="fc-from">'Ver [cidade]'</span><span class="fc-to">→ Fecha + recarrega Home</span></div>
        <div class="fc-row"><span class="fc-from">'← Escolher outra'</span><span class="fc-to">→ Estado 2</span></div>
      </div>
      <div class="flow-card">

        <div class="fc-title">FORMAS DE FECHAR SEM SALVAR</div>
        <div class="fc-row"><span class="fc-from">Toca 'Cancelar'</span><span class="fc-to">→ Fecha sem alterar</span></div>
        <div class="fc-row"><span class="fc-from">Swipe para baixo</span><span class="fc-to">→ Fecha sem alterar</span></div>
        <div class="fc-row"><span class="fc-from">Toca no overlay</span><span class="fc-to">→ Fecha sem alterar</span></div>
        <div class="fc-row"><span class="fc-from">Toca cidade atual (Est.1)</span><span class="fc-to">→ Confirma atual</span></div>
        <div class="fc-row"><span class="fc-from">GPS → cidade detectada</span><span class="fc-to">→ Estado 3</span></div>
      </div>
    </div>

    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Bottom sheet — 65% da altura da tela</div>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Google Places Autocomplete — apenas cidades BR</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">GPS não chega ao app — backend faz reverse geocoding</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Debounce 300ms · Mín 2 chars para buscar</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Animação: slide up 300ms | slide down 250ms</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Swipe limiar: 40% da altura ou 500px/s</div>

      <div style="background:#1a1a1a; border:1px solid #E8640A44; border-radius:20px; padding:6px 12px; font-size:10px; color:#E8640A;">Confirmar recarrega todo o Home com dados da nova cidade</div>
    </div>
  </div>

</body>
</html>

