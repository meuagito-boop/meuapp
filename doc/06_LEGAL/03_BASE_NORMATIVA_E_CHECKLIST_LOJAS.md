# Base Normativa e Checklist de Lojas

Data: 2026-04-23

## 1. Fontes oficiais usadas

### Brasil (privacidade)

- LGPD (Lei no 13.709/2018):
  `https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm`
- Guia da ANPD sobre direitos dos titulares:
  `https://www.gov.br/anpd/pt-br/assuntos/seu-dado/seus-direitos`

### Google Play

- User Data Policy (Play Console Help):
  `https://support.google.com/googleplay/android-developer/answer/10144311`
- Data safety section (Play Console Help):
  `https://support.google.com/googleplay/android-developer/answer/10787469`
- Account deletion requirement (Play Console Help):
  `https://support.google.com/googleplay/android-developer/answer/13327111`

### Apple App Store

- App Store Review Guidelines (secao 5.1 Privacy):
  `https://developer.apple.com/app-store/review/guidelines/`

## 2. Requisitos essenciais para publicacao

### Privacidade (obrigatorio)

- Ter Politica de Privacidade acessivel por URL publica;
- Explicar coleta, uso, compartilhamento, retencao e exclusao de dados;
- Informar canal para exercicio de direitos do titular.

### Google Play

- Declarar corretamente coleta/compartilhamento na Data safety form;
- Manter politica coerente com o comportamento real do app;
- Se o app permite criar conta, deve oferecer solicitacao de exclusao de conta no app e via web.

### Apple

- Informar praticas de privacidade de forma clara e precisa;
- Disponibilizar URL de politica de privacidade;
- Coleta de dados deve ser proporcional e justificada para o recurso.

## 3. Status atual do Meu Agito (2026-04-23)

### Ja implementado

- Documentos canonicos em `doc/06_LEGAL`;
- Endpoints publicos no backend:
  - `/legal/privacy-policy`
  - `/legal/terms-of-use`
  - variantes `.json`;
- Links de Termos/Privacidade ligados no frontend para abrir os documentos publicos.

### Pendente antes de release em loja

- Definir dados formais do controlador (razao social, CNPJ, endereco oficial);
- Publicar os mesmos documentos em dominio publico estavel (HTTPS publico, nao localhost);
- Garantir fluxo final de exclusao de conta totalmente funcional e coerente com o texto legal;
- Revisao juridica final dos textos antes de submissao.

## 4. Regra de manutencao

Qualquer mudanca em coleta, uso, compartilhamento, integracao externa, retencao ou exclusao de dados exige:

1. atualizar `01_POLITICA_DE_PRIVACIDADE.md`;
2. revisar `02_TERMOS_DE_USO.md` se houver impacto contratual;
3. validar coerencia entre codigo, formularios de loja e textos legais.
