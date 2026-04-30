# Guia de Documentacao

Data de referencia: 2026-04-23

## 1. Objetivo
Definir como a documentacao deve ser lida, mantida e evoluida no projeto.

## 2. Convencao de nomes
- Prefixo numerico para ordem (`01_`, `02_`, ...).
- Nome em maiusculo com underscore.
- Sem espacos em branco no nome final.
- Rastreabilidade de migracao em `03_MAPA_RENOMEACOES_2026-04-21.md`.

## 3. Fonte de verdade por tipo
- Produto: `01_PRODUTO/`
- UX/Fluxos: `02_UX_FLUXOS/`
- Arquitetura/Stack: `03_ARQUITETURA_E_ESTRATEGIA/`
- Backend/API: `04_BACKEND/`
- Realtime: `05_REALTIME_SOCKET/`
- Legal/Privacidade: `06_LEGAL/`
- Historico: `99_HISTORICO/`

## 4. Regras de manutencao
- Nao criar novos arquivos de status por sprint fora de `99_HISTORICO/`.
- Atualizar documentos canonicos existentes antes de abrir novo documento.
- Toda mudanca de arquitetura deve atualizar, no minimo:
  - `03_ARQUITETURA_E_ESTRATEGIA/01_TECHNICAL_BLUEPRINT.md`
  - `03_ARQUITETURA_E_ESTRATEGIA/02_TECNOLOGIAS_PROJETO.md`
  - `04_BACKEND/01_REFERENCIA_API_BACKEND.md` (quando houver impacto em API)
- Toda mudanca de fluxo/tela deve atualizar o arquivo correspondente em `02_UX_FLUXOS/`.
- Toda mudanca de coleta, compartilhamento, retencao ou exclusao de dados deve atualizar `06_LEGAL/`.

## 5. Criterio de validade
- `Canonico`: representa estado/decisao atual e deve ser mantido atualizado.
- `Referencia parcial`: util, mas exige confirmacao com codigo atual.
- `Historico`: snapshot antigo, sem valor normativo para implementacao atual.

## 6. Controle de estado
- Arquivo de estado atual deve ficar em `00_GOVERNANCA/01_ESTADO_ATUAL_<data>.md`.
- Quando houver novo snapshot de estado, o anterior deve ser movido para `99_HISTORICO/`.
- A classificacao completa dos documentos deve ser atualizada em `00_GOVERNANCA/04_MATRIZ_VALIDADE_DOCUMENTOS_2026-04-23.md`.

## 7. Anti padrao proibido
- Duplicar resumo executivo em varios arquivos.
- Declarar "100% pronto" sem validacao tecnica.
- Manter documento ativo fora da pasta correta.
