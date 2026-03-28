MEU AGITO
T05b — Cadastro Empresarial
Arquitetura de tela — Especificação completa v3
Cria a vitrine do negócio na plataforma — inclui regras de negócio e verificação de perfil
Documento unificado: T05b + T05b Regras de Negócio v2
1. Identificação da Tela
Código	T05b
Nome	Cadastro Empresarial
Tipo	Fluxo de cadastro guiado — 5 etapas sequenciais
Fase do produto	Fase 1.0 — Presente desde o lançamento
Perfil de acesso	Usuários que escolheram 'Conta empresarial' em T04
Tela anterior	T04 — Escolha de Perfil
Tela seguinte	T06 — Home (após concluir o passo 5)
Pode ser pulada?	Não — o cadastro empresarial é obrigatório para ativar o perfil
Número de passos	5 passos sequenciais com barra de progresso
Sem barra inferior	Fluxo de configuração inicial — barra NÃO aparece
Prioridade	Crítica — sem ela o estabelecimento não aparece como ativo na vitrine

2. Objetivo da Tela
A T05b é o momento em que um negócio ganha vida no Meu Agito. Ela transforma um simples cadastro de conta empresarial em uma vitrine profissional visível para todos os usuários da região. O fluxo é guiado e projetado para ser concluído em menos de 5 minutos — mesmo por donos de negócio sem familiaridade com tecnologia.

Objetivo 1 — Criar a vitrine do negócio
Coletar nome, endereço, categoria e foto — o mínimo necessário para o negócio aparecer no feed de clientes próximos.
Objetivo 2 — Substituir o perfil importado da API
Se o estabelecimento já existia via Google Places API, o cadastro ativo o substitui. O comerciante assume o controle total — fotos melhores, descrição personalizada. O sistema comunica isso positivamente: 'Seu negócio já tinha X visualizações. Agora você está no controle.'
Objetivo 3 — Preparar para interações futuras
Ao final do cadastro, o perfil está pronto para receber visitas, salvamentos e avaliações. Os campos de agendamento e pedido estão reservados para a Fase 1.2.

3. Estrutura Geral
Fundo	#0D0D0D — preto profundo, padrão do app
Barra de progresso	Topo — 5 segmentos. Laranja: concluído. Laranja 50%: ativo. Cinza: pendente.
Indicador	'Passo X de 5' — cinza #444 — 10px
Título do passo	Branco bold 17px
Botão avançar	'Continuar' ou 'Finalizar' (passo 5). Laranja — 100% largura — 42px — radius 12px
Botão voltar	← no header — retorna ao passo anterior sem apagar dados
Sem botão pular	O cadastro empresarial não pode ser pulado — todos os campos obrigatórios devem ser preenchidos
Teclado	Ao abrir campo: tela rola automaticamente para não esconder o campo atrás do teclado

4. Detalhamento dos 5 Passos
PASSO 1 — Informações Básicas
Objetivo: coletar o nome, telefone, site e descrição do negócio.

Nome do negócio *	Obrigatório. Máx 60 chars. Contador visível. Placeholder: 'Ex: Barbearia do João'
Telefone/WhatsApp *	Obrigatório. Máscara: (XX) XXXXX-XXXX. Ícone WhatsApp — se marcado, aparece botão direto no perfil.
Site / link externo	Opcional. Validação de URL. Aparece no perfil público.
Descrição *	Obrigatório. Mín 20 / Máx 300 chars. Contador visível. Campo textarea.
CNPJ / CPF	Opcional na Fase 1.0. Campo sombreado com ícone cadeado — 'Protegido, não aparece para clientes'.
Botão Continuar	Habilitado somente com nome, telefone e descrição válidos.

PASSO 2 — Endereço e Localização
Objetivo: confirmar o endereço físico e posicionar o pin no mapa. É aqui que o sistema detecta perfis similares em segundo plano.

Campo endereço *	Autocomplete Google Places API — endereços brasileiros. Debounce 300ms.
Mapa interativo	Google Maps SDK. Pin laranja posicionado no endereço. Usuário pode arrastar para ajustar.
Confirmação do pin	Botão 'Confirmar localização' abaixo do mapa. Dispara a detecção de perfis similares em background.
Horário de funcionamento	Opcional. Picker por dia da semana. 'Aberto 24h' como opção.
Detecção automática	Ao confirmar o pin: sistema busca perfis similares. Ocorre em segundo plano enquanto o usuário ainda vê o mapa.
Modal de match	Se score ≥ 60: exibe modal de alerta ANTES de avançar para o passo 3. Bloqueia o avanço até o comerciante responder.

PASSO 3 — Categoria e Serviços
Objetivo: classificar o negócio para aparecer nas buscas e feeds corretos.

Grid de categorias	12 categorias principais. Seleção única — toque em uma deseleciona as demais.
Subcategoria	Dropdown filtrado pela categoria principal. Ex: Beleza → Barbearia, Salão, Nail art...
Tags de serviço	Chips de texto livres. Usuário digita e adiciona. Ex: 'Corte a tesoura', 'Barba'. Máx 10 tags.
Botão Continuar	Habilitado com categoria e subcategoria selecionadas.

PASSO 4 — Mídia e Identidade Visual
Objetivo: dar uma cara ao negócio dentro do app.

Logo / foto principal	Opcional mas recomendado. Abre modal: câmera ou galeria. Editor de recorte quadrado arredondado.
Galeria de fotos	Até 10 fotos. Grid 3 colunas. Toque no + para adicionar. Toque no X para remover.
Validação de upload	Tipo verificado no servidor (magic bytes). Máx 10MB por foto. EXIF removido automaticamente (SEC-04).
Armazenamento	Bucket privado S3/Firebase Storage. URLs assinadas com expiração (SEC-04).
Botão Continuar	Habilitado mesmo sem foto — mídia é opcional.

PASSO 5 — Confirmação e Boas-vindas
Objetivo: comunicar que o perfil foi criado e levar o comerciante ao app.

Ícone	🏪 — 52px — centralizado
Título	'Negócio cadastrado!' — branco bold 19px
Subtítulo	'[Nome do negócio] já está no Meu Agito. Clientes da sua cidade já podem te encontrar.'
Resumo do perfil	Card com: nome, endereço, categoria, telefone.
CTA	'Ver meu perfil' — laranja — abre T_PERFIL do estabelecimento recém-criado.
Sem botão pular	É a tela final — único caminho é ir ver o perfil.

5. Sistema de Detecção de Perfil Duplicado
Esta seção consolida o documento T05b Regras de Negócio v2, que complementava o T05b original. O conteúdo abaixo substitui e expande a seção de Regras de Negócio do documento original.

Regra crítica de integridade da plataforma: nenhum estabelecimento pode ser reivindicado sem passar pelo processo completo de verificação descrito nesta seção.

5.1 Por que existe
Quando um comerciante conclui o Passo 2 (endereço), o sistema busca perfis importados via Google Places API que possam corresponder ao mesmo estabelecimento. Sem verificação, qualquer pessoa poderia reivindicar o perfil de um concorrente, danificar sua reputação ou se beneficiar de avaliações alheias.

5.2 Score de Correspondência — 4 Critérios
Critério	Peso máx.	Como é calculado
Distância geográfica	35 pts	<50m = 35pts | 50–100m = 25pts | 100–200m = 10pts | >200m = 0pts
Similaridade do nome	35 pts	Idêntico = 35pts | >80% similar = 25pts | 50–79% = 10pts | <50% = 0pts
Mesma categoria	20 pts	Idêntica = 20pts | Categoria relacionada = 10pts | Diferente = 0pts
Telefone correspondente	10 pts	Número idêntico ou com variação de DDD = 10pts | Sem telefone = 0pts

5.3 Classificação por Score
Score	Classificação	Ação do sistema
90–100	Correspondência muito alta	Exibe modal de alerta com nível de certeza alto
70–89	Correspondência alta	Exibe modal de alerta com nível moderado
60–69	Correspondência possível	Exibe modal de alerta com nota de baixa certeza
0–59	Sem correspondência	Cadastro prossegue normalmente — cria perfil novo sem interrupção

5.4 Modal de Alerta — Estrutura
Quando aparece	Após confirmação do pin no Passo 2, antes de avançar para o Passo 3. Bloqueia o avanço.
Ícone de alerta	Escudo com ! — cor laranja #E8640A — centralizado no topo do modal
Título	'Encontramos um perfil parecido com o seu negócio'
Card do perfil	Foto, nome, endereço, categoria, telefone, número de avaliações, badge 'Perfil via Google Maps'
Badge de score	Oculto para o comerciante. Exibe apenas: 'Alta correspondência' ou 'Correspondência possível'
Botão primário	'Sim, esse é o meu negócio' — laranja. Inicia o processo de verificação de titularidade.
Botão secundário	'Não, o meu negócio é diferente' — transparente com borda. Cria perfil novo e independente.
Múltiplos matches	Se score ≥ 60 em mais de um perfil: todos listados em ordem decrescente de score.
Aviso legal obrigatório	'Ao confirmar que esse perfil é o seu negócio, você declara, sob responsabilidade legal, que é o titular ou representante autorizado deste estabelecimento.' — Não pode ser removido ou ocultado.

5.5 Estágios de Verificação de Titularidade
Quando o comerciante confirma que o perfil é dele, o sistema inicia a verificação em 4 estágios:

#	Estágio	Descrição
1	Detecção	Sistema busca perfis similares em background durante o Passo 2. O comerciante não percebe.
2	Apresentação	Se score ≥ 60: modal de alerta exibido antes de avançar. Comerciante confirma ou nega.
3	Verificação	Comerciante passa pelo processo de confirmação de titularidade. Documentos podem ser solicitados.
4	Resolução	Sistema define resultado: reivindicação aprovada, perfil separado criado, ou solicitação em análise pela equipe.

6. Fluxo Completo de Navegação
De onde	Ação	Para onde	Observação
T04	Escolheu conta empresarial	T05b Passo 1	Início do fluxo
Passo 1	Campos obrigatórios + Continuar	Passo 2	Nome + telefone + descrição válidos
Passo 1	← Voltar	T04	Não há passo anterior
Passo 2	Confirma pin no mapa	Modal de match (se score ≥ 60) ou Passo 3	Detecção ocorre em background
Modal match	'Sim, é o meu negócio'	Fluxo de verificação de titularidade → Passo 3	Após verificação aprovada
Modal match	'Não, é diferente'	Passo 3 com novo perfil	Cria perfil independente do existente
Passo 2	← Voltar	Passo 1	Dados do endereço preservados
Passo 3	Categoria + subcategoria + Continuar	Passo 4	Categoria obrigatória
Passo 3	← Voltar	Passo 2	
Passo 4	Continuar (fotos opcionais)	Passo 5	Pode avançar sem foto
Passo 4	← Voltar	Passo 3	
Passo 5	'Ver meu perfil'	T06 Home	Fim do fluxo — perfil ativo

7. Todos os Elementos — Tabela Completa
Tipo	Elemento	Ação/Destino	Passo	Observações
VISUAL	Barra de progresso 5 segmentos	Sem ação	Todos	Laranja=feito.
BOTÃO	← Voltar	Passo anterior	Todos	Dados preservados.
INPUT	Nome do negócio	Sem ação — obrigatório	1	Máx 60 chars.
INPUT	Telefone/WhatsApp	Sem ação — obrigatório	1	Máscara automática.
INPUT	Site	Sem ação — opcional	1	Validação URL.
INPUT	Descrição	Sem ação — obrigatório	1	Mín 20, máx 300 chars.
INPUT	CNPJ/CPF	Sem ação — opcional	1	Campo protegido. Criptografado.
INPUT	Campo endereço	Autocomplete Google Places	2	Apenas endereços BR.
MAPA	Google Maps com pin laranja	Arrastar para ajustar	2	Pin confirma localização.
SISTEMA	Detecção de perfil duplicado	Modal se score ≥ 60	2	Ocorre em background.
MODAL	Modal de match	Sim → verif. | Não → novo perfil	2	Aviso legal obrigatório.
GRID	12 categorias — seleção única	Seleciona categoria	3	Uma por vez.
SELECT	Subcategoria — dropdown	Filtra por categoria	3	Obrigatório.
CHIPS	Tags de serviço livres	Adicionar/remover	3	Máx 10 tags.
UPLOAD	Logo/foto principal	Modal câmera/galeria	4	Opcional. Recorte quadrado.
GRID	Galeria até 10 fotos	Adicionar/remover	4	EXIF removido. Máx 10MB.
VISUAL	Resumo do perfil criado	Sem ação	5	Nome, endereço, cat., tel.
BOTÃO	'Ver meu perfil'	T06 Home	5	CTA final. Laranja.

8. Regras de Negócio
RN-01 — Não pode ser pulado
O cadastro empresarial é obrigatório. Todos os campos marcados com * devem ser preenchidos para avançar. Não existe botão 'Pular'.
RN-02 — Detecção antes do Passo 3
A verificação de perfis similares ocorre em segundo plano ao confirmar o pin no Passo 2. O modal de alerta aparece ANTES de avançar para o Passo 3, nunca depois.
RN-03 — Aviso legal obrigatório no modal
O texto de responsabilidade legal não pode ser removido, ocultado ou alterado sem aprovação formal. O comerciante assume responsabilidade explícita ao confirmar a titularidade.
RN-04 — Score oculto para o comerciante
O score numérico de correspondência (ex: 87 pontos) é visível apenas no modo admin/dev. Para o comerciante, exibe apenas 'Alta correspondência' ou 'Correspondência possível'.
RN-05 — Fotos opcionais no passo 4
O comerciante pode avançar do Passo 4 sem adicionar nenhuma foto. O perfil ficará com imagem genérica da categoria. Fotos podem ser adicionadas depois via Painel do Negócio.
RN-06 — EXIF removido automaticamente
Todas as imagens enviadas têm metadados EXIF removidos no servidor antes de serem armazenadas. Isso protege a localização exata do fotógrafo (SEC-04).
RN-07 — Tela seguinte: T06 Home
Após concluir o Passo 5, o destino é sempre T06 Home. O fluxo NÃO retorna para T05a. Cada tipo de conta tem seu próprio fluxo completo e independente.
RN-08 — CNPJ opcional na Fase 1.0
O campo de CNPJ/CPF é opcional na Fase 1.0. Quando preenchido, é armazenado criptografado e não aparece publicamente no perfil.

Dev: Certificate Pinning obrigatório (SEC-03). Chaves da Google Places API nunca no app (SEC-02). Documentos de verificação em bucket separado com AES-256 (SEC-06).

9. Mockup HTML — Referência Visual
O código abaixo é o mockup de referência visual desta tela. Inclui os 5 passos completos, o modal de detecção de perfil duplicado e o painel do sistema de score de correspondência.

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meu Agito — T05b Cadastro Empresarial</title>
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
    gap: 18px;
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
    width: 270px;
    height: 580px;
    background: #0D0D0D;
    border-radius: 40px;
    border: 6px solid #1e1e1e;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
  }
  .notch {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 88px; height: 22px;
    background: #1e1e1e;
    border-radius: 0 0 14px 14px;
    z-index: 20;
  }
  .screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 38px 16px 88px;

    overflow: hidden;
  }

  /* Progress */
  .progress-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 5px;
  }
  .ps { flex: 1; height: 3px; border-radius: 2px; background: #222; }
  .ps.done   { background: #E8640A; }
  .ps.active { background: rgba(232,100,10,0.5); }

  .step-label { font-size: 10px; color: #444; margin-bottom: 14px; }
  .step-label span { color: #E8640A; }
  .step-title { font-size: 17px; font-weight: 900; color: white; margin-bottom: 4px; line-height: 1.25; }
  .step-sub   { font-size: 11px; color: #555; margin-bottom: 14px; line-height: 1.5; }

  /* Input */
  .input-group { margin-bottom: 10px; }
  .input-label { font-size: 9px; color: #555; margin-bottom: 3px; font-weight: 700; letter-spacing: 0.5px; }
  .input-field {
    width: 100%; height: 40px;
    background: #1a1a1a;

    border: 1px solid #2a2a2a;
    border-radius: 11px;
    padding: 0 10px;
    font-size: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .input-field.active { border-color: #E8640A; }
  .input-ph { color: #333; font-size: 11px; }
  .input-txt { color: white; font-size: 11px; }
  .input-icon { font-size: 12px; color: #555; }
  .char-count { font-size: 9px; color: #333; text-align: right; margin-top: 2px; }

  .textarea-field {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 11px;
    padding: 10px;
    font-size: 11px;
    color: #888;
    min-height: 60px;
  }

  /* Map pin area */
  .map-area {
    width: 100%;
    height: 120px;
    background: #111;
    border-radius: 12px;
    border: 1px solid #2a2a2a;

    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #444;
    position: relative;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .map-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(#1a1a1a 1px, transparent 1px),
      linear-gradient(90deg, #1a1a1a 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .map-pin {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -60%);
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(232,100,10,0.5));
    z-index: 2;
  }
  .map-label {
    position: absolute;
    bottom: 8px; left: 0; right: 0;
    text-align: center;
    font-size: 10px;
    color: #666;
    z-index: 2;
  }

  /* Category chips */
  .cat-grid { display: flex; flex-wrap: wrap; gap: 5px; }

  .cat-chip {
    padding: 5px 9px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    font-size: 10px;
    color: #666;
    cursor: pointer;
  }
  .cat-chip.sel {
    background: rgba(232,100,10,0.12);
    border-color: #E8640A;
    color: #E8640A;
  }

  /* Image uploader grid */
  .img-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
  .img-slot {
    aspect-ratio: 1;
    background: #1a1a1a;
    border-radius: 10px;
    border: 1px dashed #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    position: relative;
  }
  .img-slot.filled { border-style: solid; border-color: #2a2a2a; }
  .img-slot .img-del {
    position: absolute;
    top: -4px; right: -4px;
    width: 16px; height: 16px;

    background: #e74c3c;
    border-radius: 50%;
    font-size: 9px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Match alert modal */
  .match-modal {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 30;
  }
  .match-card {
    background: #1a1a1a;
    border: 1.5px solid #E8640A;
    border-radius: 16px;
    padding: 16px;
    width: 100%;
  }
  .match-icon { text-align: center; font-size: 28px; margin-bottom: 8px; }
  .match-title { font-size: 13px; font-weight: 700; color: white; text-align: center; margin-bottom: 4px; }
  .match-sub { font-size: 10px; color: #666; text-align: center; margin-bottom: 12px; line-height: 1.5; }

  .match-place {
    background: #111;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .match-place-icon { font-size: 22px; }
  .match-place-info { flex: 1; }
  .match-place-name { font-size: 11px; font-weight: 700; color: white; }
  .match-place-sub  { font-size: 9px; color: #555; margin-top: 2px; }
  .match-place-badge { font-size: 8px; color: #888; background: #222; border-radius: 4px; padding: 2px 6px; margin-top: 3px; display: inline-block; }
  .match-btn-yes {
    width: 100%; height: 36px;
    background: #E8640A; border: none; border-radius: 10px;
    color: white; font-size: 12px; font-weight: 700;
    font-family: Arial, sans-serif; cursor: pointer; margin-bottom: 6px;
  }
  .match-btn-no {
    width: 100%; height: 36px;

    background: transparent; border: 1px solid #333; border-radius: 10px;
    color: #888; font-size: 11px;
    font-family: Arial, sans-serif; cursor: pointer;
  }
  .match-warning {
    font-size: 9px;
    color: #444;
    text-align: center;
    margin-top: 8px;
    line-height: 1.5;
  }

  /* Confirmation screen */
  .confirm-screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
  }

  /* Footer */
  .footer-cta {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 10px 16px 22px;
    background: linear-gradient(to top, #0D0D0D 75%, transparent);
  }
  .btn-next {
    width: 100%; height: 42px;
    background: #E8640A; border: none; border-radius: 12px;

    color: white; font-size: 13px; font-weight: 700;
    font-family: Arial, sans-serif; cursor: pointer;
  }
  .btn-next.disabled { background: #1e1e1e; color: #3a3a3a; }

  /* Info section */
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
  .score-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }
  .score-card {
    background: #1a1a1a;
    border-radius: 10px;
    padding: 12px;
    border: 1px solid #2a2a2a;
    text-align: center;
  }
  .score-val { font-size: 22px; font-weight: 900; color: #E8640A; }

  .score-label { font-size: 10px; color: #555; margin-top: 4px; }
  .score-desc  { font-size: 9px;  color: #333; margin-top: 3px; line-height: 1.4; }
</style>
</head>
<body>

  <div class="page-title">T05b — Cadastro Empresarial</div>
  <div class="page-sub">5 passos · Cria a vitrine do negócio · Inclui detecção de perfil duplicado (API)</div>

  <div class="phones-row">

    <!-- Passo 1: Informações básicas -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 1 — Informações</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="ps active"></div>
            <div class="ps"></div><div class="ps"></div><div class="ps"></div><div class="ps"></div>
          </div>
          <div class="step-label">Passo <span>1</span> de 5</div>

          <div class="step-title">Informações do negócio</div>
          <div class="step-sub">Dados básicos do seu estabelecimento.</div>

          <div class="input-group">
            <div class="input-label">NOME DO NEGÓCIO *</div>
            <div class="input-field active"><span class="input-txt">Barbearia do João</span><span style="font-size:9px; color:#555;">12/60</span></div>
          </div>
          <div class="input-group">
            <div class="input-label">TELEFONE / WHATSAPP *</div>
            <div class="input-field"><span class="input-txt">(11) 98765-4321</span><span class="input-icon">💬</span></div>
          </div>
          <div class="input-group">
            <div class="input-label">SITE <span style="color:#333; font-size:9px;">OPCIONAL</span></div>
            <div class="input-field"><span class="input-ph">www.seunegocio.com.br</span></div>

          </div>
          <div class="input-group">
            <div class="input-label">DESCRIÇÃO *</div>
            <div class="textarea-field">Barbearia especializada em cortes modernos e barba. Atendemos com hora marcada.</div>
            <div class="char-count">89 / 300</div>
          </div>
        </div>
        <div class="footer-cta"><button class="btn-next">Próximo</button></div>
      </div>
    </div>

    <!-- Passo 2: Endereço + detecção de match -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 2 — Endereço</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="ps done"></div><div class="ps active"></div>
            <div class="ps"></div><div class="ps"></div><div class="ps"></div>

          </div>
          <div class="step-label">Passo <span>2</span> de 5</div>
          <div class="step-title">Onde fica seu negócio?</div>
          <div class="step-sub">Confirme o pin no mapa.</div>

          <div class="input-group">
            <div class="input-label">ENDEREÇO *</div>
            <div class="input-field active"><span class="input-txt">Rua das Flores, 123 — SP</span></div>
          </div>
          <div class="map-area">
            <div class="map-grid"></div>
            <div class="map-pin">📍</div>
            <div class="map-label">Arraste para ajustar a posição</div>
          </div>

          <!-- Match alert -->
          <div class="match-modal">
            <div class="match-card">
              <div class="match-icon">🛡️</div>
              <div class="match-title">Encontramos um perfil parecido</div>

              <div class="match-sub">Antes de continuar, confirme se esse perfil é o seu negócio.</div>
              <div class="match-place">
                <div class="match-place-icon">✂️</div>
                <div class="match-place-info">
                  <div class="match-place-name">Barbearia do João</div>
                  <div class="match-place-sub">Rua das Flores, 123 · Beleza</div>
                  <div class="match-place-badge">Perfil via Google Maps</div>
                </div>
              </div>
              <button class="match-btn-yes">Sim, esse é o meu negócio</button>
              <button class="match-btn-no">Não, o meu é diferente</button>
              <div class="match-warning">Ao confirmar, você assume responsabilidade legal pela titularidade deste perfil.</div>

            </div>
          </div>
        </div>
        <div class="footer-cta"><button class="btn-next disabled">Próximo</button></div>
      </div>
    </div>

    <!-- Passo 3: Categoria -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 3 — Categoria</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="ps done"></div><div class="ps done"></div><div class="ps active"></div>
            <div class="ps"></div><div class="ps"></div>
          </div>
          <div class="step-label">Passo <span>3</span> de 5</div>
          <div class="step-title">Qual é o seu negócio?</div>
          <div class="step-sub">Escolha a categoria principal.</div>

          <div class="cat-grid">

            <div class="cat-chip sel">✂️ Beleza</div>
            <div class="cat-chip">🍽️ Gastronomia</div>
            <div class="cat-chip">🏥 Saúde</div>
            <div class="cat-chip">🏨 Hospedagem</div>
            <div class="cat-chip">💪 Fitness</div>
            <div class="cat-chip">🐾 Pet</div>
            <div class="cat-chip">🚗 Automotivo</div>
            <div class="cat-chip">🛍️ Comércio</div>
            <div class="cat-chip">📚 Educação</div>
            <div class="cat-chip">🎨 Arte</div>
            <div class="cat-chip">✈️ Turismo</div>
            <div class="cat-chip">🔧 Serviços</div>
          </div>

          <div style="margin-top:10px;">
            <div class="input-label" style="margin-bottom:5px;">SUBCATEGORIA</div>
            <div class="input-field active"><span class="input-txt">Barbearia</span><span class="input-icon">▾</span></div>

          </div>
        </div>
        <div class="footer-cta"><button class="btn-next">Próximo</button></div>
      </div>
    </div>

    <!-- Passo 4: Mídia -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 4 — Mídia</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="progress-bar">
            <div class="ps done"></div><div class="ps done"></div><div class="ps done"></div>
            <div class="ps active"></div><div class="ps"></div>
          </div>
          <div class="step-label">Passo <span>4</span> de 5</div>
          <div class="step-title">Mostre seu negócio</div>
          <div class="step-sub">Fotos do espaço, produtos ou serviços.</div>

          <div class="input-group">
            <div class="input-label">LOGO / FOTO PRINCIPAL</div>

            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
              <div style="width:56px; height:56px; border-radius:14px; background:#1a1a1a; border:1.5px solid #E8640A; display:flex; align-items:center; justify-content:center; font-size:26px;">✂️</div>
              <div style="font-size:10px; color:#555; line-height:1.6;">Toque para adicionar<br>logo ou foto de capa.<br><span style="color:#E8640A;">Opcional mas recomendado</span></div>
            </div>
          </div>

          <div class="input-label" style="margin-bottom:6px;">GALERIA <span style="color:#333; font-size:9px;">ATÉ 10 FOTOS</span></div>
          <div class="img-grid">
            <div class="img-slot filled">🪑<div class="img-del">✕</div></div>
            <div class="img-slot filled">💈<div class="img-del">✕</div></div>

            <div class="img-slot">➕</div>
          </div>

          <div style="font-size:9px; color:#333; line-height:1.5;">Fotos são verificadas automaticamente. Máx 10MB cada. EXIF removido automaticamente.</div>
        </div>
        <div class="footer-cta"><button class="btn-next">Próximo</button></div>
      </div>
    </div>

    <!-- Passo 5: Confirmação -->
    <div class="phone-wrap">
      <div class="phone-label">Passo 5 — Pronto!</div>
      <div class="phone">
        <div class="notch"></div>
        <div class="confirm-screen">
          <div class="progress-bar" style="width:100%; margin-bottom:20px;">
            <div class="ps done"></div><div class="ps done"></div>
            <div class="ps done"></div><div class="ps done"></div><div class="ps done"></div>
          </div>

          <div style="font-size:52px; margin-bottom:16px;">🏪</div>
          <div style="font-size:19px; font-weight:900; color:white; margin-bottom:8px;">Negócio cadastrado!</div>
          <div style="font-size:11px; color:#555; line-height:1.6; max-width:220px; text-align:center; margin-bottom:20px;">
            A Barbearia do João já está no Meu Agito. Clientes da sua cidade já podem te encontrar.
          </div>
          <div style="background:#1a1a1a; border-radius:12px; padding:12px 14px; width:100%; text-align:left; border:1px solid #2a2a2a; margin-bottom:16px;">
            <div style="font-size:9px; color:#555; margin-bottom:6px;">SEU PERFIL</div>
            <div style="font-size:11px; color:#888; line-height:1.8;">
              🏪 Barbearia do João<br>
              📍 Rua das Flores, 123 · SP<br>

              ✂️ Beleza · Barbearia<br>
              📱 (11) 98765-4321
            </div>
          </div>
        </div>
        <div class="footer-cta"><button class="btn-next">Ver meu perfil</button></div>
      </div>
    </div>

  </div>

  <!-- Score de correspondência -->
  <div class="info-section">
    <div class="info-title">Sistema de Detecção de Perfil Duplicado (API) — Score de Correspondência</div>
    <div class="score-grid">
      <div class="score-card">
        <div class="score-val">35</div>
        <div class="score-label">Distância</div>
        <div class="score-desc">&lt;50m = 35pts<br>50-100m = 25pts<br>&gt;200m = 0pts</div>
      </div>
      <div class="score-card">
        <div class="score-val">35</div>
        <div class="score-label">Nome</div>
        <div class="score-desc">Idêntico = 35pts<br>&gt;80% similar = 25pts<br>&lt;50% = 0pts</div>

      </div>
      <div class="score-card">
        <div class="score-val">20</div>
        <div class="score-label">Categoria</div>
        <div class="score-desc">Idêntica = 20pts<br>Relacionada = 10pts<br>Diferente = 0pts</div>
      </div>
      <div class="score-card">
        <div class="score-val">10</div>
        <div class="score-label">Telefone</div>
        <div class="score-desc">Idêntico/DDD var = 10pts<br>Sem telefone = 0pts</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:16px;">
      <div style="background:#1a1a1a; border-radius:10px; padding:12px; border:1px solid #E8640A44; text-align:center;">
        <div style="color:#E8640A; font-size:14px; font-weight:700;">90–100</div>
        <div style="color:#888; font-size:10px; margin-top:4px;">Correspondência muito alta</div>

        <div style="color:#555; font-size:9px; margin-top:3px;">Exibe alerta de alto nível</div>
      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:12px; border:1px solid #2a2a2a; text-align:center;">
        <div style="color:#f39c12; font-size:14px; font-weight:700;">70–89</div>
        <div style="color:#888; font-size:10px; margin-top:4px;">Correspondência alta</div>
        <div style="color:#555; font-size:9px; margin-top:3px;">Alerta nível moderado</div>
      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:12px; border:1px solid #2a2a2a; text-align:center;">
        <div style="color:#888; font-size:14px; font-weight:700;">60–69</div>
        <div style="color:#888; font-size:10px; margin-top:4px;">Correspondência possível</div>
        <div style="color:#555; font-size:9px; margin-top:3px;">Alerta de baixa certeza</div>

      </div>
      <div style="background:#1a1a1a; border-radius:10px; padding:12px; border:1px solid #2a2a2a; text-align:center;">
        <div style="color:#555; font-size:14px; font-weight:700;">0–59</div>
        <div style="color:#888; font-size:10px; margin-top:4px;">Sem correspondência</div>
        <div style="color:#555; font-size:9px; margin-top:3px;">Cria perfil novo direto</div>
      </div>
    </div>

    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">5 passos — não pode ser pulado</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Detecção ocorre no passo 2 — segundo plano</div>

      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">CNPJ opcional na Fase 1.0</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">EXIF removido das fotos (SEC-04)</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Coordenadas GPS tratadas no backend</div>
      <div style="background:#1a1a1a; border:1px solid #E8640A44; border-radius:20px; padding:6px 12px; font-size:10px; color:#E8640A;">Aviso legal obrigatório no modal de match</div>
      <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:6px 12px; font-size:10px; color:#555;">Após passo 5 → T06 Home</div>

    </div>
  </div>

</body>
</html>

