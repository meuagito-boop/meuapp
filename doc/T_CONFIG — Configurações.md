MEU AGITO
T_CONFIG — Configurações
Arquitetura de tela — Especificação completa v1
17 telas · Todos os destinos implementados · Posição 5 da barra ⚙
1. Identificação
Código	T_CONFIG
Nome	Configurações — Hub de controle do usuário
Tipo	Tela principal com grupos de itens + telas filhas para cada configuração
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0 — todas as seções exceto Pagamentos (1.2+)
Como é acessado	Posição 5 da barra de navegação inferior — ícone ⚙ Config
Sem perfil no topo	A tela começa direto nas seções — sem foto ou nome do usuário
Total de telas	17 telas documentadas neste arquivo
Telas filhas	Conta · Contas vinculadas · Desativar conta · Excluir conta · Raio de busca · Notificações · Privacidade · Bloqueados · Segurança · Alterar senha · 2FA · Histórico de acessos · Idioma · Sobre · Termos (WebView) · Suporte

2. Estrutura da Tela Principal
A tela principal lista todos os grupos de configuração. Sem perfil no topo — o usuário acessa direto as seções. Scroll vertical simples.

#	Grupo	Itens	Fase
1	Conta	Minha conta · Contas vinculadas	1.0
2	Localidade	Cidade atual · Raio de busca · Permissão de GPS	1.0
3	Preferências	Notificações · Privacidade · Segurança · Idioma · Pagamentos	1.0 (Pagamentos: 1.2+)
4	Sobre	Sobre o Meu Agito	1.0
5	Zona de perigo	Desativar conta · Excluir conta	1.0 — itens em vermelho

3. Mapa de Todas as Telas
#	Nome	Acesso via	Fase	Descrição resumida
01	Tela principal	Barra ⚙	1.0	Hub com todos os grupos
02	Minha conta	Conta → Minha conta	1.0	Foto, nome, username, bio, e-mail, telefone
03	Contas vinculadas	Conta → Vinculadas	1.0	Google e Apple — conectar/desconectar
04	Desativar conta	Zona de perigo	1.0	Oculta perfil temporariamente — reativa ao logar
05	Excluir conta	Zona de perigo	1.0	Exclusão permanente — campo 'EXCLUIR' + senha
06	Raio de busca	Localidade → Raio	1.0	500m / 1km / 2km / 5km / 10km / 20km / Sem limite
07	Notificações	Preferências	1.0	Toggles por tipo. Segurança bloqueado.
08	Privacidade	Preferências	1.0	Conta pública, mensagens, check-ins, bloqueados
09	Usuários bloqueados	Privacidade	1.0	Lista com botão Desbloquear por item
10	Segurança	Preferências	1.0	Senha, 2FA, dispositivos, histórico, alertas
11	Alterar senha	Segurança	1.0	Senha atual + nova + barra de força + confirmar
12	2FA	Segurança	1.0	SMS / App autenticador / E-mail + códigos recuperação
13	Histórico de acessos	Segurança	1.0	Lista de dispositivos com alerta de acesso suspeito
14	Idioma	Preferências	1.0	PT-BR ativo. EN e ES em breve.
15	Sobre o Meu Agito	Sobre	1.0	Logo, versão, legal, suporte
16	Termos/Política (WebView)	Sobre → itens legais	1.0	Conteúdo renderizado em WebView interno + compartilhar
17	Suporte	Sobre	1.0	Chat, e-mail, tópicos frequentes, avaliar app

4. Detalhamento das Telas Filhas
4.1 Minha Conta
Foto de perfil	Avatar circular 68px. Borda 2px laranja. Toque → modal câmera/galeria com editor de recorte.
Campos editáveis	Nome · Username · Bio (textarea) · E-mail · Telefone
Botão Salvar	No header à direita. Ativado quando há alteração. Desabilitado sem mudanças.
Validação	Username: verificação em tempo real de disponibilidade. E-mail: formato válido. Telefone: máscara.

4.2 Contas Vinculadas
Google	Se conectado: e-mail + botão 'Desconectar'. Se não: botão 'Conectar' laranja.
Apple	Idem. Apple Sign-In disponível apenas em iOS.
Aviso	Ao tentar desconectar: aviso 'Certifique-se de ter senha definida antes de desconectar'.

4.3 Desativar Conta
O que acontece	Perfil oculto para outros usuários. Dados e posts preservados. Saída automática do app.
Reativação	Basta fazer login novamente.
Confirmação	Campo de senha obrigatório antes de executar. Botão vermelho 'Desativar minha conta'.

4.4 Excluir Conta
Irreversível	Exclui TUDO: perfil, posts, favoritos, histórico, agendamentos, reservas.
Dupla confirmação	Campo de texto onde o usuário deve digitar a palavra EXCLUIR + campo de senha.
Conformidade	Texto informando conformidade com a LGPD antes do botão de confirmação.
Botão	Vermelho. Label: 'Excluir minha conta definitivamente'.

4.5 Raio de Busca
Opções	500m · 1km · 2km · 5km (padrão) · 10km · 20km · Sem limite
Padrão	5km — indicado como 'Padrão recomendado'.
Seleção	Radio buttons — seleção única. Salva imediatamente ao tocar. Sem botão Salvar.

4.6 Notificações
Toggles	Um toggle por tipo de notificação. Salva ao alternar — sem botão Salvar.
Segurança bloqueada	Toggle de 'Alertas de segurança' aparece ativo e bloqueado. Texto em vermelho 'Não pode ser desativado'.
Grupos	Sociais (Fase 1.2+) · Estabelecimentos · Sistema

4.7 Privacidade
Conta pública	Toggle. Off = perfil privado — apenas seguidores aprovados veem o conteúdo.
Mensagens	Radio: Qualquer pessoa | Só quem sigo | Ninguém.
Check-ins	Radio: Visíveis para todos | Só meus seguidores | Só eu.
Bloqueados	Item com contador → abre tela 09 (Usuários Bloqueados).

4.8 Usuários Bloqueados
Lista	Avatar + nome + handle. Botão 'Desbloquear' por item.
Desbloquear	Confirmação inline (toque → botão vira 'Confirmar?' por 2s → executa).
Lista vazia	'Nenhum usuário bloqueado' com ícone.

4.9 Segurança
Alterar senha	Chevron → tela 11.
2FA	Exibe método atual (SMS) + chevron → tela 12.
Dispositivos	Lista inline com: nome · cidade · data último acesso. Botão 'Revogar' em dispositivos não-atuais.
Histórico acessos	Chevron → tela 13.
Alerta novo acesso	Toggle — notifica ao logar em dispositivo novo.

4.10 Alterar Senha
Campos	Senha atual · Nova senha · Confirmar nova senha. Todos com toggle de visibilidade (👁).
Barra de força	4 segmentos: Fraca (1 vermelho) · Regular (2 laranja) · Boa (3 laranja) · Forte (4 verde).
Validação	Mínimo 8 chars, letra maiúscula, minúscula e número.
Salvar	Botão laranja 'Salvar nova senha'. Desabilitado se campos inválidos.

4.11 Autenticação 2FA
Métodos	SMS · App autenticador (Google Authenticator, Authy) · E-mail. Seleção única.
Método ativo	Card com borda laranja + check laranja.
Códigos recuperação	Link para ver/gerar códigos para uso emergencial se perder acesso ao método.
Desativar	Botão vermelho 'Desativar autenticação de dois fatores' no final da tela.

4.12 Histórico de Acessos
Lista	Ícone do dispositivo + nome + cidade + data/hora do acesso.
Acesso atual	Label verde 'Este dispositivo'. Sem botão Revogar.
Acesso suspeito	Ícone ⚠ vermelho. Card de alerta abaixo explicando e sugerindo ações.
Ações sugeridas	Se suspeito: links inline 'Alterar senha' e 'Revogar todas as sessões'.

4.13 Idioma
Opções	Português (Brasil) — ativo. English e Español — em breve, opacidade reduzida.
Seleção	Radio buttons. Salva imediatamente. Reinicia o app para aplicar.

4.14 Sobre
Logo centralizado	Logo M laranja 56px + nome 'Meu Agito' + versão e build.
Legal	Termos de uso · Política de privacidade · Política de cookies · Licenças open source — todos → WebView (tela 16).
Suporte	Avaliar o app (→ loja) · Central de ajuda · Falar com suporte (→ tela 17).

4.15 Termos / Política — WebView
Comportamento	WebView nativa do sistema exibindo o conteúdo legal. Mesmo layout para Termos, Privacidade, Cookies e Licenças.
Header	← Voltar + título da seção + ⎙ Compartilhar.
Conteúdo	Texto formatado com H3 e parágrafos. Data de última atualização no rodapé.
Offline	Conteúdo em cache local para acesso sem internet.

4.16 Suporte
Chat	Abre T_CHAT com o canal de suporte do Meu Agito.
E-mail	Abre cliente de e-mail nativo com endereço suporte@meuagito.com.br preenchido.
Tópicos frequentes	Lista de artigos de ajuda. Toque abre WebView com o artigo.
Avaliar o app	Abre App Store (iOS) ou Google Play (Android) diretamente na página do app.

5. Fluxo de Navegação
De onde	Ação	Para onde	Observação
Barra ⚙	Toque	T_CONFIG principal	
Principal → Minha conta	Toque	Tela 02	
Principal → Vinculadas	Toque	Tela 03	
Principal → Cidade	Toque	M01 Modal Troca de Cidade	Abre modal
Principal → Raio	Toque	Tela 06	
Principal → GPS toggle	Toggle	Abre config. do sistema	iOS/Android nativo
Principal → Notificações	Toque	Tela 07	
Principal → Privacidade	Toque	Tela 08	
Principal → Segurança	Toque	Tela 10	
Principal → Idioma	Toque	Tela 14	
Principal → Sobre	Toque	Tela 15	
Principal → Desativar	Toque	Tela 04	Vermelho
Principal → Excluir	Toque	Tela 05	Vermelho
Privacidade → Bloqueados	Toque	Tela 09	
Segurança → Senha	Toque	Tela 11	
Segurança → 2FA	Toque	Tela 12	
Segurança → Histórico	Toque	Tela 13	
Sobre → itens legais	Toque	Tela 16 (WebView)	
Sobre → Suporte	Toque	Tela 17	
Qualquer tela filha	← Voltar	Tela anterior	Estado preservado

6. Regras de Negócio
RN-01 — Sem perfil no topo
A tela principal começa direto nas seções de configuração, sem foto ou nome do usuário no topo.
RN-02 — Alertas de segurança não podem ser desativados
O toggle de 'Alertas de segurança' em Notificações aparece sempre ativo e bloqueado. Texto explicativo em vermelho abaixo.
RN-03 — Excluir conta exige dupla confirmação
O usuário deve digitar a palavra 'EXCLUIR' e confirmar a senha. Sem esse processo, o botão não executa a ação.
RN-04 — Pagamentos em breve
A seção Pagamentos aparece na lista com nota 'Em breve' e sem chevron funcional na Fase 1.0.
RN-05 — GPS abre configurações nativas
O toggle de permissão de GPS não pode ser controlado diretamente pelo app — toque abre as configurações do iOS ou Android.
RN-06 — Conteúdo legal em cache
Termos, Política e Cookies ficam em cache local para acesso offline. Atualizados automaticamente quando o app abre com internet.
RN-07 — Idioma reinicia o app
Ao alterar o idioma, o app exibe um toast 'O app será reiniciado para aplicar o idioma' e reinicia após 2 segundos.

Dev: T_CONFIG usa React Navigation Stack. Cada tela filha é um componente independente. Todas as alterações de toggle salvam imediatamente via PATCH /api/usuario/config/{campo}.

7. Mockup HTML — Referência Visual
O código abaixo contém todas as 17 telas do T_CONFIG renderizadas. Nenhum chevron › sem destino.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T_CONFIG Completo</title>
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
    margin: 48px 0 24px; width: 100%; max-width: 1400px;
  }
  .section-div .line  { flex: 1; height: 1px; background: #1e1e1e; }

  .section-div .label { color: #E8640A; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; white-space: nowrap; }

  .phones-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .phone-label { color: #555; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-align: center; max-width: 260px; }

  .phone {
    width: 260px; height: 580px;
    background: #0D0D0D; border-radius: 38px;
    border: 6px solid #1e1e1e; overflow: hidden;
    box-shadow: 0 16px 40px rgba(0,0,0,0.8);
    display: flex; flex-direction: column;
  }
  .notch { height: 20px; background: #1e1e1e; border-radius: 0 0 13px 13px; width: 84px; margin: 0 auto; flex-shrink: 0; }


  /* ── Componentes base ── */
  .t-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 13px 9px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .t-back {
    width: 30px; height: 30px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: white; flex-shrink: 0;
  }
  .t-title { font-size: 15px; font-weight: 900; color: white; flex: 1; text-align: center; }
  .t-action { font-size: 12px; color: #E8640A; cursor: pointer; font-weight: 700; }
  .t-spacer { width: 30px; }

  .t-scroll { flex: 1; overflow-y: auto; }
  .t-scroll::-webkit-scrollbar { display: none; }

  /* grupo */
  .grp-label {
    padding: 11px 13px 5px;

    font-size: 9px; font-weight: 700; color: #444;
    letter-spacing: 1.5px; text-transform: uppercase;
  }

  /* item base */
  .ci {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; background: #0D0D0D;
    border-bottom: 1px solid #0a0a0a; cursor: pointer;
  }
  .ci-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .ci-info { flex: 1; }
  .ci-label { font-size: 12px; color: white; }
  .ci-sub   { font-size: 10px; color: #555; margin-top: 1px; }
  .ci-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
  .ci-val   { font-size: 10px; color: #555; }
  .chevron  { font-size: 15px; color: #333; }

  /* toggle */
  .tog {
    width: 38px; height: 21px; border-radius: 11px;

    background: #2a2a2a; position: relative; flex-shrink: 0;
  }
  .tog.on { background: #E8640A; }
  .tog::after {
    content: ''; position: absolute;
    width: 17px; height: 17px; border-radius: 50%;
    background: white; top: 2px; left: 2px;
  }
  .tog.on::after { left: 19px; }
  .tog.disabled { opacity: 0.4; pointer-events: none; }

  /* input */
  .inp-grp { padding: 9px 13px; border-bottom: 1px solid #0a0a0a; }
  .inp-lbl { font-size: 9px; color: #555; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
  .inp-field {
    width: 100%; height: 38px; background: #1a1a1a;
    border: 1px solid #2a2a2a; border-radius: 9px;
    padding: 0 11px; font-size: 11px; color: white;
    display: flex; align-items: center;
  }
  .inp-field.active { border-color: #E8640A; }
  .inp-ph { color: #333; }

  .inp-eye { font-size: 14px; color: #555; margin-left: auto; }

  /* radio */
  .radio-opt {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 13px; border-bottom: 1px solid #0a0a0a; cursor: pointer;
  }
  .radio-label { font-size: 12px; color: white; }
  .radio-sub   { font-size: 10px; color: #555; margin-top: 1px; }
  .radio-dot {
    width: 19px; height: 19px; border-radius: 50%;
    border: 1.5px solid #333; display: flex;
    align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0;
  }
  .radio-dot.sel { background: #E8640A; border-color: #E8640A; color: white; }

  /* danger */
  .ci.danger .ci-label { color: #e74c3c; }

  /* webview */
  .webview-content {
    flex: 1; padding: 14px; overflow-y: auto;
    font-size: 11px; color: #888; line-height: 1.7;

  }
  .webview-content h3 { font-size: 13px; color: white; margin: 12px 0 6px; }
  .webview-content p  { margin-bottom: 8px; }

  /* bloqueados */
  .blocked-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 13px; border-bottom: 1px solid #0a0a0a;
  }
  .bl-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .bl-info { flex: 1; }
  .bl-name { font-size: 12px; font-weight: 700; color: white; }
  .bl-handle { font-size: 10px; color: #555; }
  .bl-btn {
    font-size: 10px; font-weight: 700; padding: 4px 10px;
    border-radius: 8px; background: #1a1a1a; border: 1px solid #2a2a2a;
    color: #E8640A; cursor: pointer;

  }

  /* dispositivo */
  .dev-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; border-bottom: 1px solid #0a0a0a;
  }
  .dev-icon { font-size: 20px; flex-shrink: 0; }
  .dev-info { flex: 1; }
  .dev-name { font-size: 12px; font-weight: 700; color: white; }
  .dev-meta { font-size: 10px; color: #555; }
  .dev-current { font-size: 9px; font-weight: 700; color: #27ae60; }
  .dev-revoke  { font-size: 10px; color: #e74c3c; cursor: pointer; flex-shrink: 0; }

  /* acesso */
  .access-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 13px; border-bottom: 1px solid #0a0a0a;
  }
  .acc-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
  .acc-info { flex: 1; }
  .acc-dev  { font-size: 12px; font-weight: 700; color: white; }
  .acc-meta { font-size: 10px; color: #555; margin-top: 2px; }

  .acc-loc  { font-size: 10px; color: #888; }
  .acc-ok   { font-size: 14px; flex-shrink: 0; }

  /* aviso */
  .warn-box {
    margin: 10px 13px; background: rgba(231,76,60,0.08);
    border: 1px solid rgba(231,76,60,0.25); border-radius: 10px;
    padding: 10px 12px;
  }
  .warn-box.orange { background: rgba(232,100,10,0.08); border-color: rgba(232,100,10,0.25); }
  .warn-title { font-size: 11px; font-weight: 700; color: #e74c3c; margin-bottom: 4px; }
  .warn-title.orange { color: #E8640A; }
  .warn-text  { font-size: 10px; color: #888; line-height: 1.5; }

  /* botão grande */
  .big-btn {
    margin: 10px 13px; height: 42px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; cursor: pointer;
    border: none; font-family: Arial, sans-serif;

  }
  .big-btn.red    { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }
  .big-btn.orange { background: #E8640A; color: white; }
  .big-btn.gray   { background: #1a1a1a; color: #888; border: 1px solid #2a2a2a; }

  /* about logo */
  .about-logo {
    display: flex; flex-direction: column; align-items: center;
    padding: 20px 0 14px; border-bottom: 1px solid #111;
  }
  .about-logo-box {
    width: 56px; height: 56px; background: #E8640A; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 900; color: white; margin-bottom: 8px;
  }
  .about-name { font-size: 13px; font-weight: 700; color: white; }
  .about-ver  { font-size: 10px; color: #555; margin-top: 2px; }

  /* 2FA método */

  .method-card {
    margin: 8px 13px; background: #1a1a1a; border-radius: 11px;
    border: 1px solid #2a2a2a; padding: 11px 12px;
    display: flex; align-items: center; gap: 10px; cursor: pointer;
  }
  .method-card.active { border-color: #E8640A; background: rgba(232,100,10,0.06); }
  .method-icon { font-size: 20px; flex-shrink: 0; }
  .method-info { flex: 1; }
  .method-label { font-size: 12px; font-weight: 700; color: white; }
  .method-sub   { font-size: 10px; color: #666; margin-top: 2px; }
  .method-check { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
  .method-check.on { background: #E8640A; border-color: #E8640A; color: white; }

  /* idioma */
  .lang-item {

    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 13px; border-bottom: 1px solid #0a0a0a; cursor: pointer;
  }
  .lang-left { display: flex; align-items: center; gap: 10px; }
  .lang-flag { font-size: 20px; }
  .lang-name { font-size: 12px; color: white; }
  .lang-sub  { font-size: 10px; color: #555; }

  /* barra nav */
  .bottom-nav {
    border-top: 1px solid #1A1A1A;
    display: flex; align-items: center; justify-content: space-around;
    padding: 9px 0 13px; background: #0D0D0D; flex-shrink: 0;
  }
  .nav-tab   { text-align: center; }
  .nav-icon  { font-size: 19px; color: #555; }
  .nav-lbl   { font-size: 8px; color: #555; margin-top: 2px; }
  .nav-icon.active { color: white; }
  .nav-lbl.active  { color: white; }
  .nav-center {
    width: 45px; height: 45px; border-radius: 50%;

    background: #E8640A; display: flex; align-items: center;
    justify-content: center; font-size: 18px; margin-top: -8px;
    box-shadow: 0 0 14px rgba(232,100,10,0.6);
  }
</style>
</head>
<body>

<div class="page-title">T_CONFIG — Configurações Completo</div>
<div class="page-sub">17 telas · Todos os destinos implementados</div>

<!-- ══════════════════════════════════════════
     GRUPO 1 — TELA PRINCIPAL + CONTA
══════════════════════════════════════════ -->
<div class="section-div"><div class="line"></div><div class="label">Tela principal + Conta</div><div class="line"></div></div>
<div class="phones-row">

  <!-- 1. TELA PRINCIPAL -->
  <div class="phone-wrap">
    <div class="phone-label">1 · Tela principal</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-spacer"></div><div class="t-title">Configurações</div><div class="t-spacer"></div></div>

      <div class="t-scroll">
        <div class="grp-label">Conta</div>
        <div class="ci"><div class="ci-icon" style="background:rgba(232,100,10,0.12);">👤</div><div class="ci-info"><div class="ci-label">Minha conta</div><div class="ci-sub">Foto, nome, username, e-mail</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(52,152,219,0.1);">🔗</div><div class="ci-info"><div class="ci-label">Contas vinculadas</div><div class="ci-sub">Google, Apple</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

        <div class="grp-label">Localidade</div>
        <div class="ci"><div class="ci-icon" style="background:rgba(231,76,60,0.1);">📍</div><div class="ci-info"><div class="ci-label">Cidade atual</div><div class="ci-sub">São Paulo, SP</div></div><div class="ci-right"><div class="ci-val">Trocar</div><div class="chevron">›</div></div></div>

        <div class="ci"><div class="ci-icon" style="background:rgba(231,76,60,0.1);">🎯</div><div class="ci-info"><div class="ci-label">Raio de busca</div></div><div class="ci-right"><div class="ci-val">5km</div><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(231,76,60,0.1);">📡</div><div class="ci-info"><div class="ci-label">Permissão de GPS</div><div class="ci-sub">Concedida</div></div><div class="ci-right"><div class="tog on"></div></div></div>

        <div class="grp-label">Preferências</div>
        <div class="ci"><div class="ci-icon" style="background:rgba(243,156,18,0.1);">🔔</div><div class="ci-info"><div class="ci-label">Notificações</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(155,89,182,0.1);">🔒</div><div class="ci-info"><div class="ci-label">Privacidade</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

        <div class="ci"><div class="ci-icon" style="background:rgba(39,174,96,0.1);">🛡️</div><div class="ci-info"><div class="ci-label">Segurança</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(52,152,219,0.1);">🌐</div><div class="ci-info"><div class="ci-label">Idioma</div></div><div class="ci-right"><div class="ci-val">PT-BR</div><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(39,174,96,0.1);">💳</div><div class="ci-info"><div class="ci-label">Pagamentos</div><div class="ci-sub">Em breve</div></div><div class="ci-right"><div class="chevron" style="color:#222;">›</div></div></div>

        <div class="grp-label">Sobre</div>
        <div class="ci"><div class="ci-icon" style="background:#1a1a1a;">ℹ️</div><div class="ci-info"><div class="ci-label">Sobre o Meu Agito</div></div><div class="ci-right"><div class="chevron">›</div></div></div>


        <div class="grp-label" style="color:#e74c3c44;">Zona de perigo</div>
        <div class="ci danger"><div class="ci-icon" style="background:rgba(231,76,60,0.08);">⏸️</div><div class="ci-info"><div class="ci-label">Desativar conta</div><div class="ci-sub" style="color:#555;">Temporariamente</div></div><div class="ci-right"><div class="chevron" style="color:#e74c3c33;">›</div></div></div>
        <div class="ci danger"><div class="ci-icon" style="background:rgba(231,76,60,0.08);">🗑️</div><div class="ci-info"><div class="ci-label">Excluir conta</div><div class="ci-sub" style="color:#555;">Permanentemente</div></div><div class="ci-right"><div class="chevron" style="color:#e74c3c33;">›</div></div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>

        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 2. MINHA CONTA -->
  <div class="phone-wrap">
    <div class="phone-label">2 · Minha conta</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Minha conta</div><div class="t-action">Salvar</div></div>
      <div class="t-scroll">
        <div style="display:flex;flex-direction:column;align-items:center;padding:16px 0 12px;border-bottom:1px solid #111;">

          <div style="width:68px;height:68px;border-radius:50%;background:#1a1a1a;border:2px solid #E8640A;display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:7px;">👤</div>
          <div style="font-size:11px;color:#E8640A;cursor:pointer;">Alterar foto</div>
        </div>
        <div class="inp-grp"><div class="inp-lbl">NOME</div><div class="inp-field active"><span style="color:white;">João Silva</span></div></div>
        <div class="inp-grp"><div class="inp-lbl">USERNAME</div><div class="inp-field"><span style="color:white;">@joaosilva</span></div></div>
        <div class="inp-grp"><div class="inp-lbl">BIO</div><div class="inp-field" style="height:52px;align-items:flex-start;padding-top:8px;"><span style="color:white;">Designer · São Paulo ☕</span></div></div>

        <div class="inp-grp"><div class="inp-lbl">E-MAIL</div><div class="inp-field"><span style="color:white;">joao@email.com</span></div></div>
        <div class="inp-grp"><div class="inp-lbl">TELEFONE</div><div class="inp-field"><span style="color:white;">(11) 98765-4321</span></div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>

      </div>
    </div>
  </div>

  <!-- 3. CONTAS VINCULADAS -->
  <div class="phone-wrap">
    <div class="phone-label">3 · Contas vinculadas</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Contas vinculadas</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div style="padding:12px 13px;font-size:11px;color:#555;line-height:1.5;border-bottom:1px solid #0a0a0a;">Vincule contas externas para fazer login mais rapidamente.</div>
        <div class="grp-label">Disponíveis</div>
        <div class="ci">
          <div class="ci-icon" style="background:#fff;"><span style="font-size:14px;">G</span></div>
          <div class="ci-info"><div class="ci-label">Google</div><div class="ci-sub" style="color:#27ae60;">Conectado · joao@gmail.com</div></div>

          <div class="ci-right"><div style="font-size:10px;color:#e74c3c;cursor:pointer;">Desconectar</div></div>
        </div>
        <div class="ci">
          <div class="ci-icon" style="background:#111;border:1px solid #2a2a2a;"><span style="font-size:16px;">🍎</span></div>
          <div class="ci-info"><div class="ci-label">Apple</div><div class="ci-sub">Não conectado</div></div>
          <div class="ci-right"><div style="font-size:10px;color:#E8640A;cursor:pointer;">Conectar</div></div>
        </div>
        <div class="warn-box orange" style="margin-top:12px;">
          <div class="warn-title orange">Ao desconectar</div>
          <div class="warn-text">Você ainda poderá entrar com e-mail e senha. Certifique-se de que sua senha está definida antes de desconectar.</div>
        </div>

      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 4. DESATIVAR CONTA -->
  <div class="phone-wrap">
    <div class="phone-label">4 · Desativar conta</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Desativar conta</div><div class="t-spacer"></div></div>

      <div class="t-scroll">
        <div style="display:flex;flex-direction:column;align-items:center;padding:24px 13px 16px;text-align:center;border-bottom:1px solid #111;">
          <div style="font-size:44px;margin-bottom:12px;">⏸️</div>
          <div style="font-size:15px;font-weight:700;color:white;margin-bottom:6px;">Desativar temporariamente</div>
          <div style="font-size:11px;color:#888;line-height:1.6;">Seu perfil, posts e dados ficam guardados. Você pode reativar a qualquer momento ao fazer login.</div>
        </div>
        <div class="grp-label">O que acontece</div>
        <div class="ci" style="cursor:default;">
          <div style="font-size:14px;">✓</div>
          <div class="ci-info"><div class="ci-label" style="font-size:11px;">Seu perfil fica oculto para outros usuários</div></div>

        </div>
        <div class="ci" style="cursor:default;">
          <div style="font-size:14px;">✓</div>
          <div class="ci-info"><div class="ci-label" style="font-size:11px;">Seus dados e posts são preservados</div></div>
        </div>
        <div class="ci" style="cursor:default;">
          <div style="font-size:14px;">✓</div>
          <div class="ci-info"><div class="ci-label" style="font-size:11px;">Você sai do app automaticamente</div></div>
        </div>
        <div class="ci" style="cursor:default;">
          <div style="font-size:14px;">✓</div>
          <div class="ci-info"><div class="ci-label" style="font-size:11px;">Para reativar: basta fazer login novamente</div></div>
        </div>
        <div class="inp-grp" style="margin-top:8px;">
          <div class="inp-lbl">CONFIRME SUA SENHA PARA CONTINUAR</div>

          <div class="inp-field"><span class="inp-ph">••••••••</span><span class="inp-eye">👁</span></div>
        </div>
        <div class="big-btn red" style="margin-top:6px;">Desativar minha conta</div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 5. EXCLUIR CONTA -->
  <div class="phone-wrap">

    <div class="phone-label">5 · Excluir conta</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Excluir conta</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div style="display:flex;flex-direction:column;align-items:center;padding:20px 13px 14px;text-align:center;">
          <div style="font-size:42px;margin-bottom:10px;">⚠️</div>
          <div style="font-size:14px;font-weight:700;color:#e74c3c;margin-bottom:6px;">Esta ação é irreversível</div>
          <div style="font-size:10px;color:#888;line-height:1.6;">Todos os seus dados, posts, favoritos e histórico serão permanentemente excluídos.</div>
        </div>
        <div class="warn-box">
          <div class="warn-title">O que será excluído para sempre</div>

          <div class="warn-text">Perfil e foto · Posts e comentários · Favoritos · Histórico · Agendamentos e reservas · Acesso ao app</div>
        </div>
        <div class="inp-grp" style="margin-top:10px;">
          <div class="inp-lbl">DIGITE "EXCLUIR" PARA CONFIRMAR</div>
          <div class="inp-field"><span class="inp-ph">EXCLUIR</span></div>
        </div>
        <div class="inp-grp">
          <div class="inp-lbl">CONFIRME SUA SENHA</div>
          <div class="inp-field"><span class="inp-ph">••••••••</span><span class="inp-eye">👁</span></div>
        </div>
        <div style="padding:8px 13px;font-size:10px;color:#555;line-height:1.5;">Ao excluir, você concorda que todos os dados serão removidos de acordo com nossa Política de Privacidade.</div>
        <div class="big-btn red">Excluir minha conta definitivamente</div>

      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

</div>

<!-- ══════════════════════════════════════════
     GRUPO 2 — LOCALIDADE + NOTIFICAÇÕES + PRIVACIDADE
══════════════════════════════════════════ -->
<div class="section-div"><div class="line"></div><div class="label">Localidade · Notificações · Privacidade</div><div class="line"></div></div>

<div class="phones-row">

  <!-- 6. RAIO DE BUSCA -->
  <div class="phone-wrap">
    <div class="phone-label">6 · Raio de busca</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Raio de busca</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div style="padding:12px 13px 8px;font-size:10px;color:#555;line-height:1.5;border-bottom:1px solid #0a0a0a;">Define até que distância o app exibe resultados de busca e feed.</div>
        <div class="grp-label">Selecione o raio</div>
        <div class="radio-opt"><div class="radio-label">500 metros</div><div class="radio-dot"></div></div>
        <div class="radio-opt"><div class="radio-label">1 km</div><div class="radio-dot"></div></div>

        <div class="radio-opt"><div class="radio-label">2 km</div><div class="radio-dot"></div></div>
        <div class="radio-opt"><div><div class="radio-label">5 km</div><div class="radio-sub">Padrão recomendado</div></div><div class="radio-dot sel">✓</div></div>
        <div class="radio-opt"><div class="radio-label">10 km</div><div class="radio-dot"></div></div>
        <div class="radio-opt"><div class="radio-label">20 km</div><div class="radio-dot"></div></div>
        <div class="radio-opt"><div><div class="radio-label">Sem limite</div><div class="radio-sub">Resultados de toda a cidade</div></div><div class="radio-dot"></div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>

        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 7. NOTIFICAÇÕES -->
  <div class="phone-wrap">
    <div class="phone-label">7 · Notificações</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Notificações</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div class="grp-label" style="padding-top:10px;">Sociais · Fase 1.2+</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Novos seguidores</div></div><div class="tog on"></div></div>

        <div class="ci"><div class="ci-info"><div class="ci-label">Curtidas em posts</div></div><div class="tog on"></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Comentários</div></div><div class="tog on"></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Menções</div></div><div class="tog on"></div></div>
        <div class="grp-label">Estabelecimentos</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Novos Momentos</div><div class="ci-sub">De quem você segue</div></div><div class="tog on"></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Promoções</div><div class="ci-sub">Favoritos com oferta</div></div><div class="tog"></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Favorito abriu agora</div></div><div class="tog on"></div></div>

        <div class="grp-label">Sistema</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Alertas de segurança</div><div class="ci-sub" style="color:#e74c3c;">Não pode ser desativado</div></div><div class="tog on disabled"></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Atualizações do app</div></div><div class="tog on"></div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>

      </div>
    </div>
  </div>

  <!-- 8. PRIVACIDADE -->
  <div class="phone-wrap">
    <div class="phone-label">8 · Privacidade</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Privacidade</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div class="grp-label" style="padding-top:10px;">Conta</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Conta pública</div><div class="ci-sub">Qualquer pessoa pode ver seu perfil</div></div><div class="tog on"></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Aparecer em pesquisas</div></div><div class="tog on"></div></div>
        <div class="grp-label">Quem pode me enviar mensagem</div>

        <div class="radio-opt"><div class="radio-label">Qualquer pessoa</div><div class="radio-dot sel">✓</div></div>
        <div class="radio-opt"><div class="radio-label">Só quem sigo</div><div class="radio-dot"></div></div>
        <div class="radio-opt"><div class="radio-label">Ninguém</div><div class="radio-dot"></div></div>
        <div class="grp-label">Visibilidade dos check-ins</div>
        <div class="radio-opt"><div class="radio-label">Visíveis para todos</div><div class="radio-dot sel">✓</div></div>
        <div class="radio-opt"><div class="radio-label">Só meus seguidores</div><div class="radio-dot"></div></div>
        <div class="radio-opt"><div class="radio-label">Só eu</div><div class="radio-dot"></div></div>
        <div class="grp-label">Bloqueados</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Usuários bloqueados</div><div class="ci-sub">3 bloqueados</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 9. USUÁRIOS BLOQUEADOS -->
  <div class="phone-wrap">
    <div class="phone-label">9 · Usuários bloqueados</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Bloqueados</div><div class="t-spacer"></div></div>

      <div class="t-scroll">
        <div style="padding:10px 13px 8px;font-size:10px;color:#555;line-height:1.5;border-bottom:1px solid #0a0a0a;">Usuários bloqueados não podem ver seu perfil, enviar mensagens ou interagir com você.</div>
        <div class="blocked-item">
          <div class="bl-avatar">👨</div>
          <div class="bl-info"><div class="bl-name">Carlos Lima</div><div class="bl-handle">@carloslima</div></div>
          <div class="bl-btn">Desbloquear</div>
        </div>
        <div class="blocked-item">
          <div class="bl-avatar">👩</div>
          <div class="bl-info"><div class="bl-name">Fernanda Costa</div><div class="bl-handle">@fecosta</div></div>
          <div class="bl-btn">Desbloquear</div>
        </div>
        <div class="blocked-item">
          <div class="bl-avatar">🏪</div>

          <div class="bl-info"><div class="bl-name">Loja Fake Store</div><div class="bl-handle">@fakestore</div></div>
          <div class="bl-btn">Desbloquear</div>
        </div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

</div>

<!-- ══════════════════════════════════════════
     GRUPO 3 — SEGURANÇA

══════════════════════════════════════════ -->
<div class="section-div"><div class="line"></div><div class="label">Segurança</div><div class="line"></div></div>
<div class="phones-row">

  <!-- 10. SEGURANÇA -->
  <div class="phone-wrap">
    <div class="phone-label">10 · Segurança</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Segurança</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div class="grp-label" style="padding-top:10px;">Acesso</div>
        <div class="ci"><div class="ci-icon" style="background:rgba(39,174,96,0.1);">🔑</div><div class="ci-info"><div class="ci-label">Alterar senha</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(39,174,96,0.1);">🔐</div><div class="ci-info"><div class="ci-label">Autenticação em dois fatores</div><div class="ci-sub">Ativada · SMS</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

        <div class="grp-label">Sessões ativas</div>
        <div class="dev-item">
          <div class="dev-icon">📱</div>
          <div class="dev-info"><div class="dev-name">iPhone 15 Pro · São Paulo</div><div class="dev-meta">Agora</div><div class="dev-current">✓ Este dispositivo</div></div>
        </div>
        <div class="dev-item">
          <div class="dev-icon">💻</div>
          <div class="dev-info"><div class="dev-name">MacBook · São Paulo</div><div class="dev-meta">Ontem 14h32</div></div>
          <div class="dev-revoke">Revogar</div>
        </div>
        <div class="dev-item">
          <div class="dev-icon">📱</div>
          <div class="dev-info"><div class="dev-name">Android · Campinas</div><div class="dev-meta">12 mar</div></div>
          <div class="dev-revoke">Revogar</div>

        </div>
        <div class="ci"><div class="ci-icon" style="background:rgba(39,174,96,0.1);">📋</div><div class="ci-info"><div class="ci-label">Histórico de acessos</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="grp-label">Alertas</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Alertar ao logar em novo dispositivo</div></div><div class="tog on"></div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>

        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 11. ALTERAR SENHA -->
  <div class="phone-wrap">
    <div class="phone-label">11 · Alterar senha</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Alterar senha</div><div class="t-action">Salvar</div></div>
      <div class="t-scroll">
        <div style="padding:12px 13px 8px;font-size:10px;color:#555;line-height:1.5;border-bottom:1px solid #0a0a0a;">Use uma senha com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.</div>
        <div class="inp-grp" style="margin-top:8px;"><div class="inp-lbl">SENHA ATUAL</div><div class="inp-field"><span class="inp-ph">••••••••</span><span class="inp-eye">👁</span></div></div>

        <div class="inp-grp"><div class="inp-lbl">NOVA SENHA</div><div class="inp-field active"><span class="inp-ph">••••••••</span><span class="inp-eye">👁</span></div></div>
        <!-- barra de força -->
        <div style="padding:4px 13px 8px;">
          <div style="display:flex;gap:3px;margin-bottom:4px;">
            <div style="flex:1;height:3px;border-radius:2px;background:#E8640A;"></div>
            <div style="flex:1;height:3px;border-radius:2px;background:#E8640A;"></div>
            <div style="flex:1;height:3px;border-radius:2px;background:#E8640A;"></div>
            <div style="flex:1;height:3px;border-radius:2px;background:#2a2a2a;"></div>
          </div>
          <div style="font-size:10px;color:#E8640A;">Força: Boa</div>
        </div>
        <div class="inp-grp"><div class="inp-lbl">CONFIRMAR NOVA SENHA</div><div class="inp-field"><span class="inp-ph">••••••••</span><span class="inp-eye">👁</span></div></div>

        <div class="big-btn orange" style="margin-top:12px;">Salvar nova senha</div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 12. 2FA -->
  <div class="phone-wrap">
    <div class="phone-label">12 · Autenticação 2FA</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">2 Fatores</div><div class="t-spacer"></div></div>

      <div class="t-scroll">
        <div style="padding:12px 13px 8px;font-size:10px;color:#555;line-height:1.5;border-bottom:1px solid #0a0a0a;">Adicione uma camada extra de segurança. Escolha como receber seu código de verificação.</div>
        <div class="grp-label">Método ativo</div>
        <div class="method-card active">
          <div class="method-icon">📱</div>
          <div class="method-info"><div class="method-label">SMS</div><div class="method-sub">(11) 987••-4321 · Ativo</div></div>
          <div class="method-check on">✓</div>
        </div>
        <div class="method-card">
          <div class="method-icon">🔐</div>
          <div class="method-info"><div class="method-label">App autenticador</div><div class="method-sub">Google Authenticator, Authy</div></div>
          <div class="method-check"></div>

        </div>
        <div class="method-card">
          <div class="method-icon">📧</div>
          <div class="method-info"><div class="method-label">E-mail</div><div class="method-sub">joao@email.com</div></div>
          <div class="method-check"></div>
        </div>
        <div class="grp-label">Códigos de recuperação</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Ver códigos de recuperação</div><div class="ci-sub">Use se perder acesso ao seu método</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div style="margin-top:8px;"><div class="big-btn red">Desativar autenticação de dois fatores</div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>

        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 13. HISTÓRICO DE ACESSOS -->
  <div class="phone-wrap">
    <div class="phone-label">13 · Histórico de acessos</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Histórico de acessos</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div class="access-item">
          <div class="acc-icon">📱</div>

          <div class="acc-info"><div class="acc-dev">iPhone 15 Pro</div><div class="acc-meta">São Paulo, SP · agora</div><div class="acc-loc">Este dispositivo</div></div>
          <div class="acc-ok" style="color:#27ae60;">✓</div>
        </div>
        <div class="access-item">
          <div class="acc-icon">💻</div>
          <div class="acc-info"><div class="acc-dev">MacBook Pro</div><div class="acc-meta">São Paulo, SP · ontem 14h32</div></div>
          <div class="acc-ok" style="color:#27ae60;">✓</div>
        </div>
        <div class="access-item">
          <div class="acc-icon">📱</div>
          <div class="acc-info"><div class="acc-dev">Android Galaxy S22</div><div class="acc-meta">Campinas, SP · 12 mar 09h14</div></div>
          <div class="acc-ok" style="color:#27ae60;">✓</div>

        </div>
        <div class="access-item">
          <div class="acc-icon">🌐</div>
          <div class="acc-info"><div class="acc-dev">Navegador desconhecido</div><div class="acc-meta">Rio de Janeiro, RJ · 8 mar 22h05</div></div>
          <div class="acc-ok" style="color:#e74c3c;">⚠</div>
        </div>
        <div class="warn-box" style="margin-top:10px;">
          <div class="warn-title">Acesso suspeito detectado</div>
          <div class="warn-text">Um acesso em 8/mar de Rio de Janeiro pode não ser seu. Se não foi você, altere sua senha e revogue as sessões.</div>
        </div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>

        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

</div>

<!-- ══════════════════════════════════════════
     GRUPO 4 — IDIOMA + SOBRE + TERMOS + SUPORTE
══════════════════════════════════════════ -->
<div class="section-div"><div class="line"></div><div class="label">Idioma · Sobre · Termos · Suporte</div><div class="line"></div></div>
<div class="phones-row">

  <!-- 14. IDIOMA -->
  <div class="phone-wrap">
    <div class="phone-label">14 · Idioma</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Idioma</div><div class="t-spacer"></div></div>

      <div class="t-scroll">
        <div style="padding:10px 13px 8px;font-size:10px;color:#555;border-bottom:1px solid #0a0a0a;">O app será exibido no idioma selecionado.</div>
        <div class="lang-item">
          <div class="lang-left"><div class="lang-flag">🇧🇷</div><div><div class="lang-name">Português (Brasil)</div><div class="lang-sub">Idioma atual</div></div></div>
          <div class="radio-dot sel">✓</div>
        </div>
        <div class="lang-item" style="opacity:0.4;">
          <div class="lang-left"><div class="lang-flag">🇺🇸</div><div><div class="lang-name">English</div><div class="lang-sub">Em breve</div></div></div>
          <div class="radio-dot"></div>
        </div>
        <div class="lang-item" style="opacity:0.4;">
          <div class="lang-left"><div class="lang-flag">🇪🇸</div><div><div class="lang-name">Español</div><div class="lang-sub">Em breve</div></div></div>

          <div class="radio-dot"></div>
        </div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 15. SOBRE -->
  <div class="phone-wrap">
    <div class="phone-label">15 · Sobre o Meu Agito</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Sobre</div><div class="t-spacer"></div></div>

      <div class="t-scroll">
        <div class="about-logo">
          <div class="about-logo-box">M</div>
          <div class="about-name">Meu Agito</div>
          <div class="about-ver">Versão 1.0.0 (build 42)</div>
        </div>
        <div class="grp-label">Legal</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Termos de uso</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Política de privacidade</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Política de cookies</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Licenças open source</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

        <div class="grp-label">Suporte</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Avaliar o app</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Central de ajuda</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Falar com suporte</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>

        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 16. TERMOS / WEBVIEW -->
  <div class="phone-wrap">
    <div class="phone-label">16 · Termos / Política (WebView)</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Termos de uso</div><div style="font-size:16px;color:#aaa;">⎙</div></div>
      <div class="webview-content">
        <h3>1. Aceitação dos Termos</h3>
        <p>Ao criar uma conta no Meu Agito, você concorda com estes Termos de Uso. Leia com atenção antes de utilizar o app.</p>
        <h3>2. Uso da plataforma</h3>

        <p>O Meu Agito é uma plataforma de descoberta local que conecta usuários a estabelecimentos e eventos da sua cidade.</p>
        <h3>3. Conteúdo do usuário</h3>
        <p>Você é responsável por todo o conteúdo que publicar. Conteúdo ofensivo, falso ou que viole direitos de terceiros pode ser removido.</p>
        <h3>4. Privacidade</h3>
        <p>Seus dados são tratados conforme nossa Política de Privacidade, em conformidade com a LGPD (Lei 13.709/2018).</p>
        <h3>5. Modificações</h3>
        <p>Reservamos o direito de atualizar estes termos. Você será notificado sobre mudanças significativas.</p>
        <div style="color:#555;font-size:10px;margin-top:10px;">Última atualização: março de 2026</div>
      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>

        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

  <!-- 17. SUPORTE -->
  <div class="phone-wrap">
    <div class="phone-label">17 · Suporte</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="t-header"><div class="t-back">←</div><div class="t-title">Suporte</div><div class="t-spacer"></div></div>
      <div class="t-scroll">
        <div style="display:flex;flex-direction:column;align-items:center;padding:18px 13px 14px;text-align:center;border-bottom:1px solid #111;">

          <div style="font-size:38px;margin-bottom:8px;">🙋</div>
          <div style="font-size:13px;font-weight:700;color:white;margin-bottom:4px;">Como podemos ajudar?</div>
          <div style="font-size:10px;color:#555;line-height:1.5;">Nosso time responde em até 24 horas úteis.</div>
        </div>
        <div class="grp-label">Fale conosco</div>
        <div class="ci"><div class="ci-icon" style="background:rgba(39,174,96,0.1);">💬</div><div class="ci-info"><div class="ci-label">Chat com suporte</div><div class="ci-sub">Resposta em minutos</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-icon" style="background:rgba(52,152,219,0.1);">✉️</div><div class="ci-info"><div class="ci-label">Enviar e-mail</div><div class="ci-sub">suporte@meuagito.com.br</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

        <div class="grp-label">Tópicos frequentes</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Como criar uma conta</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Como assumir um perfil de negócio</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Denunciar um perfil falso</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Problemas com login</div></div><div class="ci-right"><div class="chevron">›</div></div></div>
        <div class="grp-label">App</div>
        <div class="ci"><div class="ci-info"><div class="ci-label">Avaliar o Meu Agito ⭐</div></div><div class="ci-right"><div class="chevron">›</div></div></div>

      </div>
      <div class="bottom-nav">
        <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
        <div class="nav-tab"><div class="nav-icon" style="font-size:15px;">✚</div><div class="nav-lbl">Criar</div></div>
        <div class="nav-center">★</div>
        <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
        <div class="nav-tab"><div class="nav-icon active">⚙</div><div class="nav-lbl active">Config</div></div>
      </div>
    </div>
  </div>

</div>

</body>
</html>

