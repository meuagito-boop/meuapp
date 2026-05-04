# Plano de Correcao para Producao - Meu Agito

Data da auditoria base: 2026-04-30

Este documento e o artefato vivo para consolidar auditorias, prompts futuros e plano de correcao ate o Meu Agito ficar pronto para deploy real.

## 1. Objetivo

Registrar, com evidencia no codigo e na documentacao, tudo que ainda impede o Meu Agito de ser considerado pronto para producao.

Este documento deve ser atualizado a cada novo prompt/analise, sem apagar o historico anterior, para manter uma sequencia clara de decisao e execucao.

## 2. Escopo da auditoria base

Fontes verificadas nesta rodada:

- `README.md`
- `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md`
- `doc/00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md`
- frontend em `frontend/src/screens`, `frontend/src/services` e `frontend/app.json`
- backend em `backend/src/modules`, `backend/.env.example`, `docker-compose.yml`

Foco da auditoria:

- paginas nao criadas ou parciais
- paginas criadas mas nao conectadas
- links, botoes e rotas
- services e endpoints
- mocks, dados fake e placeholders
- fluxos parciais
- configuracoes incompletas
- AWS, banco, Redis, SES, SNS, S3 e CloudFront
- smoke mobile pendente

## 3. Resumo executivo

O projeto tem core tecnico relevante implementado, mas ainda nao esta pronto para deploy publico real.

Evidencia principal:

- `README.md:615` declara que o projeto ainda nao deve ser marcado como pronto para deploy publico real.
- `README.md:619-625` lista pendencias de observabilidade AWS, AWS ponta a ponta, migrations no banco alvo, SES real, SNS/APNs/FCM real, Redis externo e smoke mobile.
- `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md:61-70` confirma que observabilidade AWS, deploy AWS e validacao mobile manual seguem pendentes.
- `doc/00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md:62-70` mantem itens abertos para AWS real, migrations, SES, SNS/APNs/FCM e readiness de deploy.

Resultado da auditoria estatica:

- Nao foi encontrado, por leitura estatica, um `navigation.navigate`/`navigation.push` para rota estatica inexistente.
- Nao foi encontrado, por leitura estatica dos services principais, um service chamando endpoint backend inexistente.
- Os maiores bloqueios estao em telas parciais, dados fake, botoes sem acao, fluxos sem contrato backend e ambiente real de producao ainda nao validado.

## 4. Bloqueadores de producao

### B1 - AWS real ainda nao esta fechado

Evidencias:

- `README.md:619-625`
- `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md:61-70`
- `doc/00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md:62-70`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md:19-20`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md:65-67`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md:109`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md:132-135`
- `doc/aws doc/AWS_DEPLOY_CHECKLIST.md:233`

Impacto:

- Sem AWS real validado, nao ha prova de deploy, observabilidade, rede, secrets, banco alvo, Redis privado, SES, SNS ou smoke mobile em ambiente final.

Correcao:

- Fechar checklist AWS com conta/profile validado, recursos criados, secrets protegidos, migrations aplicadas e smoke real executado.

### B2 - Providers de producao ainda aparecem desligados ou vazios nas configs locais

Evidencias:

- `backend/.env.example:41` usa `STORAGE_PROVIDER="none"`.
- `backend/.env.example:57-58` mantem CloudFront desabilitado/vazio.
- `backend/.env.example:62-75` mantem SES/SNS desligados ou vazios.
- `docker-compose.yml:79-82` usa `STORAGE_PROVIDER: none`, `ENABLE_EMAIL: "false"` e `PUSH_PROVIDER: none`.
- `backend/src/config/env.validation.ts:96-118` valida SES somente se email estiver habilitado ou `EMAIL_PROVIDER=ses`.
- `backend/src/config/env.validation.ts:120-151` valida S3/CloudFront somente se `STORAGE_PROVIDER=s3`.
- `backend/src/config/env.validation.ts:153-160` valida SNS somente se `PUSH_PROVIDER=sns`.
- `backend/src/modules/media/storage.service.ts:92-101` transforma provider diferente de `s3` em storage local.
- `backend/src/common/email/email.service.ts:51-55` desabilita e-mail quando provider nao e `ses`.
- `backend/src/common/notification/notification.service.ts:48-52` desabilita push quando provider nao e `sns`.

Impacto:

- O ambiente local nao prova comportamento real de S3, CloudFront, SES ou SNS.
- O ambiente de producao tambem pode iniciar sem S3, SES ou SNS se as variaveis forem deixadas como `none`, mesmo que o objetivo seja app 100% real.

Correcao:

- Criar e validar env de producao separado, com S3, CloudFront, SES, SNS, Redis externo e banco alvo reais.
- Se o criterio for "100% real", endurecer `env.validation.ts` para exigir `STORAGE_PROVIDER=s3`, `EMAIL_PROVIDER=ses` e `PUSH_PROVIDER=sns` em `NODE_ENV=production`.
- Status atualizado em 2026-05-02: a parte de codigo da validacao foi RESOLVIDA pela EXECUCAO-021. `backend/src/config/env.validation.ts` agora bloqueia `NODE_ENV=production` sem Redis, `STORAGE_PROVIDER=s3`, CloudFront ligado com URL, `EMAIL_PROVIDER=ses`, `PUSH_PROVIDER=sns` e ARN SNS generico ou Android. Ainda pendem ambiente staging/producao real, secrets AWS reais e smoke ponta a ponta.

### B3 - Settings tem varias telas parciais, fake ou apenas locais

Evidencias:

- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:40-47` usa dados fixos de conta.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:53` simula carregamento com `setTimeout`.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:63-66` tem botoes de camera/galeria com `onPress: () => {}`.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:75-77` simula salvar perfil.
- Status atualizado em 2026-05-01: os quatro achados acima de `SettingsMyAccountScreen` foram RESOLVIDOS no codigo local pela EXECUCAO-004. A tela agora carrega `userStore.getProfile()`, salva dados de conta via `PUT /users/me`, salva bio via `PUT /users/me/profile` e envia avatar por `POST /users/me/avatar`. Pendencias remanescentes: smoke mobile/staging, S3/CloudFront real para avatar e fluxo final de verificacao de e-mail se o e-mail for alterado.
- `frontend/src/screens/main/SettingsCityScreen.tsx:22-29` usa cidades fixas e historico local.
- `frontend/src/screens/main/SettingsCityScreen.tsx:44-52` confirma cidade apenas em estado local.
- Status atualizado em 2026-05-02: os achados acima de `SettingsCityScreen` foram RESOLVIDOS no codigo local pela EXECUCAO-010. A tela agora carrega o perfil real, usa `GeolocationService.getCurrentLocation()` + reverse geocode sem cidade fixa, permite cidade manual e salva `location` por `PUT /users/me/profile` antes de voltar. Pendencias remanescentes: smoke mobile/staging, permissao de localizacao em dispositivo real e validar impacto da cidade salva nos fluxos de descoberta.
- `frontend/src/screens/main/SettingsScreen.tsx:88-93` alterna GPS somente em estado local.
- `frontend/src/screens/main/SettingsScreen.tsx:149-163` desativa conta apenas com alerta local.
- Status atualizado em 2026-05-02: os achados acima de `SettingsScreen` foram RESOLVIDOS no codigo local pela EXECUCAO-013 para o caminho visivel. O toggle de GPS local-only, a entrada `Desativar Conta`, `Raio de Busca`, `Notificacoes` de preferencias e `Idioma` foram removidos do menu principal ate existirem contratos reais. A exclusao de conta real permanece via `SettingsDeleteAccount`.
- `frontend/src/screens/main/SettingsPrivacyScreen.tsx:31-34` tem comentario `Load privacy settings` sem implementacao.
- Status atualizado em 2026-05-02: os achados de `SettingsPrivacyScreen` foram RESOLVIDOS no codigo local pela EXECUCAO-012 para o caminho de producao. Como nao existe model/endpoint/service de privacidade ou bloqueios no backend atual, a entrada `Privacidade` foi ocultada do menu principal de Settings, a tela deixou de exibir switches/radios locais e `SettingsBlockedUsersScreen` deixou de parecer lista real vazia. Reexibir privacidade/bloqueios exige backend real ou decisao formal de escopo.
- `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29` tem comentario `Load security settings` sem implementacao.
- `frontend/src/screens/main/SettingsAuxScreens.tsx:102-126` mostra contas vinculadas e raio de busca estaticos.
- Status atualizado em 2026-05-02: os achados de contas vinculadas, raio, preferencias de notificacao e idioma foram RESOLVIDOS parcialmente no codigo local pela EXECUCAO-013. Essas entradas nao aparecem no menu principal, e as telas auxiliares registradas nao exibem mais Google/Apple, valores de raio, switches fixos ou idiomas fixos caso sejam abertas indiretamente.
- `frontend/src/screens/main/SettingsAuxScreens.tsx:200-210` mostra trocar senha como scaffold, sem formulario real.
- `frontend/src/screens/main/SettingsAuxScreens.tsx:375-398` mostra dispositivos e historico de acesso fake.
- Status atualizado em 2026-05-02: os achados de seguranca acima foram parcialmente RESOLVIDOS no codigo local pela EXECUCAO-011. `SettingsChangePasswordScreen` agora usa formulario real e `POST /auth/change-password`; `SettingsSecurityScreen` removeu comentario vazio/mojibake e nao lista mais dispositivos/historico sem backend; `SettingsDevicesScreen` e `SettingsAccessHistoryScreen` nao exibem mais Windows/Android/cidades/horarios inventados caso sejam acessadas indiretamente. Pendencias remanescentes de Settings: privacidade, contas vinculadas, raio, preferencias de notificacao, idioma, bloqueados e estrategia final de sessoes/audit log se voltarem ao escopo.

Impacto:

- Usuario consegue interagir com configuracoes que nao persistem ou nao executam acao real.

Correcao:

- Conectar cada tela a contrato backend real ou remover/esconder do build de producao.

### B4 - Onboarding pessoal nao persiste perfil

Evidencias:

- `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-79` simula disponibilidade de username com `setTimeout` e `includes('taken')`.
- `frontend/src/screens/auth/PersonalSetupScreen.tsx:81-87` finaliza chamando apenas `completeOnboarding()`.
- Status atualizado em 2026-05-01: os achados acima foram RESOLVIDOS no codigo local pela EXECUCAO-009. `PersonalSetupScreen` passou a consultar disponibilidade real via `GET /users/username/availability`, enviar avatar por `POST /users/me/avatar`, obter localizacao real via `GeolocationService`, persistir username por `PUT /users/me` e bio/cidade por `PUT /users/me/profile` antes de chamar `completeOnboarding()`. A etapa de interesses foi retirada do release atual porque nao existe model/endpoint canonico de preferencias/interesses no backend atual. Pendencias remanescentes: smoke mobile/staging, S3/CloudFront real para avatar e permissao de localizacao em dispositivo real.

Impacto:

- Historico anterior: dados de perfil pessoal, username, cidade e interesses nao ficavam garantidos no backend.
- Estado atual no codigo local: username, bio, cidade/localizacao e avatar ficam conectados a services reais; interesses nao sao exibidos ate existir contrato backend oficial.

Correcao:

- RESOLVIDO no codigo local para username, bio, cidade/localizacao e avatar pela EXECUCAO-009.
- Manter interesses fora da UI de producao ate existir model/migration/DTO/controller/service real ou decisao formal de produto.

### B5 - Activity, Favoritos e Historico existem, mas nao estao completos

Evidencias:

- `frontend/src/screens/main/ActivityScreen.tsx:40-54` marca cards como `coming_soon`.
- `frontend/src/screens/main/ActivityScreen.tsx:70-71` mostra alerta `Em breve`.
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx:27-31` declara que favoritos ainda nao estao sincronizados.
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx:43-46` declara falta de endpoint dedicado ou estrategia oficial.
- `frontend/src/screens/main/ActivityHistoryScreen.tsx:27-31` declara que historico consolidado ainda nao existe no backend.
- `frontend/src/screens/main/ActivityHistoryScreen.tsx:36-39` declara falta de endpoint canonico.
- Status atualizado em 2026-05-02: os achados acima foram RESOLVIDOS no codigo local pela EXECUCAO-014 para o caminho visivel. `ActivityScreen` nao possui mais cards `coming_soon`, alerta `Em breve`, pedidos/agendamentos/reservas, nem textos de auditoria no app. `ActivityFavoritesScreen` e `ActivityHistoryScreen` foram reduzidas a estados vazios simples, sem dados locais, sem explicacao de backend e sem simular lista real.

Impacto:

- Telas existem, mas expoem lacunas ao usuario final.

Correcao:

- Implementar contratos backend e conectar telas, ou remover estas entradas do build de producao.

### B6 - Catalogo e Item ainda tem fallback fake e fluxos fora do MVP

Evidencias:

- `frontend/src/screens/main/CatalogScreen.tsx:57-123` define `MOCK_CATALOGS`.
- `frontend/src/screens/main/CatalogScreen.tsx:159-166` usa modo remoto apenas quando existe `establishmentId`.
- `frontend/src/screens/main/CatalogScreen.tsx:170-175` usa mock quando nao ha modo remoto.
- `frontend/src/screens/main/ItemScreen.tsx:49-73` define acoes genericas fora do runtime validado.
- `frontend/src/screens/main/ItemScreen.tsx:130-139` cria `item-fallback`.
- `frontend/src/screens/main/ItemScreen.tsx:270-276` mostra alerta `Fluxo fora do MVP atual`.

Status atualizado em 2026-05-01:

- RESOLVIDO no codigo local pela EXECUCAO-002.
- `CatalogScreen.tsx` nao possui mais `MOCK_CATALOGS` nem categorias fixas por template como substituto de backend.
- `CatalogScreen.tsx` carrega produtos apenas via `catalogService.getEstablishmentProducts(establishmentId)`; quando a rota nao recebe `establishmentId`, mostra estado vazio honesto sem busca/filtros/itens fake.
- `ItemScreen.tsx` nao cria mais `item-fallback` e nao mostra CTA generico de pedido/reserva/agenda/assinatura fora do backend real.
- Produto e evento continuam usando endpoints reais (`CatalogService.getProduct` e `LocationService.getEvent`).
- Pendente: smoke mobile/staging com estabelecimento real, produto real e evento real.

Impacto:

- Historico mitigado no codigo local: o app nao exibe mais catalogo/item como se fossem reais quando nao ha fonte backend.
- Risco remanescente: falta smoke mobile/staging com estabelecimento real, produto real, evento real, rota sem `establishmentId` e banco vazio.

Correcao:

- Remover fallback fake do fluxo publico ou implementar contratos reais para cada template.

### B7 - Exclusao de conta pede senha na UI, mas backend nao valida senha

Evidencias:

- `frontend/src/services/api/UserService.ts:93-95` deleta conta buscando o usuario atual e chamando `DELETE /users/:id`.
- `backend/src/modules/users/users.controller.ts:269-280` expoe `DELETE /users/:id` protegido por dono do recurso, mas sem receber senha.

Status atualizado em 2026-05-01:

- RESOLVIDO no codigo local pela EXECUCAO-003.
- `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx` envia a senha digitada para `userStore.deleteAccount(password)`.
- `frontend/src/services/api/UserService.ts` passou a chamar `DELETE /users/me` com body `{ password }`.
- `backend/src/modules/users/dtos/delete-account.dto.ts` exige senha no contrato.
- `backend/src/modules/users/users.controller.ts` expoe `DELETE /users/me` autenticado e manteve `DELETE /users/:id` sem bypass, ambos chamando `usersService.softDelete(id, password)`.
- `backend/src/modules/users/users.service.ts` valida `bcrypt.compare`, bloqueia senha invalida e revoga refresh tokens antes de concluir a exclusao.
- Pendente: smoke mobile/staging com senha correta, senha incorreta e sessao/token apos exclusao.

Impacto:

- A UI pode sugerir uma garantia de seguranca que o backend nao executa.

Correcao:

- Adicionar DTO com senha e validacao no backend, ou remover a exigencia de senha da UI. Para producao, a correcao recomendada e validar senha no backend.

### B8 - Textos corrompidos e placeholders visiveis

Evidencias:

- `frontend/src/screens/main/NotificationsScreen.tsx:49-69` usava `??` como avatar no achado historico; RESOLVIDO no codigo local pela EXECUCAO-016 com labels textuais curtos (`SO`, `ES`, `PD`, `SI`).
- `frontend/src/screens/main/NotificationsScreen.tsx:306-319` exibia `??` e `?` no achado historico; RESOLVIDO no codigo local pela EXECUCAO-016.
- `frontend/src/screens/main/NotificationsScreen.tsx:335` exibia `??` no contador no achado historico; RESOLVIDO no codigo local pela EXECUCAO-016.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:41-44` continha texto mojibake no achado historico; normalizado no codigo local pela EXECUCAO-004.
- `frontend/src/screens/main/SettingsScreen.tsx:89-90` contem texto mojibake.
- `frontend/src/screens/main/SettingsPrivacyScreen.tsx:88-115` contem texto mojibake.
- `frontend/src/screens/main/SettingsSecurityScreen.tsx:93-106` contem texto mojibake.

Impacto:

- Tela final fica visualmente quebrada e nao passa criterio minimo de release.

Correcao:

- Normalizar encoding dos arquivos e trocar placeholders por icones/textos reais.

## 5. Problemas por area

### Frontend - rotas e navegacao

Estado observado:

- Rotas principais estao registradas em `frontend/src/screens/navigation/RootNavigator.tsx:55-65`, `73-98`, `135-199` e `219-222`.
- As telas `Activity`, `Settings`, `Catalog` e `Item` estao registradas.

Problema:

- O problema nao e rota ausente por nome estatico; o problema e tela existente com conteudo parcial, mock ou acao local.

### Frontend - telas parciais

Telas criticas:

- `SettingsMyAccountScreen.tsx`
- `SettingsCityScreen.tsx`
- `SettingsScreen.tsx`
- `SettingsPrivacyScreen.tsx`
- `SettingsSecurityScreen.tsx`
- `SettingsAuxScreens.tsx`
- `ActivityScreen.tsx`
- `ActivityFavoritesScreen.tsx`
- `ActivityHistoryScreen.tsx`
- `CatalogScreen.tsx`
- `ItemScreen.tsx`
- `PersonalSetupScreen.tsx`

### Backend - endpoints sem UI completa

Evidencias:

- `backend/src/modules/products/products.controller.ts:56-112` possui endpoints para criar, atualizar, arquivar e enviar midia de produto.
- Historico anterior: `frontend/src/services/api/CatalogService.ts:22-27` possuia apenas leitura de produtos.
- Status atualizado em 2026-05-02: `CatalogService` recebeu criar, editar, arquivar e upload de imagem principal pela EXECUCAO-027.

Problema:

- RESOLVIDO no codigo local pela EXECUCAO-027: a superficie backend de gestao de produtos tem tela owner basica no mobile.
- Pendencias remanescentes: smoke em staging/device, S3/CloudFront real para imagem principal e validar UX com banco vazio.

Correcao:

- Validar a tela `ProductManagementScreen` em staging/device com dono do estabelecimento, erro 403, criacao, edicao, arquivamento e upload real.

### Infra - AWS, banco, Redis, SES, SNS, S3 e CloudFront

Problemas:

- AWS real nao validado.
- Migrations no banco alvo pendentes.
- Redis externo pendente.
- SES com identidade/remetente real pendente.
- SNS/APNs/FCM com credenciais reais pendente.
- S3/CloudFront planejados, mas sem validacao real de ambiente final.
- Observabilidade AWS pendente.

### Mobile - smoke

Evidencias:

- `README.md:625` pede smoke manual mobile para auth, feed, busca, perfil, notificacoes e chat.
- `doc/00_GOVERNANCA/02_ROADMAP_ATE_FINALIZACAO.md:42` tambem marca smoke manual como pendente.

Correcao:

- Rodar smoke em dispositivo ou emulador com backend real/staging.

## 6. Ordem exata de correcao

### Fase 0 - Preparacao

1. Congelar escopo do primeiro release.
2. Separar o que sera entregue agora do que ficara fora do build.
3. Garantir que o trabalho seja feito sobre branch controlada e com worktree revisada.
4. Reexecutar auditoria estatica antes de mexer em telas criticas.

Criterio de aceite:

- Lista final de telas/fluxos do primeiro release definida.
- Telas fora do release escondidas, removidas ou protegidas.

### Fase 1 - Limpeza visual e remocao de placeholders

1. Corrigir mojibake em Settings, Notifications, onboarding e demais telas afetadas.
2. Trocar `??`, `?`, emojis quebrados e textos corrompidos por icones/textos reais.
3. Validar no app em Android.

Criterio de aceite:

- Nenhuma tela de producao exibe texto corrompido.
- Nenhum placeholder visual aparece em fluxo principal.

### Fase 2 - Settings real

1. RESOLVIDO no codigo local pela EXECUCAO-004: conectar `SettingsMyAccountScreen` ao perfil real.
2. RESOLVIDO no codigo local pela EXECUCAO-004: implementar upload de foto por picker/upload real.
3. RESOLVIDO no codigo local pela EXECUCAO-010: conectar troca de cidade a `userStore.updateProfile({ location })` e geolocalizacao real.
4. RESOLVIDO parcialmente no codigo local pela EXECUCAO-012: privacidade/bloqueios foram ocultados do caminho visivel e nao persistem localmente; raio de busca ainda pendente.
5. RESOLVIDO no codigo local pela EXECUCAO-011: implementar `SettingsChangePasswordScreen` usando endpoint real de troca de senha.
6. RESOLVIDO no codigo local pela EXECUCAO-011: remover dispositivos/historico fake do caminho visivel de seguranca e impedir dados inventados nas rotas auxiliares.
7. Corrigir desativacao de conta para acao backend real ou remover do release.

Criterio de aceite:

- Nenhuma configuracao exibida funciona apenas em estado local quando deveria persistir.
- Nenhum botao de Settings fica sem acao real.

### Fase 3 - Onboarding pessoal

1. RESOLVIDO no codigo local pela EXECUCAO-009: criar endpoint de disponibilidade de username (`GET /users/username/availability`) e consumir pelo mobile.
2. RESOLVIDO no codigo local pela EXECUCAO-009: persistir username por `PUT /users/me` e bio/cidade por `PUT /users/me/profile`.
3. RESOLVIDO no codigo local pela EXECUCAO-009: avatar do setup pessoal usa picker/upload real via `POST /users/me/avatar`.
4. RESOLVIDO no codigo local pela EXECUCAO-009: `completeOnboarding()` roda somente depois da persistencia de conta/perfil.
5. DECISAO DE ESCOPO: interesses foram removidos do fluxo atual porque nao existe contrato backend canonico para persistir preferencias/interesses.
6. Validar fluxo cadastro pessoal completo em device/staging.

Criterio de aceite:

- Usuario pessoal recem-criado entra no app com perfil salvo no backend.
- Username duplicado e rejeitado pelo backend.
- Tela nao exibe etapa de interesses fake enquanto nao existir backend real.

### Fase 4 - Activity, Favoritos e Historico

1. RESOLVIDO no codigo local pela EXECUCAO-014: Pedidos, Agendamentos e Reservas sairam do caminho visivel de Activity.
2. RESOLVIDO no codigo local pela EXECUCAO-014: Favoritos e Historico nao sao mais cards clicaveis no hub de Activity.
3. RESOLVIDO no codigo local pela EXECUCAO-014: telas auxiliares de Favoritos/Historico mostram somente estado vazio simples se acessadas internamente.
4. RESOLVIDO no codigo local pela EXECUCAO-014: alertas `Em breve` foram removidos do caminho de producao.

Criterio de aceite:

- Area Activity nao exibe funcionalidade futura como se fosse produto pronto.

### Fase 5 - Catalogo, Item e gestao owner

1. RESOLVIDO no codigo local pela EXECUCAO-002/024: remover `MOCK_CATALOGS` do fluxo publico.
2. RESOLVIDO no codigo local pela EXECUCAO-002/024: Catalog usa `establishmentId` real ou mostra estado vazio honesto.
3. RESOLVIDO no codigo local pela EXECUCAO-002/023: remover `item-fallback` do fluxo publico.
4. RESOLVIDO no codigo local pela EXECUCAO-002/023: remover botoes de pedido/reserva/agenda/assinatura fora do MVP.
5. RESOLVIDO no codigo local pela EXECUCAO-027: criar tela owner para criar/editar/arquivar produto e enviar imagem principal.

Criterio de aceite:

- Catalogo e Item exibem apenas dados reais ou estado vazio real.
- Nenhum CTA aciona apenas alerta de fluxo fora do MVP.

### Fase 6 - Exclusao e seguranca de conta

1. Alterar contrato de exclusao para receber senha.
2. Validar senha no backend antes do soft delete.
3. Ajustar frontend para enviar senha.
4. Testar senha correta, senha incorreta e usuario nao dono.

Criterio de aceite:

- Exclusao de conta so ocorre com senha valida do proprio usuario.

### Fase 7 - Infra real AWS

1. Validar AWS CLI/profile.
2. Criar/validar VPC, subnets, security groups, RDS, Redis/Valkey, ECS/Fargate, ALB, S3, CloudFront, SES, SNS e CloudTrail.
3. Criar secrets reais fora do codigo.
4. Configurar env de producao.
5. Endurecer validacao de ambiente para impedir producao com S3/SES/SNS desligados, se o release exigir app 100% real.
6. Aplicar migrations no RDS.
7. Publicar imagem backend em ECR.
8. Subir ECS/ALB.
9. Aplicar observabilidade.

Criterio de aceite:

- Backend responde em ambiente AWS real.
- Healthcheck passa no ALB.
- Logs, metricas e alarmes estao ativos.

### Fase 8 - Validacao mobile e release

1. Buildar app mobile com env de staging/producao.
2. Rodar smoke em dispositivo/emulador.
3. Validar auth, onboarding, feed, busca, perfil, catalogo, notificacoes e chat.
4. Validar push real.
5. Validar email real.
6. Registrar evidencias de teste.

Criterio de aceite:

- Smoke mobile concluido sem bloqueador.
- Release checklist fechado.

## 7. Tabela arquivo/problema/correcao

| Arquivo | Problema | Correcao |
|---|---|---|
| `README.md:615` | README declara nao pronto para deploy publico real | Fechar pendencias de `README.md:619-625` |
| `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md:61-70` | AWS/deploy/smoke pendentes | Executar validacao real |
| `backend/.env.example:41-75` | S3, CloudFront, SES e SNS desligados/vazios | Criar env real de producao |
| `backend/src/config/env.validation.ts` | RESOLVIDO no codigo local pela EXECUCAO-021: `NODE_ENV=production` agora exige Redis, S3, CloudFront, SES e SNS reais | Validar env staging/producao com secrets reais e smoke AWS |
| `backend/src/modules/media/storage.service.ts:92-101` | Provider diferente de `s3` ainda cai para local fora de producao | Permitido em dev/test; em producao a EXECUCAO-021 bloqueia `STORAGE_PROVIDER` diferente de `s3` |
| `backend/src/common/email/email.service.ts:51-55` | E-mail pode ficar desabilitado fora de producao | Permitido em dev/test; em producao a EXECUCAO-021 bloqueia `EMAIL_PROVIDER` diferente de `ses` |
| `backend/src/common/notification/notification.service.ts:48-52` | Push pode ficar desabilitado fora de producao | Permitido em dev/test; em producao a EXECUCAO-021 bloqueia `PUSH_PROVIDER` diferente de `sns` |
| `docker-compose.yml:79-82` | Storage/email/push desligados no runtime local | Nao usar compose local como prova de producao |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-009: username, bio, cidade/localizacao e avatar deixaram de ser simulados | Validar smoke mobile/staging; manter interesses fora do release ate existir backend real |
| `frontend/src/screens/main/ActivityScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: cards `coming_soon`, alerta `Em breve` e cards comerciais sem backend removidos | Criar contratos reais antes de reexibir cards/rotas de atividade |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: tela nao declara lacuna/backend nem simula lista real | Criar endpoint/lista real antes de reexibir Favoritos no hub |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: tela nao declara lacuna/backend nem simula historico real | Criar contrato real antes de reexibir Historico no hub |
| `frontend/src/screens/main/CatalogScreen.tsx` | RESOLVIDO no codigo local: removido `MOCK_CATALOGS`; rota sem `establishmentId` mostra estado honesto | Validar smoke mobile/staging com estabelecimento real |
| `frontend/src/screens/main/ItemScreen.tsx` | RESOLVIDO no codigo local: removido `item-fallback` e CTA generico sem backend | Validar produto/evento real em device/staging |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-004: conta deixou de usar dados fixos, upload vazio e save simulado | Validar smoke mobile/staging, S3/CloudFront de avatar e alteracao de e-mail |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-010: cidade/recentes fixos removidos; GPS e cidade manual persistem em `PUT /users/me/profile` | Validar smoke mobile/staging e impacto em descoberta local |
| `frontend/src/screens/main/SettingsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-013: toggle GPS local, desativar conta, raio, notificacoes prefs e idioma sairam do menu visivel | Criar contratos reais antes de reexibir; manter delete account real |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-012: privacidade saiu do menu visivel e a tela nao exibe controles locais falsos | Criar backend real de privacidade/bloqueios antes de reexibir |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | RESOLVIDO parcialmente no codigo local pela EXECUCAO-011: menu de seguranca sem comentario vazio/mojibake e sem rotas visiveis para dispositivos/historico fake | Validar smoke de alterar senha e 2FA; criar sessoes/audit log apenas se voltarem ao escopo |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO no codigo local pela EXECUCAO-011: troca de senha deixou de ser scaffold e usa `authStore.changePassword()` -> `POST /auth/change-password` | Validar smoke com senha atual correta/incorreta e confirmacao divergente |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO parcialmente no codigo local pela EXECUCAO-011: dispositivos/historico nao exibem dados inventados e sairam do menu de seguranca | Criar endpoints reais de sessoes/audit log antes de voltar a exibir essas entradas |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` + `frontend/src/screens/navigation/RootNavigator.tsx` | RESOLVIDO no codigo local pela EXECUCAO-018: Contas vinculadas e demais ajustes auxiliares sem backend real nao ficam mais registrados no `SettingsStack` de producao | Reexibir somente com backend/escopo real |
| `frontend/src/screens/main/FeedSocialScreen.tsx` + `frontend/src/screens/main/ProfileScreen.tsx` + `frontend/src/services/api/UserService.ts` | RESOLVIDO no codigo local pela EXECUCAO-017: avatar do autor envia `type: 'user'` + `userId` e `ProfileScreen` carrega `GET /users/:id/public-profile` | Validar smoke com autor usuario e autor estabelecimento; se produto exigir vitrine de estabelecimento ao tocar autor ESTABLISHMENT, incluir `establishmentId` no feed |
| `frontend/src/screens/main/NotificationsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-016/017: clique em notificacao preserva `conversationId`, `entityType/entityId` para estabelecimento/produto/evento e `relatedUserId` para perfil publico de usuario | Validar payloads reais em staging/device |
| `frontend/src/services/api/UserService.ts` | RESOLVIDO no codigo local: Delete account envia senha para `DELETE /users/me` | Validar smoke mobile/staging |
| `backend/src/modules/users/users.controller.ts` + `backend/src/modules/users/users.service.ts` | RESOLVIDO no codigo local: backend valida senha e revoga refresh tokens antes do soft delete | Validar senha correta/incorreta e tokens |
| `frontend/src/screens/main/NotificationsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-016: placeholders `??`/`?` visiveis removidos | Validar smoke visual em device |
| `backend/src/modules/products/products.controller.ts` + `frontend/src/screens/main/ProductManagementScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-027: gestao owner de produtos tem tela conectada a criar/editar/arquivar/upload | Validar smoke staging/device com dono do estabelecimento e S3/CloudFront real |
| `frontend/src/utils/runtimeApiUrl.ts` | RESOLVIDO no codigo local pela EXECUCAO-025: release build nao cai mais para `https://api.meuagito.com` sem `EXPO_PUBLIC_API_URL` | Definir `EXPO_PUBLIC_API_URL` real no build staging/prod e validar chamadas |
| `frontend/app.json` + `frontend/src/services/push/PushRegistrationService.ts` | RESOLVIDO parcialmente no codigo local pela EXECUCAO-026: push nao usa Firebase/google-services e registro automatico fica desligado por default ate estrategia Android/iOS real | Definir push via SNS/APNs e alternativa Android compativel com a decisao de nao usar Firebase, ou manter `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION` desabilitado no primeiro release |
| `frontend/src/screens/main/MapScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-008: item da lista e callout de marker navegam para `Item`/`Profile` | Validar smoke de mapa/lista com evento e estabelecimento reais |
| `frontend/src/App.tsx` + `frontend/src/screens/navigation/linking.ts` + `frontend/app.json` | RESOLVIDO no codigo local pela EXECUCAO-031: `NavigationContainer` recebeu config `linking` e o app registrou scheme `meuagito` | Validar em device/staging links `meuagito://verify-email?token=...` e `meuagito://reset-password?token=...` |
| `frontend/src/screens/auth/SignUpScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-007: `SignUp` sem `profileType` mostra estado acionavel para escolher tipo de conta | Validar smoke abrindo `SignUp` direto e fluxo normal por `ProfileSelection` |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-009: GPS deixou de definir `Sao Paulo, SP` fixo e usa `GeolocationService` + reverse geocode | Validar permissao/localizacao em device real |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-009: avatar do setup pessoal usa picker/upload real | Validar S3/CloudFront em staging |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-009: finalizar setup persiste conta/perfil antes do onboarding completo | Validar usuario novo pessoal em DB vazio/staging |
| `frontend/src/screens/main/SearchScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-015: `RECENT_SEARCHES` e secao `Buscas rapidas` estaticas foram removidas | Criar historico real somente se voltar ao escopo |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO parcialmente pela EXECUCAO-013: contas vinculadas, raio, preferencias de notificacao e idioma nao exibem opcoes fixas nem ficam no menu visivel | Criar contratos reais antes de reexibir |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO parcialmente no codigo local: alterar senha real na EXECUCAO-011; bloqueados sem lista fake e fora do caminho visivel na EXECUCAO-012 | Criar backend real de bloqueios antes de reexibir |
| `frontend/src/screens/main/SettingsScreen.tsx:196-198` | Render de toggle aceita fallback vazio `(() => {})` | Remover fallback vazio e exigir handler real por item |
| `frontend/src/services/api/AuthService.ts:94-103` + `frontend/src/services/api/ApiClient.ts` | RESOLVIDO no codigo local pela EXECUCAO-005: refresh manual preserva `Authorization` explicito e `/auth/refresh` nao dispara retry automatico | Validar smoke de expiracao/refresh em device/staging |
| `frontend/src/services/api/UserService.ts` + `backend/src/modules/users/users.controller.ts:187-233` | RESOLVIDO no codigo local pela EXECUCAO-004: `updateAccount` usa `PUT /users/me` e `updateProfile` usa `PUT /users/me/profile` | Validar smoke autenticado e erro de e-mail/username duplicado |
| `frontend/src/services/api/FeedService.ts` + `frontend/src/stores/feedStore.ts` | RESOLVIDO no codigo local pela EXECUCAO-006: mobile nao envia mais `video` em create/update de post | Validar smoke de criar/editar post com imagem real |
| `backend/src/modules/feed/feed.controller.ts:380-403` + `backend/src/modules/feed/feed.controller.ts:488-519` | Endpoints de liked/likes e edicao de comentario existem, mas nao ha chamada correspondente no `FeedService` | Criar metodos e UI ou remover escopo do release |
| `backend/src/modules/users/users.controller.ts:73-119` + `backend/src/modules/users/users.controller.ts:214-233` | Parcial apos EXECUCAO-004: `PUT /users/me/profile` passou a ser usado pelo mobile; perfil publico/stats/is-following ainda nao tem consumo mobile confirmado | Conectar `getUserProfile`/telas publicas aos endpoints corretos ou declarar fora do escopo |
| `backend/src/modules/media/media.controller.ts:34-126` | Controller generico de media existe, mas frontend usa uploads especificos de usuario/evento/estabelecimento/post | Definir se media generica faz parte do release ou remover/ocultar |

## 8. Checklist final para deploy

- [ ] Escopo do primeiro release fechado.
- [ ] Worktree/branch revisada antes de release.
- [ ] Nenhuma tela de producao com mock, scaffold, `coming_soon` ou botao sem acao.
- [ ] Nenhum texto corrompido ou placeholder visivel.
- [x] Onboarding pessoal persistindo username, bio, cidade/localizacao e avatar no codigo local; smoke mobile/staging pendente.
- [ ] Onboarding business validado ponta a ponta.
- [ ] Settings persistindo dados reais ou ocultando itens fora do release.
- [x] Favoritos/historico fora do caminho visivel sem dados fake no codigo local; endpoints reais pendentes se voltarem ao escopo.
- [x] Catalogo e Item sem fallback fake no codigo local; smoke mobile/staging pendente.
- [x] Delete account validando senha no backend no codigo local; smoke mobile/staging pendente.
- [ ] Endpoints de gestao de catalogo com UI owner ou fora do release.
- [ ] Env de producao criado e revisado.
- [ ] RDS PostgreSQL criado e migrations aplicadas.
- [ ] Redis/Valkey externo validado.
- [ ] S3 validado para upload.
- [ ] CloudFront validado para leitura publica de midia.
- [ ] SES validado com identidade/remetente real.
- [ ] SNS/APNs/FCM validado com dispositivo real.
- [ ] Observabilidade AWS aplicada.
- [ ] Healthcheck em AWS passando.
- [ ] Smoke mobile manual concluido.
- [ ] Evidencias de teste registradas.

## 9. Comandos de validacao sugeridos

Backend:

```powershell
cd backend
npm run prisma:generate
npm run build
npm test
npm run test:e2e
```

Frontend:

```powershell
cd frontend
npm run lint
npm run tsc
```

Infra:

```powershell
docker compose up -d postgres postgres-test redis backend
docker compose ps
```

Observacao:

- `test:e2e` depende do Postgres de teste em `localhost:5433`.
- Smoke mobile precisa ser executado em dispositivo ou emulador, nao apenas por build estatico.

## 10. Registro de novos prompts e analises

Use esta secao para acumular os proximos prompts que forem analisados.

Formato recomendado:

```md
### PROMPT-XXX - titulo curto - AAAA-MM-DD

Prompt recebido:

> texto ou resumo do prompt

Analise:

- evidencia 1
- evidencia 2

Impacto no plano:

- novo bloqueador, se houver
- fase afetada
- arquivos afetados

Atualizacao feita:

- item adicionado ou alterado neste documento
```

### PROMPT-000 - Auditoria base de producao - 2026-04-30

Prompt recebido:

> Auditar README e projeto inteiro para descobrir tudo que ainda impede producao e deploy real, com foco em paginas nao criadas, paginas nao conectadas, links quebrados, botoes sem acao, rotas inexistentes, services chamando endpoint errado, endpoints nao usados, mocks, dados fake, fluxos parciais, configuracoes incompletas, AWS, banco, Redis, SES, SNS, S3, CloudFront e smoke mobile.

Analise:

- Auditoria base registrada nas secoes 3 a 8 deste documento.
- Nenhuma rota estatica inexistente foi confirmada na leitura estatica.
- Nenhum service principal chamando endpoint backend inexistente foi confirmado na leitura estatica.
- Bloqueios principais estao em telas parciais, mocks, configuracoes reais pendentes e validacao AWS/mobile.

Impacto no plano:

- Criadas fases 0 a 8.
- Criada tabela arquivo/problema/correcao.
- Criado checklist final para deploy.

### PROMPT-001 - matriz 100% real sem mock - 2026-04-30

Prompt recebido:

> Analisar o projeto inteiro com base no README.md, documentacao canonica e codigo real para identificar tudo que impede o app de estar 100% real, sem mock, pronto para producao e deploy. Diferenciar implementado funcional, criado parcialmente, mockado/estatico/fake, referenciado mas inexistente, quebrado ou sem ligacao, e pendente para producao/deploy. Entregar tabela com Arquivo, Problema, Tipo do problema, Impacto, Evidencia no codigo, Correcao necessaria e Prioridade.

Validacoes executadas nesta rodada:

- Navegacao React Navigation: 44 rotas registradas, 30 chamadas estaticas `navigation.navigate/push`, 0 destinos ausentes encontrados na extracao estatica.
- Integracao API frontend/backend: 112 endpoints extraidos de controllers, 64 chamadas `apiClient` detectadas no frontend, 0 chamadas sem endpoint correspondente na extracao estatica.
- Prisma: migrations locais encontradas em `backend/prisma/migrations`.
- Firebase/Render: decisao de produto/infra e nao usar Firebase nem Render. `frontend/app.json` nao deve apontar `google-services.json`; backend deve usar AWS-first conforme `.codex`.
- Providers reais: codigo de S3, SES, SNS e Redis existe, mas S3/SES/SNS ainda podem ficar desligados por configuracao.

Classificacao por area:

| Area | Classificacao | Evidencia | Observacao |
|---|---|---|---|
| Auth login/signup/reset/2FA | Implementado e funcional em codigo | `frontend/src/services/api/AuthService.ts`, `backend/src/modules/auth/auth.controller.ts` | Ainda depende de smoke mobile final |
| Onboarding business | Implementado e funcional em codigo | `frontend/src/screens/auth/BusinessSetupScreen.tsx:337-358` | Cria estabelecimento, sobe midia e completa onboarding |
| Onboarding pessoal | Implementado no codigo local; smoke pendente | `frontend/src/screens/auth/PersonalSetupScreen.tsx`; `frontend/src/services/api/UserService.ts`; `backend/src/modules/users/users.controller.ts`; `backend/src/modules/users/users.service.ts` | Username, bio, cidade/localizacao e avatar usam backend real; interesses ficam fora do release ate existir contrato backend |
| Feed | Implementado e funcional em codigo | `frontend/src/services/api/FeedService.ts`, `backend/src/modules/feed/feed.controller.ts` | Ainda depende de smoke real |
| Busca | Implementado e funcional em codigo | `frontend/src/services/api/SearchService.ts`, `backend/src/modules/search/search.controller.ts` | Ainda depende de smoke real |
| Perfil estabelecimento | Implementado e funcional em codigo | `frontend/src/screens/main/ProfileScreen.tsx`, `frontend/src/services/api/LocationService.ts` | Estados vazios reais existem |
| Catalogo publico de produto | Implementado no codigo local; smoke pendente | `frontend/src/screens/main/CatalogScreen.tsx` | Real quando recebe `establishmentId`; rota sem contexto mostra estado honesto sem mock |
| Item produto/evento | Implementado no codigo local para produto/evento; smoke pendente | `frontend/src/screens/main/ItemScreen.tsx` | Produto/evento real; templates genericos sem backend nao exibem CTA fake |
| Chat | Implementado e funcional em codigo | `frontend/src/screens/main/ChatScreen.tsx`, `backend/src/modules/chat/chat.gateway.ts` | Requer smoke 2 usuarios e Redis externo |
| Notificacoes in-app | Implementado e funcional em codigo | `frontend/src/services/api/NotificationsService.ts:69-105`, `backend/src/modules/notifications/notifications.controller.ts:29-100` | Tela ainda tem placeholders visuais |
| Push real | Codigo endurecido; runtime AWS pendente | `backend/src/config/env.validation.ts`; `backend/src/common/notification/notification.service.ts` | Producao exige SNS/ARN pela EXECUCAO-021; falta validar token/device/SNS real |
| E-mail real | Codigo endurecido; runtime AWS pendente | `backend/src/config/env.validation.ts`; `backend/src/common/email/email.service.ts` | Producao exige SES pela EXECUCAO-021; falta validar identidade/envio real |
| Midia real | Codigo endurecido; runtime AWS pendente | `backend/src/config/env.validation.ts`; `backend/src/modules/media/storage.service.ts` | Producao exige S3/CloudFront pela EXECUCAO-021; falta validar bucket/CDN real |
| Redis real | Pendente para producao/deploy | `backend/src/config/env.validation.ts:84-94` | Producao exige Redis, mas falta validar Redis externo alvo |
| Configuracoes | Criado parcialmente / mockado | `frontend/src/screens/main/Settings*.tsx` | Varias telas nao persistem |
| AWS/deploy | Pendente para producao/deploy | `README.md:619-625` | Ambiente final ainda nao validado |

Tabela de problemas exigida pelo prompt:

| Arquivo | Problema | Tipo do problema | Impacto | Evidencia no codigo | Correcao necessaria | Prioridade |
|---|---|---|---|---|---|---|
| `README.md` | O projeto declara pendencias de AWS real, migrations, SES, SNS, Redis externo e smoke mobile | Pendente para producao/deploy | Nao pode ser considerado pronto para deploy real | `README.md:619-625` | Fechar checklist de ambiente real e registrar evidencias | P0 |
| `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md` | Observabilidade AWS, deploy AWS e validacao mobile manual ainda pendentes | Pendente para producao/deploy | Sem prova de operacao real em AWS/mobile | `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md:61-70` | Executar AWS real e smoke mobile | P0 |
| `backend/src/config/env.validation.ts` | RESOLVIDO no codigo local pela EXECUCAO-021: producao agora exige Redis, S3, CloudFront, SES e SNS | Pendente runtime AWS | O app nao deve mais iniciar em producao com providers desligados; falta provar ambiente real | `backend/src/config/env.validation.ts`; `backend/src/config/env.validation.spec.ts` | Validar env ECS/Secrets, S3/CloudFront, SES e SNS em staging real | P0 ate staging/smoke |
| `backend/src/modules/media/storage.service.ts` | Provider diferente de `s3` cai para storage local fora de producao | Permitido dev/test; runtime AWS pendente | Upload local nao deve ocorrer em `NODE_ENV=production` porque env validation bloqueia provider nao S3 | `backend/src/config/env.validation.ts`; `backend/src/modules/media/storage.service.ts` | Validar upload real em S3/CloudFront | P0 ate smoke |
| `backend/src/common/email/email.service.ts` | E-mail fica desabilitado fora de producao quando provider nao e `ses` | Permitido dev/test; runtime AWS pendente | Em producao a env validation exige SES; falta provar envio real | `backend/src/config/env.validation.ts`; `backend/src/common/email/email.service.ts` | Validar identidade SES, sandbox e envio transacional | P0 ate smoke |
| `backend/src/common/notification/notification.service.ts` | Push fica desabilitado fora de producao quando provider nao e `sns` | Permitido dev/test; runtime AWS pendente | Em producao a env validation exige SNS e ARN generico/Android; falta provar device/token | `backend/src/config/env.validation.ts`; `backend/src/common/notification/notification.service.ts` | Validar push SNS em dispositivo real e decidir iOS/APNs | P0 ate smoke se push entrar no release |
| `frontend/src/utils/runtimeApiUrl.ts` | RESOLVIDO no codigo local pela EXECUCAO-025: build nao-dev exige `EXPO_PUBLIC_API_URL` e bloqueia URL local | Pendente build real | App deve falhar cedo se o release nao tiver API URL real; falta provar env do build | `frontend/src/utils/runtimeApiUrl.ts`; `frontend/src/utils/runtimeApiUrl.test.ts` | Definir API URL staging/prod no build e validar chamadas reais em device | P0 ate build/smoke |
| `frontend/app.json` | Estrategia de push mobile precisa ser fechada para Android/iOS | Pendente para producao/deploy | Push real pode ficar fora do release ou sem token nativo em Android | `frontend/app.json:17-44`; decisao do projeto: AWS-first; Firebase nao e backend | Definir SNS + FCM no Android e SNS + APNs no iOS, ou declarar push fora do MVP | P1 |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` + `backend/src/modules/users/users.controller.ts` | RESOLVIDO no codigo local pela EXECUCAO-009: disponibilidade de username e finalizacao de perfil usam backend real | Pendente smoke | Perfil pessoal persiste username, bio, cidade e avatar antes de completar onboarding; interesses nao ficam visiveis sem backend | `PersonalSetupScreen.tsx`; `UserService.checkUsernameAvailability()`; `GET /users/username/availability`; `PUT /users/me`; `PUT /users/me/profile`; `POST /users/me/avatar` | Validar usuario novo pessoal em staging/device, username duplicado, upload avatar e permissao de localizacao | P0 ate smoke |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-004: dados de conta, bio e avatar passaram a usar services reais | Pendente smoke | Usuario edita perfil usando backend real; producao ainda depende de smoke e S3/CloudFront | `SettingsMyAccountScreen.tsx`; `UserService.ts`; `userStore.ts`; `users.service.ts`; `update-user.dto.ts` | Validar device/staging, upload em S3/CloudFront e alteracao de e-mail/username duplicado | P0 ate smoke |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-010: cidades/recentes fixos foram removidos e cidade passa a persistir no perfil | Pendente smoke | Preferencia de cidade usa backend real, mas ainda precisa device/staging para GPS/permissao e descoberta local | `SettingsCityScreen.tsx`; `GeolocationService`; `userStore.updateProfile()`; `PUT /users/me/profile` | Validar cidade manual, GPS concedido/negado e reflexo em perfil/descoberta | P0 ate smoke |
| `frontend/src/screens/main/SettingsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-013: GPS local-only e desativar conta por alerta sairam do menu visivel | Fora do release visivel | Usuario nao ve mais acao sem efeito backend nesse caminho | `SettingsScreen.tsx` | Criar contratos reais antes de reexibir; exclusao real permanece em `SettingsDeleteAccount` | P1 se voltar ao escopo; P0 se reexibir local-only |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` + `frontend/src/screens/main/SettingsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-012: privacidade nao fica mais acessivel pelo menu e nao possui controles locais falsos | Fora do release visivel | Preferencias de privacidade nao sao prometidas sem backend real | `SettingsScreen.tsx`; `SettingsPrivacyScreen.tsx` | Criar contrato backend real antes de reexibir no menu | P1 se voltar ao escopo; nao bloqueia se oculto |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | RESOLVIDO parcialmente no codigo local pela EXECUCAO-011: menu de seguranca mostra senha/2FA e alerta obrigatorio, sem dispositivos/historico fake visiveis | Pendente smoke | Seguranca nao expoe mais atalhos para telas com dados inventados; sessoes/audit log seguem fora do escopo visivel | `SettingsSecurityScreen.tsx`; `SettingsAuxScreens.tsx` | Validar senha/2FA em device; criar backend de sessoes antes de reexibir dispositivos/historico | P0 ate smoke |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO no codigo local pela EXECUCAO-011: trocar senha agora tem formulario real; dispositivos/historico nao mostram dados inventados | Pendente smoke | Fluxo de senha usa backend real; rotas auxiliares nao fingem dados reais | `SettingsChangePasswordScreen`; `authStore.changePassword`; `AuthService.changePassword`; `POST /auth/change-password` | Validar senha atual correta/incorreta, nova senha invalida e confirmacao divergente | P0 ate smoke |
| `frontend/src/screens/main/ActivityScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: cards `coming_soon`, alerta `Em breve` e recursos comerciais sem backend foram removidos | Fora do release visivel | Area principal nao mostra recurso nao entregue como card acionavel | `ActivityScreen.tsx` | Criar endpoints/telas reais antes de reexibir pedidos/agendamentos/reservas/favoritos/historico | P1 se voltar ao escopo; P0 se reexibir falso |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: tela mostra estado vazio simples sem texto de auditoria/backend | Fora do hub visivel | Favoritos nao sao prometidos no hub sem lista real | `ActivityFavoritesScreen.tsx` | Criar endpoint/lista real antes de reexibir | P1 se voltar ao escopo |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: tela mostra estado vazio simples sem texto de auditoria/backend | Fora do hub visivel | Historico nao e prometido no hub sem contrato real | `ActivityHistoryScreen.tsx` | Criar contrato real antes de reexibir | P1 se voltar ao escopo |
| `frontend/src/screens/main/CatalogScreen.tsx` | RESOLVIDO no codigo local: `MOCK_CATALOGS` removido e rota sem `establishmentId` nao renderiza catalogo fake | Pendente smoke | Evita produtos/servicos fake no caminho publico | `frontend/src/screens/main/CatalogScreen.tsx` | Validar com estabelecimento real e banco vazio em staging | P0 ate smoke |
| `frontend/src/screens/main/ItemScreen.tsx` | RESOLVIDO no codigo local: `item-fallback`, CTA generico e cards visiveis de "Escopo atual" removidos | Pendente smoke | Evita CTA/texto de auditoria de pedido/reserva/agenda sem backend | `frontend/src/screens/main/ItemScreen.tsx` | Validar produto/evento real e rota invalida em device/staging | P0 ate smoke |
| `frontend/src/services/api/UserService.ts` + `backend/src/modules/users/users.controller.ts` + `backend/src/modules/users/users.service.ts` | RESOLVIDO no codigo local: exclusao envia senha, valida `bcrypt.compare` e revoga refresh tokens | Pendente smoke | Garantia de seguranca passa a existir no backend | `frontend/src/services/api/UserService.ts`; `backend/src/modules/users/users.controller.ts`; `backend/src/modules/users/users.service.ts`; `delete-account.dto.ts` | Validar senha correta/incorreta, logout e refresh apos delete em staging/device | P0 ate smoke |
| `frontend/src/screens/main/NotificationsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-016: tela nao tem mais placeholders `??` e `?` visiveis | Resolvido; smoke pendente | UI final deixa de exibir marcador quebrado | `frontend/src/screens/main/NotificationsScreen.tsx`; varredura local encontrou apenas `??` de nullish coalescing | Validar smoke visual em device/staging | P1 ate smoke |
| Telas Settings restantes | RESOLVIDO no codigo local ate o caminho visivel: textos tocados foram normalizados e rotas auxiliares sem backend sairam do `SettingsStack` pela EXECUCAO-018 | Resolvido; smoke pendente | Release nao deve expor telas auxiliares incompletas | `SettingsScreen.tsx`; `SettingsSecurityScreen.tsx`; `RootNavigator.tsx` | Validar smoke de Settings e reexibir auxiliares somente com backend real | P1 ate smoke |
| `backend/src/modules/products/products.controller.ts` + `frontend/src/services/api/CatalogService.ts` + `frontend/src/screens/main/ProductManagementScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-027: frontend usa criar/editar/arquivar/upload de produto | Pendente smoke | Dono do estabelecimento consegue manter vitrine pelo app em codigo; falta validar device/staging | `ProductManagementScreen.tsx`; `CatalogService.createProduct/updateProduct/archiveProduct/uploadProductMedia()` | Validar owner correto, erro 403, upload S3/CloudFront e vitrine atualizada | P1 ate smoke |

Achados que nao viraram bloqueio nesta rodada:

- Rotas mobile estaticas: nenhuma rota estatica inexistente encontrada na extracao.
- Chamadas API do frontend: nenhuma chamada `apiClient` detectada sem endpoint correspondente.
- Prisma/migrations: migrations existem localmente; o bloqueio e aplicar no banco alvo, nao ausencia de migrations.

Impacto no plano:

- B2 foi reforcado para incluir validacao de ambiente insuficiente para app 100% real.
- Fase 7 recebeu etapa para endurecer `env.validation.ts`.
- Tabela arquivo/problema/correcao recebeu novos itens sobre env validation, storage local, SES, SNS, API URL e iOS push.

### PROMPT-002 - mapa de telas esperadas vs telas reais - 2026-04-30

Prompt recebido:

> Mapear todas as telas esperadas pelo README.md e comparar com as telas realmente existentes no frontend. Para cada tela, informar se existe, se esta registrada no navigator, se e acessivel pelo usuario, se usa dados reais ou mock, se chama service real, se tem fallback falso/estatico e se esta pronta para producao. Nao aceitar tela apenas criada visualmente como pronta se ela nao consumir backend real.

Validacoes executadas nesta rodada:

- O README lista telas esperadas em `README.md:281-323`.
- O `RootNavigator` importa e registra auth, tabs, Activity stack, Settings stack e telas adicionais em `frontend/src/screens/navigation/RootNavigator.tsx:7-47`, `55-65`, `73-98`, `135-222`.
- Todos os nomes de tela esperados pelo README existem como arquivo ou componente exportado.
- Todas as telas esperadas estao registradas no navigator.
- `SettingsLinkedAccounts` esta registrada, mas nao foi encontrado caminho de usuario para abrir esta tela fora de `WebPreviewNavigator`.
- `MapScreen` usa dados reais; o item de lista como `TouchableOpacity` sem `onPress` foi RESOLVIDO no codigo local pela EXECUCAO-008.

Matriz de telas:

| Tela esperada | Existe? | Registrada no navigator? | Acessivel pelo usuario? | Dados reais ou mock? | Chama service real? | Fallback falso/estatico? | Pronta para producao? | Evidencia / correcao |
|---|---|---|---|---|---|---|---|---|
| Splash | Sim | Sim | Sim, entrada do auth flow | Sem dados remotos | Nao precisa | Timer local | Sim em codigo; depende smoke | `RootNavigator.tsx:56`, `SplashScreen.tsx:21-44` |
| Onboarding introdutorio | Sim | Sim | Sim, auth flow | Conteudo estatico local | Nao | Slides/emoji estaticos e mojibake | Parcial | `RootNavigator.tsx:57`, `OnboardingScreen.tsx:23-59`; corrigir encoding e validar se intro estatica e aceitavel |
| Login | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:58`, `LoginScreen.tsx:23`, `AuthService.ts:76-77` |
| SignUp | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke/SES | `RootNavigator.tsx:60`, `SignUpScreen.tsx:36`, `AuthService.ts:69-70` |
| ForgotPassword | Sim | Sim; deep link configurado pela EXECUCAO-031 | Sim | Real | Sim | Nao encontrado | Parcial ate SES/smoke real | `RootNavigator.tsx`, `ForgotPasswordScreen.tsx`, `AuthService.ts`; token por rota `meuagito://reset-password?token=...` |
| TwoFactorLogin | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:59`, `TwoFactorLoginScreen.tsx:30`, `AuthService.ts:84` |
| VerifyEmail | Sim | Sim; deep link configurado pela EXECUCAO-031 | Sim | Real | Sim | Nao encontrado | Parcial ate SES/smoke real | `RootNavigator.tsx`, `VerifyEmailScreen.tsx`, `AuthService.ts`; token por rota `meuagito://verify-email?token=...` |
| ProfileSelection | Sim | Sim | Sim | Selecao local | Nao | Opcoes estaticas e mojibake | Parcial | `RootNavigator.tsx:63`, `ProfileSelectionScreen.tsx:15-49`; corrigir encoding |
| PersonalSetup | Sim | Sim | Sim | Real no codigo local; smoke pendente | Sim | Nao encontrado no codigo local apos EXECUCAO-009; interesses fora do release por ausencia de backend | Sim em codigo; depende smoke | `RootNavigator.tsx:64`, `PersonalSetupScreen.tsx`, `UserService.checkUsernameAvailability()`, `GET /users/username/availability`, `PUT /users/me`, `PUT /users/me/profile`, `POST /users/me/avatar`; validar staging/device |
| BusinessSetup | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:65`, `BusinessSetupScreen.tsx:219`, `278-358` |
| Home | Sim | Sim | Sim, tab | Real | Sim | Apenas fallback visual de midia | Sim em codigo; depende smoke | `RootNavigator.tsx:135-142`, `HomeScreen.tsx:180-214` |
| Feed | Sim | Sim | Sim, tab | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:143-150`, `FeedSocialScreen.tsx:84-90`, `feedStore.ts:164` |
| Buscar | Sim | Sim | Sim, tab | Real nos resultados | Sim | Nao encontrado no codigo local apos EXECUCAO-015 | Sim em codigo; depende smoke | `RootNavigator.tsx:151-158`, `SearchScreen.tsx`; `RECENT_SEARCHES` removido |
| Atividade | Sim | Sim | Sim, tab | Estado vazio honesto no codigo local | Nao precisa para estado vazio | Nao encontrado no codigo local apos EXECUCAO-014 | Sim em codigo; depende decisao de produto | `RootNavigator.tsx:159-172`, `ActivityScreen.tsx`; criar cards reais antes de reexibir recursos |
| Mapa | Sim | Sim | Sim, tab | Real | Sim | Nao encontrado no codigo local apos EXECUCAO-008; smoke pendente | Sim em codigo; depende smoke | `RootNavigator.tsx:173-180`, `MapScreen.tsx`; lista e marker abrem `Item`/`Profile` |
| Chat | Sim | Sim | Sim, tab | Real | Sim | Nao encontrado | Sim em codigo; depende smoke 2 usuarios/Redis | `RootNavigator.tsx:181-188`, `ChatScreen.tsx:87-100`, `chatStore.ts:261-352` |
| Perfil | Sim | Sim | Sim, tab e navegacao por busca/feed/home | Real para estabelecimento e perfil publico de usuario apos EXECUCAO-017 | Sim | Fallback visual de avatar/produto sem dado fake | Sim em codigo; depende smoke | `RootNavigator.tsx:189-197`, `ProfileScreen.tsx`; `GET /users/:id/public-profile` |
| Configuracoes | Sim | Sim | Sim, tab | Parcial/local | Parcial | Varios itens estaticos/local-only | Nao | `RootNavigator.tsx:198-211`, `SettingsScreen.tsx:55-176`; conectar ou remover itens |
| Notificacoes | Sim | Sim | Sim, via Feed/header e MainStack | Real | Sim | Placeholders visiveis removidos pela EXECUCAO-016; `relatedUserId` conectado pela EXECUCAO-017 | Sim em codigo para conversa/usuario/estabelecimento/produto/evento; depende smoke | `RootNavigator.tsx:220`, `FeedSocialScreen.tsx:204`, `NotificationsScreen.tsx`; validar com notificacoes reais |
| Catalogo | Sim | Sim | Sim, via Perfil | Real com `establishmentId`; sem contexto mostra estado honesto | Sim | Nao encontrado no codigo local apos EXECUCAO-002 | Sim em codigo; depende smoke | `RootNavigator.tsx:221`, `ProfileScreen.tsx:233-242`, `CatalogScreen.tsx`; validar staging/device |
| Item | Sim | Sim | Sim, via Home/Catalogo/Perfil | Real para produto/evento | Sim | Nao encontrado no codigo local apos EXECUCAO-002 | Sim em codigo; depende smoke | `RootNavigator.tsx:222`, `CatalogScreen.tsx`, `ItemScreen.tsx`; validar produto/evento e rota invalida |
| Favoritos | Sim | Sim | Nao fica mais visivel pelo hub de Atividade apos EXECUCAO-014 | Sem dado real; sem fake | Nao | Estado vazio simples se acessada internamente | Fora do release ate backend existir | `RootNavigator.tsx:74`, `ActivityFavoritesScreen.tsx`; criar lista real antes de reexibir |
| Historico | Sim | Sim | Nao fica mais visivel pelo hub de Atividade apos EXECUCAO-014 | Sem dado real; sem fake | Nao | Estado vazio simples se acessada internamente | Fora do release ate backend existir | `RootNavigator.tsx:75`, `ActivityHistoryScreen.tsx`; criar contrato real antes de reexibir |
| Minha conta | Sim | Sim | Sim, via Settings | Real no codigo local | Sim | Nao encontrado no codigo local apos EXECUCAO-004; smoke/S3 pendentes | Sim em codigo; depende smoke | `RootNavigator.tsx:84`, `SettingsScreen.tsx:65`, `SettingsMyAccountScreen.tsx`, `UserService.ts`, `userStore.ts`, `users.service.ts`; validar staging/device |
| Cidade | Sim | Sim | Sim, via Settings | Real no codigo local; smoke pendente | Sim | Nao encontrado no codigo local apos EXECUCAO-010 | Sim em codigo; depende smoke | `RootNavigator.tsx:85`, `SettingsScreen.tsx:78`, `SettingsCityScreen.tsx`; salva `location` via `PUT /users/me/profile` |
| Privacidade | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Controles locais removidos | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsScreen.tsx`, `SettingsPrivacyScreen.tsx`; criar preferencias reais antes de reexibir |
| Seguranca | Sim | Sim | Sim, via Settings | Parcial real no codigo local | Parcial: senha e 2FA reais; sessoes/audit log fora do menu | Nao encontrado no codigo local apos EXECUCAO-011 para menu principal | Sim em codigo para senha/2FA; depende smoke | `RootNavigator.tsx:91`, `SettingsScreen.tsx:120`, `SettingsSecurityScreen.tsx`; dispositivos/historico nao ficam visiveis sem backend |
| Excluir conta | Sim | Sim | Sim, via Settings | Real no codigo local | Sim | Nao encontrado no codigo local apos EXECUCAO-003 | Sim em codigo; depende smoke | `RootNavigator.tsx:98`, `SettingsScreen.tsx:176`, `SettingsDeleteAccountScreen.tsx`, `UserService.ts`, `users.controller.ts`, `users.service.ts`; validar staging/device |
| Contas vinculadas | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Google/Apple fixos fora do caminho de release | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar provedores reais antes de reexibir |
| Raio de busca | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Valores fixos removidos | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar preferencia real antes de reexibir |
| Preferencias de notificacoes | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Switches fixos removidos | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar preferencias reais antes de reexibir |
| Usuarios bloqueados | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Lista vazia fake removida | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar bloqueios reais antes de reexibir |
| Alterar senha | Sim | Sim | Sim, via Seguranca | Real no codigo local; smoke pendente | Sim | Nao encontrado no codigo local apos EXECUCAO-011 | Sim em codigo; depende smoke | `RootNavigator.tsx:92`, `SettingsSecurityScreen.tsx`, `SettingsAuxScreens.tsx`, `AuthService.changePassword()` |
| 2FA | Sim | Sim | Sim, via Seguranca | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:93`, `SettingsSecurityScreen.tsx:43`, `SettingsAuxScreens.tsx:214-270` |
| Dispositivos | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Dados inventados removidos | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar sessoes reais antes de reexibir |
| Historico de acessos | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Dados inventados removidos | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar audit log/sessoes reais antes de reexibir |
| Idioma | Sim | Nao no `SettingsStack` apos EXECUCAO-018 | Nao | Sem dado real; sem fake | Nao | Idiomas fixos removidos | Fora do release ate backend existir | `RootNavigator.tsx`, `SettingsAuxScreens.tsx`; criar preferencia real antes de reexibir |
| Sobre | Sim | Sim | Sim, via Settings | Parcial | Sim para links legais/suporte | Versao fixa | Parcial | `RootNavigator.tsx:97`, `SettingsScreen.tsx:140`, `SettingsAuxScreens.tsx:157-184` |

Resumo do mapeamento:

- Telas esperadas pelo README: encontradas.
- Telas esperadas registradas no navigator: encontradas.
- Telas esperadas realmente prontas em codigo, dependendo apenas de smoke/deploy: Login, SignUp, TwoFactorLogin, BusinessSetup, Home, Feed, Chat, Perfil, 2FA.
- Telas com service real mas ainda nao prontas por placeholder/fallback/acao parcial: Buscar e Notificacoes. `Mapa` saiu desta lista no codigo local pela EXECUCAO-008, pendente de smoke.
- Telas criadas visualmente mas sem backend real suficiente: nenhuma dessas tres permanece com card/alerta/dado falso no caminho visivel apos EXECUCAO-014. `Minha conta` saiu desta lista no codigo local pela EXECUCAO-004, `PersonalSetup` pela EXECUCAO-009, `Cidade` pela EXECUCAO-010, `Seguranca/Alterar senha` parcialmente pela EXECUCAO-011, `Privacidade/Bloqueados` pela EXECUCAO-012, raio/notificacoes prefs/idioma pela EXECUCAO-013 e `Atividade/Favoritos/Historico` pela EXECUCAO-014.
- Tela registrada mas sem acesso de usuario encontrado: Contas vinculadas.

Correcoes derivadas:

1. Remover ou conectar todas as telas marcadas como "Nao" antes de release.
2. Decidir se `SettingsLinkedAccounts` entra no produto; se entrar, adicionar item no menu e backend real; se nao entrar, remover rota.
3. RESOLVIDO no codigo local pela EXECUCAO-008: conectar `MapScreen` list item a Perfil/Item.
4. RESOLVIDO no codigo local pela EXECUCAO-015: remover `RECENT_SEARCHES` e a secao `Buscas rapidas` estatica de `SearchScreen`.
5. RESOLVIDO no codigo local pela EXECUCAO-016 e EXECUCAO-017: notificacoes agora roteiam conversa, usuario relacionado, estabelecimento, produto e evento com parametros reais.
6. Reclassificar tela como pronta somente depois de consumir backend real ou ser declarada como tela puramente local por definicao de produto.

### PROMPT-003 - auditoria de navegacao React Native/Expo - 2026-04-30

Prompt recebido:

> Auditar toda a navegacao do aplicativo React Native/Expo: RootNavigator, auth flow, app tabs, stack screens, deep links, navegacao por botao, cards/listas, rotas com parametros, telas chamadas por nome errado, telas importadas mas nao registradas, telas registradas mas nunca acessadas, parametros obrigatorios ausentes e fluxos que terminam em tela inexistente. Entregar Origem, Acao do usuario, Destino esperado, Destino real, Problema e Correcao.

Validacoes executadas nesta rodada:

- `RootNavigator` define `AuthStack`, `ActivityStack`, `SettingsStack`, `MainTabStack` e `MainAppStack` em `frontend/src/screens/navigation/RootNavigator.tsx:53-230`.
- `App.tsx` usa `NavigationContainer` sem prop `linking` em `frontend/src/App.tsx:70-76`.
- Nao foi encontrado `scheme`, `intentFilters`, `linking=`, `prefixes` ou configuracao nativa de deep link em `frontend/app.json` ou `frontend/src`.
- O app possui preview web por query string `?preview=` em `frontend/src/App.tsx:19-30` e `frontend/src/screens/dev/WebPreviewNavigator.tsx:53-156`; isso nao e deep link nativo de producao.
- Extracao estatica considerando `RootNavigator` e stack interno do chat: 44 rotas registradas.
- Extracao estatica de chamadas `navigate`, `push`, `replace` e `CommonActions.reset`: nenhum nome de rota inexistente encontrado depois de incluir o `ChatStack`.
- Em `RootNavigator`, as telas importadas para stacks/tabs estao registradas. O problema encontrado nao e import sem registro, e sim rota registrada sem caminho de usuario (`SettingsLinkedAccounts`).

Tabela de navegacao:

| Origem | Acao do usuario | Destino esperado | Destino real | Problema | Correcao |
|---|---|---|---|---|---|
| `frontend/src/App.tsx:70-76` | Abrir app por deep link externo | Rota interna correspondente | `NavigationContainer` sem `linking`; nenhum deep link nativo configurado | Deep links nao existem no app atual | Se push/e-mail/link externo precisarem abrir tela interna, criar `linking` com prefixes, screens e params; se nao, documentar que deep link esta fora do release |
| `frontend/src/screens/auth/SplashScreen.tsx:31-45` | Abrir app apos splash | `pendingOnboardingScreen`, `Login` ou `Onboarding` | Usa `navigation.replace(...)` para telas registradas | Sem nome inexistente encontrado | Manter; validar em smoke auth |
| `frontend/src/screens/auth/ProfileSelectionScreen.tsx:46-49` | Escolher tipo de perfil e continuar | `SignUp` com `profileType` e `nextSetupScreen` | `SignUp` recebe parametros corretos | Sem problema na chamada atual | Manter; validar em smoke cadastro |
| `frontend/src/screens/auth/SignUpScreen.tsx` | Abrir `SignUp` sem parametros | Voltar para escolha de perfil ou mostrar erro | Apos EXECUCAO-007, mostra estado acionavel com botao para `ProfileSelection` e link para `Login` | Parametro obrigatorio deixou de causar loading infinito | Validar smoke direto na rota e fluxo normal por `ProfileSelection` |
| `frontend/src/screens/auth/SignUpScreen.tsx:214-217` | Cadastro concluido | `PersonalSetup` ou `BusinessSetup` | `navigation.replace(resolvedNextScreen)` | Destino dinamico e tipado pelo store, sem rota inexistente encontrada | Manter; validar que backend/store nunca devolvem valor fora de `PersonalSetup`/`BusinessSetup` |
| `frontend/src/screens/main/FeedSocialScreen.tsx` | Tocar avatar do autor no feed | Perfil publico do autor | RESOLVIDO no codigo local pela EXECUCAO-017: navega `Profile` com `{ type: 'user', userId }` | Smoke pendente; autor ESTABLISHMENT abre perfil publico do usuario dono, nao vitrine de estabelecimento | Validar smoke; se o produto exigir vitrine empresarial, enriquecer feed com `establishmentId` |
| `frontend/src/screens/main/ProfileScreen.tsx` | Receber `Profile` com `type: 'user'` e `userId` | Perfil do usuario indicado | RESOLVIDO no codigo local pela EXECUCAO-017: carrega `userService.getPublicProfile(userId)` | Smoke pendente | Validar usuario existente, inexistente e conta logada |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Tocar notificacao de conversa | Abrir conversa especifica | RESOLVIDO no codigo local pela EXECUCAO-016: navega `MainTabs -> Chat -> ChatDetail` com `conversationId` e `recipientName` | Smoke pendente com payload real | Validar notificacao de chat em device/staging |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Tocar notificacao com `relatedUserId` | Abrir perfil do usuario relacionado | RESOLVIDO no codigo local pela EXECUCAO-017: navega `MainTabs -> Profile` com `{ type: 'user', userId }` | Smoke pendente com notificacao real | Validar payload real e usuario inexistente |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Tocar notificacao com `entityType/entityId` | Abrir entidade relacionada | RESOLVIDO no codigo local pela EXECUCAO-016/017: `post`, `conversation`, `user`, `establishment`, `product/produto` e `event/evento` entram no roteamento | Smoke pendente | Validar payloads reais |
| `frontend/src/screens/main/MapScreen.tsx` | Tocar item na lista do mapa ou callout do marker | Abrir perfil do estabelecimento ou item do evento | Apos EXECUCAO-008, navega para `Profile` com `establishmentId` ou `Item` com `template: evento` | Sem problema de `onPress` morto no codigo local; smoke pendente | Validar dados reais em mapa/lista no device |
| `frontend/src/screens/main/ActivityScreen.tsx` | Abrir aba Atividade | Ver atividades reais ou estado vazio | Apos EXECUCAO-014, tela mostra estado vazio simples e nao possui cards clicaveis sem backend | Sem problema de `Em breve`/rota fake no codigo local | Criar cards reais somente quando houver backend/fluxo real |
| `frontend/src/screens/main/SettingsScreen.tsx:55-140` | Tocar itens principais de Settings | Abrir subtelas registradas | Rotas dinamicas de `item.route` apontam para telas registradas | Sem nome inexistente encontrado | Manter, mas conectar conteudo das subtelas |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:102-112` | Tentar acessar Contas vinculadas pelo app | Abrir `SettingsLinkedAccounts` | Rota registrada em `RootNavigator.tsx:86`, mas sem item no menu de usuario | Tela registrada nunca acessada pelo fluxo principal | Adicionar item em `SettingsScreen` ou remover rota/tela do release |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Tocar Senha ou 2FA | Abrir subtelas de seguranca | Apos EXECUCAO-011, senha e 2FA apontam para telas registradas e reais; dispositivos/historico sairam do menu visivel | Sem rota fake visivel nesse menu no codigo local; smoke pendente | Validar alterar senha e 2FA; reexibir dispositivos/historico somente com backend real |
| `frontend/src/screens/main/CatalogScreen.tsx` | Tocar item do catalogo | Abrir `Item` com contexto do item | Apos EXECUCAO-002, navega apenas com produto real carregado por `establishmentId` | Sem `establishmentId`, a tela mostra estado honesto e nao cria item mock | Validar smoke com catalogo real e rota sem contexto |
| `frontend/src/screens/main/ProfileScreen.tsx:233-256` | Tocar vitrine/produto no perfil | Abrir `Catalog`/`Item` do estabelecimento | Navega com `establishmentId`, `establishmentName` e `productId` | Sem problema de nome/parametro encontrado | Manter; validar em smoke |
| `frontend/src/screens/main/ItemScreen.tsx:255-266` | Tocar estabelecimento no item de produto | Voltar/abrir perfil do estabelecimento | Navega `MainTabs -> Profile` com `establishmentId` se existir; senao `goBack()` | Se produto vier sem estabelecimento, acao nao abre destino real | Garantir backend retorna `product.establishment.id` ou desabilitar CTA quando ausente |
| `frontend/src/screens/main/ChatScreen.tsx:129-136` | Tocar conversa | Abrir detalhe da conversa | Navega `ChatDetail` com `conversationId` e `recipientName` | Rota existe no stack interno do chat | Manter; validar em smoke 2 usuarios |
| `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx:52-64` | Confirmar exclusao de conta | Logout e retorno ao login | `CommonActions.reset` para `Login` | Nome de rota existe; senha validada no backend apos EXECUCAO-003 | Validar smoke mobile/staging com senha correta/incorreta |

Achados negativos da auditoria:

- Nao foi confirmado fluxo terminando em tela inexistente.
- Nao foi confirmado nome estatico de rota errado.
- Nao foi confirmado import em `RootNavigator` sem registro.
- `ChatDetail` parece inexistente se a extracao considerar somente `RootNavigator`, mas existe no stack interno de `ChatScreen.tsx:410-412`.

Correcoes derivadas:

1. RESOLVIDO no codigo local pela EXECUCAO-017: corrigir navegacao do feed para perfil publico, eliminando o uso de `userId` em destino que nao o consome.
2. RESOLVIDO no codigo local pela EXECUCAO-016 e EXECUCAO-017: corrigir roteamento de notificacoes para preservar `conversationId`, `relatedUserId`, `entityType` e `entityId`.
3. Decidir e implementar deep links nativos se o release precisar abrir telas por e-mail/push/link externo.
4. RESOLVIDO no codigo local pela EXECUCAO-007: remover loading infinito de `SignUp` sem `profileType`.
5. RESOLVIDO no codigo local pela EXECUCAO-008: conectar `MapScreen` list item e markers.
6. Remover/implementar cards de Activity que terminam em `Em breve`.
7. Dar caminho real para `SettingsLinkedAccounts` ou remover a rota.

### PROMPT-004 - auditoria de botoes links cards icones e menus - 2026-04-30

Prompt recebido:

> Procurar no frontend todos os botoes, links, cards clicaveis, icones clicaveis e acoes de menu. Para cada item, verificar `onPress`, navegacao para tela real, chamada de service real, TODO, `console.log`, alert temporario, funcao vazia, textos `em breve`, `mock`, `placeholder`, `fake`, `dummy`, `sample` e acao visual sem efeito real. Classificar como funcional real, parcial, mock/fake, quebrado ou nao implementado. Entregar tabela com arquivo, componente, acao, problema e correcao.

Validacoes executadas nesta rodada:

- Varredura em `frontend/src` para `<Button`, `<TouchableOpacity`, `<Pressable`, `onPress`, `TODO`, `FIXME`, `console.log`, `Alert.alert`, `coming_soon`, `Em breve`, `mock`, `MOCK`, `fake`, `dummy`, `sample` e `placeholder`.
- `Pressable` nao apareceu nos resultados; a superficie clicavel encontrada usa `TouchableOpacity`, `Button`, `Switch`, radios locais e itens de menu.
- `frontend/src/screens/main/MapScreen.tsx:111-131` foi o caso historico confirmado de componente clicavel sem `onPress`; RESOLVIDO no codigo local pela EXECUCAO-008.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:63-66` foi o caso historico confirmado de botoes de alerta com `onPress: () => {}`; RESOLVIDO no codigo local pela EXECUCAO-004 com `expo-image-picker` e `uploadAvatar`.
- `frontend/src/screens/main/ActivityScreen.tsx:40-71`, `CatalogScreen.tsx:57-175`, `ItemScreen.tsx:49-73` e `ItemScreen.tsx:270-276` concentram os marcadores de recurso futuro/mock/CTA sem fluxo real.
- `frontend/src/utils/logger.ts:8` contem `console.log(...args)`, mas e utilitario central de logger; nao foi classificado como botao/link quebrado nesta auditoria.

Classificacao por grupos:

| Classificacao | Itens/acoes | Evidencia | Observacao |
|---|---|---|---|
| Funcional real | Login, cadastro, reset, verificacao de e-mail e 2FA de login | `frontend/src/screens/auth/LoginScreen.tsx:140`, `SignUpScreen.tsx:331`, `ForgotPasswordScreen.tsx:99`, `VerifyEmailScreen.tsx:87`, `TwoFactorLoginScreen.tsx:101` | Botoes chamam hooks/services de auth; ainda dependem de smoke real e SES quando aplicavel |
| Funcional real | Onboarding business: continuar, publicar, upload de midia e criar estabelecimento | `frontend/src/screens/auth/BusinessSetupScreen.tsx:337-358`, `641-652` | Chama `locationService.createEstablishment`, upload de midia e `completeOnboarding` |
| Funcional real | Feed: curtir, comentar, enviar comentario, compartilhar, refresh e limpar erro | `frontend/src/screens/main/FeedSocialScreen.tsx:134-169`, `279-287`, `407-414` | Like/comment usam store/service real; share usa `Share.share` nativo |
| Funcional real | Home: busca, cards de evento, places e ranking | `frontend/src/screens/main/HomeScreen.tsx:262-275`, `318-388` | Navega para `Search`, `Item` ou `Profile` com dados carregados por services reais |
| Funcional real | 2FA em Settings | `frontend/src/screens/main/SettingsAuxScreens.tsx:249-363` | Usa `setup2FA`, `verify2FA`, `disable2FA` e `userService.getProfile` |
| Funcional real em codigo; smoke pendente | Excluir conta | `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx`, `frontend/src/services/api/UserService.ts`, `backend/src/modules/users/users.service.ts` | Front envia senha; backend valida `bcrypt.compare` e revoga refresh tokens; validar em device/staging |
| Funcional real em codigo; smoke pendente | Busca | `frontend/src/screens/main/SearchScreen.tsx` | Busca usa service real e `RECENT_SEARCHES` foi removido pela EXECUCAO-015 |
| Funcional real em codigo; smoke pendente | Notificacoes | `frontend/src/screens/main/NotificationsScreen.tsx` | Marca como lida/deleta via service real; apos EXECUCAO-016/017 roteia conversa, usuario, estabelecimento, produto e evento com parametros reais |
| Funcional real em codigo; smoke pendente | Perfil publico a partir do feed | `frontend/src/screens/main/FeedSocialScreen.tsx`; `frontend/src/screens/main/ProfileScreen.tsx`; `UserService.getPublicProfile()` | Apos EXECUCAO-017, `onPress` envia `userId` e o destino consome endpoint publico real |
| Fora do caminho visivel; sem fake no codigo local | Configuracoes locais | `frontend/src/screens/main/SettingsScreen.tsx` | EXECUCAO-013 removeu toggle GPS local-only e fallback vazio para handler |
| Funcional real em codigo; smoke pendente | Minha conta | `frontend/src/screens/main/SettingsMyAccountScreen.tsx`, `frontend/src/services/api/UserService.ts`, `frontend/src/stores/userStore.ts` | Perfil carrega do backend, salva conta/perfil em endpoints separados e envia avatar; validar device/staging/S3 |
| Funcional real em codigo; smoke pendente | Cidade | `frontend/src/screens/main/SettingsCityScreen.tsx`; `UserService.updateProfile()` | GPS usa geolocalizacao real e cidade manual persiste no perfil via backend |
| Resolvido em codigo; smoke pendente | Catalogo sem `establishmentId` | `frontend/src/screens/main/CatalogScreen.tsx` | Apos EXECUCAO-002, `MOCK_CATALOGS` nao existe no caminho de producao e rota sem contexto mostra estado honesto |
| Fora do caminho visivel; sem fake no navigator | Telas auxiliares de Settings | `frontend/src/screens/main/SettingsAuxScreens.tsx`; `frontend/src/screens/navigation/RootNavigator.tsx` | Apos EXECUCAO-018, telas auxiliares sem backend real nao ficam registradas no `SettingsStack` |
| Funcional real em codigo; smoke pendente | Lista do mapa | `frontend/src/screens/main/MapScreen.tsx` | Lista e marker abrem `Item` para evento e `Profile` para estabelecimento |
| Funcional real em codigo; smoke pendente | Alterar foto em Minha conta | `frontend/src/screens/main/SettingsMyAccountScreen.tsx`, `UserService.uploadAvatar()` | Usa galeria nativa e `POST /users/me/avatar`; validar S3/CloudFront em staging |
| Fora do caminho visivel; sem fake no codigo local | Pedidos, Agendamentos e Reservas em Activity | `frontend/src/screens/main/ActivityScreen.tsx` | EXECUCAO-014 removeu cards e alerta `Em breve` |
| Resolvido em codigo; smoke pendente | CTAs genericos de Item | `frontend/src/screens/main/ItemScreen.tsx` | Apos EXECUCAO-002/023, `ItemScreen` nao contem mais `Agendar`, `Reservar`, `Assinar`, carrinho nem alerta de fluxo fora do MVP; produto abre estabelecimento e evento confirma/cancela presenca via backend |
| Funcional real em codigo; smoke pendente | Setup pessoal real | `frontend/src/screens/auth/PersonalSetupScreen.tsx`; `frontend/src/services/api/UserService.ts`; `backend/src/modules/users/users.controller.ts` | Username, GPS/cidade, avatar, bio e finish usam services reais; interesses fora do release por ausencia de backend canonico |

Tabela de acoes com problema:

| Arquivo | Componente | Acao | Classificacao | Problema | Evidencia no codigo | Correcao |
|---|---|---|---|---|---|---|
| `frontend/src/screens/main/MapScreen.tsx` | Item da lista e marker/callout | Tocar evento/estabelecimento no mapa | Funcional real em codigo; smoke pendente | Navega para `Item` com evento ou `Profile` com estabelecimento | `MapScreen.tsx` | Validar em device/staging com dados reais |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Alterar foto | Selecionar imagem e atualizar avatar | Funcional real em codigo; smoke pendente | Usa `expo-image-picker` e `userStore.uploadAvatar`; storage real ainda depende S3/CloudFront | `SettingsMyAccountScreen.tsx`; `UserService.uploadAvatar()` | Validar upload em device/staging com S3/CloudFront |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Botao `Salvar` | Salvar dados de conta | Funcional real em codigo; smoke pendente | Salva conta via `updateAccount` e bio via `updateProfile`; falta smoke final | `SettingsMyAccountScreen.tsx`; `UserService.updateAccount()`; `UserService.updateProfile()` | Validar sucesso, erro de duplicidade, token expirado e alteracao de e-mail |
| `frontend/src/screens/main/SettingsScreen.tsx` | Toggle GPS | Alternar permissao/localizacao | Fora do caminho visivel; sem fake no codigo local | EXECUCAO-013 removeu o toggle local-only | `SettingsScreen.tsx` | Criar preferencia/permissionamento real antes de reexibir |
| `frontend/src/screens/main/SettingsScreen.tsx` | Item `Desativar Conta` | Confirmar desativacao | Fora do caminho visivel; sem fake no codigo local | EXECUCAO-013 removeu a acao por alerta local | `SettingsScreen.tsx` | Criar endpoint de desativacao real antes de reexibir; delete real continua disponivel |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Card `Usar minha localizacao` | Detectar cidade por GPS | Funcional real em codigo; smoke pendente | Usa `GeolocationService.getCurrentLocation()` + reverse geocode, sem cidade fixa | `SettingsCityScreen.tsx`; `GeolocationService` | Validar permissao concedida/negada em device real |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Cidade manual e confirmar | Escolher/confirmar cidade | Funcional real em codigo; smoke pendente | `CITY_OPTIONS`/`recentCities` removidos; `handleConfirmCity` salva `location` via backend antes de voltar | `SettingsCityScreen.tsx`; `userStore.updateProfile()`; `PUT /users/me/profile` | Validar persistencia em staging e impacto em telas que leem perfil/localizacao |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | Privacidade, mensagens e check-ins | Alterar preferencias de privacidade | Fora do caminho visivel; sem fake no navigator | EXECUCAO-012 ocultou entrada do menu e EXECUCAO-018 removeu rota do `SettingsStack` | `RootNavigator.tsx`; `SettingsScreen.tsx`; `SettingsPrivacyScreen.tsx` | Criar get/update de privacy settings antes de reexibir |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Menu de seguranca | Abrir submenus | Funcional real em codigo; smoke pendente para senha/2FA | Apos EXECUCAO-011, senha e 2FA sao os destinos visiveis; dispositivos/historico fake sairam do menu | `SettingsSecurityScreen.tsx`; `SettingsAuxScreens.tsx` | Validar senha/2FA; reexibir sessoes somente com backend real |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Contas vinculadas, raio, notificacoes, idioma | Interagir com linhas/switches | Fora do caminho visivel; sem fake no navigator | EXECUCAO-013 removeu entradas do menu e EXECUCAO-018 removeu rotas do `SettingsStack` | `RootNavigator.tsx`; `SettingsScreen.tsx`; `SettingsAuxScreens.tsx` | Implementar contratos reais antes de reexibir |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Alterar senha | Atualizar senha | Funcional real em codigo; smoke pendente | Usa formulario real e `authStore.changePassword()` -> `POST /auth/change-password` | `SettingsChangePasswordScreen`; `useAuth.changePassword`; `AuthService.changePassword()` | Validar senha atual correta/incorreta, confirmacao divergente e token expirado |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Bloqueados | Gerenciar bloqueios | Fora do caminho visivel; sem fake no navigator | EXECUCAO-012 removeu lista vazia fake e EXECUCAO-018 removeu rota do `SettingsStack` | `RootNavigator.tsx`; `SettingsAuxScreens.tsx`; `SettingsScreen.tsx` | Criar lista real antes de reexibir |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Dispositivos e historico | Ver sessoes/acessos | Fora do menu visivel; sem fake no navigator | EXECUCAO-011 removeu dados inventados e EXECUCAO-018 removeu rotas do `SettingsStack` | `RootNavigator.tsx`; `SettingsSecurityScreen.tsx`; `SettingsAuxScreens.tsx` | Criar endpoints de sessoes/audit log antes de voltar ao menu |
| `frontend/src/screens/main/ActivityScreen.tsx` | Cards Pedidos/Agendamentos/Reservas | Abrir fluxo comercial | Fora do caminho visivel; sem fake no codigo local | EXECUCAO-014 removeu cards `coming_soon` e alerta `Em breve` | `ActivityScreen.tsx` | Implementar telas/rotas reais antes de reexibir |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | Botao/estado de Favoritos | Ver favoritos | Fora do hub visivel; sem fake no codigo local | EXECUCAO-014 removeu texto de auditoria/backend e deixa estado vazio simples | `ActivityFavoritesScreen.tsx` | Criar endpoint/lista real antes de reexibir |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | Botao/estado de Historico | Ver historico | Fora do hub visivel; sem fake no codigo local | EXECUCAO-014 removeu texto de auditoria/backend e deixa estado vazio simples | `ActivityHistoryScreen.tsx` | Criar contrato real antes de reexibir |
| `frontend/src/screens/main/CatalogScreen.tsx` | Card de catalogo | Abrir item | RESOLVIDO no codigo local; smoke pendente | Apos EXECUCAO-002, sem `establishmentId` nao carrega `MOCK_CATALOGS` e mostra estado honesto | `CatalogScreen.tsx` | Validar smoke em perfil de estabelecimento real e rota sem contexto |
| `frontend/src/screens/main/ItemScreen.tsx` | CTA/texto de escopo | Agendar, reservar, assinar, adicionar ao carrinho | RESOLVIDO no codigo local; smoke pendente | Apos EXECUCAO-002, CTA generico fora do backend foi removido; apos EXECUCAO-019, cards "Escopo atual" sairam da UI | `ItemScreen.tsx` | Validar produto/evento real em device/staging |
| `frontend/src/screens/main/FeedSocialScreen.tsx` | Avatar do autor | Abrir perfil publico | Funcional real em codigo; smoke pendente | Apos EXECUCAO-017, navega para perfil publico de usuario via endpoint real | `FeedSocialScreen.tsx`; `ProfileScreen.tsx`; `UserService.ts` | Validar autor usuario/estabelecimento em device/staging |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Linha de notificacao | Abrir entidade relacionada | Funcional real em codigo; smoke pendente | Apos EXECUCAO-016/017, conversa/usuario/estabelecimento/produto/evento usam params reais | `NotificationsScreen.tsx`; `ProfileScreen.tsx` | Validar payloads reais em device/staging |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Username | Verificar disponibilidade | Funcional real em codigo; smoke pendente | Chama `UserService.checkUsernameAvailability()` contra endpoint autenticado | `PersonalSetupScreen.tsx`; `UserService.ts`; `UsersController.checkUsernameAvailability()` | Validar username livre, duplicado e invalido em staging/device |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Avatar | Adicionar/trocar foto | Funcional real em codigo; smoke pendente | Usa `expo-image-picker` e `userStore.uploadAvatar()` | `PersonalSetupScreen.tsx`; `POST /users/me/avatar` | Validar upload com S3/CloudFront real |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | GPS | Usar localizacao atual | Funcional real em codigo; smoke pendente | Usa `GeolocationService.getCurrentLocation()` e reverse geocode, sem cidade fixa | `PersonalSetupScreen.tsx`; `GeolocationService` | Validar permissao concedida/negada e cidade resolvida em device |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Finalizar | Completar setup pessoal | Funcional real em codigo; smoke pendente | Persiste `PUT /users/me`, `PUT /users/me/profile` e so depois chama `completeOnboarding()` | `PersonalSetupScreen.tsx`; `UserService.ts`; `userStore.ts` | Validar cadastro pessoal novo em DB vazio/staging |
| `frontend/src/screens/main/SearchScreen.tsx` | Chips `Buscas rapidas` | Reexecutar busca | RESOLVIDO no codigo local pela EXECUCAO-015 | Secao estatica e constante `RECENT_SEARCHES` removidas | `SearchScreen.tsx` | Criar historico real somente se voltar ao escopo |

Correcoes derivadas:

1. Tratar `TouchableOpacity` sem `onPress` como bloqueio visual de release.
2. Proibir `onPress: () => {}` em codigo de producao; toda acao deve chamar service real, navegar para tela real ou ser removida.
3. Remover do release qualquer card que termine em `Em breve`, `Fluxo fora do MVP atual` ou scaffold estatico.
4. RESOLVIDO no codigo local pela EXECUCAO-015: remover buscas fixas para nao parecer historico real.
5. Persistir ou ocultar todas as configuracoes que hoje funcionam apenas em estado local.
6. Validar no smoke mobile os grupos classificados como funcionais reais, porque a auditoria aqui foi estatica.

### PROMPT-005 - auditoria services frontend vs endpoints backend - 2026-04-30

Prompt recebido:

> Comparar todas as chamadas de API existentes no frontend com os endpoints reais do backend. Verificar URL, metodo, payload, query params, headers/auth, endpoint correspondente, DTO esperado, resposta esperada, tratamento de erro, paginacao, upload multipart, refresh token e rotas protegidas. Apontar endpoint chamado mas inexistente, endpoint existente mas nao usado, payload incompativel, campo com nome errado, tipagem diferente, falta de tratamento de erro e uso de mock/fallback falso. Entregar em tabela: Service frontend | Chamada | Endpoint backend | Status | Incompatibilidade | Correcao.

Validacoes executadas nesta rodada:

- Varredura dos services em `frontend/src/services/api/*.ts` para chamadas `apiClient.get/post/put/delete/uploadFile`.
- Leitura de `frontend/src/services/legal/LegalLinks.ts`, porque abre documentos legais diretamente pelo backend.
- Leitura dos controllers em `backend/src/modules/**/*.controller.ts`.
- Leitura dos DTOs criticos de auth, users, feed, notifications, events, establishments, products, chat e search.
- Leitura do `ApiClient` para headers/auth, refresh token, multipart upload e tratamento de erro.
- Leitura de `backend/src/main.ts:107-110`, que usa `ValidationPipe` com `whitelist: true` e `forbidNonWhitelisted: true`; campos extras nos DTOs sao rejeitados.

Resumo da comparacao:

- Endpoint chamado mas inexistente: nenhum confirmado na leitura estatica dos services. O caso `FeedService.ts:166-168` monta `/posts/media${query}`, mas o caminho base corresponde a `POST /posts/media`; `postId` e query opcional.
- Quebrado por contrato: nenhum dos tres P0 locais anteriores permanece aberto no codigo local. `UserService.updateProfile` foi RESOLVIDO pela EXECUCAO-004, `AuthService.refreshToken` pela EXECUCAO-005 e `FeedService.createPost/updatePost` com `video` pela EXECUCAO-006.
- Parcial para producao: tratamento de erro e generico no `ApiClient`; alguns fluxos dependem de SES/SNS/S3/CloudFront reais e smoke mobile.
- Endpoint backend existente mas sem consumo mobile confirmado: gestao owner de produtos, media generica, liked/likes de post, edicao de comentario, public-profile/stats/is-following de usuario, legal JSON e health. `PUT /users/me/profile` passou a ser consumido pelo mobile na EXECUCAO-004.

Tabela service/endpoints:

| Service frontend | Chamada | Endpoint backend | Status | Incompatibilidade | Correcao |
|---|---|---|---|---|---|
| `AuthService.ts:69-79` | `POST /auth/signup`, `POST /auth/login` | `AuthController` `@Post('signup')` e `@Post('login')` em `backend/src/modules/auth/auth.controller.ts:28-68` | OK estatico; EXECUCAO-028 adicionou aceite legal ao signup | Payload de cadastro envia `termsAccepted` e `privacyPolicyAccepted`; backend persiste versoes atuais de Termos/Politica | Manter e validar cadastro/smoke mobile com migration aplicada |
| `AuthService.ts:83-88` | `POST /auth/verify-2fa-login` com `userId`, `code`, `tempToken` | `AuthController` `@Post('verify-2fa-login')` em `auth.controller.ts:299` | OK estatico | Nenhuma incompatibilidade confirmada | Validar fluxo com usuario 2FA real |
| `AuthService.ts:94-103` + `ApiClient.ts` | `POST /auth/refresh` com `Authorization: Bearer <refreshToken>` | `AuthController` `@Post('refresh')` + `RefreshTokenGuard` em `auth.controller.ts:93-116`; strategy le bearer em `refresh-token.strategy.ts:11-16` | OK no codigo local; smoke pendente | EXECUCAO-005 preservou `Authorization` explicito no request interceptor e bloqueou retry automatico em `/auth/refresh` quando o refresh falha | Validar expiracao/refresh/logout em smoke mobile/staging |
| `ApiClient.ts:231-270` | Refresh automatico em 401 via axios cru `POST /auth/refresh` | Mesmo endpoint `POST /auth/refresh` | OK estatico | Esse caminho nao passa pelo interceptor e envia bearer de refresh corretamente | Reaproveitar esse caminho tambem no `AuthService.refreshToken` |
| `AuthService.ts:109-129` | `POST /auth/logout`, `POST /auth/enable-2fa`, `POST /auth/verify-2fa`, `POST /auth/disable-2fa` | `AuthController` `@Post('logout')`, `enable-2fa`, `verify-2fa`, `disable-2fa` em `auth.controller.ts:118-287` | OK estatico | Rotas protegidas dependem do bearer injetado pelo `ApiClient` | Smoke autenticado |
| `AuthService.ts:135-172` | `POST /auth/request-password-reset`, `reset-password`, `change-password`, `verify-email`, `resend-verification-email` | Endpoints equivalentes em `auth.controller.ts:129-216` | OK estatico | Payloads batem com DTOs; e-mail real depende de SES | Fechar SES e smoke de e-mail |
| `UserService.ts` | `GET /users/me`, `GET /users/:userId`, `GET /users/:userId/public-profile` | `UsersController` `@Get('me')`, `@Get(':id')` e `@Get(':id/public-profile')` | OK no codigo local; smoke pendente | EXECUCAO-017 adicionou `getPublicProfile()` e `ProfileScreen` usa a rota publica para `userId` de feed/notificacao | Validar perfil publico e garantir que e-mail/senha nao retornam |
| `UserService.ts` | `GET /users/username/availability`, `PUT /users/me` para conta e `PUT /users/me/profile` para perfil | `UsersController` `@Get('username/availability')`, `@Put('me')` e `@Put('me/profile')` | OK no codigo local; smoke pendente | EXECUCAO-004 separou `updateAccount`/`updateProfile`; EXECUCAO-009 adicionou check real de username e `UpdateUserDto` valida formato de username | Validar smoke autenticado, username livre/duplicado/invalido, e-mail duplicado e limpeza de bio |
| `UserService.ts:57-70` | Multipart `POST /users/me/avatar` campo `file` | `UsersController` `@Post('me/avatar')` + `FileInterceptor('file')` em `users.controller.ts:236-267` | OK estatico | Depende de storage real para producao | Validar S3/CloudFront e smoke de upload |
| `UserService.ts:73-101` | follow/unfollow, followers/following, search `GET /users`, delete `DELETE /users/me` | Endpoints equivalentes em `users.controller.ts:121-169`, `267-309` | OK no codigo local; smoke pendente | Delete account envia senha e backend valida antes do soft delete | Validar em device/staging com senha correta/incorreta e refresh token revogado |
| `CatalogService.ts:22-28` | `GET /establishments/:id/products`, `GET /products/:id` | `ProductsController` `@Get('establishments/:id/products')`, `@Get('products/:id')` em `products.controller.ts:42-54` | OK no codigo local; smoke pendente | Leitura existe e EXECUCAO-002 removeu fallback fake de Catalog/Item | Validar Catalog/Item com estabelecimento/produto real em staging/device |
| `CatalogService.ts` + `ProductManagementScreen.tsx` | Criar/editar/arquivar/upload de produto | `ProductsController` `POST/PUT/DELETE /establishments/:id/products...` e `POST .../media` em `products.controller.ts:56-145` | RESOLVIDO no codigo local pela EXECUCAO-027 | Falta smoke real | Validar owner, upload e refresh da vitrine em staging/device |
| `ChatService.ts:72-181` | Conversas, mensagens, editar/deletar, marcar lida, busca, unread, arquivar | `ChatController` endpoints equivalentes em `chat.controller.ts:44-205` | OK estatico | JSON `{ recipientId }`, `{ content }` e multipart `content` + `file` batem com controller/DTO | Validar anexos reais e push/chat realtime no smoke |
| `FeedService.ts` | `POST /posts` com `content` e `imageUrls` | `FeedController` `@Post()` em `feed.controller.ts:51-73`; `CreatePostDto` em `create-post.dto.ts:12-56` | OK no codigo local; smoke pendente | EXECUCAO-006 removeu `video` de `CreatePostRequest`, `feedStore.createPost` e payload de `POST /posts` | Validar criar post com e sem imagem em staging/device |
| `FeedService.ts:158-174` | Multipart `POST /posts/media?postId=...` campo `file` | `FeedController` `@Post('media')` em `feed.controller.ts:76-107` | OK estatico | Query `postId` e opcional; nao e rota inexistente | Manter e validar S3/CloudFront |
| `FeedService.ts:177-207` | `GET /posts/feed`, `GET /feed/agito`, `GET /posts/explore`, `GET /posts/:id` | `FeedController` e `AgitoFeedController` em `feed.controller.ts:114-220`, `agito-feed.controller.ts:13` | OK estatico | Paginacao `page/limit` e cursor `cursor/limit/mode` batem com DTOs | Smoke de feed real |
| `FeedService.ts` | `PUT /posts/:id` com `content` e `imageUrls` | `FeedController` `@Put(':id')` em `feed.controller.ts:257-285`; `UpdatePostDto` em `update-post.dto.ts:12-56` | OK no codigo local; smoke pendente | EXECUCAO-006 removeu `video` de `feedStore.updatePost` e payload de `PUT /posts/:id` | Validar editar post com e sem imagem em staging/device |
| `FeedService.ts:220-264` | delete/like/unlike/comments/comment-like/delete/user posts | Endpoints equivalentes em `feed.controller.ts:293-592` | OK estatico | Nenhuma incompatibilidade confirmada nessas chamadas | Smoke autenticado |
| `Sem service frontend` | `GET /posts/:id/liked`, `GET /posts/:id/likes`, `PUT /posts/comments/:commentId` | `FeedController` em `feed.controller.ts:380-403`, `488-519` | Endpoint existente nao usado | App nao tem metodo para checar liked/listar likes/editar comentario | Criar metodos e UI ou remover do escopo |
| `LocationService.ts:500-594` | Eventos: create/upload/list/get/update/delete/attend/reviews | `EventsController` endpoints em `events.controller.ts:49-363` | OK estatico | Payload e normalizado; `CreateEventRequest` tem `address`/`image`, mas normalizador nao envia e DTO backend nao aceita | Ajustar tipo/UI para nao prometer campos nao persistidos ou adicionar campos ao backend |
| `LocationService.ts:596-740` | Estabelecimentos: create/upload/list/get/owned/update/delete/favorite/reviews | `EstablishmentsController` endpoints em `establishments.controller.ts:47-230` | OK estatico | Payload/query batem com DTOs lidos; upload usa query `target` esperada | Smoke com owner real e storage real |
| `NotificationsService.ts:69-105` | Listar, unread, push tokens, test push, read/read-all/delete | `NotificationsController` endpoints em `notifications.controller.ts:29-100` | OK estatico | Payload de push bate com `RegisterPushTokenDto`; rotas protegidas por JWT | Smoke autenticado |
| `PushRegistrationService.ts:70-74` | `POST /notifications/push-tokens` com `platform`, `deviceToken`, `platformApplicationArn?` | `NotificationsService.registerPushToken` chama SNS em `notifications.service.ts:182-243`; provider comum exige SNS em `common/notification/notification.service.ts:73-92` | Parcial para producao | Se `PUSH_PROVIDER=sns` nao inicializar, ou faltar ARN SNS no app/backend, registro falha com `SNS push is not available` ou ARN required | Fechar `AWS_SNS_REGION`, ARNs backend e `EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_*`; validar em device |
| `SearchService.ts:123-177` | `GET /search/establishments/events/posts/users/autocomplete/global/trending` | `SearchController` endpoints em `search.controller.ts:48-465` | OK estatico | `searchEstablishments` exige latitude/longitude pelo tipo frontend e backend; `global` e protegido por JWT | Smoke com parametros reais; conectar metodos nao usados pela UI se ficarem no release |
| `frontend/src/services/legal/LegalLinks.ts` | `GET /legal/terms-of-use`, `GET /legal/privacy-policy` via `Linking.openURL`; suporte via `mailto:` | `LegalController` em `legal.controller.ts:8-28`; suporte usa env `EXPO_PUBLIC_SUPPORT_EMAIL` apos EXECUCAO-029 | OK estatico | Nao usa `apiClient`; abre URL externa do backend e canal de suporte configurado | Validar DNS/API base e e-mail de suporte real no build |
| `Sem service frontend` | `GET /legal/*.json`, `GET /health`, `POST/GET /media/...` generico | `LegalController`, `HealthController`, `MediaController` | Endpoint existente nao usado | Endpoints existem sem consumo mobile direto | Definir se sao internos/operacionais ou criar consumo real |
| `ApiClient.ts:294-365`, `ApiClient.ts:417-450` | Todas as chamadas REST | Todos os endpoints chamados por services | Parcial | Tratamento de erro e generico: loga status e rethrow; services quase nao traduzem erro por fluxo | Padronizar erro por dominio nos fluxos criticos antes do smoke final |

Ordem exata de correcao desta auditoria:

1. RESOLVIDO no codigo local pela EXECUCAO-005: `AuthService.refreshToken` preserva o bearer de refresh e nao e sobrescrito pelo interceptor de access token.
2. RESOLVIDO no codigo local pela EXECUCAO-004: `UserService.updateProfile` usa `PUT /users/me/profile` e dados de conta foram separados em `updateAccount`.
3. RESOLVIDO no codigo local pela EXECUCAO-006: contrato de post foi alinhado removendo `video` do frontend.
4. Remover fallback fake do catalogo quando nao houver `establishmentId`, porque os endpoints reais de leitura existem.
5. RESOLVIDO no codigo local pela EXECUCAO-027: gestao owner de produtos entra no caminho atual com metodos no service e tela conectada.
6. Decidir se endpoints genericos de media/public-profile/stats/is-following/liked/likes/comment-edit ficam no release; conectar ou declarar fora do escopo.
7. Fechar variaveis SNS/S3/CloudFront/SES e validar upload, push, e-mail e refresh token em smoke mobile real.

### PROMPT-006 - varredura de mock fake placeholder e dados estaticos - 2026-04-30

Prompt recebido:

> Fazer varredura completa no projeto procurando qualquer uso de `mock`, `fake`, `dummy`, `sample`, `placeholder`, `TODO`, `FIXME`, `em breve`, `coming soon`, `hardcoded`, `static data`, `lorem`, `test user`, `test token`, `array fixo` e dados locais simulando API. Para cada ocorrencia, explicar se e aceitavel em producao, qual dado real deve substituir, qual endpoint/service deve ser usado e o risco se for para producao. Entregar lista priorizada por gravidade.

Validacoes executadas nesta rodada:

- Varredura em `frontend/src`, `backend/src`, `backend/prisma`, `backend/test`, `README.md`, `doc`, `.codex`, env examples e configs.
- Exclusoes tecnicas da classificacao de risco de runtime: `.git`, `node_modules`, `dist`, `build`, `.expo`, `.gradle`, `coverage`, package-lock e docs historicos como fonte de runtime.
- Releitura manual dos arquivos com ocorrencias reais de produto: `CatalogScreen`, `PersonalSetupScreen`, `SettingsMyAccountScreen`, `SettingsCityScreen`, `SettingsAuxScreens`, `SettingsPrivacyScreen`, `SettingsSecurityScreen`, `ActivityScreen`, `ActivityFavoritesScreen`, `ActivityHistoryScreen`, `SearchScreen`, `HomeScreen`, `ItemScreen`, `MapScreen` e `auth.service.ts`.
- Separacao entre ocorrencias aceitaveis em producao e ocorrencias que simulam comportamento real.

Resultado priorizado por gravidade:

| Prioridade | Arquivo/linha | Ocorrencia | Aceitavel em producao? | Dado real que deve substituir | Endpoint/service a usar | Risco se for para producao |
|---|---|---|---|---|---|---|
| P0 ate smoke | `frontend/src/screens/main/CatalogScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-002/024: `MOCK_CATALOGS` nao existe no arquivo atual, rota sem `establishmentId` mostra estado honesto e cards so aparecem a partir de `catalogService.getEstablishmentProducts(establishmentId)` | Sim, como estado atual sem mock | Produtos reais do estabelecimento ou estado vazio real | `catalogService.getEstablishmentProducts(establishmentId)` -> `GET /establishments/:id/products`; item real via `GET /products/:id` | Risco remanescente fica em smoke de vitrine real e banco vazio, nao em catalogo fake |
| P0 ate smoke | `frontend/src/screens/main/SettingsMyAccountScreen.tsx`; `frontend/src/services/api/UserService.ts`; `frontend/src/stores/userStore.ts` | RESOLVIDO no codigo local pela EXECUCAO-004: conta inicial fixa, timer e save simulado foram removidos | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Perfil do usuario autenticado, avatar real, email real, bio reais | `userStore.getProfile()`, `UserService.updateAccount()`, `UserService.updateProfile()`, `UserService.uploadAvatar()` | Risco remanescente de producao esta em storage real, smoke de device e alteracao de e-mail/duplicidade |
| P0 ate smoke | `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-004: alert de foto com funcoes vazias foi substituido por picker/upload real | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Imagem escolhida pelo usuario e upload real | `expo-image-picker` + `userService.uploadAvatar()` -> `POST /users/me/avatar` | Se S3/CloudFront nao estiverem validados, avatar pode falhar em producao |
| P0 ate smoke | `frontend/src/screens/auth/PersonalSetupScreen.tsx`; `frontend/src/services/api/UserService.ts`; `backend/src/modules/users/users.controller.ts`; `backend/src/modules/users/users.service.ts` | RESOLVIDO no codigo local pela EXECUCAO-009: onboarding pessoal nao usa mais `setTimeout`, cidade fixa, avatar booleano local ou finalizacao sem persistencia | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Username, bio, cidade/localizacao e avatar reais persistidos; interesses fora do release ate existir backend canonico | `GET /users/username/availability`, `PUT /users/me`, `PUT /users/me/profile`, `POST /users/me/avatar` | Risco remanescente esta em smoke mobile/staging, S3/CloudFront real, permissao de localizacao e decisao futura de preferencias/interesses |
| P0 ate smoke | `frontend/src/screens/main/SettingsCityScreen.tsx`; `frontend/src/stores/userStore.ts`; `frontend/src/services/api/UserService.ts` | RESOLVIDO no codigo local pela EXECUCAO-010: lista de cidades/recentes fixos removidos, GPS usa geolocalizacao real e confirmar persiste `location` | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Cidade real por geolocalizacao/permissao ou entrada manual persistida no perfil | `GeolocationService`; `userStore.updateProfile()` -> `PUT /users/me/profile` | Risco remanescente esta em permissao/GPS de device real, staging e uso da cidade pelos fluxos de descoberta |
| P0 ate smoke | `frontend/src/screens/main/SettingsAuxScreens.tsx`; `frontend/src/screens/main/SettingsSecurityScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-011: dispositivos/historico nao exibem mais `Windows Chrome`, `Android Pixel`, `Sao Paulo, BR`, `Santos, BR` e sairam do menu de seguranca | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Sessoes reais, dispositivos reais e eventos de login/auditoria se o recurso voltar ao escopo | Criar endpoints de sessoes/audit log antes de reexibir; possivel base: `AuditLogService` backend | Risco remanescente: recurso fica fora do caminho visivel ate existir backend real |
| P1 se reexibir | `frontend/src/screens/main/SettingsAuxScreens.tsx`; `frontend/src/screens/main/SettingsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-013: contas vinculadas, raio, preferencias de notificacao e idioma nao ficam no menu visivel e nao exibem opcoes fixas | Sim, se oculto do caminho de producao | Estado real das preferencias e provedores vinculados antes de voltar ao menu | Notificacoes: `notificationsService`; demais exigem endpoints de preferencias | Risco remanescente fica fora da UI visivel; se reexibir sem backend volta a bloquear release |
| P1 se reexibir | `frontend/src/screens/main/SettingsPrivacyScreen.tsx`; `frontend/src/screens/main/SettingsScreen.tsx`; `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO no codigo local pela EXECUCAO-012: privacidade/mensagens/check-ins/bloqueados nao ficam mais em estado local visivel | Sim, se oculto do caminho de producao | Preferencias reais de privacidade e bloqueios do usuario antes de voltar ao menu | Criar endpoints `GET/PUT /users/me/privacy` e bloqueios antes de reexibir | Risco remanescente fica fora da UI visivel; se reexibir sem backend volta a bloquear release |
| P1 se reexibir | `frontend/src/screens/main/SettingsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-013: toggle GPS local, desativar conta por alerta e fallback vazio de toggle foram removidos | Sim, se oculto do caminho de producao | Preferencia real de localizacao e endpoint real de desativacao antes de voltar ao menu | Criar service de preferencias; criar endpoint de deactivate antes de reexibir | Risco remanescente fica fora da UI visivel; se reexibir sem backend volta a bloquear release |
| P0 ate smoke | `frontend/src/screens/main/SettingsSecurityScreen.tsx`; `frontend/src/screens/main/SettingsAuxScreens.tsx` | RESOLVIDO parcialmente no codigo local pela EXECUCAO-011: comentario vazio/mojibake removido, senha/2FA ficam reais e sessoes saem do menu | Parcial; alerta de novo acesso fica informativo/obrigatorio | Preferencias/sessoes reais de seguranca se voltarem ao escopo | `POST /auth/change-password`; 2FA existente; criar endpoints de sessions/audit log antes de reexibir sessoes | Risco remanescente fica em smoke de senha/2FA e escopo futuro de sessoes |
| P1 se reexibir | `frontend/src/screens/main/ActivityScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: cards de pedidos/agendamentos/reservas com `coming_soon` e alerta `Em breve` foram removidos | Sim, se oculto do caminho de producao | Fluxos reais de pedidos, reservas e agendamentos antes de voltar ao hub | Criar endpoints/telas dedicadas antes de reexibir | Risco remanescente fica fora da UI visivel; se reexibir sem backend volta a bloquear release |
| P1 ate smoke | `frontend/src/screens/main/ItemScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-002/023: CTAs genericos (`Agendar`, `Reservar`, `Assinar`, carrinho) e alerta de fluxo fora do MVP nao existem mais no arquivo atual | Sim, como estado atual sem CTA fake | Produto real abre estabelecimento; evento real confirma/cancela presenca via backend | `catalogService.getProduct()`, `locationService.getEvent()`, `locationService.attendEvent()` e `locationService.cancelAttendance()` | Risco remanescente fica em smoke de produto/evento real, nao em botao sem backend |
| P1 se reexibir | `frontend/src/screens/main/SearchScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-015: `RECENT_SEARCHES` fixo exibido como buscas rapidas foi removido | Sim, se fora da UI visivel | Historico real de busca do usuario ou sugestoes editoriais declaradas antes de voltar | Criar endpoint/storage de historico, ou usar `searchService.trending()`/`searchService.autocomplete()` | Risco remanescente fica fora da UI visivel |
| P1 ate smoke | `frontend/src/screens/main/NotificationsScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-016/017: placeholders visiveis removidos e roteamento por entidade/conversa/usuario conectado a rotas reais existentes | Sim para conversa, usuario, estabelecimento, produto e evento | Payloads reais de notificacao em staging | Validar `relatedUserId`, `conversationId` e `entityType/entityId` em smoke | Risco remanescente fica em payload/staging, nao em rota inexistente |
| P1 se reexibir | `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: tela nao informa lacuna/backend nem simula favoritos | Sim, se fora do hub visivel | Lista real de favoritos do usuario antes de voltar ao hub | Criar endpoint de favoritos consolidados ou estender `establishments` para listar favoritos do usuario | Risco remanescente fica fora da UI visivel |
| P1 se reexibir | `frontend/src/screens/main/ActivityHistoryScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-014: tela nao informa lacuna/backend nem simula historico | Sim, se fora do hub visivel | Historico real de buscas, perfis vistos, check-ins e atividades antes de voltar ao hub | Criar modelo/endpoint de historico com retencao definida | Risco remanescente fica fora da UI visivel |
| P2 | `frontend/src/screens/main/HomeScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-020: evento sem data retorna badge `SEM DATA`, nao `EM BREVE` | Aceitavel como estado honesto; smoke pendente | Data real do evento quando disponivel | `searchService.searchEvents()`; backend `GET /search/events` deve retornar `date` confiavel | Risco remanescente: evento cadastrado sem data precisa ser tratado no backend/admin |
| P2 | `backend/src/modules/auth/auth.service.ts` | RESOLVIDO no codigo local pela EXECUCAO-022: comentario `placeholder` da verificacao 2FA foi substituido por descricao do fluxo real | Sim | `setupTwoFactorAuth()` gera secret real, persiste `twoFactorSecret` e `verifyTwoFactorAuth()` valida TOTP com esse valor | `authService.setupTwoFactorAuth()` e `verifyTwoFactorAuth()` | Risco remanescente fica apenas em smoke de 2FA em staging/device |
| P0 ate smoke | `frontend/src/screens/main/MapScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-008: item da lista e marker/callout navegam para evento/estabelecimento | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Navegacao real para evento/estabelecimento | Rotas `Item`/`Profile` com dados carregados por `locationService`/perfil | Risco remanescente fica no smoke de dados reais e permissao/localizacao |
| P3 | `frontend/src/screens/main/CatalogScreen.tsx:125-132` | Categorias por template sao arrays fixos | Aceitavel se forem taxonomia de produto; nao aceitavel se substituirem categorias reais | Categorias derivadas dos produtos reais quando remoto | Ja existe `dynamicCategories` em `CatalogScreen.tsx:220`; manter para `remoteMode` | Baixo risco se usado so como taxonomia visual; risco medio se filtrar catalogo fake |
| Aceitavel | `frontend/src/components/Input.tsx:16-67` e varios inputs em telas auth/settings/search/chat | `placeholder` de campo de formulario | Sim | Nao precisa substituir; e texto auxiliar de input | Nao aplicavel | Sem risco de dado fake; manter |
| Aceitavel | `backend/src/**/*.spec.ts`, `backend/test/**/*.ts` | `mockResolvedValue`, `mockUser`, `Test User`, `test-token` | Sim, em testes | Nao substituir no runtime | Jest/test doubles | Sem risco de producao se specs nao entram no build/runtime |
| Aceitavel | `doc/**/*.md`, `.codex/**/*.md` | `mockup`, `placeholder`, `TODO` e orientacoes de roadmap | Sim como documentacao, desde que nao seja tratado como codigo pronto | Nao aplicavel | Nao aplicavel | Risco so se doc antiga for usada como verdade contra codigo real; manter `doc/99_HISTORICO` fora da decisao atual |
| Aceitavel | `backend/src/common/observability/observability.bootstrap.ts:121-130` e env examples | `SENTRY_TRACES_SAMPLE_RATE` | Sim como nome de variavel de sampling | Nao substituir | Observability bootstrap | Sem relacao com dados fake de produto |
| Aceitavel | `frontend/src/screens/main/ChatScreen.tsx:279-300`, `SearchScreen.tsx:156-160`, `SplashScreen.tsx:44` | `setTimeout` para debounce/timer de UX | Sim quando usado como debounce/timer, nao como API simulada | Nao aplicavel | Nao aplicavel | Baixo; nao simula producao |

Ocorrencias procuradas e classificadas como nao problematica:

- `placeholder` em inputs de e-mail, senha, cidade, busca, comentario, chat e 2FA: aceitavel porque e texto auxiliar de campo.
- `mock` em arquivos `.spec.ts` e `backend/test`: aceitavel porque sao testes unitarios/e2e.
- `sample` em package-lock e documentacao AWS baixada: aceitavel e nao pertence ao runtime do app.
- `TODO` em documentacao historica e instrucoes `.codex`: nao e runtime; serve como backlog/documentacao.
- `hardcoded` em documentacao de deploy: aceitavel como regra de seguranca, nao como dado hardcoded no app.

Ordem de correcao desta auditoria:

1. RESOLVIDO no codigo local pela EXECUCAO-002/024: `MOCK_CATALOGS` foi removido do caminho de producao; sem `establishmentId`, a tela mostra estado vazio/erro de rota invalida em vez de catalogo local.
2. RESOLVIDO no codigo local pela EXECUCAO-004: `SettingsMyAccountScreen` usa `userStore.getProfile`, `PUT /users/me`, `PUT /users/me/profile` e `POST /users/me/avatar`; timers e dados de Joao foram removidos.
3. RESOLVIDO no codigo local pela EXECUCAO-009: `PersonalSetupScreen` persiste username, bio, cidade/localizacao e avatar; interesses ficaram fora do release por ausencia de backend canonico.
4. RESOLVIDO no codigo local pela EXECUCAO-010: `SettingsCityScreen` usa geolocalizacao real e persiste cidade em `PUT /users/me/profile`; smoke mobile/staging pendente.
5. RESOLVIDO parcialmente no codigo local pela EXECUCAO-011 e EXECUCAO-012: alterar senha foi implementado; dispositivos/historico, privacidade e bloqueados foram retirados do caminho visivel ou deixaram de exibir dados inventados. Ainda falta ocultar ou implementar notificacoes, idioma e raio sem contrato real.
6. RESOLVIDO no codigo local pela EXECUCAO-014 e EXECUCAO-023 para o caminho visivel: cards de pedidos/agendamentos/reservas sairam de Activity e `ItemScreen` nao exibe CTAs genericos de assinatura/carrinho/agendamento/reserva sem backend real.
7. RESOLVIDO no codigo local pela EXECUCAO-015: `RECENT_SEARCHES` foi removido da UI.
8. RESOLVIDO no codigo local pela EXECUCAO-016/017: `NotificationsScreen` nao exibe placeholders visuais e nao perde params de conversa/usuario/entidade.
9. RESOLVIDO no codigo local pela EXECUCAO-022: comentario `placeholder` no 2FA backend foi corrigido para refletir que o secret vem de `user.twoFactorSecret`.

### PROMPT-007 - checklist objetivo para producao e deploy - 2026-04-30

Prompt recebido:

> Com base no README.md e no codigo real, gerar checklist objetivo para deixar o projeto pronto para producao e deploy. Separar por Backend, Frontend mobile, Banco de dados, Redis/cache/realtime, Upload/midia/S3/CloudFront, E-mail SES, Push SNS/APNs/FCM, Seguranca, Observabilidade, AWS/ECS/RDS/ElastiCache, Testes, Smoke mobile manual, Build final e Release. Para cada item informar status atual, como validar, comando ou teste necessario, criterio para considerar pronto e se bloqueia deploy.

Evidencias base:

- `README.md:4` declara que a baseline tecnica local e forte, mas deploy AWS real e smoke mobile manual seguem pendentes.
- `README.md:615-627` declara que o projeto ainda nao deve ser marcado como pronto para deploy publico real e lista pendencias de observabilidade AWS, AWS real ponta a ponta, migrations no banco alvo, SES, SNS/APNs/FCM, Redis externo, smoke mobile e build de imagem.
- `backend/package.json:6-23` contem scripts `build`, `deploy:prepare`, `test`, `test:e2e`, `prisma:migrate:prod`.
- `frontend/package.json:5-18` contem scripts Expo/Android, teste e lint; nao ha script `typecheck` nem script de build release/EAS.
- `backend/src/config/env.validation.ts:75-160` exige core env, Redis em producao, CORS/PORT e valida providers S3/SES/SNS quando habilitados.
- `backend/Dockerfile` cria imagem multi-stage runtime com `NODE_ENV=production`, healthcheck em `/health` e comando `npm run start:prod`.
- `frontend/app.json` configura package/bundle id e permissoes sem `googleServicesFile`; Firebase/Render nao fazem parte da arquitetura-alvo.
- `frontend/.env` aponta `EXPO_PUBLIC_API_URL=http://localhost:3001`, inadequado para build de producao.

Checklist por area:

#### 1. Backend

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Build NestJS | Implementado; README registra OK anterior | Reexecutar build no checkout atual | `cd backend && npm run build` | Compila sem erro e gera `dist/main.js` | Sim |
| Runtime prod | Parcial | Subir com `NODE_ENV=production` e env real | `cd backend && npm run start:prod` apos build, ou container runtime | API sobe, `/health` responde 200, sem fallback local indevido | Sim |
| Env validation | Implementado com ressalvas | Rodar app com env de producao completo e incompleto | `cd backend && $env:NODE_ENV='production'; npm run start:prod` | Falha quando falta env obrigatoria e sobe quando env real esta completa | Sim |
| CORS/trust proxy | Implementado; precisa env real | Validar origem mobile/API e ALB | Request real a partir do app e `CORS_ORIGIN` final | So origens permitidas passam; `CORS_ORIGIN` nao e `*`; `TRUST_PROXY` correto para ALB | Sim |
| Swagger em producao | Parcial | Checar `ENABLE_SWAGGER` | `curl https://api.../api/docs` | Docs desabilitada ou protegida em producao publica | Nao, se API nao expuser dados sensiveis; recomendado bloquear |
| Endpoints REST principais | Parcial por gaps de mocks/contratos | Rodar e2e + smoke manual | `cd backend && npm run test:e2e` | Auth, feed, search, users, establishments, products, chat, notifications passam | Sim |

#### 2. Frontend mobile

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| TypeScript mobile | README registra OK anterior; script nao existe no package | Rodar tsc direto | `cd frontend && npx tsc --noEmit` | Zero erro de tipo | Sim |
| Lint mobile | Script existe | Rodar lint | `cd frontend && npm run lint` | Zero erro; warnings aceitaveis documentados | Sim |
| API URL producao | Codigo OK pela EXECUCAO-025; valor real pendente | Conferir env do build | Build com `EXPO_PUBLIC_API_URL=https://...` e smoke release | Build nao aponta `localhost`; API resolve via HTTPS real; release falha cedo se env faltar | Sim |
| Remocao de mocks bloqueantes | Parcial | Validar itens PROMPT-006 | Varredura + smoke das telas | Catalogo, minha conta, onboarding pessoal e cidade ja resolvidos no codigo local; settings restantes/activity ainda nao podem simular producao | Sim |
| Config de push mobile | Parcial; registro automatico protegido pela EXECUCAO-026 | Conferir estrategia SNS + FCM/APNs e env SNS | Build/device com `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true` somente quando push real estiver validado | Android gera token FCM e iOS gera token APNs; backend registra no SNS, ou push fica declarado fora do MVP com flag desligada | Sim para push no release |
| Deep links/notificacao para telas | Pendente/parcial | Abrir app por notificacao/link | Smoke manual com push real | Notificacao abre entidade correta ou comportamento fora do escopo declarado | Nao para MVP sem deep link; Sim se push exigir roteamento |

#### 3. Banco de dados

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Prisma Client | Implementado | Gerar client no ambiente alvo | `cd backend && npm run prisma:generate` | Generate sem erro | Sim |
| Migrations no banco alvo | Pendente no README | Aplicar em RDS/staging real | `cd backend && npm run prisma:migrate:prod` com `DATABASE_URL` alvo | Todas migrations aplicadas; sem drift | Sim |
| Conectividade RDS | Pendente | Testar `DATABASE_URL` real | Start backend + health/e2e | Backend conecta sem erro e executa queries | Sim |
| Seed de producao | Nao definido | Decidir se necessario | `cd backend && npm run prisma:seed` apenas se aprovado | Nao existem dados demo indevidos; seeds essenciais documentadas | Nao, salvo se app depender de taxonomia inicial |
| Backup/retencao | Pendente AWS | Verificar RDS | Console/IaC AWS | Backups, retention e restore test documentados | Sim para producao publica |

#### 4. Redis/cache/realtime

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Redis obrigatorio em producao | Implementado na env validation | Subir sem Redis em prod | `NODE_ENV=production ENABLE_REDIS=false npm run start:prod` | App falha quando Redis esta desligado em prod | Sim |
| ElastiCache/Redis externo | Pendente no README | Testar `REDIS_URL` real | `redis-cli -u <REDIS_URL> ping` e start backend | `PONG`, cache conectado, sem fallback memory em prod | Sim |
| Socket.IO Redis adapter | Implementado; precisa runtime real | Validar duas instancias ou pelo menos conexao adapter | Logs `RedisIoAdapter` + smoke chat | WebSocket autentica e mensagens funcionam com Redis | Sim para multi-instancia/chat |
| Rate limit distribuido | Implementado | Testar throttling via Redis | Requests repetidos contra endpoint protegido | Limite aplicado de forma consistente entre instancias | Sim para producao publica |
| Cache health | Implementado parcialmente | Verificar status/logs | `GET /health` e logs estruturados | Health/log mostra Redis ativo em prod | Sim |

#### 5. Upload/midia/S3/CloudFront

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Provider S3 | Codigo OK pela EXECUCAO-021; `.env.example` segue dev/local | Subir prod com `STORAGE_PROVIDER=s3` | Start backend com env S3 real | Upload usa S3, nao storage local/none | Sim |
| Credenciais e bucket | Pendente AWS real | Testar upload real | Smoke avatar/post/evento/estabelecimento/produto | Objeto aparece no bucket correto, com MIME/tamanho validado | Sim |
| CloudFront | Codigo OK pela EXECUCAO-021; CDN real pendente | Abrir URL publica CDN | Upload + abrir `CLOUDFRONT_BASE_URL/...` | Midia publica carrega via CloudFront e nao expira indevidamente | Sim |
| Multipart mobile | Implementado em services | Smoke mobile | Upload avatar, post media, estabelecimento media | Upload mostra progresso/resultado e persiste URL | Sim |
| Permissoes mobile camera/galeria | Parcial | Testar em Android/iOS | Smoke em dispositivo | Permissoes solicitadas e negadas/tratadas corretamente | Sim para upload no release |

#### 6. E-mail SES

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Provider SES | Codigo OK pela EXECUCAO-021; identidade/envio real pendentes | Subir com `EMAIL_PROVIDER=ses` | Start backend com `AWS_SES_REGION` e `AWS_SES_FROM_EMAIL` | App sobe e envia por SES | Sim para cadastro/verificacao/reset real |
| Identidade remetente | Pendente no README | Validar SES identity | Console/AWS CLI SES | Dominio/remetente verificado e fora de sandbox quando necessario | Sim |
| Reset de senha | Implementado; precisa SES real | Solicitar reset no app | Smoke auth | E-mail chega, token funciona, senha altera | Sim |
| Verificacao de e-mail | Implementado; precisa SES real | Cadastro + resend/verify | Smoke auth | Usuario recebe codigo/link e fica verificado | Sim se emailVerified for requisito |
| Falha de SES | Parcial | Simular erro SES | Teste backend/service | Erro controlado, sem 500 generico e sem vazar token | Sim |

#### 7. Push SNS/APNs/FCM

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Backend SNS | Codigo OK pela EXECUCAO-021; device/push real pendente | Subir com `PUSH_PROVIDER=sns` | Start backend com `AWS_SNS_REGION` e ARN generico ou Android | Registro de token cria endpoint SNS | Sim para push real |
| Push Android via SNS + FCM | Pendente; registro automatico desligado por default pela EXECUCAO-026 | Validar FCM como transporte Android e AWS SNS como orquestrador oficial | Build Android/device com `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true` somente apos SNS Platform Application/FCM configurados | Device Android registra token FCM, backend salva token e SNS entrega push real; se nao entrar no MVP, flag permanece desligada | Sim se push Android entrar no release |
| APNs iOS | Pendente | Validar credencial APNs/SNS iOS | Build iOS/device | Device iOS registra token e recebe push | Sim para iOS push |
| Env mobile de platform ARN | Pendente para push real; nao usado se flag desligada | Conferir env build | `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true` + `EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID/IOS` se app enviar ARN | App envia ARN correto ou backend resolve por env | Sim para push real |
| Test push | Endpoint existe | Chamar endpoint autenticado | `POST /notifications/push-test` via app/curl | Push chega no device e entrega fica registrada | Sim para release com push |

#### 8. Seguranca

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Secrets fortes | Pendente ambiente real | Revisar Secrets Manager/SSM/env | Checagem manual/IaC | Sem secrets default/local em ECS ou app build | Sim |
| JWT/refresh | Implementado com gap no refresh mobile PROMPT-005 | Testar login/refresh expiracao | Smoke auth + teste 401 refresh | Refresh usa refresh token correto e nao derruba sessao indevidamente | Sim |
| Ownership guards | Implementado | Testar acesso cruzado | e2e de owner/non-owner | Usuario nao altera recurso de outro | Sim |
| Delete account com senha | OK no codigo local; pendente smoke | Testar exclusao | Smoke settings + teste backend | Backend valida senha, bloqueia senha incorreta e revoga refresh tokens | Sim ate smoke |
| Privacidade/settings | Pendente PROMPT-006 | Smoke settings | Testar switches/telas | Tela nao promete privacidade nao aplicada | Sim se telas ficarem no release |
| Swagger/public docs | Parcial | Verificar prod | `curl /api/docs` | Desabilitado/protegido em prod publica | Nao, mas recomendado |
| Logs sensiveis | RESOLVIDO no codigo local pela EXECUCAO-030; smoke/CloudWatch pendente | Revisar logs em auth/email/push | Testes de `logStructured` e smoke com falha auth/email | Tokens/senhas nao aparecem em logs | Sim ate smoke/CloudWatch |

#### 9. Observabilidade

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Logs estruturados | Implementado com redacao central pela EXECUCAO-030 | Gerar requests e erros | `GET /health`, login invalido, endpoint 404, teste unitario de redacao | Logs com requestId/status sem senha/token/secret | Sim ate CloudWatch/smoke |
| CloudWatch | Pendente no README | Ver logs em log group real | Deploy ECS + CloudWatch Logs | Logs chegam com retention definida | Sim |
| X-Ray | Preparado por env | Ativar e ver trace | `AWS_XRAY_ENABLED=true` no ambiente alvo | Trace aparece para requests principais ou decisao de nao usar documentada | Nao, se CloudWatch supre MVP |
| Alarmes/runbook | Pendente AWS | Conferir alarmes | Console/IaC | Alarmes para 5xx, CPU/mem, RDS, Redis e ALB | Sim para producao publica |
| Health ALB | Implementado `/health` | Validar target group | ALB health check | Targets ficam healthy | Sim |

#### 10. AWS/ECS/RDS/ElastiCache

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Imagem Docker backend | Dockerfile existe; README pede revalidar host/runner com memoria estavel | Build local/CI | `cd backend && docker build -t meu-agito-backend:prod .` | Build conclui e imagem sobe | Sim |
| ECR | Pendente | Push imagem | `aws ecr get-login-password ...` + `docker push` | Imagem versionada no ECR | Sim |
| ECS Fargate service | Pendente | Deploy task/service | AWS CLI/IaC | Task fica RUNNING e healthy no ALB | Sim |
| RDS PostgreSQL | Pendente | Conectar e migrar | `npm run prisma:migrate:prod` com `DATABASE_URL` RDS | Banco migrado e app conecta | Sim |
| ElastiCache | Pendente | Ping e runtime | `redis-cli -u <REDIS_URL> ping` | Redis externo ativo no backend | Sim |
| ALB/HTTPS/ACM | Pendente | Acessar API HTTPS | `curl https://api.../health` | HTTPS valido e WebSocket suportado | Sim |
| Secrets Manager/SSM | Pendente | Conferir task definition | AWS console/CLI | Task nao carrega secrets hardcoded | Sim |
| IaC/CloudFormation | Direcao declarada; nao confirmado | Revisar templates | `aws cloudformation validate-template` se houver template | Stack reproduzivel ou decisao manual documentada | Nao para MVP interno; Sim para producao profissional |

#### 11. Testes

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Backend unit | README registra OK anterior | Reexecutar | `cd backend && npm test -- --runInBand` | Todas suites passam | Sim |
| Backend e2e | Script existe e aplica migrations no DB teste | Subir postgres-test e rodar | `docker compose up -d postgres-test redis`; `cd backend && npm run test:e2e` | E2E passa contra DB teste limpo | Sim |
| Frontend lint | Script existe | Rodar | `cd frontend && npm run lint` | Zero erro | Sim |
| Frontend typecheck | Script nao existe, mas tsconfig existe | Rodar direto | `cd frontend && npx tsc --noEmit` | Zero erro | Sim |
| Frontend tests | Script existe | Rodar | `cd frontend && npm test -- --runInBand` | Testes passam ou ausencia de testes fica registrada como gap | Sim se testes existem; caso contrario gap P1 |
| Contratos API/mobile | Parcial | Smoke + testes services | Testes especificos ou chamada manual | Payloads batem com DTOs corrigidos | Sim |

#### 12. Smoke mobile manual

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Android build/run | Script existe | Rodar em device/emulador | `cd frontend && npm run android` | App instala, abre e nao crasha | Sim |
| Auth | Pendente smoke final | Cadastro/login/logout/refresh/reset/email/2FA | Smoke manual | Fluxo completo funciona sem mock e sem 500 | Sim |
| Feed/social | Pendente smoke final | Criar post, upload, like, comentar, feed/agito | Smoke manual | Dados persistem e aparecem apos refresh | Sim |
| Busca/home/mapa | Pendente smoke final | Buscar, filtros, mapa, abrir item/perfil | Smoke manual | Sem card clicavel morto ou dado fake | Sim |
| Perfil/catalogo/item | Pendente smoke final | Perfil estabelecimento, catalogo, produto, evento | Smoke manual | Carrega backend real; sem `MOCK_CATALOGS` em producao | Sim |
| Chat/realtime | Pendente smoke final | Duas contas/dispositivos | Smoke manual | Mensagem e unread chegam; socket reconecta | Sim |
| Notificacoes/push | Pendente smoke final | Registrar token, push-test, abrir notificacao | Smoke manual | Push chega e in-app atualiza | Sim se push no release |
| Settings criticas | Parcial | Minha conta, delete, cidade, senha e privacidade oculta resolvidos no codigo local; demais preferencias ainda pendentes | Smoke manual | Nada simula persistencia falsa | Sim |

#### 13. Build final

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Backend artifact | Parcial | Build + container | `cd backend && npm run deploy:prepare`; `docker build ...` | Build/migrations/generate passam e imagem roda | Sim |
| Mobile release config | Pendente | Conferir build profile | `Test-Path frontend/eas.json`; revisar `app.json` | Existe perfil release/prod com env correta | Sim |
| Android release | Pendente | Gerar APK/AAB | `cd frontend && npx eas build -p android --profile production` ou pipeline definido | Artefato assinado gerado | Sim |
| iOS release | Pendente | Gerar build iOS | `cd frontend && npx eas build -p ios --profile production` ou pipeline definido | Artefato assinado/TestFlight gerado | Sim se iOS no release |
| Assets/app identity | Parcial | Conferir icon/splash/package/bundle | Revisao `frontend/app.json` | Nome, slug, package, bundle id e assets finais corretos | Sim |
| Env final mobile | Pendente | Inspecionar build | Build logs/env | `EXPO_PUBLIC_API_URL` e ARNs apontam producao | Sim |

#### 14. Release

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Go/no-go tecnico | Pendente | Revisar checklist completo | Marcar todos itens bloqueantes | Nenhum item `Bloqueia deploy=Sim` pendente | Sim |
| Versao e changelog | Pendente | Conferir versionamento | Revisar `frontend/app.json`, package versions e release notes | Versao unica, notas de release e escopo MVP claros | Sim |
| Rollback | Pendente | Documentar rollback backend/mobile | Runbook | Imagem anterior, migration strategy e rollback app documentados | Sim |
| Monitoramento pos-release | Pendente | Plano de acompanhamento | CloudWatch dashboards/alarmes | Responsavel e janelas de observacao definidos | Sim |
| Dados/termos/suporte | Parcial | Conferir legal e suporte | Abrir termos, privacidade, email suporte | Links legais e suporte funcionam em producao | Sim |
| Decisao final | README bloqueia deploy publico real hoje | Reavaliar depois das correcoes | Checklist + smoke + AWS real | Estado muda de "nao pronto" para "aprovado para release" com evidencias | Sim |

### PROMPT-008 - refinamento de deploy real, rollback, staging e decisoes sem backend - 2026-04-30

Objetivo deste complemento:

- Refinar o plano de producao sem apagar auditorias anteriores.
- Evitar remocoes precipitadas de telas, botoes e fluxos que podem virar backend real.
- Reforcar que producao publica so pode ser liberada depois de staging AWS real aprovado.
- Registrar que banco de producao pode subir zerado, desde que o app trate estados vazios sem mock/fake.
- Criar criterios objetivos de rollback, LGPD, build mobile real e priorizacao.

#### Regra de prioridade revisada

| Prioridade | Definicao | Regra obrigatoria |
|---|---|---|
| P0 | Bloqueia producao real | Qualquer item visivel ao usuario em producao com mock, fake, botao sem acao, dado fixo fingindo ser real, fallback falso, fluxo critico quebrado, env/provedor real ausente ou risco de seguranca. |
| P1 | Bloqueia qualidade/release profissional | Item nao essencial ao primeiro uso, mas que gera experiencia incompleta, suporte ruim, baixa confianca, ausencia de smoke, observabilidade fraca ou decisao de escopo ainda nao registrada. |
| P2 | Melhoria pos-MVP | Otimizacao, refinamento ou capacidade adicional que nao aparece como falso funcional para o usuario e nao compromete seguranca, deploy, dados reais ou suporte. |

Regra absoluta: nao marcar como P2 qualquer item que apareca para o usuario em producao com mock, fake, botao sem acao, alerta "em breve", tela fake, dado fixo fingindo ser real, configuracao apenas local ou fallback falso quando deveria usar backend.

#### Plano de rollback

| Item | Risco | Como validar antes | Como voltar | Responsavel/acao necessaria | Bloqueia producao? |
|---|---|---|---|---|---|
| Backend/API | Deploy introduzir 5xx, quebra auth, quebra DTO/contrato mobile ou falha de healthcheck | Smoke staging e producao canary: `/health`, auth, feed, busca, profile, upload, chat, notificacoes | Reapontar ECS service para task definition anterior ou imagem ECR anterior; manter tag imutavel por release | DevOps/backend deve registrar task definition anterior, imagem anterior e comandos de rollback antes do deploy | Sim |
| Imagem Docker/ECR | Imagem buildada com env incorreta, Prisma Client errado, dependencias faltando ou regressao runtime | `docker build`, container local/staging, `npm run build`, healthcheck e logs sem erro | Promover tag ECR anterior e forcar novo deploy ECS com digest/tag anterior | DevOps deve manter tags versionadas e nunca sobrescrever `latest` como unica referencia | Sim |
| ECS/Fargate | Task nao sobe, target group unhealthy, CPU/mem insuficiente ou security group incorreto | Deploy em staging com ALB healthcheck, CloudWatch Logs e teste de websocket/chat | Rollback para task definition anterior, desired count anterior e security groups/subnets anteriores | DevOps deve salvar task definition, service config e variaveis efetivas antes da troca | Sim |
| Migrations problematicas | Migration destrutiva, lock longo, schema incompativel com app ou dados reais afetados | Backup/snapshot RDS, `prisma migrate status`, aplicar em staging com copia realista e smoke apos migration | Restaurar snapshot/PITR ou aplicar migration reversa previamente preparada; se for destrutiva, rollback pode exigir restore | Backend/DBA deve classificar migration como reversivel ou nao, preparar backup e janela de manutencao | Sim |
| App mobile | APK/AAB com API URL errada, permissao faltando, crash no startup, login quebrado ou release sem rollback rapido nas lojas | Build release em device real, smoke contra staging e verificacao de env embutida | Publicar build anterior na loja/canal interno; para Android, manter APK/AAB anterior; para iOS, reverter versao/TestFlight quando aplicavel | Mobile/release deve manter artefatos assinados anteriores e versionamento claro | Sim |
| Variaveis de ambiente | Env ausente ou errada causar provider desligado, URL localhost em producao, CORS incorreto ou segredo invalido | Checklist de env por ambiente, diff entre staging/prod sem expor valores, start backend com env final | Restaurar versao anterior de task definition/SSM/Secrets e redeploy ECS | DevOps/backend deve versionar nomes de env, nao valores, e registrar alteracoes por release | Sim |
| Secrets | Rotacao errada quebrar JWT, DB, SES, SNS, S3 ou expor segredo no repositorio/log | Validar leitura via ECS task role/Secrets Manager, login, refresh, upload, email e push | Restaurar versao anterior do secret se seguro; se houve vazamento, rotacionar e invalidar credencial | DevOps/security deve manter secrets fora do Git e plano de rotacao documentado | Sim |
| Dominio/ALB/CloudFront | DNS/ACM/ALB/CloudFront apontar para alvo errado, HTTPS invalido, cache servindo versao antiga ou websocket quebrado | `curl https://api.../health`, validacao certificado, CloudFront invalidation quando aplicavel, teste websocket | Reverter DNS/ALB listener/origin/distribution config para versao anterior e invalidar cache | DevOps deve registrar config anterior e TTL DNS antes da mudanca | Sim |

#### Seeds e dados iniciais

Decisao registrada: o sistema pode subir zerado em producao. Nao e obrigatorio criar seed de usuarios, estabelecimentos, produtos, eventos ou posts para producao, porque as contas reais serao criadas manualmente depois.

O que continua obrigatorio validar:

| Validacao | Criterio de pronto | Bloqueia producao? |
|---|---|---|
| Banco vazio | App abre, login/cadastro funcionam e nenhuma tela quebra por lista vazia | Sim |
| Home/feed vazio | Feed vazio mostra estado vazio real, sem post mockado ou dado fake | Sim |
| Busca vazia | Busca sem resultado mostra empty state real, sem sugestao fake fingindo backend | Sim |
| Catalogo vazio | Catalogo sem produtos/eventos nao exibe produto falso | Sim |
| Mapa vazio | Mapa/lista vazia nao quebra e nao mostra pins falsos | Sim |
| Onboarding usuario | Permite criar usuario real sem depender de seed | Sim |
| Onboarding empresarial | Permite criar estabelecimento real sem depender de seed | Sim |
| Dependencia de seed | Nenhum fluxo essencial exige registro pre-criado para o app funcionar | Sim |
| Smoke com DB limpo | Rodar cadastro -> onboarding -> home -> busca -> perfil -> settings em banco limpo | Sim |

Correcao necessaria quando falhar: remover dependencia de seed do fluxo, criar estado vazio real, conectar endpoint real ou retirar a tela/entrada do release por decisao consciente de escopo. Nunca substituir por mock.

#### LGPD, termos, suporte e consentimentos

| Item | Status atual | Evidencia/validacao necessaria | Classificacao | Bloqueia producao? |
|---|---|---|---|---|
| Politica de privacidade | Parcial; aceite persistido no cadastro pela EXECUCAO-028 | Backend legal existe em `backend/src/modules/legal`; signup grava `privacyPolicyAcceptedAt` e `privacyPolicyVersion`; falta validar conteudo final juridico, link mobile e smoke | Parcial | Sim |
| Termos de uso | Parcial; aceite persistido no cadastro pela EXECUCAO-028 | Backend legal existe; signup exige `termsAccepted=true` e grava `termsAcceptedAt`/`termsVersion`; falta validar versao exibida e smoke | Parcial | Sim |
| Exclusao de conta | OK no codigo local; pendente smoke/LGPD final | Tela envia senha; backend valida senha e revoga refresh tokens; falta validar device/staging e politica de retencao/anonimizacao | Parcial ate smoke/legal final | Sim |
| Suporte/contato | Parcial; env obrigatoria/configuravel pela EXECUCAO-029 | Backend legal usa `SUPPORT_EMAIL`; mobile usa `EXPO_PUBLIC_SUPPORT_EMAIL`; falta validar dominio/canal monitorado e smoke de abertura | Parcial ate smoke/canal real | Sim |
| Consentimento de localizacao | Parcial | App pede permissao nativa; validar texto, negacao de permissao e uso sem crash | Parcial | Sim |
| Consentimento de push | Pendente/parcial | Definir push Android via SNS + FCM, pedir permissao no momento correto e registrar token real se push entrar no release | Pendente | Sim se push no release |
| E-mail transacional | Parcial | SES preparado, mas precisa envio real em staging/producao para verificacao/reset/suporte | Parcial | Sim |
| Tratamento de dados pessoais | Pendente | Mapear dados coletados, finalidade, retencao, exclusao e acesso; registrar no plano legal | Pendente | Sim |
| Logs sem dados sensiveis | RESOLVIDO no codigo local pela EXECUCAO-030; CloudWatch/smoke pendente | `logStructured` sanitiza chaves sensiveis, bearer token e padroes `token=`/`password=`; `AuditLogService` ja sanitizava `changes` | Parcial ate smoke/CloudWatch | Sim |
| Consentimento/versionamento | RESOLVIDO no codigo local pela EXECUCAO-028; smoke pendente | `User` ganhou `termsAcceptedAt`, `termsVersion`, `privacyPolicyAcceptedAt`, `privacyPolicyVersion`; `SignUpDto` exige aceite explicito | Parcial ate migration/smoke | Sim para release publico |

#### Build mobile real de release

| Item | Status atual | Como validar | Criterio de pronto | Bloqueia producao? |
|---|---|---|---|---|
| Processo de build | Pendente | Confirmar EAS Build ou processo equivalente documentado | Existe pipeline/comando reproduzivel para release | Sim |
| APK/AAB Android | Pendente | `cd frontend && npx eas build -p android --profile production` ou processo equivalente | AAB/APK assinado gerado e instalado/testado | Sim |
| Package/bundle | Parcial | Revisar `frontend/app.json` | `android.package` e `ios.bundleIdentifier` finais e sem conflito | Sim |
| Icones/splash | Parcial | Instalar release em device e conferir assets | Icone/splash finais aparecem corretamente | Sim |
| Permissoes Android | Parcial | Revisar manifesto/build e testar negacao/permissao | Somente permissoes necessarias e textos corretos | Sim |
| Push Android | Pendente; registro automatico desligado por default pela EXECUCAO-026 | Projeto decidiu nao usar Firebase como backend, mas Android precisa FCM como transporte tecnico para push nativo; validar SNS + FCM ou retirar push do release | Token FCM e entrega via SNS funcionam em device real, ou push fica fora do MVP com `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION` desligado | Sim se push no release |
| Estrategia iOS | Pendente | Implementar build iOS ou declarar Android-only no primeiro release | Decisao documentada; se iOS entrar, build/TestFlight passa | Sim se iOS no release |
| Variaveis no build | Pendente | Conferir env embutida nos logs/build | Sem `localhost`; API URL e flags apontam para staging/producao corretos | Sim |
| API URL real | Pendente | Abrir app release e interceptar/observar chamadas | App chama backend real/staging via HTTPS | Sim |
| Device real | Pendente | Smoke em aparelho fisico | Login, onboarding, feed, busca, perfil, settings e upload sem crash | Sim |

#### Staging AWS real antes de producao

Regra: producao publica so pode ser liberada depois de staging AWS real passar com evidencias.

| Item staging | Validacao obrigatoria | Criterio para liberar producao | Bloqueia producao? |
|---|---|---|---|
| RDS | Criar banco staging, aplicar migrations, conectar backend | Migrations aplicadas e app opera com DB limpo | Sim |
| Redis/Valkey | Backend conecta e usa cache/realtime/rate limit conforme config | `PING` e runtime sem fallback indevido | Sim |
| S3 | Upload real e URL assinada/publica conforme regra | Midia sobe, persiste e carrega no app | Sim |
| CloudFront | Distribuicao/origin/cache validado para midia | URL final carrega assets sem expor bucket indevido | Sim |
| SES | Envio transacional real validado | Email chega e bounce/log tratado | Sim |
| SNS/APNs/push | Provider final validado ou push removido do escopo | Push chega em device ou decisao sem push registrada | Sim se push no release |
| ALB/HTTPS | `/health` e endpoints via HTTPS | Certificado valido, target healthy e CORS correto | Sim |
| ECS/Fargate | Task sobe com imagem ECR versionada | Service estavel, logs sem erro e deploy reproduzivel | Sim |
| Secrets | Task usa Secrets Manager/SSM sem segredo no Git | Secrets lidos em runtime e sem vazamento em logs | Sim |
| Logs | CloudWatch recebe logs estruturados | requestId/status/erro visiveis sem sensiveis | Sim |
| Healthcheck | ALB health e endpoint `/health` | Target group healthy por janela definida | Sim |
| Migrations | Aplicadas antes/depois conforme estrategia | Sem drift em `prisma migrate status` | Sim |
| App mobile staging | Build aponta para staging | Smoke mobile chama staging, nao local/prod | Sim |
| Smoke manual | Checklist mobile/backend executado | Fluxos P0 aprovados com evidencias | Sim |

#### Regra para telas, botoes e fluxos sem backend

Nao remover nem ocultar automaticamente qualquer item sem conexao com backend.

Antes de decidir, analisar obrigatoriamente:

1. Qual acao o usuario espera executar?
2. Esse item pertence ao MVP/release atual?
3. Existe endpoint backend compativel?
4. Existe model Prisma compativel?
5. Existe service frontend parcial?
6. O contrato frontend/backend esta errado ou ausente?
7. A criacao do backend e simples, media ou grande?
8. Esse item bloqueia producao?

Decisao permitida para cada item:

1. Conectar ao backend existente.
2. Corrigir contrato frontend/backend.
3. Criar backend novo e conectar.
4. Criar model/migration/DTO/controller/service e conectar frontend.
5. Manter fora do release por decisao consciente de escopo.
6. Ocultar temporariamente da UI de producao, mantendo registro no plano.
7. Remover apenas se for duplicado, lixo real ou item sem funcao de produto.

Regra absoluta de release: nunca deixar em producao mock, botao sem acao, alerta "em breve", tela fake, dado fixo fingindo ser real, configuracao que altera apenas estado local ou fallback falso quando deveria usar backend.

#### Sem backend: decisao por item

| Arquivo | Tela/Acao | Intencao do usuario | Existe endpoint? | Existe model Prisma? | Pertence ao MVP? | Decisao | Correcao necessaria | Prioridade |
|---|---|---|---|---|---|---|---|---|
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Setup pessoal, username/localizacao/avatar/bio; interesses fora do release | Concluir perfil real apos cadastro | Sim para username, perfil e avatar: `GET /users/username/availability`, `PUT /users/me`, `PUT /users/me/profile`, `POST /users/me/avatar`; nao existe endpoint canonico de interesses | Sim via User/Profile e media; nao existe model canonico de interesses/preferencias | Sim | Conectar backend existente - RESOLVIDO no codigo local pela EXECUCAO-009; manter interesses fora do release | Smoke mobile/staging, DB vazio, username duplicado/invalido, upload avatar e permissao de localizacao | P0 ate smoke |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Editar dados da conta/avatar | Atualizar conta real e midia | Sim: `PUT /users/me`, `PUT /users/me/profile`, `POST /users/me/avatar` | Sim para usuario; midia depende Media/S3 | Sim | Conectar ao backend existente - RESOLVIDO no codigo local pela EXECUCAO-004 | Smoke mobile/staging, S3/CloudFront, erro de duplicidade e alteracao de e-mail | P0 ate smoke |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Alterar cidade/preferencia | Salvar cidade real usada em home/busca | Sim: `PUT /users/me/profile` com `location` | Sim via User/Profile | Sim se cidade afeta descoberta | Conectar ao backend existente - RESOLVIDO no codigo local pela EXECUCAO-010 | Smoke mobile/staging, permissao GPS, cidade manual, DB vazio e reflexo nos fluxos de descoberta | P0 ate smoke |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | Alterar privacidade/mensagens/check-ins | Controlar exposicao de dados e interacoes | Nao existe no backend atual | Nao comprovado | Sim para release profissional, mas fora do release visivel atual | Ocultar temporariamente da UI de producao - RESOLVIDO no codigo local pela EXECUCAO-012 | Criar model/migration/DTO/controller/service antes de reexibir | P1 se voltar ao escopo; P0 se reexibir local-only |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Senha/2FA/sessoes/seguranca | Proteger conta | Sim para senha e 2FA; nao comprovado para sessoes/audit log | Parcial | Sim | Conectar backend existente - RESOLVIDO parcialmente pela EXECUCAO-011; sessoes fora do menu ate backend real | Smoke de senha/2FA; criar/listar/revogar sessoes somente se voltar ao escopo | P0 ate smoke para senha/2FA; P1 para sessoes ocultas |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Notificacoes, idioma, bloqueados, alterar senha, suporte/legal auxiliares | Ajustar preferencias e acessar suporte/legal | Alterar senha sim; suporte configuravel pela EXECUCAO-029; bloqueados/notificacoes/idioma/raio/contas ocultos; demais parcial/nao comprovado | Parcial/nao comprovado | Parcial | Classificar item a item; alterar senha RESOLVIDO pela EXECUCAO-011; bloqueados oculto pela EXECUCAO-012; notificacoes/idioma/raio/contas ocultos pela EXECUCAO-013; suporte nao fica mais hardcoded em release | Validar suporte real; remover fallback local, conectar preferencias reais e legal real quando escopo exigir | P1; P0 para itens visiveis fake |
| `frontend/src/screens/main/ActivityScreen.tsx` | Central de atividade | Ver historico/favoritos/interacoes reais | Nao comprovado para recursos; estado vazio nao exige backend | Parcial | Sim se tab/entrada visivel | Manter estado vazio sem cards falsos - RESOLVIDO no codigo local pela EXECUCAO-014 | Criar backend novo antes de reexibir cards/contadores/rotas | P1 se voltar ao escopo; P0 se exibe dado falso |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | Favoritos | Ver itens favoritados reais | Nao comprovado | Nao comprovado | Sim se recurso visivel | Fora do hub visivel - RESOLVIDO no codigo local pela EXECUCAO-014 | Model favoritos, endpoints listar/adicionar/remover, empty state real antes de reexibir | P1 se voltar ao escopo |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | Historico | Ver itens visitados/acoes recentes | Nao comprovado | Nao comprovado | Nao necessariamente | Fora do hub visivel - RESOLVIDO no codigo local pela EXECUCAO-014 | Se mantido, implementar tracking real; se nao, manter fora da UI de producao | P1 se visivel; P2 se oculto |
| `frontend/src/screens/main/CatalogScreen.tsx` | Catalogo | Ver produtos reais de estabelecimento | Sim via `GET /establishments/:id/products`; eventos entram por Home/Item | Sim products/events | Sim | Conectado ao backend existente no codigo local | `MOCK_CATALOGS` removido; rota sem `establishmentId` mostra estado honesto; validar smoke | P0 ate smoke |
| `frontend/src/screens/main/ItemScreen.tsx` | Detalhe de item | Ver produto/evento real e agir | Sim via `GET /products/:id` e `GET /events/:id`; acoes de presenca usam backend | Sim products/events | Sim se catalogo/home abrem item | Conectado ao backend existente no codigo local | `item-fallback` e CTA generico removidos; validar 404/empty e device real | P0 ate smoke |
| `frontend/src/screens/main/SearchScreen.tsx` | Historico/buscas recentes | Reusar buscas recentes reais | Nao existe no codigo local apos EXECUCAO-015 | Pode ser local storage aceitavel se declarado; backend nao obrigatorio | Sim se exibido | Manter fora da UI ate haver historico real | Criar endpoint/storage real antes de reexibir | P1 se voltar ao escopo; P0 se parece dado real |
| `frontend/src/screens/main/MapScreen.tsx` | Item clicavel no mapa/lista | Abrir perfil/item do lugar/evento | Sim via eventos/estabelecimentos e rotas `Item`/`Profile` | Sim para establishment/event/product | Sim | Conectado ao backend existente no codigo local pela EXECUCAO-008 | Validar evento, estabelecimento, mapa e lista em smoke mobile/staging | P0 ate smoke |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Roteamento ao tocar notificacao | Abrir conversa, perfil, item ou entidade relacionada | RESOLVIDO no codigo local pela EXECUCAO-016/017: conversa, usuario, estabelecimento, produto e evento usam rotas reais | Sim | Sim se notificacoes visiveis | Conectado ao backend existente | Validar payload real, nested route do chat, perfil publico e entidades em smoke | P1 ate smoke |
| `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx` | Excluir conta com senha | Apagar conta real com confirmacao segura | OK no codigo local; smoke/LGPD final pendente | Sim User/Auth | Sim | Contrato corrigido no codigo local | Backend valida senha e revoga refresh tokens; cadastro agora registra consentimentos pela EXECUCAO-028; ainda validar device/staging e retencao/anonimizacao LGPD | P0 ate smoke/legal final |
| `SettingsLinkedAccounts` / `frontend/src/screens/main/SettingsAuxScreens.tsx` | Contas vinculadas | Conectar/desconectar provedores externos | Nao comprovado | Nao comprovado | Nao para MVP se login social nao existir | Manter fora do release por escopo ou ocultar temporariamente | Ocultar ate existir produto/backend real; nao mostrar tela fake | P1 se visivel; P2 se oculto |

#### Checklist adicional de go/no-go

| Area | Criterio extra | Bloqueia producao? |
|---|---|---|
| Staging | Ambiente AWS staging real aprovado antes de producao | Sim |
| Rollback | Plano de rollback preenchido com comandos/artefatos reais por release | Sim |
| Banco zerado | Smoke com banco limpo sem seed obrigatoria | Sim |
| Sem Firebase/Render | Build/env/documentacao operacional nao dependem de Firebase nem Render | Sim |
| Sem mock visivel | Nenhum fluxo visivel simula backend real | Sim |
| Mobile release | APK/AAB ou processo equivalente validado em device real | Sim |
| LGPD/legal | Termos, privacidade, exclusao, suporte, consentimentos e logs seguros validados | Sim |
| Decisao de escopo | Itens fora do MVP ficam registrados, ocultos se necessario, e sem UI fake em producao | Sim |

### PROMPT-009 - consolidacao com codigo real, AWS e governanca - 2026-04-30

Objetivo deste complemento:

- Revisar as correcoes ja executadas antes de abrir novas pendencias.
- Sincronizar o plano com `.codex/melhorias_objetivas.md`, `.codex/PROMPT_melhorias_objetivas.md` e `doc/aws doc/*.md`.
- Registrar decisoes tecnicas oficiais para eliminar conflitos Firebase/Resend/Sentry.
- Adicionar fases de hardening backend, governanca do repositorio e validacao de escopo MVP.
- Reorganizar a leitura de prioridades sem apagar historico.

#### Etapa 0 - revisao das correcoes ja executadas

Fontes revisadas:

- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`
- `AUDITORIA_PROMPT_AWS_2026-04-26.md`
- `AUDITORIA_ARQUITETURA_MEU_AGITO_2026-04-25.md`
- Codigo atual em `backend/src`, `backend/prisma/schema.prisma`, `frontend/src` e `frontend/app.json`.

Regra aplicada nesta revisao: item confirmado no codigo fica marcado como resolvido e nao deve ser reaberto como problema. Item divergente volta ao plano com evidencia real. Item dependente de AWS/dispositivo real fica pendente de ambiente, nao de implementacao local.

| Bloco | Status anterior | Status real | Evidencia no codigo | Acao necessaria |
|---|---|---|---|---|
| Base de producao | Aprovado apos ressalvas | Confirmado no codigo | `backend/src/config/env.validation.ts` valida providers `none/s3`, `none/ses`, `none/sns`; `backend/Dockerfile`; `backend/src/main.ts` configura CORS, trust proxy, filters/interceptors e Redis adapter | RESOLVIDO no codigo local; validar em staging AWS real antes de producao |
| Storage e midia | Aprovado apos ressalvas | Confirmado no codigo, com pendencia de ambiente | `backend/src/modules/media/storage.service.ts` usa S3/LOCAL; `backend/src/config/env.validation.ts` aceita apenas `none/s3`; `backend/src/modules/media/media.controller.ts` tem `GET /media/protected/:mediaId`; `backend/src/modules/feed/feed.service.ts` rejeita data URI/base64 em fluxo real | RESOLVIDO no codigo; validar bucket S3/CloudFront real, lifecycle e permissoes |
| Auth, JWT e permissoes | Aprovado apos ressalvas | Confirmado no codigo | `backend/src/modules/auth/auth.service.ts` usa `jwtid: randomUUID()`; `backend/src/common/enums/account-type.enum.ts` define `USER/ESTABLISHMENT`; `backend/src/modules/auth/guards/resource-owner.guard.ts` existe; busca por `isAdmin` no auth/schema nao retornou fluxo ativo | RESOLVIDO no codigo; smoke mobile auth ainda obrigatorio |
| Conta de estabelecimento | Aprovado | Confirmado parcial no codigo | `backend/src/modules/establishments` tem DTOs de create/update/list com latitude/longitude/openingHours; frontend tem `BusinessSetupScreen.tsx` | Nao reabrir backend como problema; validar onboarding empresarial ponta a ponta em staging/device |
| Produtos/vitrine | Aprovado no backend | Backend confirmado; frontend corrigido no codigo local | `backend/src/modules/products/products.controller.ts` e `products.service.ts` existem com AuditLog; EXECUCAO-002 removeu `MOCK_CATALOGS` e `item-fallback` de `CatalogScreen.tsx`/`ItemScreen.tsx` | Backend RESOLVIDO; frontend RESOLVIDO no codigo local; validar Catalog/Item em smoke mobile/staging |
| Feed social | Aprovado apos correcao | Confirmado no codigo | `backend/src/modules/feed/agito-feed.controller.ts` expoe `GET /feed/agito`; `feed.service.ts` tem cursor pagination; `frontend/src/screens/main/FeedSocialScreen.tsx` consome `agitoPosts/getAgitoFeed` | RESOLVIDO para T_AGITO; manter Home/discovery em escopo separado |
| Geo/discovery | Aprovado apos correcao | Confirmado no backend; smoke pendente | `backend/src/common/geo/geo.utils.ts` calcula bounding box/distancia; `opening-hours.utils.ts`; `events`, `establishments` e `search` usam latitude/longitude/distancia/openNow | RESOLVIDO no codigo backend; validar qualidade dos resultados e tela mobile com banco real |
| Chat e tempo real | Aprovado com validacao manual pendente | Confirmado no codigo local | `backend/src/common/realtime/redis-io.adapter.ts`; `backend/src/modules/chat/chat.gateway.ts`; `chat.service.ts` usa AuditLog e anexos via media | Nao reabrir implementacao; validar multi-instancia ECS/Redis em staging |
| Redis/Valkey | Aprovado | Confirmado no codigo, pendente AWS | `backend/src/common/cache/cache.service.ts`; `backend/src/common/rate-limit/redis-throttler.storage.ts` falha em producao sem Redis; `backend/src/app.module.ts` usa RedisThrottlerStorage | RESOLVIDO no codigo; validar ElastiCache real |
| Push notifications | Antes divergente Firebase; depois aprovado com SNS | Confirmado no backend; mobile/provider real pendente | `backend/src/common/notification/notification.service.ts` usa AWS SNS; `PushToken` e `NotificationDelivery` existem no Prisma; `frontend/src/services/push/PushRegistrationService.ts` registra token via API; `frontend/app.json` nao referencia `googleServicesFile` | Backend RESOLVIDO; Android deve usar FCM apenas como transporte tecnico de push, com SNS como orquestrador; validar em device real ou retirar push do release |
| Notificacoes in-app | Aprovado | Confirmado parcial | `backend/src/modules/notifications` tem controller/service/DTOs; `frontend/src/services/api/NotificationsService.ts` existe | Backend RESOLVIDO; roteamento mobile ao tocar notificacao ainda parcial |
| E-mail | Antes SES pendente; depois aprovado | Confirmado no codigo; ambiente pendente | `backend/src/common/email/email.service.ts` usa `SESv2Client`; `env.validation.ts` valida `EMAIL_PROVIDER=ses`; testes cobrem falha SES | RESOLVIDO no codigo; validar identidade SES/sandbox em AWS |
| AuditLog | Antes sem escrita real; depois aprovado | Confirmado no codigo | `backend/src/common/audit/audit-log.service.ts`; modelo `AuditLog`; auth/users/establishments/events/feed/products/chat/notifications chamam `record` | RESOLVIDO; ampliar somente se novos fluxos forem criados |
| Observabilidade AWS | Parcial | Parcial | `backend/src/common/logging/structured-log.ts`, `http-logging.interceptor.ts`, `observability.bootstrap.ts`; docs AWS exigem CloudWatch/CloudTrail/X-Ray; aplicacao AWS real ainda nao executada | Manter como P0 de ambiente/staging para producao publica |
| Testes/mobile | Aprovado com ressalvas | Parcial | Ultima validacao local passou build backend, unit backend, lint e typecheck frontend; e2e depende Postgres teste; smoke mobile/device pendente | P0 para release publico: e2e com DB teste e smoke mobile em device/staging |

#### Arquitetura de Producao Alvo (AWS)

Arquitetura oficial conforme `.codex/melhorias_objetivas.md`, `.codex/PROMPT_melhorias_objetivas.md` e `doc/aws doc/*.md`:

| Servico | Papel no Meu Agito | Dependencias | Estado atual no codigo/docs | Falta para producao |
|---|---|---|---|---|
| ECS Fargate | Executar backend NestJS sem servidor gerenciado manualmente | ECR, ALB, Secrets/SSM, RDS, Redis, S3, CloudWatch | Dockerfile e docs de deploy existem | Criar cluster/service/task real, capacity, healthcheck e deploy staging/prod |
| ECR | Armazenar imagem Docker versionada do backend | Docker build, IAM, ECS | Planejado nos docs AWS | Criar repositorio, publicar imagem imutavel por release |
| RDS PostgreSQL | Banco principal Prisma/PostgreSQL | VPC privada, Secrets/SSM, migrations | Prisma schema/migrations existem | Criar RDS, aplicar migrations, backup/PITR e smoke com banco vazio |
| ElastiCache Redis/Valkey | Cache, rate limit, presenca, Socket.IO adapter | ECS privado, REDIS_URL | Codigo Redis existe e producao exige Redis | Criar cluster privado e validar runtime multi-instancia |
| S3 | Armazenamento de midia | MediaService, IAM/task role, CloudFront | StorageService S3 existe | Criar bucket/policies/lifecycle e validar upload/download real |
| CloudFront | CDN para midia publica | S3 origin, dominio/ACM | Suporte por env `USE_CLOUDFRONT/CLOUDFRONT_BASE_URL` | Criar distribution/origin/cache/invalidation e validar URLs |
| ALB | Entrada HTTPS e WebSocket para ECS | ACM, target group, SGs | Health endpoint existe; docs planejam ALB | Criar ALB/listeners/rules/health target e validar WebSocket |
| ACM | Certificados TLS | DNS/ALB/CloudFront | Planejado nos docs AWS | Emitir/validar certificados dos dominios reais |
| SES | E-mail transacional | Identidade verificada, DNS, sandbox liberado | EmailService SES implementado | Validar remetente, sandbox, bounce e envio real |
| SNS Mobile Push | Envio push backend via AWS | Credenciais plataforma Android/iOS, PushToken, app mobile | Backend SNS implementado; mobile registra token | Configurar SNS Platform Application Android com FCM como transporte tecnico; validar device real ou excluir push do release |
| Secrets Manager / SSM | Segredos e env sensiveis | ECS task definition/IAM | Docs exigem; `backend/.env` fora do Git | Criar parametros/secrets reais e remover qualquer segredo de task/imagem |
| CloudWatch | Logs/metrica/alarmes base | ECS, log driver, dashboards | Logs estruturados no app; docs planejam CloudWatch | Configurar log groups, retention, metric filters e alarmes |
| CloudTrail | Auditoria de acoes AWS | Conta AWS, bucket/log group | Documentado como alvo | Ativar/validar trail e retencao |
| X-Ray | Trace quando aplicavel | SDK/instrumentacao, daemon/config AWS | `observability.bootstrap.ts` existe | Validar em staging ou documentar decisao de adiar |

Dependencia principal: mobile release -> ALB/HTTPS -> ECS Fargate -> RDS/Redis/S3/SES/SNS -> CloudWatch/CloudTrail. Producao publica depende de staging AWS real aprovado antes.

#### Decisoes Tecnicas Oficiais

| Tema | Decisao oficial | Consequencia no plano |
|---|---|---|
| Push | SNS Mobile Push e a camada principal de envio | Firebase nao e backend nem arquitetura principal; credenciais de plataforma so entram se forem requisito tecnico do Android/iOS e devem ficar em Secrets/SSM |
| E-mail | Amazon SES e o provider principal | Resend nao deve voltar como provider principal; validar SES real antes de release |
| Observabilidade | CloudWatch/CloudTrail sao a base; X-Ray quando aplicavel | Sentry e opcional, nao bloqueia por si so se CloudWatch/CloudTrail estiverem prontos |
| Backend | AWS-first em ECS/RDS/Redis/S3/SES/SNS | Nao reintroduzir Render/Railway/Supabase/Aiven/Upstash como arquitetura-alvo |
| Firebase | Nao e backend do sistema | Nao criar dependencia de Firebase Auth/Firestore/Storage/Functions; FCM pode ser usado apenas como transporte tecnico obrigatorio do Android para push via SNS |

#### Roadmap pos-APK aprovado - modernizacao Android antes da loja

Esta fase nao deve bloquear a geracao do APK staging de smoke. Ela deve ser executada somente depois que o APK staging estiver instalado em aparelho fisico, apontando para o backend staging, e os fluxos principais estiverem aprovados.

| Item | Momento correto | Motivo | Validacao obrigatoria | Bloqueia loja? |
|---|---|---|---|---|
| Modernizar Expo SDK | Depois do smoke APK staging aprovado | Atualizar Expo antes do smoke pode misturar problema de produto com problema de upgrade nativo | `npx expo install --check`, `npm run lint`, `npx tsc --noEmit`, build Android | Sim antes da loja se houver incompatibilidade relevante |
| Modernizar React Native | Junto com Expo SDK compativel | RN deve acompanhar a matriz do Expo para evitar drift nativo | Build Android release e smoke em device | Sim antes da loja |
| Atualizar Gradle Wrapper/Android Gradle Plugin/Kotlin | Depois de estabilizar Expo/RN | Upgrade isolado pode quebrar bibliotecas nativas; fazer como fase propria | `./gradlew assembleRelease`, instalacao APK e logs sem crash | Sim antes da loja se stack atual continuar bloqueando release |
| Padronizar JDK de build | Antes do build final de loja | Stack atual Expo 50/RN 0.73/AGP 8.1.1 e mais segura com JDK 17; stack futura pode migrar para JDK mais novo se suportada | `java -version`, `gradlew --version`, build reproduzivel | Sim para build final |
| Revalidar dependencias Expo/RN | Depois dos upgrades | Evitar pacote fora da faixa suportada, como ocorreu com `expo-secure-store` | `npx expo install --check` sem divergencias criticas | Sim antes da loja |
| Revalidar push Android | Depois da decisao SNS + FCM | Push real depende de token Android, SNS Platform Application e device real | `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=true`, token registrado no backend, push entregue | Sim se push entrar no release |

#### Bloqueio operacional atual - APK staging Android

| Item | Status em 2026-05-04 | Evidencia | Acao necessaria | Bloqueia smoke APK? |
|---|---|---|---|---|
| Build APK staging Android | Bloqueado por ambiente local Windows | NDK/clang falhou com `O arquivo de paginacao e muito pequeno para que esta operacao seja concluida. (0x5AF)`; `AutomaticManagedPagefile=false`; PowerShell atual `IsAdmin=false` | Ativar pagefile em PowerShell Administrador, reiniciar Windows e repetir `assembleRelease` | Sim |
| Matriz Expo/RN | Corrigida | `npx expo install --check`: OK | Manter lockfile atualizado | Nao |
| JDK de build | Corrigido para stack atual | `F:\Android\jdk-17`; script Android aponta para JDK 17 | Manter JDK 17 para Expo 50/RN 0.73/AGP 8.1.1 | Nao |
| Firebase/Google Services | Removido do build nativo | Sem `google-services` no Gradle Android | Reintroduzir somente se FCM for configurado formalmente como transporte Android via SNS | Nao para smoke sem push |
| API staging HTTP | Permitida temporariamente | `usesCleartextTraffic=true` no Manifest | Remover antes de producao; usar HTTPS/ALB/ACM | Nao para smoke; sim para loja |

#### Fase nova - hardening de backend

| Item | Status | Evidencia no codigo | Acao necessaria | Bloqueador |
|---|---|---|---|---|
| Base64 em midia | OK/parcial | `feed.service.ts` rejeita data URI/base64; auth 2FA gera QR real com `QRCode.toDataURL(secret.otpauth_url)` e nao usa stub runtime | Manter proibicao em midia real; validar 2FA em staging/device | Sim ate smoke se 2FA aparecer no release |
| MediaService + S3 | OK | `MediaService` + `StorageService` + S3 client existem | Validar S3/CloudFront real em staging | Sim |
| JWT e claims | OK | `JwtPayload`, `jwtid: randomUUID()`, `USER/ESTABLISHMENT` | Smoke auth/refresh/2FA em staging | Sim |
| Logica morta/nao usada | Parcial | Existem telas/services parciais no mobile; backend core principal em uso | Fazer varredura por modulo antes de release e remover/ocultar apenas com decisao de escopo | Nao por si; Sim se visivel fake |
| AuditLog | OK | `AuditLogService.record` usado nos modulos core | Garantir novos fluxos tambem auditam | Sim para fluxos sensiveis |
| Tracking email/push | Parcial | Push tem `NotificationDelivery`; email retorna resultado mas nao ha tabela de delivery email dedicada | Criar tracking de email se verificacao/reset exigir auditoria operacional | P1; P0 se email critico sem diagnostico |
| Env obrigatoria | OK no codigo; runtime AWS pendente | `env.validation.ts` valida Redis, S3, CloudFront, SES e SNS em producao | Validar env real ECS/Secrets; sem localhost em prod | Sim |
| Secrets hardcoded | OK no versionado principal | `backend/.env` fora do Git; docs exigem Secrets/SSM | Varredura final antes de release e rotacao se qualquer segredo apareceu localmente | Sim |
| DTOs | OK/parcial | DTOs com class-validator existem em auth/feed/search/events/establishments/products/notifications | Validar contratos frontend/backend pendentes do plano | Sim para fluxos P0 |
| Tratamento de erro | Parcial | `GlobalExceptionFilter` existe | Smoke erros reais sem 500 generico indevido e sem dados sensiveis | Sim |
| Logs estruturados | OK no codigo local pela EXECUCAO-030; runtime AWS pendente | `logStructured` sanitiza contexto; `HttpLoggingInterceptor` usa logger central | Validar CloudWatch e ausencia de senha/token nos logs reais | Sim |
| Rate limit real | OK/parcial | `RedisThrottlerStorage` e `ThrottlerGuard` globais | Validar Redis/ElastiCache real e limites por rota critica | Sim |
| Trust proxy | OK/parcial | `backend/src/main.ts` le `TRUST_PROXY` | Definir valor correto atras do ALB em staging/prod | Sim |
| Health check expandido | OK no codigo; pendente staging | `backend/src/modules/health/health.service.ts` valida DB, Redis obrigatorio quando `ENABLE_REDIS=true`/production, e storage via `StorageService.getHealthStatus`; `backend/src/modules/media/storage.service.ts` valida local/S3 e permite `HeadBucket` por `HEALTHCHECK_VERIFY_STORAGE=true` | Validar `/health` no ALB/ECS com RDS, ElastiCache e S3 reais | Sim para ALB/producao |

#### Fase nova - governanca do repositorio antes de deploy

| Verificacao | Status atual | Acao obrigatoria | Bloqueia producao? |
|---|---|---|---|
| Estado do git | Limpo na ultima revisao desta rodada | Rodar `git status --short` antes de build/release | Sim |
| Branch ativa | `chore/reorganizacao-baseline` | Definir branch padrao/release e estrategia de merge/tag | Sim |
| Worktree | `F:/Bruno/Projetos/meu-agito` como worktree unica validada | Rodar `git worktree list --porcelain` e evitar worktrees antigas | Sim |
| Stashes antigos | Nao validado nesta etapa | Rodar `git stash list`; revisar/remover apenas com seguranca | Nao, salvo stash critico |
| Temporarios/caches | Parcial | Garantir `node_modules/dist/build/.expo/.gradle` fora do commit e limpar artefatos antigos | Sim para build reproduzivel |
| Documentacao duplicada | Parcial historico mantido | Manter historico, mas usar docs canonicos: `.codex`, `doc/README.md`, `doc/aws doc`, plano atual | Nao, se fonte canonica clara |
| Build reproduzivel | Parcial | Validar comandos backend/frontend em maquina/CI limpa | Sim |
| Tags/releases | Pendente | Criar tag por release e guardar hashes de imagem/mobile | Sim |

#### Validacao de Escopo do MVP

Base: `.codex/PROJECT_CONTEXT.md` define MVP funcional, coeso, enxuto, com nucleo de valor real e sem escopo excessivo.

| Funcionalidade | Pertence ao MVP? | Valor real | Estado atual | Decisao | Observacao |
|---|---|---|---|---|---|
| Auth/cadastro/login/refresh | Sim | Entrada no app e identidade | Backend confirmado; smoke mobile pendente | Entra no release | P0 validar ponta a ponta |
| Onboarding pessoal | Sim | Completar perfil real | Conectado no codigo local; smoke pendente | Entra apos smoke mobile/staging | Username, bio, cidade/localizacao e avatar usam backend real; interesses ficam fora do release ate existir backend canonico |
| Onboarding empresarial | Sim | Criar estabelecimento real | Backend/tela existem; smoke pendente | Entra no release | Validar criacao com midia/geocode/horarios |
| Feed social T_AGITO | Sim | Conteudo social real | Confirmado no codigo | Entra no release | Nao reabrir como mock |
| Home/discovery | Sim | Descoberta de eventos/locais | Parcial; depende dados reais e empty states | Entra com backend real e banco vazio correto | Sem cards fake |
| Busca | Sim | Encontrar locais/eventos | Backend real; `RECENT_SEARCHES` removido no codigo local | Entra apos smoke mobile/staging | Pendente apenas validacao real de busca/localizacao |
| Perfil usuario/estabelecimento | Sim | Identidade e vitrine | RESOLVIDO no codigo local para perfil publico usuario pela EXECUCAO-017; vitrine de estabelecimento ja usava backend real | Entra apos smoke mobile/staging | Se o produto exigir abrir vitrine empresarial ao tocar autor ESTABLISHMENT, enriquecer feed com `establishmentId` |
| Catalogo/item | Sim para estabelecimento/produto/evento | Vitrine publica | Backend existe; frontend sem fallback mock no codigo local | Entra apos smoke mobile/staging confirmar produto/evento reais e banco vazio | P0 ate smoke |
| Mapa | Sim se discovery usa mapa | Localizar itens | Conectado no codigo local; smoke pendente | Entra se smoke aprovar mapa/lista e empty state | P0 ate smoke |
| Chat | Sim se interacao entre usuarios/estabelecimentos | Conversa real | Backend confirmado; smoke multi-device pendente | Entra se smoke realtime passar | P0 se exposto |
| Notificacoes in-app | Sim | Alertas internos | Backend/service existem; roteamento conectado no codigo local pela EXECUCAO-016/017 | Entra apos smoke mobile/staging | Push pode ser fora do MVP se documentado |
| Push | Opcional para primeiro MVP | Retencao/alertas | Backend SNS existe; plataforma mobile pendente | Entra somente se device real passar; senao sai do release | SNS oficial; FCM apenas transporte Android; Firebase nao e backend |
| Settings criticas | Sim | Conta, seguranca, privacidade, delete | Parcial; conta/delete/cidade/senha conectados e privacidade ocultada no codigo local | Entra apenas com backend real ou itens ocultos | Nada de toggle local fake; preferencias restantes ainda precisam decisao/correcao |
| Historico/contas vinculadas/recursos auxiliares | Nao necessariamente | Conveniencia | Parcial/fake | Adiado ou oculto | P2 somente se fora da UI de producao |

#### Reforco da regra de itens sem backend

A matriz do PROMPT-008 continua valida. Complemento obrigatorio: antes de ocultar/remover qualquer item, registrar a decisao em uma linha da matriz com evidencia de endpoint/model/service. A decisao padrao deve ser conectar backend existente ou corrigir contrato quando isso for simples/medio e fizer parte do MVP. Remocao so e aceitavel para duplicidade, lixo real ou item sem funcao de produto.

#### Prioridades consolidadas apos revisao

##### P0 - BLOQUEIA PRODUCAO

| Item | Evidencia | Acao |
|---|---|---|
| AWS staging real antes de producao | Docs AWS exigem ECS/ECR/RDS/Redis/S3/CloudFront/ALB/ACM/SES/SNS/Secrets/CloudWatch | Subir staging e aprovar smoke completo antes de prod |
| Health check expandido | Implementado no codigo: DB + Redis obrigatorio + storage local/S3 configuravel | Validar no ALB/ECS staging com RDS, ElastiCache e S3 reais |
| Catalog/Item sem fallback fake | RESOLVIDO no codigo local pela EXECUCAO-002; smoke mobile/staging pendente | Validar estabelecimento real, produto real, evento real e rotas sem contexto |
| Onboarding pessoal real | RESOLVIDO no codigo local pela EXECUCAO-009; smoke mobile/staging pendente | Validar usuario pessoal novo com DB vazio, username livre/duplicado/invalido, upload avatar e permissao de localizacao |
| Settings criticas com estado local/fake | MyAccount resolvido pela EXECUCAO-004; Delete pela EXECUCAO-003; City pela EXECUCAO-010; Security/senha pela EXECUCAO-011; Privacy/Bloqueados ocultos pela EXECUCAO-012; preferencias auxiliares ainda parciais | Conectar backend ou ocultar itens nao prontos; validar MyAccount/Delete/City/Senha em smoke |
| Build mobile release real | Ainda pendente EAS/processo equivalente/device real | Gerar APK/AAB, validar env e smoke em device |
| SES/SNS/S3/Redis reais | Codigo existe, ambiente real nao validado | Validar providers em staging AWS |
| E2E e smoke com banco vazio | e2e depende postgres-test; banco zerado precisa smoke | Subir DB teste/staging limpo e validar estados vazios |
| Seguranca/LGPD minima | Delete com senha resolvido no codigo local; cadastro exige/persiste aceite pela EXECUCAO-028; suporte configuravel/obrigatorio em release pela EXECUCAO-029; logs sensiveis com redacao central pela EXECUCAO-030; conteudo juridico final e retencao LGPD ainda parciais | Fechar conteudo legal, retencao/anonimizacao e smoke de delete/signup/suporte/logs |

##### P1 - NECESSARIO PARA RELEASE PROFISSIONAL

| Item | Evidencia | Acao |
|---|---|---|
| Search `RECENT_SEARCHES` | RESOLVIDO no codigo local pela EXECUCAO-015 | Validar busca real e estado vazio no smoke |
| Notifications routing | RESOLVIDO no codigo local pela EXECUCAO-016/017 para chat/usuario/estabelecimento/produto/evento | Validar payload real em staging/device |
| Activity/Favorites/History | Telas existem com backend nao comprovado | Criar backend ou tirar do release conscientemente |
| Observabilidade operacional | Codigo estruturado existe, CloudWatch/CloudTrail nao aplicado | Criar log groups, alarmes, retention e runbook |
| Governanca release | Branch/tag/pipeline ainda precisam regra final | Definir branch release, tags e artefatos |

##### P2 - MELHORIA POS-MVP

| Item | Condicao para ser P2 | Acao |
|---|---|---|
| Historico avancado | Somente se oculto da UI de producao | Planejar depois do MVP |
| Contas vinculadas/social login | Somente se nao aparecer como tela fake | Planejar depois |
| X-Ray completo | Se CloudWatch/CloudTrail cobrirem MVP e decisao estiver documentada | Implementar quando houver volume/necessidade |
| Otimizacoes de ranking/geo | Se busca basica real estiver funcionando | Melhorar relevancia apos release inicial |

#### Checklist consolidado de deploy real

1. Correcoes ja executadas revisadas contra codigo real e marcadas como resolvidas/parciais/pendentes.
2. Decisoes oficiais AWS-first aplicadas: ECS, ECR, RDS, ElastiCache, S3, CloudFront, ALB, ACM, SES, SNS, Secrets/SSM, CloudWatch, CloudTrail e X-Ray quando aplicavel.
3. Firebase nao e backend; Resend nao e provider principal; Sentry nao e obrigatorio.
4. Backend hardening fechado: env, DTOs, auth, audit, logs, rate limit, errors, health DB+Redis+storage e ausencia de secrets.
5. Frontend/mobile sem mock visivel, sem botao morto e sem dado fixo fingindo backend.
6. Staging AWS real aprovado antes de producao publica.
7. Banco vazio validado sem seed obrigatoria de usuarios/estabelecimentos/produtos/eventos/posts.
8. Build mobile release real validado em dispositivo, com API URL staging/prod e package/bundle corretos.
9. LGPD/legal/suporte/delete/consentimentos/logs sensiveis validados.
10. Rollback documentado com imagem ECR, task definition ECS, migrations, env/secrets, dominio/ALB/CloudFront e app mobile.

### EXECUCAO-001 - health/readiness expandido - 2026-04-30

Objetivo executado:

- Fechar o P0 local de health check expandido para ALB/ECS/staging.
- Transformar `/health` em resposta consolidada de DB, Redis/cache e storage.
- Evitar vazamento de detalhes sensiveis de erro em producao.

Arquivos alterados:

- `backend/src/modules/health/health.service.ts`
- `backend/src/modules/health/health.module.ts`
- `backend/src/modules/health/health.service.spec.ts`
- `backend/src/modules/media/storage.service.ts`
- `backend/.env.example`
- `backend/.env.test`
- `backend/.env.test.example`

Implementacao:

- `/health` agora retorna `database`, `cache` e `storage` como componentes estruturados.
- Redis/cache passa a bloquear o status geral quando `ENABLE_REDIS=true` ou `NODE_ENV=production` e o Redis nao esta conectado.
- `StorageService` ganhou `getHealthStatus()` para validar provider local/S3.
- S3 valida configuracao por padrao e pode fazer `HeadBucket` quando `HEALTHCHECK_VERIFY_STORAGE=true`.
- Erros detalhados de dependencia sao redigidos em producao como `Health dependency check failed`.

Validacao executada:

- `cd backend && npx jest src/modules/health/health.service.spec.ts --runInBand`: OK.
- `cd backend && npm run build`: OK com `NODE_OPTIONS=--max-old-space-size=4096`.
- `git diff --check`: OK.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: validar `/health` no ambiente AWS staging real com RDS, ElastiCache Redis/Valkey e S3 reais.

### EXECUCAO-002 - Catalogo/Item sem fallback fake - 2026-05-01

Objetivo executado:

- Fechar o P0 local de Catalogo/Item que permitia dados fake ou CTA sem backend.
- Garantir que a vitrine publica consuma backend real ou mostre estado honesto.
- Impedir que templates genericos exibam item/acao como se existissem em producao.

Arquivos alterados:

- `frontend/src/screens/main/CatalogScreen.tsx`
- `frontend/src/screens/main/ItemScreen.tsx`

Implementacao:

- `CatalogScreen` deixou de declarar e usar `MOCK_CATALOGS`.
- `CatalogScreen` carrega itens apenas com `catalogService.getEstablishmentProducts(establishmentId)`.
- Rota de Catalogo sem `establishmentId` agora mostra `Catalogo indisponivel` sem busca, filtros ou cards simulados.
- O indicador visual `SHR` sem acao foi removido do cabecalho do Catalogo.
- `ItemScreen` deixou de criar `item-fallback`.
- `ItemScreen` deixou de exibir CTA generico para pedido, reserva, agenda, assinatura ou carrinho fora do backend real.
- Produto e evento permanecem conectados aos endpoints reais (`GET /products/:id`, `GET /events/:id`, confirmar/cancelar presenca).

Validacao executada:

- `cd frontend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- Varredura em `CatalogScreen.tsx`, `ItemScreen.tsx` e `CatalogService.ts`: sem `MOCK_CATALOGS`, `item-fallback`, `Fluxo fora do MVP`, `em breve`, `fake`, `dummy`, `sample`, `TODO`, `FIXME` ou `console.log` neste recorte.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging abrindo Catalogo por perfil de estabelecimento real, produto real, evento real e banco vazio sem seed.

### EXECUCAO-003 - Delete account com senha validada - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que a UI pedia senha para excluir conta, mas o backend nao validava essa senha.
- Evitar bypass pelo endpoint antigo `DELETE /users/:id`.
- Revogar refresh tokens apos exclusao para impedir renovacao de sessao.

Arquivos alterados:

- `backend/src/modules/users/dtos/delete-account.dto.ts`
- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/users/users.spec.ts`
- `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx`
- `frontend/src/services/api/UserService.ts`
- `frontend/src/stores/userStore.ts`

Implementacao:

- Criado `DeleteAccountDto` com `password` obrigatoria.
- `SettingsDeleteAccountScreen` agora envia a senha digitada para o store.
- `UserService.deleteAccount(password)` chama `DELETE /users/me` com body `{ password }`.
- `UsersController` ganhou `DELETE /users/me` autenticado.
- `DELETE /users/:id` tambem exige `DeleteAccountDto`, evitando bypass sem senha.
- `UsersService.softDelete(id, password)` busca o usuario, valida `bcrypt.compare`, bloqueia senha invalida com `UnauthorizedException`, faz soft delete e revoga refresh tokens do usuario.
- Cache de perfil/stats do usuario e invalidado apos exclusao.

Validacao executada:

- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK.
- `cd backend && npm test -- --runInBand`: OK, 15 suites e 162 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK com `NODE_OPTIONS=--max-old-space-size=8192`.
- `cd frontend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- Varredura de chamadas frontend: apenas `SettingsDeleteAccountScreen`, `userStore` e `UserService` chamam `deleteAccount`, todos com senha.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging com senha correta, senha incorreta, logout apos exclusao e tentativa de refresh token apos soft delete.
- Pendente LGPD/produto: definir politica final de retencao/anonimizacao e suporte ao titular.

### EXECUCAO-004 - Minha Conta com perfil/avatar reais - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que `SettingsMyAccountScreen` carregava dados fixos, simulava loading/save e tinha upload de foto sem acao real.
- Corrigir o contrato mobile/backend entre dados de conta (`PUT /users/me`) e dados de perfil (`PUT /users/me/profile`).
- Permitir edicao real de nome, e-mail, username, telefone, bio e avatar do usuario autenticado.

Arquivos alterados:

- `backend/src/modules/users/dtos/update-user.dto.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/users/users.spec.ts`
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx`
- `frontend/src/services/api/UserService.ts`
- `frontend/src/stores/userStore.ts`

Implementacao:

- `SettingsMyAccountScreen` deixou de usar conta fixa, `setTimeout` como simulacao e `onPress: () => {}` em foto.
- A tela carrega perfil real com `userStore.getProfile()` quando entra em foco.
- O botao `Salvar` persiste dados de conta por `UserService.updateAccount()` -> `PUT /users/me` e bio por `UserService.updateProfile()` -> `PUT /users/me/profile`.
- O upload de avatar usa `expo-image-picker` e `UserService.uploadAvatar()` -> `POST /users/me/avatar`.
- `UserService` passou a separar `updateAccount` de `updateProfile`; `updateProfile` usa o endpoint correto.
- `userStore` passou a expor `updateAccount`, retornar o perfil atualizado em `getProfile`, `updateProfile` e `uploadAvatar`.
- `UpdateUserDto` passou a aceitar `username` e `phoneNumber`.
- `UsersService.update()` normaliza e-mail, username e telefone; marca `emailVerified=false` somente quando o e-mail realmente muda; permite limpar username/telefone.
- `UsersService.updateProfile()` permite limpar `bio` e continua usando campos de perfil.
- Conflitos de unicidade em `email`, `username` e `phoneNumber` retornam mensagens especificas.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd backend && npm run build`: OK.
- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK, 21 testes.
- `cd backend && npm test -- --runInBand`: OK, 15 suites e 162 testes.
- `cd frontend && npm run lint`: OK.
- `cd backend && npm run lint`: OK com `NODE_OPTIONS=--max-old-space-size=8192`.
- Varredura no recorte `SettingsMyAccountScreen.tsx`, `UserService.ts` e `userStore.ts`: sem `Joao`, `setTimeout` de simulacao, `onPress: () => {}` em foto, `console.log`, `TODO`, `FIXME`, `mock`, `fake`, `dummy` ou `sample`.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging salvando conta, bio e avatar em usuario real; S3/CloudFront real para avatar; validacao de erro para e-mail/username duplicado; decisao de fluxo de verificacao quando e-mail for alterado.

### EXECUCAO-005 - Refresh token sem sobrescrever Authorization - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que `AuthService.refreshToken` enviava `Authorization: Bearer <refreshToken>`, mas o request interceptor do `ApiClient` podia sobrescrever esse header com o access token.
- Evitar que uma falha em `/auth/refresh` dispare nova tentativa automatica de refresh com o mesmo fluxo.

Arquivos alterados:

- `frontend/src/services/api/ApiClient.ts`

Implementacao:

- O request interceptor agora detecta `Authorization` explicito e so injeta o access token quando a chamada nao trouxe header proprio.
- O response interceptor nao tenta renovar token automaticamente quando a propria chamada com 401 e `/auth/refresh`.
- `AuthService.refreshToken` continua usando `apiClient.post('/auth/refresh', undefined, { headers: { Authorization: Bearer refreshToken } })`, mas o bearer explicito passa a ser preservado.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging com access token expirado, refresh token valido, refresh token invalido, logout apos falha de refresh e reinicio do app com tokens persistidos.

### EXECUCAO-006 - FeedService alinhado aos DTOs de post - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que `FeedService.createPost` e `FeedService.updatePost` enviavam `video` para endpoints cujos DTOs (`CreatePostDto` e `UpdatePostDto`) rejeitam campos extras.
- Manter o contrato mobile coerente com o backend real: `content` e `imageUrls/images` para criacao/edicao de posts.

Arquivos alterados:

- `frontend/src/services/api/FeedService.ts`
- `frontend/src/stores/feedStore.ts`

Implementacao:

- Removido `video` de `Post` e `CreatePostRequest` no `FeedService`.
- Removido `video` dos payloads de `POST /posts` e `PUT /posts/:id`.
- Removido `video` das assinaturas de `feedStore.createPost` e `feedStore.updatePost`.
- A varredura em `frontend/src` nao encontrou mais campo `video` em tipos, store ou payloads de feed.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `frontend/src`: sem ocorrencias de campo `video`; restaram apenas chamadas `createPost`/`updatePost` sem esse argumento.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging criando post sem midia, criando post com imagem real via upload e editando post existente.

### EXECUCAO-007 - SignUp sem loading infinito quando falta profileType - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que `SignUpScreen` ficava em loading infinito quando aberta sem `profileType`.
- Dar uma acao real para o usuario voltar ao fluxo correto de escolha de tipo de conta.

Arquivos alterados:

- `frontend/src/screens/auth/SignUpScreen.tsx`

Implementacao:

- Removido o `ActivityIndicator` infinito do caso sem `profileType`.
- `SignUpScreen` agora mostra um estado acionavel explicando que o usuario precisa escolher o tipo de conta.
- O botao `Escolher tipo de conta` executa `navigation.replace('ProfileSelection')`.
- O link secundario leva para `Login`.
- O fluxo normal vindo de `ProfileSelection` continua enviando `profileType` e `nextSetupScreen`.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile abrindo cadastro pelo fluxo normal e abrindo `SignUp` diretamente sem parametros.

### EXECUCAO-008 - MapScreen com navegacao real na lista e markers - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que `MapScreen` exibia item de lista como `TouchableOpacity` sem `onPress`.
- Conectar evento e estabelecimento a destinos reais ja registrados no navigator.

Arquivos alterados:

- `frontend/src/screens/main/MapScreen.tsx`

Implementacao:

- `MapScreen` passou a usar `useNavigation`.
- Item de lista agora executa `handleOpenItem`.
- Evento navega para `Item` com `template: 'evento'` e id real do evento, deixando `ItemScreen` carregar o evento por `locationService.getEvent`.
- Estabelecimento navega para `Profile` com `type: 'establishment'` e `establishmentId` real.
- Markers tambem ganharam `onCalloutPress` com o mesmo roteamento.
- Titulos de item/marker passam por fallback honesto (`Evento`/`Estabelecimento`) quando o backend nao retorna `title`/`name`.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging alternando mapa/lista, abrindo evento real, abrindo estabelecimento real, testando lista vazia e permissao/localizacao.

### EXECUCAO-009 - PersonalSetup real sem mock de username/GPS/avatar/interesses - 2026-05-01

Objetivo executado:

- Fechar o P0 local em que `PersonalSetupScreen` simulava username, cidade/GPS, avatar e finalizacao de onboarding sem persistir dados reais.
- Conectar o onboarding pessoal aos contratos backend ja existentes quando havia suporte real.
- Evitar manter etapa de interesses fake em producao enquanto nao existe model/endpoint canonico para preferencias/interesses.

Arquivos alterados:

- `backend/src/modules/users/dtos/username-availability.dto.ts`
- `backend/src/modules/users/dtos/update-user.dto.ts`
- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/users/users.spec.ts`
- `frontend/src/screens/auth/PersonalSetupScreen.tsx`
- `frontend/src/services/api/UserService.ts`

Implementacao:

- Backend recebeu `GET /users/username/availability`, autenticado por JWT, com DTO validando username de 3 a 30 caracteres usando letras, numeros, ponto ou underscore.
- `UsersService.isUsernameAvailable()` normaliza username, rejeita formato invalido e permite o username atual do proprio usuario.
- `UpdateUserDto` passou a validar o mesmo formato de username usado pelo check de disponibilidade.
- `UserService` mobile passou a expor `checkUsernameAvailability()`.
- `PersonalSetupScreen` deixou de usar `setTimeout`, `includes('taken')`, cidade fixa `Sao Paulo, SP`, avatar booleano local e etapa de interesses local.
- Avatar do setup pessoal passou a usar `expo-image-picker` + `userStore.uploadAvatar()` -> `POST /users/me/avatar`.
- Localizacao passou a usar `GeolocationService.getCurrentLocation()` + reverse geocode, sem fallback falso.
- Finalizacao passou a executar `updateAccount({ username })`, `updateProfile({ bio, location })` e somente depois `completeOnboarding({ tab: 'Home' })`.
- Interesses foram retirados do fluxo atual por decisao de escopo: nao existe contrato backend canonico para persistir esse dado sem criar schema/model novo.

Validacao executada:

- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `PersonalSetupScreen.tsx` para `setTimeout`, `taken`, `Sao Paulo`, `INTERESTS`, `selectedInterests`, `Pular`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log` e `onPress={() => {}}`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local para username, bio, cidade/localizacao e avatar.
- Pendente para producao: smoke mobile/staging com usuario pessoal novo, banco vazio, username livre/duplicado/invalido, permissao de localizacao concedida/negada e upload real em S3/CloudFront.
- Pendente de produto/backend futuro: preferencias/interesses pessoais, caso voltem ao escopo, exigem model/migration/DTO/controller/service e conexao mobile antes de aparecerem na UI.

### EXECUCAO-010 - SettingsCityScreen com cidade real persistida - 2026-05-02

Objetivo executado:

- Fechar o P0 local em que `SettingsCityScreen` usava lista fixa de cidades, historico local, GPS apontando para `Sao Paulo, SP` e confirmacao que apenas voltava de tela.
- Conectar a troca de cidade ao contrato backend ja existente de perfil do usuario.

Arquivos alterados:

- `frontend/src/screens/main/SettingsCityScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `SettingsCityScreen` passou a carregar o perfil real via `userStore.getProfile()` quando necessario.
- A tela removeu `CITY_OPTIONS`, `recentCities`, lista fixa e historico local.
- O card "Usar minha localizacao" passou a chamar `GeolocationService.getCurrentLocation()` e `reverseGeocodeCoordinates()`.
- A cidade manual passou a ser validada e revisada antes da confirmacao.
- Confirmar cidade agora executa `userStore.updateProfile({ location })`, que chama `PUT /users/me/profile`, antes de voltar.
- Estados de loading, erro, GPS em andamento e salvamento foram adicionados.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsCityScreen.tsx` para `CITY_OPTIONS`, `recentCities`, `Sao Paulo`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve` e `coming_soon`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local.
- Pendente para producao: smoke mobile/staging com cidade manual, permissao de localizacao concedida/negada, perfil recarregado apos salvar e impacto da cidade nos fluxos de descoberta.

### EXECUCAO-011 - Settings Security com troca de senha real e sem sessoes fake - 2026-05-02

Objetivo executado:

- Fechar o P0 local em que `SettingsChangePasswordScreen` era apenas scaffold visual.
- Evitar que o menu de seguranca exponha dispositivos/historico de acesso sem backend real.
- Remover dados inventados de dispositivos e acessos das rotas auxiliares.

Arquivos alterados:

- `frontend/src/hooks/useAuth.ts`
- `frontend/src/screens/main/SettingsSecurityScreen.tsx`
- `frontend/src/screens/main/SettingsAuxScreens.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `useAuth` passou a expor `changePassword()`.
- `SettingsChangePasswordScreen` passou a ter formulario real com senha atual, nova senha e confirmacao.
- A tela valida minimo de 8 caracteres, confirmacao igual e nova senha diferente da atual antes de chamar backend.
- O submit chama `authStore.changePassword()` -> `AuthService.changePassword()` -> `POST /auth/change-password`.
- `SettingsSecurityScreen` removeu comentario vazio, texto mojibake e atalhos visiveis para `SettingsDevices`/`SettingsAccessHistory`.
- `SettingsDevicesScreen` e `SettingsAccessHistoryScreen` deixaram de exibir `Windows Chrome`, `Android Pixel`, cidades e horarios fixos.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsSecurityScreen.tsx` e `SettingsAuxScreens.tsx` para `Load security settings`, `Windows Chrome`, `Android Pixel`, `Sao Paulo, BR`, `Santos, BR`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve`, `coming_soon` e textos mojibake de seguranca: sem ocorrencias nos arquivos alterados.

Status:

- RESOLVIDO no codigo local para trocar senha e para remover dados inventados de sessoes/acessos do caminho visivel.
- Pendente para producao: smoke mobile/staging com senha atual correta, senha atual incorreta, confirmacao divergente, token expirado e 2FA.
- Pendente de produto/backend futuro: sessoes/dispositivos/historico de acesso so devem voltar ao menu com endpoint real de sessoes/audit log.

### EXECUCAO-012 - Privacidade fora do caminho visivel sem backend real - 2026-05-02

Objetivo executado:

- Fechar o P0 local em que `SettingsPrivacyScreen` exibia switches/radios que alteravam apenas estado local.
- Evitar que a UI prometa privacidade, mensagens, check-ins ou bloqueios sem model/endpoint/service real.

Arquivos alterados:

- `frontend/src/screens/main/SettingsScreen.tsx`
- `frontend/src/screens/main/SettingsPrivacyScreen.tsx`
- `frontend/src/screens/main/SettingsAuxScreens.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- A entrada `Privacidade` saiu do menu principal de Settings.
- `SettingsPrivacyScreen` deixou de usar `useFocusEffect`, `Switch`, radios locais, `publicAccount`, `messages`, `checkins` e `blockedCount`.
- A tela passou a exibir estado neutro sem controles locais caso seja aberta indiretamente.
- `SettingsBlockedUsersScreen` deixou de exibir lista vazia como se fosse dado real de bloqueios.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsPrivacyScreen.tsx`, `SettingsScreen.tsx` e `SettingsAuxScreens.tsx` para `Load privacy settings`, `publicAccount`, `setPublicAccount`, `messages`, `setMessages`, `checkins`, `setCheckins`, `SettingsPrivacy`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve` e `coming_soon`: sem ocorrencias relevantes, exceto a exportacao da tela registrada para rota interna.

Status:

- RESOLVIDO no codigo local para o caminho visivel de producao.
- Pendente de produto/backend futuro: privacidade, mensagens, check-ins e bloqueios so devem voltar ao menu com model/migration/DTO/controller/service reais.

### EXECUCAO-013 - Settings sem preferencias auxiliares local-only - 2026-05-02

Objetivo executado:

- Fechar o P0/P1 local em que Settings ainda mostrava toggle GPS local-only, raio de busca fixo, preferencias de notificacao fixas, idioma fixo e desativacao de conta por alerta local.
- Manter no menu principal apenas entradas com backend real ou sem simulacao de persistencia.

Arquivos alterados:

- `frontend/src/screens/main/SettingsScreen.tsx`
- `frontend/src/screens/main/SettingsAuxScreens.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `SettingsScreen` removeu `gpsEnabled`, `Switch`, fallback vazio de toggle e o item `Permissao de GPS`.
- `SettingsScreen` removeu as entradas `Raio de Busca`, `Notificacoes`, `Idioma` e `Desativar Conta` do caminho visivel.
- A zona de perigo manteve somente `Excluir Conta`, que ja usa backend real.
- `SettingsLinkedAccountsScreen`, `SettingsSearchRadiusScreen`, `SettingsNotificationsPrefsScreen` e `SettingsLanguageScreen` deixaram de exibir provedores, raios, switches e idiomas fixos caso sejam abertas indiretamente.
- Strings visiveis tocadas em `SettingsScreen` foram normalizadas para ASCII.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SettingsScreen.tsx` e `SettingsAuxScreens.tsx` para `gpsEnabled`, `setGpsEnabled`, `SettingsSearchRadius`, `SettingsNotifications`, `SettingsLanguage`, `Desativar Conta`, `Conta desativada`, valores fixos de raio, provedores fixos, idiomas fixos, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Em breve`, `coming_soon` e mojibake: sem ocorrencias relevantes, exceto exports de rotas auxiliares registradas.

Status:

- RESOLVIDO no codigo local para o caminho visivel de producao.
- Pendente de produto/backend futuro: GPS como preferencia persistida, raio de busca, preferencias de notificacao, idioma, contas vinculadas e desativacao temporaria so devem voltar ao menu com contratos reais.

### EXECUCAO-014 - Activity sem cards futuros e sem textos de auditoria na UI - 2026-05-02

Objetivo executado:

- Fechar o P1/P0 local em que `ActivityScreen` expunha cards `coming_soon`, alerta `Em breve` e recursos comerciais sem backend.
- Remover textos de auditoria/proximo passo/backend de Favoritos e Historico dentro da UI.

Arquivos alterados:

- `frontend/src/screens/main/ActivityScreen.tsx`
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx`
- `frontend/src/screens/main/ActivityHistoryScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`

Implementacao:

- `ActivityScreen` foi reduzida a estado vazio simples, sem cards de Pedidos, Agendamentos, Reservas, Favoritos ou Historico.
- `Alert.alert('Em breve')`, `coming_soon` e cards sem backend foram removidos.
- `ActivityFavoritesScreen` e `ActivityHistoryScreen` deixaram de mostrar textos de auditoria/backend/roadmap e passaram a estados vazios simples.
- As rotas continuam registradas, mas nao ficam acessiveis pelo hub de Activity ate existirem contratos reais.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `ActivityScreen.tsx`, `ActivityFavoritesScreen.tsx` e `ActivityHistoryScreen.tsx` para `coming_soon`, `Em breve`, `STATUS REAL`, `backend`, `fake`, `mock`, `fora do escopo`, `MVP`, `proximo passo`, `lacuna`, `contrato`, `TODO`, `FIXME`, `console.log`, `onPress={() => {}}`, `Pedidos`, `Agendamentos` e `Reservas`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local para o caminho visivel de producao.
- Pendente de produto/backend futuro: favoritos, historico, pedidos, agendamentos e reservas so devem voltar ao hub com endpoints/telas reais.

### EXECUCAO-015 - Search sem buscas recentes fixas - 2026-05-02

Objetivo executado:

- Fechar o P1 local em que `SearchScreen` exibia `RECENT_SEARCHES` fixo como `Buscas rapidas`.
- Manter busca usando dados reais de backend, sem historico/sugestao fixa que possa parecer personalizacao real.

Arquivos alterados:

- `frontend/src/screens/main/SearchScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Constante `RECENT_SEARCHES` removida.
- Handler `handleRecentPress` removido.
- Secao `Buscas rapidas` removida.
- Tela inicial de busca mostra apenas categorias/taxonomia local e, ao pesquisar, chama `searchService.searchEstablishments()`.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `SearchScreen.tsx` para `RECENT_SEARCHES`, `Buscas rapidas`, `recent`, `historico`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log` e `onPress={() => {}}`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local.
- Pendente de produto/backend futuro: historico real de busca so deve voltar com storage/endpoint real ou sugestao editorial explicitamente definida.

### EXECUCAO-016 - Notificacoes sem placeholders e com roteamento por entidade - 2026-05-02

Objetivo executado:

- Fechar o P1 visual em que `NotificationsScreen` exibia `??`/`?` na UI.
- Corrigir o roteamento parcial de notificacoes para nao perder parametros reais de conversa e entidade.
- Evitar navegar para perfil publico de usuario enquanto `ProfileScreen` ainda nao suportava `userId`; status posterior: RESOLVIDO pela EXECUCAO-017.

Arquivos alterados:

- `frontend/src/screens/main/NotificationsScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Avatares de tipo trocaram placeholders por labels textuais curtos (`SO`, `ES`, `PD`, `SI`).
- Empty state, botao de voltar e contador de nao lidas nao exibem mais marcadores `??`/`?`.
- `handleNotificationPress()` agora normaliza `entityType` e usa payload real para:
  - abrir `ChatDetail` com `conversationId` e `recipientName`;
  - abrir `Profile` de estabelecimento com `establishmentId`;
  - abrir `Item` de produto com `productId`;
  - abrir `Item` de evento com `item.id`;
  - manter `post` apontando para Feed e `system` para Settings.
- Historico da EXECUCAO-016: `relatedUserId` nao foi roteado naquele momento porque o destino abriria perfil errado/conta logada. Status posterior: EXECUCAO-017 criou consumo real de perfil publico por `userId` e reativou esse roteamento.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `NotificationsScreen.tsx` para `??`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve`, `coming soon`, `placeholder` e `console.log`: apenas `??` de nullish coalescing em `item.isRead ?? false`, sem placeholder visual.

Status:

- RESOLVIDO no codigo local para placeholders visiveis e roteamento de conversa/estabelecimento/produto/evento.
- RESOLVIDO posteriormente pela EXECUCAO-017: perfil publico por `relatedUserId` usa `GET /users/:id/public-profile`.
- Pendente de smoke: validar payloads reais de notificacoes em staging/device.

### EXECUCAO-017 - Perfil publico por userId conectado ao backend - 2026-05-02

Objetivo executado:

- Corrigir o fluxo em que `FeedSocialScreen` enviava `userId`, mas `ProfileScreen` ignorava esse parametro.
- Conectar perfil publico de usuario ao endpoint real `GET /users/:id/public-profile`.
- Reativar notificacoes com `relatedUserId` para abrirem destino real.
- Remover texto de auditoria/roadmap visivel do perfil pessoal.

Arquivos alterados:

- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/users/users.spec.ts`
- `frontend/src/services/api/UserService.ts`
- `frontend/src/screens/main/ProfileScreen.tsx`
- `frontend/src/screens/main/FeedSocialScreen.tsx`
- `frontend/src/screens/main/NotificationsScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `UsersService.getPublicProfile()` agora retorna explicitamente apenas campos publicos (`id`, `name`, `username`, `avatar`, `bio`, `profileType`, `location`, `website`, `createdAt`, contadores) e inclui `postsCount`.
- `UserService` recebeu `PublicUserProfile` e `getPublicProfile(userId)`.
- `ProfileScreen` passou a aceitar `route.params.userId`, carregar perfil publico real para outro usuario e manter a conta logada apenas quando nao ha `userId` externo.
- `FeedSocialScreen` navega para `Profile` com `{ type: 'user', userId }`, que agora e contrato consumido pelo destino.
- `NotificationsScreen` voltou a rotear `relatedUserId` para `Profile` com `{ type: 'user', userId }`.
- Texto visivel que explicava blocos/roadmap no perfil pessoal foi removido; a tela agora exibe dados reais/estado vazio honesto.

Validacao executada:

- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd backend && npx jest src/modules/users/users.spec.ts --runInBand`: OK, 27 testes.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `ProfileScreen.tsx`, `FeedSocialScreen.tsx` e `NotificationsScreen.tsx` para `blocos`, `tratado`, `alvo`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `console.log`, `Em breve` e `coming soon`: sem texto de auditoria/roadmap visivel; ocorrencia restante de `placeholder` e placeholder de input no modal de comentario.

Status:

- RESOLVIDO no codigo local: perfil publico por `userId` para feed e notificacoes.
- Pendente de smoke: validar autor usuario, autor estabelecimento, usuario inexistente e notificacao com `relatedUserId`.
- Decisao futura: se o toque em autor com `profileType: ESTABLISHMENT` precisar abrir vitrine empresarial e nao perfil publico do usuario dono, enriquecer payload do feed com `establishmentId`.

### EXECUCAO-018 - Rotas auxiliares de Settings fora do release - 2026-05-02

Objetivo executado:

- Impedir que telas auxiliares sem backend real continuem registradas no `SettingsStack`.
- Manter os arquivos como backlog documentado, sem expor rota navegavel no release atual.

Arquivos alterados:

- `frontend/src/screens/navigation/RootNavigator.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Removidas do `SettingsStack` as rotas `SettingsLinkedAccounts`, `SettingsSearchRadius`, `SettingsNotifications`, `SettingsPrivacy`, `SettingsBlockedUsers`, `SettingsDevices`, `SettingsAccessHistory` e `SettingsLanguage`.
- Permanecem registradas as rotas com fluxo real ou decisao de release: `SettingsMyAccount`, `SettingsCity`, `SettingsSecurity`, `SettingsChangePassword`, `Settings2FA`, `SettingsAbout` e `SettingsDeleteAccount`.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `RootNavigator.tsx` para as rotas removidas: sem ocorrencias.

Status:

- RESOLVIDO no codigo local: configuracoes auxiliares sem backend real nao ficam acessiveis pelo navigator de producao.
- Pendente de produto/backend futuro: reexibir cada tela somente com model/DTO/controller/service/frontend reais ou decisao formal de escopo.

### EXECUCAO-019 - Item sem texto visivel de auditoria/escopo - 2026-05-02

Objetivo executado:

- Remover cards visiveis "Escopo atual" de produto e evento.
- Manter `ItemScreen` consumindo backend real sem explicar pendencias tecnicas para o usuario final.

Arquivos alterados:

- `frontend/src/screens/main/ItemScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Removido o card de produto que informava que pedido/carrinho/pagamento estavam fora do escopo.
- Removido o card de evento que informava dependencia de endpoint dedicado para deteccao antecipada de presenca.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `ItemScreen.tsx` para `Escopo atual`, `fora do escopo`, `backend`, `contrato`, `bloco`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve`, `coming soon` e `placeholder`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local: `ItemScreen` nao exibe texto de auditoria/roadmap ao usuario final.
- Pendente de smoke: validar produto real, evento real, presenca, rota invalida e banco vazio em staging/device.

### EXECUCAO-020 - Home sem badge falso de evento futuro - 2026-05-02

Objetivo executado:

- Remover o fallback `EM BREVE` para evento sem data.
- Evitar que dado ausente pareca promessa de evento futuro.

Arquivos alterados:

- `frontend/src/screens/main/HomeScreen.tsx`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `formatEventBadge()` agora retorna `SEM DATA` quando o backend nao envia data do evento.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- Varredura em `HomeScreen.tsx` para `EM BREVE`, `coming soon`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME` e `console.log`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local: Home nao usa badge de evento futuro como fallback para dado ausente.
- Pendente de smoke: validar Home com eventos com data, sem data, vazio e erro de API.

### EXECUCAO-021 - Validacao de ambiente bloqueia producao sem AWS real - 2026-05-02

Objetivo executado:

- Impedir que o backend suba em `NODE_ENV=production` com providers reais desligados.
- Transformar S3, CloudFront, SES e SNS em requisitos de configuracao para producao.
- Manter `development` e `test` livres para rodar com providers `none`.

Arquivos alterados:

- `backend/src/config/env.validation.ts`
- `backend/src/config/env.validation.spec.ts`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `validateEnvironment()` agora exige `STORAGE_PROVIDER=s3` em producao.
- `validateEnvironment()` agora exige `USE_CLOUDFRONT=true` e `CLOUDFRONT_BASE_URL` ou `AWS_CLOUDFRONT_URL` em producao quando o storage e S3.
- `validateEnvironment()` agora exige `EMAIL_PROVIDER=ses` em producao.
- `validateEnvironment()` agora exige `PUSH_PROVIDER=sns` em producao.
- `validateEnvironment()` agora exige `AWS_SNS_PLATFORM_APPLICATION_ARN` ou `AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID` em producao com SNS. Esta regra preserva a possibilidade de primeiro release Android-only sem exigir APNs/iOS antecipadamente.
- Criado teste unitario cobrindo dev sem AWS, producao bloqueada sem providers, producao com lacunas de CloudFront/SNS e producao completa.

Validacao executada:

- `cd backend && npx jest src/config/env.validation.spec.ts --runInBand`: OK, 4 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: backend nao inicia mais em producao publica com S3/CloudFront/SES/SNS desligados.
- Pendente de infra: criar secrets reais, aplicar env em staging AWS, validar healthcheck, upload S3/CloudFront, e-mail SES e push SNS em dispositivo real.

### EXECUCAO-022 - 2FA sem comentario incorreto de placeholder - 2026-05-02

Objetivo executado:

- Revisar a pendencia do plano sobre `placeholder` no backend 2FA.
- Corrigir comentario divergente sem reabrir um fluxo que ja usa secret persistido e QR real.

Arquivos alterados:

- `backend/src/modules/auth/auth.service.ts`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Removido o comentario que dizia que a verificacao 2FA usava placeholder.
- O comentario agora registra o comportamento real: `setupTwoFactorAuth()` gera e persiste `twoFactorSecret`, e `verifyTwoFactorAuth()` valida o TOTP usando esse segredo persistido.
- O plano foi ajustado para nao tratar o 2FA como stub runtime; a pendencia restante e smoke em staging/device.

Validacao executada:

- `cd backend && npx jest src/modules/auth/auth.spec.ts --runInBand`: OK, 12 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: nao ha mais comentario interno indicando placeholder no runtime 2FA.
- Pendente de smoke: ativar, validar login com 2FA e desativar 2FA em staging/device.

### EXECUCAO-023 - ItemScreen sem CTAs genericos sem backend - 2026-05-02

Objetivo executado:

- Revalidar a pendencia do plano que ainda listava CTAs genericos de item como abertos.
- Sincronizar o plano com o codigo atual sem reabrir problema ja corrigido.

Arquivos alterados:

- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Confirmado no codigo atual que `ItemScreen` nao contem mais `Agendar`, `Reservar`, `Assinar`, carrinho ou alerta de fluxo fora do MVP.
- Produto real mostra `Ver estabelecimento` e usa `catalogService.getProduct()`.
- Evento real usa `locationService.getEvent()`, `attendEvent()` e `cancelAttendance()`.
- Templates sem backend real caem em `Item indisponivel`, sem CTA fake.
- As tabelas do plano foram atualizadas para marcar a pendencia como resolvida em codigo e pendente apenas de smoke.

Validacao executada:

- Varredura em `frontend/src/screens/main/ItemScreen.tsx` para `Agendar`, `Reservar`, `Assinar`, `Carrinho`, `Comprar`, `pedido`, `MVP`, `fora do escopo`, `Fluxo fora`, `Em breve`, `coming soon`, `mock`, `fake`, `dummy`, `sample`, `TODO` e `FIXME`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local: `ItemScreen` nao exibe CTA sem backend real.
- Pendente de smoke: produto real, evento real, presenca, rota invalida e banco vazio em staging/device.

### EXECUCAO-024 - CatalogScreen sem MOCK_CATALOGS no codigo atual - 2026-05-02

Objetivo executado:

- Revalidar a pendencia P0 do plano que ainda listava `MOCK_CATALOGS` como aberta.
- Sincronizar o plano com a correcao ja existente no codigo.

Arquivos alterados:

- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Confirmado que `frontend/src/screens/main/CatalogScreen.tsx` nao contem `MOCK_CATALOGS`, `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve` ou `coming soon`.
- Confirmado que sem `establishmentId` a tela mostra `Catalogo indisponivel` e nao monta lista fake.
- Confirmado que com `establishmentId` a tela usa `catalogService.getEstablishmentProducts(establishmentId)` e navega para `Item` com `productId`.
- O plano foi atualizado para marcar o P0 historico como resolvido em codigo e pendente apenas de smoke.

Validacao executada:

- Varredura em `frontend/src/screens/main/CatalogScreen.tsx` para `MOCK_CATALOGS`, `mock`, `fake`, `dummy`, `sample`, `item-fallback`, `Em breve`, `coming soon`, `TODO` e `FIXME`: sem ocorrencias.
- Leitura de `frontend/src/services/api/CatalogService.ts`: `getEstablishmentProducts()` e `getProduct()` usam endpoints reais.

Status:

- RESOLVIDO no codigo local: catalogo nao usa dados fake no caminho de producao.
- Pendente de smoke: perfil de estabelecimento real, vitrine vazia, vitrine com produtos e rota sem `establishmentId` em staging/device.

### EXECUCAO-025 - API URL mobile obrigatoria em release build - 2026-05-02

Objetivo executado:

- Impedir fallback silencioso para dominio fixo quando `EXPO_PUBLIC_API_URL` nao estiver configurado.
- Bloquear URL local em build nao-dev.
- Manter fallback local apenas para desenvolvimento.

Arquivos alterados:

- `frontend/src/utils/runtimeApiUrl.ts`
- `frontend/src/utils/runtimeApiUrl.test.ts`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- Removido fallback hardcoded para `https://api.meuagito.com`.
- `resolveApiBaseUrl()` agora exige `EXPO_PUBLIC_API_URL` em runtime nao-dev.
- `resolveApiBaseUrl()` normaliza barra final da URL e valida URL absoluta.
- Release build com `localhost`, `127.0.0.1`, `0.0.0.0` ou `10.0.2.2` agora falha cedo.
- Desenvolvimento continua usando host Expo Android quando disponivel ou `http://localhost:3001`.
- Adicionado teste unitario para dev sem env, release sem env, release com URL local e release com URL real.

Validacao executada:

- `cd frontend && npx jest src/utils/runtimeApiUrl.test.ts --runInBand`: OK, 4 testes.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: build nao-dev nao usa mais API URL default silenciosa.
- Pendente de release: definir `EXPO_PUBLIC_API_URL` real no build staging/prod e validar chamadas em dispositivo real.

### EXECUCAO-026 - Registro automatico de push protegido por feature flag - 2026-05-02

Objetivo executado:

- Impedir que o app solicite permissao de push e tente registrar token nativo enquanto a estrategia Android/iOS via SNS + FCM/APNs nao estiver validada.
- Manter o codigo SNS/backend preparado, mas sem acionar fluxo incompleto automaticamente no release.

Arquivos alterados:

- `frontend/src/services/push/PushRegistrationService.ts`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `PushRegistrationService.registerCurrentDevice()` agora retorna sem solicitar permissao nem registrar token quando `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION` nao esta habilitado.
- Valores aceitos para habilitar: `1`, `true`, `yes` ou `on`.
- `README.md` passou a registrar que push token apos login/onboarding e opcional por flag.
- O plano passou a tratar push mobile como protegido por flag ate haver provider Android/iOS real validado.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO parcialmente no codigo local: push incompleto nao e mais acionado automaticamente por default.
- Pendente de produto/infra: decidir se push entra no primeiro release; se entrar, validar token nativo Android via FCM como transporte tecnico, APNs/iOS, SNS platform ARNs e smoke em dispositivo real.

### EXECUCAO-027 - Gestao owner basica de produtos conectada - 2026-05-02

Objetivo executado:

- Fechar a lacuna em que o backend tinha endpoints de gestao de produtos, mas o mobile so consumia leitura publica.
- Permitir que a conta dona do estabelecimento gerencie a vitrine pelo app sem mocks.

Arquivos alterados:

- `frontend/src/services/api/CatalogService.ts`
- `frontend/src/screens/main/ProductManagementScreen.tsx`
- `frontend/src/screens/main/ProfileScreen.tsx`
- `frontend/src/screens/navigation/RootNavigator.tsx`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `CatalogService` recebeu `createProduct`, `updateProduct`, `archiveProduct` e `uploadProductMedia`.
- Criada `ProductManagementScreen` com lista real, estado de loading, erro, vazio, formulario de criacao/edicao, arquivamento com confirmacao e upload de imagem principal por `expo-image-picker` + multipart.
- `RootNavigator` registrou `ProductManagement`.
- `ProfileScreen`, somente no perfil owner do estabelecimento, exibe `Gerenciar vitrine` e navega para a nova tela.
- `README.md` passou a registrar gestao owner basica de vitrine.

Validacao executada:

- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.
- `cd backend && npx jest src/modules/products/products.spec.ts --runInBand`: OK, 5 testes.
- Varredura em `ProductManagementScreen.tsx` para `mock`, `fake`, `dummy`, `sample`, `TODO`, `FIXME`, `Em breve`, `coming soon`, `console.log` e `onPress={() => {}}`: sem ocorrencias.

Status:

- RESOLVIDO no codigo local: gestao owner basica de produtos esta conectada a endpoints reais.
- Pendente de smoke: criar, editar, arquivar e enviar imagem principal em staging/device; validar 403 para nao owner e S3/CloudFront real.

### EXECUCAO-028 - Consentimento legal persistido no cadastro - 2026-05-02

Objetivo executado:

- Fechar parte do P0 LGPD/legal em que o app exigia aceite visual de Termos/Politica, mas o backend nao recebia nem persistia esse aceite.
- Registrar data e versao dos documentos legais aceitos por novos usuarios sem exigir seed ou dado manual.

Arquivos alterados:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260502190000_add_user_legal_consents/migration.sql`
- `backend/src/modules/auth/dtos/sign-up.dto.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.spec.ts`
- `frontend/src/screens/auth/SignUpScreen.tsx`
- `frontend/src/services/api/AuthService.ts`
- `frontend/src/stores/authStore.ts`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `User` recebeu `termsAcceptedAt`, `termsVersion`, `privacyPolicyAcceptedAt` e `privacyPolicyVersion`.
- Migration SQL adicionada para aplicar os campos em bancos existentes sem quebrar usuarios antigos.
- `SignUpDto` passou a exigir `termsAccepted=true` e `privacyPolicyAccepted=true`.
- `AuthService.signup()` valida o consentimento mesmo em chamada direta ao service e grava as versoes atuais de `LEGAL_DOCUMENTS`.
- Mobile envia o aceite real no payload de cadastro somente depois do checkbox obrigatorio.

Validacao executada:

- `cd backend && npx prisma generate`: OK.
- `cd backend && npx jest src/modules/auth/auth.spec.ts --runInBand`: OK, 13 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: novos cadastros exigem e persistem aceite legal versionado.
- Pendente para producao: aplicar migration em staging/prod, validar signup em device/staging, revisar conteudo juridico final, definir canal de suporte monitorado e fechar politica de retencao/anonimizacao.

### EXECUCAO-029 - Suporte configuravel e obrigatorio em release - 2026-05-02

Objetivo executado:

- Remover a dependencia de suporte hardcoded como criterio de producao.
- Exigir canal de suporte configurado no backend em `NODE_ENV=production` e no mobile em build de release.
- Manter fallback somente para desenvolvimento local.

Arquivos alterados:

- `backend/src/config/env.validation.ts`
- `backend/src/config/env.validation.spec.ts`
- `backend/src/modules/legal/legal-documents.ts`
- `backend/.env.example`
- `frontend/src/services/legal/LegalLinks.ts`
- `frontend/src/services/legal/LegalLinks.test.ts`
- `frontend/.env.example`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `SUPPORT_EMAIL` passa a ser exigido pelo backend em producao e validado como e-mail quando informado.
- Documentos legais usam `SUPPORT_EMAIL` no contato do controlador, com fallback local para dev/test.
- Mobile resolve suporte por `EXPO_PUBLIC_SUPPORT_EMAIL`; release sem env falha explicitamente, dev usa fallback local.
- Criado `frontend/.env.example` com `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL` e flags de push.

Validacao executada:

- `cd backend && npx jest src/config/env.validation.spec.ts --runInBand`: OK, 5 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npx jest src/services/legal/LegalLinks.test.ts --runInBand`: OK, 4 testes.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: suporte deixou de depender de e-mail fixo em release.
- Pendente para producao: definir e monitorar caixa/canal real, configurar envs staging/prod, validar abertura do `mailto:` em device e validar conteudo juridico final.

### EXECUCAO-030 - Redacao central de logs sensiveis - 2026-05-02

Objetivo executado:

- Reduzir o risco de vazamento de senha, token, Authorization, cookie, secret e chaves em logs estruturados.
- Manter `AuditLogService` como sanitizador de audit changes e adicionar protecao central ao `logStructured`.

Arquivos alterados:

- `backend/src/common/logging/structured-log.ts`
- `backend/src/common/logging/structured-log.spec.ts`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `logStructured` agora sanitiza recursivamente o contexto antes de serializar.
- Chaves como `password`, `token`, `accessToken`, `refreshToken`, `authorization`, `cookie`, `secret`, `apiKey`, `privateKey`, `S3_SECRET_ACCESS_KEY` e equivalentes sao redigidas como `[REDACTED]`.
- Strings com `Bearer <token>` e padroes `token=...`/`password=...` tambem sao redigidas.
- O sanitizador trata `Date`, arrays, objetos aninhados e referencia circular.

Validacao executada:

- `cd backend && npx jest src/common/logging/structured-log.spec.ts src/common/audit/audit-log.service.spec.ts --runInBand`: OK, 5 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: logs estruturados passam por redacao central antes de sair para console/CloudWatch.
- Pendente para producao: validar logs reais em staging/CloudWatch com falhas de auth, email, push, upload e requests 4xx/5xx.

### EXECUCAO-031 - Deep links de e-mail para verificacao e reset - 2026-05-02

Objetivo executado:

- Fechar a lacuna em que e-mails geravam links `/verify-email?token=...` e `/reset-password?token=...`, mas o app nao tinha scheme/linking nem leitura de token por rota.
- Preparar o app para abrir links de verificacao e reset por `meuagito://`.

Arquivos alterados:

- `frontend/app.json`
- `frontend/src/App.tsx`
- `frontend/src/screens/navigation/linking.ts`
- `frontend/src/screens/navigation/linking.test.ts`
- `frontend/src/screens/auth/VerifyEmailScreen.tsx`
- `frontend/src/screens/auth/ForgotPasswordScreen.tsx`
- `backend/.env.example`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`
- `STATUS_EXECUCAO_PROMPT_AWS_2026-04-26.md`

Implementacao:

- `app.json` registrou `scheme: "meuagito"`.
- `NavigationContainer` recebeu `navigationLinking` fora do modo web preview.
- Criada config de linking para `verify-email`, `reset-password` e rotas top-level de item/catalogo/notificacoes.
- `VerifyEmailScreen` e `ForgotPasswordScreen` leem `route.params.token` e preenchem o campo de codigo.
- `backend/.env.example` documenta que `FRONTEND_URL` pode usar `meuagito://` em staging/prod para links de e-mail mobile.

Validacao executada:

- `cd frontend && npx jest src/screens/navigation/linking.test.ts --runInBand`: OK, 1 teste.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd frontend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: deep link mobile de verificacao/reset esta configurado.
- Pendente para producao: validar em device real com `meuagito://verify-email?token=...`, `meuagito://reset-password?token=...`, SES real e `FRONTEND_URL` staging/prod.

### EXECUCAO-032 - ProfileSelection, Atividade, Favoritos, Historico e Configuracoes - 2026-05-03

Objetivo executado:

- Resolver telas/fluxos apontados pelo usuario como parciais: `ProfileSelection`, `Activity`, `ActivityFavorites`, `ActivityHistory`, `Settings`, `SettingsSecurity` e esclarecer `SettingsAbout`.
- Usar evidencia da documentacao antiga/canonica antes de alterar Atividade.
- Evitar mock, botao sem acao e alerta "em breve" em producao.

Evidencia usada:

- `doc/02_UX_FLUXOS/14_T_ATIVIDADE.md` define `T_ATIVIDADE` como hub pessoal.
- Fase 1.0 ativa apenas `Meus Favoritos` e `Historico de Atividades`.
- `Pedidos`, `Agendamentos` e `Reservas` sao fase 1.2+; por isso nao foram implementados como fluxo fake nem mantidos como botao sem acao.
- `doc/02_UX_FLUXOS/15_T_CONFIG_CONFIGURACOES.md` define `Sobre` como "Sobre o Meu Agito", ou seja, sobre o app/produto, nao sobre o usuario. Dados do usuario continuam em `Minha conta`.

Arquivos alterados:

- `backend/src/modules/establishments/establishments.controller.ts`
- `backend/src/modules/establishments/establishments.service.ts`
- `frontend/src/services/api/LocationService.ts`
- `frontend/src/services/activity/ActivityHistoryService.ts`
- `frontend/src/screens/auth/ProfileSelectionScreen.tsx`
- `frontend/src/screens/main/ActivityScreen.tsx`
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx`
- `frontend/src/screens/main/ActivityHistoryScreen.tsx`
- `frontend/src/screens/main/ProfileScreen.tsx`
- `frontend/src/screens/main/SearchScreen.tsx`
- `frontend/src/screens/main/ItemScreen.tsx`
- `frontend/src/screens/main/SettingsScreen.tsx`
- `frontend/src/screens/main/SettingsPrivacyScreen.tsx`
- `frontend/src/screens/main/SettingsSecurityScreen.tsx`
- `frontend/src/screens/main/SettingsAuxScreens.tsx`
- `frontend/src/screens/navigation/RootNavigator.tsx`

Implementacao:

- `ProfileSelection` recebeu texto/acoes mais claras e link real para login.
- Criado endpoint autenticado `GET /establishments/me/favorites` para listar favoritos reais do usuario.
- `Activity` virou hub real com cards ativos de Favoritos e Historico, carregando contadores reais.
- `ActivityFavorites` lista estabelecimentos favoritos vindos do backend, abre perfil real e remove favorito via backend.
- `ProfileScreen` agora permite salvar/remover estabelecimento favorito e atualiza contador.
- `ActivityHistoryService` persiste historico local via AsyncStorage conforme especificacao antiga (`meuagito_hist_buscas`, `meuagito_hist_vistos`, `meuagito_hist_checkins`).
- `SearchScreen` grava buscas reais feitas pelo usuario.
- `ProfileScreen` e `ItemScreen` gravam vistos recentemente.
- `ActivityHistory` mostra buscas/vistos/check-ins locais, permite abrir destino real e excluir itens selecionados.
- `SettingsPrivacy` foi registrada no navigator e virou tela real de privacidade/dados/LGPD com acoes validas: politica, termos, permissoes do sistema e exclusao de conta.
- `SettingsSecurity` agora consulta backend para status de 2FA/e-mail verificado e remove aparencia de toggle local falso para alerta de seguranca.
- `SettingsAbout` foi renomeada visualmente para `Sobre o Meu Agito`, deixando claro que e sobre o app.

Validacao executada:

- `cd backend && npm run build`: OK.
- `cd frontend && npx tsc --noEmit`: OK.
- `cd backend && npm run lint`: OK.
- `cd frontend && npm run lint`: OK.
- `cd backend && npx jest src/modules/establishments/establishments.spec.ts --runInBand`: OK, 20 testes.

Status:

- RESOLVIDO no codigo local: Atividade/Favoritos/Historico deixaram de ser apenas telas vazias.
- RESOLVIDO no codigo local: favoritos de estabelecimento agora tem fluxo ponta a ponta frontend/backend.
- RESOLVIDO no codigo local: Configuracoes expõe privacidade/dados e seguranca sem acao fake.
- DECISAO DE ESCOPO: Pedidos, Agendamentos e Reservas continuam fora do release atual por nao existirem model/backend compatíveis no MVP.
- Pendente para producao: smoke mobile em device para navegacao entre Activity -> Favoritos -> Perfil, salvar/remover favorito, historico de busca/visto e abertura de permissoes do sistema.
- Pendente para evolucao: favoritos de eventos/produtos exigem model/endpoint proprio; check-in exige fluxo de criacao de check-in antes de gerar historico real.

### EXECUCAO-033 - Separacao de staging economico e producao real - 2026-05-03

Objetivo executado:

- Separar o caminho de validacao inicial em AWS staging economico do caminho de producao publica.
- Permitir validar backend real em EC2 Linux + RDS PostgreSQL + S3 antes de contratar toda a pilha final.
- Manter uma unica base de codigo: nao existe projeto separado para teste e producao; a separacao e por `DEPLOY_ENV` e variaveis provisionadas.

Decisao tecnica:

- `NODE_ENV=production` continua sendo o runtime de build/deploy para staging e producao.
- `DEPLOY_ENV=staging` permite reduzir custo inicial: Redis/Valkey, SES, SNS e CloudFront podem ficar desativados enquanto o staging economico e validado, mas S3 continua obrigatorio para validar upload/midia real.
- `DEPLOY_ENV=production` mantem criterio estrito: Redis/Valkey, S3, CloudFront, SES e SNS sao obrigatorios para release publico.
- Se `DEPLOY_ENV` for omitido com `NODE_ENV=production`, o backend assume `DEPLOY_ENV=production` para preservar seguranca e evitar liberar producao relaxada por engano.
- S3 nao exige access key fixa quando a AWS fornecer credenciais por IAM role da EC2/ECS.

Arquivos alterados:

- `backend/src/config/deploy-env.ts`
- `backend/src/config/env.validation.ts`
- `backend/src/config/env.validation.spec.ts`
- `backend/src/common/cache/cache.service.ts`
- `backend/src/common/rate-limit/redis-throttler.storage.ts`
- `backend/src/common/rate-limit/redis-throttler.storage.spec.ts`
- `backend/src/common/realtime/redis-io.adapter.ts`
- `backend/src/modules/health/health.service.ts`
- `backend/.env.example`
- `backend/.env.staging.example`
- `backend/.env.production.example`
- `README.md`
- `PLANO_CORRECAO_PRODUCAO_MEU_AGITO.md`

Implementacao:

- Criado helper central `deploy-env.ts` para resolver `local`, `staging` e `production`.
- `validateEnvironment` passou a validar `DEPLOY_ENV` e distinguir deploy gerenciado de producao publica.
- `CacheService`, `RedisThrottlerStorage`, `RedisIoAdapter` e `/health` passaram a exigir Redis somente em `DEPLOY_ENV=production`.
- Staging com `NODE_ENV=production` + `DEPLOY_ENV=staging` exige S3, mas pode usar fallback em memoria para cache/rate limit/realtime enquanto Redis nao for provisionado.
- Producao com `DEPLOY_ENV=production` continua falhando se Redis estiver desativado ou indisponivel.
- Criados exemplos separados de env para staging economico e producao final.
- README documenta que staging pode iniciar em EC2/RDS/S3 e depois evoluir para a arquitetura final ECS/Fargate sem trocar base de codigo.

Validacao executada:

- `cd backend && npx jest src/config/env.validation.spec.ts src/common/rate-limit/redis-throttler.storage.spec.ts --runInBand`: OK, 12 testes.
- `cd backend && npm run build`: OK.
- `cd backend && npm run lint`: OK.

Status:

- RESOLVIDO no codigo local: existe separacao objetiva entre staging economico e producao real.
- RESOLVIDO no codigo local: staging pode rodar sem Redis obrigatorio sem quebrar bootstrap, rate limit ou health check.
- RESOLVIDO no codigo local: producao continua com bloqueios estritos para dependencias AWS finais.
- RESOLVIDO no codigo local: env de S3 aceita IAM role da AWS sem obrigar access key hardcoded.
- Pendente para staging: provisionar EC2, RDS, S3, security groups, IAM role, secrets/SSM e dominio/API URL real.
- Pendente para producao: apos staging passar, provisionar ECS/Fargate/ECR, ElastiCache/Valkey, CloudFront, ALB/ACM, SES, SNS e observabilidade final.
- Pendente para release mobile: build apontando para staging primeiro; somente depois trocar para API de producao.

### EXECUCAO-034 - Staging AWS economico online - 2026-05-04

Objetivo executado:

- Subir o primeiro backend staging real em AWS para teste individual, sem ainda contratar a pilha final de producao.

Infra validada:

- S3 staging com public access block, criptografia AES256 e ownership enforced.
- IAM role/instance profile para EC2 acessar S3 e SSM sem access key fixa.
- Security groups com RDS aceitando 5432 somente da EC2 e backend 3001 somente do IP de teste.
- RDS PostgreSQL staging privado, criptografado, `db.t4g.micro`, database `meuagito_staging`.
- SSM SecureString para senha RDS, `DATABASE_URL`, `JWT_SECRET` e `REFRESH_TOKEN_SECRET`.
- EC2 Amazon Linux 2023 ARM `t4g.micro`, SSM online, Node `v20.20.2`.
- Backend instalado em `/opt/meuagito/backend` e rodando via systemd `meuagito-backend`.

Validacao executada:

- `npx prisma migrate deploy`: OK, 7 migrations aplicadas.
- `npx prisma generate`: OK.
- `npm run build`: OK.
- `systemctl status meuagito-backend`: `active (running)`.
- `meuagito-backend.service`: `enabled`; continua rodando apos fechar SSM/PowerShell, reinicia se o Node cair e sobe no boot da EC2.
- Health interno EC2: OK.
- Health externo `http://18.228.6.219:3001/health`: OK, database conectado e storage S3 configurado.

Status:

- RESOLVIDO no staging: backend real responde na AWS com RDS e S3.
- RESOLVIDO no staging: backend fica persistente como servico `systemd`, sem depender de sessao SSM aberta.
- RESOLVIDO no staging: `POST /auth/signup` criou usuario real no RDS e retornou tokens.
- Pendente para concluir staging funcional: smoke auth/signup/login, upload real para S3, fluxos principais do app e build mobile apontando para staging.
- Pendente para producao publica: ALB/ACM/HTTPS, CloudFront, ElastiCache/Valkey, SES, SNS, ECS/Fargate, dominio e observabilidade CloudWatch final.

Validacao complementar de auth:

- `POST http://18.228.6.219:3001/auth/signup`: OK em 2026-05-04.
- Usuario criado: `smoke+20260504003829@meuagito.com`.
- Tokens retornados: OK, salvos apenas em `.local-secrets` com DPAPI.
- `verificationEmailSent=false`: esperado no staging inicial com `EMAIL_PROVIDER=none`.
- `POST http://18.228.6.219:3001/auth/login`: OK em 2026-05-04.
- Login retornou access token, refresh token e `expiresIn=900`.
- `GET http://18.228.6.219:3001/users/me` com Bearer token: OK em 2026-05-04.
- Cadeia `signup -> login -> JWT -> users/me`: OK no staging real.
- `POST http://18.228.6.219:3001/media/upload/avatar`: OK em 2026-05-04.
- Upload retornou `Provider=S3`, bucket staging e path `avatars/...png`.
- `aws s3api head-object` do avatar: OK, `ContentType=image/png`, `ServerSideEncryption=AES256`.
- `GET http://18.228.6.219:3001/feed/agito` com Bearer token: OK, retornou `data=[]` e `hasMore=false` em banco vazio.
- `GET http://18.228.6.219:3001/search/global?q=naoexiste-smoke-20260504` com Bearer token: OK, retornou arrays vazios e `total=0` em banco vazio.
- `GET http://18.228.6.219:3001/establishments`: OK, retornou `data=[]`, `total=0`, `totalPages=0` em banco vazio.
- `POST http://18.228.6.219:3001/establishments` com token de conta `USER`: retornou `FORBIDDEN`, esperado pela regra de negocio.
- `POST http://18.228.6.219:3001/auth/signup` com `profileType=ESTABLISHMENT`: OK em 2026-05-04.
- Conta empresarial criada: `smoke-business+20260504005654@meuagito.com`.
- `POST http://18.228.6.219:3001/establishments` com token empresarial: OK em 2026-05-04.
- Estabelecimento criado: `Smoke Bar Staging`, id `cmoqo5mfy000fubvhz5khnkio`.
- `GET http://18.228.6.219:3001/establishments`: OK, retornou `total=1` com o estabelecimento real criado.
- `GET http://18.228.6.219:3001/establishments/cmoqo5mfy000fubvhz5khnkio`: OK, detalhe real retornado; produtos ainda `null`/`0`.
- `POST http://18.228.6.219:3001/establishments/cmoqo5mfy000fubvhz5khnkio/products` com token do dono: OK em 2026-05-04.
- Produto criado: `Combo Smoke Staging`, id `cmoqobh70000iubvhxnldzovo`.
- `GET http://18.228.6.219:3001/establishments/cmoqo5mfy000fubvhz5khnkio/products`: OK, retornou produto real; imagens `null` antes de upload.
- `GET http://18.228.6.219:3001/products/cmoqobh70000iubvhxnldzovo`: OK, detalhe do produto real validado.

Pendencia planejada para popular banco:

- Criar importacao controlada de CSV de estabelecimentos pre-cadastrados.
- Dados importados nao devem virar contas reais automaticamente.
- Estabelecimentos importados devem entrar como nao reivindicados, com dono ausente, origem identificada e status de reivindicacao pendente.
- Fluxo futuro: dono real cria conta empresarial, encontra o estabelecimento, solicita reivindicacao e, apos validacao/aprovacao, passa a administrar o perfil.
- Antes de producao publica, validar origem/licenca dos dados importados e riscos juridicos de dados obtidos por scraping.

Resumo de bloqueadores absolutos antes de deploy publico real:

1. AWS real ponta a ponta: ECS/ECR/RDS/ElastiCache/S3/CloudFront/ALB/ACM/Secrets.
2. Migrations aplicadas no banco alvo.
3. Redis externo validado em producao.
4. SES real validado para verificacao/reset.
5. Push real validado em device via SNS + FCM/APNs, ou push formalmente fora do primeiro release.
6. Smoke mobile manual completo.
7. Conteudo juridico final, canal de suporte monitorado, retencao/anonimizacao LGPD e validacao CloudWatch sem vazamento sensivel.
8. Remocao/correcao dos mocks P0 do PROMPT-006.
9. Build final backend e mobile com env de producao, sem `localhost`.
