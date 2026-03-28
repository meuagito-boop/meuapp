MEU AGITO
T07 — Busca Completa
Arquitetura de tela — Especificação completa v3
6 modos de entrada · 2 momentos · Lista + Mapa · Filtros avançados · Preservação de estado
1. Identificação da Tela
Código	T07
Nome	Busca Completa — Versão Definitiva
Tipo	Tela de busca com 2 momentos (inicial e resultados) e 2 modos de visualização (lista e mapa)
Plataforma	iOS e Android. Portrait apenas.
Fase	Fase 1.0 — presente desde o lançamento
Modos de entrada	6 modos distintos — ver seção 3
Tela anterior	T06 Home (principal) | qualquer link 'Ver mais →' das seções do Home
Telas seguintes	T_PERFIL Estabelecimento | T_ITEM template='evento'
T10 Eventos	ELIMINADA — resultados de evento levam para T_ITEM com template='evento'
M01 na T07	REMOVIDO das telas seguintes. M01 só é acessado via Config → Localidade.
Preservação estado	Ao voltar de T_PERFIL: texto, filtros, ordenação e scroll preservados em memória.
Fonte de dados	Backend → Google Places API (textsearch + nearbysearch) + dados internos
Prioridade	Crítica — segunda tela mais acessada depois do Home

2. Conceito — 2 Momentos
Momento 1 — Inicial	Campo vazio + teclado aberto. Exibe: buscas recentes (chips) + grid de 18 categorias. Orientação ao usuário sobre o que pode buscar.
Momento 2 — Resultados	Ativado por: texto digitado (2+ chars) | chip de recente tocado | chip de categoria | entradas E2–E6. Momento 1 some completamente.
Transição	Automática — ao digitar 2+ chars o Momento 2 aparece. Ao limpar o texto: volta ao Momento 1.
Preservação	Ao voltar de T_PERFIL: retorna exatamente como estava. Estado em memória — não em AsyncStorage.
Reset	Ao fechar com 'Cancelar' ou fechar o app completamente: estado descartado. Começa do zero.

3. Modos de Entrada — 6 Formas de Abrir o T07
#	Origem	Estado ao abrir	Detalhe
E1	Campo de busca do Home	Momento 1 — teclado aberto, campo vazio	Buscas recentes + grid 18 categorias. Sem filtros.
E2	Ícone filtros ⚙ do Home	Momento 2 — painel filtros já expandido	Campo vazio. Painel abre imediatamente. Teclado fechado.
E3	'Ver mais →' Z2 Home	Momento 2 — ordenação 'Mais popular'	Campo vazio. Chip 'Mais popular' ativo.
E4	'Ver agenda →' Z3 Home	Momento 2 — filtro 'Hoje e amanhã'	Campo vazio. Chip 'Hoje e amanhã ✕' ativo.
E5	'Ver tudo →' Z6 Home	Momento 2 — 'Aberto agora' + 'Mais próximo'	Campo vazio. Chips de filtro e ordenação ativos.
E6	'Ver ranking →' Z4/Z7 Home	Momento 2 — filtro de categoria + 'Mais popular'	Campo vazio. Chip da categoria ativo.

4. Header Fixo — Presente em Todos os Momentos
Elemento	Especificação	Ação
Botão 'Cancelar'	Extremo esquerdo. Arial Regular 15px #888. Área de toque 44x44px.	Fecha T07. Descarta texto e filtros. Retorna ao T06.
Campo de busca	Fundo #1A1A1A. Radius 12px. Altura 44px. Ícone lupa. Placeholder 'Buscar serviços, lugares, eventos...' Borda laranja 1.5px quando ativo.	Digitar 2+ chars → resultados em tempo real (debounce 400ms)
Ícone X (limpar)	Aparece à direita quando há texto. Cinza 18px. Some com campo vazio.	Limpa texto. Filtros pré-aplicados (E2–E6) são mantidos.
Ícone 🎙 microfone	À direita do campo. Some quando há texto — X assume o lugar.	Ativa busca por voz. Permissão de microfone solicitada aqui.
Botão lista/mapa	Ícone ≡ (lista) ou 🗺 (mapa). 24px #888. Só no Momento 2.	Alterna entre visualização lista e mapa.

5. Momento 1 — Estado Inicial
5.1 Buscas Recentes
Título + Limpar	'Buscas recentes' à esquerda. 'Limpar' laranja à direita. Mesma linha.
Chips de busca	Scroll horizontal. Ícone relógio 🕐 + texto. Máximo 8 chips. Mais recente à esquerda.
Ícone X individual	X cinza à direita de cada chip — remove apenas aquele item do histórico.
Toque no chip	Preenche campo + busca imediata → Momento 2.
Sem recentes	Seção não aparece. Tela mostra direto as categorias.
Storage	AsyncStorage — chave: 'meuagito_buscas_recentes'. Array de até 8 strings. Persiste entre sessões.

5.2 Grid de Categorias — 18 itens
Layout	Grid 3 colunas com wrap. Cada chip: fundo #1A1A1A, borda #2A2A2A, radius 12px, 72px altura.
Conteúdo do chip	Ícone colorido 22px + nome Arial Regular 13px branco.
Categorias	Gastronomia 🍽 | Beleza ✂ | Eventos 🎵 | Saúde 🏥 | Hospedagem 🏨 | Serviços 🔧 | Pet 🐾 | Automotivo 🚗 | Compras 🛍 | Educação 📚 | Fitness 💪 | Arte & Cultura 🎨 | Turismo ✈ | Tech 💻 | Outros ⚡ | + 3 categorias adicionais
Toque no chip	Aplica filtro da categoria → Momento 2 com chip ativo na barra de filtros.

6. Momento 2 — Estado de Resultados
6.1 Barra de Filtros Ativos
Botão 'Filtros ⚙'	Sempre à esquerda. Com filtros ativos: fundo laranja + badge numérico. Abre painel (bottom sheet 70%).
Chips de filtro ativo	Fundo laranja #E8640A. Texto branco. Ícone X branco. Scroll horizontal.
Remover chip	Toque no X: remove filtro e recarrega lista. Se remover todos: volta ao Momento 1.
Botão 'Ordenar ↕'	À direita dos chips. Com ordenação não-padrão: fundo laranja. Abre bottom sheet (40% da tela).
Contador	'X resultados' — extremo direito. Atualiza conforme filtros mudam.

6.2 Painel de Filtros Avançados
Filtro	Opções	Seleção	Padrão
Raio de distância	500m | 1km | 2km | 5km | 10km | 20km | Qualquer	Única — chips	5km
Categoria	18 categorias	Múltipla — chips	Nenhuma
Horário	Aberto agora | Hoje e amanhã | Este fim de semana | Qualquer	Única	Qualquer
Avaliação mínima	Qualquer | ★ 3.0+ | ★ 4.0+ | ★ 4.5+	Única — chips	Qualquer
Tipo atendimento	Presencial | Delivery | A domicílio | Online	Múltipla	Nenhum
Cidade	Cidade atual | Outra cidade → abre M01	Única	Cidade atual

Preview em tempo real: GET /api/busca/contar?filtros={...} com debounce 500ms. Retorna apenas { total: 47 }. Botão 'Ver X resultados' fixo na base do painel.

6.3 Opções de Ordenação
Relevância (padrão)	Aleatória com peso por popularidade. Nenhum estabelecimento paga para aparecer primeiro.
Mais próximo	Distância crescente da localização atual.
Melhor avaliado	Nota média decrescente. Empate: mais avaliações primeiro.
Mais popular	Volume de buscas e visualizações internas na semana.
Mais recente	Data de cadastro ou última atualização — mais novos primeiro.

6.4 Visualização em Lista (padrão)
Layout	Cards compactos em coluna única. Scroll vertical infinito.
Foto	72x72px quadrada, border-radius 10px. Fallback: ícone da categoria em fundo #2A2A2A.
Nome	Arial Bold 15px. Trecho que bate com o texto buscado: laranja Bold.
Categoria + dist.	Ícone 12px laranja + nome + ' · ' + distância. Arial Regular 12px #888.
Nota	★ laranja + nota Bold 13px + '(X avaliações)' #888.
Badge ABERTO	Verde 10px Bold. Inline. Só quando aberto.
Ícone ♡	Canto direito do card. Salva em favoritos sem navegar. Háptico leve.
Toque no card	Salva no histórico + navega para T_PERFIL (estabelecimento) ou T_ITEM (evento).
Sem resultado	Ampliar raio automaticamente — tenta com raio maior. Toast: 'Ampliamos o raio de busca para 10km'.

6.5 Visualização em Mapa
Mapa	Google Maps SDK. Tema escuro. 100% da área de conteúdo abaixo do header + filtros.
Pins	Pin laranja circular com ícone da categoria branco. 36x36px. Cluster quando sobrepostos.
Card flutuante	Ao tocar pin: bottom sheet 160px altura. Foto 60px + nome + categoria + distância + nota + botão 'Ver perfil'.
Toque 'Ver perfil'	→ T_PERFIL ou T_ITEM conforme tipo do item.
Pin do usuário	Ponto azul com halo pulsante — padrão do sistema.

7. Fluxo Completo de Navegação
De onde	Ação	Para onde	Observação
T06 Home	Campo de busca (E1)	T07 Momento 1 — teclado aberto	
T06 Home	Ícone filtros ⚙ (E2)	T07 Momento 2 — painel filtros	
T06 Home	Links 'Ver mais →' (E3–E6)	T07 Momento 2 — filtros pré-aplicados	
Momento 1	Digita 2+ chars	Momento 2 — resultados em tempo real	Debounce 400ms
Momento 1	Toca chip de recente	Momento 2 — busca pelo chip	
Momento 1	Toca chip de categoria	Momento 2 — filtrado pela categoria	
Momento 2	Toca card (estabelecimento)	T_PERFIL Estabelecimento	Preserva estado
Momento 2	Toca card (evento)	T_ITEM template='evento'	T10 eliminada
Momento 2	Limpa campo de busca	Momento 1	Filtros E2–E6 mantidos
Momento 2	Remove todos os chips	Momento 1	
Qualquer	'Cancelar'	T06 Home	Descarta estado
Qualquer	Botão físico Voltar (Android)	T06 Home	
T_PERFIL	← Voltar	T07 — exatamente como estava	Estado preservado em memória

8. Todos os Elementos — Tabela Completa
Tipo	Elemento	Ação/Destino	Momento	Observações
BOTÃO	Cancelar	Fecha T07 → T06	Todos	15px #888.
INPUT	Campo de busca	Momento 2 ao digitar 2+ chars	Todos	Debounce 400ms.
ÍCONE	X limpar campo	Limpa texto	Todos	Some com campo vazio.
ÍCONE	🎙 Microfone	Busca por voz	Todos	Some quando há texto.
BOTÃO	≡/🗺 Alternar visualização	Lista ↔ Mapa	2	Só no Momento 2.
CHIPS	Buscas recentes	Preenche campo + busca	1	Máx 8. AsyncStorage.
GRID	18 chips de categoria	Aplica filtro → Momento 2	1	3 colunas. 72px altura.
BOTÃO	Filtros ⚙	Abre painel filtros (70%)	2	Badge com qtd. de filtros.
CHIPS	Chips de filtro ativo	X remove filtro	2	Fundo laranja.
BOTÃO	Ordenar ↕	Abre bottom sheet ordenação	2	40% da tela.
VISUAL	Contador 'X resultados'	Sem ação	2	Atualiza em tempo real.
CARDS	Cards lista	T_PERFIL ou T_ITEM	2	72px foto. Compact.
MAPA	Pins laranja	Card flutuante ao tocar	2	Cluster quando sobrepostos.
BOTÃO	'Ver perfil' no card mapa	T_PERFIL ou T_ITEM	2	Laranja.
ÍCONE	♡ salvar no card	Favoritos — sem navegar	2	Háptico leve.

9. Regras de Negócio
RN-01 — T10 Eventos eliminada
Resultados de busca do tipo 'evento' navegam para T_ITEM com template='evento'. Listas de eventos passam pelo T07 com filtro categoria='evento'. A tela T10 não existe mais.
RN-02 — M01 removido das telas seguintes
O M01 Modal de Troca de Cidade não é mais acessado a partir do T07. Acesso exclusivo via Config → Localidade.
RN-03 — Preservação de estado ao voltar
Ao navegar para T_PERFIL e voltar: T07 retorna exatamente como estava — mesmo texto, filtros, ordenação e posição de scroll. Estado em memória — não persiste ao fechar o app.
RN-04 — Sem resultado amplia raio automaticamente
Se a busca retornar zero resultados: o app tenta automaticamente com raio maior. Toast informativo: 'Ampliamos o raio de busca para 10km'.
RN-05 — Relevância como padrão de ordenação
A ordenação padrão é 'Relevância' — aleatória com peso por popularidade. Nenhum estabelecimento paga para aparecer primeiro. Garante experiência justa e variada.
RN-06 — Campo 'tipo' define a navegação
O backend retorna o campo 'tipo' em cada resultado ('evento' | 'estabelecimento'). O app navega conforme o valor — nunca infere pelo visual do card.
RN-07 — Portrait apenas
Landscape bloqueado — o mapa em landscape causaria layout inconsistente com o restante do app.

Dev: GET /api/busca?q={texto}&filtros={...}&pagina={n}&limite=20. Busca por voz: Speech Recognition API. Estado da tela preservado com useRef ou Redux — não em AsyncStorage.

10. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui Momento 1 (buscas recentes + grid de categorias), Momento 2 (lista de resultados com filtros), barra de navegação v3 e visualização em mapa.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T07 Busca v3</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#111; font-family:Arial,sans-serif; display:flex; justify-content:center; align-items:flex-start; padding:30px 20px; min-height:100vh; gap:28px; flex-wrap:wrap; }

  h2 { color:#E8640A; font-size:13px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; text-align:center; }
  .sub { color:#666; font-size:11px; text-align:center; margin-bottom:14px; }

  .phone {
    width:340px; height:760px;
    background:#0D0D0D;
    border-radius:38px;
    border:2px solid #2A2A2A;
    overflow:hidden;
    display:flex; flex-direction:column;

    box-shadow:0 16px 50px rgba(0,0,0,0.8);
    flex-shrink:0;
  }

  /* STATUS */
  .status { height:26px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:0 20px; font-size:11px; color:#888; background:#0D0D0D; }

  /* HEADER BUSCA */
  .search-header { display:flex; align-items:center; gap:10px; padding:8px 14px 10px; background:#0D0D0D; flex-shrink:0; border-bottom:1px solid #1A1A1A; }
  .cancel-btn { font-size:13px; color:#888; flex-shrink:0; cursor:pointer; white-space:nowrap; }
  .search-field { flex:1; background:#1A1A1A; border-radius:12px; height:40px; display:flex; align-items:center; padding:0 12px; gap:7px; border:1.5px solid #E8640A; }
  .sf-icon { font-size:14px; color:#666; }
  .sf-input { flex:1; font-size:13px; color:#fff; background:transparent; border:none; outline:none; }

  .sf-clear { font-size:14px; color:#555; cursor:pointer; }
  .sf-mic { font-size:16px; color:#666; cursor:pointer; }
  .toggle-view { font-size:18px; color:#888; cursor:pointer; flex-shrink:0; }

  /* BARRA DE FILTROS */
  .filter-bar { display:flex; align-items:center; gap:8px; overflow-x:auto; padding:8px 14px; background:#0D0D0D; border-bottom:1px solid #1A1A1A; flex-shrink:0; }
  .filter-bar::-webkit-scrollbar { display:none; }
  .filter-btn { flex-shrink:0; display:flex; align-items:center; gap:5px; padding:6px 12px; border-radius:18px; font-size:11px; cursor:pointer; white-space:nowrap; border:1px solid #2A2A2A; color:#888; background:#1A1A1A; transition:all 0.15s; }
  .filter-btn.active { background:#E8640A; color:#fff; font-weight:bold; border-color:#E8640A; }
  .filter-btn .badge-f { background:rgba(255,255,255,0.3); color:#fff; font-size:9px; font-weight:bold; width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; }

  .chip-remove { font-size:10px; opacity:0.8; }
  .result-count { flex-shrink:0; margin-left:auto; font-size:11px; color:#555; white-space:nowrap; }

  /* SCROLL */
  .results-scroll { flex:1; overflow-y:auto; overflow-x:hidden; }
  .results-scroll::-webkit-scrollbar { display:none; }

  /* RESULT INFO BAR */
  .result-info { display:flex; align-items:center; justify-content:space-between; padding:10px 14px 6px; }
  .ri-text { font-size:12px; color:#555; }
  .ri-text b { color:#aaa; }
  .sort-btn { display:flex; align-items:center; gap:4px; font-size:11px; color:#E8640A; cursor:pointer; }

  /* CARD COMPACTO */
  .result-card { display:flex; align-items:center; gap:12px; padding:11px 14px; border-bottom:1px solid #141414; cursor:pointer; transition:background 0.1s; background:#0D0D0D; }
  .result-card:active { background:#141414; }


  .rc-img { width:72px; height:72px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:28px; position:relative; overflow:hidden; }
  .rc-img-fallback { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:28px; }

  .rc-body { flex:1; min-width:0; }
  .rc-name { font-size:14px; font-weight:bold; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
  .rc-name .highlight { color:#E8640A; }
  .rc-meta { display:flex; align-items:center; gap:5px; font-size:11px; color:#666; margin-bottom:3px; flex-wrap:wrap; }
  .rc-open { background:#1A7A4A; color:#fff; font-size:8px; font-weight:bold; padding:1px 5px; border-radius:3px; }
  .rc-closed { background:#4A1A1A; color:#ff6b6b; font-size:8px; font-weight:bold; padding:1px 5px; border-radius:3px; }

  .rc-stars { color:#E8640A; font-size:11px; }
  .rc-social { font-size:11px; color:#E8640A; margin-top:1px; }

  .rc-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
  .rc-save { font-size:20px; color:#333; cursor:pointer; line-height:1; }
  .rc-save.saved { color:#E8640A; }
  .rc-dist { font-size:11px; color:#555; }

  /* SKELETON */
  .skeleton-card { display:flex; align-items:center; gap:12px; padding:11px 14px; border-bottom:1px solid #141414; }
  .skel-img { width:72px; height:72px; border-radius:10px; background:#1A1A1A; flex-shrink:0; animation:shimmer 1.5s infinite; }
  .skel-body { flex:1; }
  .skel-line { height:12px; border-radius:6px; background:#1A1A1A; margin-bottom:8px; animation:shimmer 1.5s infinite; }
  .skel-line.w80 { width:80%; }

  .skel-line.w60 { width:60%; }
  .skel-line.w40 { width:40%; }
  @keyframes shimmer { 0%,100%{opacity:0.4}50%{opacity:0.8} }

  /* SEM RESULTADO */
  .no-result { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 24px; text-align:center; }
  .nr-icon { font-size:52px; color:#2A2A2A; margin-bottom:14px; }
  .nr-title { font-size:16px; font-weight:bold; color:#aaa; margin-bottom:6px; }
  .nr-sub { font-size:12px; color:#555; line-height:1.6; margin-bottom:20px; }
  .nr-btn { background:#E8640A; color:#fff; font-size:13px; font-weight:bold; padding:11px 22px; border-radius:12px; cursor:pointer; margin-bottom:10px; }
  .nr-link { font-size:13px; color:#E8640A; cursor:pointer; }

  /* MODAL ORDENAÇÃO */
  .modal-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:100; display:none; }

  .modal-overlay.open { display:block; }
  .sort-sheet { position:absolute; bottom:0; left:0; right:0; background:#161616; border-radius:20px 20px 0 0; padding:0 0 16px; z-index:101; transform:translateY(100%); transition:transform 0.3s ease; }
  .sort-sheet.open { transform:translateY(0); }
  .sort-handle { width:36px; height:4px; background:#333; border-radius:2px; margin:12px auto 16px; }
  .sort-title { font-size:15px; font-weight:bold; color:#fff; padding:0 16px 12px; border-bottom:1px solid #1A1A1A; }
  .sort-option { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #0D0D0D; cursor:pointer; }
  .sort-option:last-child { border-bottom:none; }
  .sort-opt-left { display:flex; align-items:center; gap:10px; }
  .sort-opt-icon { font-size:18px; width:24px; }

  .sort-opt-text { font-size:14px; color:#fff; }
  .sort-opt-sub { font-size:11px; color:#555; margin-top:1px; }
  .sort-check { font-size:16px; color:#E8640A; }

  /* MODAL FILTROS */
  .filter-sheet { position:absolute; bottom:0; left:0; right:0; background:#161616; border-radius:20px 20px 0 0; z-index:101; transform:translateY(100%); transition:transform 0.3s ease; max-height:85%; overflow-y:auto; }
  .filter-sheet::-webkit-scrollbar { display:none; }
  .filter-sheet.open { transform:translateY(0); }
  .fs-header { display:flex; align-items:center; justify-content:space-between; padding:16px 16px 12px; border-bottom:1px solid #1A1A1A; position:sticky; top:0; background:#161616; z-index:10; }
  .fs-title { font-size:15px; font-weight:bold; color:#fff; }
  .fs-clear { font-size:13px; color:#E8640A; cursor:pointer; }

  .fs-section { padding:14px 16px 8px; }
  .fs-sec-title { font-size:12px; font-weight:bold; color:#888; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; }
  .fs-chips { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:4px; }
  .fs-chip { padding:7px 14px; border-radius:18px; font-size:12px; border:1px solid #2A2A2A; color:#888; background:#1A1A1A; cursor:pointer; transition:all 0.15s; }
  .fs-chip.ac { background:#E8640A; color:#fff; border-color:#E8640A; font-weight:bold; }
  .fs-divider { height:1px; background:#1A1A1A; margin:4px 0; }
  .fs-footer { padding:14px 16px 8px; position:sticky; bottom:0; background:#161616; border-top:1px solid #1A1A1A; }
  .fs-apply { width:100%; background:#E8640A; color:#fff; font-size:14px; font-weight:bold; padding:13px 0; border-radius:12px; text-align:center; cursor:pointer; }


  /* MAPA VIEW */
  .map-view { flex:1; position:relative; background:#0A1A0A; display:none; }
  .map-view.active { display:flex; align-items:center; justify-content:center; }
  .map-placeholder { text-align:center; }
  .map-ph-icon { font-size:48px; color:#1A3A1A; margin-bottom:10px; }
  .map-ph-text { font-size:13px; color:#2A4A2A; }
  .map-pins { position:absolute; top:0; left:0; width:100%; height:100%; }
  .map-pin { position:absolute; cursor:pointer; text-align:center; }
  .mp-circle { width:36px; height:36px; border-radius:50%; background:#E8640A; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.5); }
  .mp-label { font-size:9px; color:#fff; margin-top:3px; white-space:nowrap; background:rgba(0,0,0,0.6); padding:1px 4px; border-radius:3px; max-width:60px; overflow:hidden; text-overflow:ellipsis; }

  .map-my-loc { position:absolute; width:14px; height:14px; border-radius:50%; background:#4A90FF; border:2px solid #fff; box-shadow:0 0 0 6px rgba(74,144,255,0.2); }
  .map-center-btn { position:absolute; bottom:16px; right:14px; width:36px; height:36px; background:#161616; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 2px 8px rgba(0,0,0,0.6); cursor:pointer; border:1px solid #2A2A2A; }

  /* BOTTOM NAV */
  .bottom-nav { border-top:1px solid #1A1A1A; display:flex; align-items:center; justify-content:space-around; padding:10px 0 14px; background:#0D0D0D; flex-shrink:0; }
  .nav-tab { text-align:center; cursor:pointer; }
  .nav-icon-b { font-size:20px; color:#555; }
  .nav-lbl { font-size:9px; color:#555; margin-top:2px; }
  .nav-center { width:50px; height:50px; border-radius:50%; background:#E8640A; display:flex; align-items:center; justify-content:center; font-size:21px; margin-top:-9px; box-shadow:0 0 18px rgba(232,100,10,0.6); cursor:pointer; }


  .spacer { height:12px; }
</style>
</head>
<body>

<!-- ══════════════════════════════════════════
     TELA 1 — MOMENTO 1 (campo vazio, teclado aberto)
══════════════════════════════════════════ -->
<div>
  <h2>Estado inicial</h2>
  <p class="sub">Campo vazio · Buscas recentes + Categorias</p>
  <div class="phone">
    <div class="status"><span>21:30</span><span>📶 🔋</span></div>
    <div class="search-header">
      <span class="cancel-btn">Cancelar</span>
      <div class="search-field">
        <span class="sf-icon">🔍</span>
        <input class="sf-input" placeholder="Buscar serviços, lugares, eventos..." readonly>
        <span class="sf-mic">🎙</span>
      </div>
    </div>
    <div class="results-scroll">
      <!-- BUSCAS RECENTES -->
      <div style="padding:14px 14px 6px;display:flex;align-items:center;justify-content:space-between">

        <span style="font-size:12px;font-weight:bold;color:#666;text-transform:uppercase;letter-spacing:0.5px">Buscas recentes</span>
        <span style="font-size:12px;color:#E8640A;cursor:pointer">Limpar</span>
      </div>
      <div style="display:flex;gap:8px;overflow-x:auto;padding:4px 14px 14px">
        <div style="flex-shrink:0;display:flex;align-items:center;gap:5px;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:20px;padding:7px 12px;font-size:12px;color:#aaa;cursor:pointer">🕐 barbearia <span style="font-size:10px;color:#444">✕</span></div>
        <div style="flex-shrink:0;display:flex;align-items:center;gap:5px;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:20px;padding:7px 12px;font-size:12px;color:#aaa;cursor:pointer">🕐 pizza perto <span style="font-size:10px;color:#444">✕</span></div>

        <div style="flex-shrink:0;display:flex;align-items:center;gap:5px;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:20px;padding:7px 12px;font-size:12px;color:#aaa;cursor:pointer">🕐 hotel sp <span style="font-size:10px;color:#444">✕</span></div>
      </div>
      <!-- DIVISOR -->
      <div style="height:1px;background:#1A1A1A;margin:0 14px"></div>
      <!-- CATEGORIAS -->
      <div style="padding:14px 14px 8px">
        <span style="font-size:12px;font-weight:bold;color:#666;text-transform:uppercase;letter-spacing:0.5px">Categorias</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 14px 14px">
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">

          <div style="font-size:22px;margin-bottom:5px">🍽</div><div style="font-size:11px;color:#fff">Gastronomia</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">
          <div style="font-size:22px;margin-bottom:5px">✂</div><div style="font-size:11px;color:#fff">Beleza</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">
          <div style="font-size:22px;margin-bottom:5px">🎵</div><div style="font-size:11px;color:#fff">Eventos</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">

          <div style="font-size:22px;margin-bottom:5px">🏥</div><div style="font-size:11px;color:#fff">Saúde</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">
          <div style="font-size:22px;margin-bottom:5px">🏨</div><div style="font-size:11px;color:#fff">Hospedagem</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">
          <div style="font-size:22px;margin-bottom:5px">🔧</div><div style="font-size:11px;color:#fff">Serviços</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">

          <div style="font-size:22px;margin-bottom:5px">🐾</div><div style="font-size:11px;color:#fff">Pet</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">
          <div style="font-size:22px;margin-bottom:5px">🚗</div><div style="font-size:11px;color:#fff">Automotivo</div>
        </div>
        <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer">
          <div style="font-size:22px;margin-bottom:5px">🛍</div><div style="font-size:11px;color:#fff">Compras</div>
        </div>
      </div>
    </div>
    <div class="bottom-nav">
      <div class="nav-tab"><div class="nav-icon-b">👥</div><div class="nav-lbl">Social</div></div>

      <div class="nav-tab"><div class="nav-icon-b" style="font-size:18px;">✚</div><div class="nav-lbl">Criar</div></div>
      <div class="nav-center">★</div>
      <div class="nav-tab"><div class="nav-icon-b">📋</div><div class="nav-lbl">Atividade</div></div>
      <div class="nav-tab"><div class="nav-icon-b">⚙</div><div class="nav-lbl">Config</div></div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════
     TELA 2 — MOMENTO 2 (resultados padrão)
══════════════════════════════════════════ -->
<div>
  <h2>Resultados — Lista padrão</h2>
  <p class="sub">Qualquer busca · card compacto idêntico · scroll vertical</p>
  <div class="phone" style="position:relative">
    <div class="status"><span>21:30</span><span>📶 🔋</span></div>
    <div class="search-header">
      <span class="cancel-btn">Cancelar</span>

      <div class="search-field">
        <span class="sf-icon">🔍</span>
        <input class="sf-input" value="barbearia" readonly>
        <span class="sf-clear">✕</span>
      </div>
      <span class="toggle-view" id="toggle-btn" onclick="toggleView()">🗺</span>
    </div>

    <!-- FILTROS ATIVOS -->
    <div class="filter-bar">
      <div class="filter-btn active" onclick="openFilters()">⚙ Filtros <div class="badge-f">2</div></div>
      <div class="filter-btn active">Beleza ✕</div>
      <div class="filter-btn active">Aberto agora ✕</div>
      <div class="filter-btn" onclick="openSort()">Ordenar ↕</div>
      <span class="result-count">23 resultados</span>
    </div>

    <!-- LISTA DE RESULTADOS -->
    <div class="results-scroll" id="list-view">
      <div class="result-info">
        <span class="ri-text">Exibindo <b>10 de 23</b> resultados</span>

        <span class="sort-btn" onclick="openSort()">↕ Relevância</span>
      </div>

      <!-- CARD 1 -->
      <div class="result-card">
        <div class="rc-img" style="background:linear-gradient(135deg,#0A0A1A,#1A1A3A)"><div class="rc-img-fallback">✂</div></div>
        <div class="rc-body">
          <div class="rc-name"><span class="highlight">Barb</span>earia Vintage</div>
          <div class="rc-meta"><span>✂ Barbearia</span><span>·</span><span>320m</span><span class="rc-open">ABERTO</span></div>
          <div class="rc-meta"><span class="rc-stars">★★★★★</span><span style="color:#666">4.8 (184)</span></div>
          <div class="rc-social">👥 Seu amigo João foi aqui</div>
        </div>
        <div class="rc-right"><span class="rc-save">♡</span><span class="rc-dist">320m</span></div>

      </div>

      <!-- CARD 2 -->
      <div class="result-card">
        <div class="rc-img" style="background:linear-gradient(135deg,#1A0A1A,#2A1A2A)"><div class="rc-img-fallback">💇</div></div>
        <div class="rc-body">
          <div class="rc-name">Salão <span class="highlight">Barb</span>osa &amp; Arte</div>
          <div class="rc-meta"><span>✂ Salão</span><span>·</span><span>780m</span><span class="rc-open">ABERTO</span></div>
          <div class="rc-meta"><span class="rc-stars">★★★★☆</span><span style="color:#666">4.6 (97)</span></div>
          <div class="rc-social">🔥 12 buscas hoje</div>
        </div>
        <div class="rc-right"><span class="rc-save saved">♥</span><span class="rc-dist">780m</span></div>
      </div>

      <!-- CARD 3 -->
      <div class="result-card">

        <div class="rc-img" style="background:linear-gradient(135deg,#0A1A0A,#1A2A1A)"><div class="rc-img-fallback">🪒</div></div>
        <div class="rc-body">
          <div class="rc-name"><span class="highlight">Barb</span>eiro do Povo</div>
          <div class="rc-meta"><span>✂ Barbearia</span><span>·</span><span>1.2km</span><span class="rc-open">ABERTO</span></div>
          <div class="rc-meta"><span class="rc-stars">★★★★★</span><span style="color:#666">4.9 (312)</span></div>
          <div class="rc-social">📈 Mais avaliado da semana</div>
        </div>
        <div class="rc-right"><span class="rc-save">♡</span><span class="rc-dist">1.2km</span></div>
      </div>

      <!-- CARD 4 -->
      <div class="result-card">
        <div class="rc-img" style="background:linear-gradient(135deg,#1A1A0A,#2A2A1A)"><div class="rc-img-fallback">✂</div></div>

        <div class="rc-body">
          <div class="rc-name">Corte &amp; <span class="highlight">Barb</span>a Premium</div>
          <div class="rc-meta"><span>✂ Barbearia</span><span>·</span><span>1.5km</span><span class="rc-open">ABERTO</span></div>
          <div class="rc-meta"><span class="rc-stars">★★★★☆</span><span style="color:#666">4.5 (58)</span></div>
          <div class="rc-social">🆕 Novo no Meu Agito</div>
        </div>
        <div class="rc-right"><span class="rc-save">♡</span><span class="rc-dist">1.5km</span></div>
      </div>

      <!-- CARD 5 -->
      <div class="result-card">
        <div class="rc-img" style="background:linear-gradient(135deg,#1A0A0A,#2A1A1A)"><div class="rc-img-fallback">💈</div></div>
        <div class="rc-body">
          <div class="rc-name">Studio <span class="highlight">Barb</span>a &amp; Estilo</div>

          <div class="rc-meta"><span>✂ Barbearia</span><span>·</span><span>1.8km</span><span class="rc-closed">FECHADO</span></div>
          <div class="rc-meta"><span class="rc-stars">★★★★★</span><span style="color:#666">4.7 (143)</span></div>
          <div class="rc-social" style="color:#888">Abre amanhã às 9h</div>
        </div>
        <div class="rc-right"><span class="rc-save">♡</span><span class="rc-dist">1.8km</span></div>
      </div>

      <!-- CARD 6 -->
      <div class="result-card">
        <div class="rc-img" style="background:linear-gradient(135deg,#0A0A1A,#1A1A3A)"><div class="rc-img-fallback">🪒</div></div>
        <div class="rc-body">
          <div class="rc-name"><span class="highlight">Barb</span>earia Clássica SP</div>
          <div class="rc-meta"><span>✂ Barbearia</span><span>·</span><span>2.1km</span><span class="rc-open">ABERTO</span></div>

          <div class="rc-meta"><span class="rc-stars">★★★★☆</span><span style="color:#666">4.4 (76)</span></div>
          <div class="rc-social">👥 Seu amigo Pedro foi aqui</div>
        </div>
        <div class="rc-right"><span class="rc-save">♡</span><span class="rc-dist">2.1km</span></div>
      </div>

      <!-- CARD 7 -->
      <div class="result-card">
        <div class="rc-img" style="background:linear-gradient(135deg,#1A0A1A,#2A1A2A)"><div class="rc-img-fallback">✂</div></div>
        <div class="rc-body">
          <div class="rc-name">The Old <span class="highlight">Barb</span>er Shop</div>
          <div class="rc-meta"><span>✂ Barbearia</span><span>·</span><span>2.4km</span><span class="rc-open">ABERTO</span></div>
          <div class="rc-meta"><span class="rc-stars">★★★★★</span><span style="color:#666">4.8 (201)</span></div>

          <div class="rc-social">🔥 43 buscas essa semana</div>
        </div>
        <div class="rc-right"><span class="rc-save">♡</span><span class="rc-dist">2.4km</span></div>
      </div>

      <!-- SKELETON (carregando mais) -->
      <div class="skeleton-card"><div class="skel-img"></div><div class="skel-body"><div class="skel-line w80"></div><div class="skel-line w60"></div><div class="skel-line w40"></div></div></div>
      <div class="skeleton-card"><div class="skel-img"></div><div class="skel-body"><div class="skel-line w80"></div><div class="skel-line w60"></div><div class="skel-line w40"></div></div></div>
      <div class="spacer"></div>
    </div>

    <!-- MAPA (hidden por padrão) -->
    <div class="map-view" id="map-view">
      <div style="width:100%;height:100%;background:linear-gradient(135deg,#0A140A,#0A100A);position:relative;display:flex;align-items:center;justify-content:center">

        <!-- Fundo mapa dark -->
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0.15">
          <div style="position:absolute;top:40%;left:20%;width:60%;height:1px;background:#2A4A2A"></div>
          <div style="position:absolute;top:30%;left:45%;width:1px;height:50%;background:#2A4A2A"></div>
          <div style="position:absolute;top:55%;left:10%;width:40%;height:1px;background:#2A4A2A"></div>
          <div style="position:absolute;top:20%;left:60%;width:1px;height:30%;background:#2A4A2A"></div>
          <div style="position:absolute;top:65%;left:30%;width:50%;height:1px;background:#2A4A2A"></div>
          <div style="position:absolute;top:25%;left:0%;width:30%;height:1px;background:#1A3A1A"></div>
          <div style="position:absolute;top:75%;left:20%;width:1px;height:20%;background:#1A3A1A"></div>

        </div>
        <!-- Pins -->
        <div class="map-pin" style="top:28%;left:42%"><div class="mp-circle">✂</div><div class="mp-label">Vintage</div></div>
        <div class="map-pin" style="top:45%;left:20%"><div class="mp-circle">💇</div><div class="mp-label">Barbosa</div></div>
        <div class="map-pin" style="top:35%;left:68%"><div class="mp-circle">🪒</div><div class="mp-label">Do Povo</div></div>
        <div class="map-pin" style="top:60%;left:55%"><div class="mp-circle">✂</div><div class="mp-label">Premium</div></div>
        <div class="map-pin" style="top:20%;left:30%"><div class="mp-circle">💈</div><div class="mp-label">Studio</div></div>
        <div class="map-pin" style="top:70%;left:30%"><div class="mp-circle" style="background:#555">✂</div><div class="mp-label" style="color:#888">Clássica</div></div>

        <!-- Localização do usuário -->
        <div class="map-my-loc" style="position:absolute;top:50%;left:50%"></div>
        <!-- Botão centralizar -->
        <div class="map-center-btn">🎯</div>
      </div>
    </div>

    <!-- BOTTOM NAV -->
    <div class="bottom-nav">
      <div class="nav-tab"><div class="nav-icon-b">👥</div><div class="nav-lbl">Social</div></div>
      <div class="nav-tab"><div class="nav-icon-b" style="font-size:18px;">✚</div><div class="nav-lbl">Criar</div></div>
      <div class="nav-center">★</div>
      <div class="nav-tab"><div class="nav-icon-b">📋</div><div class="nav-lbl">Atividade</div></div>
      <div class="nav-tab"><div class="nav-icon-b">⚙</div><div class="nav-lbl">Config</div></div>
    </div>

    <!-- OVERLAY ORDENAÇÃO -->
    <div class="modal-overlay" id="sort-overlay" onclick="closeSort()">

      <div class="sort-sheet" id="sort-sheet" onclick="event.stopPropagation()">
        <div class="sort-handle"></div>
        <div class="sort-title">Ordenar por</div>
        <div class="sort-option">
          <div class="sort-opt-left"><span class="sort-opt-icon">🎲</span><div><div class="sort-opt-text">Relevância</div><div class="sort-opt-sub">Ordem mista por popularidade</div></div></div>
          <span class="sort-check">✓</span>
        </div>
        <div class="sort-option">
          <div class="sort-opt-left"><span class="sort-opt-icon">📍</span><div><div class="sort-opt-text">Mais próximo</div><div class="sort-opt-sub">Menor distância primeiro</div></div></div>
        </div>
        <div class="sort-option">
          <div class="sort-opt-left"><span class="sort-opt-icon">⭐</span><div><div class="sort-opt-text">Melhor avaliado</div><div class="sort-opt-sub">Maior nota primeiro</div></div></div>

        </div>
        <div class="sort-option">
          <div class="sort-opt-left"><span class="sort-opt-icon">🔥</span><div><div class="sort-opt-text">Mais popular</div><div class="sort-opt-sub">Volume de buscas na semana</div></div></div>
        </div>
        <div class="sort-option">
          <div class="sort-opt-left"><span class="sort-opt-icon">🆕</span><div><div class="sort-opt-text">Mais recente</div><div class="sort-opt-sub">Cadastrados recentemente</div></div></div>
        </div>
      </div>
    </div>

    <!-- OVERLAY FILTROS -->
    <div class="modal-overlay" id="filter-overlay" onclick="closeFilters()">
      <div class="filter-sheet" id="filter-sheet" onclick="event.stopPropagation()">
        <div class="fs-header"><span class="fs-title">Filtros</span><span class="fs-clear">Limpar tudo</span></div>

        <div class="fs-section">
          <div class="fs-sec-title">Raio de distância</div>
          <div class="fs-chips">
            <div class="fs-chip">500m</div><div class="fs-chip">1km</div><div class="fs-chip">2km</div>
            <div class="fs-chip ac">5km</div><div class="fs-chip">10km</div><div class="fs-chip">20km</div><div class="fs-chip">Qualquer</div>
          </div>
        </div>
        <div class="fs-divider"></div>
        <div class="fs-section">
          <div class="fs-sec-title">Categoria</div>
          <div class="fs-chips">
            <div class="fs-chip ac">✂ Beleza</div><div class="fs-chip">🍽 Gastronomia</div>
            <div class="fs-chip">🏥 Saúde</div><div class="fs-chip">🎵 Eventos</div>
            <div class="fs-chip">🏨 Hospedagem</div><div class="fs-chip">🔧 Serviços</div>

            <div class="fs-chip">💪 Fitness</div><div class="fs-chip">🐾 Pet</div>
          </div>
        </div>
        <div class="fs-divider"></div>
        <div class="fs-section">
          <div class="fs-sec-title">Horário</div>
          <div class="fs-chips">
            <div class="fs-chip ac">Aberto agora</div><div class="fs-chip">Hoje e amanhã</div>
            <div class="fs-chip">Este fim de semana</div><div class="fs-chip">Qualquer</div>
          </div>
        </div>
        <div class="fs-divider"></div>
        <div class="fs-section">
          <div class="fs-sec-title">Avaliação mínima</div>
          <div class="fs-chips">
            <div class="fs-chip">Qualquer</div><div class="fs-chip">★ 3.0+</div>
            <div class="fs-chip">★ 4.0+</div><div class="fs-chip">★ 4.5+</div>

          </div>
        </div>
        <div class="fs-divider"></div>
        <div class="fs-section">
          <div class="fs-sec-title">Tipo de atendimento</div>
          <div class="fs-chips">
            <div class="fs-chip">Presencial</div><div class="fs-chip">Delivery</div>
            <div class="fs-chip">A domicílio</div><div class="fs-chip">Online</div>
          </div>
        </div>
        <div class="fs-footer">
          <div class="fs-apply" onclick="closeFilters()">Ver 23 resultados</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════
     TELA 3 — SEM RESULTADO
══════════════════════════════════════════ -->
<div>
  <h2>Sem resultado</h2>
  <p class="sub">Nenhum resultado no raio atual · opções de ampliar</p>
  <div class="phone">

    <div class="status"><span>21:30</span><span>📶 🔋</span></div>
    <div class="search-header">
      <span class="cancel-btn">Cancelar</span>
      <div class="search-field">
        <span class="sf-icon">🔍</span>
        <input class="sf-input" value="spa de luxo" readonly>
        <span class="sf-clear">✕</span>
      </div>
      <span class="toggle-view">🗺</span>
    </div>
    <div class="filter-bar">
      <div class="filter-btn active">⚙ Filtros <div class="badge-f">1</div></div>
      <div class="filter-btn active">Saúde ✕</div>
      <div class="filter-btn">Ordenar ↕</div>
      <span class="result-count">0 resultados</span>
    </div>
    <div class="results-scroll">
      <div class="no-result">
        <div class="nr-icon">🔍</div>
        <div class="nr-title">Nada encontrado em 5km</div>

        <div class="nr-sub">Não encontramos "spa de luxo" perto de você com os filtros atuais.</div>
        <div class="nr-btn">Ampliar para 10km</div>
        <div class="nr-link">Buscar em outra cidade →</div>
        <div style="height:20px"></div>
        <div style="font-size:12px;color:#555;margin-bottom:10px">Você também pode gostar de:</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:10px 14px;cursor:pointer;text-align:center">
            <div style="font-size:20px;margin-bottom:4px">🏥</div>
            <div style="font-size:11px;color:#888">Saúde</div>
            <div style="font-size:10px;color:#555">8 próximos</div>
          </div>
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:10px 14px;cursor:pointer;text-align:center">

            <div style="font-size:20px;margin-bottom:4px">✂</div>
            <div style="font-size:11px;color:#888">Beleza</div>
            <div style="font-size:10px;color:#555">14 próximos</div>
          </div>
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:10px 14px;cursor:pointer;text-align:center">
            <div style="font-size:20px;margin-bottom:4px">💆</div>
            <div style="font-size:11px;color:#888">Bem-estar</div>
            <div style="font-size:10px;color:#555">3 próximos</div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-nav">
      <div class="nav-tab"><div class="nav-icon-b">👥</div><div class="nav-lbl">Social</div></div>
      <div class="nav-tab"><div class="nav-icon-b" style="font-size:18px;">✚</div><div class="nav-lbl">Criar</div></div>

      <div class="nav-center">★</div>
      <div class="nav-tab"><div class="nav-icon-b">📋</div><div class="nav-lbl">Atividade</div></div>
      <div class="nav-tab"><div class="nav-icon-b">⚙</div><div class="nav-lbl">Config</div></div>
    </div>
  </div>
</div>

<script>
  let isMap = false;
  function toggleView() {
    isMap = !isMap;
    document.getElementById('list-view').style.display = isMap ? 'none' : 'block';
    document.getElementById('map-view').style.display = isMap ? 'flex' : 'none';
    document.getElementById('toggle-btn').textContent = isMap ? '☰' : '🗺';
  }
  function openSort() {
    document.getElementById('sort-overlay').classList.add('open');
    setTimeout(() => document.getElementById('sort-sheet').classList.add('open'), 10);
  }
  function closeSort() {
    document.getElementById('sort-sheet').classList.remove('open');

    setTimeout(() => document.getElementById('sort-overlay').classList.remove('open'), 300);
  }
  function openFilters() {
    document.getElementById('filter-overlay').classList.add('open');
    setTimeout(() => document.getElementById('filter-sheet').classList.add('open'), 10);
  }
  function closeFilters() {
    document.getElementById('filter-sheet').classList.remove('open');
    setTimeout(() => document.getElementById('filter-overlay').classList.remove('open'), 300);
  }
</script>
</body>
</html>

