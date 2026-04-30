MEU AGITO
T02 — Onboarding
Arquitetura de tela — Especificação completa v3
Apresenta o app ao novo usuário — 3 slides que convencem e convertem
1. Identificação da Tela
Código	T02
Nome	Onboarding — 3 slides de apresentação
Tipo	Tela de apresentação / Fluxo de boas-vindas
Fase do produto	Fase 1.0 — Presente desde o lançamento
Perfil de acesso	Apenas novos usuários — primeiro acesso ao app
Tela anterior	T01 — Splash Screen (redirecionado quando flag onboardingCompleto = false)
Tela seguinte	T03 — Login / Cadastro (único destino possível ao final)
Quantas vezes aparece	Apenas uma vez por usuário — nunca mais após completar ou pular
Pode ser pulada?	Sim — botão 'Pular' disponível em todos os slides. Salva flag = true ao pular.
Prioridade	Alta — define a primeira impressão do produto

2. Objetivo da Tela
Em 3 slides rápidos, o novo usuário precisa entender o que é o Meu Agito, sentir vontade de fazer parte e chegar na tela de cadastro animado. Não é um tutorial técnico — é uma apresentação emocional e social do produto.

Os slides falam com todos — cliente e comerciante — sem dividir ou criar caminhos separados. A mensagem central é que a cidade está viva dentro do app e todo mundo faz parte desse ciclo: você descobre, compartilha, e isso move o comércio local.

Objetivo 1 — Comunicar o valor social
Mostrar que o app é movido por pessoas reais — posts de amigos, check-ins, reposts, prova social. O usuário precisa sair do slide 1 pensando: 'tem gente aqui que eu conheço'.
Objetivo 2 — Mostrar a conexão humana
Stories de amigos, notificações de repost, '3 amigos foram aqui' — a interação humana é o produto. Isso diferencia o Meu Agito de um buscador frio.
Objetivo 3 — Revelar o ciclo completo
O slide 3 fecha a narrativa mostrando que todo mundo sai ganhando: quem descobre, quem compartilha e quem tem o negócio. Sem dividir — só contextualizando com badges sutis.
Objetivo 4 — Conduzir ao cadastro
CTA final: 'Fazer parte agora 🚀' — mais humano e convidativo que 'Começar'. Leva diretamente ao T03.

3. Estrutura Geral da Tela
Número de slides	3 slides fixos
Navegação	Botão 'Próximo' + swipe lateral para esquerda
Volta entre slides	Swipe direita volta ao slide anterior. Sem botão 'Voltar'.
Dots indicadores	3 dots na parte inferior. Ativo: pill laranja 22px. Inativo: círculo cinza 8px.
Botão Pular	Presente nos 3 slides — canto superior direito — leva direto ao T03
Fundo	#0D0D0D — preto profundo, igual à splash
Título principal	Branco bold 28px — palavra-chave em laranja #E8640A
Subtítulo	Cinza #777777 — 13px regular
Transição entre slides	Push lateral (slide) — padrão iOS/Android
Ilustrações	Animações Lottie JSON — loop contínuo. Fallback: PNG estático.
Sem header de navegação	Sem logo, sem barra superior — foco total nos slides
Sem barra inferior	Barra de navegação não aparece no onboarding

4. Layout — 4 Zonas Fixas (iguais nos 3 slides)
Zona	Nome	Conteúdo	Altura
Z1	Header	Somente botão 'Pular' no canto direito. Sem logo para não distrair.	60px fixo
Z2	Ilustração	Animação Lottie centralizada. Loop contínuo. Pausa na transição entre slides.	45% da tela
Z3	Textos	Título bold 28px (palavra-chave em laranja) + subtítulo cinza 13px. Centralizado. Padding 24px.	25% da tela
Z4	Rodapé	Dots + botão Próximo (slides 1-2) ou 'Fazer parte agora' (slide 3). Safe area respeitada.	120px fixo

5. Detalhamento dos 3 Slides
Os slides contam uma história contínua. Não dividem cliente de comerciante — falam com todo mundo pelo ângulo humano e social.

SLIDE 1
Título na tela	Sua cidade está viva aqui dentro
Subtítulo	Veja o que seus amigos estão descobrindo, curtindo e compartilhando agora.
Conceito	Apresenta o lado social e humano do app. Feed real com posts de amigos, fotos de lugares, curtidas e interações. A sensação de que tem gente ativa agora.
Ilustração	Animação Lottie. Mini feed com 2 posts de usuários reais — foto de lugar, legenda, likes e comentários. Loop 3s. Fallback: PNG estático.
Palavra em laranja	viva
Botão principal	Próximo

SLIDE 2
Título na tela	Compartilhe, marque e conecte
Subtítulo	Poste momentos, faça check-in e veja o que amigos estão recomendando perto de você.
Conceito	Mostra a interação humana: stories de amigos, check-in com prova social ('3 amigos foram aqui'), notificação de repost. A conexão entre pessoas é o produto.
Ilustração	Animação Lottie. Stories de amigos no topo, card de check-in com prova social, notificação de repost. Loop 3s. Fallback: PNG estático.
Palavra em laranja	conecte
Botão principal	Próximo

SLIDE 3
Título na tela	Todo mundo sai ganhando
Subtítulo	Cada post, cada curtida, cada check-in move o comércio local. Você faz parte disso.
Conceito	Fecha a narrativa com o ciclo completo: descobrir → compartilhar → negócio cresce. Badges sutis contextualizam (Cliente / Todos / Negócio) sem dividir nem criar caminhos separados.
Ilustração	Animação Lottie. 3 cards empilhados mostrando o ciclo: Descobrir → Compartilhar → Negócio cresce. Setas entre eles. Loop 3s. Fallback: PNG estático.
Palavra em laranja	ganhando
Botão principal	Fazer parte agora 🚀 (maior — CTA principal)

6. Fluxo Completo de Navegação
De onde	Ação do usuário	Para onde vai	Observação
Slide 1	Toca 'Próximo'	Slide 2	Push da esquerda para direita
Slide 1	Swipe esquerda	Slide 2	Mesmo efeito do botão Próximo
Slide 1	Toca 'Pular'	T03 — Login/Cadastro	Salva flag onboardingCompleto = true
Slide 1	Toca dot 2 ou 3	Slide correspondente	Navegação direta por dot
Slide 1	Botão físico Voltar (Android)	Fecha o app	É o primeiro slide — sem tela anterior
Slide 2	Toca 'Próximo'	Slide 3	Push da esquerda para direita
Slide 2	Swipe esquerda	Slide 3	Mesmo efeito do botão Próximo
Slide 2	Swipe direita	Slide 1	Volta ao slide anterior
Slide 2	Toca 'Pular'	T03 — Login/Cadastro	Salva flag onboardingCompleto = true
Slide 2	Botão físico Voltar (Android)	Slide 1	Volta ao anterior
Slide 3	Toca 'Fazer parte agora'	T03 — Login/Cadastro	CTA principal. Salva flag = true.
Slide 3	Swipe direita	Slide 2	Volta ao slide anterior
Slide 3	Toca 'Pular'	T03 — Login/Cadastro	Mesmo destino do CTA
Slide 3	Swipe esquerda	Sem ação	Último slide — sem próximo
Qualquer slide	Toca nos dots	Slide correspondente	Dot 1→Slide 1 / Dot 2→Slide 2 / Dot 3→Slide 3

7. Todos os Elementos — Tabela Completa
Tipo	Elemento	Destino/Ação	Slide(s)	Observações
VISUAL	Fundo #0D0D0D	Sem ação	Todos	Padrão do app
BOTÃO	Pular	T03 Login/Cadastro	Todos	Cinza #666. 14px. Área 44px.
ANIMAÇÃO	Ilustração Lottie S1	Sem ação	Slide 1	Feed social. Loop 3s.
ANIMAÇÃO	Ilustração Lottie S2	Sem ação	Slide 2	Check-in + stories.
ANIMAÇÃO	Ilustração Lottie S3	Sem ação	Slide 3	Ciclo completo.
VISUAL	Título com palavra laranja	Sem ação	Todos	Bold 28px. Palavra-chave #E8640A.
VISUAL	Subtítulo	Sem ação	Todos	Cinza #777. Regular 13px.
VISUAL	Dots indicadores	Slide tocado	Todos	Ativo: pill laranja 22px.
BOTÃO	Próximo	Slide seguinte	1 e 2	Laranja. 160px. Radius 12px.
BOTÃO	Fazer parte agora 🚀	T03 Login/Cadastro	Slide 3	CTA. 260px. Maior.
SISTEMA	Flag onboardingCompleto	Salva true ao sair	Qualquer	AsyncStorage local.

8. Regras de Negócio
RN-01 — Exibida apenas uma vez
Após completar ou pular, a flag onboardingCompleto é salva como true. O T01 nunca redireciona para o T02 novamente.
RN-02 — Pular é equivalente a concluir
Tocar em 'Pular' em qualquer slide tem o mesmo efeito de concluir: salva a flag e vai para T03.
RN-03 — Sem divisão de perfis
Os slides falam com todos — cliente e comerciante — pela narrativa social. A escolha de perfil acontece em T04, não aqui.
RN-04 — Android — Voltar no slide 1 fecha o app
No slide 1 não há tela anterior. Pressionar Voltar no Android exibe dialog 'Deseja sair?' antes de fechar.
RN-05 — Ilustrações não são obrigatórias para o fluxo
Se o arquivo Lottie não carregar, o fallback PNG é exibido. O fluxo funciona normalmente.
RN-06 — Sem barra de navegação inferior
A barra inferior não aparece em nenhum dos 3 slides — faz parte do fluxo pré-autenticação.

Dev: Implementar com react-native-onboarding-swiper ou FlatList horizontal com pagingEnabled. Flag no AsyncStorage — chave: 'meuagito_onboarding_completo'.

9. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui os 3 slides com ilustrações, dots, botões, fluxo de navegação e regras.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T02 Onboarding</title>
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
    gap: 28px;
    flex-wrap: wrap;
    justify-content: center;

    margin-bottom: 50px;
  }

  .phone-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
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
    height: 620px;
    background: #0D0D0D;
    border-radius: 44px;
    border: 7px solid #1e1e1e;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.8);
    display: flex;
    flex-direction: column;
  }

  .notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 24px;
    background: #1e1e1e;
    border-radius: 0 0 16px 16px;
    z-index: 20;
  }

  /* Header zone */
  .z-header {
    height: 60px;

    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 0 20px 8px;
    flex-shrink: 0;
    position: relative;
    z-index: 5;
  }
  .btn-pular {
    color: #666;
    font-size: 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: Arial, sans-serif;
  }

  /* Illustration zone */
  .z-illustration {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    position: relative;
  }

  /* Texts zone */
  .z-texts {
    padding: 0 26px 4px;
    text-align: center;
    flex-shrink: 0;
  }
  .slide-title {
    font-size: 22px;
    font-weight: 900;
    color: white;
    line-height: 1.25;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  .slide-title .hl { color: #E8640A; }

  .slide-subtitle {
    font-size: 13px;
    color: #777;
    line-height: 1.55;
  }

  /* Footer zone */
  .z-footer {
    padding: 14px 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .dots {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .dot {
    width: 8px; height: 8px;
    border-radius: 4px;
    background: #2a2a2a;
    transition: all 0.25s;
  }
  .dot.active { width: 22px; background: #E8640A; }

  .btn-next {
    background: #E8640A;
    color: white;
    font-size: 15px;
    font-weight: 700;
    border: none;
    border-radius: 14px;
    padding: 15px 0;
    width: 100%;
    cursor: pointer;
    font-family: Arial, sans-serif;
    letter-spacing: 0.2px;
  }
  .btn-next.cta { font-size: 16px; }


  /* ─── ILUSTRAÇÃO SLIDE 1 — Feed social com amigos ──────────────── */
  .ilu-feed {
    width: 260px;
    background: #111;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid #1e1e1e;
  }
  .feed-post {
    padding: 10px 12px;
    border-bottom: 1px solid #1a1a1a;
  }
  .feed-post:last-child { border-bottom: none; }
  .post-header {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 6px;
  }
  .avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }
  .post-meta { flex: 1; }
  .post-name { font-size: 11px; font-weight: 700; color: white; }
  .post-place { font-size: 10px; color: #E8640A; }
  .post-time { font-size: 9px; color: #444; }

  .post-img {
    width: 100%;
    height: 70px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 6px;
  }
  .post-caption { font-size: 10px; color: #888; margin-bottom: 6px; line-height: 1.4; }
  .post-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .post-action { font-size: 10px; color: #555; display: flex; align-items: center; gap: 3px; }
  .post-action.liked { color: #E8640A; }

  /* ─── ILUSTRAÇÃO SLIDE 2 — Check-in e recomendação ──────────────── */
  .ilu-checkin {
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .checkin-card {
    background: #111;
    border-radius: 14px;
    padding: 12px 14px;
    border: 1px solid #1e1e1e;
    display: flex;

    gap: 10px;
    align-items: center;
  }
  .checkin-place-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .checkin-info { flex: 1; }
  .checkin-name { font-size: 12px; font-weight: 700; color: white; }
  .checkin-sub { font-size: 10px; color: #555; margin-top: 2px; }
  .checkin-social { font-size: 10px; color: #E8640A; margin-top: 4px; font-weight: 700; }

  .story-row {
    display: flex;
    gap: 8px;
    overflow: hidden;
  }
  .story-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .story-avatar {
    width: 46px; height: 46px;
    border-radius: 50%;
    border: 2px solid #E8640A;
    display: flex;
    align-items: center;

    justify-content: center;
    font-size: 20px;
    background: #1a1a1a;
  }
  .story-name { font-size: 9px; color: #666; }

  /* ─── ILUSTRAÇÃO SLIDE 3 — Ciclo completo ──────────────── */
  .ilu-cycle {
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cycle-item {
    background: #111;
    border-radius: 14px;
    padding: 11px 14px;
    border: 1px solid #1e1e1e;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .cycle-icon {
    font-size: 22px;
    width: 36px;
    text-align: center;
    flex-shrink: 0;
  }
  .cycle-text { flex: 1; }
  .cycle-title { font-size: 12px; font-weight: 700; color: white; }
  .cycle-desc { font-size: 10px; color: #555; margin-top: 2px; line-height: 1.4; }
  .cycle-badge {
    font-size: 9px;
    font-weight: 700;

    padding: 3px 8px;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .badge-orange { background: rgba(232,100,10,0.15); color: #E8640A; }
  .badge-green  { background: rgba(76,175,80,0.15);  color: #4CAF50; }
  .badge-blue   { background: rgba(33,150,243,0.15); color: #2196F3; }

  .cycle-arrow {
    text-align: center;
    color: #2a2a2a;
    font-size: 16px;
    margin: -4px 0;
  }

  /* ─── Bottom sections ──────────────────────────────────── */
  .info-section {
    width: 100%;
    max-width: 960px;
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

  .nav-grid {

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .nav-card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #2a2a2a;
  }
  .nav-slide { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 8px; }
  .nav-action {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 5px;
  }
  .nav-action .a-trigger { font-size: 10px; color: #666; flex: 1; }
  .nav-action .a-dest { font-size: 10px; color: #888; font-weight: 700; }
  .nav-action .a-arrow { font-size: 10px; color: #333; }

  .rules-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
  .rule-pill {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 20px;
    padding: 6px 12px;

    font-size: 10px;
    color: #666;
  }
</style>
</head>
<body>

  <div class="page-title">T02 — Onboarding</div>
  <div class="page-sub">3 slides · Apenas no 1º acesso · Fala com todos — sem dividir cliente e comerciante</div>

  <div class="phones-row">

    <!-- ── SLIDE 1: Sua cidade está viva ── -->
    <div class="phone-wrap">
      <div class="phone-label">Slide 1 · Descoberta social</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="z-header">
          <button class="btn-pular">Pular</button>
        </div>

        <div class="z-illustration">
          <!-- Mini feed social com amigos -->
          <div class="ilu-feed">

            <div class="feed-post">
              <div class="post-header">
                <div class="avatar" style="background:#2a1a0a;">👩</div>

                <div class="post-meta">
                  <div class="post-name">@carolina</div>
                  <div class="post-place">📍 Barbearia Vintage</div>
                </div>
                <div class="post-time">2min</div>
              </div>
              <div class="post-img" style="background:#1a1205;">💈</div>
              <div class="post-caption">"Melhor corte da cidade! 🔥"</div>
              <div class="post-actions">
                <span class="post-action liked">👍 24</span>
                <span class="post-action">💬 3</span>
                <span class="post-action">↗</span>
              </div>
            </div>

            <div class="feed-post">
              <div class="post-header">
                <div class="avatar" style="background:#0a1a0a;">👨</div>

                <div class="post-meta">
                  <div class="post-name">@rafael</div>
                  <div class="post-place">📍 Restaurante Dom João</div>
                </div>
                <div class="post-time">18min</div>
              </div>
              <div class="post-img" style="background:#120a05;">🍕</div>
              <div class="post-caption">"Melhor pizza da cidade, sem dúvida 🍕"</div>
              <div class="post-actions">
                <span class="post-action liked">👍 51</span>
                <span class="post-action">💬 8</span>
                <span class="post-action">↗</span>
              </div>
            </div>

          </div>
        </div>

        <div class="z-texts">
          <div class="slide-title">Sua cidade está<br><span class="hl">viva aqui dentro</span></div>

          <div class="slide-subtitle">Veja o que seus amigos estão descobrindo, curtindo e compartilhando agora.</div>
        </div>

        <div class="z-footer">
          <div class="dots">
            <div class="dot active"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <button class="btn-next">Próximo</button>
        </div>
      </div>
    </div>

    <!-- ── SLIDE 2: Você faz parte ── -->
    <div class="phone-wrap">
      <div class="phone-label">Slide 2 · Conexão e check-in</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="z-header">
          <button class="btn-pular">Pular</button>
        </div>

        <div class="z-illustration">
          <div class="ilu-checkin">

            <!-- Stories de amigos -->

            <div style="background:#111; border-radius:14px; padding:10px 14px; border:1px solid #1e1e1e;">
              <div style="font-size:10px; color:#555; margin-bottom:8px;">Momentos de amigos</div>
              <div class="story-row">
                <div class="story-item">
                  <div class="story-avatar">👩</div>
                  <div class="story-name">carol</div>
                </div>
                <div class="story-item">
                  <div class="story-avatar">👨</div>
                  <div class="story-name">rafa</div>
                </div>
                <div class="story-item">
                  <div class="story-avatar" style="border-color:#444;">🏪</div>
                  <div class="story-name">café do</div>
                </div>
                <div class="story-item">

                  <div class="story-avatar" style="border-color:#444;">✂️</div>
                  <div class="story-name">barber</div>
                </div>
              </div>
            </div>

            <!-- Check-in card -->
            <div class="checkin-card">
              <div class="checkin-place-icon" style="background:#1a1205;">🍽️</div>
              <div class="checkin-info">
                <div class="checkin-name">Restaurante Dom João</div>
                <div class="checkin-sub">⭐ 4.8 · 320m de você</div>
                <div class="checkin-social">👥 3 amigos foram aqui</div>
              </div>
            </div>

            <!-- Repost notificação -->
            <div style="background:#0d1a0d; border-radius:14px; padding:10px 14px; border:1px solid #1a2a1a; display:flex; align-items:center; gap:8px;">

              <span style="font-size:18px;">🔔</span>
              <div>
                <div style="font-size:11px; color:white; font-weight:700;">@rafael repostou sua foto</div>
                <div style="font-size:10px; color:#555; margin-top:2px;">"Concordo demais! 🙌" · agora</div>
              </div>
            </div>

          </div>
        </div>

        <div class="z-texts">
          <div class="slide-title">Compartilhe,<br>marque e <span class="hl">conecte</span></div>
          <div class="slide-subtitle">Poste momentos, faça check-in e veja o que amigos estão recomendando perto de você.</div>
        </div>

        <div class="z-footer">
          <div class="dots">
            <div class="dot"></div>
            <div class="dot active"></div>
            <div class="dot"></div>

          </div>
          <button class="btn-next">Próximo</button>
        </div>
      </div>
    </div>

    <!-- ── SLIDE 3: Todos ganham ── -->
    <div class="phone-wrap">
      <div class="phone-label">Slide 3 · O ciclo que funciona</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="z-header">
          <button class="btn-pular">Pular</button>
        </div>

        <div class="z-illustration">
          <div class="ilu-cycle">

            <div class="cycle-item">
              <div class="cycle-icon">🔍</div>
              <div class="cycle-text">
                <div class="cycle-title">Você descobre lugares incríveis</div>
                <div class="cycle-desc">Feed vivo da cidade + indicações de amigos</div>
              </div>
              <div class="cycle-badge badge-orange">Cliente</div>

            </div>

            <div class="cycle-arrow">↓</div>

            <div class="cycle-item">
              <div class="cycle-icon">📸</div>
              <div class="cycle-text">
                <div class="cycle-title">Compartilha sua experiência</div>
                <div class="cycle-desc">Post, check-in, avaliação — em segundos</div>
              </div>
              <div class="cycle-badge badge-blue">Todos</div>
            </div>

            <div class="cycle-arrow">↓</div>

            <div class="cycle-item">
              <div class="cycle-icon">📈</div>
              <div class="cycle-text">
                <div class="cycle-title">Negócios crescem de graça</div>
                <div class="cycle-desc">Visibilidade orgânica, sem pagar por anúncio</div>
              </div>

              <div class="cycle-badge badge-green">Negócio</div>
            </div>

          </div>
        </div>

        <div class="z-texts">
          <div class="slide-title">Todo mundo<br><span class="hl">sai ganhando</span></div>
          <div class="slide-subtitle">Cada post, cada curtida, cada check-in move o comércio local. Você faz parte disso.</div>
        </div>

        <div class="z-footer">
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot active"></div>
          </div>
          <button class="btn-next cta">Fazer parte agora 🚀</button>
        </div>
      </div>
    </div>

  </div>

  <!-- Fluxo de navegação -->
  <div class="info-section">
    <div class="info-title">Fluxo de Navegação — Todas as Ações</div>

    <div class="nav-grid">

      <div class="nav-card">
        <div class="nav-slide">SLIDE 1</div>
        <div class="nav-action"><span class="a-trigger">Próximo</span><span class="a-arrow">→</span><span class="a-dest">Slide 2</span></div>
        <div class="nav-action"><span class="a-trigger">Swipe ←</span><span class="a-arrow">→</span><span class="a-dest">Slide 2</span></div>
        <div class="nav-action"><span class="a-trigger">Pular</span><span class="a-arrow">→</span><span class="a-dest">T03 Login</span></div>
        <div class="nav-action"><span class="a-trigger">Dots</span><span class="a-arrow">→</span><span class="a-dest">Slide tocado</span></div>
        <div class="nav-action"><span class="a-trigger">Android voltar</span><span class="a-arrow">→</span><span class="a-dest">Fecha app</span></div>

      </div>

      <div class="nav-card">
        <div class="nav-slide">SLIDE 2</div>
        <div class="nav-action"><span class="a-trigger">Próximo</span><span class="a-arrow">→</span><span class="a-dest">Slide 3</span></div>
        <div class="nav-action"><span class="a-trigger">Swipe ←</span><span class="a-arrow">→</span><span class="a-dest">Slide 3</span></div>
        <div class="nav-action"><span class="a-trigger">Swipe →</span><span class="a-arrow">→</span><span class="a-dest">Slide 1</span></div>
        <div class="nav-action"><span class="a-trigger">Pular</span><span class="a-arrow">→</span><span class="a-dest">T03 Login</span></div>
        <div class="nav-action"><span class="a-trigger">Android voltar</span><span class="a-arrow">→</span><span class="a-dest">Slide 1</span></div>

      </div>

      <div class="nav-card">
        <div class="nav-slide">SLIDE 3 — CTA</div>
        <div class="nav-action"><span class="a-trigger">Fazer parte agora</span><span class="a-arrow">→</span><span class="a-dest">T03 Login</span></div>
        <div class="nav-action"><span class="a-trigger">Swipe →</span><span class="a-arrow">→</span><span class="a-dest">Slide 2</span></div>
        <div class="nav-action"><span class="a-trigger">Pular</span><span class="a-arrow">→</span><span class="a-dest">T03 Login</span></div>
        <div class="nav-action"><span class="a-trigger">Swipe ← (bloqueado)</span><span class="a-arrow">—</span><span class="a-dest">último slide</span></div>
        <div class="nav-action"><span class="a-trigger">Qualquer saída</span><span class="a-arrow">→</span><span class="a-dest">salva flag = true</span></div>

      </div>

    </div>

    <div class="rules-row">
      <div class="rule-pill">Aparece APENAS no 1º acesso</div>
      <div class="rule-pill">Nunca mais após concluir</div>
      <div class="rule-pill">Sem header de navegação</div>
      <div class="rule-pill">Sem barra inferior</div>
      <div class="rule-pill">Flag onboardingCompleto = true ao sair</div>
      <div class="rule-pill">Ilustrações: Lottie JSON (fallback PNG)</div>
      <div class="rule-pill">Transição entre slides: push lateral</div>
    </div>
  </div>

</body>
</html>

