MEU AGITO
T_CATALOGO — Catálogo Universal
Arquitetura de tela — Especificação completa v3
Cardápio · Quartos · Produtos · Planos · Procedimentos · Serviços · Eventos
1. Identificação
Código	T_CATALOGO
Nome	Catálogo Universal
Tipo	Tela de listagem completa de itens de um estabelecimento. Adapta layout conforme o tipo.
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0 — estrutura e visualização. Fase 1.2+ — ações de compra, agendamento e reserva.
Como é acessado	(1) Botão contextual no T_PERFIL: 'Ver cardápio', 'Ver quartos', etc. | (2) Aba Serviços → 'Ver catálogo completo →'
Tela anterior	T_PERFIL — sempre. O catálogo só é acessado a partir do perfil do estabelecimento.
Tela seguinte	T_ITEM — ao tocar em qualquer item do catálogo
Templates	evento · servico · prato · produto · quarto · plano · procedimento
Preservação	Ao voltar do T_ITEM: catálogo retorna exatamente como estava — scroll, filtros e busca preservados
Prioridade	Alta — ponto de decisão entre o usuário e a ação

2. Conceito e Filosofia
O T_CATALOGO é um componente único que serve para qualquer tipo de listagem de itens de um estabelecimento. Um restaurante com 80 pratos, um hotel com 12 tipos de quarto, uma academia com 4 planos — todos usam o mesmo template. O que muda é a configuração retornada pelo backend.

O backend retorna o campo 'template' no payload do catálogo. Ex: { "template": "prato", "titulo": "Cardápio", "itens": [...] }. O app tem templates fixos — nunca improvisa um novo layout.

3. Estrutura Geral da Tela
Zona	Nome	Comportamento	Conteúdo
Z1	Header	Fixo — nunca some	← Voltar + nome do estabelecimento + tipo do catálogo + ⎙ Compartilhar
Z2	Busca interna	Fixo abaixo do header	Busca dentro do catálogo — filtra inline, não abre T07
Z3	Chips de categoria	Fixo — scroll horizontal	Filtro por categoria do catálogo (ex: Entradas, Pizzas, Sobremesas)
Z4	Lista de itens	Scroll vertical infinito	Cards de item — layout varia por template
Z5	Rodapé fixo	Fixo — Fase 1.2+	Botão de ação global (ex: 'Ver carrinho' para restaurantes)

4. Header
← Voltar	Círculo #1A1A1A, ícone seta branca, 36x36px. Retorna ao T_PERFIL preservando estado.
Nome do estab.	Arial Bold 15px branco. Centralizado. Truncado com ellipsis se longo.
Tipo do catálogo	Abaixo do nome. Arial Regular 11px #666. Texto adaptado ao template: 'Cardápio', 'Quartos disponíveis', 'Planos', etc.
⎙ Compartilhar	Círculo #1A1A1A, 36px. Extremo direito. Compartilha link do catálogo.

5. Campo de Busca Interna
Visual	Fundo #1A1A1A. Radius 12px. Altura 42px. Ícone lupa #666. Placeholder adaptado por tipo.
Comportamento	Filtra lista em tempo real (debounce 300ms). Busca por nome e descrição. Não navega para T07.
Ícone X	Aparece quando há texto. Limpa e restaura lista completa.
Sem resultado	Mensagem inline: 'Nenhum [item] encontrado para [termo].' — sem tela de erro.
Performance	Busca local nos dados já carregados. Para catálogos >200 itens: server-side com debounce 400ms.

6. Chips de Categoria
Scroll horizontal fixo abaixo do campo de busca. Primeiro chip sempre 'Todos' — selecionado por padrão. Chip ativo: fundo #E8640A, texto branco bold. Ao selecionar: lista filtra imediatamente e scroll volta ao topo.

Template	Exemplos de categorias
prato	Todos · Entradas · Pratos principais · Massas · Grelhados · Sobremesas · Bebidas · Combos
quarto	Todos · Standard · Superior · Deluxe · Suíte · Família · Vista mar
produto	Todos · Masculino · Feminino · Infantil · Acessórios · Promoção
plano	Todos · Mensal · Trimestral · Semestral · Anual · Diária
procedimento	Todos · Consultas · Exames · Cirurgias · Estética · Odontologia
servico	Todos · Cortes · Barba · Sobrancelha · Tratamentos · Combos
evento	Todos · Hoje · Este fim de semana · Gratuitos · Shows · Festas · Esportes

7. Cards de Item — Layout por Template
template = "prato"  —  Cardápio de restaurante
Layout	Horizontal: informações à esquerda + foto quadrada 68x68px à direita. Altura mínima 80px.
Nome	Arial Bold 14px branco. Máximo 2 linhas.
Descrição	Arial Regular 12px #888. Máximo 2 linhas com ellipsis.
Preço	Arial Bold 14px laranja. 'R$ XX,XX'. Com promoção: preço original riscado em #555 + novo em laranja.
Badges	'⭐ Mais pedido' | '🔥 Promoção' | '🌱 Vegano' | '🌶 Picante'. Fundo específico por badge.
Foto	68x68px, radius 10px, crop centralizado. Fallback: ícone da categoria em fundo #2A2A2A.

template = "quarto"  —  Hotel e pousada
Layout	Vertical: foto larga (100% largura, altura 110px) + informações abaixo. Card total ~220px.
Foto	Badge de disponibilidade no canto: '✓ Disponível' verde ou 'Indisponível' vermelho.
Nome	Arial Bold 15px branco.
Capacidade	Ícones: 👤 X pessoas · 🛏 X camas. Arial Regular 12px #888.
Comodidades	Até 3 ícones em destaque: 📶 Wi-Fi · ❄ Ar-cond · ☕ Café da manhã.
Preço	'A partir de R$ XXX / noite' — 'A partir de' em #666, valor em laranja bold.

template = "produto"  —  Loja e comércio
Layout	Grid 2 colunas. Foto quadrada 1:1 com fundo branco #F5F5F5 (produto centralizado, sem crop forçado).
Nome	Arial Regular 13px branco. Máximo 2 linhas.
Variações	Bolinhas de cor 10px. Máximo 4 exibidas + '+X' se mais.
Preço	Arial Bold 14px laranja.
Badge estoque	'Últimas unidades' laranja quando estoque < 5.

template = "plano"  —  Academia e assinaturas
Layout	Card largo em coluna única. Altura variável. Background #1A1A1A, borda #2A2A2A.
Nome	Arial Bold 16px branco.
Preço + período	Valor em laranja bold 20px + período em #888 12px. Ex: 'R$ 79 / mês'.
Benefícios	Até 4 itens com ícone ✓ laranja. Ex: '✓ Acesso à musculação'.
Badge destaque	'⭐ Mais escolhido' laranja no topo | '💡 Melhor custo' para melhor custo-benefício.
Economia	'Economize R$ XX por ano' em verde #1A7A4A para planos anuais.

template = "procedimento"  —  Clínica e spa
Layout	Horizontal: ícone 44px (radius 12px) + informações + preço à direita.
Nome	Arial Bold 12px branco.
Descrição	Arial Regular 10px #666. 1 linha.
Duração	Arial Regular 9px #555. Com profissional se disponível. Ex: '⏱ 60 min · Dra. Ana'.
Preço	Arial Bold 13px laranja. Alinhado à direita.

template = "servico"  —  Barbearia e salão
Layout	Idêntico ao 'procedimento' — horizontal com ícone + info + preço.
Diferença	Chips de categoria focados em serviços: Cortes · Barba · Combos. Nomenclatura adaptada.
Botão rodapé	'📅 Agendar' — inativo na Fase 1.0 com tooltip 'Em breve'.

template = "evento"  —  Shows, festas e exposições
Layout	Vertical: banner (100% largura, altura 100px) com overlay gradiente + informações abaixo.
Banner	Chip de data no canto superior esquerdo: 'HOJE' (vermelho) | 'SÁB 19h' | 'ESTE FDS' (laranja).
Nome	Arial Bold 13px branco.
Meta	Localização dentro do estabelecimento + capacidade ou duração.
Preço	'GRATUITO' em verde #27ae60 | valor em laranja se pago | faixa 'R$ 35 – R$ 80'.
Botão rodapé	'🎟 Garantir ingresso' — ativo na Fase 1.0 para eventos gratuitos | redireciona para link externo (Sympla/Eventbrite) se pago.
Navegação	Toque no card → T_ITEM com template='evento'. T10 ELIMINADA.

8. Botão de Ação Fixo no Rodapé
Template	Label	Fase 1.0	Fase 1.2+
evento	'🎟 Garantir ingresso'	Ativo — gratuito: interno | pago: link externo	Fluxo de compra interno
servico	'📅 Agendar'	Inativo — tooltip 'Em breve'	Abre fluxo de agendamento
prato	'🛒 Ver carrinho'	Inativo	Adiciona ao carrinho do pedido
produto	'🛒 Ver carrinho'	Inativo	Adiciona ao carrinho de compras
quarto	'🛏 Reservar'	Inativo	Abre fluxo de reserva com datas
plano	'💳 Assinar'	Inativo	Abre fluxo de assinatura
procedimento	'📅 Agendar'	Inativo	Abre fluxo de agendamento

Fase 1.0: botão inativo exibe tooltip ao toque: 'Esta funcionalidade estará disponível em breve!'. Nunca esconder — mostrar inativo para comunicar que virá.

9. Fluxo de Navegação
De onde	Ação	Para onde	Observação
T_PERFIL	Botão 'Ver cardápio' etc.	T_CATALOGO	Abre com template correto
T_PERFIL	Aba Serviços → 'Ver completo →'	T_CATALOGO	Mesmo template
T_CATALOGO	Toque em qualquer card	T_ITEM com template correto	Preserva estado do catálogo
T_CATALOGO	Chip de categoria	Lista filtrada — inline	Scroll volta ao topo
T_CATALOGO	Campo de busca	Lista filtrada — inline	Debounce 300ms
T_CATALOGO	← Voltar	T_PERFIL — estado preservado	
T_ITEM	← Voltar	T_CATALOGO — exatamente como estava	Scroll, filtros, busca preservados

10. Regras de Negócio
RN-01 — Backend define o template
O campo 'template' no payload define qual layout renderizar. O app nunca infere o tipo pelo conteúdo — sempre lê o campo retornado.
RN-02 — Tela anterior é sempre T_PERFIL
O T_CATALOGO só é acessado a partir do perfil de um estabelecimento. Não existe entrada direta pelo Home ou pelo T07.
RN-03 — Preservação de estado ao voltar do T_ITEM
Ao tocar em um item e voltar, o catálogo retorna exatamente como estava — mesma posição de scroll, filtros ativos e texto digitado na busca.
RN-04 — Busca interna não chama o T07
O campo de busca do catálogo filtra apenas os itens daquele catálogo específico. Não é um atalho para a busca geral do app.
RN-05 — Evento via T_ITEM — T10 eliminada
Cards de evento no catálogo levam para T_ITEM com template='evento'. A tela T10 não existe mais.
RN-06 — Botão inativo na Fase 1.0
O botão de ação no rodapé é sempre visível mas inativo na Fase 1.0 (exceto eventos gratuitos). Exibe tooltip 'Em breve' ao toque. Nunca ocultar — comunica a funcionalidade que virá.
RN-07 — Sem resultado: mensagem inline
Se a busca não retornar itens, exibe mensagem no lugar da lista. Sem tela de erro separada, sem redirecionamento.

Dev: GET /api/catalogo/{estabelecimentoId}?template={tipo}. Lista completa no primeiro carregamento. Busca local nos dados em memória. Para >200 itens: busca server-side.

11. Mockup HTML — Referência Visual
O código abaixo é o mockup unificado com todos os 7 templates renderizados: prato, quarto, produto, plano, procedimento, serviço e evento. Inclui tabela comparativa de layouts e casos de uso.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T_CATALOGO Universal</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    font-family: Arial, sans-serif;
    padding: 40px 20px;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page-title { color: #E8640A; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; text-align: center; }
  .page-sub   { color: #444; font-size: 11px; margin-bottom: 40px; text-align: center; }

  .section-divider {
    display: flex; align-items: center; gap: 16px;
    margin: 48px 0 28px; width: 100%; max-width: 1100px;

  }
  .section-divider .line  { flex: 1; height: 1px; background: #1e1e1e; }
  .section-divider .label { color: #E8640A; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; white-space: nowrap; }

  .phones-row { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px; }
  .phone-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .phone-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  /* Phone frame */
  .phone {
    width: 280px; height: 580px;
    background: #0D0D0D;
    border-radius: 40px;
    border: 6px solid #1e1e1e;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    display: flex; flex-direction: column;
    position: relative;

  }
  .notch { height: 22px; background: #1e1e1e; border-radius: 0 0 14px 14px; width: 88px; margin: 0 auto; flex-shrink: 0; }

  /* Header do catálogo */
  .cat-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 14px 10px; background: #0D0D0D;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .back-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: white; flex-shrink: 0;
  }
  .cat-title-wrap { text-align: center; flex: 1; }
  .cat-title  { font-size: 14px; font-weight: 700; color: white; }
  .cat-type   { font-size: 10px; color: #666; margin-top: 1px; }
  .cat-share  {
    width: 32px; height: 32px; border-radius: 50%;

    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: #aaa;
  }

  /* Campo de busca interno */
  .cat-search {
    display: flex; align-items: center; gap: 8px;
    margin: 8px 12px; padding: 0 12px;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 10px; height: 36px; flex-shrink: 0;
  }
  .cat-search-icon { font-size: 12px; color: #555; }
  .cat-search-ph   { font-size: 11px; color: #333; flex: 1; }

  /* Chips de categoria */
  .cat-chips {
    display: flex; gap: 6px; overflow-x: auto;
    padding: 0 12px 8px; flex-shrink: 0;
  }
  .cat-chips::-webkit-scrollbar { display: none; }
  .chip {
    flex-shrink: 0; padding: 5px 12px;
    border-radius: 16px; font-size: 10px;
    border: 1px solid #2a2a2a; color: #777;

    background: #1a1a1a; white-space: nowrap;
  }
  .chip.active { background: #E8640A; border-color: #E8640A; color: white; font-weight: 700; }

  /* Lista de itens */
  .cat-list { flex: 1; overflow-y: auto; }
  .cat-list::-webkit-scrollbar { display: none; }

  /* ── TEMPLATE: prato ── */
  .item-prato {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-bottom: 1px solid #111;
    min-height: 80px; cursor: pointer;
  }
  .prato-info { flex: 1; }
  .prato-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 3px; }
  .prato-desc { font-size: 10px; color: #666; line-height: 1.4; margin-bottom: 4px; }
  .prato-price { font-size: 13px; font-weight: 700; color: #E8640A; }
  .prato-price-old { font-size: 11px; color: #444; text-decoration: line-through; margin-right: 4px; }

  .prato-badge {
    font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
    margin-left: 6px;
  }
  .badge-popular { background: rgba(232,100,10,0.2); color: #E8640A; }
  .badge-vegano  { background: rgba(39,174,96,0.2);  color: #27ae60; }
  .badge-promo   { background: rgba(231,76,60,0.2);  color: #e74c3c; }
  .prato-img {
    width: 68px; height: 68px; border-radius: 10px;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; flex-shrink: 0;
  }

  /* ── TEMPLATE: quarto ── */
  .item-quarto {
    border-bottom: 1px solid #111; cursor: pointer;
  }
  .quarto-img {
    width: 100%; height: 110px;
    background: #1a1a1a;
    display: flex; align-items: center; justify-content: center;
    font-size: 40px; position: relative;

  }
  .quarto-avail {
    position: absolute; top: 8px; right: 8px;
    font-size: 9px; font-weight: 700; padding: 3px 7px; border-radius: 4px;
  }
  .avail-yes { background: rgba(39,174,96,0.9); color: white; }
  .avail-no  { background: rgba(192,57,43,0.9);  color: white; }
  .quarto-body { padding: 8px 12px 10px; }
  .quarto-name  { font-size: 13px; font-weight: 700; color: white; margin-bottom: 4px; }
  .quarto-info  { font-size: 10px; color: #666; display: flex; gap: 10px; margin-bottom: 5px; }
  .quarto-price { font-size: 12px; color: #666; }
  .quarto-price span { color: #E8640A; font-weight: 700; font-size: 15px; }

  /* ── TEMPLATE: produto (grid 2 col) ── */
  .produto-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    padding: 8px 10px;
  }
  .item-produto { cursor: pointer; }

  .produto-img {
    width: 100%; aspect-ratio: 1;
    background: #f5f5f5; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin-bottom: 6px; position: relative;
  }
  .produto-estoque {
    position: absolute; bottom: 6px; left: 6px;
    font-size: 8px; font-weight: 700; padding: 2px 5px;
    background: rgba(232,100,10,0.9); color: white; border-radius: 3px;
  }
  .produto-name  { font-size: 11px; color: white; margin-bottom: 3px; line-height: 1.3; }
  .produto-cores { display: flex; gap: 3px; margin-bottom: 4px; }
  .cor-dot { width: 10px; height: 10px; border-radius: 50%; }
  .produto-price { font-size: 13px; font-weight: 700; color: #E8640A; }

  /* ── TEMPLATE: plano ── */
  .item-plano {
    margin: 8px 10px; border-radius: 12px;

    background: #1a1a1a; border: 1px solid #2a2a2a;
    padding: 12px; cursor: pointer; position: relative;
  }
  .item-plano.destaque { border-color: #E8640A; }
  .plano-badge-top {
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    font-size: 9px; font-weight: 700; padding: 3px 10px;
    background: #E8640A; color: white; border-radius: 0 0 8px 8px;
    white-space: nowrap;
  }
  .plano-name  { font-size: 14px; font-weight: 700; color: white; margin-bottom: 4px; margin-top: 8px; }
  .plano-price { font-size: 20px; font-weight: 900; color: #E8640A; }
  .plano-period { font-size: 11px; color: #666; }
  .plano-benefits { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  .plano-benefit { font-size: 10px; color: #888; display: flex; gap: 5px; align-items: center; }

  .plano-benefit::before { content: '✓'; color: #E8640A; font-weight: 700; flex-shrink: 0; }
  .plano-economia { font-size: 10px; color: #27ae60; margin-top: 6px; }

  /* ── TEMPLATE: procedimento ── */
  .item-proc {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-bottom: 1px solid #111; cursor: pointer;
  }
  .proc-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .proc-info { flex: 1; }
  .proc-name { font-size: 12px; font-weight: 700; color: white; margin-bottom: 2px; }
  .proc-desc { font-size: 10px; color: #666; margin-bottom: 3px; }
  .proc-duration { font-size: 9px; color: #555; }
  .proc-price { font-size: 13px; font-weight: 700; color: #E8640A; flex-shrink: 0; }


  /* ── TEMPLATE: evento ── */
  .item-evento {
    border-bottom: 1px solid #111; cursor: pointer;
  }
  .evento-img {
    width: 100%; height: 100px;
    background: linear-gradient(135deg, #1a0010, #4a0030);
    display: flex; align-items: center; justify-content: center;
    font-size: 38px; position: relative;
  }
  .evento-chip {
    position: absolute; top: 8px; left: 8px;
    font-size: 9px; font-weight: 700; padding: 3px 7px;
    border-radius: 4px; color: white;
  }
  .chip-hoje  { background: #c0392b; }
  .chip-fds   { background: #E8640A; }
  .evento-body { padding: 8px 12px 10px; }
  .evento-name { font-size: 13px; font-weight: 700; color: white; margin-bottom: 4px; }
  .evento-meta { display: flex; gap: 8px; font-size: 10px; color: #666; margin-bottom: 4px; flex-wrap: wrap; }

  .evento-price { font-size: 12px; }
  .evento-price .gratis { color: #27ae60; font-weight: 700; }
  .evento-price .pago   { color: #E8640A; font-weight: 700; }

  /* Botão fixo rodapé */
  .cat-footer {
    padding: 10px 12px 18px;
    background: linear-gradient(to top, #0D0D0D 60%, transparent);
    flex-shrink: 0;
  }
  .cat-footer-btn {
    width: 100%; height: 44px; border-radius: 12px;
    background: #2a2a2a; color: #555; font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: none; font-family: Arial, sans-serif;
  }
  .cat-footer-btn.active { background: #E8640A; color: white; }

  /* Barra nav v3 */
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

  /* Info section */
  .info-section {
    width: 100%; max-width: 1100px;
    background: #111; border-radius: 16px; padding: 24px; margin-top: 10px;
  }
  .info-title {
    color: #E8640A; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 16px; text-align: center;
  }
  .templates-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

  .tmpl-card {
    background: #1a1a1a; border-radius: 10px;
    padding: 12px; border: 1px solid #2a2a2a;
  }
  .tmpl-name   { color: #E8640A; font-size: 10px; font-weight: 700; margin-bottom: 6px; letter-spacing: 1px; }
  .tmpl-layout { color: #555; font-size: 10px; margin-bottom: 4px; }
  .tmpl-cats   { color: #888; font-size: 9px; line-height: 1.5; }
</style>
</head>
<body>

  <div class="page-title">T_CATALOGO — Catálogo Universal</div>
  <div class="page-sub">7 templates · Backend define qual usar via campo "template" · Acessado a partir do T_PERFIL</div>

  <!-- ─── TEMPLATE: PRATO ─── -->
  <div class="section-divider"><div class="line"></div><div class="label">template = "prato" — Cardápio</div><div class="line"></div></div>
  <div class="phones-row">
    <div class="phone-wrap">
      <div class="phone-label">Todas as categorias</div>

      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Pizzaria Dom Pão</div><div class="cat-type">Cardápio</div></div>
          <div class="cat-share">⎙</div>
        </div>
        <div class="cat-search"><div class="cat-search-icon">🔍</div><div class="cat-search-ph">Buscar no cardápio...</div></div>
        <div class="cat-chips">
          <div class="chip active">Todos</div>
          <div class="chip">Entradas</div>
          <div class="chip">Pizzas</div>
          <div class="chip">Massas</div>
          <div class="chip">Sobremesas</div>
          <div class="chip">Bebidas</div>
        </div>
        <div class="cat-list">
          <div class="item-prato">

            <div class="prato-info">
              <div class="prato-name">Pizza Margherita <span class="prato-badge badge-popular">⭐ Mais pedido</span></div>
              <div class="prato-desc">Molho de tomate, mussarela e manjericão fresco.</div>
              <div><span class="prato-price-old">R$ 48</span><span class="prato-price">R$ 38</span><span class="prato-badge badge-promo">🔥 Promo</span></div>
            </div>
            <div class="prato-img">🍕</div>
          </div>
          <div class="item-prato">
            <div class="prato-info">
              <div class="prato-name">Bruschetta Italiana <span class="prato-badge badge-vegano">🌱 Vegano</span></div>
              <div class="prato-desc">Pão artesanal grelhado com tomate fresco e azeite.</div>
              <div><span class="prato-price">R$ 24</span></div>

            </div>
            <div class="prato-img">🥖</div>
          </div>
          <div class="item-prato">
            <div class="prato-info">
              <div class="prato-name">Tiramisu</div>
              <div class="prato-desc">Receita tradicional italiana com café e mascarpone.</div>
              <div><span class="prato-price">R$ 22</span></div>
            </div>
            <div class="prato-img">🍰</div>
          </div>
          <div class="item-prato">
            <div class="prato-info">
              <div class="prato-name">Coca-Cola 350ml</div>
              <div class="prato-desc">Lata gelada.</div>
              <div><span class="prato-price">R$ 7</span></div>
            </div>
            <div class="prato-img">🥤</div>
          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn">🛒 Ver carrinho · Em breve</button></div>

      </div>
    </div>
  </div>

  <!-- ─── TEMPLATE: QUARTO ─── -->
  <div class="section-divider"><div class="line"></div><div class="label">template = "quarto" — Hotel</div><div class="line"></div></div>
  <div class="phones-row">
    <div class="phone-wrap">
      <div class="phone-label">Quartos disponíveis</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Hotel Paulista Garden</div><div class="cat-type">Quartos disponíveis</div></div>
          <div class="cat-share">⎙</div>
        </div>
        <div class="cat-search"><div class="cat-search-icon">🔍</div><div class="cat-search-ph">Buscar quarto...</div></div>
        <div class="cat-chips">

          <div class="chip active">Todos</div>
          <div class="chip">Standard</div>
          <div class="chip">Superior</div>
          <div class="chip">Suíte</div>
          <div class="chip">Família</div>
        </div>
        <div class="cat-list">
          <div class="item-quarto">
            <div class="quarto-img">🛏️<div class="quarto-avail avail-yes">✓ Disponível</div></div>
            <div class="quarto-body">
              <div class="quarto-name">Standard Casal</div>
              <div class="quarto-info"><span>👤👤 2 pessoas</span><span>🛏 1 cama king</span></div>
              <div class="quarto-info"><span>📶 Wi-Fi</span><span>❄️ Ar-cond</span><span>☕ Café</span></div>
              <div class="quarto-price">A partir de <span>R$ 280</span> / noite</div>
            </div>

          </div>
          <div class="item-quarto">
            <div class="quarto-img" style="background:#1a1a2a;">🌇<div class="quarto-avail avail-yes">✓ Disponível</div></div>
            <div class="quarto-body">
              <div class="quarto-name">Suíte Vista Cidade</div>
              <div class="quarto-info"><span>👤👤 2 pessoas</span><span>🛏 1 cama king</span></div>
              <div class="quarto-info"><span>📶 Wi-Fi</span><span>❄️ Ar-cond</span><span>🛁 Banheira</span></div>
              <div class="quarto-price">A partir de <span>R$ 520</span> / noite</div>
            </div>
          </div>
          <div class="item-quarto">
            <div class="quarto-img" style="background:#1a1a1a; opacity:0.6;">🛏️<div class="quarto-avail avail-no">Indisponível</div></div>
            <div class="quarto-body" style="opacity:0.5;">

              <div class="quarto-name">Família Quadruplo</div>
              <div class="quarto-price">A partir de <span>R$ 480</span> / noite</div>
            </div>
          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn">🛏 Reservar · Em breve</button></div>
      </div>
    </div>
  </div>

  <!-- ─── TEMPLATE: PRODUTO ─── -->
  <div class="section-divider"><div class="line"></div><div class="label">template = "produto" — Loja (grid 2 colunas)</div><div class="line"></div></div>
  <div class="phones-row">
    <div class="phone-wrap">
      <div class="phone-label">Grid 2 colunas</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Loja Estilo Urbano</div><div class="cat-type">Nossos produtos</div></div>

          <div class="cat-share">⎙</div>
        </div>
        <div class="cat-search"><div class="cat-search-icon">🔍</div><div class="cat-search-ph">Buscar produto...</div></div>
        <div class="cat-chips">
          <div class="chip active">Todos</div>
          <div class="chip">Masculino</div>
          <div class="chip">Feminino</div>
          <div class="chip">Acessórios</div>
          <div class="chip">Promoção</div>
        </div>
        <div class="cat-list">
          <div class="produto-grid">
            <div class="item-produto">
              <div class="produto-img">👟<div class="produto-estoque">Últimas 3</div></div>
              <div class="produto-name">Tênis Urban Street</div>
              <div class="produto-cores">
                <div class="cor-dot" style="background:#111;"></div>

                <div class="cor-dot" style="background:#E8640A;"></div>
                <div class="cor-dot" style="background:#fff; border:1px solid #333;"></div>
              </div>
              <div class="produto-price">R$ 289</div>
            </div>
            <div class="item-produto">
              <div class="produto-img">👕</div>
              <div class="produto-name">Camiseta Oversize Premium</div>
              <div class="produto-cores">
                <div class="cor-dot" style="background:#1a1a2a;"></div>
                <div class="cor-dot" style="background:#ccc; border:1px solid #333;"></div>
              </div>
              <div class="produto-price">R$ 89</div>
            </div>
            <div class="item-produto">
              <div class="produto-img">🧢</div>

              <div class="produto-name">Boné Snapback Classic</div>
              <div class="produto-cores">
                <div class="cor-dot" style="background:#111;"></div>
                <div class="cor-dot" style="background:#E8640A;"></div>
              </div>
              <div class="produto-price">R$ 65</div>
            </div>
            <div class="item-produto">
              <div class="produto-img">👜</div>
              <div class="produto-name">Mochila Urbana 20L</div>
              <div class="produto-cores">
                <div class="cor-dot" style="background:#111;"></div>
              </div>
              <div class="produto-price">R$ 199</div>
            </div>
          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn">🛒 Ver carrinho · Em breve</button></div>

      </div>
    </div>
  </div>

  <!-- ─── TEMPLATE: PLANO ─── -->
  <div class="section-divider"><div class="line"></div><div class="label">template = "plano" — Academia / Assinatura</div><div class="line"></div></div>
  <div class="phones-row">
    <div class="phone-wrap">
      <div class="phone-label">Cards de plano</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Smart Fit Augusta</div><div class="cat-type">Planos</div></div>
          <div class="cat-share">⎙</div>
        </div>
        <div class="cat-chips">
          <div class="chip active">Todos</div>
          <div class="chip">Mensal</div>
          <div class="chip">Semestral</div>

          <div class="chip">Anual</div>
        </div>
        <div class="cat-list" style="padding: 4px 0;">
          <div class="item-plano">
            <div class="plano-name">Mensal</div>
            <div><span class="plano-price">R$ 99</span> <span class="plano-period">/ mês</span></div>
            <div class="plano-benefits">
              <div class="plano-benefit">Acesso à musculação</div>
              <div class="plano-benefit">Aulas coletivas incluídas</div>
              <div class="plano-benefit">App de treinos</div>
            </div>
          </div>
          <div class="item-plano destaque">
            <div class="plano-badge-top">⭐ Mais escolhido</div>
            <div class="plano-name">Semestral</div>
            <div><span class="plano-price">R$ 79</span> <span class="plano-period">/ mês · 6x</span></div>

            <div class="plano-benefits">
              <div class="plano-benefit">Tudo do plano Mensal</div>
              <div class="plano-benefit">Personal trainer 2x/mês</div>
              <div class="plano-benefit">Avaliação física grátis</div>
            </div>
            <div class="plano-economia">💡 Economize R$ 120 vs mensal</div>
          </div>
          <div class="item-plano">
            <div class="plano-name">Anual</div>
            <div><span class="plano-price">R$ 59</span> <span class="plano-period">/ mês · 12x</span></div>
            <div class="plano-benefits">
              <div class="plano-benefit">Tudo do Semestral</div>
              <div class="plano-benefit">Acesso a todas as unidades</div>
            </div>
            <div class="plano-economia">💡 Economize R$ 480 vs mensal</div>

          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn active">💳 Assinar · Em breve</button></div>
      </div>
    </div>
  </div>

  <!-- ─── TEMPLATE: PROCEDIMENTO + SERVIÇO + EVENTO ─── -->
  <div class="section-divider"><div class="line"></div><div class="label">procedimento · serviço · evento</div><div class="line"></div></div>
  <div class="phones-row">

    <!-- procedimento -->
    <div class="phone-wrap">
      <div class="phone-label">template = "procedimento"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Clínica Bem Estar</div><div class="cat-type">Procedimentos</div></div>
          <div class="cat-share">⎙</div>

        </div>
        <div class="cat-search"><div class="cat-search-icon">🔍</div><div class="cat-search-ph">Buscar procedimento...</div></div>
        <div class="cat-chips">
          <div class="chip active">Todos</div>
          <div class="chip">Consultas</div>
          <div class="chip">Estética</div>
          <div class="chip">Exames</div>
        </div>
        <div class="cat-list">
          <div class="item-proc">
            <div class="proc-icon">💆</div>
            <div class="proc-info">
              <div class="proc-name">Limpeza de Pele Profunda</div>
              <div class="proc-desc">Extração + máscara calmante + hidratação</div>
              <div class="proc-duration">⏱ 60 min · Dra. Ana Costa</div>
            </div>
            <div class="proc-price">R$ 180</div>

          </div>
          <div class="item-proc">
            <div class="proc-icon">💉</div>
            <div class="proc-info">
              <div class="proc-name">Botox Preventivo</div>
              <div class="proc-desc">Testa + glabela + ao redor dos olhos</div>
              <div class="proc-duration">⏱ 30 min · Dr. Carlos M.</div>
            </div>
            <div class="proc-price">R$ 450</div>
          </div>
          <div class="item-proc">
            <div class="proc-icon">🩺</div>
            <div class="proc-info">
              <div class="proc-name">Consulta Dermatológica</div>
              <div class="proc-desc">Avaliação completa de pele e manchas</div>
              <div class="proc-duration">⏱ 40 min · Dr. Carlos M.</div>
            </div>
            <div class="proc-price">R$ 280</div>

          </div>
          <div class="item-proc">
            <div class="proc-icon">✨</div>
            <div class="proc-info">
              <div class="proc-name">Peeling Químico</div>
              <div class="proc-desc">Renovação celular · recomendado 1x/mês</div>
              <div class="proc-duration">⏱ 45 min</div>
            </div>
            <div class="proc-price">R$ 220</div>
          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn">📅 Agendar · Em breve</button></div>
      </div>
    </div>

    <!-- serviço -->
    <div class="phone-wrap">
      <div class="phone-label">template = "servico"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Barbearia Vintage</div><div class="cat-type">Serviços</div></div>

          <div class="cat-share">⎙</div>
        </div>
        <div class="cat-search"><div class="cat-search-icon">🔍</div><div class="cat-search-ph">Buscar serviço...</div></div>
        <div class="cat-chips">
          <div class="chip active">Todos</div>
          <div class="chip">Cortes</div>
          <div class="chip">Barba</div>
          <div class="chip">Combos</div>
        </div>
        <div class="cat-list">
          <div class="item-proc">
            <div class="proc-icon">✂️</div>
            <div class="proc-info">
              <div class="proc-name">Corte Clássico</div>
              <div class="proc-desc">Tesoura ou máquina, acabamento perfeito</div>
              <div class="proc-duration">⏱ ~40 min</div>
            </div>
            <div class="proc-price">R$ 45</div>

          </div>
          <div class="item-proc">
            <div class="proc-icon">🪒</div>
            <div class="proc-info">
              <div class="proc-name">Barba Completa</div>
              <div class="proc-desc">Toalha quente + navalha + hidratante</div>
              <div class="proc-duration">⏱ ~35 min</div>
            </div>
            <div class="proc-price">R$ 40</div>
          </div>
          <div class="item-proc">
            <div class="proc-icon">💈</div>
            <div class="proc-info">
              <div class="proc-name">Combo Completo</div>
              <div class="proc-desc">Corte + barba + sobrancelha</div>
              <div class="proc-duration">⏱ ~70 min · <span style="color:#E8640A;">Mais pedido</span></div>
            </div>
            <div class="proc-price">R$ 75</div>

          </div>
          <div class="item-proc">
            <div class="proc-icon">💧</div>
            <div class="proc-info">
              <div class="proc-name">Hidratação Capilar</div>
              <div class="proc-desc">Máscara nutritiva profissional</div>
              <div class="proc-duration">⏱ ~30 min</div>
            </div>
            <div class="proc-price">R$ 35</div>
          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn">📅 Agendar · Em breve</button></div>
      </div>
    </div>

    <!-- evento -->
    <div class="phone-wrap">
      <div class="phone-label">template = "evento"</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="cat-header">
          <div class="back-btn">←</div>
          <div class="cat-title-wrap"><div class="cat-title">Centro Cultural SP</div><div class="cat-type">Eventos</div></div>

          <div class="cat-share">⎙</div>
        </div>
        <div class="cat-search"><div class="cat-search-icon">🔍</div><div class="cat-search-ph">Buscar evento...</div></div>
        <div class="cat-chips">
          <div class="chip active">Todos</div>
          <div class="chip">Hoje</div>
          <div class="chip">Este FDS</div>
          <div class="chip">Gratuitos</div>
          <div class="chip">Shows</div>
        </div>
        <div class="cat-list">
          <div class="item-evento">
            <div class="evento-img">🎸<div class="evento-chip chip-hoje">HOJE 20h</div></div>
            <div class="evento-body">
              <div class="evento-name">Show Acústico — Banda Novo Tempo</div>
              <div class="evento-meta"><span>📍 Auditório Principal</span><span>👥 Capacidade: 200</span></div>

              <div class="evento-price"><span class="gratis">GRATUITO</span></div>
            </div>
          </div>
          <div class="item-evento">
            <div class="evento-img" style="background:linear-gradient(135deg,#001a10,#004a20);">🎭<div class="evento-chip chip-fds">SÁB 19h</div></div>
            <div class="evento-body">
              <div class="evento-name">Peça: O Mágico de Oz — Temporada SP</div>
              <div class="evento-meta"><span>📍 Teatro Principal</span><span>⏱ 1h30</span></div>
              <div class="evento-price"><span class="pago">R$ 35 – R$ 80</span></div>
            </div>
          </div>
          <div class="item-evento">
            <div class="evento-img" style="background:linear-gradient(135deg,#1a1000,#4a2800);">🎨<div class="evento-chip chip-fds">DOM 14h</div></div>

            <div class="evento-body">
              <div class="evento-name">Exposição: Arte Urbana Brasileira</div>
              <div class="evento-meta"><span>📍 Galeria 2</span><span>👁 Visitação livre</span></div>
              <div class="evento-price"><span class="gratis">GRATUITO</span></div>
            </div>
          </div>
        </div>
        <div class="cat-footer"><button class="cat-footer-btn active">🎟 Garantir ingresso</button></div>
      </div>
    </div>

  </div>

  <!-- Tabela de templates -->
  <div class="info-section" style="margin-top: 40px;">
    <div class="info-title">Os 7 Templates — Layout e Uso</div>
    <div class="templates-grid">
      <div class="tmpl-card">
        <div class="tmpl-name">PRATO</div>
        <div class="tmpl-layout">Layout: horizontal (info + foto 68px)</div>

        <div class="tmpl-cats">Restaurantes, lanchonetes, padarias, bares</div>
      </div>
      <div class="tmpl-card">
        <div class="tmpl-name">QUARTO</div>
        <div class="tmpl-layout">Layout: vertical (foto larga + info)</div>
        <div class="tmpl-cats">Hotéis, pousadas, Airbnb, hostels</div>
      </div>
      <div class="tmpl-card">
        <div class="tmpl-name">PRODUTO</div>
        <div class="tmpl-layout">Layout: grid 2 colunas (foto 1:1)</div>
        <div class="tmpl-cats">Lojas, e-commerce local, farmácias, mercados</div>
      </div>
      <div class="tmpl-card">
        <div class="tmpl-name">PLANO</div>
        <div class="tmpl-layout">Layout: cards largos com lista de benefícios</div>
        <div class="tmpl-cats">Academias, escolas, assinaturas, clubes</div>

      </div>
      <div class="tmpl-card">
        <div class="tmpl-name">PROCEDIMENTO</div>
        <div class="tmpl-layout">Layout: horizontal (ícone + info + preço)</div>
        <div class="tmpl-cats">Clínicas, spas, dentistas, fisioterapia</div>
      </div>
      <div class="tmpl-card">
        <div class="tmpl-name">SERVIÇO</div>
        <div class="tmpl-layout">Layout: horizontal (ícone + info + preço)</div>
        <div class="tmpl-cats">Barbearias, salões, mecânicas, oficinas</div>
      </div>
      <div class="tmpl-card">
        <div class="tmpl-name">EVENTO</div>
        <div class="tmpl-layout">Layout: vertical (banner + info)</div>
        <div class="tmpl-cats">Casas de show, teatros, centros culturais</div>
      </div>
      <div class="tmpl-card" style="border-color:#E8640A33; background:#1a0f05;">

        <div class="tmpl-name" style="color:#E8640A88;">COMO FUNCIONA</div>
        <div class="tmpl-layout" style="color:#555;">Backend retorna campo "template" no payload</div>
        <div class="tmpl-cats" style="color:#444;">App renderiza o layout correto. Nunca infere.</div>
      </div>
    </div>
  </div>

</body>
</html>

