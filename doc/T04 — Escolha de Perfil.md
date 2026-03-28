MEU AGITO
T04 — Escolha de Perfil
Arquitetura de tela — Especificação completa v3
Define o tipo de conta do novo usuário — pessoal ou empresarial
1. Identificação da Tela
Código	T04
Nome	Escolha de Perfil
Tipo	Tela de configuração inicial — decisão de tipo de conta
Fase do produto	Fase 1.0 — Presente desde o lançamento
Perfil de acesso	Apenas novos usuários — primeiro acesso após cadastro
Tela anterior	T03 — Login / Cadastro (qualquer método de cadastro)
Telas seguintes	T05a — Configuração pessoal | T05b — Cadastro empresarial
Aparece quando	Uma única vez — no primeiro acesso após criar a conta
Escolha exclusiva	Um tipo por cadastro. Conta pessoal e empresarial usam e-mails diferentes.
Pode ser pulada?	Não — a escolha é obrigatória para continuar no app
Sem barra inferior	Tela pré-configuração — barra de navegação NÃO aparece
Prioridade	Alta — define toda a estrutura da conta do usuário

2. Conceito
A T04 é a bifurcação do app — o momento em que o novo usuário define que tipo de conta está criando. A escolha é exclusiva: cada cadastro corresponde a um tipo de conta com um e-mail próprio.

Quem quiser ter tanto uma conta pessoal quanto uma conta empresarial deve criar dois cadastros separados, com e-mails diferentes. Isso mantém as contas independentes e o gerenciamento limpo.

Decisão de produto: sem opção 'os dois ao mesmo tempo'. Cada conta é um cadastro independente com e-mail próprio.

3. Estrutura Visual da Tela
Fundo	#0D0D0D — preto profundo, padrão do app
Título	'Que tipo de conta você quer criar?' — branco bold 20px — centralizado
Subtítulo	'Cada tipo de conta usa um e-mail próprio.' — cinza #555 — 12px
Layout dos cards	Dois cards empilhados verticalmente. 14px de espaçamento entre eles.
Botão Continuar	Fixo no rodapé. Desabilitado até uma opção ser selecionada.
Footer note	'Você pode criar outra conta com um e-mail diferente a qualquer momento.'
Sem botão voltar	Usuário já está logado — não pode voltar ao T03
Sem botão pular	A escolha é obrigatória — não existe opção de pular

4. Detalhamento dos Cards
4.1 Card — Conta Pessoal
Ícone	👤 — 48x48px, border-radius 14px, fundo #111
Título	'Conta pessoal' — branco bold 16px
Descrição	'Para pessoas que querem explorar e interagir com a cidade.' — cinza #666 12px
Check	Círculo 22px. Inativo: borda #333. Ativo: preenchido laranja #E8640A com ✓ branco.
Borda padrão	1.5px sólida #2A2A2A
Borda selecionado	1.5px sólida laranja #E8640A — fundo #1A0F05
Card não selecionado	Quando o outro card está selecionado: opacidade 0.4 — visualmente inativo
Border radius	18px
Animação press	Scale 0.98 ao pressionar (100ms). Retorna a 1.0 ao soltar.

4.2 Card — Conta Empresarial
Ícone	🏢 — 48x48px, border-radius 14px, fundo #111
Título	'Conta empresarial' — branco bold 16px
Descrição	'Para negócios, serviços e estabelecimentos que querem ser encontrados.' — cinza #666 12px
Check	Mesmo comportamento do card pessoal
Borda padrão	1.5px sólida #2A2A2A
Borda selecionado	1.5px sólida laranja #E8640A — fundo #1A0F05
Card não selecionado	Quando o outro card está selecionado: opacidade 0.4
Border radius	18px
Sem badge de preço	Nenhum badge ou indicação de custo — a conta é gratuita por padrão

5. Botão Continuar
Estado inicial	Desabilitado — fundo #1E1E1E — texto #3A3A3A — não responde ao toque
Estado ativo	Laranja #E8640A — texto branco bold — responde ao toque
Transição	300ms de desabilitado para ativo ao selecionar um card
Texto	'Continuar' — fixo independente da escolha
Tamanho	100% largura com padding 20px lateral. Altura 50px. Radius 14px.
Loading	Spinner branco ao processar. Botão inativo durante loading.
Erro de servidor	Toast: 'Não foi possível salvar. Tente novamente.' Botão reativa.

6. Fluxo Completo de Navegação
Ação	Tipo selecionado	Destino	Observação
Toca card Pessoal	pessoal	Card ativo — botão Continuar ativa	Card empresarial fica opaco
Toca card Empresarial	empresarial	Card ativo — botão Continuar ativa	Card pessoal fica opaco
Toca card já selecionado	deseleciona	Botão Continuar desabilita	Toggle — remove a seleção
Toca Continuar (pessoal)	pessoal confirmado	T05a — Config Pessoal	Salva tipo = 'pessoal' via API
Toca Continuar (empresarial)	empresarial confirmado	T05b — Cadastro Empresa	Salva tipo = 'empresarial' via API
Botão Voltar Android	—	Sem ação / dialog sair	Usuário já está logado — sem tela anterior

7. Regras de Negócio
RN-01 — Escolha exclusiva — um ou outro
Cada cadastro corresponde a exatamente um tipo de conta. Não existe seleção dupla. Quem quiser os dois tipos cria dois cadastros com e-mails diferentes.
RN-02 — E-mails independentes por tipo
Conta pessoal e conta empresarial são cadastros separados com credenciais próprias. O sistema não vincula as duas automaticamente.
RN-03 — Tela aparece apenas uma vez
Após a escolha e configuração inicial, a T04 não é exibida novamente para aquele cadastro.
RN-04 — Sem botão pular
A escolha do tipo de conta é obrigatória. Não existe caminho para acessar o app sem passar por esta tela.
RN-05 — Sem indicação de custo
Nenhum card exibe preço, badge 'grátis' ou qualquer indicação financeira. As contas são gratuitas por padrão e isso não precisa ser comunicado aqui.
RN-06 — Sem barra de navegação inferior
A barra inferior não aparece — faz parte do fluxo de configuração inicial pré-app.

8. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui os 3 estados (inicial, pessoal selecionada, empresarial selecionada), o fluxo de navegação por tipo de conta e as regras de comportamento.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T04 Escolha de Perfil</title>
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
  .phone {
    width: 300px;
    height: 540px;
    background: #0D0D0D;
    border-radius: 44px;
    border: 7px solid #1e1e1e;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.8);
  }
  .notch {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 100px; height: 24px;
    background: #1e1e1e;
    border-radius: 0 0 16px 16px;
    z-index: 20;
  }
  .screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 52px 20px 100px;

  }

  .screen-title {
    font-size: 20px;
    font-weight: 900;
    color: white;
    text-align: center;
    margin-bottom: 6px;
    line-height: 1.25;
  }
  .screen-sub {
    font-size: 12px;
    color: #555;
    text-align: center;
    margin-bottom: 32px;
    line-height: 1.5;
  }

  .profile-card {
    width: 100%;
    background: #1A1A1A;
    border-radius: 18px;
    padding: 20px 18px;
    border: 1.5px solid #2a2a2a;
    margin-bottom: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s, background 0.2s;
  }
  .profile-card.selected {
    border-color: #E8640A;
    background: #1a0f05;
  }
  .profile-card.unselected {
    opacity: 0.4;
  }

  .card-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex;

    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    background: #111;
    border: 1px solid #2a2a2a;
  }
  .profile-card.selected .card-icon {
    background: rgba(232,100,10,0.1);
    border-color: rgba(232,100,10,0.3);
  }

  .card-info { flex: 1; }
  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
  }
  .card-desc {
    font-size: 12px;
    color: #666;
    line-height: 1.45;
  }

  .card-check {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1.5px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 700;
    color: transparent;
  }
  .card-check.checked {
    background: #E8640A;
    border-color: #E8640A;

    color: white;
  }

  /* Footer */
  .footer-cta {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 14px 20px 30px;
    background: linear-gradient(to top, #0D0D0D 75%, transparent);
  }
  .btn-continuar {
    width: 100%;
    height: 50px;
    border-radius: 14px;
    border: none;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: Arial, sans-serif;
  }
  .btn-continuar.disabled { background: #1e1e1e; color: #3a3a3a; }
  .btn-continuar.active   { background: #E8640A; color: white; }
  .footer-note {
    text-align: center;
    font-size: 9px;
    color: #333;
    margin-top: 7px;
  }

  /* Info section */
  .info-section {
    width: 100%;
    max-width: 740px;
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
  .flow-card-title {
    color: #E8640A;
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  .flow-step {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 0;
    border-bottom: 1px solid #222;
    font-size: 10px;
  }
  .flow-step:last-child { border-bottom: none; }
  .flow-step .from  { color: #555; flex: 1; }

  .flow-step .arrow { color: #333; }
  .flow-step .to    { color: #E8640A; font-weight: 700; }

  .rules-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .rule-pill {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 10px;
    color: #555;
  }
  .rule-pill.important {
    border-color: #E8640A44;
    color: #E8640A;
  }
</style>
</head>
<body>

  <div class="page-title">T04 — Escolha de Perfil</div>
  <div class="page-sub">Um tipo por cadastro · E-mails diferentes · Exclusivo — um ou outro</div>

  <div class="phones-row">

    <!-- Estado inicial -->
    <div class="phone-wrap">
      <div class="phone-label">Estado inicial</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">

          <div class="screen-title">Que tipo de conta você quer criar?</div>
          <div class="screen-sub">Cada tipo de conta usa um e-mail próprio.</div>

          <div class="profile-card">
            <div class="card-icon">👤</div>
            <div class="card-info">
              <div class="card-title">Conta pessoal</div>
              <div class="card-desc">Para pessoas que querem explorar e interagir com a cidade.</div>
            </div>
            <div class="card-check"></div>
          </div>

          <div class="profile-card">
            <div class="card-icon">🏢</div>
            <div class="card-info">
              <div class="card-title">Conta empresarial</div>
              <div class="card-desc">Para negócios, serviços e estabelecimentos que querem ser encontrados.</div>

            </div>
            <div class="card-check"></div>
          </div>
        </div>

        <div class="footer-cta">
          <button class="btn-continuar disabled">Continuar</button>
          <div class="footer-note">Você pode criar outra conta com um e-mail diferente a qualquer momento.</div>
        </div>
      </div>
    </div>

    <!-- Pessoal selecionada -->
    <div class="phone-wrap">
      <div class="phone-label">Pessoal selecionada</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="screen-title">Que tipo de conta você quer criar?</div>
          <div class="screen-sub">Cada tipo de conta usa um e-mail próprio.</div>

          <div class="profile-card selected">
            <div class="card-icon">👤</div>

            <div class="card-info">
              <div class="card-title">Conta pessoal</div>
              <div class="card-desc">Para pessoas que querem explorar e interagir com a cidade.</div>
            </div>
            <div class="card-check checked">✓</div>
          </div>

          <div class="profile-card unselected">
            <div class="card-icon">🏢</div>
            <div class="card-info">
              <div class="card-title">Conta empresarial</div>
              <div class="card-desc">Para negócios, serviços e estabelecimentos que querem ser encontrados.</div>
            </div>
            <div class="card-check"></div>
          </div>
        </div>

        <div class="footer-cta">
          <button class="btn-continuar active">Continuar</button>
          <div class="footer-note">Você pode criar outra conta com um e-mail diferente a qualquer momento.</div>

        </div>
      </div>
    </div>

    <!-- Empresarial selecionada -->
    <div class="phone-wrap">
      <div class="phone-label">Empresarial selecionada</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="screen-title">Que tipo de conta você quer criar?</div>
          <div class="screen-sub">Cada tipo de conta usa um e-mail próprio.</div>

          <div class="profile-card unselected">
            <div class="card-icon">👤</div>
            <div class="card-info">
              <div class="card-title">Conta pessoal</div>
              <div class="card-desc">Para pessoas que querem explorar e interagir com a cidade.</div>
            </div>
            <div class="card-check"></div>
          </div>

          <div class="profile-card selected">

            <div class="card-icon">🏢</div>
            <div class="card-info">
              <div class="card-title">Conta empresarial</div>
              <div class="card-desc">Para negócios, serviços e estabelecimentos que querem ser encontrados.</div>
            </div>
            <div class="card-check checked">✓</div>
          </div>
        </div>

        <div class="footer-cta">
          <button class="btn-continuar active">Continuar</button>
          <div class="footer-note">Você pode criar outra conta com um e-mail diferente a qualquer momento.</div>
        </div>
      </div>
    </div>

  </div>

  <!-- Fluxos e regras -->
  <div class="info-section">
    <div class="info-title">Fluxo de Navegação por Escolha</div>
    <div class="flow-grid">

      <div class="flow-card">

        <div class="flow-card-title">CONTA PESSOAL</div>
        <div class="flow-step"><span class="from">Salva tipo = 'pessoal'</span></div>
        <div class="flow-step"><span class="from">Continuar</span><span class="arrow">→</span><span class="to">T05a Config Pessoal</span></div>
        <div class="flow-step"><span class="from">T05a completo</span><span class="arrow">→</span><span class="to">T06 Home</span></div>
      </div>

      <div class="flow-card">
        <div class="flow-card-title">CONTA EMPRESARIAL</div>
        <div class="flow-step"><span class="from">Salva tipo = 'empresarial'</span></div>
        <div class="flow-step"><span class="from">Continuar</span><span class="arrow">→</span><span class="to">T05b Cadastro Empresa</span></div>
        <div class="flow-step"><span class="from">T05b completo</span><span class="arrow">→</span><span class="to">T06 Home</span></div>

      </div>

    </div>

    <div class="rules-row">
      <div class="rule-pill important">Escolha exclusiva — um ou outro</div>
      <div class="rule-pill important">Cada conta usa um e-mail diferente</div>
      <div class="rule-pill">Aparece apenas uma vez por cadastro</div>
      <div class="rule-pill">Ao tocar em um card o outro fica inativo</div>
      <div class="rule-pill">Sem botão voltar — já está logado</div>
      <div class="rule-pill">Sem botão pular — obrigatório</div>
      <div class="rule-pill">Botão Continuar desabilitado até selecionar</div>
      <div class="rule-pill">Sem barra de navegação inferior</div>
    </div>
  </div>

</body>
</html>

