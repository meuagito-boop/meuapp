MEU AGITO
T03 — Login / Cadastro
Arquitetura de tela — Especificação completa v3
Porta de entrada do app — onde o usuário cria sua conta ou acessa a plataforma
1. Identificação da Tela
Código	T03
Nome	Login / Cadastro
Tipo	Tela de autenticação — entrada na plataforma
Fase do produto	Fase 1.0 — Presente desde o lançamento
Perfil de acesso	Usuários não autenticados — novos e recorrentes
Tela anterior	T02 Onboarding (novo usuário) ou T01 Splash (usuário não logado)
Sub-telas internas	T03b — Verificação SMS | T03c — Cadastro com e-mail | T03d — Recuperação de senha
Telas seguintes	T04 — Escolha de perfil (novo usuário) | T06 — Home (usuário existente)
Aparece quando	Toda vez que o app abre sem sessão ativa E o onboarding já foi concluído
Sem barra de navegação	Tela pré-autenticação — barra inferior NÃO aparece
Prioridade	Crítica — sem ela nenhum usuário acessa o produto

2. Objetivo da Tela
A T03 é a porta de entrada do Meu Agito. Ela precisa ser rápida, segura e sem fricção. O usuário deve conseguir entrar ou criar sua conta em menos de 30 segundos. Cada segundo a mais aqui é um usuário a menos convertido.

Objetivo 1 — Entrar com conta existente
Usuário já cadastrado acessa o app com o menor número de toques possível. Google e Apple são prioridade — um toque e já entrou.
Objetivo 2 — Criar nova conta
Novo usuário consegue se cadastrar de forma simples. O e-mail com senha é apresentado como alternativa, não como padrão.
Objetivo 3 — Transmitir segurança
O usuário está entregando seus dados. O design, os textos e a conformidade com a LGPD devem transmitir que o Meu Agito é seguro e respeita a privacidade.

3. Estrutura Geral da Tela
Fundo	#0D0D0D — preto profundo, padrão do app
Logo	Logo Meu Agito centralizado no topo — laranja sobre fundo dark. 140px largura.
Título	'Entre ou crie sua conta' — branco bold 24px — centralizado
Subtítulo	'Descubra o que está rolando na sua cidade' — cinza #999999
Ordem dos botões sociais	1º Google | 2º Apple (iOS apenas) | 3º Telefone
Divisor visual	Linha fina #333333 com texto centralizado 'ou continue com e-mail'
Formulário	Campo e-mail + campo senha com ícone olho + botão Entrar
Links auxiliares	'Esqueci minha senha' + 'Criar conta com e-mail'
Footer	Termos de uso e Política de privacidade — texto 9px, links sublinhados
Scroll	Tela com scroll quando teclado abre e empurra conteúdo para cima
Safe area	Conteúdo não fica atrás da barra de gestos nem do notch
Barra inferior	NÃO aparece — fluxo pré-autenticação

4. Métodos de Autenticação
4.1 Login com Google — Método principal
Posição	Primeiro botão — mais destacado
Visual	Fundo branco + ícone Google colorido + 'Continuar com Google'. Altura 52px. Radius 12px.
Plataforma	iOS e Android
Biblioteca	@react-native-google-signin/google-signin
Usuário novo	Cria conta automaticamente → T04 Escolha de perfil
Usuário existente	Valida token → salva sessão → T06 Home
Token salvo	JWT do backend — salvo no SecureStore
Falha	Toast: 'Não foi possível entrar com Google. Tente novamente.'
Cancelamento	Usuário fecha popup do Google → volta para T03 sem ação

4.2 Login com Apple — Método secundário
Posição	Segundo botão — abaixo do Google
Visual	Fundo branco + ícone Apple preto + 'Continuar com Apple'. Mesmo estilo do Google.
Plataforma	iOS e iPadOS APENAS — não exibido no Android
Obrigatoriedade	Obrigatório pela App Store — qualquer app com login social DEVE oferecer Apple Sign-In
Biblioteca	@invertase/react-native-apple-authentication
E-mail mascarado	Apple pode fornecer @privaterelay.appleid.com — app aceita e funciona normalmente
Usuário novo	Cria conta → T04 Escolha de perfil
Usuário existente	Valida → T06 Home

4.3 Login com número de telefone
Posição	Terceiro botão — fundo transparente com borda #2A2A2A
Ação	Abre T03b — verificação por SMS
Limite de SMS	3 SMS por número por hora (SEC-05 Rate Limiting)
Uso	Usuários sem Google/Apple ou que preferem não usar. Comum no Android.

4.4 Formulário de e-mail e senha
Campo e-mail	Input tipo e-mail. Placeholder: 'seu@email.com'. Autocomplete habilitado.
Campo senha	Input tipo senha. Ícone olho para mostrar/ocultar.
Botão Entrar	Laranja #E8640A — 100% largura — desabilitado (cinza) se campos vazios
Validação e-mail	Formato válido em tempo real. Borda vermelha + mensagem ao perder foco.
Validação senha	Mínimo 8 caracteres — verificado ao clicar Entrar, não em tempo real.
Loading	Spinner dentro do botão ao processar. Botão fica desabilitado durante loading.
Erro de credenciais	'E-mail ou senha incorretos' — mensagem genérica por segurança (não diz qual está errado)
Bloqueio	Após 5 tentativas erradas: bloqueio de 15 minutos com timer regressivo visível

5. Sub-telas Internas
T03b — Verificação por SMS
Acessada quando o usuário escolhe entrar com número de telefone.

Passo 1 — Telefone	Campo com seletor de código do país. Máscara: (XX) XXXXX-XXXX.
Botão enviar	'Enviar código' — laranja — validação do formato antes de enviar
Passo 2 — Código	6 campos individuais de 1 dígito. Auto-foco no próximo ao preencher. Auto-submit ao preencher o 6º.
Expiração	5 minutos. Timer regressivo visível: 'Código expira em 4:23'
Reenviar	Botão bloqueado por 60 segundos após envio. Timer visível: 'Reenviar em 0:45'
Auto-preenchimento	iOS e Android leem o SMS automaticamente e preenchem os 6 campos (OTP API)
Código errado	Borda vermelha nos campos + 'Código incorreto. Verifique o SMS.'
Código expirado	'Código expirado.' + botão 'Solicitar novo código' ativo imediatamente
Usuário novo	Após verificação → T04 Escolha de perfil
Usuário existente	Após verificação → T06 Home
Botão voltar	Retorna ao Passo 1 — não fecha a sub-tela

T03c — Cadastro com e-mail
Acessada quando usuário clica em 'Criar conta com e-mail'.

Campo nome completo	Obrigatório. Mínimo 3 caracteres. Autocapitalizar.
Campo e-mail	Obrigatório. Validação em tempo real. Verificação de duplicidade ao blur.
Campo senha	Obrigatório. Mínimo 8 caracteres. Ícone olho. Barra de força da senha.
Barra de força	Fraca (vermelho) | Média (amarelo) | Forte (verde). Aparece ao digitar.
Campo confirmar senha	Obrigatório. Validação em tempo real — erro se diferente.
Checkbox termos	OBRIGATÓRIO marcar — não pré-marcado. Link clicável para Termos e Política. (LGPD SEC-01)
Botão criar conta	Laranja — desabilitado até todos os campos válidos E checkbox marcado
E-mail duplicado	'Este e-mail já está cadastrado.' + link 'Fazer login' → T03 principal
Após criar conta	Envia e-mail de verificação → T04 Escolha de perfil
Verificação de e-mail	Banner no T04: 'Verifique seu e-mail para ativar a conta.' — não bloqueia o uso
Botão voltar	Retorna à T03 principal — descarta o formulário

T03d — Recuperação de senha
Acessada quando usuário clica em 'Esqueci minha senha'.

Campo e-mail	Pré-preenchido se o usuário já havia digitado na T03 principal
Botão enviar	'Enviar instruções' — laranja — envia e-mail com link de redefinição
Estado de sucesso	Ícone envelope + 'Enviamos as instruções para [email]. Verifique sua caixa de entrada.'
E-mail não encontrado	'Não encontramos nenhuma conta com este e-mail.'
Link no e-mail	Abre página web (não no app) de redefinição. Expira em 30 minutos.
Reenviar	Botão disponível após 60 segundos do primeiro envio
Botão voltar	Retorna à T03 principal

6. Fluxo Completo de Navegação
Estado/Sub-tela	Ação do usuário	Destino	Condição
T03 principal	Toca 'Continuar com Google'	T04 (novo) | T06 (existente)	OAuth Google
T03 principal	Toca 'Continuar com Apple' (iOS)	T04 (novo) | T06 (existente)	Só iOS/iPadOS
T03 principal	Toca 'Continuar com telefone'	T03b — Verificação SMS	Qualquer plataforma
T03 principal	Preenche e-mail + senha + Entrar	T04 (novo) | T06 (existente)	Valida no servidor
T03 principal	Toca 'Criar conta com e-mail'	T03c — Cadastro	Formulário completo
T03 principal	Toca 'Esqueci minha senha'	T03d — Recuperação	Abaixo do campo senha
T03 principal	Toca 'Termos de uso'	Modal WebView — Termos	Sem sair da tela
T03 principal	Toca 'Política de privacidade'	Modal WebView — Política	Sem sair da tela
T03b — SMS	Preenche telefone + Enviar código	T03b Passo 2 — OTP	Envia SMS via API
T03b — SMS	Preenche 6 dígitos corretos	T04 (novo) | T06 (existente)	Auto-submit no 6º dígito
T03b — SMS	Toca voltar	T03b Passo 1	Volta ao início do fluxo SMS
T03c — Cadastro	Preenche tudo + Criar conta	T04 — Escolha de perfil	Salva usuário + e-mail verif.
T03c — Cadastro	Toca voltar	T03 — Principal	Descarta formulário
T03d — Recuperação	Toca 'Enviar instruções'	T03d — Estado de sucesso	Envia e-mail com link
T03d — Recuperação	Toca voltar	T03 — Principal	Sem ação
Qualquer sub-tela	Botão físico Voltar (Android)	T03 — Principal	Comportamento padrão Android

7. Validações e Mensagens de Erro
7.1 Campo e-mail
Formato inválido	'Digite um e-mail válido.' — ao perder o foco (onBlur)
Campo vazio ao submeter	'O e-mail é obrigatório.' — borda vermelha
E-mail já cadastrado	'Este e-mail já possui uma conta.' + link 'Fazer login'
E-mail não encontrado	'Não encontramos uma conta com este e-mail.'

7.2 Campo senha
Menos de 8 caracteres	'A senha deve ter pelo menos 8 caracteres.'
Senha incorreta	'E-mail ou senha incorretos.' — genérica por segurança (SEC)
Confirmar senha diferente	'As senhas não coincidem.' — validação em tempo real
Senha fraca (cadastro)	Aviso visual — barra vermelha + 'Senha fraca — adicione números e símbolos'
Conta bloqueada	'Conta temporariamente bloqueada. Tente novamente em 15:00.' + timer

7.3 Erros de conexão
Sem internet	Toast no topo: 'Sem conexão com a internet. Verifique sua rede.'
Servidor indisponível	Toast: 'Serviço temporariamente indisponível. Tente novamente em instantes.'
Timeout (>10s)	Toast: 'A requisição demorou muito. Verifique sua conexão e tente novamente.'
Erro desconhecido	Toast: 'Ocorreu um erro inesperado.' + botão 'Reportar problema'

8. Todos os Elementos — Tabela Completa
Tipo	Elemento	Destino/Ação	Tela	Observações
VISUAL	Fundo #0D0D0D	Sem ação	T03 + sub-telas	Padrão do app
VISUAL	Logo Meu Agito	Sem ação	T03	140px. Laranja.
BOTÃO	Continuar com Google	OAuth → T04 ou T06	T03	Fundo branco. 1ª opção.
BOTÃO	Continuar com Apple	OAuth → T04 ou T06	T03 (iOS)	Obrigatório App Store.
BOTÃO	Continuar com telefone	T03b — SMS	T03	Borda #2A2A2A.
INPUT	Campo e-mail	Validação ao blur	T03 e T03c	Keyboard: e-mail.
INPUT	Campo senha	Mostrar/ocultar com ícone olho	T03 e T03c	Keyboard: padrão.
BOTÃO	Entrar	Valida → T04 ou T06	T03	Desabilitado se campos vazios.
LINK	Esqueci minha senha	T03d — Recuperação	T03	Abaixo do campo senha.
LINK	Criar conta com e-mail	T03c — Cadastro	T03	Abaixo do botão Entrar.
LINK	Termos de uso	Modal WebView	T03 footer	Não sai da tela.
LINK	Política de privacidade	Modal WebView	T03 footer	Não sai da tela.
BOTÃO	← Voltar	T03 principal	Sub-telas	Círculo #1A1A1A, 36px.
OTP	6 campos de dígito	Auto-submit no 6º	T03b	Auto-foco sequencial.
VISUAL	Timer regressivo OTP	Sem ação	T03b	'Expira em X:XX'
BOTÃO	Reenviar código	Reenvia SMS	T03b	Bloqueado 60s após envio.
VISUAL	Barra de força da senha	Sem ação	T03c	Fraca/Média/Forte.
CHECK	Checkbox Termos (LGPD)	Habilita botão Criar conta	T03c	Não pré-marcado. Obrigatório.
BOTÃO	Criar conta	T04 — Escolha de perfil	T03c	Desabilitado até tudo válido.
BOTÃO	Enviar instruções	Estado de sucesso	T03d	Laranja.
VISUAL	Estado de sucesso (envelope)	Sem ação	T03d	Ícone + mensagem + timer reenvio.

9. Regras de Negócio
RN-01 — Apple Sign-In obrigatório no iOS
Qualquer app que ofereça login social na App Store DEVE oferecer Apple Sign-In. Não exibir no Android.
RN-02 — Mensagem de erro genérica
Nunca informar qual campo está incorreto (e-mail ou senha). Sempre usar 'E-mail ou senha incorretos.' Isso evita enumeração de contas (SEC).
RN-03 — Bloqueio após 5 tentativas
Após 5 tentativas erradas de senha, a conta é bloqueada por 15 minutos. Timer regressivo visível na tela.
RN-04 — Checkbox de termos não pré-marcado
O checkbox de Termos de Uso e Política de Privacidade NUNCA é pré-marcado. O usuário deve marcar ativamente. Exigência da LGPD (SEC-01).
RN-05 — Rate limiting de SMS
Máximo 3 SMS por número por hora. Controlado no backend — nunca no app (SEC-05).
RN-06 — Sem barra de navegação inferior
A barra inferior não aparece em T03 nem em suas sub-telas. Faz parte do fluxo pré-autenticação.
RN-07 — Token salvo com segurança
JWT salvo no SecureStore (iOS) ou EncryptedSharedPreferences (Android). Nunca no AsyncStorage comum.
RN-08 — E-mail mascarado do Apple
O app deve aceitar e-mails do tipo @privaterelay.appleid.com sem exigir e-mail real do usuário.

Dev: Certificate Pinning obrigatório nesta tela (SEC-03). Todo o tráfego de autenticação passa pelo backend — nenhuma chave de API exposta no app (SEC-02).

10. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui T03 principal, T03b SMS (2 passos), T03c cadastro com barra de força de senha, T03d recuperação com estado de sucesso, e painéis de comportamento por plataforma e validações.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T03 Login / Cadastro</title>
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
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 100px; height: 24px;
    background: #1e1e1e;
    border-radius: 0 0 16px 16px;
    z-index: 20;
  }

  /* Screen content */
  .screen {
    position: absolute;

    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 44px 22px 24px;
    overflow: hidden;
  }

  /* Logo block */
  .logo-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-bottom: 18px;
    margin-top: 8px;
  }
  .logo-icon {
    width: 52px; height: 52px;
    background: #E8640A;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }
  .logo-name {
    font-size: 18px;
    font-weight: 900;
    color: #E8640A;
    letter-spacing: -0.5px;
  }
  .logo-sub {
    font-size: 12px;
    color: #555;
    text-align: center;
  }

  /* Social buttons */
  .social-btn {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    border: none;
    display: flex;

    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 8px;
    font-family: Arial, sans-serif;
  }
  .btn-google { background: white; color: #333; }
  .btn-apple  { background: white; color: #111; }
  .btn-phone  { background: transparent; border: 1px solid #2a2a2a; color: #ccc; }

  /* Divider */
  .divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
  }
  .div-line { flex: 1; height: 1px; background: #222; }
  .div-text { font-size: 11px; color: #444; white-space: nowrap; }

  /* Form inputs */
  .input-field {
    width: 100%;
    height: 44px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 0 14px;
    font-size: 13px;

    color: white;
    font-family: Arial, sans-serif;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
  .input-field.active { border-color: #E8640A; }
  .input-field.error  { border-color: #c0392b; }
  .input-placeholder { color: #444; font-size: 12px; }
  .input-text        { color: white; font-size: 12px; }
  .input-icon        { margin-left: auto; color: #555; font-size: 14px; }

  .error-msg {
    font-size: 10px;
    color: #e74c3c;
    margin-top: -6px;
    margin-bottom: 6px;
    padding-left: 4px;
  }

  /* Main button */
  .btn-main {
    width: 100%;
    height: 46px;
    background: #E8640A;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: Arial, sans-serif;
    margin-bottom: 10px;

  }
  .btn-main.disabled { background: #2a2a2a; color: #555; }

  /* Links */
  .link-row {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 2px;
  }
  .link { color: #E8640A; font-size: 11px; cursor: pointer; }
  .link-gray { color: #555; font-size: 11px; }

  /* Footer */
  .footer-terms {
    position: absolute;
    bottom: 16px;
    left: 22px; right: 22px;
    text-align: center;
    font-size: 9px;
    color: #333;
    line-height: 1.5;
  }
  .footer-terms span { color: #555; text-decoration: underline; }

  /* ── Sub-telas ── */
  .sub-screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 44px 22px 24px;
    background: #0D0D0D;
  }
  .sub-header {
    display: flex;
    align-items: center;
    gap: 10px;

    margin-bottom: 20px;
  }
  .back-btn {
    width: 32px; height: 32px;
    background: #1a1a1a;
    border-radius: 50%;
    border: 1px solid #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
  }
  .sub-title { font-size: 16px; font-weight: 700; color: white; }

  /* OTP fields */
  .otp-row {
    display: flex;
    gap: 7px;
    justify-content: center;
    margin: 16px 0;
  }
  .otp-field {
    width: 38px; height: 46px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: white;
  }
  .otp-field.filled { border-color: #E8640A; }

  .otp-field.active { border-color: #E8640A; box-shadow: 0 0 0 2px rgba(232,100,10,0.2); }

  /* Password strength */
  .pwd-strength {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }
  .pwd-bar {
    flex: 1; height: 3px;
    border-radius: 2px;
    background: #2a2a2a;
  }
  .pwd-bar.weak   { background: #e74c3c; }
  .pwd-bar.medium { background: #f39c12; }
  .pwd-bar.strong { background: #27ae60; }

  /* Info section below phones */
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
  .grid-2 {

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .card {
    background: #1a1a1a;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid #2a2a2a;
  }
  .card-title { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px; }
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid #222;
    font-size: 10px;
  }
  .card-row:last-child { border-bottom: none; }
  .card-row .label { color: #555; }
  .card-row .value { color: #ccc; font-weight: 700; }
  .card-row .arrow { color: #E8640A; font-weight: 700; }
</style>
</head>
<body>

  <div class="page-title">T03 — Login / Cadastro</div>

  <div class="page-sub">Tela principal + 3 sub-telas · Todos os métodos de autenticação</div>

  <div class="phones-row">

    <!-- ── TELA PRINCIPAL ── -->
    <div class="phone-wrap">
      <div class="phone-label">T03 — Principal</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="logo-block">
            <div class="logo-icon">📍</div>
            <div class="logo-name">Meu Agito</div>
            <div class="logo-sub">Entre ou crie sua conta</div>
          </div>

          <button class="social-btn btn-google">
            <span>G</span> Continuar com Google
          </button>
          <button class="social-btn btn-apple">
            <span>🍎</span> Continuar com Apple
          </button>
          <button class="social-btn btn-phone">

            <span>📱</span> Continuar com telefone
          </button>

          <div class="divider">
            <div class="div-line"></div>
            <div class="div-text">ou continue com e-mail</div>
            <div class="div-line"></div>
          </div>

          <div class="input-field active">
            <span class="input-text">joao@email.com</span>
          </div>
          <div class="input-field">
            <span class="input-placeholder">Sua senha</span>
            <span class="input-icon">👁</span>
          </div>

          <button class="btn-main">Entrar</button>

          <div class="link-row">
            <span class="link-gray">Esqueceu a senha?</span>
            <span class="link">Recuperar</span>
          </div>
          <div class="link-row" style="margin-top: 8px;">

            <span class="link-gray">Não tem conta?</span>
            <span class="link">Criar conta com e-mail</span>
          </div>
        </div>
        <div class="footer-terms">
          Ao continuar, você aceita os <span>Termos de Uso</span> e a <span>Política de Privacidade</span>
        </div>
      </div>
    </div>

    <!-- ── T03b — SMS ── -->
    <div class="phone-wrap">
      <div class="phone-label">T03b — Verificação SMS</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="sub-screen">
          <div class="sub-header">
            <div class="back-btn">←</div>
            <div class="sub-title">Verificar telefone</div>
          </div>

          <div style="font-size:12px; color:#666; margin-bottom:16px; line-height:1.5;">
            Digite seu número para receber o código de verificação.

          </div>

          <!-- Step 1: phone input -->
          <div style="font-size:10px; color:#E8640A; font-weight:700; margin-bottom:6px;">PASSO 1 — NÚMERO</div>
          <div class="input-field active" style="margin-bottom:12px;">
            <span style="color:#555; font-size:12px; margin-right:8px;">🇧🇷 +55</span>
            <span class="input-text">(11) 98765-4321</span>
          </div>
          <button class="btn-main" style="margin-bottom:20px;">Enviar código</button>

          <!-- Step 2: OTP -->
          <div style="font-size:10px; color:#E8640A; font-weight:700; margin-bottom:6px;">PASSO 2 — CÓDIGO</div>
          <div style="font-size:11px; color:#555; margin-bottom:10px;">Enviamos 6 dígitos para (11) 98765-4321</div>
          <div class="otp-row">
            <div class="otp-field filled">3</div>

            <div class="otp-field filled">7</div>
            <div class="otp-field filled">4</div>
            <div class="otp-field active"></div>
            <div class="otp-field"></div>
            <div class="otp-field"></div>
          </div>
          <div style="text-align:center; font-size:11px; color:#555; margin-bottom:12px;">Código expira em <span style="color:#E8640A;">4:23</span></div>
          <div style="text-align:center; font-size:11px; color:#444;">Reenviar em <span style="color:#666;">0:45</span></div>
        </div>
      </div>
    </div>

    <!-- ── T03c — Cadastro e-mail ── -->
    <div class="phone-wrap">
      <div class="phone-label">T03c — Criar conta</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="sub-screen">
          <div class="sub-header">

            <div class="back-btn">←</div>
            <div class="sub-title">Criar conta</div>
          </div>

          <div class="input-field">
            <span class="input-text">João Silva</span>
          </div>
          <div class="input-field active">
            <span class="input-text">joao@email.com</span>
          </div>
          <div class="input-field error">
            <span class="input-text">••••••</span>
            <span class="input-icon">👁</span>
          </div>

          <!-- Password strength -->
          <div class="pwd-strength">
            <div class="pwd-bar weak"></div>
            <div class="pwd-bar"></div>
            <div class="pwd-bar"></div>
          </div>
          <div style="font-size:10px; color:#e74c3c; margin-bottom:8px;">Senha fraca — adicione números e símbolos</div>


          <div class="input-field">
            <span class="input-placeholder">Confirmar senha</span>
          </div>

          <!-- Checkbox termos -->
          <div style="display:flex; align-items:flex-start; gap:8px; margin: 8px 0 12px;">
            <div style="width:16px; height:16px; border:1px solid #E8640A; border-radius:4px; background:rgba(232,100,10,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px;">
              <span style="color:#E8640A; font-size:10px; font-weight:700;">✓</span>
            </div>
            <span style="font-size:10px; color:#555; line-height:1.5;">Li e aceito os <span style="color:#E8640A; text-decoration:underline;">Termos de Uso</span> e a <span style="color:#E8640A; text-decoration:underline;">Política de Privacidade</span></span>

          </div>

          <button class="btn-main disabled">Criar conta</button>
          <div style="font-size:10px; color:#333; text-align:center; margin-top:6px;">Preencha todos os campos para continuar</div>
        </div>
      </div>
    </div>

    <!-- ── T03d — Recuperação de senha ── -->
    <div class="phone-wrap">
      <div class="phone-label">T03d — Recuperar senha</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="sub-screen">
          <div class="sub-header">
            <div class="back-btn">←</div>
            <div class="sub-title">Recuperar senha</div>
          </div>

          <div style="font-size:12px; color:#666; margin-bottom:20px; line-height:1.6;">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.

          </div>

          <div class="input-field active" style="margin-bottom:16px;">
            <span class="input-text">joao@email.com</span>
          </div>

          <button class="btn-main" style="margin-bottom:20px;">Enviar instruções</button>

          <!-- Estado de sucesso -->
          <div style="background:#0d1a0d; border:1px solid #1a3a1a; border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:24px; margin-bottom:8px;">✉️</div>
            <div style="font-size:13px; font-weight:700; color:white; margin-bottom:6px;">E-mail enviado!</div>
            <div style="font-size:11px; color:#555; line-height:1.5;">Enviamos as instruções para <span style="color:#ccc;">joao@email.com</span>. Verifique sua caixa de entrada.</div>
            <div style="margin-top:12px; font-size:10px; color:#333;">Reenviar e-mail em <span style="color:#555;">0:53</span></div>

          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Info sections -->
  <div class="info-section">
    <div class="info-title">Métodos de Autenticação — Comportamento por Plataforma</div>
    <div class="grid-3">
      <div class="card">
        <div class="card-title">Google Sign-In</div>
        <div class="card-row"><span class="label">Plataforma</span><span class="value">iOS + Android</span></div>
        <div class="card-row"><span class="label">Novo usuário</span><span class="arrow">→ T04</span></div>
        <div class="card-row"><span class="label">Existente</span><span class="arrow">→ T06 Home</span></div>
        <div class="card-row"><span class="label">Recebe</span><span class="value">Nome, e-mail, foto</span></div>
        <div class="card-row"><span class="label">Prioridade</span><span class="value">1ª opção</span></div>

      </div>
      <div class="card">
        <div class="card-title">Apple Sign-In</div>
        <div class="card-row"><span class="label">Plataforma</span><span class="value">iOS apenas</span></div>
        <div class="card-row"><span class="label">Novo usuário</span><span class="arrow">→ T04</span></div>
        <div class="card-row"><span class="label">Existente</span><span class="arrow">→ T06 Home</span></div>
        <div class="card-row"><span class="label">E-mail</span><span class="value">Pode ser mascarado</span></div>
        <div class="card-row"><span class="label">Obrigatório iOS</span><span class="value">Sim (App Store)</span></div>
      </div>
      <div class="card">
        <div class="card-title">SMS / Telefone</div>
        <div class="card-row"><span class="label">Plataforma</span><span class="value">iOS + Android</span></div>

        <div class="card-row"><span class="label">Novo usuário</span><span class="arrow">→ T04</span></div>
        <div class="card-row"><span class="label">Existente</span><span class="arrow">→ T06 Home</span></div>
        <div class="card-row"><span class="label">SMS limite</span><span class="value">3/número/hora</span></div>
        <div class="card-row"><span class="label">Código expira</span><span class="value">5 minutos</span></div>
      </div>
    </div>
  </div>

  <div class="info-section" style="margin-top:16px;">
    <div class="info-title">Validações e Bloqueios</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title">Bloqueio por tentativas — Login e-mail</div>
        <div class="card-row"><span class="label">Limite</span><span class="value">5 tentativas erradas</span></div>

        <div class="card-row"><span class="label">Bloqueio</span><span class="value">15 minutos</span></div>
        <div class="card-row"><span class="label">Exibe</span><span class="value">Timer regressivo visível</span></div>
        <div class="card-row"><span class="label">Mensagem</span><span class="value">E-mail ou senha incorretos</span></div>
        <div class="card-row"><span class="label">Nota segurança</span><span class="value">Mensagem genérica (SEC)</span></div>
      </div>
      <div class="card">
        <div class="card-title">Validações do cadastro</div>
        <div class="card-row"><span class="label">Senha mínima</span><span class="value">8 caracteres</span></div>
        <div class="card-row"><span class="label">Força da senha</span><span class="value">Fraca / Média / Forte</span></div>

        <div class="card-row"><span class="label">Confirmar senha</span><span class="value">Validação em tempo real</span></div>
        <div class="card-row"><span class="label">Checkbox termos</span><span class="value">Obrigatório (LGPD)</span></div>
        <div class="card-row"><span class="label">Botão ativo</span><span class="value">Só com tudo válido</span></div>
      </div>
    </div>
  </div>

</body>
</html>

