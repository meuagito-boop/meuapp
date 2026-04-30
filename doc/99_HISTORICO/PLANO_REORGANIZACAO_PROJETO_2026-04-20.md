# Plano De Reorganizacao Do Projeto (2026-04-20)

## 1. Objetivo
Retomar o foco do projeto com fluxo previsivel:
- preservar o trabalho recente;
- reduzir ruido de configuracoes paralelas;
- validar backend e frontend por checkpoints curtos e rastreaveis.

## 2. Premissas
- O backend esta praticamente pronto e nao deve ser interrompido por ajustes de ambiente.
- O frontend deve voltar a um fluxo simples de execucao e validacao.
- Mudancas experimentais de web/emulador/celular devem ser recuperadas apenas quando agregarem valor claro.

## 3. Estado De Seguranca Ja Aplicado
1. Snapshot de diff local salvo em:
`./.codex/recovery/20260420-233148`
2. Branch de resgate criada:
`rescue/pre-reorg-20260420-233204`
3. Estado completo salvo em stash:
- `stash@{0}` -> `pre-reorg-leftovers-20260420-233250`
- `stash@{1}` -> `pre-reorg-20260420-233204`

## 4. Estrategia De Trabalho
### 4.1 Branches
1. `chore/reorganizacao-baseline` (atual): baseline limpa e plano.
2. `feat/backend-stabilization`: ajustes de backend.
3. `feat/frontend-stabilization`: ajustes de frontend.
4. `chore/docs-and-scripts-cleanup`: documentacao e scripts auxiliares.

### 4.2 Regra De Integracao
1. Um tema por branch.
2. Commits pequenos e descritivos.
3. Nao misturar mudanca de ambiente com mudanca de regra de negocio.

## 5. Fases De Execucao
### Fase 1: Baseline Limpa (concluida)
1. Encerrar processos de dev abertos.
2. Congelar estado atual com branch de resgate + stash.
3. Comecar reorganizacao em branch dedicada.

### Fase 2: Triagem Do Que Vale Recuperar
1. Listar mudancas por dominio (backend, frontend, docs, scripts).
2. Classificar cada bloco como:
- manter agora;
- adiar;
- descartar.
3. Reaplicar seletivamente do stash (arquivo a arquivo, nao em massa).

### Fase 3: Estabilizacao Backend
1. Subir infraestrutura minima (postgres/redis).
2. Rodar:
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run test:e2e` (quando ambiente pronto)
3. Corrigir somente regressao que bloqueia entrega.

### Fase 4: Estabilizacao Frontend
1. Definir fluxo oficial (prioridade: Android dev-client; Web apenas apoio).
2. Rodar checks:
- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
3. Validar navegacao principal sem alterar arquitetura fora do necessario.

### Fase 5: Consolidacao
1. Atualizar README com comando unico por fluxo.
2. Remover scripts/configuracoes duplicadas ou obsoletas.
3. Fechar checklist de release interno.

## 6. Checkpoints De Aceite
1. Backend sobe localmente e responde `GET /health`.
2. Testes essenciais do backend passam.
3. Frontend abre e navega fluxo principal sem crash.
4. Fluxo Android dev-client conecta no backend local/tunnel com procedimento documentado.

## 7. Ordem Imediata De Execucao
1. Triagem das mudancas salvas no stash por modulo.
2. Recuperar primeiro o que impacta backend.
3. Recuperar depois o minimo necessario de frontend para validacao funcional.
4. Postergar ajustes cosmeticos e documentos nao criticos.

## 8. Comandos Uteis De Recuperacao
### Ver conteudo do stash
`git stash show --name-only stash@{1}`

### Restaurar arquivo especifico do stash
`git checkout stash@{1} -- caminho/do/arquivo`

### Aplicar stash inteiro (somente quando decidido)
`git stash apply stash@{1}`
