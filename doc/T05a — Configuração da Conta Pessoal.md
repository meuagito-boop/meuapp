MEU AGITO
T05a — Configuração da Conta Pessoal
Arquitetura de tela — Especificação completa v3
Personaliza o perfil e o feed antes do primeiro acesso ao app
1. Identificação da Tela
Código	T05a
Nome	Configuração da Conta Pessoal
Tipo	Fluxo de configuração guiada — 4 passos sequenciais
Fase do produto	Fase 1.0 — Presente desde o lançamento
Perfil de acesso	Usuários novos que escolheram 'Conta pessoal' em T04
Tela anterior	T04 — Escolha de Perfil
Tela seguinte	T06 — Home (após concluir o passo 4)
Pode ser pulada?	Parcialmente — passos 1, 2 e 3 têm botão 'Pular por agora'. Passo 4 é conclusão obrigatória.
Número de passos	4 passos sequenciais com barra de progresso
Sem barra inferior	Fluxo de configuração inicial — barra NÃO aparece
Prioridade	Alta — define a qualidade do feed desde o primeiro acesso

2. Objetivo da Tela
A T05a coleta as informações essenciais para personalizar o feed do usuário desde o primeiro uso. O fluxo é guiado, simples e projetado para ser concluído em menos de 2 minutos.

Objetivo 1 — Identidade na rede social
Dar ao usuário uma presença real na rede social. Username único e foto de perfil são o que os outros verão ao interagir. Sem isso, o usuário é anônimo e não engaja socialmente.
Objetivo 2 — Localização para o feed
Sem localização, o feed não sabe o que mostrar. Este passo ativa o raio padrão de 5km e garante que o usuário veja estabelecimentos realmente próximos desde a primeira abertura.
Objetivo 3 — Personalização por interesses
Com base nas categorias escolhidas, o algoritmo do feed prioriza tipos de conteúdo relevantes. Quem marca 'Gastronomia' e 'Eventos' vê mais restaurantes e shows.

3. Estrutura Geral
Fundo	#0D0D0D — preto profundo, padrão do app
Layout	Fluxo em passos — 1 passo por vez, tela cheia
Barra de progresso	Topo da tela — 4 segmentos. Laranja: concluído. Laranja 60%: ativo. Cinza: pendente.
Indicador	Texto 'Passo X de 4' — cinza #444 — 10px
Título do passo	Branco bold 18px
Subtítulo	Cinza #555 11px — explica o que será feito
Botão avançar	Laranja — 100% largura — 44px altura — radius 12px
Botão pular passo	'Pular por agora' — texto cinza — visível em passos 1, 2 e 3
Botão voltar passo	Seta ← canto superior esquerdo — volta ao passo anterior
Transição	Slide horizontal — esquerda para direita ao avançar, direita para esquerda ao voltar

4. Detalhamento dos 4 Passos
PASSO 1 — Identidade
Título na tela	Como você quer aparecer?
Obrigatório?	Username obrigatório. Foto e bio opcionais.
Pode pular?	Sim — foto e bio opcionais. Username é obrigatório para avançar.
Foto de perfil	Avatar circular 100px. Toque abre modal: 'Tirar foto' ou 'Escolher da galeria'. Editor de recorte circular. Se veio do Google/Apple com foto: pré-preenchida.
@username	Input texto. Placeholder: '@seunome'. App adiciona @ automaticamente. Mín 3 / máx 30 chars. Letras, números, ponto e underscore. Sem espaço.
Verificação username	Ícone check verde se disponível. Ícone X vermelho se já existe. Debounce 500ms. Verificação em tempo real via API.
Username sugerido	Se veio do Google/Apple: sugerido com base no nome (ex: @joaosilva). Editável.
Bio	Textarea opcional. Placeholder: 'Conte algo sobre você...' Máx 150 chars. Contador visível.
Botão Próximo	Habilitado somente quando username válido e disponível.

PASSO 2 — Localização
Título na tela	Onde você está?
Obrigatório?	Pelo menos uma forma de localização definida.
Pode pular?	Sim — feed usará localização genérica até configurar em Config → Localidade.
Botão GPS	'Usar minha localização atual' — laranja. Solicita permissão se não concedida. SOMENTE se nunca pedida antes (alinhado com T01).
GPS concedido	Detecta cidade via reverse geocoding no backend → exibe 'São Paulo, SP ✓'. Opção de trocar.
GPS negado	Destaca automaticamente campo de cidade manual. Não repete popup.
Campo manual	Input com autocomplete Google Places API. Apenas cidades brasileiras. Debounce 300ms. Mín 2 chars.
Raio padrão	5km — fixo nesta tela. Exibido como informação: 'Raio padrão: 5km'.
Botão Próximo	Habilitado após localização definida (GPS ou manual).

PASSO 3 — Interesses
Título na tela	O que você curte?
Obrigatório?	Mínimo 3 categorias para habilitar Próximo.
Pode pular?	Sim — feed usará distribuição padrão de categorias.
Grid de categorias	12 chips em layout wrap. Gastronomia, Eventos, Beleza, Saúde, Hospedagem, Fitness, Pet, Automotivo, Compras, Educação, Arte & Cultura, Turismo.
Chip inativo	Fundo #1A1A1A, borda #2A2A2A, texto #666.
Chip ativo	Fundo rgba(232,100,10,0.12), borda #E8640A, texto #E8640A.
Contador	'X selecionados' em laranja — atualiza em tempo real.
Botão Próximo	Desabilitado até 3 ou mais categorias selecionadas.
Máximo	Sem limite máximo — usuário pode selecionar todas.

PASSO 4 — Conclusão
Título na tela	Tudo pronto, [nome]!
Obrigatório?	Não pode ser pulado — é a tela final.
Pode pular?	Não — é a tela de conclusão. Botão único leva ao T06.
Ícone	🎉 — 56px — centralizado
Título	'Tudo pronto, [nome]!' — branco bold 20px. Nome vem do username ou nome real.
Subtítulo	'Seu perfil está configurado. Hora de descobrir o que está agitando a cidade.'
Resumo	Card com o que foi configurado: @username, cidade + raio, categorias selecionadas.
Itens não configurados	Não exibidos no resumo — sem punição visual por ter pulado passos.
CTA	'Explorar o Meu Agito' — laranja — leva para T06 Home.

5. Fluxo Completo de Navegação
De onde	Ação	Para onde	Observação
T04	Escolheu conta pessoal	T05a Passo 1	Início do fluxo
Passo 1	Username válido + Próximo	Passo 2	Slide left
Passo 1	Pular por agora	Passo 2	Username não salvo — perfil incompleto
Passo 1	← Voltar	T04	Não há passo anterior
Passo 2	Localização definida + Próximo	Passo 3	Slide left
Passo 2	Pular por agora	Passo 3	Sem localização — feed genérico
Passo 2	← Voltar	Passo 1	Slide right
Passo 3	3+ categorias + Próximo	Passo 4	Slide left
Passo 3	Pular por agora	Passo 4	Sem categorias — feed padrão
Passo 3	← Voltar	Passo 2	Slide right
Passo 4	Explorar o Meu Agito	T06 Home	Fim do fluxo de configuração

6. Todos os Elementos — Tabela Completa
Tipo	Elemento	Ação/Destino	Passo	Observações
VISUAL	Barra de progresso	Sem ação	Todos	4 segmentos. Laranja=feito.
VISUAL	Indicador 'Passo X de 4'	Sem ação	Todos	Cinza #444. 10px.
BOTÃO	← Voltar	Passo anterior	Todos	Círculo #1A1A1A 36px.
UPLOAD	Avatar circular	Modal câmera/galeria	1	Editor recorte circular.
INPUT	@username	Verifica disponibilidade	1	Debounce 500ms. Obrigatório.
VISUAL	Ícone check/X username	Sem ação — feedback	1	Verde=disponível, Vermelho=ocupado.
INPUT	Bio (textarea)	Sem ação	1	Opcional. Máx 150 chars.
BOTÃO	Usar localização atual (GPS)	Solicita permissão → cidade	2	Só se NUNCA pedido antes.
INPUT	Campo cidade manual	Autocomplete Google Places	2	Só cidades BR. Debounce 300ms.
VISUAL	Cidade confirmada	Botão 'Trocar'	2	Exibe cidade + raio 5km.
GRID	12 chips de categoria	Toggle seleção	3	Mín 3 para habilitar Próximo.
VISUAL	Contador de selecionados	Sem ação	3	Laranja. Tempo real.
VISUAL	Resumo de configuração	Sem ação	4	Card com o que foi configurado.
BOTÃO	Próximo	Passo seguinte	1,2,3	Desabilitado se campo obrigatório vazio.
BOTÃO	Pular por agora	Passo seguinte	1,2,3	Texto cinza. Pula sem salvar.
BOTÃO	Explorar o Meu Agito	T06 Home	4	Laranja. CTA final.

7. Regras de Negócio
RN-01 — GPS somente se nunca solicitado
O passo 2 solicita GPS apenas se a permissão nunca foi pedida antes (alinhado com T01). Se já foi negada, destaca o campo manual diretamente.
RN-02 — Username único na plataforma
O @username é verificado em tempo real via API. Debounce de 500ms para não disparar a cada tecla. O botão Próximo só ativa com username disponível.
RN-03 — Pular não bloqueia o app
O usuário pode pular qualquer passo (1, 2 e 3). O perfil ficará incompleto mas o app funciona normalmente. Configuração pode ser feita depois em Config → Perfil.
RN-04 — Mínimo 3 interesses para avançar
O passo 3 exige pelo menos 3 categorias selecionadas para habilitar o botão Próximo. O botão 'Pular por agora' continua disponível.
RN-05 — Coordenadas nunca chegam ao app
O backend faz o reverse geocoding das coordenadas GPS e retorna apenas o nome da cidade. O app nunca recebe latitude/longitude diretamente (SEC-01 LGPD).
RN-06 — Sem barra de navegação inferior
A barra inferior não aparece em nenhum dos 4 passos — fluxo de configuração inicial.
RN-07 — Passo 4 não pode ser pulado
A tela de conclusão não tem botão 'Pular'. É o fim natural do fluxo — o único caminho é ir para o T06.

Dev: Verificação de username — GET /api/usuarios/verificar-username?handle={handle}. Retorna { disponivel: true|false }. Rate limiting aplicado (SEC-05).

8. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui os 4 passos completos: identidade, localização, interesses e conclusão.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T05a Configuração Pessoal</title>
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
    gap: 20px;
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
  .phone {
    width: 280px;
    height: 580px;
    background: #0D0D0D;
    border-radius: 40px;
    border: 6px solid #1e1e1e;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
  }
  .notch {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 90px; height: 22px;
    background: #1e1e1e;
    border-radius: 0 0 14px 14px;
    z-index: 20;
  }
  .screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 40px 18px 90px;

  }

  /* Progress bar */
  .progress-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 6px;
  }
  .progress-seg {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: #222;
  }
  .progress-seg.done { background: #E8640A; }
  .progress-seg.active { background: #E8640A; opacity: 0.6; }

  .step-label {
    font-size: 10px;
    color: #444;
    margin-bottom: 16px;
  }
  .step-label span { color: #E8640A; }

  .step-title {
    font-size: 18px;
    font-weight: 900;
    color: white;
    margin-bottom: 4px;
    line-height: 1.25;
  }
  .step-sub {
    font-size: 11px;
    color: #555;
    margin-bottom: 18px;
    line-height: 1.5;
  }

  /* Avatar uploader */
  .avatar-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .avatar-circle {

    width: 70px; height: 70px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 2px dashed #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
  }
  .avatar-circle.filled {
    border: 2px solid #E8640A;
  }
  .avatar-cam {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 22px; height: 22px;
    background: #E8640A;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
  .avatar-hint { font-size: 11px; color: #555; line-height: 1.5; }
  .avatar-hint span { color: #E8640A; }

  /* Input */
  .input-wrap {
    margin-bottom: 10px;
  }
  .input-label {
    font-size: 10px;
    color: #555;

    margin-bottom: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .input-field {
    width: 100%;
    height: 42px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 0 12px;
    font-size: 12px;
    color: white;
    font-family: Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .input-field.active { border-color: #E8640A; }
  .input-field.valid  { border-color: #27ae60; }
  .input-field.error  { border-color: #e74c3c; }
  .input-placeholder { color: #333; font-size: 12px; }
  .input-text        { color: white; font-size: 12px; }
  .input-suffix      { font-size: 11px; }
  .char-count        { font-size: 10px; color: #444; text-align: right; margin-top: 3px; }

  /* Categories grid */

  .cat-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .cat-chip {
    padding: 6px 10px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 20px;
    font-size: 10px;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .cat-chip.selected {
    background: rgba(232,100,10,0.12);
    border-color: #E8640A;
    color: #E8640A;
  }

  /* Location */
  .loc-btn {
    width: 100%;
    height: 44px;
    background: #E8640A;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .loc-manual {

    text-align: center;
    font-size: 11px;
    color: #555;
    text-decoration: underline;
    cursor: pointer;
  }
  .loc-confirmed {
    background: #0d1a0d;
    border: 1px solid #1a3a1a;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .loc-icon { font-size: 20px; }
  .loc-info { flex: 1; }
  .loc-city { font-size: 13px; font-weight: 700; color: white; }
  .loc-sub  { font-size: 10px; color: #555; margin-top: 2px; }
  .loc-change { font-size: 10px; color: #E8640A; text-decoration: underline; cursor: pointer; }

  /* Footer */
  .footer-cta {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 10px 18px 24px;
    background: linear-gradient(to top, #0D0D0D 75%, transparent);
    display: flex;

    flex-direction: column;
    gap: 6px;
  }
  .btn-next {
    width: 100%;
    height: 44px;
    background: #E8640A;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: Arial, sans-serif;
    cursor: pointer;
  }
  .btn-next.disabled { background: #1e1e1e; color: #3a3a3a; }
  .btn-skip {
    text-align: center;
    font-size: 10px;
    color: #444;
    cursor: pointer;
    text-decoration: underline;
  }

  /* Info section */
  .info-section {
    width: 100%;
    max-width: 1000px;
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
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .step-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #2a2a2a;
  }
  .step-card.current { border-color: #E8640A; }
  .step-num { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 6px; }
  .step-name { color: white; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
  .step-fields { color: #555; font-size: 10px; line-height: 1.6; }
  .step-opt { color: #333; font-size: 9px; margin-top: 4px; font-style: italic; }
</style>
</head>
<body>

  <div class="page-title">T05a — Configuração Pessoal</div>
  <div class="page-sub">4 passos · Personaliza o perfil e o feed antes do primeiro acesso</div>

  <div class="phones-row">


    <!-- Passo 1: Foto e username -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 1 — Identidade</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="progress-seg active"></div>
            <div class="progress-seg"></div>
            <div class="progress-seg"></div>
            <div class="progress-seg"></div>
          </div>
          <div class="step-label">Passo <span>1</span> de 4</div>
          <div class="step-title">Como você quer aparecer?</div>
          <div class="step-sub">Escolha uma foto e seu nome de usuário.</div>

          <div class="avatar-row">
            <div class="avatar-circle filled">
              👤
              <div class="avatar-cam">📷</div>

            </div>
            <div class="avatar-hint">Toque para adicionar<br>uma foto de perfil.<br><span>Opcional</span></div>
          </div>

          <div class="input-wrap">
            <div class="input-label">NOME DE USUÁRIO *</div>
            <div class="input-field valid">
              <span class="input-text">@joaosilva</span>
              <span class="input-suffix" style="color:#27ae60;">✓</span>
            </div>
          </div>

          <div class="input-wrap">
            <div class="input-label">BIO <span style="color:#333; font-size:9px;">OPCIONAL</span></div>
            <div class="input-field">
              <span class="input-placeholder">Conte algo sobre você...</span>
            </div>
            <div class="char-count">0 / 150</div>
          </div>
        </div>


        <div class="footer-cta">
          <button class="btn-next">Próximo</button>
          <div class="btn-skip">Pular por agora</div>
        </div>
      </div>
    </div>

    <!-- Passo 2: Localização -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 2 — Localização</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="progress-seg done"></div>
            <div class="progress-seg active"></div>
            <div class="progress-seg"></div>
            <div class="progress-seg"></div>
          </div>
          <div class="step-label">Passo <span>2</span> de 4</div>
          <div class="step-title">Onde você está?</div>
          <div class="step-sub">Vamos mostrar o que está rolando perto de você.</div>


          <!-- Confirmado -->
          <div class="loc-confirmed">
            <div class="loc-icon">📍</div>
            <div class="loc-info">
              <div class="loc-city">São Paulo, SP</div>
              <div class="loc-sub">Raio padrão: 5km · GPS ativo</div>
            </div>
            <div class="loc-change">Trocar</div>
          </div>

          <div style="font-size:10px; color:#444; text-align:center; margin-top:6px;">ou</div>

          <div style="margin-top:10px;">
            <button class="loc-btn" style="background:#1a1a1a; color:#666; border:1px solid #2a2a2a;">
              📍 Usar minha localização atual
            </button>
            <div class="loc-manual">Digitar minha cidade</div>
          </div>
        </div>

        <div class="footer-cta">
          <button class="btn-next">Próximo</button>

          <div class="btn-skip">Pular por agora</div>
        </div>
      </div>
    </div>

    <!-- Passo 3: Interesses -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 3 — Interesses</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="progress-seg done"></div>
            <div class="progress-seg done"></div>
            <div class="progress-seg active"></div>
            <div class="progress-seg"></div>
          </div>
          <div class="step-label">Passo <span>3</span> de 4</div>
          <div class="step-title">O que você curte?</div>
          <div class="step-sub">Selecione pelo menos 3 categorias.</div>

          <div class="cat-grid">
            <div class="cat-chip selected">🍽️ Gastronomia</div>

            <div class="cat-chip selected">🎵 Eventos</div>
            <div class="cat-chip">✂️ Beleza</div>
            <div class="cat-chip selected">🏥 Saúde</div>
            <div class="cat-chip">🏨 Hospedagem</div>
            <div class="cat-chip">💪 Fitness</div>
            <div class="cat-chip">🐾 Pet</div>
            <div class="cat-chip">🚗 Automotivo</div>
            <div class="cat-chip">🛍️ Compras</div>
            <div class="cat-chip">📚 Educação</div>
            <div class="cat-chip">🎨 Arte</div>
            <div class="cat-chip">✈️ Turismo</div>
          </div>

          <div style="margin-top:10px; font-size:10px; color:#E8640A; text-align:center;">3 selecionados</div>
        </div>

        <div class="footer-cta">
          <button class="btn-next">Próximo</button>

          <div class="btn-skip">Pular por agora</div>
        </div>
      </div>
    </div>

    <!-- Passo 4: Concluído -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 4 — Pronto!</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen" style="align-items:center; justify-content:center; text-align:center;">
          <div class="progress-bar" style="width:100%;">
            <div class="progress-seg done"></div>
            <div class="progress-seg done"></div>
            <div class="progress-seg done"></div>
            <div class="progress-seg done"></div>
          </div>

          <div style="margin-top:32px; font-size:56px; margin-bottom:20px;">🎉</div>
          <div style="font-size:20px; font-weight:900; color:white; margin-bottom:8px;">Tudo pronto, João!</div>

          <div style="font-size:12px; color:#555; line-height:1.6; max-width:220px;">Seu perfil está configurado. Hora de descobrir o que está agitando a cidade.</div>

          <div style="margin-top:28px; background:#1a1a1a; border-radius:14px; padding:14px 18px; border:1px solid #2a2a2a; width:100%; text-align:left;">
            <div style="font-size:10px; color:#555; margin-bottom:8px;">CONFIGURADO COM SUCESSO</div>
            <div style="font-size:11px; color:#888; line-height:1.8;">
              👤 @joaosilva<br>
              📍 São Paulo, SP · 5km<br>
              ❤️ Gastronomia, Eventos, Saúde
            </div>
          </div>
        </div>

        <div class="footer-cta">
          <button class="btn-next">Explorar o Meu Agito</button>
        </div>
      </div>
    </div>


  </div>

  <!-- Steps overview -->
  <div class="info-section">
    <div class="info-title">Os 4 Passos — Visão Geral</div>
    <div class="steps-grid">

      <div class="step-card">
        <div class="step-num">PASSO 1</div>
        <div class="step-name">Identidade</div>
        <div class="step-fields">
          Foto de perfil (opcional)<br>
          @username (obrigatório)<br>
          Bio (opcional)
        </div>
        <div class="step-opt">Pode pular — username obrigatório</div>
      </div>

      <div class="step-card">
        <div class="step-num">PASSO 2</div>
        <div class="step-name">Localização</div>
        <div class="step-fields">
          GPS automático<br>
          ou cidade manual<br>
          Raio padrão: 5km
        </div>
        <div class="step-opt">Pode pular — feed usa genérico</div>

      </div>

      <div class="step-card">
        <div class="step-num">PASSO 3</div>
        <div class="step-name">Interesses</div>
        <div class="step-fields">
          Grid de 12 categorias<br>
          Mínimo 3 selecionadas<br>
          para ativar Próximo
        </div>
        <div class="step-opt">Pode pular — feed usa genérico</div>
      </div>

      <div class="step-card current">
        <div class="step-num">PASSO 4</div>
        <div class="step-name">Conclusão</div>
        <div class="step-fields">
          Resumo do que foi<br>
          configurado<br>
          CTA para o Home
        </div>
        <div class="step-opt">Não pode pular — é o final</div>
      </div>

    </div>

    <div style="margin-top:16px; display:flex; flex-wrap:wrap; gap:8px;">
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Barra de progresso no topo — 4 segmentos</div>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Botão "Pular por agora" em passos opcionais</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">GPS solicitado somente se nunca pedido</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Username verificado em tempo real (debounce 500ms)</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Transição entre passos: slide horizontal</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Sem barra de navegação inferior</div>

    </div>
  </div>

</body>
</html>

