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

### B3 - Settings tem varias telas parciais, fake ou apenas locais

Evidencias:

- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:40-47` usa dados fixos de conta.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:53` simula carregamento com `setTimeout`.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:63-66` tem botoes de camera/galeria com `onPress: () => {}`.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:75-77` simula salvar perfil.
- Status atualizado em 2026-05-01: os quatro achados acima de `SettingsMyAccountScreen` foram RESOLVIDOS no codigo local pela EXECUCAO-004. A tela agora carrega `userStore.getProfile()`, salva dados de conta via `PUT /users/me`, salva bio via `PUT /users/me/profile` e envia avatar por `POST /users/me/avatar`. Pendencias remanescentes: smoke mobile/staging, S3/CloudFront real para avatar e fluxo final de verificacao de e-mail se o e-mail for alterado.
- `frontend/src/screens/main/SettingsCityScreen.tsx:22-29` usa cidades fixas e historico local.
- `frontend/src/screens/main/SettingsCityScreen.tsx:44-52` confirma cidade apenas em estado local.
- `frontend/src/screens/main/SettingsScreen.tsx:88-93` alterna GPS somente em estado local.
- `frontend/src/screens/main/SettingsScreen.tsx:149-163` desativa conta apenas com alerta local.
- `frontend/src/screens/main/SettingsPrivacyScreen.tsx:31-34` tem comentario `Load privacy settings` sem implementacao.
- `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29` tem comentario `Load security settings` sem implementacao.
- `frontend/src/screens/main/SettingsAuxScreens.tsx:102-126` mostra contas vinculadas e raio de busca estaticos.
- `frontend/src/screens/main/SettingsAuxScreens.tsx:200-210` mostra trocar senha como scaffold, sem formulario real.
- `frontend/src/screens/main/SettingsAuxScreens.tsx:375-398` mostra dispositivos e historico de acesso fake.

Impacto:

- Usuario consegue interagir com configuracoes que nao persistem ou nao executam acao real.

Correcao:

- Conectar cada tela a contrato backend real ou remover/esconder do build de producao.

### B4 - Onboarding pessoal nao persiste perfil

Evidencias:

- `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-79` simula disponibilidade de username com `setTimeout` e `includes('taken')`.
- `frontend/src/screens/auth/PersonalSetupScreen.tsx:81-87` finaliza chamando apenas `completeOnboarding()`.

Impacto:

- Dados de perfil pessoal, username, cidade e interesses nao ficam garantidos no backend.

Correcao:

- Criar endpoints/servicos para salvar setup pessoal e validar username de forma real.

### B5 - Activity, Favoritos e Historico existem, mas nao estao completos

Evidencias:

- `frontend/src/screens/main/ActivityScreen.tsx:40-54` marca cards como `coming_soon`.
- `frontend/src/screens/main/ActivityScreen.tsx:70-71` mostra alerta `Em breve`.
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx:27-31` declara que favoritos ainda nao estao sincronizados.
- `frontend/src/screens/main/ActivityFavoritesScreen.tsx:43-46` declara falta de endpoint dedicado ou estrategia oficial.
- `frontend/src/screens/main/ActivityHistoryScreen.tsx:27-31` declara que historico consolidado ainda nao existe no backend.
- `frontend/src/screens/main/ActivityHistoryScreen.tsx:36-39` declara falta de endpoint canonico.

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

- O app ainda pode exibir catalogo/item como se fossem reais quando estao em modo mock ou incompleto.

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

- `frontend/src/screens/main/NotificationsScreen.tsx:49-69` usa `??` como avatar.
- `frontend/src/screens/main/NotificationsScreen.tsx:306-319` exibe `??` e `?`.
- `frontend/src/screens/main/NotificationsScreen.tsx:335` exibe `??` no contador.
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
- `frontend/src/services/api/CatalogService.ts:22-27` possui apenas leitura de produtos.

Problema:

- Ha superficie backend de gestao de produtos sem tela owner correspondente pronta para producao.

Correcao:

- Criar tela de gestao de catalogo/produtos para owner ou declarar explicitamente fora do primeiro release e bloquear acesso.

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
3. Conectar troca de cidade ao estado/backend definido.
4. Persistir privacidade e raio de busca, ou remover do release.
5. Implementar `SettingsChangePasswordScreen` usando endpoint real de troca de senha.
6. Substituir dispositivos/historico fake por endpoint real ou remover telas.
7. Corrigir desativacao de conta para acao backend real ou remover do release.

Criterio de aceite:

- Nenhuma configuracao exibida funciona apenas em estado local quando deveria persistir.
- Nenhum botao de Settings fica sem acao real.

### Fase 3 - Onboarding pessoal

1. Criar endpoint de disponibilidade de username ou usar contrato existente, se houver.
2. Persistir username, cidade e interesses no backend.
3. Ajustar `completeOnboarding()` para rodar somente depois da persistencia.
4. Validar fluxo cadastro pessoal completo.

Criterio de aceite:

- Usuario pessoal recem-criado entra no app com perfil salvo no backend.
- Username duplicado e rejeitado pelo backend.

### Fase 4 - Activity, Favoritos e Historico

1. Decidir se Favoritos e Historico entram no primeiro release.
2. Se entrarem, criar endpoints canonicos e conectar telas.
3. Se nao entrarem, remover cards/rotas visiveis do build.
4. Remover alertas `Em breve` do caminho de producao.

Criterio de aceite:

- Area Activity nao exibe funcionalidade futura como se fosse produto pronto.

### Fase 5 - Catalogo, Item e gestao owner

1. Remover `MOCK_CATALOGS` do fluxo publico.
2. Garantir que Catalog sempre use `establishmentId` real ou mostre estado vazio honesto.
3. Remover `item-fallback` do fluxo publico.
4. Remover botoes de pedido/reserva/agenda/assinatura fora do MVP ou implementar contratos reais.
5. Criar tela owner para criar/editar/arquivar produto se gestao de catalogo fizer parte do release.

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
| `backend/src/config/env.validation.ts:96-160` | Producao exige Redis, mas nao exige S3/SES/SNS reais | Endurecer validacao para release 100% real |
| `backend/src/modules/media/storage.service.ts:92-101` | Provider diferente de `s3` cai para local | Impedir storage local em producao real |
| `backend/src/common/email/email.service.ts:51-55` | E-mail pode ficar desabilitado | Exigir SES no ambiente final |
| `backend/src/common/notification/notification.service.ts:48-52` | Push pode ficar desabilitado | Exigir SNS no ambiente final |
| `docker-compose.yml:79-82` | Storage/email/push desligados no runtime local | Nao usar compose local como prova de producao |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-87` | Username e onboarding pessoal simulados | Validar e persistir no backend |
| `frontend/src/screens/main/ActivityScreen.tsx:40-71` | Cards `coming_soon` e alerta `Em breve` | Implementar ou remover |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx:27-46` | Favoritos sem lista backend | Criar endpoint/lista ou remover |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx:27-39` | Historico sem contrato backend | Criar contrato ou remover |
| `frontend/src/screens/main/CatalogScreen.tsx` | RESOLVIDO no codigo local: removido `MOCK_CATALOGS`; rota sem `establishmentId` mostra estado honesto | Validar smoke mobile/staging com estabelecimento real |
| `frontend/src/screens/main/ItemScreen.tsx` | RESOLVIDO no codigo local: removido `item-fallback` e CTA generico sem backend | Validar produto/evento real em device/staging |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-004: conta deixou de usar dados fixos, upload vazio e save simulado | Validar smoke mobile/staging, S3/CloudFront de avatar e alteracao de e-mail |
| `frontend/src/screens/main/SettingsCityScreen.tsx:22-52` | Cidade e recentes locais | Persistir preferencia real |
| `frontend/src/screens/main/SettingsScreen.tsx:88-163` | Toggle/acao local | Conectar backend ou remover |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx:31-34` | Privacidade nao carrega/persiste | Criar contrato e conectar |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29` | Seguranca sem carregamento real | Criar contrato e conectar |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:200-210` | Troca de senha scaffold | Implementar formulario e endpoint |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:375-398` | Dispositivos/historico fake | Criar endpoint ou remover |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:102-112` | Contas vinculadas existe e esta registrada, mas nao tem entrada acessivel no menu de Settings | Adicionar item de menu real ou remover rota |
| `frontend/src/screens/main/FeedSocialScreen.tsx:242-245` + `frontend/src/screens/main/ProfileScreen.tsx:148-192` | Avatar do autor no feed envia `userId`, mas `ProfileScreen` nao carrega perfil publico por `userId` e estabelecimento exige `establishmentId` | Passar `establishmentId` quando autor for estabelecimento e implementar perfil publico de usuario por `userId` |
| `frontend/src/screens/main/NotificationsScreen.tsx:233-249` | Clique em notificacao perde parametros de usuario/conversa/entidade e navega so para tabs genericas | Roteamento por `entityType`, `entityId`, `relatedUserId` e `conversationId` |
| `frontend/src/services/api/UserService.ts` | RESOLVIDO no codigo local: Delete account envia senha para `DELETE /users/me` | Validar smoke mobile/staging |
| `backend/src/modules/users/users.controller.ts` + `backend/src/modules/users/users.service.ts` | RESOLVIDO no codigo local: backend valida senha e revoga refresh tokens antes do soft delete | Validar senha correta/incorreta e tokens |
| `frontend/src/screens/main/NotificationsScreen.tsx:49-69` | Placeholders `??` | Trocar por icones/textos reais |
| `backend/src/modules/products/products.controller.ts:56-112` | Gestao de produtos existe no backend sem UI owner pronta | Criar tela owner ou remover do release |
| `frontend/src/utils/runtimeApiUrl.ts:4-43` | Producao cai para `https://api.meuagito.com` se `EXPO_PUBLIC_API_URL` nao existir | Validar DNS/ALB ou exigir `EXPO_PUBLIC_API_URL` no build |
| `frontend/app.json:17-44` | Push mobile nao deve depender de Firebase/google-services; Android e iOS precisam de estrategia final sem Firebase | Definir push via SNS/APNs e alternativa Android compativel com a decisao de nao usar Firebase, ou retirar push real do primeiro release |
| `frontend/src/screens/main/MapScreen.tsx:111-131` | Item da lista do mapa e `TouchableOpacity` sem `onPress` | Conectar item a Perfil/Item ou trocar por `View` nao clicavel |
| `frontend/src/App.tsx:70-76` | `NavigationContainer` nao recebe config `linking` | Implementar deep links se push/e-mail/link externo precisarem abrir telas internas |
| `frontend/src/screens/auth/SignUpScreen.tsx:61-67` | `SignUp` sem `profileType` fica em loading infinito | Redirecionar para `ProfileSelection` ou exibir erro acionavel |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx:104-106` | Botao "Usar minha localizacao atual" define `Sao Paulo, SP` fixo | Usar geolocalizacao real ou remover acao |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx:119-124` | Avatar do setup pessoal alterna apenas estado local | Implementar picker/upload real ou remover acao |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx:253-266` | Pular/proximo/finalizar setup nao persistem dados pessoais | Persistir antes de completar onboarding |
| `frontend/src/screens/main/SearchScreen.tsx:52` + `frontend/src/screens/main/SearchScreen.tsx:295-299` | `RECENT_SEARCHES` e estatico apesar de parecer historico/acao real | Persistir buscas recentes reais ou renomear como sugestoes fixas |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:129-154` | Preferencias de notificacao e idioma sao estaticas/sem persistencia | Criar contratos reais ou ocultar do release |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:188-210` | Bloqueados e alterar senha sao scaffolds sem lista/formulario real | Implementar lista real e formulario de senha ou remover entradas |
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
- [ ] Onboarding pessoal persistindo no backend.
- [ ] Onboarding business validado ponta a ponta.
- [ ] Settings persistindo dados reais ou ocultando itens fora do release.
- [ ] Favoritos/historico implementados ou removidos.
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
| Onboarding pessoal | Mockado/estatico/fake | `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-87` | Username e persistencia nao sao reais |
| Feed | Implementado e funcional em codigo | `frontend/src/services/api/FeedService.ts`, `backend/src/modules/feed/feed.controller.ts` | Ainda depende de smoke real |
| Busca | Implementado e funcional em codigo | `frontend/src/services/api/SearchService.ts`, `backend/src/modules/search/search.controller.ts` | Ainda depende de smoke real |
| Perfil estabelecimento | Implementado e funcional em codigo | `frontend/src/screens/main/ProfileScreen.tsx`, `frontend/src/services/api/LocationService.ts` | Estados vazios reais existem |
| Catalogo publico de produto | Implementado no codigo local; smoke pendente | `frontend/src/screens/main/CatalogScreen.tsx` | Real quando recebe `establishmentId`; rota sem contexto mostra estado honesto sem mock |
| Item produto/evento | Implementado no codigo local para produto/evento; smoke pendente | `frontend/src/screens/main/ItemScreen.tsx` | Produto/evento real; templates genericos sem backend nao exibem CTA fake |
| Chat | Implementado e funcional em codigo | `frontend/src/screens/main/ChatScreen.tsx`, `backend/src/modules/chat/chat.gateway.ts` | Requer smoke 2 usuarios e Redis externo |
| Notificacoes in-app | Implementado e funcional em codigo | `frontend/src/services/api/NotificationsService.ts:69-105`, `backend/src/modules/notifications/notifications.controller.ts:29-100` | Tela ainda tem placeholders visuais |
| Push real | Pendente para producao/deploy | `backend/src/common/notification/notification.service.ts:48-52` | SNS pode ficar desabilitado |
| E-mail real | Pendente para producao/deploy | `backend/src/common/email/email.service.ts:51-55` | SES pode ficar desabilitado |
| Midia real | Pendente para producao/deploy | `backend/src/modules/media/storage.service.ts:92-101` | S3 existe, mas storage local ainda e fallback por config |
| Redis real | Pendente para producao/deploy | `backend/src/config/env.validation.ts:84-94` | Producao exige Redis, mas falta validar Redis externo alvo |
| Configuracoes | Criado parcialmente / mockado | `frontend/src/screens/main/Settings*.tsx` | Varias telas nao persistem |
| AWS/deploy | Pendente para producao/deploy | `README.md:619-625` | Ambiente final ainda nao validado |

Tabela de problemas exigida pelo prompt:

| Arquivo | Problema | Tipo do problema | Impacto | Evidencia no codigo | Correcao necessaria | Prioridade |
|---|---|---|---|---|---|---|
| `README.md` | O projeto declara pendencias de AWS real, migrations, SES, SNS, Redis externo e smoke mobile | Pendente para producao/deploy | Nao pode ser considerado pronto para deploy real | `README.md:619-625` | Fechar checklist de ambiente real e registrar evidencias | P0 |
| `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md` | Observabilidade AWS, deploy AWS e validacao mobile manual ainda pendentes | Pendente para producao/deploy | Sem prova de operacao real em AWS/mobile | `doc/00_GOVERNANCA/01_ESTADO_ATUAL_2026-04-23.md:61-70` | Executar AWS real e smoke mobile | P0 |
| `backend/src/config/env.validation.ts` | Producao exige Redis, mas nao exige S3/SES/SNS reais | Pendente para producao/deploy | App pode subir em producao sem midia, email e push reais | `backend/src/config/env.validation.ts:96-160` | Exigir `STORAGE_PROVIDER=s3`, `EMAIL_PROVIDER=ses` e `PUSH_PROVIDER=sns` em producao real | P0 |
| `backend/src/modules/media/storage.service.ts` | Provider diferente de `s3` cai para storage local | Pendente para producao/deploy | Upload pode gravar localmente em vez de S3 se env estiver incompleto | `backend/src/modules/media/storage.service.ts:92-101` | Bloquear provider local em `NODE_ENV=production` | P0 |
| `backend/src/common/email/email.service.ts` | E-mail fica desabilitado quando provider nao e `ses` | Pendente para producao/deploy | Reset/verificacao por e-mail nao ficam reais | `backend/src/common/email/email.service.ts:51-55` | Exigir SES e validar envio real | P0 |
| `backend/src/common/notification/notification.service.ts` | Push fica desabilitado quando provider nao e `sns` | Pendente para producao/deploy | Push real nao funciona sem erro de build/start | `backend/src/common/notification/notification.service.ts:48-52` | Exigir SNS e validar ARNs por plataforma | P0 |
| `frontend/src/utils/runtimeApiUrl.ts` | Build de producao cai para `https://api.meuagito.com` se `EXPO_PUBLIC_API_URL` nao existir | Pendente para producao/deploy | App pode apontar para dominio nao validado no release | `frontend/src/utils/runtimeApiUrl.ts:4-43` | Validar DNS/ALB ou exigir `EXPO_PUBLIC_API_URL` no build | P0 |
| `frontend/app.json` | Estrategia de push mobile sem Firebase ainda precisa ser fechada para Android/iOS | Pendente para producao/deploy | Push real pode ficar fora do release ou sem token nativo em Android | `frontend/app.json:17-44`; decisao do projeto: sem Firebase/Render | Definir SNS/APNs e alternativa Android sem Firebase, ou declarar push fora do MVP | P1 |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Disponibilidade de username e finalizacao de perfil sao simuladas | Mockado/estatico/fake | Perfil pessoal pode concluir onboarding sem persistencia real | `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-87` | Criar/usar endpoint real de username e salvar setup pessoal | P0 |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-004: dados de conta, bio e avatar passaram a usar services reais | Pendente smoke | Usuario edita perfil usando backend real; producao ainda depende de smoke e S3/CloudFront | `SettingsMyAccountScreen.tsx`; `UserService.ts`; `userStore.ts`; `users.service.ts`; `update-user.dto.ts` | Validar device/staging, upload em S3/CloudFront e alteracao de e-mail/username duplicado | P0 ate smoke |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Cidades e recentes sao locais/fixos | Mockado/estatico/fake | Preferencia de cidade nao persiste | `frontend/src/screens/main/SettingsCityScreen.tsx:22-52` | Conectar preferencia real ou remover tela | P1 |
| `frontend/src/screens/main/SettingsScreen.tsx` | GPS e desativacao de conta sao acoes locais/alerta | Quebrado ou sem ligacao | Usuario ve acao sem efeito backend | `frontend/src/screens/main/SettingsScreen.tsx:88-163` | Persistir preferencias e implementar desativacao real | P0 |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | Privacidade tem comentario de load, mas nao carrega/persiste | Criado parcialmente | Preferencias de privacidade nao sao reais | `frontend/src/screens/main/SettingsPrivacyScreen.tsx:31-34` | Criar contrato backend ou remover do release | P1 |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Seguranca tem comentario de load, mas nao carrega dados reais | Criado parcialmente | Tela passa impressao de seguranca sem estado real | `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29` | Criar contrato real para estado de seguranca | P1 |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Trocar senha e dispositivos/historico sao scaffolds/estaticos | Criado parcialmente | Fluxos de seguranca ficam incompletos | `frontend/src/screens/main/SettingsAuxScreens.tsx:200-210`, `375-398` | Implementar formularios/endpoints ou remover | P0 |
| `frontend/src/screens/main/ActivityScreen.tsx` | Cards `coming_soon` exibem alerta `Em breve` | Criado parcialmente | Area principal mostra recurso nao entregue | `frontend/src/screens/main/ActivityScreen.tsx:40-71` | Implementar ou ocultar cards | P1 |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | Tela declara falta de endpoint/lista consolidada | Criado parcialmente | Favoritos nao estao consumiveis nesta area | `frontend/src/screens/main/ActivityFavoritesScreen.tsx:27-46` | Criar endpoint/lista ou remover tela | P1 |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | Tela declara falta de contrato canonico de historico | Criado parcialmente | Historico nao e funcional | `frontend/src/screens/main/ActivityHistoryScreen.tsx:27-39` | Criar contrato ou remover tela | P1 |
| `frontend/src/screens/main/CatalogScreen.tsx` | RESOLVIDO no codigo local: `MOCK_CATALOGS` removido e rota sem `establishmentId` nao renderiza catalogo fake | Pendente smoke | Evita produtos/servicos fake no caminho publico | `frontend/src/screens/main/CatalogScreen.tsx` | Validar com estabelecimento real e banco vazio em staging | P0 ate smoke |
| `frontend/src/screens/main/ItemScreen.tsx` | RESOLVIDO no codigo local: `item-fallback` e CTA generico removidos | Pendente smoke | Evita CTA de pedido/reserva/agenda sem backend | `frontend/src/screens/main/ItemScreen.tsx` | Validar produto/evento real e rota invalida em device/staging | P0 ate smoke |
| `frontend/src/services/api/UserService.ts` + `backend/src/modules/users/users.controller.ts` + `backend/src/modules/users/users.service.ts` | RESOLVIDO no codigo local: exclusao envia senha, valida `bcrypt.compare` e revoga refresh tokens | Pendente smoke | Garantia de seguranca passa a existir no backend | `frontend/src/services/api/UserService.ts`; `backend/src/modules/users/users.controller.ts`; `backend/src/modules/users/users.service.ts`; `delete-account.dto.ts` | Validar senha correta/incorreta, logout e refresh apos delete em staging/device | P0 ate smoke |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Tela tem placeholders `??` e `?` visiveis | Mockado/estatico/fake | UI final fica quebrada | `frontend/src/screens/main/NotificationsScreen.tsx:49-69`, `306-335` | Trocar por icones/textos reais | P1 |
| Telas Settings restantes | Textos mojibake visiveis | Quebrado ou sem ligacao | Release visualmente quebrado | `SettingsScreen.tsx:89-90`; `SettingsPrivacyScreen.tsx:88-115`; `SettingsMyAccountScreen` normalizado na EXECUCAO-004 | Normalizar encoding e revisar strings restantes | P1 |
| `backend/src/modules/products/products.controller.ts` | Endpoints de gestao de produtos existem, mas frontend atual so le catalogo/produto | Criado parcialmente | Owner nao consegue gerir catalogo completo pelo app | `backend/src/modules/products/products.controller.ts:56-112`; `frontend/src/services/api/CatalogService.ts:22-27` | Criar UI owner ou remover escopo do release | P1 |

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
- `MapScreen` usa dados reais, mas tem item de lista como `TouchableOpacity` sem `onPress`.

Matriz de telas:

| Tela esperada | Existe? | Registrada no navigator? | Acessivel pelo usuario? | Dados reais ou mock? | Chama service real? | Fallback falso/estatico? | Pronta para producao? | Evidencia / correcao |
|---|---|---|---|---|---|---|---|---|
| Splash | Sim | Sim | Sim, entrada do auth flow | Sem dados remotos | Nao precisa | Timer local | Sim em codigo; depende smoke | `RootNavigator.tsx:56`, `SplashScreen.tsx:21-44` |
| Onboarding introdutorio | Sim | Sim | Sim, auth flow | Conteudo estatico local | Nao | Slides/emoji estaticos e mojibake | Parcial | `RootNavigator.tsx:57`, `OnboardingScreen.tsx:23-59`; corrigir encoding e validar se intro estatica e aceitavel |
| Login | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:58`, `LoginScreen.tsx:23`, `AuthService.ts:76-77` |
| SignUp | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke/SES | `RootNavigator.tsx:60`, `SignUpScreen.tsx:36`, `AuthService.ts:69-70` |
| ForgotPassword | Sim | Sim | Sim | Real | Sim | Nao encontrado | Parcial ate SES real | `RootNavigator.tsx:61`, `ForgotPasswordScreen.tsx:22`, `AuthService.ts:135-143` |
| TwoFactorLogin | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:59`, `TwoFactorLoginScreen.tsx:30`, `AuthService.ts:84` |
| VerifyEmail | Sim | Sim | Sim | Real | Sim | Nao encontrado | Parcial ate SES real | `RootNavigator.tsx:62`, `VerifyEmailScreen.tsx:22`, `AuthService.ts:164-172` |
| ProfileSelection | Sim | Sim | Sim | Selecao local | Nao | Opcoes estaticas e mojibake | Parcial | `RootNavigator.tsx:63`, `ProfileSelectionScreen.tsx:15-49`; corrigir encoding |
| PersonalSetup | Sim | Sim | Sim | Fake/parcial | Nao | Username simulado | Nao | `RootNavigator.tsx:64`, `PersonalSetupScreen.tsx:66-87`; criar persistencia real |
| BusinessSetup | Sim | Sim | Sim | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:65`, `BusinessSetupScreen.tsx:219`, `278-358` |
| Home | Sim | Sim | Sim, tab | Real | Sim | Apenas fallback visual de midia | Sim em codigo; depende smoke | `RootNavigator.tsx:135-142`, `HomeScreen.tsx:180-214` |
| Feed | Sim | Sim | Sim, tab | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:143-150`, `FeedSocialScreen.tsx:84-90`, `feedStore.ts:164` |
| Buscar | Sim | Sim | Sim, tab | Real nos resultados | Sim | `RECENT_SEARCHES` estatico | Parcial para criterio 100% sem mock | `RootNavigator.tsx:151-158`, `SearchScreen.tsx:36-52`, `127`, `293-319`; trocar historico fake por historico real ou renomear como sugestoes fixas |
| Atividade | Sim | Sim | Sim, tab | Parcial | Nao para cards principais | Cards `coming_soon` | Nao | `RootNavigator.tsx:159-172`, `ActivityScreen.tsx:26-76`; implementar/remover cards |
| Mapa | Sim | Sim | Sim, tab | Real | Sim | Item touchable sem acao | Parcial | `RootNavigator.tsx:173-180`, `MapScreen.tsx:38-47`, `111-131`; conectar item a Perfil/Item ou trocar para `View` |
| Chat | Sim | Sim | Sim, tab | Real | Sim | Nao encontrado | Sim em codigo; depende smoke 2 usuarios/Redis | `RootNavigator.tsx:181-188`, `ChatScreen.tsx:87-100`, `chatStore.ts:261-352` |
| Perfil | Sim | Sim | Sim, tab e navegacao por busca/feed/home | Real para estabelecimento | Sim | Fallback visual de avatar/produto | Sim em codigo; depende smoke | `RootNavigator.tsx:189-197`, `ProfileScreen.tsx:191-193`, `233-256` |
| Configuracoes | Sim | Sim | Sim, tab | Parcial/local | Parcial | Varios itens estaticos/local-only | Nao | `RootNavigator.tsx:198-211`, `SettingsScreen.tsx:55-176`; conectar ou remover itens |
| Notificacoes | Sim | Sim | Sim, via Feed/header e MainStack | Real | Sim | Placeholders `??`/`?` | Nao | `RootNavigator.tsx:220`, `FeedSocialScreen.tsx:204`, `NotificationsScreen.tsx:138-226`, `49-69`, `306-335` |
| Catalogo | Sim | Sim | Sim, via Perfil | Real com `establishmentId`; sem contexto mostra estado honesto | Sim | Nao encontrado no codigo local apos EXECUCAO-002 | Sim em codigo; depende smoke | `RootNavigator.tsx:221`, `ProfileScreen.tsx:233-242`, `CatalogScreen.tsx`; validar staging/device |
| Item | Sim | Sim | Sim, via Home/Catalogo/Perfil | Real para produto/evento | Sim | Nao encontrado no codigo local apos EXECUCAO-002 | Sim em codigo; depende smoke | `RootNavigator.tsx:222`, `CatalogScreen.tsx`, `ItemScreen.tsx`; validar produto/evento e rota invalida |
| Favoritos | Sim | Sim | Sim, via Atividade | Nao consome lista real | Nao | Tela informa lacuna | Nao | `RootNavigator.tsx:74`, `ActivityScreen.tsx:33-76`, `ActivityFavoritesScreen.tsx:27-46` |
| Historico | Sim | Sim | Sim, via Atividade | Nao existe contrato real | Nao | Tela informa lacuna | Nao | `RootNavigator.tsx:75`, `ActivityScreen.tsx:57-76`, `ActivityHistoryScreen.tsx:27-39` |
| Minha conta | Sim | Sim | Sim, via Settings | Real no codigo local | Sim | Nao encontrado no codigo local apos EXECUCAO-004; smoke/S3 pendentes | Sim em codigo; depende smoke | `RootNavigator.tsx:84`, `SettingsScreen.tsx:65`, `SettingsMyAccountScreen.tsx`, `UserService.ts`, `userStore.ts`, `users.service.ts`; validar staging/device |
| Cidade | Sim | Sim | Sim, via Settings | Fake/local | Nao | Lista de cidades e recentes fixos | Nao | `RootNavigator.tsx:85`, `SettingsScreen.tsx:78`, `SettingsCityScreen.tsx:22-52` |
| Privacidade | Sim | Sim | Sim, via Settings | Local-only | Nao | `Load privacy settings` sem implementacao | Nao | `RootNavigator.tsx:89`, `SettingsScreen.tsx:113`, `SettingsPrivacyScreen.tsx:31-34`, `68-118` |
| Seguranca | Sim | Sim | Sim, via Settings | Parcial | Parcial via sub-tela 2FA | `Load security settings` sem implementacao | Nao | `RootNavigator.tsx:91`, `SettingsScreen.tsx:120`, `SettingsSecurityScreen.tsx:26-29`, `37-80` |
| Excluir conta | Sim | Sim | Sim, via Settings | Real no codigo local | Sim | Nao encontrado no codigo local apos EXECUCAO-003 | Sim em codigo; depende smoke | `RootNavigator.tsx:98`, `SettingsScreen.tsx:176`, `SettingsDeleteAccountScreen.tsx`, `UserService.ts`, `users.controller.ts`, `users.service.ts`; validar staging/device |
| Contas vinculadas | Sim | Sim | Nao encontrado no fluxo de usuario | Fake/estatico | Nao | Google/Apple fixos | Nao | `RootNavigator.tsx:86`, `SettingsAuxScreens.tsx:102-112`; adicionar link real ou remover rota |
| Raio de busca | Sim | Sim | Sim, via Settings | Fake/estatico | Nao | Valores fixos | Nao | `RootNavigator.tsx:87`, `SettingsScreen.tsx:85`, `SettingsAuxScreens.tsx:115-126` |
| Preferencias de notificacoes | Sim | Sim | Sim, via Settings | Fake/estatico | Nao | Switches fixos | Nao | `RootNavigator.tsx:88`, `SettingsScreen.tsx:106`, `SettingsAuxScreens.tsx:129-140` |
| Usuarios bloqueados | Sim | Sim | Sim, via Privacidade | Fake/estatico | Nao | Lista vazia fixa | Nao | `RootNavigator.tsx:90`, `SettingsPrivacyScreen.tsx:123`, `SettingsAuxScreens.tsx:188-197` |
| Alterar senha | Sim | Sim | Sim, via Seguranca | Scaffold | Nao na tela | Campos como linhas, sem formulario | Nao | `RootNavigator.tsx:92`, `SettingsSecurityScreen.tsx:37-80`, `SettingsAuxScreens.tsx:200-210`; usar `AuthService.ts:154` |
| 2FA | Sim | Sim | Sim, via Seguranca | Real | Sim | Nao encontrado | Sim em codigo; depende smoke | `RootNavigator.tsx:93`, `SettingsSecurityScreen.tsx:43`, `SettingsAuxScreens.tsx:214-270` |
| Dispositivos | Sim | Sim | Sim, via Seguranca | Fake/estatico | Nao | Windows/Android fixos | Nao | `RootNavigator.tsx:94`, `SettingsSecurityScreen.tsx:49`, `SettingsAuxScreens.tsx:375-385` |
| Historico de acessos | Sim | Sim | Sim, via Seguranca | Fake/estatico | Nao | Cidades/horarios fixos | Nao | `RootNavigator.tsx:95`, `SettingsSecurityScreen.tsx:55`, `SettingsAuxScreens.tsx:388-398` |
| Idioma | Sim | Sim | Sim, via Settings | Fake/estatico | Nao | Idiomas fixos sem persistencia | Nao | `RootNavigator.tsx:96`, `SettingsScreen.tsx:127`, `SettingsAuxScreens.tsx:143-154` |
| Sobre | Sim | Sim | Sim, via Settings | Parcial | Sim para links legais/suporte | Versao fixa | Parcial | `RootNavigator.tsx:97`, `SettingsScreen.tsx:140`, `SettingsAuxScreens.tsx:157-184` |

Resumo do mapeamento:

- Telas esperadas pelo README: encontradas.
- Telas esperadas registradas no navigator: encontradas.
- Telas esperadas realmente prontas em codigo, dependendo apenas de smoke/deploy: Login, SignUp, TwoFactorLogin, BusinessSetup, Home, Feed, Chat, Perfil, 2FA.
- Telas com service real mas ainda nao prontas por placeholder/fallback/acao parcial: Buscar, Mapa, Notificacoes.
- Telas criadas visualmente mas sem backend real suficiente: PersonalSetup, Atividade, Favoritos, Historico, Cidade, Privacidade, Seguranca, Raio de busca, Preferencias de notificacoes, Bloqueados, Alterar senha, Dispositivos, Historico de acessos, Idioma. `Minha conta` saiu desta lista no codigo local pela EXECUCAO-004, pendente apenas de smoke/staging e storage real.
- Tela registrada mas sem acesso de usuario encontrado: Contas vinculadas.

Correcoes derivadas:

1. Remover ou conectar todas as telas marcadas como "Nao" antes de release.
2. Decidir se `SettingsLinkedAccounts` entra no produto; se entrar, adicionar item no menu e backend real; se nao entrar, remover rota.
3. Conectar `MapScreen` list item a Perfil/Item ou trocar `TouchableOpacity` por componente nao interativo.
4. Trocar `SearchScreen` `RECENT_SEARCHES` por historico real ou renomear para sugestoes fixas de categoria.
5. Reclassificar tela como pronta somente depois de consumir backend real ou ser declarada como tela puramente local por definicao de produto.

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
| `frontend/src/screens/auth/SignUpScreen.tsx:61-67` | Abrir `SignUp` sem parametros | Voltar para escolha de perfil ou mostrar erro | Tela fica em loading infinito | Parametro obrigatorio ausente nao e tratado | Redirecionar para `ProfileSelection` ou exibir erro acionavel quando `profileType` faltar |
| `frontend/src/screens/auth/SignUpScreen.tsx:214-217` | Cadastro concluido | `PersonalSetup` ou `BusinessSetup` | `navigation.replace(resolvedNextScreen)` | Destino dinamico e tipado pelo store, sem rota inexistente encontrada | Manter; validar que backend/store nunca devolvem valor fora de `PersonalSetup`/`BusinessSetup` |
| `frontend/src/screens/main/FeedSocialScreen.tsx:239-245` | Tocar avatar do autor no feed | Perfil publico do autor | Navega `Profile` com `{ type, userId }` | `ProfileScreen` nao carrega perfil publico por `userId`; para `establishment` tambem falta `establishmentId` | Passar `establishmentId` no feed quando autor for estabelecimento e implementar carregamento de perfil publico de usuario por `userId` |
| `frontend/src/screens/main/ProfileScreen.tsx:148-192` | Receber `Profile` com `type: 'user'` e `userId` | Perfil do usuario indicado | Renderiza dados da conta logada e ignora `userId` | Parametro de rota aceito pela origem nao e consumido no destino | Criar fluxo de perfil publico de usuario ou bloquear navegacao para autores `USER` |
| `frontend/src/screens/main/NotificationsScreen.tsx:238-240` | Tocar notificacao de conversa | Abrir conversa especifica | Navega apenas para tab `Chat` | `conversationId` do payload e ignorado | Navegar para `Chat` com nested route `ChatDetail` e `conversationId`, ou expor helper no ChatStack |
| `frontend/src/screens/main/NotificationsScreen.tsx:243-245` | Tocar notificacao com `relatedUserId` | Abrir perfil do usuario relacionado | Navega `MainTabs -> Profile` sem params | `relatedUserId` e descartado; abre perfil padrao/conta atual | Passar `{ screen: 'Profile', params: { type: 'user', userId } }` e implementar destino |
| `frontend/src/screens/main/NotificationsScreen.tsx:233-249` | Tocar notificacao com `entityType/entityId` | Abrir entidade relacionada | Codigo so trata post, conversa, related user e system | `entityType/entityId` mapeados na notificacao nao entram no roteamento | Criar roteador por entidade: post/feed, conversation/chat detail, establishment/profile, product/item, event/item |
| `frontend/src/screens/main/MapScreen.tsx:111-131` | Tocar item na lista do mapa | Abrir perfil do estabelecimento ou item do evento | `TouchableOpacity` nao tem `onPress` | Lista tem aparencia clicavel sem acao | Adicionar navegacao por `mapType` ou trocar para `View` sem comportamento clicavel |
| `frontend/src/screens/main/ActivityScreen.tsx:36-55` | Tocar Pedidos, Agendamentos ou Reservas | Abrir fluxo/tela do recurso | Alerta `Em breve` em `ActivityScreen.tsx:70-71` | Cards nao navegam para tela real | Remover cards do release ou implementar telas/rotas reais |
| `frontend/src/screens/main/ActivityScreen.tsx:27-63` | Tocar Favoritos/Historico | `ActivityFavorites`/`ActivityHistory` | `navigation.push(card.route)` para rotas registradas | Nome de rota correto, mas telas destino nao consomem backend real | Manter rota somente se contrato real for implementado; caso contrario ocultar |
| `frontend/src/screens/main/SettingsScreen.tsx:55-140` | Tocar itens principais de Settings | Abrir subtelas registradas | Rotas dinamicas de `item.route` apontam para telas registradas | Sem nome inexistente encontrado | Manter, mas conectar conteudo das subtelas |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:102-112` | Tentar acessar Contas vinculadas pelo app | Abrir `SettingsLinkedAccounts` | Rota registrada em `RootNavigator.tsx:86`, mas sem item no menu de usuario | Tela registrada nunca acessada pelo fluxo principal | Adicionar item em `SettingsScreen` ou remover rota/tela do release |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx:37-80` | Tocar Senha, 2FA, Dispositivos, Historico | Abrir subtelas de seguranca | Rotas apontam para telas registradas | Nome de rota correto; algumas telas destino sao scaffold/fake | Implementar telas destino ou ocultar entradas |
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

1. Corrigir navegacao do feed para perfil publico, eliminando o uso de `userId` em destino que nao o consome.
2. Corrigir roteamento de notificacoes para preservar `conversationId`, `relatedUserId`, `entityType` e `entityId`.
3. Decidir e implementar deep links nativos se o release precisar abrir telas por e-mail/push/link externo.
4. Remover loading infinito de `SignUp` sem `profileType`.
5. Conectar `MapScreen` list item ou remover comportamento clicavel.
6. Remover/implementar cards de Activity que terminam em `Em breve`.
7. Dar caminho real para `SettingsLinkedAccounts` ou remover a rota.

### PROMPT-004 - auditoria de botoes links cards icones e menus - 2026-04-30

Prompt recebido:

> Procurar no frontend todos os botoes, links, cards clicaveis, icones clicaveis e acoes de menu. Para cada item, verificar `onPress`, navegacao para tela real, chamada de service real, TODO, `console.log`, alert temporario, funcao vazia, textos `em breve`, `mock`, `placeholder`, `fake`, `dummy`, `sample` e acao visual sem efeito real. Classificar como funcional real, parcial, mock/fake, quebrado ou nao implementado. Entregar tabela com arquivo, componente, acao, problema e correcao.

Validacoes executadas nesta rodada:

- Varredura em `frontend/src` para `<Button`, `<TouchableOpacity`, `<Pressable`, `onPress`, `TODO`, `FIXME`, `console.log`, `Alert.alert`, `coming_soon`, `Em breve`, `mock`, `MOCK`, `fake`, `dummy`, `sample` e `placeholder`.
- `Pressable` nao apareceu nos resultados; a superficie clicavel encontrada usa `TouchableOpacity`, `Button`, `Switch`, radios locais e itens de menu.
- `frontend/src/screens/main/MapScreen.tsx:111-131` foi o caso confirmado de componente clicavel sem `onPress`.
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
| Parcial | Busca rapida | `frontend/src/screens/main/SearchScreen.tsx:52`, `295-299` | Chips executam busca real, mas a origem `RECENT_SEARCHES` e estatica |
| Parcial | Notificacoes | `frontend/src/screens/main/NotificationsScreen.tsx:222-249`, `274-278` | Marca como lida/deleta via service real, mas roteia para tabs genericas e perde parametros |
| Parcial | Perfil publico a partir do feed | `frontend/src/screens/main/FeedSocialScreen.tsx:239-245` | `onPress` existe, mas envia params que `ProfileScreen` nao consome corretamente |
| Parcial | Configuracoes locais | `frontend/src/screens/main/SettingsScreen.tsx:88-93`, `196-198` | Toggle visual/local sem persistencia e fallback vazio para handler |
| Funcional real em codigo; smoke pendente | Minha conta | `frontend/src/screens/main/SettingsMyAccountScreen.tsx`, `frontend/src/services/api/UserService.ts`, `frontend/src/stores/userStore.ts` | Perfil carrega do backend, salva conta/perfil em endpoints separados e envia avatar; validar device/staging/S3 |
| Mock/fake | Cidade | `frontend/src/screens/main/SettingsCityScreen.tsx:22-52`, `71-143` | GPS escolhe `Sao Paulo, SP`, lista e historico sao locais |
| Mock/fake | Catalogo sem `establishmentId` | `frontend/src/screens/main/CatalogScreen.tsx:57-175`, `324-334` | Card clicavel pode abrir `Item` com item de `MOCK_CATALOGS` |
| Mock/fake | Telas auxiliares de Settings | `frontend/src/screens/main/SettingsAuxScreens.tsx:102-154`, `188-210`, `375-398` | Linhas estaticas, switches disabled ou scaffold sem service real |
| Quebrado | Lista do mapa | `frontend/src/screens/main/MapScreen.tsx:111-131` | `TouchableOpacity` sem `onPress`; aparencia clicavel sem efeito |
| Funcional real em codigo; smoke pendente | Alterar foto em Minha conta | `frontend/src/screens/main/SettingsMyAccountScreen.tsx`, `UserService.uploadAvatar()` | Usa galeria nativa e `POST /users/me/avatar`; validar S3/CloudFront em staging |
| Nao implementado | Pedidos, Agendamentos e Reservas em Activity | `frontend/src/screens/main/ActivityScreen.tsx:36-55`, `69-71` | Cards terminam em alerta `Em breve` |
| Nao implementado | CTAs genericos de Item | `frontend/src/screens/main/ItemScreen.tsx:49-73`, `270-276`, `600-603` | `Agendar`, `Reservar`, `Assinar` e similares apenas exibem alerta |
| Nao implementado | Setup pessoal real | `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-87`, `104-106`, `119-124`, `253-266` | Username, GPS, avatar, skip e finish sao locais/simulados |

Tabela de acoes com problema:

| Arquivo | Componente | Acao | Classificacao | Problema | Evidencia no codigo | Correcao |
|---|---|---|---|---|---|---|
| `frontend/src/screens/main/MapScreen.tsx` | `TouchableOpacity` de item da lista | Tocar evento/estabelecimento no mapa | Quebrado | Nao existe `onPress`; item parece clicavel e nao faz nada | `MapScreen.tsx:111-131` | Adicionar navegacao por `mapType` para `Item`/`Profile` ou trocar para `View` |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Alterar foto | Selecionar imagem e atualizar avatar | Funcional real em codigo; smoke pendente | Usa `expo-image-picker` e `userStore.uploadAvatar`; storage real ainda depende S3/CloudFront | `SettingsMyAccountScreen.tsx`; `UserService.uploadAvatar()` | Validar upload em device/staging com S3/CloudFront |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Botao `Salvar` | Salvar dados de conta | Funcional real em codigo; smoke pendente | Salva conta via `updateAccount` e bio via `updateProfile`; falta smoke final | `SettingsMyAccountScreen.tsx`; `UserService.updateAccount()`; `UserService.updateProfile()` | Validar sucesso, erro de duplicidade, token expirado e alteracao de e-mail |
| `frontend/src/screens/main/SettingsScreen.tsx` | Toggle GPS | Alternar permissao/localizacao | Parcial | Altera somente estado local `gpsEnabled` | `SettingsScreen.tsx:88-93`, `196-198` | Persistir preferencia/permissionamento real ou remover toggle |
| `frontend/src/screens/main/SettingsScreen.tsx` | Item `Desativar Conta` | Confirmar desativacao | Mock/fake | Mostra alerta de sucesso sem service/backend | `SettingsScreen.tsx:149-163` | Criar endpoint de desativacao ou remover a entrada |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Card `Usar minha localizacao` | Detectar cidade por GPS | Mock/fake | Seleciona `Sao Paulo, SP` fixo | `SettingsCityScreen.tsx:71-80` | Usar geolocalizacao real e persistir cidade |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Lista e confirmar cidade | Escolher/confirmar cidade | Mock/fake | `CITY_OPTIONS` e `recentCities` sao locais; `handleConfirmCity` so faz `goBack()` | `SettingsCityScreen.tsx:22-52`, `104-143` | Criar service de preferencias/localizacao ou ocultar tela |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | Switches e radios | Alterar privacidade, mensagens e check-ins | Parcial | `Load privacy settings` sem implementacao; estado fica local | `SettingsPrivacyScreen.tsx:31-34`, `68-118` | Criar get/update de privacy settings |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Menu de seguranca | Abrir submenus | Parcial | Navegacao existe, mas load de settings e telas de senha/dispositivos sao parciais/fake | `SettingsSecurityScreen.tsx:26-29`, `37-80` | Conectar estado de seguranca e implementar destinos |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Contas vinculadas, raio, notificacoes, idioma | Interagir com linhas/switches | Mock/fake | Linhas estaticas, sem `onPress` real ou switches disabled | `SettingsAuxScreens.tsx:102-154` | Implementar contratos reais ou remover do release |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Bloqueados e alterar senha | Gerenciar bloqueios/senha | Nao implementado | Lista vazia fixa; alterar senha e apenas scaffold de linhas | `SettingsAuxScreens.tsx:188-210` | Implementar lista/formulario real usando backend |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Dispositivos e historico | Ver sessoes/acessos | Mock/fake | Exibe `Windows Chrome`, `Android Pixel` e acessos fixos | `SettingsAuxScreens.tsx:375-398` | Criar endpoints ou ocultar telas |
| `frontend/src/screens/main/ActivityScreen.tsx` | Cards Pedidos/Agendamentos/Reservas | Abrir fluxo comercial | Nao implementado | Cards `coming_soon` terminam em `Alert.alert('Em breve')` | `ActivityScreen.tsx:36-55`, `69-71` | Implementar telas/rotas reais ou remover cards |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | Botao/estado de Favoritos | Ver favoritos | Parcial | Tela informa que nao consome lista consolidada do backend | `ActivityFavoritesScreen.tsx:24-52` | Criar endpoint/lista real ou remover tela |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | Botao/estado de Historico | Ver historico | Parcial | Tela informa que nao existe contrato consolidado | `ActivityHistoryScreen.tsx:24-53` | Criar contrato de historico ou remover tela |
| `frontend/src/screens/main/CatalogScreen.tsx` | Card de catalogo | Abrir item | RESOLVIDO no codigo local; smoke pendente | Apos EXECUCAO-002, sem `establishmentId` nao carrega `MOCK_CATALOGS` e mostra estado honesto | `CatalogScreen.tsx` | Validar smoke em perfil de estabelecimento real e rota sem contexto |
| `frontend/src/screens/main/ItemScreen.tsx` | CTA generico | Agendar, reservar, assinar, adicionar ao carrinho | RESOLVIDO no codigo local; smoke pendente | Apos EXECUCAO-002, CTA generico fora do backend foi removido | `ItemScreen.tsx` | Validar produto/evento real em device/staging |
| `frontend/src/screens/main/FeedSocialScreen.tsx` | Avatar do autor | Abrir perfil publico | Parcial | Navega com `{ type, userId }`, mas destino nao consome corretamente esse contrato | `FeedSocialScreen.tsx:239-245` | Passar `establishmentId` ou implementar perfil publico por `userId` |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Linha de notificacao | Abrir entidade relacionada | Parcial | Marca como lida, mas descarta `conversationId`, `relatedUserId` e `entityType/entityId` | `NotificationsScreen.tsx:222-249`, `274-278` | Criar roteador de notificacoes por entidade |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Username | Verificar disponibilidade | Mock/fake | Usa `setTimeout` e `!normalized.includes('taken')` | `PersonalSetupScreen.tsx:66-79` | Chamar endpoint real de username |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Avatar | Adicionar/trocar foto | Mock/fake | Apenas alterna `hasAvatar` local | `PersonalSetupScreen.tsx:119-124` | Implementar picker/upload real |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | GPS | Usar localizacao atual | Mock/fake | Define cidade fixa `Sao Paulo, SP` | `PersonalSetupScreen.tsx:104-106`, `166-168` | Usar permissao/geolocalizacao real |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Pular/finalizar | Completar setup pessoal | Nao implementado | Avanca etapas localmente e finaliza com `completeOnboarding()` sem persistencia | `PersonalSetupScreen.tsx:81-87`, `97-102`, `253-266` | Salvar username, bio, avatar, cidade e interesses antes de finalizar |
| `frontend/src/screens/main/SearchScreen.tsx` | Chips `Buscas rapidas` | Reexecutar busca | Parcial | Acao chama busca real, mas lista vem de constante estatica `RECENT_SEARCHES` | `SearchScreen.tsx:52`, `295-299` | Persistir historico real ou renomear para sugestoes fixas |

Correcoes derivadas:

1. Tratar `TouchableOpacity` sem `onPress` como bloqueio visual de release.
2. Proibir `onPress: () => {}` em codigo de producao; toda acao deve chamar service real, navegar para tela real ou ser removida.
3. Remover do release qualquer card que termine em `Em breve`, `Fluxo fora do MVP atual` ou scaffold estatico.
4. Separar buscas sugeridas de historico real em `SearchScreen`.
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
| `AuthService.ts:69-77` | `POST /auth/signup`, `POST /auth/login` | `AuthController` `@Post('signup')` e `@Post('login')` em `backend/src/modules/auth/auth.controller.ts:28-68` | OK estatico | Payloads batem com `SignUpDto` e `LoginDto`; rota publica | Manter e validar em smoke mobile |
| `AuthService.ts:83-88` | `POST /auth/verify-2fa-login` com `userId`, `code`, `tempToken` | `AuthController` `@Post('verify-2fa-login')` em `auth.controller.ts:299` | OK estatico | Nenhuma incompatibilidade confirmada | Validar fluxo com usuario 2FA real |
| `AuthService.ts:94-103` + `ApiClient.ts` | `POST /auth/refresh` com `Authorization: Bearer <refreshToken>` | `AuthController` `@Post('refresh')` + `RefreshTokenGuard` em `auth.controller.ts:93-116`; strategy le bearer em `refresh-token.strategy.ts:11-16` | OK no codigo local; smoke pendente | EXECUCAO-005 preservou `Authorization` explicito no request interceptor e bloqueou retry automatico em `/auth/refresh` quando o refresh falha | Validar expiracao/refresh/logout em smoke mobile/staging |
| `ApiClient.ts:231-270` | Refresh automatico em 401 via axios cru `POST /auth/refresh` | Mesmo endpoint `POST /auth/refresh` | OK estatico | Esse caminho nao passa pelo interceptor e envia bearer de refresh corretamente | Reaproveitar esse caminho tambem no `AuthService.refreshToken` |
| `AuthService.ts:109-129` | `POST /auth/logout`, `POST /auth/enable-2fa`, `POST /auth/verify-2fa`, `POST /auth/disable-2fa` | `AuthController` `@Post('logout')`, `enable-2fa`, `verify-2fa`, `disable-2fa` em `auth.controller.ts:118-287` | OK estatico | Rotas protegidas dependem do bearer injetado pelo `ApiClient` | Smoke autenticado |
| `AuthService.ts:135-172` | `POST /auth/request-password-reset`, `reset-password`, `change-password`, `verify-email`, `resend-verification-email` | Endpoints equivalentes em `auth.controller.ts:129-216` | OK estatico | Payloads batem com DTOs; e-mail real depende de SES | Fechar SES e smoke de e-mail |
| `UserService.ts:45-50` | `GET /users/me`, `GET /users/:userId` | `UsersController` `@Get('me')` e `@Get(':id')` em `users.controller.ts:48-69`, `171-185` | OK estatico | `getUserProfile` usa rota generica, nao `public-profile` | Decidir se perfil publico deve usar `GET /users/:id/public-profile` |
| `UserService.ts` | `PUT /users/me` para conta e `PUT /users/me/profile` para perfil | `UsersController` `@Put('me')` usa `UpdateUserDto`; `@Put('me/profile')` usa `UpdateProfileDto` em `users.controller.ts:187-233` | OK no codigo local; smoke pendente | EXECUCAO-004 separou `updateAccount` e `updateProfile`; `UpdateUserDto` aceita `username` e `phoneNumber` | Validar smoke autenticado, e-mail/username duplicado e limpeza de bio |
| `UserService.ts:57-70` | Multipart `POST /users/me/avatar` campo `file` | `UsersController` `@Post('me/avatar')` + `FileInterceptor('file')` em `users.controller.ts:236-267` | OK estatico | Depende de storage real para producao | Validar S3/CloudFront e smoke de upload |
| `UserService.ts:73-101` | follow/unfollow, followers/following, search `GET /users`, delete `DELETE /users/me` | Endpoints equivalentes em `users.controller.ts:121-169`, `267-309` | OK no codigo local; smoke pendente | Delete account envia senha e backend valida antes do soft delete | Validar em device/staging com senha correta/incorreta e refresh token revogado |
| `CatalogService.ts:22-28` | `GET /establishments/:id/products`, `GET /products/:id` | `ProductsController` `@Get('establishments/:id/products')`, `@Get('products/:id')` em `products.controller.ts:42-54` | OK no codigo local; smoke pendente | Leitura existe e EXECUCAO-002 removeu fallback fake de Catalog/Item | Validar Catalog/Item com estabelecimento/produto real em staging/device |
| `Sem service frontend` | Criar/editar/arquivar/upload de produto | `ProductsController` `POST/PUT/DELETE /establishments/:id/products...` e `POST .../media` em `products.controller.ts:56-145` | Endpoint existente nao usado | Owner nao consegue gerir catalogo completo pelo service mobile atual | Criar metodos no `CatalogService` e telas owner, ou retirar gestao de produtos do release |
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
| `frontend/src/services/legal/LegalLinks.ts:6-31` | `GET /legal/terms-of-use`, `GET /legal/privacy-policy` via `Linking.openURL` | `LegalController` em `legal.controller.ts:8-28` | OK estatico | Nao usa `apiClient`; abre URL externa do backend | Validar DNS/API base em build real |
| `Sem service frontend` | `GET /legal/*.json`, `GET /health`, `POST/GET /media/...` generico | `LegalController`, `HealthController`, `MediaController` | Endpoint existente nao usado | Endpoints existem sem consumo mobile direto | Definir se sao internos/operacionais ou criar consumo real |
| `ApiClient.ts:294-365`, `ApiClient.ts:417-450` | Todas as chamadas REST | Todos os endpoints chamados por services | Parcial | Tratamento de erro e generico: loga status e rethrow; services quase nao traduzem erro por fluxo | Padronizar erro por dominio nos fluxos criticos antes do smoke final |

Ordem exata de correcao desta auditoria:

1. RESOLVIDO no codigo local pela EXECUCAO-005: `AuthService.refreshToken` preserva o bearer de refresh e nao e sobrescrito pelo interceptor de access token.
2. RESOLVIDO no codigo local pela EXECUCAO-004: `UserService.updateProfile` usa `PUT /users/me/profile` e dados de conta foram separados em `updateAccount`.
3. RESOLVIDO no codigo local pela EXECUCAO-006: contrato de post foi alinhado removendo `video` do frontend.
4. Remover fallback fake do catalogo quando nao houver `establishmentId`, porque os endpoints reais de leitura existem.
5. Decidir se gestao owner de produtos entra no release; se entrar, criar metodos no service e telas conectadas.
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
| P0 | `frontend/src/screens/main/CatalogScreen.tsx:57-123`, `166-172`, `324-334` | `MOCK_CATALOGS` alimenta catalogo quando nao existe `establishmentId`; card pode navegar para `Item` com item local | Nao | Produtos reais do estabelecimento ou estado vazio real | `catalogService.getEstablishmentProducts(establishmentId)` -> `GET /establishments/:id/products`; item real via `GET /products/:id` | Usuario ve cardapio/quartos/planos/servicos que nao existem no backend; gera decisao baseada em dado falso |
| P0 ate smoke | `frontend/src/screens/main/SettingsMyAccountScreen.tsx`; `frontend/src/services/api/UserService.ts`; `frontend/src/stores/userStore.ts` | RESOLVIDO no codigo local pela EXECUCAO-004: conta inicial fixa, timer e save simulado foram removidos | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Perfil do usuario autenticado, avatar real, email real, bio reais | `userStore.getProfile()`, `UserService.updateAccount()`, `UserService.updateProfile()`, `UserService.uploadAvatar()` | Risco remanescente de producao esta em storage real, smoke de device e alteracao de e-mail/duplicidade |
| P0 ate smoke | `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | RESOLVIDO no codigo local pela EXECUCAO-004: alert de foto com funcoes vazias foi substituido por picker/upload real | Nao aplicavel ao codigo local atual; ainda nao aprovado para producao sem smoke | Imagem escolhida pelo usuario e upload real | `expo-image-picker` + `userService.uploadAvatar()` -> `POST /users/me/avatar` | Se S3/CloudFront nao estiverem validados, avatar pode falhar em producao |
| P0 | `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-79`, `81-87`, `97-105`, `119-124`, `185-205`, `251-266` | Onboarding pessoal valida username com `setTimeout`, usa cidade fixa `Sao Paulo, SP`, avatar booleano local, interesses locais e finaliza sem persistir dados | Nao | Username, bio, cidade, avatar e interesses persistidos no usuario/perfil | Criar/usar endpoints de perfil pessoal: `GET /users/me`, `PUT /users/me/profile`, `POST /users/me/avatar` e endpoint novo de username/interesses/cidade se o modelo exigir | Usuario sai do onboarding com perfil nao configurado no backend; personalizacao/feed ficam inconsistentes |
| P0 | `frontend/src/screens/main/SettingsCityScreen.tsx:22-52`, `71-80`, `104-127` | Lista de cidades e recentes fixos; GPS seleciona `Sao Paulo, SP`; confirmar so atualiza estado local e `goBack()` | Nao | Cidade real por geolocalizacao/permissao e preferencia persistida | `GeolocationService`/`useLocation`; criar endpoint de preferencia de cidade se a cidade for perfil persistente | Feed/localizacao podem parecer atualizados sem alterar backend ou cache; experiencia local incorreta |
| P1 | `frontend/src/screens/main/SettingsAuxScreens.tsx:375-397` | Dispositivos e historico de acesso exibem `Windows Chrome`, `Android Pixel`, `Sao Paulo, BR`, `Santos, BR` fixos | Nao | Sessoes reais, dispositivos reais e eventos de login/auditoria | Criar endpoints de sessoes/audit log, ou ocultar telas; possivel base: `AuditLogService` backend | Risco de seguranca: usuario ve acessos inventados e nao consegue reconhecer acesso real indevido |
| P1 | `frontend/src/screens/main/SettingsAuxScreens.tsx:102-154`, `188-210` | Contas vinculadas, raio, preferencias de notificacao, idioma, bloqueados e alterar senha sao linhas estaticas/switches disabled/scaffold sem formulario | Nao para telas de configuracao acionaveis | Estado real das preferencias, provedores vinculados, bloqueios e formulario de senha | Auth: `authService.changePassword()`; notificacoes: `notificationsService`; demais exigem endpoints de preferencias/bloqueios | Usuario altera nada apesar da UI parecer area de conta real; suporte e privacidade ficam inconsistentes |
| P1 | `frontend/src/screens/main/SettingsPrivacyScreen.tsx:26-35`, `68-118`, `121-129` | Privacidade, mensagens, check-ins e bloqueados ficam em estado local; comentario `Load privacy settings` sem implementacao | Nao | Preferencias reais de privacidade e bloqueios do usuario | Criar endpoints `GET/PUT /users/me/privacy` e bloqueios, ou remover tela do release | Usuario acredita ter restringido privacidade, mas backend nao aplica regra |
| P1 | `frontend/src/screens/main/SettingsScreen.tsx:88-93`, `149-163`, `196-198` | Toggle GPS e desativar conta sao locais; fallback vazio para toggle sem handler | Nao | Preferencia real de localizacao e endpoint real de desativacao | Criar service de preferencias; criar endpoint de deactivate ou remover item | Configuracao visual sem efeito; conta pode parecer desativada sem mudar status real |
| P1 | `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29`, `90-108` | `Load security settings` vazio e alerta de novo acesso visualmente fixo | Parcial; so e aceitavel se for texto informativo sem controle | Preferencias/sessoes reais de seguranca | Criar endpoints de security settings/sessions ou deixar somente 2FA real | Usuario nao consegue auditar configuracao de seguranca real |
| P1 | `frontend/src/screens/main/ActivityScreen.tsx:26-64`, `69-72`, `123-131` | Cards de pedidos/agendamentos/reservas com `coming_soon` e alerta `Em breve` | Aceitavel somente se decisao de MVP for mostrar status; nao aceitavel como funcionalidade | Fluxos reais de pedidos, reservas e agendamentos ou remocao dos cards | Criar endpoints/telas dedicadas ou remover do menu de producao | Produto comunica recurso que nao existe; aumenta suporte e frustra fluxo comercial |
| P1 | `frontend/src/screens/main/ItemScreen.tsx:49-73`, `270-276`, `600-603` | CTAs genericos (`Agendar`, `Reservar`, `Assinar`, carrinho) apenas exibem alerta de fluxo fora do MVP | Aceitavel somente se botao ficar claramente fora do MVP; melhor remover do release | Contratos reais de agendamento/reserva/assinatura/pedido, ou CTA oculto | Criar services/endpoints especificos ou remover templates genericos | Usuario tenta comprar/agendar e recebe bloqueio; impacto direto em conversao |
| P1 | `frontend/src/screens/main/SearchScreen.tsx:52`, `290-300` | `RECENT_SEARCHES` fixo exibido como buscas rapidas | Parcial; aceitavel se renomeado como sugestoes fixas, nao como historico real | Historico real de busca do usuario ou sugestoes editoriais declaradas | Criar endpoint/storage de historico, ou usar `searchService.trending()`/`searchService.autocomplete()` | Usuario ve termos que nao sao recentes; personalizacao falsa |
| P2 | `frontend/src/screens/main/ActivityFavoritesScreen.tsx:24-47` | Tela informa que favoritos nao estao sincronizados e que dados fake anteriores foram removidos | Parcialmente aceitavel como tela de status; nao e funcionalidade pronta | Lista real de favoritos do usuario | Criar endpoint de favoritos consolidados ou estender `establishments` para listar favoritos do usuario | Feature existe no menu mas nao entrega valor final |
| P2 | `frontend/src/screens/main/ActivityHistoryScreen.tsx:24-48` | Tela informa que historico consolidado nao existe | Parcialmente aceitavel como transparencia; nao e funcionalidade pronta | Historico real de buscas, perfis vistos, check-ins e atividades | Criar modelo/endpoint de historico com retencao definida | Feature aparece sem dado real; baixa maturidade de produto |
| P2 | `frontend/src/screens/main/HomeScreen.tsx:73-76` | Evento sem data retorna badge `EM BREVE` | Aceitavel como fallback visual se evento sem data for permitido; revisar contrato | Data real do evento ou estado `sem data publicada` | `searchService.searchEvents()`; backend `GET /search/events` deve retornar `date` confiavel | Pode mascarar evento cadastrado incorretamente sem data |
| P2 | `backend/src/modules/auth/auth.service.ts:596-599` | Comentario diz `placeholder` em verificacao 2FA, mas codigo usa `user.twoFactorSecret` persistido | Aceitavel como comentario desatualizado? Nao para qualidade de producao | Comentario correto refletindo fluxo real ou ajuste se houver gap real | `authService.setupTwoFactorAuth()` e `verifyTwoFactorAuth()` | Comentario engana auditoria e manutencao; risco de alterar fluxo correto por leitura errada |
| P3 | `frontend/src/screens/main/MapScreen.tsx:111-131` | Item da lista e `TouchableOpacity` sem acao; nao e mock, mas simula card clicavel | Nao | Navegacao real para evento/estabelecimento | `locationService.getEvent()`/`getEstablishment()` e rotas `Item`/`Profile` | Usuario toca em item e nada acontece |
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

1. Remover `MOCK_CATALOGS` do caminho de producao: se nao houver `establishmentId`, mostrar estado vazio/erro de rota invalida em vez de catalogo local.
2. RESOLVIDO no codigo local pela EXECUCAO-004: `SettingsMyAccountScreen` usa `userStore.getProfile`, `PUT /users/me`, `PUT /users/me/profile` e `POST /users/me/avatar`; timers e dados de Joao foram removidos.
3. Reimplementar `PersonalSetupScreen` para persistir perfil, cidade, avatar e interesses; criar endpoints ausentes antes de liberar onboarding pessoal.
4. Reimplementar `SettingsCityScreen` com geolocalizacao real e persistencia de cidade, ou remover tela do release.
5. Ocultar ou implementar telas auxiliares de configuracao que mostram dispositivos, historico, privacidade, notificacoes, idioma, bloqueados e raio sem contrato real.
6. Remover CTAs de pedidos/agendamentos/reservas/assinaturas/carrinho do release ate existirem endpoints reais.
7. Trocar `RECENT_SEARCHES` por historico real ou renomear explicitamente para sugestoes fixas.
8. Corrigir comentario `placeholder` no 2FA backend para refletir que o secret vem de `user.twoFactorSecret`.

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
| API URL producao | Pendente | Conferir env do build | `cd frontend && Get-Content .env` e build com `EXPO_PUBLIC_API_URL=https://api...` | Build nao aponta `localhost`; API resolve via HTTPS real | Sim |
| Remocao de mocks bloqueantes | Parcial | Validar itens PROMPT-006 | Varredura + smoke das telas | Catalogo e minha conta ja resolvidos no codigo local; onboarding pessoal e cidade nao podem simular producao | Sim |
| Config de push mobile | Parcial | Conferir estrategia sem Firebase, APNs e env SNS | Build/device com provider definido | Android/iOS geram token nativo sem Firebase ou push fica declarado fora do MVP | Sim para push no release |
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
| Provider S3 | Preparado; `.env.example` default `STORAGE_PROVIDER=none` | Subir prod com `STORAGE_PROVIDER=s3` | Start backend com env S3 real | Upload usa S3, nao storage local/none | Sim |
| Credenciais e bucket | Pendente AWS real | Testar upload real | Smoke avatar/post/evento/estabelecimento/produto | Objeto aparece no bucket correto, com MIME/tamanho validado | Sim |
| CloudFront | Pendente se `USE_CLOUDFRONT=true` | Abrir URL publica CDN | Upload + abrir `CLOUDFRONT_BASE_URL/...` | Midia publica carrega via CloudFront e nao expira indevidamente | Sim se CDN for requisito do release |
| Multipart mobile | Implementado em services | Smoke mobile | Upload avatar, post media, estabelecimento media | Upload mostra progresso/resultado e persiste URL | Sim |
| Permissoes mobile camera/galeria | Parcial | Testar em Android/iOS | Smoke em dispositivo | Permissoes solicitadas e negadas/tratadas corretamente | Sim para upload no release |

#### 6. E-mail SES

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Provider SES | Preparado; default desligado | Subir com `ENABLE_EMAIL=true EMAIL_PROVIDER=ses` | Start backend com `AWS_SES_REGION` e `AWS_SES_FROM_EMAIL` | App sobe e envia por SES | Sim para cadastro/verificacao/reset real |
| Identidade remetente | Pendente no README | Validar SES identity | Console/AWS CLI SES | Dominio/remetente verificado e fora de sandbox quando necessario | Sim |
| Reset de senha | Implementado; precisa SES real | Solicitar reset no app | Smoke auth | E-mail chega, token funciona, senha altera | Sim |
| Verificacao de e-mail | Implementado; precisa SES real | Cadastro + resend/verify | Smoke auth | Usuario recebe codigo/link e fica verificado | Sim se emailVerified for requisito |
| Falha de SES | Parcial | Simular erro SES | Teste backend/service | Erro controlado, sem 500 generico e sem vazar token | Sim |

#### 7. Push SNS/APNs/FCM

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Backend SNS | Preparado; default `PUSH_PROVIDER=none` | Subir com `PUSH_PROVIDER=sns` | Start backend com `AWS_SNS_REGION` e ARNs | Registro de token cria endpoint SNS | Sim para push real |
| Push Android sem Firebase | Pendente: projeto decidiu nao usar Firebase/google-services | Validar alternativa tecnica e build Android | Build Android/device com provider definido | Device Android registra token real sem Firebase, ou push Android fica fora do MVP | Sim para Android push |
| APNs iOS | Pendente | Validar credencial APNs/SNS iOS | Build iOS/device | Device iOS registra token e recebe push | Sim para iOS push |
| Env mobile de platform ARN | Pendente | Conferir env build | `EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID/IOS` no build | App envia ARN correto ou backend resolve por env | Sim para push real |
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
| Logs sensiveis | Parcial | Revisar logs em auth/email/push | Teste com falha auth/email | Tokens/senhas nao aparecem em logs | Sim |

#### 9. Observabilidade

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Logs estruturados | Implementado | Gerar requests e erros | `GET /health`, login invalido, endpoint 404 | Logs com requestId/status sem dados sensiveis | Sim |
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
| Settings criticas | Parcial | Minha conta e delete resolvidos no codigo local; senha, privacidade, cidade e demais preferencias ainda pendentes | Smoke manual | Nada simula persistencia falsa | Sim |

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
| Politica de privacidade | Parcial | Backend legal existe em `backend/src/modules/legal`; validar link/tela mobile e conteudo final juridico | Parcial | Sim |
| Termos de uso | Parcial | Backend legal existe; validar aceite no cadastro/onboarding e versao exibida | Parcial | Sim |
| Exclusao de conta | OK no codigo local; pendente smoke/LGPD final | Tela envia senha; backend valida senha e revoga refresh tokens; falta validar device/staging e politica de retencao/anonimizacao | Parcial ate smoke/legal final | Sim |
| Suporte/contato | Pendente | Definir email/canal real, tela/link de contato e monitoramento de caixa | Pendente | Sim |
| Consentimento de localizacao | Parcial | App pede permissao nativa; validar texto, negacao de permissao e uso sem crash | Parcial | Sim |
| Consentimento de push | Pendente/parcial | Definir push sem Firebase, pedir permissao no momento correto e registrar token real se push entrar no release | Pendente | Sim se push no release |
| E-mail transacional | Parcial | SES preparado, mas precisa envio real em staging/producao para verificacao/reset/suporte | Parcial | Sim |
| Tratamento de dados pessoais | Pendente | Mapear dados coletados, finalidade, retencao, exclusao e acesso; registrar no plano legal | Pendente | Sim |
| Logs sem dados sensiveis | Parcial | Validar request logs, error logs e audit logs sem senha, token, refresh token, Authorization, secret ou payload sensivel | Parcial | Sim |
| Consentimento/versionamento | Pendente | Registrar versao de termos/politica aceita pelo usuario quando necessario | Pendente | Sim para release publico |

#### Build mobile real de release

| Item | Status atual | Como validar | Criterio de pronto | Bloqueia producao? |
|---|---|---|---|---|
| Processo de build | Pendente | Confirmar EAS Build ou processo equivalente documentado | Existe pipeline/comando reproduzivel para release | Sim |
| APK/AAB Android | Pendente | `cd frontend && npx eas build -p android --profile production` ou processo equivalente | AAB/APK assinado gerado e instalado/testado | Sim |
| Package/bundle | Parcial | Revisar `frontend/app.json` | `android.package` e `ios.bundleIdentifier` finais e sem conflito | Sim |
| Icones/splash | Parcial | Instalar release em device e conferir assets | Icone/splash finais aparecem corretamente | Sim |
| Permissoes Android | Parcial | Revisar manifesto/build e testar negacao/permissao | Somente permissoes necessarias e textos corretos | Sim |
| Push Android | Pendente | Projeto decidiu nao usar Firebase; validar alternativa tecnica ou retirar push do release | Token/push real funciona sem Firebase, ou push fica fora do MVP | Sim se push no release |
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
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Setup pessoal, username/interesses/localizacao | Concluir perfil real apos cadastro | Parcial/nao comprovado para todos os campos | Parcial via User/Profile; validar schema atual | Sim | Corrigir contrato frontend/backend ou criar endpoint faltante | Persistir dados reais, validar username real, remover simulacao e smoke com DB vazio | P0 |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Editar dados da conta/avatar | Atualizar conta real e midia | Sim: `PUT /users/me`, `PUT /users/me/profile`, `POST /users/me/avatar` | Sim para usuario; midia depende Media/S3 | Sim | Conectar ao backend existente - RESOLVIDO no codigo local pela EXECUCAO-004 | Smoke mobile/staging, S3/CloudFront, erro de duplicidade e alteracao de e-mail | P0 ate smoke |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Alterar cidade/preferencia | Salvar cidade real usada em home/busca | Nao comprovado | Parcial se User/Profile tiver localizacao; cidade preferida precisa validar | Sim se cidade afeta descoberta | Criar backend novo e conectar ou manter fora do release | Persistir cidade, recarregar home/busca/mapa e remover lista local fake | P1; vira P0 se visivel com fake |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | Alterar privacidade/mensagens/check-ins | Controlar exposicao de dados e interacoes | Nao comprovado | Nao comprovado | Sim para release profissional | Criar model/migration/DTO/controller/service e conectar frontend, ou ocultar temporariamente | Modelar preferencias, endpoint GET/PUT, carregar estado real e salvar | P1; P0 se visivel alterando so estado local |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Senha/2FA/sessoes/seguranca | Proteger conta | Parcial para auth; 2FA/sessoes precisam validar | Parcial | Sim | Conectar ao backend existente e criar faltantes | Alterar senha real, 2FA real ou ocultar, listar/revogar sessoes se exibido | P0 |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Notificacoes, idioma, bloqueados, alterar senha, suporte/legal auxiliares | Ajustar preferencias e acessar suporte/legal | Parcial | Parcial/nao comprovado | Parcial | Classificar item a item; conectar ou ocultar temporariamente | Remover fallback local, conectar preferencias reais, suporte real e legal real | P1; P0 para itens visiveis fake |
| `frontend/src/screens/main/ActivityScreen.tsx` | Central de atividade | Ver historico/favoritos/interacoes reais | Parcial/nao comprovado | Parcial | Sim se tab/entrada visivel | Criar backend novo e conectar ou manter fora do release | Definir cards com contadores reais e rotas funcionais; sem card morto | P1; P0 se exibe dado falso |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | Favoritos | Ver itens favoritados reais | Nao comprovado | Nao comprovado | Sim se recurso visivel | Criar model/migration/DTO/controller/service e conectar frontend | Model favoritos, endpoints listar/adicionar/remover, empty state real | P1; P0 se visivel fake |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | Historico | Ver itens visitados/acoes recentes | Nao comprovado | Nao comprovado | Nao necessariamente | Manter fora do release ou criar backend novo | Se mantido, implementar tracking real; se nao, ocultar entrada em producao | P1 se visivel; P2 se oculto |
| `frontend/src/screens/main/CatalogScreen.tsx` | Catalogo | Ver produtos reais de estabelecimento | Sim via `GET /establishments/:id/products`; eventos entram por Home/Item | Sim products/events | Sim | Conectado ao backend existente no codigo local | `MOCK_CATALOGS` removido; rota sem `establishmentId` mostra estado honesto; validar smoke | P0 ate smoke |
| `frontend/src/screens/main/ItemScreen.tsx` | Detalhe de item | Ver produto/evento real e agir | Sim via `GET /products/:id` e `GET /events/:id`; acoes de presenca usam backend | Sim products/events | Sim se catalogo/home abrem item | Conectado ao backend existente no codigo local | `item-fallback` e CTA generico removidos; validar 404/empty e device real | P0 ate smoke |
| `frontend/src/screens/main/SearchScreen.tsx` | `RECENT_SEARCHES` | Reusar buscas recentes reais | Nao comprovado | Pode ser local storage aceitavel se declarado; backend nao obrigatorio | Sim se exibido | Corrigir contrato ou persistir local sem fingir backend | Declarar local-only honesto ou criar endpoint/preferencia; nao exibir sugestoes fake como reais | P1; P0 se parece dado real |
| `frontend/src/screens/main/MapScreen.tsx` | Item clicavel no mapa/lista | Abrir perfil/item do lugar/evento | Endpoint de origem parcial; destino existe parcialmente | Sim para establishment/event/product | Sim | Conectar ao backend existente/corrigir navegacao | Adicionar `onPress` real para Perfil/Item ou trocar por View nao clicavel | P0 se clicavel sem acao |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Roteamento ao tocar notificacao | Abrir conversa, perfil, item ou entidade relacionada | Parcial via notifications/chat/profile | Sim parcial | Sim se notificacoes visiveis | Corrigir contrato frontend/backend | Usar payload real, nested route com params e fallback honesto | P1; P0 se push/notificacoes no release |
| `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx` | Excluir conta com senha | Apagar conta real com confirmacao segura | OK no codigo local; smoke/LGPD final pendente | Sim User/Auth | Sim | Contrato corrigido no codigo local | Backend valida senha e revoga refresh tokens; ainda validar device/staging e retencao/anonimizacao LGPD | P0 ate smoke/legal final |
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
| Push notifications | Antes divergente Firebase; depois aprovado com SNS | Confirmado no backend; mobile/provider real pendente | `backend/src/common/notification/notification.service.ts` usa AWS SNS; `PushToken` e `NotificationDelivery` existem no Prisma; `frontend/src/services/push/PushRegistrationService.ts` registra token via API; `frontend/app.json` nao referencia `googleServicesFile` | Backend RESOLVIDO; decidir/validar push Android sem Firebase ou retirar push do release |
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
| SNS Mobile Push | Envio push backend via AWS | Credenciais plataforma Android/iOS, PushToken, app mobile | Backend SNS implementado; mobile registra token | Definir Android sem Firebase ou excluir push do release; validar device real |
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
| Firebase | Nao e backend do sistema | Nao criar dependencia de Firebase no backend; `frontend/app.json` permanece sem `googleServicesFile` |

#### Fase nova - hardening de backend

| Item | Status | Evidencia no codigo | Acao necessaria | Bloqueador |
|---|---|---|---|---|
| Base64 em midia | OK/parcial | `feed.service.ts` rejeita data URI/base64; auth 2FA ainda retorna placeholder `data:image/png;base64,...` em stub | Manter proibicao em midia real; substituir placeholder 2FA por QR real ou ocultar 2FA | Sim se 2FA aparecer no release |
| MediaService + S3 | OK | `MediaService` + `StorageService` + S3 client existem | Validar S3/CloudFront real em staging | Sim |
| JWT e claims | OK | `JwtPayload`, `jwtid: randomUUID()`, `USER/ESTABLISHMENT` | Smoke auth/refresh/2FA em staging | Sim |
| Logica morta/nao usada | Parcial | Existem telas/services parciais no mobile; backend core principal em uso | Fazer varredura por modulo antes de release e remover/ocultar apenas com decisao de escopo | Nao por si; Sim se visivel fake |
| AuditLog | OK | `AuditLogService.record` usado nos modulos core | Garantir novos fluxos tambem auditam | Sim para fluxos sensiveis |
| Tracking email/push | Parcial | Push tem `NotificationDelivery`; email retorna resultado mas nao ha tabela de delivery email dedicada | Criar tracking de email se verificacao/reset exigir auditoria operacional | P1; P0 se email critico sem diagnostico |
| Env obrigatoria | OK/parcial | `env.validation.ts` valida providers e Redis em producao | Validar env real ECS/Secrets; sem localhost em prod | Sim |
| Secrets hardcoded | OK no versionado principal | `backend/.env` fora do Git; docs exigem Secrets/SSM | Varredura final antes de release e rotacao se qualquer segredo apareceu localmente | Sim |
| DTOs | OK/parcial | DTOs com class-validator existem em auth/feed/search/events/establishments/products/notifications | Validar contratos frontend/backend pendentes do plano | Sim para fluxos P0 |
| Tratamento de erro | Parcial | `GlobalExceptionFilter` existe | Smoke erros reais sem 500 generico indevido e sem dados sensiveis | Sim |
| Logs estruturados | OK/parcial | `logStructured` e `HttpLoggingInterceptor` existem | Validar CloudWatch e ausencia de senha/token nos logs | Sim |
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
| Onboarding pessoal | Sim | Completar perfil real | Parcial no plano | Entra se persistir real; caso contrario bloquear release | Nao pode simular username/perfil |
| Onboarding empresarial | Sim | Criar estabelecimento real | Backend/tela existem; smoke pendente | Entra no release | Validar criacao com midia/geocode/horarios |
| Feed social T_AGITO | Sim | Conteudo social real | Confirmado no codigo | Entra no release | Nao reabrir como mock |
| Home/discovery | Sim | Descoberta de eventos/locais | Parcial; depende dados reais e empty states | Entra com backend real e banco vazio correto | Sem cards fake |
| Busca | Sim | Encontrar locais/eventos | Backend real; `RECENT_SEARCHES` local fake | Entra apos corrigir recentes/empty state | P1/P0 se visivel fake |
| Perfil usuario/estabelecimento | Sim | Identidade e vitrine | Parcial para perfil publico usuario | Entra com escopo claro | Bloquear rotas que fingem perfil publico inexistente |
| Catalogo/item | Sim para estabelecimento/produto/evento | Vitrine publica | Backend existe; frontend sem fallback mock no codigo local | Entra apos smoke mobile/staging confirmar produto/evento reais e banco vazio | P0 ate smoke |
| Mapa | Sim se discovery usa mapa | Localizar itens | Parcial; item clicavel sem acao no plano | Entra se navegacao real/empty state ok | P0 se item clicavel morto |
| Chat | Sim se interacao entre usuarios/estabelecimentos | Conversa real | Backend confirmado; smoke multi-device pendente | Entra se smoke realtime passar | P0 se exposto |
| Notificacoes in-app | Sim | Alertas internos | Backend/service existem; roteamento parcial | Entra com roteamento honesto | Push pode ser fora do MVP se documentado |
| Push | Opcional para primeiro MVP | Retencao/alertas | Backend SNS existe; plataforma mobile pendente | Entra somente se device real passar; senao sai do release | Sem Firebase como backend |
| Settings criticas | Sim | Conta, seguranca, privacidade, delete | Parcial | Entra apenas com backend real ou itens ocultos | Nada de toggle local fake |
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
| Settings criticas com estado local/fake | MyAccount resolvido no codigo local pela EXECUCAO-004; Delete resolvido pela EXECUCAO-003; Privacy/Security/City e preferencias auxiliares ainda parciais | Conectar backend ou ocultar itens nao prontos; validar MyAccount/Delete em smoke |
| Build mobile release real | Ainda pendente EAS/processo equivalente/device real | Gerar APK/AAB, validar env e smoke em device |
| SES/SNS/S3/Redis reais | Codigo existe, ambiente real nao validado | Validar providers em staging AWS |
| E2E e smoke com banco vazio | e2e depende postgres-test; banco zerado precisa smoke | Subir DB teste/staging limpo e validar estados vazios |
| Seguranca/LGPD minima | Delete com senha resolvido no codigo local; termos, privacidade, suporte, retencao LGPD e logs sensiveis ainda parciais | Fechar legal/suporte/retencao/log redaction e smoke de delete |

##### P1 - NECESSARIO PARA RELEASE PROFISSIONAL

| Item | Evidencia | Acao |
|---|---|---|
| Search `RECENT_SEARCHES` | `SearchScreen.tsx` contem lista fixa | Persistir local honesto ou backend; nao parecer dado real |
| Notifications routing | Plano registra payload/roteamento parcial | Passar params corretos para chat/perfil/item |
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

Resumo de bloqueadores absolutos antes de deploy publico real:

1. AWS real ponta a ponta: ECS/ECR/RDS/ElastiCache/S3/CloudFront/ALB/ACM/Secrets.
2. Migrations aplicadas no banco alvo.
3. Redis externo validado em producao.
4. SES real validado para verificacao/reset.
5. Push real validado em device sem Firebase, ou push formalmente fora do primeiro release.
6. Smoke mobile manual completo.
7. Remocao/correcao dos mocks P0 do PROMPT-006.
8. Build final backend e mobile com env de producao, sem `localhost`.
