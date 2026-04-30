MEU AGITO
T_ITEM — Item Universal
Arquitetura de tela — Especificação completa v3
Evento · Serviço · Prato · Produto · Quarto · Plano · Procedimento
1. Identificação
Código	T_ITEM
Nome	Item Universal — Tela Dedicada de Item
Tipo	Tela própria de um item específico do catálogo. Slide da direita. Fecha com ← Voltar.
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0: tela informativa completa. Fase 1.2+: botão de ação ativo.
Como é acessado	Toque em card no T_CATALOGO | Card de evento no Home (Z1, Z3) | Resultado no T07 filtrado por evento
Tela anterior	T_CATALOGO (principal) | T06 Home | T07 Busca. Botão ← sempre retorna à origem.
Templates	evento · servico · prato · produto · quarto · plano · procedimento
Campo template	Backend retorna { 'template': 'prato' } no payload. App escolhe os blocos a renderizar.
Botão de ação	Fixo no rodapé — sempre visível durante o scroll. Label e comportamento variam por template.
Avaliações	Bloco AVALIACOES_ITEM presente em todos os templates.
T10	ELIMINADA — eventos abrem T_ITEM com template='evento'.

2. Conceito
O T_ITEM é a tela de decisão do usuário — é aqui que ele decide agir. Depois de descobrir no Home, buscar no T07 ou navegar pelo T_CATALOGO, o usuário chega no T_ITEM para ver todos os detalhes e executar uma ação.

O app mapeia o campo 'template' para um conjunto fixo de blocos. Nunca inventa blocos — renderiza apenas o que o backend especifica. Ex: template 'evento' renderiza GALERIA + IDENTIDADE + DATA_HORA + LOCAL + PRECO + QUEM_VAI + AVALIACOES.

3. Estrutura Geral — Presente em Todos os Templates
Zona	Nome	Comportamento	Conteúdo
Z1	Header	Fixo — nunca some	← Voltar + título do item (aparece após rolar além da identidade) + ♡ Salvar + ⎙ Compartilhar
Z2	Blocos de conteúdo	Scroll vertical	Variam por template — ver seção 5
Z3	Botão de ação	Fixo no rodapé	Sempre visível. Label e comportamento variam por template e fase

4. Header e Botão de Ação
4.1 Header
← Voltar	Círculo #1A1A1A, 36x36px, borda #2A2A2A. Retorna à tela anterior preservando estado.
Título do item	Arial Bold 15px branco. Centralizado. Aparece APENAS após rolar além do bloco IDENTIDADE. Antes: vazio.
♡ Salvar	Círculo #1A1A1A. Preenchido laranja quando salvo. Salva nos favoritos. Háptico leve.
⎙ Compartilhar	Círculo #1A1A1A. Sheet nativo de compartilhamento do item.

4.2 Botão de Ação Fixo no Rodapé
Template	Label	Fase 1.0	Fase 1.2+
evento (pago)	'🎟 Comprar ingresso'	Redireciona para Sympla/Eventbrite	Fluxo interno de compra
evento (grátis)	'✓ Confirmar presença'	ATIVO — ação interna gratuita	Mantém ativo
servico	'📅 Agendar'	Inativo — tooltip 'Em breve'	Abre fluxo de agendamento
prato	'🛒 Adicionar ao carrinho'	Inativo	Adiciona ao carrinho do pedido
produto	'🛒 Adicionar ao carrinho'	Inativo	Adiciona ao carrinho de compras
quarto	'🛏 Reservar'	Inativo	Abre fluxo de reserva com datas
plano	'💳 Assinar'	Inativo	Abre fluxo de assinatura
procedimento	'📅 Agendar'	Inativo	Abre fluxo de agendamento

Fase 1.0: botão inativo exibe tooltip 'Esta funcionalidade estará disponível em breve!'. NUNCA esconder — mostrar inativo comunica que a funcionalidade virá.

5. Blocos de Conteúdo — Detalhamento
Bloco GALERIA — presente em todos
Comportamento	Carrossel horizontal com swipe. Snap por foto. Largura 100% da tela.
Altura	240px padrão. Produto: quadrado 1:1. Plano/serviço/procedimento: ícone grande 80px centralizado.
Indicador	Dots (até 5 fotos) ou contador '1/5' no canto inferior direito.
Toque na foto	Abre visualizador em tela cheia com swipe entre todas as fotos.
Vídeo	Integrado ao carrossel com ícone ▶. Toque reproduz inline com controles.
Fallback	Sem foto: gradiente escuro com ícone do tipo centralizado (emoji 60px).

Bloco IDENTIDADE — presente em todos
Nome do item	Arial Bold 22px branco. Abaixo da galeria. Padding 16px horizontal.
Categoria / tipo	Badge com ícone da categoria. Arial Regular 13px #888.
Descrição	Arial Regular 14px #ccc. Linha 1.6. Máx 5 linhas com 'ver mais ▾'. Expande inline.
Link do estab.	Avatar 24px + nome em laranja 13px. Toque → T_PERFIL do estabelecimento.

Bloco PREÇO — presente em todos
Variação	Como exibir
Preço fixo	'R$ XX,XX' — Arial Bold 24px laranja
A partir de	'A partir de' em #888 13px + valor laranja bold 24px
Gratuito	Badge verde 'GRATUITO' em vez do valor
Promoção	Preço original riscado em #555 + novo laranja + badge '% OFF' vermelho
Por período	'R$ XXX / noite' ou 'R$ XX / mês' — período em #888, valor laranja
Consulte	'Consulte o estabelecimento' em #888

Bloco AVALIACOES_ITEM — presente em todos
Avaliações específicas deste item — separadas das avaliações gerais do estabelecimento em T_PERFIL.
Nota do item	Estrelas laranja + número (ex: '4.7') + total de avaliações '(32 avaliações)'.
Campo avaliar	Card clicável: avatar do usuário + 'O que você achou?' + estrelas cinza. Abre modal.
Avaliações recentes	Últimas 3 avaliações. Link 'Ver todas →' laranja abre lista completa.
Card de avaliação	Avatar 28px + nome bold + data relativa + estrelas + texto.

Blocos específicos por template

template = "produto"  —  Seletores de variação
VARIACOES	Cor: bolinhas 32px. Selecionada: borda branca 2px + nome da cor abaixo.
Tamanho	Chips de texto (PP/P/M/G/GG). Ativo: fundo laranja. Indisponível: riscado + #333.
Obrigatoriedade	Seleção obrigatória antes de ativar o botão. Se não selecionou: botão mostra 'Selecione uma opção'.

template = "prato"  —  Adicionais e combo
ADICIONAIS	Checkboxes de itens extras. Nome + descrição curta + preço extra à direita.
Checkbox ativo	Laranja ao marcar. Preço do adicional em laranja.
Total dinâmico	Total atualiza em tempo real no botão: '🛒 Adicionar · R$ XX,XX'.

template = "evento"  —  Data, local e prova social
DATA_HORA	Card com: data completa + horário + duração + endereço + capacidade / vagas.
LOCAL	Endereço dentro do estabelecimento. Ex: 'Auditório Principal · R. Vergueiro, 1000'.
QUEM_VAI	Avatars de quem confirmou + contador. Ex: '@maria, @rafael e mais 47 pessoas confirmaram.'
LINEUP	Para shows e festivais: lista de artistas/atrações com horário de cada um.

template = "quarto"  —  Capacidade e comodidades
COMODIDADES	Ícones + texto para cada comodidade: 📶 Wi-Fi · ❄ Ar-cond · 🍳 Café · 🛁 Banheira, etc.
DISPONIBILIDADE	Fase 1.2+: calendário de datas disponíveis com seleção de check-in e check-out.

template = "plano"  —  Benefícios e economia
BENEFICIOS	Lista de tópicos com ✓ laranja à esquerda. Máximo 6 itens visíveis.
Economia anual	'Economize R$ XX por ano' em verde #1A7A4A abaixo do preço.

template = "servico · procedimento"  —  Disponibilidade e profissional
DISPONIBILIDADE	Fase 1.2+: grade de horários disponíveis para agendamento.
Profissional	Nome e foto do profissional responsável quando aplicável.
Duração	Tempo estimado do serviço/procedimento.

6. Tabela de Blocos por Template
Bloco	prato	produto	quarto	plano	proc.	servico	evento
GALERIA	✓	✓	✓	✓	✓	✓	✓
IDENTIDADE	✓	✓	✓	✓	✓	✓	✓
PRECO	✓	✓	✓	✓	✓	✓	✓
AVALIACOES_ITEM	✓	✓	✓	✓	✓	✓	✓
VARIACOES	—	✓	—	—	—	—	—
ADICIONAIS	✓	—	—	—	—	—	—
DATA_HORA	—	—	—	—	—	—	✓
LOCAL	—	—	—	—	—	—	✓
QUEM_VAI	—	—	—	—	—	—	✓
LINEUP	—	—	—	—	—	—	✓
BENEFICIOS	—	—	—	✓	—	—	—
COMODIDADES	—	—	✓	—	—	—	—
DISPONIBILIDADE	—	—	✓	—	✓	✓	—
INFORMACOES	—	✓	—	—	—	—	—

7. Fluxo de Navegação
De onde	Ação	Para onde	Observação
T_CATALOGO	Toque em card	T_ITEM com template correto	Slide da direita
T06 Home Z1/Z3	Toque em card tipo=evento	T_ITEM template='evento'	T10 eliminada
T07 Busca	Toque em resultado tipo=evento	T_ITEM template='evento'	T10 eliminada
T_ITEM	← Voltar	Tela anterior — estado preservado	
T_ITEM	Toque no link do estab.	T_PERFIL do estabelecimento	
T_ITEM	♡ Salvar	Favoritos — sem navegar	Háptico leve
T_ITEM	⎙ Compartilhar	Sheet nativo	
T_ITEM	Toque na galeria	Visualizador tela cheia	Swipe entre fotos
T_ITEM	Botão ativo (evento grátis)	Confirma presença — ação interna	Único ativo F1.0
T_ITEM	Botão inativo (outros)	Tooltip 'Em breve'	Fase 1.2+
T_ITEM	'Ver todas →' avaliações	Lista completa de avaliações	

8. Regras de Negócio
RN-01 — T10 Eventos eliminada
Qualquer item do tipo 'evento' — vindo do Home, T07 ou T_CATALOGO — abre T_ITEM com template='evento'. A tela T10 não existe mais no projeto.
RN-02 — Template definido pelo backend
O campo 'template' no payload do item define os blocos a renderizar. O app nunca infere o template pelo conteúdo ou pelo visual do card anterior.
RN-03 — Botão fixo sempre visível
O botão de ação no rodapé é sempre visível durante o scroll — o usuário pode agir a qualquer momento sem precisar rolar até o fim. Na Fase 1.0: inativo com tooltip, exceto evento gratuito.
RN-04 — Título no header aparece ao rolar
O título do item no header só aparece após o usuário rolar além do bloco IDENTIDADE. Antes disso, o header fica com o título vazio para não duplicar a informação.
RN-05 — Avaliações do item são separadas do T_PERFIL
Um usuário pode avaliar o estabelecimento em T_PERFIL e também avaliar itens específicos em T_ITEM. São listas independentes.
RN-06 — Variações obrigatórias antes de adicionar
Para o template 'produto', o usuário deve selecionar cor e tamanho antes do botão de ação ficar ativo. Enquanto não selecionar: botão mostra 'Selecione uma opção'.
RN-07 — Preservação do estado no T_CATALOGO
Ao voltar do T_ITEM para o T_CATALOGO: scroll, filtros e busca retornam exatamente como estavam.

Dev: React Navigation Stack. Parâmetro 'template' recebido no payload determina quais componentes montar. Cada bloco é um componente independente reutilizável.

9. Mockup HTML — Referência Visual
O código abaixo é o mockup unificado com 6 templates renderizados: prato (com adicionais), produto (com variações de cor e tamanho), quarto, plano (com benefícios), serviço e evento (com data/hora/local e 'Quem vai'). Inclui tabela de 12 blocos de conteúdo com presença por template.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T_ITEM Universal</title>
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
    width: 280px; height: 600px;
    background: #0D0D0D; border-radius: 40px;
    border: 6px solid #1e1e1e; overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex; flex-direction: column; position: relative;
  }
  .notch { height: 22px; background: #1e1e1e; border-radius: 0 0 14px 14px; width: 88px; margin: 0 auto; flex-shrink: 0; }


  /* Header do item */
  .item-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 12px 8px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .back-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: white; flex-shrink: 0;
  }
  .item-nav-title { font-size: 13px; font-weight: 700; color: white; flex: 1; text-align: center; padding: 0 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .nav-actions { display: flex; gap: 6px; }
  .nav-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;

    font-size: 13px; color: #aaa;
  }
  .nav-btn.saved { background: rgba(232,100,10,0.15); border-color: #E8640A; color: #E8640A; }

  /* Galeria */
  .item-gallery {
    width: 100%; flex-shrink: 0; position: relative;
    background: #1a1a1a;
    display: flex; align-items: center; justify-content: center;
  }
  .gallery-img { font-size: 60px; padding: 20px 0; }
  .gallery-dots {
    position: absolute; bottom: 8px; left: 0; right: 0;
    display: flex; justify-content: center; gap: 5px;
  }
  .gdot { width: 6px; height: 6px; border-radius: 50%; background: #444; }
  .gdot.active { width: 16px; border-radius: 3px; background: #E8640A; }
  .gallery-counter {
    position: absolute; bottom: 8px; right: 12px;
    font-size: 10px; color: #aaa; background: rgba(0,0,0,0.6);
    padding: 2px 7px; border-radius: 10px;

  }

  /* Conteúdo scrollável */
  .item-content { flex: 1; overflow-y: auto; padding: 12px; }
  .item-content::-webkit-scrollbar { display: none; }

  /* Bloco IDENTIDADE */
  .item-name   { font-size: 20px; font-weight: 900; color: white; margin-bottom: 4px; line-height: 1.25; }
  .item-cat    { display: inline-block; font-size: 10px; color: #888; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 20px; padding: 3px 10px; margin-bottom: 8px; }
  .item-desc   { font-size: 12px; color: #999; line-height: 1.6; margin-bottom: 6px; }
  .see-more    { font-size: 11px; color: #E8640A; cursor: pointer; }
  .item-estab  {
    display: flex; align-items: center; gap: 7px;
    margin: 8px 0 12px; font-size: 12px; color: #E8640A; cursor: pointer;
  }
  .estab-avatar {
    width: 24px; height: 24px; border-radius: 6px;

    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center; font-size: 12px;
  }

  /* Bloco PREÇO */
  .item-price     { font-size: 26px; font-weight: 900; color: #E8640A; margin-bottom: 12px; }
  .item-price-old { font-size: 14px; color: #444; text-decoration: line-through; margin-right: 6px; }
  .item-price-badge { font-size: 10px; font-weight: 700; background: rgba(231,76,60,0.2); color: #e74c3c; border-radius: 4px; padding: 2px 6px; margin-left: 6px; }
  .price-period { font-size: 13px; color: #666; font-weight: 400; }
  .price-gratis { font-size: 22px; font-weight: 900; color: #27ae60; margin-bottom: 12px; }

  /* Divisor sutil */
  .divider { height: 1px; background: #1a1a1a; margin: 10px 0; }

  /* Bloco VARIAÇÕES (produto) */

  .var-label { font-size: 10px; color: #555; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .var-cores { display: flex; gap: 8px; margin-bottom: 10px; }
  .var-cor {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid transparent; cursor: pointer;
  }
  .var-cor.sel { border-color: white; }
  .cor-name { font-size: 10px; color: #666; margin-top: 4px; text-align: center; }
  .var-sizes { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
  .var-size {
    padding: 6px 14px; border-radius: 8px; font-size: 11px;
    background: #1a1a1a; border: 1px solid #2a2a2a; color: #888; cursor: pointer;
  }
  .var-size.sel { background: #E8640A; border-color: #E8640A; color: white; font-weight: 700; }
  .var-size.off { color: #333; text-decoration: line-through; cursor: not-allowed; }


  /* Bloco ADICIONAIS (prato) */
  .add-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid #111;
  }
  .add-check {
    width: 18px; height: 18px; border-radius: 4px;
    border: 1.5px solid #333; display: flex; align-items: center; justify-content: center;
    font-size: 11px; flex-shrink: 0;
  }
  .add-check.checked { background: #E8640A; border-color: #E8640A; color: white; }
  .add-info { flex: 1; }
  .add-name  { font-size: 12px; color: white; }
  .add-desc  { font-size: 10px; color: #666; }
  .add-price { font-size: 12px; color: #E8640A; font-weight: 700; flex-shrink: 0; }

  /* Bloco DATA/HORA (evento) */
  .event-info-block {
    background: #1a1a1a; border-radius: 12px; padding: 12px;
    margin-bottom: 10px; display: flex; flex-direction: column; gap: 7px;

  }
  .event-info-row {
    display: flex; align-items: center; gap: 8px; font-size: 11px; color: #888;
  }
  .event-info-icon { font-size: 14px; width: 20px; flex-shrink: 0; }
  .event-info-val  { color: #ccc; }

  /* Bloco QUEM VAI (evento) */
  .quem-vai { margin-bottom: 10px; }
  .quem-vai-label { font-size: 10px; color: #555; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
  .avatars-row { display: flex; align-items: center; gap: -6px; }
  .mini-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: #1a1a1a; border: 2px solid #0D0D0D;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; margin-right: -8px;
  }
  .quem-vai-text { font-size: 11px; color: #888; margin-top: 6px; }
  .quem-vai-text span { color: #E8640A; }


  /* Bloco AVALIAÇÕES */
  .aval-block { margin-top: 4px; }
  .aval-summary { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .aval-score { font-size: 28px; font-weight: 900; color: white; }
  .aval-stars { color: #E8640A; font-size: 16px; }
  .aval-count { font-size: 11px; color: #555; }
  .aval-field {
    display: flex; align-items: center; gap: 8px;
    background: #1a1a1a; border-radius: 10px; padding: 9px 12px; margin-bottom: 10px; cursor: pointer;
  }
  .aval-mini-avatar {
    width: 28px; height: 28px; border-radius: 50%; background: #2a2a2a;
    display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
  }
  .aval-prompt { font-size: 11px; color: #555; flex: 1; }
  .aval-stars-empty { color: #333; font-size: 14px; }
  .aval-item { padding: 8px 0; border-bottom: 1px solid #111; }

  .aval-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .aval-name  { font-size: 11px; font-weight: 700; color: white; }
  .aval-date  { font-size: 10px; color: #444; }
  .aval-text  { font-size: 11px; color: #888; line-height: 1.5; }

  /* Botão fixo rodapé */
  .item-footer {
    padding: 8px 12px 18px;
    background: linear-gradient(to top, #0D0D0D 65%, transparent);
    flex-shrink: 0;
  }
  .action-btn {
    width: 100%; height: 46px; border-radius: 13px;
    font-size: 14px; font-weight: 700; border: none;
    font-family: Arial, sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .action-btn.active   { background: #E8640A; color: white; }
  .action-btn.inactive { background: #2a2a2a; color: #555; }

  .action-btn.free     { background: #1A7A4A; color: white; }

  /* Info section */
  .info-section {
    width: 100%; max-width: 1100px;
    background: #111; border-radius: 16px; padding: 24px; margin-top: 48px;
  }
  .info-title { color: #E8640A; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; text-align: center; }
  .blocks-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .block-card { background: #1a1a1a; border-radius: 10px; padding: 12px; border: 1px solid #2a2a2a; }
  .block-name  { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 5px; }
  .block-desc  { color: #555; font-size: 9px; line-height: 1.5; }
  .block-templates { color: #333; font-size: 9px; margin-top: 4px; font-style: italic; }

</style>
</head>
<body>

  <div class="page-title">T_ITEM — Item Universal</div>
  <div class="page-sub">7 templates · Botão fixo no rodapé · Bloco AVALIACOES_ITEM em todos</div>

  <!-- ─── PRATO + PRODUTO ─── -->
  <div class="section-div"><div class="line"></div><div class="label">prato · produto</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- PRATO -->
    <div class="phone-wrap">
      <div class="phone-label">template = "prato"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="item-nav">
          <div class="back-btn">←</div>
          <div class="item-nav-title">Pizza Margherita</div>
          <div class="nav-actions">
            <div class="nav-btn saved">♡</div>
            <div class="nav-btn">⎙</div>
          </div>

        </div>
        <div class="item-gallery" style="height:160px;">
          <div class="gallery-img">🍕</div>
          <div class="gallery-dots">
            <div class="gdot active"></div>
            <div class="gdot"></div>
            <div class="gdot"></div>
          </div>
        </div>
        <div class="item-content">
          <div class="item-name">Pizza Margherita</div>
          <div class="item-cat">🍕 Pizza</div>
          <div class="item-desc">Molho de tomate artesanal, mussarela de búfala, tomates-cereja e manjericão fresco. Massa fermentada 72h.</div>
          <div class="item-estab"><div class="estab-avatar">🍕</div> Pizzaria Dom Pão</div>
          <div><span class="item-price-old">R$ 48,00</span><span class="item-price" style="font-size:22px;">R$ 38,00</span><span class="item-price-badge">🔥 21% OFF</span></div>

          <div class="divider"></div>
          <!-- Adicionais -->
          <div class="var-label">Adicionais</div>
          <div class="add-item">
            <div class="add-check checked">✓</div>
            <div class="add-info"><div class="add-name">Borda recheada (catupiry)</div><div class="add-desc">Cremosa e derretida</div></div>
            <div class="add-price">+ R$ 8</div>
          </div>
          <div class="add-item">
            <div class="add-check"></div>
            <div class="add-info"><div class="add-name">Carne seca</div><div class="add-desc">Carne seca desfiada</div></div>
            <div class="add-price">+ R$ 12</div>
          </div>
          <div class="divider"></div>
          <!-- Avaliações do item -->
          <div class="aval-block">
            <div class="aval-summary">

              <div><div class="aval-score">4.9</div><div class="aval-stars">★★★★★</div><div class="aval-count">(312)</div></div>
            </div>
            <div class="aval-field">
              <div class="aval-mini-avatar">👤</div>
              <div class="aval-prompt">O que você achou?</div>
              <div class="aval-stars-empty">☆☆☆☆☆</div>
            </div>
            <div class="aval-item">
              <div class="aval-header"><div class="aval-name">@maria</div><div class="aval-stars" style="font-size:11px;">★★★★★</div></div>
              <div class="aval-text">"A melhor da cidade! Borda recheada imperdível 🔥"</div>
            </div>
          </div>
        </div>
        <div class="item-footer">
          <button class="action-btn inactive">🛒 Adicionar · Em breve</button>

        </div>
      </div>
    </div>

    <!-- PRODUTO -->
    <div class="phone-wrap">
      <div class="phone-label">template = "produto"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="item-nav">
          <div class="back-btn">←</div>
          <div class="item-nav-title">Tênis Urban Street</div>
          <div class="nav-actions">
            <div class="nav-btn">♡</div>
            <div class="nav-btn">⎙</div>
          </div>
        </div>
        <div class="item-gallery" style="height:180px; background:#f5f5f5;">
          <div class="gallery-img">👟</div>
          <div class="gallery-counter">1 / 5</div>
        </div>
        <div class="item-content">
          <div class="item-name">Tênis Urban Street</div>
          <div class="item-cat">👟 Calçados Masculinos</div>

          <div class="item-desc">Solado em borracha vulcanizada, palmilha anatômica e cabedal em couro sintético premium.</div>
          <div class="item-estab"><div class="estab-avatar">🛍️</div> Loja Estilo Urbano</div>
          <div class="item-price">R$ 289,00</div>
          <div class="divider"></div>
          <!-- Variações -->
          <div class="var-label">Cor</div>
          <div style="display:flex; gap:12px; margin-bottom:12px;">
            <div style="text-align:center;">
              <div class="var-cor sel" style="background:#111;"></div>
              <div class="cor-name">Preto</div>
            </div>
            <div style="text-align:center;">
              <div class="var-cor" style="background:#E8640A;"></div>
              <div class="cor-name">Laranja</div>
            </div>

            <div style="text-align:center;">
              <div class="var-cor" style="background:#eee; border:1px solid #ccc;"></div>
              <div class="cor-name">Branco</div>
            </div>
          </div>
          <div class="var-label">Tamanho</div>
          <div class="var-sizes">
            <div class="var-size off">38</div>
            <div class="var-size">39</div>
            <div class="var-size sel">40</div>
            <div class="var-size">41</div>
            <div class="var-size">42</div>
            <div class="var-size off">43</div>
          </div>
          <div class="divider"></div>
          <div class="aval-block">
            <div class="aval-summary">
              <div><div class="aval-score">4.7</div><div class="aval-stars">★★★★★</div><div class="aval-count">(48)</div></div>

            </div>
          </div>
        </div>
        <div class="item-footer">
          <button class="action-btn inactive">🛒 Adicionar · Em breve</button>
        </div>
      </div>
    </div>

  </div>

  <!-- ─── QUARTO + PLANO ─── -->
  <div class="section-div"><div class="line"></div><div class="label">quarto · plano</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- QUARTO -->
    <div class="phone-wrap">
      <div class="phone-label">template = "quarto"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="item-nav">
          <div class="back-btn">←</div>
          <div class="item-nav-title">Suíte Vista Cidade</div>
          <div class="nav-actions">
            <div class="nav-btn">♡</div>
            <div class="nav-btn">⎙</div>

          </div>
        </div>
        <div class="item-gallery" style="height:160px; background:linear-gradient(135deg,#1a1a2a,#0a0a1a);">
          <div class="gallery-img">🌇</div>
          <div class="gallery-counter">1 / 8</div>
        </div>
        <div class="item-content">
          <div class="item-name">Suíte Vista Cidade</div>
          <div class="item-cat">🏨 Suíte</div>
          <div class="item-desc">Quarto amplo com vista panorâmica para a cidade. Banheira de imersão, cama king e varanda privativa.</div>
          <div class="item-estab"><div class="estab-avatar">🏨</div> Hotel Paulista Garden</div>
          <div class="item-price">A partir de <span style="color:#E8640A; font-size:24px; font-weight:900;">R$ 520</span><span class="price-period"> / noite</span></div>
          <div class="divider"></div>

          <div class="var-label">Capacidade e comodidades</div>
          <div style="display:flex; gap:14px; margin-bottom:10px; font-size:11px; color:#888;">
            <span>👤👤 2 pessoas</span>
            <span>🛏 King</span>
            <span>📶 Wi-Fi</span>
            <span>🛁 Banheira</span>
          </div>
          <div class="divider"></div>
          <div class="aval-block">
            <div class="aval-summary">
              <div><div class="aval-score">4.8</div><div class="aval-stars">★★★★★</div><div class="aval-count">(29)</div></div>
            </div>
            <div class="aval-item">
              <div class="aval-header"><div class="aval-name">@pedro_sp</div><div class="aval-stars" style="font-size:11px;">★★★★★</div></div>
              <div class="aval-text">"Vista incrível! Banheira de imersão foi um diferencial enorme."</div>

            </div>
          </div>
        </div>
        <div class="item-footer">
          <button class="action-btn inactive">🛏 Reservar · Em breve</button>
        </div>
      </div>
    </div>

    <!-- PLANO -->
    <div class="phone-wrap">
      <div class="phone-label">template = "plano"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="item-nav">
          <div class="back-btn">←</div>
          <div class="item-nav-title">Plano Semestral</div>
          <div class="nav-actions">
            <div class="nav-btn">♡</div>
            <div class="nav-btn">⎙</div>
          </div>
        </div>
        <div class="item-gallery" style="height:120px; background:#111; align-items:center; justify-content:center; display:flex; flex-direction:column; gap:6px;">

          <div style="font-size:42px;">💪</div>
          <div style="font-size:11px; color:#555;">Smart Fit Augusta</div>
        </div>
        <div class="item-content">
          <div class="item-name">Plano Semestral</div>
          <div class="item-cat">🏋️ Academia</div>
          <div class="item-estab"><div class="estab-avatar">💪</div> Smart Fit Augusta</div>
          <div><span class="item-price" style="font-size:28px;">R$ 79</span><span class="price-period"> / mês · 6 parcelas</span></div>
          <div style="font-size:11px; color:#27ae60; margin-bottom:10px; margin-top:2px;">💡 Economize R$ 120 vs plano mensal</div>
          <div class="divider"></div>
          <div class="var-label">O que está incluído</div>
          <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">

            <div style="font-size:11px; color:#888; display:flex; gap:6px;"><span style="color:#E8640A; font-weight:700;">✓</span> Acesso ilimitado à musculação</div>
            <div style="font-size:11px; color:#888; display:flex; gap:6px;"><span style="color:#E8640A; font-weight:700;">✓</span> Todas as aulas coletivas</div>
            <div style="font-size:11px; color:#888; display:flex; gap:6px;"><span style="color:#E8640A; font-weight:700;">✓</span> Personal trainer 2x por mês</div>
            <div style="font-size:11px; color:#888; display:flex; gap:6px;"><span style="color:#E8640A; font-weight:700;">✓</span> Avaliação física incluída</div>
            <div style="font-size:11px; color:#888; display:flex; gap:6px;"><span style="color:#E8640A; font-weight:700;">✓</span> App de treinos Premium</div>

          </div>
          <div class="divider"></div>
          <div class="aval-block">
            <div class="aval-summary">
              <div><div class="aval-score">4.6</div><div class="aval-stars">★★★★★</div><div class="aval-count">(134)</div></div>
            </div>
          </div>
        </div>
        <div class="item-footer">
          <button class="action-btn inactive">💳 Assinar · Em breve</button>
        </div>
      </div>
    </div>

  </div>

  <!-- ─── SERVIÇO + EVENTO ─── -->
  <div class="section-div"><div class="line"></div><div class="label">serviço · evento</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- SERVIÇO -->
    <div class="phone-wrap">
      <div class="phone-label">template = "servico"</div>
      <div class="phone">
        <div class="notch"></div>

        <div class="item-nav">
          <div class="back-btn">←</div>
          <div class="item-nav-title">Combo Completo</div>
          <div class="nav-actions">
            <div class="nav-btn">♡</div>
            <div class="nav-btn">⎙</div>
          </div>
        </div>
        <div class="item-gallery" style="height:130px; background:#111; align-items:center; justify-content:center; display:flex; flex-direction:column; gap:8px;">
          <div style="font-size:50px;">💈</div>
          <div style="font-size:10px; color:#555;">Barbearia Vintage</div>
        </div>
        <div class="item-content">
          <div class="item-name">Combo Completo</div>
          <div class="item-cat">✂️ Cortes · Barba · Sobrancelha</div>
          <div class="item-desc">O mais pedido! Corte clássico com tesoura, barba na navalha com toalha quente e sobrancelha modelada.</div>

          <div class="item-estab"><div class="estab-avatar">✂️</div> Barbearia Vintage</div>
          <div class="item-price">R$ 75,00</div>
          <div class="divider"></div>
          <div class="var-label">Informações</div>
          <div style="display:flex; gap:16px; margin-bottom:10px; font-size:11px; color:#888;">
            <span>⏱ ~70 min</span>
            <span>👨 Barbeiro: João</span>
          </div>
          <div class="divider"></div>
          <div class="aval-block">
            <div class="aval-summary">
              <div><div class="aval-score">4.9</div><div class="aval-stars">★★★★★</div><div class="aval-count">(97)</div></div>
            </div>
            <div class="aval-field">
              <div class="aval-mini-avatar">👤</div>
              <div class="aval-prompt">O que você achou?</div>

              <div class="aval-stars-empty">☆☆☆☆☆</div>
            </div>
            <div class="aval-item">
              <div class="aval-header"><div class="aval-name">@rafael</div><div class="aval-stars" style="font-size:11px;">★★★★★</div></div>
              <div class="aval-text">"Melhor combo da cidade. Saí transformado! 🔥"</div>
            </div>
          </div>
        </div>
        <div class="item-footer">
          <button class="action-btn inactive">📅 Agendar · Em breve</button>
        </div>
      </div>
    </div>

    <!-- EVENTO -->
    <div class="phone-wrap">
      <div class="phone-label">template = "evento"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="item-nav">
          <div class="back-btn">←</div>
          <div class="item-nav-title">Show Acústico</div>

          <div class="nav-actions">
            <div class="nav-btn saved">♡</div>
            <div class="nav-btn">⎙</div>
          </div>
        </div>
        <div class="item-gallery" style="height:160px; background:linear-gradient(135deg,#1a0010,#4a0030);">
          <div class="gallery-img">🎸</div>
          <div class="gallery-counter">1 / 6</div>
        </div>
        <div class="item-content">
          <div class="item-name">Show Acústico — Banda Novo Tempo</div>
          <div class="item-cat">🎵 Show · Música ao Vivo</div>
          <div class="item-estab"><div class="estab-avatar">🎭</div> Centro Cultural SP</div>
          <div class="price-gratis">GRATUITO</div>
          <div class="divider"></div>
          <!-- Data/Hora/Local -->
          <div class="event-info-block">

            <div class="event-info-row"><div class="event-info-icon">📅</div><div class="event-info-val">Hoje, 20 de março · 20h00</div></div>
            <div class="event-info-row"><div class="event-info-icon">⏱</div><div class="event-info-val">Duração: ~2 horas</div></div>
            <div class="event-info-row"><div class="event-info-icon">📍</div><div class="event-info-val">Auditório Principal · R. Vergueiro, 1000</div></div>
            <div class="event-info-row"><div class="event-info-icon">👥</div><div class="event-info-val">Capacidade: 200 pessoas · Vagas disponíveis</div></div>
          </div>
          <!-- Quem vai -->
          <div class="quem-vai">
            <div class="quem-vai-label">Quem vai</div>
            <div class="avatars-row">
              <div class="mini-avatar">👩</div>

              <div class="mini-avatar">👨</div>
              <div class="mini-avatar">👦</div>
            </div>
            <div class="quem-vai-text"><span>@maria, @rafael</span> e mais 47 pessoas confirmaram presença</div>
          </div>
          <div class="divider"></div>
          <div class="aval-block">
            <div class="aval-summary">
              <div><div class="aval-score">4.8</div><div class="aval-stars">★★★★★</div><div class="aval-count">(23)</div></div>
            </div>
          </div>
        </div>
        <div class="item-footer">
          <button class="action-btn free">✓ Confirmar presença</button>
        </div>
      </div>
    </div>

  </div>

  <!-- Blocos de conteúdo -->
  <div class="info-section">
    <div class="info-title">Blocos de Conteúdo — Presença por Template</div>

    <div class="blocks-grid">
      <div class="block-card">
        <div class="block-name">GALERIA</div>
        <div class="block-desc">Carrossel horizontal com swipe. Dots ou contador. Toque abre tela cheia.</div>
        <div class="block-templates">Todos os templates</div>
      </div>
      <div class="block-card">
        <div class="block-name">IDENTIDADE</div>
        <div class="block-desc">Nome + categoria + descrição expansível + link do estabelecimento.</div>
        <div class="block-templates">Todos os templates</div>
      </div>
      <div class="block-card">
        <div class="block-name">PREÇO</div>
        <div class="block-desc">Preço fixo / a partir de / gratuito / por período / promoção / consulte.</div>
        <div class="block-templates">Todos os templates</div>

      </div>
      <div class="block-card">
        <div class="block-name">AVALIACOES_ITEM</div>
        <div class="block-desc">Nota + estrelas + campo avaliar + últimas avaliações + 'Ver todas →'</div>
        <div class="block-templates">Todos os templates</div>
      </div>
      <div class="block-card">
        <div class="block-name">VARIACOES</div>
        <div class="block-desc">Seletores de cor e tamanho. Atualiza preço e foto. Obrigatório selecionar.</div>
        <div class="block-templates">produto</div>
      </div>
      <div class="block-card">
        <div class="block-name">ADICIONAIS</div>
        <div class="block-desc">Checkboxes com preço extra. Total atualiza no botão em tempo real.</div>
        <div class="block-templates">prato</div>
      </div>
      <div class="block-card">

        <div class="block-name">DATA_HORA · LOCAL</div>
        <div class="block-desc">Card com data, horário, duração, endereço e capacidade.</div>
        <div class="block-templates">evento</div>
      </div>
      <div class="block-card">
        <div class="block-name">QUEM_VAI</div>
        <div class="block-desc">Avatars de quem confirmou presença + contador total.</div>
        <div class="block-templates">evento</div>
      </div>
      <div class="block-card">
        <div class="block-name">DISPONIBILIDADE</div>
        <div class="block-desc">Calendário ou horários disponíveis para seleção.</div>
        <div class="block-templates">servico · procedimento · quarto</div>
      </div>
      <div class="block-card">
        <div class="block-name">BENEFICIOS</div>
        <div class="block-desc">Lista de benefícios com ✓ laranja. Destaque de economia.</div>

        <div class="block-templates">plano</div>
      </div>
      <div class="block-card">
        <div class="block-name">INFORMACOES</div>
        <div class="block-desc">Specs do produto: material, dimensões, garantia.</div>
        <div class="block-templates">produto</div>
      </div>
      <div class="block-card" style="border-color:#E8640A33; background:#1a0f05;">
        <div class="block-name" style="color:#E8640A88;">BOTÃO FIXO</div>
        <div class="block-desc" style="color:#444;">Sempre visível durante scroll. Inativo na Fase 1.0 (exceto evento gratuito).</div>
        <div class="block-templates" style="color:#333;">Todos os templates</div>
      </div>
    </div>
  </div>

</body>
</html>

