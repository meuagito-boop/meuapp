MEU AGITO
T_PERFIL — Template Universal de Perfil
Arquitetura de tela — Especificação completa v3
Perfil de Estabelecimento + Perfil de Usuário — mesma base, variações por tipo
1. Identificação
Código	T_PERFIL
Nome	Template Universal de Perfil
Tipo	Tela de perfil completo — usa a mesma base para estabelecimento e usuário, com variações por tipo
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0 — presente desde o lançamento
Como é acessado	Toque em card de estabelecimento (Home, T07, T13, Feed) | Toque em avatar de usuário | Toque em nome em qualquer parte do app
Variantes	T_PERFIL_ESTABELECIMENTO — para negócios e serviços | T_PERFIL_USUARIO — para usuários da rede social
Preservação	Ao voltar: a tela de origem retorna exatamente como estava (scroll, filtros, posição)
Prioridade	Crítica — tela de conversão do produto. É onde o usuário decide agir (seguir, salvar, avaliar, agendar)

2. Conceito e Filosofia
O T_PERFIL é a vitrine de qualquer entidade dentro do Meu Agito — seja um negócio ou uma pessoa. A estrutura é idêntica nos dois casos: sem foto de capa (estilo Threads), abas de conteúdo, e a aba 'Tudo' em scroll contínuo que começa pelas informações e termina nos posts.

Princípio central: a aba 'Tudo' nunca é dividida — é um scroll contínuo único. O usuário começa vendo as informações do perfil e, ao continuar rolando, os posts começam naturalmente. Sem separação visual abrupta.

3. Diferenças entre Estabelecimento e Usuário
Elemento	Perfil Estabelecimento	Perfil Usuário
Avatar	Logo — quadrado border-radius 16px	Foto — circular border-radius 50%
Nome	Nome do estabelecimento bold grande	Nome completo bold grande
Linha de categoria	Ícone + categoria + subcategoria. Ex: '✂ Beleza · Barbearia'	Bio curta ou profissão. Ex: 'Designer · SP'
Badge verificado	'✓ Perfil verificado pelo dono' — laranja	'✓ Perfil verificado' — só para contas verificadas
Stats em linha	Seguidores · Avaliação ★ · Nº avaliações · Distância	Seguidores · Seguindo · Posts
Pills de ação	📞 Ligar · 📍 Como chegar · ⎙ Compartilhar · ♡ Salvar	Sem pills — não aplicável para usuário
Aba Tudo	Horário · Endereço · Telefone · Site · Tags · Momentos → Posts	Bio expandida · Localização · Interesses · Momentos → Posts
Aba Avaliações	✅ Presente — nota e avaliações com texto	❌ Não existe — usuários não são avaliados
Aba Serviços	✅ Presente — catálogo de serviços e preços	❌ Não existe — usuários não têm catálogo
Banner API	'Assumir este perfil →' quando não assumido pelo dono	Não aplicável
Visão própria	Botão Editar + métricas da semana + atalho Gerenciador	Botão Editar perfil + configurações privacidade

4. Estrutura Geral da Tela
Bloco 1 — Cabeçalho	Faz parte do scroll — some ao rolar para baixo. Avatar + Nome + Handle + Categoria/Bio + Stats + Botões + Pills
Bloco 2 — Abas	FIXA — gruda no topo ao rolar. Nunca some. Tudo | Mídia | Depoimentos | (Avaliações) | (Serviços)
Bloco 3 — Conteúdo	Scroll vertical infinito dentro da aba ativa

Dev: barra de abas usa position:sticky com top:0 para grudar no topo quando o cabeçalho sair da tela. O scroll acontece na área inteira (cabeçalho + conteúdo), não apenas no conteúdo.

5. Cabeçalho do Perfil — Sem Foto de Capa
Sem foto de capa — igual ao Threads. Fundo do cabeçalho é #0D0D0D, mesmo da tela. Mais limpo, menos distração.

5.1 Navegação do topo (fixa acima do cabeçalho)
Elemento	Especificação	Ação
← Voltar	Círculo #1A1A1A, ícone seta branca, 36x36px, borda 1px #2A2A2A. Extremo esquerdo.	Retorna à tela anterior preservando estado
🔍 Busca	Círculo #1A1A1A, 36x36px. Extremo direito, 4º da direita.	Abre T07 com contexto do estabelecimento
♡ Salvar	Círculo #1A1A1A, 36x36px. Preenchido laranja quando salvo.	Salva nos favoritos. Háptico leve.
⎙ Compartilhar	Círculo #1A1A1A, 36x36px.	Sheet nativo de compartilhamento
⋯ Mais	Círculo #1A1A1A, 36x36px. Mais à direita.	Sheet: Denunciar | Bloquear (usuário) | Copiar link

5.2 Bloco de identidade
Avatar	72x72px. Borda 2px #2A2A2A. Estab: border-radius 16px. Usuário: border-radius 50%.
Nome	Arial Bold 20px branco. À direita do avatar, alinhado ao topo.
Handle	'@handle' Arial Regular 13px #666. Abaixo do nome.
Linha de categoria	Arial Regular 12px #888. Abaixo do handle. Varia por tipo (ver seção 3).
Badge verificado	Chip laranja pequeno. Background #1A0800, borda #E8640A44, texto #E8640A 10px.
Bio expandida	Arial Regular 12px #aaa. Linha 1.6. Máx 3 linhas com 'ver mais'.

5.3 Stats em linha
Visual	Linha horizontal dividida por separadores verticais finos (#222). Número em bold + label pequeno.
Estabelecimento	Seguidores · Avaliação (ex: 4.8★) · Nº de avaliações · Distância (ex: '320m de você')
Usuário	Seguidores · Seguindo · Posts

5.4 Botões de ação
Botão	Especificação	Ação
+ Seguir / ✓ Seguindo	Fundo #E8640A (Seguir) ou #1A1A1A borda laranja (Seguindo). Flex 1. Arial Bold 13px. 40px. Radius 12px.	Seguindo: toque → sheet 'Deixar de seguir?'
💬 Mensagem	Fundo #1A1A1A. Borda 1px #2A2A2A. Flex 1. Mesmo estilo.	Abre T_CHAT com conversa deste perfil
⋯ Mais	Fundo #1A1A1A. Borda 1px #2A2A2A. Width 42px. Flex-shrink 0.	Bottom sheet com opções adicionais

5.5 Pills de ação rápida (apenas estabelecimento)
📞 Ligar	Só quando há telefone cadastrado. Abre discador nativo.
📍 Como chegar	Sempre presente com endereço. Abre Google Maps ou Apple Maps com rota.
⎙ Compartilhar	Sempre presente. Sheet nativo de compartilhamento.
♡ Salvar	Salva nos favoritos. Ícone muda para preenchido.

6. Abas de Conteúdo
Aba	Disponível	Conteúdo
Tudo	Estab + Usuário	Scroll contínuo: infos → tags → momentos (stories) → separador 'Publicações' → posts estilo Facebook
Mídia	Estab + Usuário	Grid de fotos e vídeos publicados. Toque abre visualizador em tela cheia.
Depoimentos	Estab + Usuário	Declarações públicas de outros usuários sobre o perfil. Estilo testemunhal.
Avaliações	Apenas Estab	Nota média + estrelas + avaliações com texto. Campo para o usuário logado avaliar.
Serviços	Apenas Estab	Prévia do catálogo. Botão 'Ver cardápio completo →' leva ao T_CATALOGO.

Aba 'Tudo' — princípio: sem separação abrupta. O usuário rola naturalmente das informações para os posts. O separador 'Publicações' é sutil — apenas uma linha fina com texto centralizado.

7. Fluxo Completo de Navegação
Elemento	Ação	Destino	Observação
← Voltar	Toque	Tela anterior — estado preservado	
♡ Salvar	Toque	Favoritos — sem navegar	Háptico leve
⎙ Compartilhar	Toque	Sheet nativo do sistema	
+ Seguir	Toque	Segue o perfil inline	Badge atualiza
✓ Seguindo	Toque	Sheet 'Deixar de seguir?'	
💬 Mensagem	Toque	T_CHAT com este perfil	
📞 Ligar (pill)	Toque	Discador nativo	Só com telefone
📍 Como chegar (pill)	Toque	Google Maps / Apple Maps	
Card de post	Toque	Post completo no T_AGITO	
Card de serviço	Toque	T_ITEM com template correto	
'Ver catálogo →'	Toque	T_CATALOGO do estabelecimento	
Avatar na aba Tudo	Toque no story/momento	T_STORY — visualizador	
'Assumir este perfil →'	Toque (banner API)	Fluxo T05b — cadastro empresarial	Só para perfis não assumidos

8. Regras de Negócio
RN-01 — Sem foto de capa
O T_PERFIL não tem foto de capa — igual ao Threads. Fundo sempre #0D0D0D. Isso mantém o foco no conteúdo e elimina a necessidade de gerenciar um asset extra.
RN-02 — Abas ficam no topo ao rolar
A barra de abas usa position:sticky e gruda no topo quando o cabeçalho some durante o scroll. Nunca some durante a navegação.
RN-03 — Aba Tudo é scroll contínuo
Não existe separação entre 'informações' e 'posts'. O usuário rola naturalmente de um para outro. O separador 'Publicações' é apenas visual — sutil, não uma divisão real.
RN-04 — Avaliações e Serviços só para estabelecimento
Usuários pessoais não têm abas de Avaliações nem Serviços. A estrutura de abas se adapta automaticamente ao tipo de perfil.
RN-05 — Preservação de estado na tela de origem
Ao voltar de T_PERFIL para qualquer tela anterior (T06, T07, T_AGITO), a tela de origem retorna exatamente como estava — scroll, filtros, posição.
RN-06 — Banner de perfil não assumido
Quando um estabelecimento foi importado via Google Places API mas não foi assumido por nenhum comerciante, um banner laranja exibe 'Assumir este perfil →' no topo da aba Tudo.

Dev: React Navigation Stack com parâmetros de tipo (estabelecimento | usuario). O tipo define quais abas renderizar e qual avatar usar. Header nativo substituído por header customizado.

9. Mockup HTML — Referência Visual
O código abaixo é o mockup unificado e definitivo do T_PERFIL. Inclui em um único arquivo: perfil de estabelecimento (abas Tudo, Avaliações e Serviços), perfil não assumido via API com banner, perfil de usuário (abas Tudo e Mídia) e tabela comparativa completa dos dois tipos.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T_PERFIL Universal</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    font-family: Arial, sans-serif;
    padding: 40px 20px;
    color: white;
  }

  /* ── Títulos da página ── */
  .page-title {
    color: #E8640A; font-size: 13px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 6px; text-align: center;
  }
  .page-sub { color: #444; font-size: 11px; margin-bottom: 16px; text-align: center; }

  .section-divider {
    display: flex; align-items: center; gap: 16px;
    margin: 48px 0 32px;
  }
  .section-divider .line { flex: 1; height: 1px; background: #1e1e1e; }

  .section-divider .label {
    color: #E8640A; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    white-space: nowrap;
  }

  .diff-note {
    background: #1a0f05; border: 1px solid #E8640A33;
    border-radius: 12px; padding: 12px 16px;
    font-size: 11px; color: #888; line-height: 1.6;
    max-width: 900px; margin: 0 auto 32px;
    text-align: center;
  }
  .diff-note span { color: #E8640A; font-weight: 700; }

  /* ── Layout de phones ── */
  .phones-row {
    display: flex; gap: 20px;
    flex-wrap: wrap; justify-content: center;
    margin-bottom: 20px;
  }
  .phone-wrap {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .phone-label {
    color: #555; font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;

  }

  /* ── Phone frame ── */
  .phone {
    width: 290px;
    background: #0D0D0D;
    border-radius: 42px;
    border: 6px solid #1e1e1e;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex; flex-direction: column;
  }
  .notch {
    flex-shrink: 0;
    height: 22px; background: #1e1e1e;
    border-radius: 0 0 14px 14px;
    width: 90px; margin: 0 auto;
  }

  /* ── Nav header (topo da tela de perfil) ── */
  .p-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 14px 10px;
    background: #0D0D0D;
    flex-shrink: 0;
  }
  .back-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: white; flex-shrink: 0;

  }
  .p-nav-icons { display: flex; gap: 8px; }
  .p-nav-icon {
    width: 34px; height: 34px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: #aaa;
  }

  /* ── Cabeçalho do perfil ── */
  .p-header { padding: 0 14px 12px; background: #0D0D0D; flex-shrink: 0; }

  .p-identity { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .p-info     { flex: 1; }
  .p-name     { font-size: 18px; font-weight: 900; color: white; margin-bottom: 3px; line-height: 1.2; }
  .p-handle   { font-size: 12px; color: #666; margin-bottom: 3px; }
  .p-category { font-size: 11px; color: #888; margin-bottom: 4px; }
  .p-verified {
    display: inline-block; font-size: 10px; color: #E8640A;

    background: #1A0800; border: 1px solid #E8640A44;
    border-radius: 6px; padding: 2px 7px;
  }

  /* Avatar — diferença chave */
  .p-avatar {
    width: 68px; height: 68px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; flex-shrink: 0;
    border: 2px solid #2a2a2a;
  }
  .p-avatar.estab  { border-radius: 16px; background: #1a1a1a; } /* quadrado arredondado */
  .p-avatar.user   { border-radius: 50%;  background: #1a1a1a; } /* circular */

  .p-bio { font-size: 11px; color: #999; line-height: 1.5; margin-bottom: 10px; }

  /* Stats */
  .p-stats { display: flex; margin-bottom: 12px; border-top: 1px solid #1a1a1a; border-bottom: 1px solid #1a1a1a; padding: 8px 0; }
  .p-stat   { flex: 1; text-align: center; }
  .p-stat-divider { width: 1px; background: #1a1a1a; margin: 4px 0; }

  .p-stat-num   { font-size: 15px; font-weight: 700; color: white; }
  .p-stat-label { font-size: 9px; color: #555; margin-top: 1px; }

  /* Botões de ação */
  .p-actions { display: flex; gap: 8px; margin-bottom: 10px; }
  .btn-follow { flex: 1; background: #E8640A; color: white; font-size: 12px; font-weight: 700; padding: 9px 0; border-radius: 10px; text-align: center; }
  .btn-msg    { flex: 1; background: #1a1a1a; color: white; font-size: 12px; padding: 9px 0; border-radius: 10px; text-align: center; border: 1px solid #2a2a2a; }
  .btn-more   { width: 36px; background: #1a1a1a; color: #888; font-size: 16px; padding: 9px 0; border-radius: 10px; text-align: center; border: 1px solid #2a2a2a; flex-shrink: 0; }

  /* Pills de ação rápida — SÓ para estabelecimento */
  .p-pills { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }

  .p-pills::-webkit-scrollbar { display: none; }
  .p-pill {
    display: flex; align-items: center; gap: 4px; flex-shrink: 0;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 20px; padding: 6px 12px;
    font-size: 11px; color: #aaa; cursor: pointer;
  }

  /* Banner API */
  .api-banner {
    margin-top: 8px; background: #1A1000;
    border: 1px solid #E8640A33; border-radius: 8px;
    padding: 8px 10px; display: flex; align-items: flex-start; gap: 8px;
  }
  .api-banner-text { font-size: 10px; color: #aaa; line-height: 1.5; }
  .api-banner-text span { color: #E8640A; font-weight: 700; }

  /* ── Abas ── */
  .p-tabs {
    display: flex; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a;
    position: sticky; top: 0; z-index: 10;
    flex-shrink: 0;
  }
  .p-tab {

    flex: 1; text-align: center;
    padding: 10px 0; font-size: 11px;
    color: #555; cursor: pointer;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
  }
  .p-tab.active { color: white; border-bottom-color: #E8640A; font-weight: 700; }

  /* ── Conteúdo das abas ── */
  .p-content { flex: 1; overflow-y: auto; background: #0D0D0D; }
  .p-content::-webkit-scrollbar { display: none; }

  /* Aba Tudo */
  .info-block { padding: 12px 14px; border-bottom: 1px solid #111; }
  .info-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 11px; color: #888; }
  .info-row:last-child { margin-bottom: 0; }
  .info-icon { font-size: 13px; width: 18px; flex-shrink: 0; }
  .info-val  { color: #ccc; }
  .open-badge  { background: #1A7A4A; color: white; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-left: 4px; }


  /* Tags de serviço */
  .tags-wrap { padding: 10px 14px; border-bottom: 1px solid #111; }
  .tags-label { font-size: 9px; color: #444; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 7px; font-weight: 700; }
  .tags-row { display: flex; flex-wrap: wrap; gap: 5px; }
  .tag { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 16px; padding: 4px 10px; font-size: 10px; color: #888; }

  /* Momentos (stories) */
  .moments-wrap { padding: 10px 14px; border-bottom: 1px solid #111; }
  .moments-label { font-size: 9px; color: #444; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
  .moments-row { display: flex; gap: 10px; overflow-x: auto; }
  .moments-row::-webkit-scrollbar { display: none; }
  .moment-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }

  .moment-avatar {
    width: 50px; height: 50px; border-radius: 50%;
    background: #1a1a1a; border: 2px solid #E8640A;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .moment-name { font-size: 9px; color: #666; }

  /* Separador de posts */
  .posts-sep {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px 8px;
  }
  .sep-line { flex: 1; height: 1px; background: #1a1a1a; }
  .sep-text { font-size: 10px; color: #444; letter-spacing: 1px; text-transform: uppercase; }

  /* Post estilo Facebook */
  .post-item { padding: 10px 14px; border-bottom: 1px solid #111; }
  .post-header { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
  .post-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;

    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .post-meta { flex: 1; }
  .post-name { font-size: 12px; font-weight: 700; color: white; }
  .post-time { font-size: 10px; color: #555; }
  .post-img  {
    width: 100%; height: 130px; border-radius: 10px;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin-bottom: 7px;
  }
  .post-caption { font-size: 11px; color: #aaa; line-height: 1.5; margin-bottom: 7px; }
  .post-actions { display: flex; gap: 14px; }
  .post-action  { font-size: 11px; color: #555; display: flex; align-items: center; gap: 4px; }
  .post-action.active { color: #E8640A; }

  /* Aba Mídia — grid */
  .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 2px; }

  .media-item {
    aspect-ratio: 1; background: #1a1a1a;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }

  /* Aba Avaliações */
  .review-summary { padding: 14px; border-bottom: 1px solid #111; text-align: center; }
  .review-score { font-size: 36px; font-weight: 900; color: white; }
  .review-stars { color: #E8640A; font-size: 18px; margin: 4px 0; }
  .review-count { font-size: 11px; color: #555; }
  .review-item  { padding: 10px 14px; border-bottom: 1px solid #111; }
  .reviewer-name { font-size: 12px; font-weight: 700; color: white; }
  .reviewer-stars { color: #E8640A; font-size: 11px; }
  .reviewer-text  { font-size: 11px; color: #888; margin-top: 4px; line-height: 1.5; }

  /* Aba Serviços */
  .service-item {
    display: flex; align-items: center; justify-content: space-between;

    padding: 12px 14px; border-bottom: 1px solid #111;
  }
  .svc-name  { font-size: 13px; font-weight: 700; color: white; }
  .svc-desc  { font-size: 11px; color: #666; margin-top: 2px; }
  .svc-price { font-size: 14px; font-weight: 700; color: #E8640A; flex-shrink: 0; }

  /* ── Barra de navegação v3 ── */
  .bottom-nav {
    border-top: 1px solid #1A1A1A;
    display: flex; align-items: center; justify-content: space-around;
    padding: 10px 0 16px; background: #0D0D0D; flex-shrink: 0;
  }
  .nav-tab    { text-align: center; cursor: pointer; }
  .nav-icon   { font-size: 20px; color: #555; }
  .nav-lbl    { font-size: 9px; color: #555; margin-top: 2px; }
  .nav-center {
    width: 50px; height: 50px; border-radius: 50%;
    background: #E8640A; display: flex; align-items: center;
    justify-content: center; font-size: 20px; margin-top: -10px;

    box-shadow: 0 0 18px rgba(232,100,10,0.6);
  }

  /* ── Tabela diff ── */
  .diff-table {
    width: 100%; max-width: 900px; margin: 0 auto 40px;
    border-collapse: collapse; border-radius: 12px; overflow: hidden;
  }
  .diff-table th {
    background: #1a1a1a; color: #E8640A; font-size: 11px;
    font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 12px 16px; text-align: left;
    border-bottom: 1px solid #2a2a2a;
  }
  .diff-table td {
    padding: 10px 16px; font-size: 11px; color: #888;
    border-bottom: 1px solid #111; vertical-align: top;
    background: #111;
  }
  .diff-table td:first-child { color: #ccc; font-weight: 700; background: #161616; width: 200px; }
  .diff-table .yes { color: #27ae60; }
  .diff-table .no  { color: #555; }
  .diff-table .hl  { color: #E8640A; }

</style>
</head>
<body>

  <div class="page-title">T_PERFIL — Template Universal</div>
  <div class="page-sub">Perfil de Estabelecimento + Perfil de Usuário · Mesma base, variações por tipo</div>

  <!-- ─── SEÇÃO 1: PERFIL DE ESTABELECIMENTO ─────────────────────────── -->
  <div class="section-divider">
    <div class="line"></div>
    <div class="label">🏪 Perfil de Estabelecimento</div>
    <div class="line"></div>
  </div>

  <div class="phones-row">

    <!-- Aba: Tudo -->
    <div class="phone-wrap">
      <div class="phone-label">Aba: Tudo</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="p-nav">
          <div class="back-btn">←</div>
          <div class="p-nav-icons">
            <div class="p-nav-icon">🔍</div>
            <div class="p-nav-icon">♡</div>

            <div class="p-nav-icon">⎙</div>
            <div class="p-nav-icon">⋯</div>
          </div>
        </div>

        <div class="p-header">
          <div class="p-identity">
            <div class="p-info">
              <div class="p-name">Barbearia Vintage</div>
              <div class="p-handle">@barbeariaVintage</div>
              <div class="p-category">✂️ Beleza · Barbearia</div>
              <div class="p-verified">✓ Perfil verificado pelo dono</div>
            </div>
            <!-- Avatar QUADRADO ARREDONDADO = estabelecimento -->
            <div class="p-avatar estab">✂️</div>
          </div>

          <div class="p-bio">Barbearia especializada em cortes clássicos e modernos. Atendemos com hora marcada. No coração da Vila Madalena.</div>

          <div class="p-stats">

            <div class="p-stat"><div class="p-stat-num">1.2k</div><div class="p-stat-label">Seguidores</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">4.8★</div><div class="p-stat-label">Avaliação</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">184</div><div class="p-stat-label">Avaliações</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">320m</div><div class="p-stat-label">de você</div></div>
          </div>

          <div class="p-actions">
            <div class="btn-follow">+ Seguir</div>
            <div class="btn-msg">💬 Mensagem</div>
            <div class="btn-more">⋯</div>
          </div>


          <div class="p-pills">
            <div class="p-pill">📞 Ligar</div>
            <div class="p-pill">📍 Como chegar</div>
            <div class="p-pill">⎙ Compartilhar</div>
            <div class="p-pill">♡ Salvar</div>
          </div>
        </div>

        <div class="p-tabs">
          <div class="p-tab active">Tudo</div>
          <div class="p-tab">Mídia</div>
          <div class="p-tab">Depoim.</div>
          <div class="p-tab">Aval.</div>
          <div class="p-tab">Serviços</div>
        </div>

        <div class="p-content">
          <div class="info-block">
            <div class="info-row"><span class="info-icon">🕐</span><span class="info-val">Seg–Sáb 9h–20h · Dom 10h–18h</span><span class="open-badge">ABERTO</span></div>
            <div class="info-row"><span class="info-icon">📍</span><span class="info-val">R. Harmonia, 88 · Vila Madalena, SP</span></div>

            <div class="info-row"><span class="info-icon">📱</span><span class="info-val">(11) 98765-4321</span></div>
            <div class="info-row"><span class="info-icon">🌐</span><span class="info-val">barbeariaVintage.com.br</span></div>
          </div>

          <div class="tags-wrap">
            <div class="tags-label">Serviços</div>
            <div class="tags-row">
              <div class="tag">Corte clássico</div>
              <div class="tag">Barba</div>
              <div class="tag">Sobrancelha</div>
              <div class="tag">Hidratação</div>
              <div class="tag">Combo completo</div>
            </div>
          </div>

          <div class="moments-wrap">
            <div class="moments-label">Momentos</div>
            <div class="moments-row">
              <div class="moment-item"><div class="moment-avatar">✂️</div><div class="moment-name">hoje</div></div>

              <div class="moment-item"><div class="moment-avatar" style="border-color:#2a2a2a;">💈</div><div class="moment-name">seg</div></div>
              <div class="moment-item"><div class="moment-avatar" style="border-color:#2a2a2a;">🪑</div><div class="moment-name">sáb</div></div>
            </div>
          </div>

          <div class="posts-sep">
            <div class="sep-line"></div>
            <div class="sep-text">Publicações</div>
            <div class="sep-line"></div>
          </div>

          <div class="post-item">
            <div class="post-header">
              <div class="post-avatar">✂️</div>
              <div class="post-meta">
                <div class="post-name">Barbearia Vintage</div>
                <div class="post-time">2h atrás</div>
              </div>

            </div>
            <div class="post-img">💈</div>
            <div class="post-caption">Novo ambiente renovado! Venha conferir nosso espaço. 🔥</div>
            <div class="post-actions">
              <div class="post-action active">👍 47</div>
              <div class="post-action">💬 8</div>
              <div class="post-action">↗ Repostar</div>
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

    <!-- Aba: Avaliações -->
    <div class="phone-wrap">
      <div class="phone-label">Aba: Avaliações</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="p-nav">
          <div class="back-btn">←</div>
          <div class="p-nav-icons">
            <div class="p-nav-icon">🔍</div>
            <div class="p-nav-icon">♡</div>
            <div class="p-nav-icon">⎙</div>
            <div class="p-nav-icon">⋯</div>
          </div>
        </div>

        <div class="p-header">
          <div class="p-identity">
            <div class="p-info">
              <div class="p-name">Barbearia Vintage</div>
              <div class="p-handle">@barbeariaVintage</div>

              <div class="p-category">✂️ Beleza · Barbearia</div>
            </div>
            <div class="p-avatar estab">✂️</div>
          </div>
          <div class="p-stats">
            <div class="p-stat"><div class="p-stat-num">1.2k</div><div class="p-stat-label">Seguidores</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">4.8★</div><div class="p-stat-label">Avaliação</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">184</div><div class="p-stat-label">Avaliações</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">320m</div><div class="p-stat-label">de você</div></div>
          </div>
          <div class="p-actions">

            <div class="btn-follow" style="background:#1a1a1a; border:1px solid #E8640A; color:#E8640A;">✓ Seguindo</div>
            <div class="btn-msg">💬 Mensagem</div>
            <div class="btn-more">⋯</div>
          </div>
        </div>

        <div class="p-tabs">
          <div class="p-tab">Tudo</div>
          <div class="p-tab">Mídia</div>
          <div class="p-tab">Depoim.</div>
          <div class="p-tab active">Aval.</div>
          <div class="p-tab">Serviços</div>
        </div>

        <div class="p-content">
          <div class="review-summary">
            <div class="review-score">4.8</div>
            <div class="review-stars">★★★★★</div>
            <div class="review-count">184 avaliações</div>
          </div>
          <!-- Campo avaliar -->
          <div style="padding:10px 14px; border-bottom:1px solid #111; display:flex; align-items:center; gap:8px; cursor:pointer;">

            <div style="width:32px; height:32px; border-radius:50%; background:#1a1a1a; display:flex; align-items:center; justify-content:center; font-size:14px;">👤</div>
            <div style="flex:1;">
              <div style="font-size:11px; color:#555;">O que você achou?</div>
              <div style="color:#E8640A; font-size:14px; margin-top:2px;">☆☆☆☆☆</div>
            </div>
          </div>
          <div class="review-item">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <div class="reviewer-name">@maria</div>
              <div class="reviewer-stars">★★★★★</div>
            </div>
            <div class="reviewer-text">"Melhor barbearia da Vila Madalena. Atendimento impecável e resultado perfeito!"</div>
          </div>

          <div class="review-item">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <div class="reviewer-name">@pedro_sp</div>
              <div class="reviewer-stars">★★★★☆</div>
            </div>
            <div class="reviewer-text">"Ótimo corte, mas esperei 15 min além do horário marcado."</div>
          </div>
          <div style="padding:12px 14px; text-align:center; font-size:12px; color:#E8640A; cursor:pointer;">Ver todas as avaliações →</div>
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

    <!-- Aba: Serviços -->
    <div class="phone-wrap">
      <div class="phone-label">Aba: Serviços</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="p-nav">
          <div class="back-btn">←</div>
          <div class="p-nav-icons">
            <div class="p-nav-icon">🔍</div>
            <div class="p-nav-icon">♡</div>
            <div class="p-nav-icon">⎙</div>
            <div class="p-nav-icon">⋯</div>
          </div>
        </div>

        <div class="p-header">
          <div class="p-identity">
            <div class="p-info">

              <div class="p-name">Barbearia Vintage</div>
              <div class="p-handle">@barbeariaVintage</div>
              <div class="p-category">✂️ Beleza · Barbearia</div>
            </div>
            <div class="p-avatar estab">✂️</div>
          </div>
          <div class="p-actions">
            <div class="btn-follow">+ Seguir</div>
            <div class="btn-msg">💬 Mensagem</div>
            <div class="btn-more">⋯</div>
          </div>
        </div>

        <div class="p-tabs">
          <div class="p-tab">Tudo</div>
          <div class="p-tab">Mídia</div>
          <div class="p-tab">Depoim.</div>
          <div class="p-tab">Aval.</div>
          <div class="p-tab active">Serviços</div>
        </div>

        <div class="p-content">
          <div style="padding:10px 14px 4px; font-size:9px; color:#444; letter-spacing:1px; text-transform:uppercase; font-weight:700;">CORTES</div>

          <div class="service-item"><div><div class="svc-name">Corte clássico</div><div class="svc-desc">Tesoura ou máquina · ~40min</div></div><div class="svc-price">R$ 45</div></div>
          <div class="service-item"><div><div class="svc-name">Corte navalhado</div><div class="svc-desc">Acabamento perfeito · ~50min</div></div><div class="svc-price">R$ 55</div></div>
          <div style="padding:10px 14px 4px; font-size:9px; color:#444; letter-spacing:1px; text-transform:uppercase; font-weight:700; border-top:1px solid #111;">BARBA</div>
          <div class="service-item"><div><div class="svc-name">Barba completa</div><div class="svc-desc">Toalha quente + navalha · ~35min</div></div><div class="svc-price">R$ 40</div></div>
          <div style="padding:10px 14px 4px; font-size:9px; color:#444; letter-spacing:1px; text-transform:uppercase; font-weight:700; border-top:1px solid #111;">COMBOS</div>

          <div class="service-item"><div><div class="svc-name">Corte + Barba</div><div class="svc-desc">O mais pedido · ~70min</div></div><div class="svc-price">R$ 75</div></div>
          <div style="padding:12px 14px; text-align:center; font-size:12px; color:#E8640A; cursor:pointer;">Ver catálogo completo →</div>
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

    <!-- Perfil não assumido (via API) -->
    <div class="phone-wrap">
      <div class="phone-label">Perfil via API (não assumido)</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="p-nav">
          <div class="back-btn">←</div>
          <div class="p-nav-icons">
            <div class="p-nav-icon">♡</div>
            <div class="p-nav-icon">⎙</div>
            <div class="p-nav-icon">⋯</div>
          </div>
        </div>

        <div class="p-header">
          <div class="p-identity">
            <div class="p-info">
              <div class="p-name">Restaurante Bom Sabor</div>
              <div class="p-handle" style="color:#E8640A; font-size:10px;">Perfil via Google Maps</div>
              <div class="p-category">🍽️ Gastronomia · Restaurante</div>

            </div>
            <div class="p-avatar estab">🍽️</div>
          </div>

          <div class="p-stats">
            <div class="p-stat"><div class="p-stat-num">238</div><div class="p-stat-label">Seguidores</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">4.3★</div><div class="p-stat-label">Google</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">97</div><div class="p-stat-label">Aval.</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">1.2km</div><div class="p-stat-label">de você</div></div>
          </div>

          <div class="p-actions">
            <div class="btn-follow">+ Seguir</div>

            <div class="btn-msg">💬 Mensagem</div>
            <div class="btn-more">⋯</div>
          </div>
          <div class="p-pills">
            <div class="p-pill">📍 Como chegar</div>
            <div class="p-pill">⎙ Compartilhar</div>
          </div>

          <!-- Banner API -->
          <div class="api-banner">
            <span style="font-size:16px;">🏪</span>
            <div class="api-banner-text">
              É o dono deste negócio? <span>Assuma este perfil →</span> e gerencie suas informações, fotos e horários.
            </div>
          </div>
        </div>

        <div class="p-tabs">
          <div class="p-tab active">Tudo</div>
          <div class="p-tab">Mídia</div>
          <div class="p-tab">Depoim.</div>
          <div class="p-tab">Aval.</div>
        </div>


        <div class="p-content">
          <div class="info-block">
            <div class="info-row"><span class="info-icon">📍</span><span class="info-val">Av. Paulista, 1000 · Bela Vista, SP</span></div>
            <div class="info-row"><span class="info-icon">🕐</span><span class="info-val">Dados via Google Maps</span></div>
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

  </div>

  <!-- ─── SEÇÃO 2: PERFIL DE USUÁRIO ─────────────────────────────────── -->
  <div class="section-divider">
    <div class="line"></div>
    <div class="label">👤 Perfil de Usuário</div>
    <div class="line"></div>
  </div>

  <div class="diff-note">
    Diferenças principais: <span>avatar circular</span> (não quadrado) · <span>sem pills de ação rápida</span> · stats mostram <span>Seguindo</span> (não avaliação/distância) · <span>sem abas Avaliações e Serviços</span>
  </div>

  <div class="phones-row">

    <!-- Perfil de usuário - aba Tudo -->
    <div class="phone-wrap">
      <div class="phone-label">Aba: Tudo</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="p-nav">
          <div class="back-btn">←</div>

          <div class="p-nav-icons">
            <div class="p-nav-icon">🔍</div>
            <div class="p-nav-icon">♡</div>
            <div class="p-nav-icon">⎙</div>
            <div class="p-nav-icon">⋯</div>
          </div>
        </div>

        <div class="p-header">
          <div class="p-identity">
            <div class="p-info">
              <div class="p-name">Carolina Souza</div>
              <div class="p-handle">@carolina</div>
              <div class="p-category">Designer · São Paulo</div>
            </div>
            <!-- Avatar CIRCULAR = usuário -->
            <div class="p-avatar user">👩</div>
          </div>

          <div class="p-bio">Apaixonada por design, comida e lugares novos. Explorando SP um bairro por vez ☕</div>

          <div class="p-stats">
            <div class="p-stat"><div class="p-stat-num">843</div><div class="p-stat-label">Seguidores</div></div>

            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">291</div><div class="p-stat-label">Seguindo</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">67</div><div class="p-stat-label">Posts</div></div>
          </div>

          <div class="p-actions">
            <div class="btn-follow">+ Seguir</div>
            <div class="btn-msg">💬 Mensagem</div>
            <div class="btn-more">⋯</div>
          </div>
          <!-- SEM pills de ação rápida -->
        </div>

        <!-- Abas SEM Avaliações e SEM Serviços -->
        <div class="p-tabs">
          <div class="p-tab active">Tudo</div>
          <div class="p-tab">Mídia</div>
          <div class="p-tab">Depoim.</div>
        </div>


        <div class="p-content">
          <div class="moments-wrap">
            <div class="moments-label">Momentos</div>
            <div class="moments-row">
              <div class="moment-item"><div class="moment-avatar">👩</div><div class="moment-name">hoje</div></div>
              <div class="moment-item"><div class="moment-avatar" style="border-color:#2a2a2a;">☕</div><div class="moment-name">sex</div></div>
            </div>
          </div>

          <div class="posts-sep">
            <div class="sep-line"></div>
            <div class="sep-text">Publicações</div>
            <div class="sep-line"></div>
          </div>

          <div class="post-item">
            <div class="post-header">
              <div class="post-avatar">👩</div>
              <div class="post-meta">

                <div class="post-name">@carolina</div>
                <div class="post-time" style="color:#E8640A; font-size:10px;">📍 Café Ponto Certo</div>
              </div>
            </div>
            <div class="post-img">☕</div>
            <div class="post-caption">Melhor café da Vila! Imperdível 🙌</div>
            <div class="post-actions">
              <div class="post-action active">👍 51</div>
              <div class="post-action">💬 12</div>
              <div class="post-action">↗ Repostar</div>
            </div>
          </div>

          <div class="post-item">
            <div class="post-header">
              <div class="post-avatar">👩</div>
              <div class="post-meta">
                <div class="post-name">@carolina</div>
                <div class="post-time">3 dias</div>

              </div>
            </div>
            <div class="post-img">🍕</div>
            <div class="post-caption">Sexta de pizza 🍕❤️</div>
            <div class="post-actions">
              <div class="post-action">👍 34</div>
              <div class="post-action">💬 5</div>
              <div class="post-action">↗ Repostar</div>
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

    <!-- Aba Mídia -->
    <div class="phone-wrap">
      <div class="phone-label">Aba: Mídia</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="p-nav">
          <div class="back-btn">←</div>
          <div class="p-nav-icons">
            <div class="p-nav-icon">♡</div>
            <div class="p-nav-icon">⎙</div>
            <div class="p-nav-icon">⋯</div>
          </div>
        </div>

        <div class="p-header">
          <div class="p-identity">
            <div class="p-info">
              <div class="p-name">Carolina Souza</div>
              <div class="p-handle">@carolina</div>
              <div class="p-category">Designer · São Paulo</div>
            </div>
            <div class="p-avatar user">👩</div>

          </div>
          <div class="p-stats">
            <div class="p-stat"><div class="p-stat-num">843</div><div class="p-stat-label">Seguidores</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">291</div><div class="p-stat-label">Seguindo</div></div>
            <div class="p-stat-divider"></div>
            <div class="p-stat"><div class="p-stat-num">67</div><div class="p-stat-label">Posts</div></div>
          </div>
          <div class="p-actions">
            <div class="btn-follow" style="background:#1a1a1a; border:1px solid #E8640A; color:#E8640A;">✓ Seguindo</div>
            <div class="btn-msg">💬 Mensagem</div>
            <div class="btn-more">⋯</div>
          </div>
        </div>

        <div class="p-tabs">

          <div class="p-tab">Tudo</div>
          <div class="p-tab active">Mídia</div>
          <div class="p-tab">Depoim.</div>
        </div>

        <div class="p-content">
          <div class="media-grid">
            <div class="media-item">☕</div>
            <div class="media-item">🍕</div>
            <div class="media-item">🌆</div>
            <div class="media-item">🎵</div>
            <div class="media-item">🍣</div>
            <div class="media-item">🌿</div>
            <div class="media-item">🏙️</div>
            <div class="media-item">🍹</div>
            <div class="media-item">🌸</div>
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

  </div>

  <!-- ─── TABELA COMPARATIVA ─────────────────────────────────────────── -->
  <div class="section-divider">
    <div class="line"></div>
    <div class="label">Comparativo — Estabelecimento vs Usuário</div>
    <div class="line"></div>
  </div>

  <table class="diff-table">
    <tr><th>Elemento</th><th>🏪 Estabelecimento</th><th>👤 Usuário</th></tr>
    <tr><td>Avatar</td><td class="hl">Quadrado arredondado (radius 16px)</td><td class="hl">Circular (radius 50%)</td></tr>
    <tr><td>Stats linha 1</td><td>Seguidores</td><td>Seguidores</td></tr>

    <tr><td>Stats linha 2</td><td class="hl">Avaliação ★ (média Google/app)</td><td class="hl">Seguindo</td></tr>
    <tr><td>Stats linha 3</td><td class="hl">Nº de avaliações</td><td class="hl">Posts</td></tr>
    <tr><td>Stats linha 4</td><td class="hl">Distância de você</td><td class="no">— não aplicável</td></tr>
    <tr><td>Pills de ação</td><td class="yes">✓ 📞 Ligar · 📍 Chegar · ⎙ · ♡</td><td class="no">✗ Sem pills</td></tr>
    <tr><td>Aba Tudo — infos</td><td>Horário · Endereço · Tel · Site · Tags</td><td>Bio expandida · Localização · Interesses</td></tr>
    <tr><td>Aba Avaliações</td><td class="yes">✓ Nota + avaliações com texto</td><td class="no">✗ Não existe</td></tr>
    <tr><td>Aba Serviços</td><td class="yes">✓ Catálogo → T_CATALOGO</td><td class="no">✗ Não existe</td></tr>

    <tr><td>Banner API</td><td class="yes">✓ "Assumir este perfil →"</td><td class="no">✗ Não aplicável</td></tr>
    <tr><td>Badge verificado</td><td>"✓ Perfil verificado pelo dono"</td><td>"✓ Perfil verificado" (só verificados)</td></tr>
    <tr><td>Visão própria</td><td>Editar + Métricas semana + Gerenciador</td><td>Editar perfil + Config privacidade</td></tr>
  </table>

</body>
</html>

