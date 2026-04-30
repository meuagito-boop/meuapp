MEU AGITO
REDE_SOCIAL_COMPLETA
Arquitetura de telas — Especificação completa v3
T_STORY · T_SUGESTOES · T_CHAT
Três componentes sociais — documentados em arquivo único
Conteúdo deste documento
Seção A	T_STORY — Visualizador de Stories / Momentos (páginas 1–4)
Seção B	T_SUGESTOES — Carrossel de Sugestões inline no feed (páginas 4–6)
Seção C	T_CHAT — Sistema de Mensagens (páginas 6–10)
Seção D	Regras de Negócio Unificadas (página 10)
Seção E	Mockup HTML de Referência Visual (página 11+)

  A. T_STORY — Visualizador de Stories / Momentos

A.1 Identificação
Código	T_STORY
Nome	Visualizador de Stories / Momentos
Tipo	Tela imersiva em tela cheia. Sobrepõe qualquer tela de origem.
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0 — publicação e visualização. Fase 1.2+ — reações e enquetes.
Como é acessado	(1) Toque em story na linha de stories do T_AGITO | (2) Toque em 'Momentos' no T_PERFIL
Tela de origem	T_AGITO (principal) | T_PERFIL. Ao fechar: retorna à origem.
Duração do story	Foto: 7 segundos padrão. Vídeo: até 60 segundos ou duração do vídeo.
Expira em	24 horas após a publicação. After: story some automaticamente.

A.2 Estrutura Visual
Fundo	Preto puro #000000 — tela cheia sem bordas ou padding.
Barras de progresso	Topo: N segmentos finos (2px) — um por story do perfil atual. Cinza base, laranja completo, animado o ativo.
Gradiente topo	Overlay rgba(0,0,0,0.5) do topo para transparente — protege as barras e o header.
Gradiente base	Overlay rgba(0,0,0,0.7) de baixo para transparente — protege o footer.
Mídia	Foto ou vídeo ocupando 100% da tela. Crop centralizado, aspect-ratio 9:16 preferido.
Texto sobreposto	Texto em bold branco com text-shadow. Centralizado na área da mídia.

A.3 Header do Story
Elemento	Especificação	Ação
Avatar do autor	Circular 36x36px. Borda 2px laranja #E8640A.	Abre T_PERFIL do autor
Nome do autor	Arial Bold 13px branco.	Abre T_PERFIL do autor
Tempo decorrido	Arial Regular 11px rgba(255,255,255,0.6).	Sem ação
⋯ Opções	18px branco. Área 44x44px.	Sheet: Denunciar | Silenciar | Copiar link
✕ Fechar	18px branco. Área 44x44px. Extremo direito.	Fecha o visualizador — retorna à origem

A.4 Footer do Story
Elemento	Especificação	Ação
Campo 'Responder'	Pill arredondado. Fundo rgba(255,255,255,0.15). Texto 'Responder ao story...' #rgba(255,255,255,0.6).	Pausa story + abre T_CHAT com referência ao story
↗ Compartilhar	Ícone 22px branco. À direita do campo de resposta.	Sheet nativo de compartilhamento do story
👁 X visualizações	Exibido apenas para o AUTOR do story. Não visível para outros usuários.	Abre lista de quem visualizou

Decisão de produto: stories NÃO têm reações de emoji. A única forma de interagir é via campo 'Responder' que abre o T_CHAT com referência ao story. Isso mantém as interações mais significativas.

A.5 Gestos e Navegação
Gesto	Comportamento	Observação
Toque direito	Avança para o próximo story do mesmo perfil. Se último: vai para o próximo perfil na linha.	Zona: 60% direita da tela
Toque esquerdo	Volta para o story anterior do mesmo perfil. Se primeiro: vai ao perfil anterior.	Zona: 40% esquerda da tela
Press & hold	Pausa o story e a barra de progresso. Soltar retoma do ponto atual.	Qualquer posição na tela
Swipe para baixo	Fecha o visualizador com animação de saída para baixo.	Velocidade > 400px/s
Swipe esquerda	Vai para o próximo perfil na linha de stories.	Animação de slide
Swipe direita	Volta ao perfil anterior na linha de stories.	Animação de slide

A.6 Regras de Negócio — T_STORY
RN-A01 — Stories expiram em 24 horas
Após 24h da publicação, o story é removido automaticamente. Não aparece mais na linha de stories nem no T_PERFIL.
RN-A02 — Sem reações de emoji
Stories não têm botões de reação. A única interação disponível é o campo 'Responder' que abre o T_CHAT com referência visual ao story.
RN-A03 — Visualizações visíveis só para o autor
O contador '👁 X visualizações' só aparece quando o usuário está assistindo o próprio story. Outros usuários não veem este número.
RN-A04 — Duração: foto 7s, vídeo até 60s
Fotos ficam 7 segundos. Vídeos ficam o tempo do vídeo, máximo 60 segundos. A barra de progresso reflete a duração exata.

  B. T_SUGESTOES — Carrossel de Sugestões inline

B.1 Identificação
Código	T_SUGESTOES
Nome	Carrossel de Sugestões de Quem Seguir
Tipo	Componente inline — aparece dentro do feed do T_AGITO, não é uma tela separada.
Fase	Fase 1.0 — ativo desde o lançamento.
Onde aparece	Dentro do feed do T_AGITO, entre posts normais. Posição variável — calculada pelo backend.
Quando aparece	Usuários com menos de 10 seguidos. Some quando usuário atinge 10 ou mais seguidos.
Objetivo	Acelerar a construção do grafo social. Usuário com feed rico engaja mais.

B.2 Estrutura do Card
Container	Card background #1A1A1A, border-radius 14px, borda 1px #2A2A2A. Padding 12px interno.
Header do card	'Sugestões para você' à esquerda + 'Não tenho interesse' cinza à direita.
Scroll horizontal	Carrossel com snap. Até 10 sugestões. Peek do próximo item visível.
Proporção	~50% pessoas / ~50% estabelecimentos. Misturados aleatoriamente.

B.3 Item de Sugestão
Elemento	Especificação	Ação
Avatar	52x52px. Pessoa: circular. Estabelecimento: border-radius 14px.	Abre T_PERFIL
Nome / handle	9px cinza. Truncado com ellipsis em 72px.	Abre T_PERFIL
Tipo	8px #555. 'Usuário · SP' | 'Barbearia · 320m'.	Sem ação
Botão Seguir	Fundo laranja #E8640A. 9px bold. Padding 4px 10px. Border-radius 6px.	Segue inline — botão muda para 'Seguindo'
Botão Seguindo	Fundo transparente, borda laranja, texto laranja. Indica que já segue.	Toque: abre confirmação para deixar de seguir

B.4 Regras de Negócio — T_SUGESTOES
RN-B01 — Aparece para usuários com < 10 seguidos
O carrossel aparece quando o usuário segue menos de 10 perfis. Ao atingir 10, some definitivamente do feed.
RN-B02 — Seguir é inline — sem navegação
O botão 'Seguir' executa a ação sem abrir o T_PERFIL. O botão muda para 'Seguindo' imediatamente sem recarregar o card.
RN-B03 — 'Não tenho interesse' some permanentemente
Se o usuário tocar em 'Não tenho interesse', o card desaparece e não volta mais naquela sessão. Backend registra a preferência.
RN-B04 — Algoritmo de sugestão
Critérios: amigos de amigos | mesma cidade | categorias de interesse (do T05a) | estabelecimentos próximos (raio 5km).

  C. T_CHAT — Sistema de Mensagens

C.1 Identificação
Código	T_CHAT
Nome	Sistema de Mensagens — Chat Direto
Tipo	Duas telas: lista de conversas + conversa individual.
Plataforma	iOS e Android.
Fase	Fase 1.0 — texto e mídia. Fase 1.2+ — chamadas de voz.
Como é acessado	(1) Ícone 💬 no header | (2) Botão 💬 Mensagem no T_PERFIL | (3) Resposta a story no T_STORY
Abas	Pessoas — Estabelecimentos. Separa conversas por tipo.
Notificação push	Mensagem nova envia push mesmo com app fechado.
Badge	Badge no 💬 do header conta total de mensagens não lidas nas duas abas.

C.2 Lista de Conversas
Header	← Voltar + 'Mensagens' + ✏️ Nova conversa.
Abas	Pessoas | Estabelecimentos. Aba ativa: texto branco + borda laranja. Inativa: cinza.
Item de conversa	Avatar (circular: pessoa | arredondado: estab) + nome + última mensagem truncada + hora + badge.
Online dot	Ponto verde 10px no canto inferior direito do avatar. Aparece quando usuário está online.
Badge não lidas	Círculo laranja 18px com número. Aparece à direita quando há mensagens não lidas.
Última mensagem	Prefixo 'Você: ' quando a última mensagem foi enviada pelo usuário. Emoji para mídia: '📷 Foto' | '🎵 Áudio'.
Ordenação	Mais recente no topo. Conversas com não lidas sempre acima das lidas.
Swipe esquerdo	Revela botão vermelho 'Arquivar'. Conversa some da lista mas não é deletada.

C.3 Tela de Conversa Individual
C.3.1 Header da conversa
← Voltar	Retorna para a lista de conversas.
Avatar + nome	Avatar 38px + nome bold + status ('online agora' | 'visto há 2h').
📞 Ligar	Fase 1.2+ — chamada de voz. Fase 1.0: inativo.
⋯ Opções	Sheet: Ver perfil | Silenciar | Bloquear | Limpar conversa.

C.3.2 Tipos de mensagem
Tipo	Especificação	Observação
Texto recebido	Bubble #1A1A1A. Texto branco 13px. Border-bottom-left-radius 4px.	Alinhado à esquerda
Texto enviado	Bubble laranja #E8640A. Texto branco 13px. Border-bottom-right-radius 4px.	Alinhado à direita
Foto recebida	140x100px preview com border-radius 12px. Toque: abre tela cheia.	Sem bubble de texto
Foto enviada	Mesmo formato. Alinhada à direita.	
Áudio	Pill com ícone de play + barra de progresso + duração.	Fase 1.0
Referência story	Card com thumbnail do story + label 'Respondeu ao seu story'. Acima da mensagem.	Referência visual ao story que gerou a conversa
Confirmação lida	✓ = enviada | ✓✓ = entregue | ✓✓ azul = lida.	Fase 1.2+

C.3.3 Indicador 'está digitando'
Visual	Três dots animados com easing suave + texto '@handle está digitando...' em #555.
Quando aparece	Quando o outro usuário começa a digitar. Desaparece após 3s sem digitação ou ao enviar mensagem.

C.3.4 Input de mensagem
Campo de texto	Pill border-radius 18px. Fundo #1A1A1A. Expande verticalmente até 4 linhas.
📷 Câmera	Abre câmera ou galeria para enviar foto/vídeo.
🎤 Áudio	Press & hold: grava áudio. Soltar: envia. Slide esquerda: cancela.
↗ Enviar	Botão circular laranja. Aparece quando há texto. Substitui o espaço do 🎤 quando digitando.

C.4 Regras de Negócio — T_CHAT
RN-C01 — Abas Pessoas e Estabelecimentos
As conversas são separadas em duas abas por tipo. Badge no 💬 do header conta o total das duas abas.
RN-C02 — Referência visual ao story
Quando uma conversa é iniciada a partir de uma resposta de story, o card de referência aparece acima da primeira mensagem. Mostra thumbnail do story + label.
RN-C03 — Mensagens não expiram
Ao contrário dos stories, mensagens do T_CHAT não têm prazo de validade. Ficam no histórico indefinidamente até o usuário limpar manualmente.
RN-C04 — Notificação push para mensagens novas
Mensagem nova gera push notification mesmo com app fechado. Badge no ícone do app se atualiza.
RN-C05 — Chamadas de voz na Fase 1.2+
O botão 📞 está presente mas inativo na Fase 1.0. Ativo na Fase 1.2+.

  D. Regras de Negócio Unificadas

RN-D01 — Story resposta abre T_CHAT
Responder a um story abre o T_CHAT com referência visual ao story. Não existe reação por emoji — a resposta é sempre via mensagem direta.
RN-D02 — T_SUGESTOES alimenta o T_CHAT
Quando o usuário segue alguém via T_SUGESTOES, uma conversa no T_CHAT é criada automaticamente com mensagem de sistema: 'Vocês agora se seguem mutuamente.'
RN-D03 — Stories de estabelecimentos geram notificação
Quando um estabelecimento seguido publica um story, o usuário recebe notificação push do T13 (Tipo 2 — Estabelecimento).
RN-D04 — Privacidade de stories
Stories são públicos para todos os seguidores. Não existe story para 'melhores amigos' na Fase 1.0.

  E. Mockup HTML — Referência Visual
O código abaixo é o mockup unificado das três telas: T_STORY (2 estados: foto com views de autor, vídeo sem views), T_SUGESTOES (card inline no feed) e T_CHAT (lista de conversas com abas Pessoas/Estabelecimentos, conversa com referência a story e indicador de digitação).

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — Rede Social Completa</title>
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
    margin: 48px 0 28px; width: 100%; max-width: 1100px;
  }
  .section-div .line  { flex: 1; height: 1px; background: #1e1e1e; }

  .section-div .label { color: #E8640A; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; white-space: nowrap; }

  .phones-row { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
  .phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .phone-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  .phone {
    width: 280px; height: 580px;
    background: #0D0D0D; border-radius: 40px;
    border: 6px solid #1e1e1e; overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex; flex-direction: column; position: relative;
  }
  .phone.fullscreen { background: #000; border-radius: 40px; }
  .notch { height: 22px; background: #1e1e1e; border-radius: 0 0 14px 14px; width: 88px; margin: 0 auto; flex-shrink: 0; }


  /* ═══════════════════════════════════════════
     T_STORY — Visualizador de Story
  ═══════════════════════════════════════════ */
  .story-screen {
    position: absolute; inset: 0;
    background: #000;
    display: flex; flex-direction: column;
  }

  /* Barras de progresso */
  .story-bars {
    display: flex; gap: 3px;
    padding: 12px 12px 6px;
    position: relative; z-index: 10;
  }
  .story-bar { flex: 1; height: 2px; border-radius: 1px; background: rgba(255,255,255,0.3); overflow: hidden; }
  .story-bar.done   { background: white; }
  .story-bar.active { background: rgba(255,255,255,0.3); }
  .story-bar.active::after {
    content: ''; display: block; height: 100%;
    width: 60%; background: #E8640A;
    animation: progress 3s linear infinite;
  }
  @keyframes progress { from { width: 0%; } to { width: 100%; } }


  /* Header do story */
  .story-header {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px 10px;
    position: relative; z-index: 10;
  }
  .story-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid #E8640A;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0; background: #1a1a1a;
  }
  .story-author { flex: 1; }
  .story-name { font-size: 13px; font-weight: 700; color: white; }
  .story-time { font-size: 10px; color: rgba(255,255,255,0.6); }
  .story-close { font-size: 18px; color: white; cursor: pointer; }
  .story-opts  { font-size: 18px; color: white; cursor: pointer; margin-right: 6px; }

  /* Mídia do story */
  .story-media {
    flex: 1; display: flex; align-items: center; justify-content: center;

    font-size: 80px; position: relative;
  }
  .story-media.photo { background: linear-gradient(135deg, #1a1205, #3a2a10); }
  .story-media.video { background: linear-gradient(135deg, #0a1a0a, #1a3a1a); }

  /* Texto sobreposto */
  .story-text-overlay {
    position: absolute; bottom: 80px; left: 0; right: 0;
    padding: 0 16px; text-align: center;
    font-size: 16px; font-weight: 700; color: white;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }

  /* Gradientes */
  .story-gradient-top {
    position: absolute; top: 0; left: 0; right: 0; height: 80px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
    z-index: 5;
  }
  .story-gradient-bot {
    position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);

    z-index: 5;
  }

  /* Footer do story */
  .story-footer {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px 16px;
    position: relative; z-index: 10;
  }
  .story-reply {
    flex: 1; height: 38px; border-radius: 20px;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; padding: 0 14px;
    font-size: 12px; color: rgba(255,255,255,0.6);
    cursor: pointer;
  }
  .story-share { font-size: 20px; color: white; cursor: pointer; }

  /* Views counter (só para o autor) */
  .story-views {
    position: absolute; bottom: 58px; left: 14px;
    font-size: 11px; color: rgba(255,255,255,0.8);
    z-index: 10;
    display: flex; align-items: center; gap: 4px;
  }

  /* ═══════════════════════════════════════════
     T_SUGESTOES — Carrossel inline no feed

  ═══════════════════════════════════════════ */
  .feed-context {
    flex: 1; overflow-y: auto; background: #0D0D0D;
  }
  .feed-context::-webkit-scrollbar { display: none; }

  .feed-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 32px 14px 10px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .feed-logo {
    width: 34px; height: 34px; background: #E8640A;
    border-radius: 9px; display: flex; align-items: center;
    justify-content: center; font-size: 16px; font-weight: 700; color: white;
  }
  .feed-icons { display: flex; gap: 8px; }
  .feed-icon {
    width: 34px; height: 34px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center; font-size: 14px;

  }

  /* Post fantasma acima das sugestões */
  .ghost-post { padding: 10px 12px; border-bottom: 1px solid #111; }
  .ghost-header { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
  .ghost-avatar { width: 30px; height: 30px; border-radius: 50%; background: #1a1a1a; border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .ghost-name  { font-size: 12px; font-weight: 700; color: white; }
  .ghost-time  { font-size: 10px; color: #444; margin-left: auto; }
  .ghost-img   { width: 100%; height: 100px; border-radius: 10px; background: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 7px; }
  .ghost-actions { display: flex; gap: 14px; }
  .ghost-action  { font-size: 10px; color: #555; }


  /* Card de sugestões */
  .sug-card {
    margin: 10px 12px; background: #1a1a1a;
    border-radius: 14px; padding: 12px;
    border: 1px solid #2a2a2a;
  }
  .sug-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .sug-title { font-size: 12px; font-weight: 700; color: white; }
  .sug-close { font-size: 10px; color: #555; cursor: pointer; }

  .sug-scroll { display: flex; gap: 8px; overflow-x: auto; }
  .sug-scroll::-webkit-scrollbar { display: none; }

  .sug-item {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    flex-shrink: 0; width: 80px;
  }
  .sug-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: #111; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center; font-size: 22px;

  }
  .sug-avatar.estab { border-radius: 14px; }
  .sug-name  { font-size: 9px; color: #888; text-align: center; line-height: 1.3; max-width: 72px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .sug-type  { font-size: 8px; color: #555; text-align: center; }
  .sug-btn {
    padding: 4px 10px; border-radius: 6px;
    background: #E8640A; color: white;
    font-size: 9px; font-weight: 700; cursor: pointer;
    border: none; font-family: Arial, sans-serif;
  }
  .sug-btn.following { background: transparent; border: 1px solid #E8640A; color: #E8640A; }

  /* ═══════════════════════════════════════════
     T_CHAT — Mensagens
  ═══════════════════════════════════════════ */

  /* Header do chat */
  .chat-header {
    display: flex; align-items: center; gap: 10px;
    padding: 30px 14px 10px; background: #0D0D0D;

    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .chat-back { width: 32px; height: 32px; border-radius: 50%; background: #1a1a1a; border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .chat-title { font-size: 15px; font-weight: 700; color: white; flex: 1; }
  .chat-action { font-size: 16px; color: #aaa; }

  /* Abas Pessoas / Estabelecimentos */
  .chat-tabs {
    display: flex; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .chat-tab {
    flex: 1; text-align: center; padding: 9px 0;
    font-size: 11px; color: #555; cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .chat-tab.active { color: white; border-bottom-color: #E8640A; font-weight: 700; }

  /* Lista de conversas */

  .chat-list { flex: 1; overflow-y: auto; }
  .chat-list::-webkit-scrollbar { display: none; }

  .chat-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-bottom: 1px solid #0D0D0D; cursor: pointer;
  }
  .chat-item:active { background: #111; }
  .chat-item-avatar {
    width: 46px; height: 46px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0; position: relative;
  }
  .chat-item-avatar.estab { border-radius: 12px; }
  .online-dot {
    position: absolute; bottom: 1px; right: 1px;
    width: 10px; height: 10px; border-radius: 50%;
    background: #27ae60; border: 2px solid #0D0D0D;
  }
  .chat-item-info { flex: 1; min-width: 0; }

  .chat-item-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 2px; }
  .chat-item-last { font-size: 11px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chat-item-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .chat-item-time { font-size: 10px; color: #444; }
  .chat-badge {
    width: 18px; height: 18px; border-radius: 50%;
    background: #E8640A; color: white;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  /* Tela de conversa individual */
  .conv-header {
    display: flex; align-items: center; gap: 10px;
    padding: 30px 12px 10px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .conv-avatar {

    width: 38px; height: 38px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .conv-info { flex: 1; }
  .conv-name   { font-size: 13px; font-weight: 700; color: white; }
  .conv-status { font-size: 10px; color: #27ae60; }

  /* Mensagens */
  .conv-messages { flex: 1; overflow-y: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
  .conv-messages::-webkit-scrollbar { display: none; }

  .msg { max-width: 75%; }
  .msg.received { align-self: flex-start; }
  .msg.sent     { align-self: flex-end; }

  .msg-bubble {
    padding: 8px 12px; border-radius: 16px;
    font-size: 12px; line-height: 1.4;
  }
  .msg.received .msg-bubble { background: #1a1a1a; color: white; border-bottom-left-radius: 4px; }

  .msg.sent     .msg-bubble { background: #E8640A; color: white; border-bottom-right-radius: 4px; }

  .msg-time { font-size: 9px; color: #444; margin-top: 3px; }
  .msg.sent .msg-time { text-align: right; }

  /* Referência ao story */
  .msg-story-ref {
    background: rgba(232,100,10,0.1); border: 1px solid rgba(232,100,10,0.3);
    border-radius: 10px; padding: 6px 10px; margin-bottom: 4px;
    display: flex; align-items: center; gap: 7px;
    font-size: 10px; color: #888;
  }
  .story-thumb { width: 36px; height: 36px; border-radius: 6px; background: #2a1a0a; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }

  /* Mídia recebida */
  .msg-img {
    width: 140px; height: 100px; border-radius: 12px;
    background: #1a1a2a; display: flex; align-items: center;

    justify-content: center; font-size: 36px; margin-bottom: 4px;
  }

  /* Indicador digitando */
  .typing-indicator {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px;
  }
  .typing-dots { display: flex; gap: 3px; }
  .typing-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #555;
    animation: typing 1.4s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
  .typing-text { font-size: 10px; color: #555; }

  /* Input de mensagem */
  .conv-input {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px 16px; background: #0D0D0D;
    border-top: 1px solid #1a1a1a; flex-shrink: 0;

  }
  .input-field {
    flex: 1; height: 36px; background: #1a1a1a;
    border: 1px solid #2a2a2a; border-radius: 18px;
    padding: 0 12px; font-size: 12px; color: #666;
    display: flex; align-items: center;
  }
  .input-actions { display: flex; gap: 6px; }
  .input-btn { font-size: 18px; color: #555; cursor: pointer; }
  .send-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: #E8640A; display: flex; align-items: center;
    justify-content: center; font-size: 14px; cursor: pointer;
  }

  /* Bottom nav */
  .bottom-nav {
    border-top: 1px solid #1A1A1A;
    display: flex; align-items: center; justify-content: space-around;
    padding: 10px 0 14px; background: #0D0D0D; flex-shrink: 0;
  }
  .nav-tab    { text-align: center; cursor: pointer; }
  .nav-icon   { font-size: 20px; color: #555; }

  .nav-lbl    { font-size: 9px; color: #555; margin-top: 2px; }
  .nav-center {
    width: 48px; height: 48px; border-radius: 50%;
    background: #E8640A; display: flex; align-items: center;
    justify-content: center; font-size: 19px; margin-top: -9px;
    box-shadow: 0 0 16px rgba(232,100,10,0.6);
  }
</style>
</head>
<body>

  <div class="page-title">Rede Social Completa</div>
  <div class="page-sub">T_STORY · T_SUGESTOES · T_CHAT</div>

  <!-- ═══════════════════════════════════════════
       T_STORY
  ═══════════════════════════════════════════ -->
  <div class="section-div"><div class="line"></div><div class="label">T_STORY — Visualizador de Story / Momento</div><div class="line"></div></div>

  <div class="phones-row">

    <!-- Story: Foto com texto sobreposto -->
    <div class="phone-wrap">

      <div class="phone-label">Foto com texto · Autor vê views</div>
      <div class="phone fullscreen">
        <div class="notch"></div>
        <div class="story-screen">
          <div class="story-gradient-top"></div>

          <div class="story-bars">
            <div class="story-bar done"></div>
            <div class="story-bar active"></div>
            <div class="story-bar"></div>
          </div>

          <div class="story-header">
            <div class="story-avatar">✂️</div>
            <div class="story-author">
              <div class="story-name">Barbearia Vintage</div>
              <div class="story-time">2min</div>
            </div>
            <div class="story-opts">⋯</div>
            <div class="story-close">✕</div>
          </div>

          <div class="story-media photo">

            💈
            <div class="story-text-overlay">Novo ambiente renovado! 🔥<br>Venha conferir!</div>
          </div>

          <div class="story-gradient-bot"></div>

          <!-- Contador de views — só o autor vê -->
          <div class="story-views">👁 47 visualizações</div>

          <div class="story-footer">
            <div class="story-reply">Responder ao story...</div>
            <div class="story-share">↗</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Story: Vídeo · Sem views (outro usuário) -->
    <div class="phone-wrap">
      <div class="phone-label">Vídeo · Usuário vendo (sem views)</div>
      <div class="phone fullscreen">
        <div class="notch"></div>
        <div class="story-screen">
          <div class="story-gradient-top"></div>


          <div class="story-bars">
            <div class="story-bar done"></div>
            <div class="story-bar done"></div>
            <div class="story-bar active"></div>
          </div>

          <div class="story-header">
            <div class="story-avatar">👩</div>
            <div class="story-author">
              <div class="story-name">@carolina</div>
              <div class="story-time">agora</div>
            </div>
            <div class="story-opts">⋯</div>
            <div class="story-close">✕</div>
          </div>

          <div class="story-media video">
            🎵
          </div>

          <div class="story-gradient-bot"></div>

          <!-- SEM contador de views — não é o autor -->

          <div class="story-footer">
            <div class="story-reply">Responder ao story...</div>

            <div class="story-share">↗</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Gestos do story -->
  <div style="width:100%; max-width:700px; background:#111; border-radius:14px; padding:20px; margin-top:16px; margin-bottom:10px;">
    <div style="color:#E8640A; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:14px; text-align:center;">Gestos do T_STORY</div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <div style="background:#1a1a1a; border-radius:10px; padding:10px 14px;">
        <div style="color:#ccc; font-size:11px; font-weight:700; margin-bottom:4px;">Toque lado direito</div>
        <div style="color:#555; font-size:10px;">Avança para o próximo story</div>
      </div>

      <div style="background:#1a1a1a; border-radius:10px; padding:10px 14px;">
        <div style="color:#ccc; font-size:11px; font-weight:700; margin-bottom:4px;">Toque lado esquerdo</div>
        <div style="color:#555; font-size:10px;">Volta para o story anterior</div>
      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:10px 14px;">
        <div style="color:#ccc; font-size:11px; font-weight:700; margin-bottom:4px;">Segurar (press & hold)</div>
        <div style="color:#555; font-size:10px;">Pausa o story. Soltar retoma.</div>
      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:10px 14px;">
        <div style="color:#ccc; font-size:11px; font-weight:700; margin-bottom:4px;">Swipe para baixo</div>
        <div style="color:#555; font-size:10px;">Fecha o visualizador</div>

      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:10px 14px;">
        <div style="color:#ccc; font-size:11px; font-weight:700; margin-bottom:4px;">Swipe esquerda</div>
        <div style="color:#555; font-size:10px;">Próximo perfil na linha</div>
      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:10px 14px;">
        <div style="color:#ccc; font-size:11px; font-weight:700; margin-bottom:4px;">Responder ao story</div>
        <div style="color:#555; font-size:10px;">Abre T_CHAT com referência ao story</div>
      </div>
    </div>
    <div style="margin-top:10px; padding:10px 14px; background:#1a0f05; border-radius:10px; border:1px solid #E8640A33; font-size:10px; color:#888; text-align:center;">
      <span style="color:#E8640A; font-weight:700;">Decisão de produto:</span> Stories não têm reações de emoji. Interação exclusivamente via campo "Responder" que abre T_CHAT.

    </div>
  </div>

  <!-- ═══════════════════════════════════════════
       T_SUGESTOES
  ═══════════════════════════════════════════ -->
  <div class="section-div"><div class="line"></div><div class="label">T_SUGESTOES — Carrossel inline no feed do T_AGITO</div><div class="line"></div></div>

  <div class="phones-row">

    <!-- Sugestões inline no feed -->
    <div class="phone-wrap">
      <div class="phone-label">Inline no feed · Usuário novo</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="feed-header" style="padding: 30px 14px 10px;">
          <div class="feed-logo">M</div>
          <div class="feed-icons">
            <div class="feed-icon">💬</div>
            <div class="feed-icon">🔔</div>
            <div class="feed-icon" style="font-size:12px;">⋯</div>

          </div>
        </div>

        <div style="flex:1; overflow-y:auto;">
          <!-- Post acima -->
          <div class="ghost-post">
            <div class="ghost-header">
              <div class="ghost-avatar">👨</div>
              <div class="ghost-name">@rafael</div>
              <div class="ghost-time">1h</div>
            </div>
            <div class="ghost-img">🍕</div>
            <div class="ghost-actions">
              <div class="ghost-action">👍 34</div>
              <div class="ghost-action">💬 5</div>
              <div class="ghost-action">↗</div>
            </div>
          </div>

          <!-- Card de sugestões -->
          <div class="sug-card">
            <div class="sug-header">
              <div class="sug-title">Sugestões para você</div>
              <div class="sug-close">Não tenho interesse</div>

            </div>
            <div class="sug-scroll">
              <!-- Pessoa -->
              <div class="sug-item">
                <div class="sug-avatar">👩</div>
                <div class="sug-name">@carolina</div>
                <div class="sug-type">Usuária · SP</div>
                <button class="sug-btn">Seguir</button>
              </div>
              <!-- Estabelecimento -->
              <div class="sug-item">
                <div class="sug-avatar estab">✂️</div>
                <div class="sug-name">Barb. Vintage</div>
                <div class="sug-type">Barbearia · 320m</div>
                <button class="sug-btn">Seguir</button>
              </div>
              <!-- Pessoa já seguida -->
              <div class="sug-item">
                <div class="sug-avatar">👦</div>

                <div class="sug-name">@pedro_sp</div>
                <div class="sug-type">Usuário · SP</div>
                <button class="sug-btn following">Seguindo</button>
              </div>
              <!-- Estabelecimento -->
              <div class="sug-item">
                <div class="sug-avatar estab">🍕</div>
                <div class="sug-name">Pizzaria Dom Pão</div>
                <div class="sug-type">Restaurante · 800m</div>
                <button class="sug-btn">Seguir</button>
              </div>
            </div>
          </div>

          <!-- Post abaixo -->
          <div class="ghost-post">
            <div class="ghost-header">
              <div class="ghost-avatar">👩</div>
              <div class="ghost-name">@ana</div>
              <div class="ghost-time">3h</div>

            </div>
            <div class="ghost-img">☕</div>
            <div class="ghost-actions">
              <div class="ghost-action">👍 21</div>
              <div class="ghost-action">💬 3</div>
              <div class="ghost-action">↗</div>
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon" style="color:white; font-size:18px;">👥</div><div class="nav-lbl" style="color:white;">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>

        </div>
      </div>
    </div>

  </div>

  <!-- Regras T_SUGESTOES -->
  <div style="width:100%; max-width:700px; background:#111; border-radius:14px; padding:20px; margin-top:16px; margin-bottom:10px;">
    <div style="color:#E8640A; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:14px; text-align:center;">Regras do T_SUGESTOES</div>
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      <div style="background:#1a1a1a; border-radius:20px; padding:6px 12px; font-size:10px; color:#666;">Aparece para usuários com menos de 5 seguidos</div>
      <div style="background:#1a1a1a; border-radius:20px; padding:6px 12px; font-size:10px; color:#666;">Some quando segue 10 ou mais perfis</div>
      <div style="background:#1a1a1a; border-radius:20px; padding:6px 12px; font-size:10px; color:#666;">Proporção ~50% pessoas / 50% estabelecimentos</div>

      <div style="background:#1a1a1a; border-radius:20px; padding:6px 12px; font-size:10px; color:#666;">Máximo 10 sugestões por carrossel</div>
      <div style="background:#1a1a1a; border-radius:20px; padding:6px 12px; font-size:10px; color:#666;">Seguir inline — botão muda para "Seguindo" sem some</div>
      <div style="background:#1a1a1a; border-radius:20px; padding:6px 12px; font-size:10px; color:#666;">"Não tenho interesse" → some permanentemente</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════
       T_CHAT
  ═══════════════════════════════════════════ -->
  <div class="section-div"><div class="line"></div><div class="label">T_CHAT — Mensagens</div><div class="line"></div></div>

  <div class="phones-row">

    <!-- Lista de conversas -->
    <div class="phone-wrap">

      <div class="phone-label">Lista — aba Pessoas</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="chat-header">
          <div class="chat-back">←</div>
          <div class="chat-title">Mensagens</div>
          <div class="chat-action">✏️</div>
        </div>

        <div class="chat-tabs">
          <div class="chat-tab active">Pessoas</div>
          <div class="chat-tab">Estabelecimentos</div>
        </div>

        <div class="chat-list">
          <div class="chat-item">
            <div class="chat-item-avatar">
              👩
              <div class="online-dot"></div>
            </div>
            <div class="chat-item-info">
              <div class="chat-item-name">@carolina</div>
              <div class="chat-item-last">Que lugar incrível mesmo! 🔥</div>

            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">agora</div>
              <div class="chat-badge">2</div>
            </div>
          </div>

          <div class="chat-item">
            <div class="chat-item-avatar">👨</div>
            <div class="chat-item-info">
              <div class="chat-item-name">@rafael</div>
              <div class="chat-item-last">Você: Valeu pela dica!</div>
            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">1h</div>
            </div>
          </div>

          <div class="chat-item">
            <div class="chat-item-avatar">👦</div>
            <div class="chat-item-info">
              <div class="chat-item-name">@pedro_sp</div>
              <div class="chat-item-last">📷 Foto</div>

            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">Ontem</div>
              <div class="chat-badge">1</div>
            </div>
          </div>

          <div class="chat-item">
            <div class="chat-item-avatar">👩‍🦰</div>
            <div class="chat-item-info">
              <div class="chat-item-name">@ana</div>
              <div class="chat-item-last">🎵 Áudio · 0:23</div>
            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">Seg</div>
            </div>
          </div>

          <div class="chat-item">
            <div class="chat-item-avatar">👦🏻</div>
            <div class="chat-item-info">
              <div class="chat-item-name">@lucas</div>
              <div class="chat-item-last">Você: Ok, te vejo lá 👍</div>

            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">12 mar</div>
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>
        </div>
      </div>
    </div>

    <!-- Conversa individual com referência ao story -->
    <div class="phone-wrap">
      <div class="phone-label">Conversa · Referência a story</div>

      <div class="phone">
        <div class="notch"></div>
        <div class="conv-header">
          <div class="chat-back">←</div>
          <div class="conv-avatar">👩</div>
          <div class="conv-info">
            <div class="conv-name">@carolina</div>
            <div class="conv-status">online agora</div>
          </div>
          <div class="chat-action" style="margin-right:4px;">📞</div>
          <div class="chat-action">⋯</div>
        </div>

        <div class="conv-messages">
          <!-- Mensagem com referência ao story -->
          <div class="msg received">
            <div class="msg-story-ref">
              <div class="story-thumb">💈</div>
              <div>
                <div style="color:#E8640A; font-size:10px; font-weight:700;">Respondeu ao seu story</div>

                <div style="font-size:9px;">Barbearia Vintage · foto</div>
              </div>
            </div>
            <div class="msg-bubble">Que ambiente incrível! Quando abriu? 😍</div>
            <div class="msg-time">14:23</div>
          </div>

          <!-- Foto enviada -->
          <div class="msg received">
            <div class="msg-img">🏙️</div>
            <div class="msg-time">14:25</div>
          </div>

          <!-- Mensagens normais -->
          <div class="msg sent">
            <div class="msg-bubble">Reformamos semana passada! Vem visitar 🙌</div>
            <div class="msg-time">14:26 ✓✓</div>
          </div>

          <div class="msg received">
            <div class="msg-bubble">Com certeza! Vou marcar horário essa semana</div>
            <div class="msg-time">14:27</div>

          </div>

          <div class="msg sent">
            <div class="msg-bubble">Ótimo! A gente agradece 💈</div>
            <div class="msg-time">14:28 ✓✓</div>
          </div>

          <!-- Indicador digitando -->
          <div class="typing-indicator">
            <div class="typing-dots">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
            <div class="typing-text">@carolina está digitando...</div>
          </div>
        </div>

        <div class="conv-input">
          <div class="input-field">Mensagem...</div>
          <div class="input-actions">
            <div class="input-btn">📷</div>
            <div class="input-btn">🎤</div>
          </div>
          <div class="send-btn">↗</div>

        </div>
      </div>
    </div>

    <!-- Aba Estabelecimentos -->
    <div class="phone-wrap">
      <div class="phone-label">Lista — aba Estabelecimentos</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="chat-header">
          <div class="chat-back">←</div>
          <div class="chat-title">Mensagens</div>
          <div class="chat-action">✏️</div>
        </div>

        <div class="chat-tabs">
          <div class="chat-tab">Pessoas</div>
          <div class="chat-tab active">Estabelecimentos</div>
        </div>

        <div class="chat-list">
          <div class="chat-item">
            <div class="chat-item-avatar estab">✂️<div class="online-dot"></div></div>
            <div class="chat-item-info">
              <div class="chat-item-name">Barbearia Vintage</div>

              <div class="chat-item-last">Olá! Temos horário disponível 😊</div>
            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">2min</div>
              <div class="chat-badge">1</div>
            </div>
          </div>

          <div class="chat-item">
            <div class="chat-item-avatar estab">🍕</div>
            <div class="chat-item-info">
              <div class="chat-item-name">Pizzaria Dom Pão</div>
              <div class="chat-item-last">Você: Qual o sabor do dia?</div>
            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">1h</div>
            </div>
          </div>

          <div class="chat-item">
            <div class="chat-item-avatar estab">☕</div>
            <div class="chat-item-info">

              <div class="chat-item-name">Café Ponto Certo</div>
              <div class="chat-item-last">☕ Obrigado pela visita!</div>
            </div>
            <div class="chat-item-meta">
              <div class="chat-item-time">Ontem</div>
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab"><div class="nav-icon">👥</div><div class="nav-lbl">Social</div></div>
          <div class="nav-tab"><div class="nav-icon" style="font-size:16px;">✚</div><div class="nav-lbl">Criar</div></div>
          <div class="nav-center">★</div>
          <div class="nav-tab"><div class="nav-icon">📋</div><div class="nav-lbl">Atividade</div></div>
          <div class="nav-tab"><div class="nav-icon">⚙</div><div class="nav-lbl">Config</div></div>

        </div>
      </div>
    </div>

  </div>

</body>
</html>

