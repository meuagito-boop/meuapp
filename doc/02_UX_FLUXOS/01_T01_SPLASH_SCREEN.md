MEU AGITO
T01 — Splash Screen
Arquitetura de tela — Especificação completa v3
Primeira tela que o usuário vê ao abrir o app — define toda a experiência inicial
1. Identificação da Tela
Código	T01
Nome	Splash Screen
Tipo	Tela de carregamento / Inicialização
Fase do produto	Fase 1.0 — Presente desde o lançamento
Perfil de acesso	Todos — cliente, comerciante, usuário não logado
Tela anterior	Nenhuma — é a primeira tela do app
Telas seguintes	T02 Onboarding | T03 Login | T06 Home — ver lógica condicional na seção 5
Duração na tela	2 segundos fixos. Não há interação do usuário.
Prioridade	Crítica — executada toda vez que o app é aberto

2. Objetivo da Tela
A Splash Screen tem três funções simultâneas que acontecem nos 2 segundos em que ela está visível:

Função 1 — Identidade visual
Apresentar a marca Meu Agito ao usuário com impacto visual. Logo centralizado, fundo dark, laranja vibrante. Primeiro contato emocional com o produto.
Função 2 — Verificação de sessão
Enquanto a animação acontece, o app consulta silenciosamente o token de sessão salvo no dispositivo para saber se o usuário já está logado ou não. Isso determina para qual tela o usuário será redirecionado.
Função 3 — Permissão de localização
Solicitar permissão de acesso à localização do dispositivo — SOMENTE se nunca foi solicitada antes. Não repete a solicitação se já foi concedida ou negada em sessões anteriores.

3. Layout e Elementos Visuais
A tela é 100% visual, sem elementos interativos. O usuário não toca em nada — apenas vê.

3.1 Estrutura visual
Fundo	#0D0D0D — preto profundo, cor padrão do app
Posicionamento logo	Centro absoluto da tela — horizontal e vertical
Logo	Logotipo 'Meu Agito' na versão completa (símbolo + texto)
Cor do logo	#E8640A (laranja principal) sobre fundo dark
Tamanho do logo	60% da largura da tela — visível em todos os tamanhos de celular
Tagline	Texto abaixo do logo: 'Descubra o que está rolando' — cor branca, tamanho pequeno
Barra de status	Ícones do celular (hora, bateria, sinal) em branco — sem barra colorida
Indicador de carga	Barra fina laranja animada no rodapé — indica que o app está carregando

3.2 Animação de entrada
Efeito do logo	Fade in + leve escala: começa em 85% do tamanho e cresce para 100%
Duração do fade in	0.6 segundos
Efeito da tagline	Fade in com delay de 0.3s após o logo aparecer
Logo permanece	1.1 segundo estático após aparecer completamente
Transição de saída	Fade out suave de toda a tela (0.3s) antes de ir para próxima tela
Total na tela	2.0 segundos exatos (0.6s entrada + 1.1s estático + 0.3s saída)
Biblioteca sugerida	React Native Animated API ou Lottie para animação do logo
Reduzir movimento	Se ativo no sistema: logo aparece instantaneamente, sem fade. Timer de 2s mantido.

4. Lógica Condicional — O que acontece nos bastidores
Durante os 2 segundos da splash, o app executa três verificações silenciosas em paralelo.

4.1 Verificação 1 — Sessão ativa
O que verifica	Token de autenticação salvo localmente (AsyncStorage / SecureStore)
Quando é válido	Token existe E não está expirado
Quando é inválido	Token não existe, expirado ou corrompido
Resultado válido	Usuário está logado → vai para T06 Home
Resultado inválido	Usuário não está logado → vai para T02 ou T03
Como sabe se é 1º acesso	Flag 'onboardingCompleto' local. Se false → T02. Se true → T03.

4.2 Verificação 2 — Permissão de localização
O que verifica	Status da permissão de localização no sistema operacional
Status: concedida	GPS já autorizado → app usa localização real silenciosamente
Status: negada	Usuário negou antes → app usa cidade padrão. NÃO repete o popup.
Status: não decidido	Nunca foi perguntado → mostra o popup do sistema pedindo permissão
Quando aparece o popup	Após 0.5s do app abrir — SOMENTE se nunca foi solicitado antes
Se o usuário negar	App continua normalmente. Feed usa cidade configurada no T05a ou manual.
iOS	Texto: 'O Meu Agito quer usar sua localização para mostrar o que está rolando perto de você'
Android	Popup padrão: Sempre / Só enquanto uso / Negar

4.3 Verificação 3 — Conectividade
O que verifica	Se o dispositivo tem conexão com internet (WiFi ou dados móveis)
Com conexão	Prossegue normalmente para a tela correta
Sem conexão	Exibe estado de erro T01-ERR1 na própria tela splash
Conexão instável	Tenta por 3 segundos. Se não conseguir, exibe aviso com botão 'Tentar novamente'

5. Fluxo Completo de Decisão
Passo	O que acontece	Condição	Resultado
01	App é aberto pelo usuário	—	Início sempre aqui
02	Animação de entrada do logo inicia	Fade in 0.6s + estático 1.1s	Visual em execução
03	Verificações paralelas em background	Sessão + Localização + Conectividade	Simultâneas
04	Verifica conectividade	Sem internet	→ T01-ERR1 na splash
05	Verifica permissão de localização	Se NUNCA solicitado antes	Popup do sistema
06	Verifica token de sessão	Token válido / inválido	Define destino
07a	Token válido	Logado + onboarding ok	→ T06 Home
07b	Token inválido + 1º acesso	onboardingCompleto = false	→ T02 Onboarding
07c	Token inválido + já viu onboarding	onboardingCompleto = true	→ T03 Login
08	Animação de saída (fade out 0.3s)	—	Transição para destino

6. Estados de Erro e Casos Especiais
6.1 Sem conexão com internet (T01-ERR1)
Quando aparece	Dispositivo sem WiFi e sem dados móveis ao abrir o app
O que exibe	Ícone wifi com X + Título: 'Sem conexão' + 'Verifique sua internet e tente novamente'
Botão disponível	'Tentar novamente' — cor laranja — reinicia todas as verificações
Fundo	Mantém o mesmo fundo dark da splash — não troca de tela
Auto-retry	Verifica conexão automaticamente a cada 5 segundos em background
Quando conexão volta	Animação de sucesso rápida e redireciona normalmente

6.2 Erro de servidor (T01-ERR2)
Quando aparece	Tem internet mas o servidor do Meu Agito está indisponível
O que exibe	Ícone nuvem com X + 'Serviço temporariamente indisponível'
Botões	'Tentar novamente' + 'Continuar sem internet' (acessa cache local se disponível)
Timeout	Requisição ao servidor: timeout de 8 segundos

6.3 Atualização obrigatória (T01-ERR3)
Quando aparece	Versão do app instalada é menor que a versão mínima exigida pelo servidor
O que exibe	Ícone de atualização + 'Atualização necessária' + texto explicativo
Botão disponível	'Atualizar agora' — abre App Store ou Google Play
Pode fechar?	Não — bloqueia o uso do app até atualizar
Onde é configurado	Servidor — parâmetro 'versaoMinima' retornado na verificação inicial

7. Todos os Elementos — Tabela Completa
Tipo	Elemento / Nome	Destino / Ação	Observações técnicas
VISUAL	Fundo dark (#0D0D0D)	Sem ação — decorativo	Cor sólida. 100% da tela.
ANIMAÇÃO	Logo — fade in + escala	Sem ação — animado	Fade 0.6s + estático 1.1s + fade out 0.3s
VISUAL	Tagline 'Descubra o que está rolando'	Sem ação — decorativo	Aparece 0.3s após logo. Cor branca.
VISUAL	Barra de loading laranja	Sem ação — feedback visual	Barra fina animada no rodapé.
SISTEMA	Solicitação de permissão de localização	Popup nativo iOS/Android	Só se NUNCA solicitado antes.
CONDICIONAL	Verificação de token de sessão	Válido → T06 / Inválido → T02 ou T03	AsyncStorage / SecureStore.
CONDICIONAL	Verificação de onboarding completo	false → T02 / true → T03	Flag 'onboardingCompleto' local.
CONDICIONAL	Verificação de conectividade	Sem internet → T01-ERR1	Antes de qualquer requisição ao servidor.
CONDICIONAL	Verificação de versão do app	Desatualizado → T01-ERR3	Parâmetro 'versaoMinima' do servidor.
ERRO	T01-ERR1 — Sem internet	Botão 'Tentar novamente'	Auto-retry 5s. Fundo dark mantido.
ERRO	T01-ERR2 — Servidor indisponível	Tentar novamente / Offline	Timeout 8s.
ERRO	T01-ERR3 — Atualização obrigatória	Botão 'Atualizar agora' → loja	Bloqueia uso. Não pode fechar.

8. Especificações Técnicas para o Desenvolvedor
8.1 Dados necessários
Token de sessão	SecureStore (iOS) ou EncryptedSharedPreferences (Android)
Flag onboarding	AsyncStorage — chave: 'meuagito_onboarding_completo' — valor: 'true' ou 'false'
Permissão localização	expo-location | CLLocationManager (iOS) | FusedLocationClient (Android)
Verificação de versão	GET /api/config → { versaoMinima: '1.0.0', versaoAtual: '1.2.3' }
Verificação de rede	NetInfo (React Native) | ConnectivityManager (Android)

8.2 Variáveis de configuração
SPLASH_DURATION	2000ms — duração total
FADE_IN_DURATION	600ms — animação de entrada do logo
FADE_OUT_DURATION	300ms — animação de saída
STATIC_DURATION	1100ms — tempo estático (2000 - 600 - 300)
SERVER_TIMEOUT	8000ms — timeout máximo verificação de versão
LOCATION_DELAY	500ms — delay antes de pedir permissão de localização
AUTO_RETRY_INTERVAL	5000ms — intervalo auto-retry sem internet

8.3 Plataformas e comportamentos específicos
iOS — Status bar	UIStatusBarStyle.lightContent — ícones brancos sobre fundo dark
Android — Status bar	WindowInsetsController: APPEARANCE_LIGHT_STATUS_BARS = false
iOS — Safe area	Respeita notch e Dynamic Island — logo não fica atrás do notch
Android — Edge to edge	Tela estende para baixo da barra de navegação — fundo dark preenche tudo
Tablets	Logo com tamanho máximo de 400px — não escala 60% em tela grande
Modo escuro do sistema	Irrelevante — splash sempre usa fundo dark independente do sistema
Reduzir movimento	Se ativo: logo aparece instantaneamente, sem fade. Timer de 2s mantido.

9. Assets Necessários
Logo principal	meu_agito_logo.svg + meu_agito_logo.png (2x e 3x) — laranja sobre fundo transparente
Logo versão splash	meu_agito_splash.lottie — animação Lottie (opcional, preferível ao CSS)
Ícone do app	app_icon.png — 1024x1024px para App Store + 512x512px para Google Play
Splash nativa iOS	LaunchScreen.storyboard — tela nativa enquanto o JS carrega
Splash nativa Android	launch_background.xml — drawable antes do React Native inicializar
Cor de fundo nativa	#0D0D0D — deve ser igual ao fundo da splash JS para transição imperceptível

10. Regras de Negócio
RN-01 — Não pode ser pulada
A splash sempre executa por 2 segundos completos. O usuário não pode fechar ou pular.
RN-02 — Sempre executa ao abrir
Toda vez que o usuário abre o app — mesmo logado — a splash é exibida e executa as verificações.
RN-03 — Sem cache de tela
A splash nunca exibe conteúdo do feed em background nem pré-carrega imagens visíveis.
RN-04 — Localização não é obrigatória
Se o usuário negar o GPS, o app continua normalmente. Feed usará cidade configurada em T05a.
RN-05 — GPS solicitado apenas uma vez
O popup de permissão de GPS aparece SOMENTE se nunca foi solicitado. Não repete a solicitação.
RN-06 — Raio padrão pós-permissão
Se GPS concedido na splash, raio padrão de 5km é ativado automaticamente — sem configuração.

Dev: Implementar com React Navigation. Splash é um componente que roda verificações e faz navigate() para o destino correto ao concluir.

11. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui o estado principal, os 3 estados de erro, o diagrama de destinos e a timeline de animação.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T01 Splash Screen</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #1a1a2e;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: Arial, sans-serif;
  }

  /* Phone frame */
  .phone {
    width: 375px;
    height: 812px;
    background: #0D0D0D;
    border-radius: 50px;
    border: 8px solid #2a2a2a;
    position: relative;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.8);
  }

  /* Notch */
  .notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 130px;
    height: 30px;

    background: #2a2a2a;
    border-radius: 0 0 20px 20px;
    z-index: 10;
  }

  /* Status bar */
  .status-bar {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    padding: 0 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 5;
  }
  .status-time {
    color: white;
    font-size: 13px;
    font-weight: 600;
  }
  .status-icons {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .status-icons span {
    color: white;
    font-size: 12px;
  }

  /* Main splash content */
  .splash-content {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  /* Logo block */
  .logo-wrap {

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    animation: fadeScaleIn 0.6s ease-out forwards;
  }

  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }

  .logo-icon {
    width: 80px;
    height: 80px;
    background: #E8640A;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 40px rgba(232,100,10,0.5);
  }
  .logo-icon svg {
    width: 48px;
    height: 48px;
    fill: white;
  }

  .logo-wordmark {
    font-size: 32px;
    font-weight: 900;
    color: #E8640A;
    letter-spacing: -1px;
  }

  .tagline {
    font-size: 15px;
    color: rgba(255,255,255,0.65);
    font-weight: 400;
    animation: fadeIn 0.6s ease-out 0.3s both;

    letter-spacing: 0.3px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Loading spinner */
  .spinner-wrap {
    position: absolute;
    bottom: 60px;
    left: 0; right: 0;
    display: flex;
    justify-content: center;
  }
  .spinner {
    width: 28px;
    height: 3px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }
  .spinner::after {
    content: '';
    position: absolute;
    left: -100%;
    top: 0;
    width: 60%;
    height: 100%;
    background: #E8640A;
    border-radius: 2px;
    animation: slide 1.2s ease-in-out infinite;
  }
  @keyframes slide {
    0%   { left: -60%; }
    100% { left: 100%; }
  }

  /* --- Error states panel (shown below phone) --- */
  .states-panel {
    margin-top: 40px;

    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .state-phone {
    width: 200px;
    height: 340px;
    background: #0D0D0D;
    border-radius: 28px;
    border: 5px solid #2a2a2a;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 12px;
  }
  .state-label {
    position: absolute;
    bottom: -28px;
    left: 0; right: 0;
    text-align: center;
    font-size: 11px;
    color: #888;
    font-weight: 600;
  }
  .err-icon {
    font-size: 36px;
  }
  .err-title {
    font-size: 14px;
    font-weight: 700;
    color: white;
    text-align: center;
  }
  .err-sub {
    font-size: 11px;
    color: #888;
    text-align: center;
    line-height: 1.5;

  }
  .err-btn {
    background: #E8640A;
    color: white;
    font-size: 12px;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    width: 100%;
    cursor: pointer;
  }
  .err-btn.outline {
    background: transparent;
    border: 1px solid #444;
    color: #888;
  }

  .page-title {
    color: #E8640A;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 8px;
    text-align: center;
  }
  .page-sub {
    color: #555;
    font-size: 11px;
    text-align: center;
    margin-bottom: 30px;
  }
</style>
</head>
<body>

<div style="display:flex; flex-direction:column; align-items:center; padding: 40px 20px;">

  <div class="page-title">T01 — Splash Screen</div>
  <div class="page-sub">Estado principal · 2 segundos · iOS e Android</div>


  <!-- Main phone: splash estado principal -->
  <div class="phone">
    <div class="notch"></div>
    <div class="status-bar">
      <span class="status-time">9:41</span>
      <div class="status-icons">
        <span>●●●</span>
        <span>WiFi</span>
        <span>🔋</span>
      </div>
    </div>

    <div class="splash-content">
      <div class="logo-wrap">
        <!-- Logo icon -->
        <div class="logo-icon">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="20" r="10" fill="white"/>
            <path d="M24 30 L18 42 L24 38 L30 42 Z" fill="white"/>
            <circle cx="24" cy="20" r="5" fill="#E8640A"/>
          </svg>
        </div>
        <div class="logo-wordmark">Meu Agito</div>
        <div class="tagline">Descubra o que está rolando</div>

      </div>
    </div>

    <div class="spinner-wrap">
      <div class="spinner"></div>
    </div>
  </div>

  <!-- Error states -->
  <div style="margin-top: 60px;">
    <div class="page-title">Estados de Erro</div>
    <div class="page-sub">Exibidos na própria tela — fundo dark mantido</div>
  </div>

  <div class="states-panel">

    <!-- ERR1: Sem internet -->
    <div style="position:relative; margin-bottom: 40px;">
      <div class="state-phone">
        <div class="err-icon">📡</div>
        <div class="err-title">Sem conexão</div>
        <div class="err-sub">Verifique sua internet e tente novamente</div>
        <button class="err-btn">Tentar novamente</button>
        <div style="font-size:10px; color:#555; text-align:center;">Auto-retry a cada 5s</div>
      </div>
      <div class="state-label">T01-ERR1 · Sem internet</div>

    </div>

    <!-- ERR2: Servidor indisponível -->
    <div style="position:relative; margin-bottom: 40px;">
      <div class="state-phone">
        <div class="err-icon">☁️</div>
        <div class="err-title">Serviço indisponível</div>
        <div class="err-sub">Temporariamente fora do ar. Tente em instantes.</div>
        <button class="err-btn">Tentar novamente</button>
        <button class="err-btn outline" style="margin-top:6px;">Continuar offline</button>
      </div>
      <div class="state-label">T01-ERR2 · Servidor</div>
    </div>

    <!-- ERR3: Atualização obrigatória -->
    <div style="position:relative; margin-bottom: 40px;">
      <div class="state-phone">
        <div class="err-icon">⬆️</div>
        <div class="err-title">Atualização necessária</div>
        <div class="err-sub">Esta versão não é mais suportada. Atualize para continuar.</div>

        <button class="err-btn">Atualizar agora</button>
        <div style="font-size:10px; color:#555; text-align:center; margin-top:6px;">Não pode fechar</div>
      </div>
      <div class="state-label">T01-ERR3 · Atualização</div>
    </div>

  </div>

  <!-- Flow decision diagram -->
  <div style="margin-top: 20px; background: #111; border-radius: 16px; padding: 24px; max-width: 700px; width: 100%;">
    <div class="page-title" style="margin-bottom:16px;">Lógica Condicional — Destinos</div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">

      <div style="background:#1a1a1a; border: 1px solid #2a2a2a; border-radius:12px; padding:14px 18px; text-align:center; min-width:150px;">
        <div style="font-size:11px; color:#888; margin-bottom:6px;">Token válido</div>

        <div style="color:#E8640A; font-weight:700; font-size:13px;">→ T06 Home</div>
      </div>

      <div style="background:#1a1a1a; border: 1px solid #2a2a2a; border-radius:12px; padding:14px 18px; text-align:center; min-width:150px;">
        <div style="font-size:11px; color:#888; margin-bottom:6px;">Sem token + 1º acesso</div>
        <div style="color:#E8640A; font-weight:700; font-size:13px;">→ T02 Onboarding</div>
      </div>

      <div style="background:#1a1a1a; border: 1px solid #2a2a2a; border-radius:12px; padding:14px 18px; text-align:center; min-width:150px;">
        <div style="font-size:11px; color:#888; margin-bottom:6px;">Sem token + já viu onboarding</div>
        <div style="color:#E8640A; font-weight:700; font-size:13px;">→ T03 Login</div>
      </div>

      <div style="background:#1a1a1a; border: 1px solid #2a2a2a; border-radius:12px; padding:14px 18px; text-align:center; min-width:150px;">

        <div style="font-size:11px; color:#888; margin-bottom:6px;">GPS não decidido ainda</div>
        <div style="color:#E8640A; font-weight:700; font-size:13px;">→ Popup do sistema</div>
        <div style="font-size:10px; color:#555; margin-top:4px;">Só se NUNCA solicitado</div>
      </div>

    </div>
  </div>

  <!-- Timing -->
  <div style="margin-top: 20px; background: #111; border-radius: 16px; padding: 20px; max-width: 700px; width:100%;">
    <div class="page-title" style="margin-bottom:14px;">Timeline — 2 segundos totais</div>
    <div style="display:flex; align-items:center; gap:0; height: 40px; border-radius: 8px; overflow:hidden;">
      <div style="flex:0.6; background:#E8640A; display:flex; align-items:center; justify-content:center; font-size:10px; color:white; font-weight:700;">Fade in<br>0.6s</div>

      <div style="flex:1.1; background:#c45508; display:flex; align-items:center; justify-content:center; font-size:10px; color:white; font-weight:700;">Estático<br>1.1s</div>
      <div style="flex:0.3; background:#8c3e06; display:flex; align-items:center; justify-content:center; font-size:10px; color:white; font-weight:700;">Fade<br>out<br>0.3s</div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:10px; color:#555;">
      <span>0s</span><span>0.6s</span><span>1.7s</span><span>2.0s</span>
    </div>
  </div>

</div>
</body>
</html>

