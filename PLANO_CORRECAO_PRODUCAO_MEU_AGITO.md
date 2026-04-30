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

Impacto:

- O app ainda pode exibir catalogo/item como se fossem reais quando estao em modo mock ou incompleto.

Correcao:

- Remover fallback fake do fluxo publico ou implementar contratos reais para cada template.

### B7 - Exclusao de conta pede senha na UI, mas backend nao valida senha

Evidencias:

- `frontend/src/services/api/UserService.ts:93-95` deleta conta buscando o usuario atual e chamando `DELETE /users/:id`.
- `backend/src/modules/users/users.controller.ts:269-280` expoe `DELETE /users/:id` protegido por dono do recurso, mas sem receber senha.

Impacto:

- A UI pode sugerir uma garantia de seguranca que o backend nao executa.

Correcao:

- Adicionar DTO com senha e validacao no backend, ou remover a exigencia de senha da UI. Para producao, a correcao recomendada e validar senha no backend.

### B8 - Textos corrompidos e placeholders visiveis

Evidencias:

- `frontend/src/screens/main/NotificationsScreen.tsx:49-69` usa `??` como avatar.
- `frontend/src/screens/main/NotificationsScreen.tsx:306-319` exibe `??` e `?`.
- `frontend/src/screens/main/NotificationsScreen.tsx:335` exibe `??` no contador.
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:41-44` contem texto mojibake.
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

1. Conectar `SettingsMyAccountScreen` ao perfil real.
2. Implementar upload de foto ou remover botao ate existir.
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
| `frontend/src/screens/main/CatalogScreen.tsx:57-175` | Catalogo usa mock fora do modo remoto | Exigir dados reais ou estado vazio |
| `frontend/src/screens/main/ItemScreen.tsx:49-139` | Item generico e acoes fora do MVP | Remover ou implementar contratos |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx:40-77` | Conta fixa, upload vazio, save simulado | Conectar a API de usuario e media |
| `frontend/src/screens/main/SettingsCityScreen.tsx:22-52` | Cidade e recentes locais | Persistir preferencia real |
| `frontend/src/screens/main/SettingsScreen.tsx:88-163` | Toggle/acao local | Conectar backend ou remover |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx:31-34` | Privacidade nao carrega/persiste | Criar contrato e conectar |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29` | Seguranca sem carregamento real | Criar contrato e conectar |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:200-210` | Troca de senha scaffold | Implementar formulario e endpoint |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:375-398` | Dispositivos/historico fake | Criar endpoint ou remover |
| `frontend/src/screens/main/SettingsAuxScreens.tsx:102-112` | Contas vinculadas existe e esta registrada, mas nao tem entrada acessivel no menu de Settings | Adicionar item de menu real ou remover rota |
| `frontend/src/screens/main/FeedSocialScreen.tsx:242-245` + `frontend/src/screens/main/ProfileScreen.tsx:148-192` | Avatar do autor no feed envia `userId`, mas `ProfileScreen` nao carrega perfil publico por `userId` e estabelecimento exige `establishmentId` | Passar `establishmentId` quando autor for estabelecimento e implementar perfil publico de usuario por `userId` |
| `frontend/src/screens/main/NotificationsScreen.tsx:233-249` | Clique em notificacao perde parametros de usuario/conversa/entidade e navega so para tabs genericas | Roteamento por `entityType`, `entityId`, `relatedUserId` e `conversationId` |
| `frontend/src/services/api/UserService.ts:93-95` | Delete account nao envia senha | Enviar senha |
| `backend/src/modules/users/users.controller.ts:269-280` | Backend deleta sem validar senha | Validar senha antes de soft delete |
| `frontend/src/screens/main/NotificationsScreen.tsx:49-69` | Placeholders `??` | Trocar por icones/textos reais |
| `backend/src/modules/products/products.controller.ts:56-112` | Gestao de produtos existe no backend sem UI owner pronta | Criar tela owner ou remover do release |
| `frontend/src/utils/runtimeApiUrl.ts:4-43` | Producao cai para `https://api.meuagito.com` se `EXPO_PUBLIC_API_URL` nao existir | Validar DNS/ALB ou exigir `EXPO_PUBLIC_API_URL` no build |
| `frontend/app.json:17-29` | iOS nao aponta arquivo Firebase/APNs equivalente ao Android | Definir estrategia iOS push ou declarar Android-only no release |
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
| `frontend/src/services/api/AuthService.ts:94-103` + `frontend/src/services/api/ApiClient.ts:51-59` | Refresh token chamado pelo store passa pelo interceptor que pode sobrescrever o header `Authorization` com access token | Fazer refresh por cliente sem interceptor ou preservar header explicito em `/auth/refresh` |
| `frontend/src/services/api/UserService.ts:53-55` + `backend/src/modules/users/users.controller.ts:187-233` | `updateProfile` envia `bio`, `location` e `website` para `PUT /users/me`, mas backend espera esses campos em `PUT /users/me/profile` | Mudar service para `PUT /users/me/profile` para dados de perfil e separar update de conta |
| `frontend/src/services/api/FeedService.ts:149-155` + `frontend/src/services/api/FeedService.ts:211-216` | Front envia `video`, mas `CreatePostDto` e `UpdatePostDto` nao aceitam esse campo | Remover `video` do payload ou implementar suporte backend antes do release |
| `backend/src/modules/feed/feed.controller.ts:380-403` + `backend/src/modules/feed/feed.controller.ts:488-519` | Endpoints de liked/likes e edicao de comentario existem, mas nao ha chamada correspondente no `FeedService` | Criar metodos e UI ou remover escopo do release |
| `backend/src/modules/users/users.controller.ts:73-119` + `backend/src/modules/users/users.controller.ts:214-233` | Endpoints de perfil publico/stats/is-following/profile existem, mas o service usa `GET /users/:id` e nao usa `PUT /users/me/profile` | Conectar service/telas aos endpoints corretos |
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
- [ ] Catalogo e Item sem fallback fake.
- [ ] Delete account validando senha no backend.
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
- Firebase mobile: `frontend/google-services.json` existe; `frontend/GoogleService-Info.plist` nao existe.
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
| Catalogo publico de produto | Criado parcialmente | `frontend/src/screens/main/CatalogScreen.tsx:159-189` | Real quando recebe `establishmentId`; mock quando nao recebe |
| Item produto/evento | Criado parcialmente | `frontend/src/screens/main/ItemScreen.tsx:157-229` | Produto/evento real; templates genericos incompletos |
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
| `frontend/app.json` | Android aponta `google-services.json`, iOS nao aponta arquivo Firebase/APNs equivalente | Referenciado mas inexistente | Push iOS nao fica provado no app atual | `frontend/app.json:17-44`; `frontend/GoogleService-Info.plist` ausente | Definir iOS push ou release Android-only documentado | P1 |
| `frontend/src/screens/auth/PersonalSetupScreen.tsx` | Disponibilidade de username e finalizacao de perfil sao simuladas | Mockado/estatico/fake | Perfil pessoal pode concluir onboarding sem persistencia real | `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-87` | Criar/usar endpoint real de username e salvar setup pessoal | P0 |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Dados de conta fixos, upload sem acao e save simulado | Mockado/estatico/fake | Usuario edita perfil sem persistir no backend | `frontend/src/screens/main/SettingsMyAccountScreen.tsx:40-77` | Conectar perfil e upload real | P0 |
| `frontend/src/screens/main/SettingsCityScreen.tsx` | Cidades e recentes sao locais/fixos | Mockado/estatico/fake | Preferencia de cidade nao persiste | `frontend/src/screens/main/SettingsCityScreen.tsx:22-52` | Conectar preferencia real ou remover tela | P1 |
| `frontend/src/screens/main/SettingsScreen.tsx` | GPS e desativacao de conta sao acoes locais/alerta | Quebrado ou sem ligacao | Usuario ve acao sem efeito backend | `frontend/src/screens/main/SettingsScreen.tsx:88-163` | Persistir preferencias e implementar desativacao real | P0 |
| `frontend/src/screens/main/SettingsPrivacyScreen.tsx` | Privacidade tem comentario de load, mas nao carrega/persiste | Criado parcialmente | Preferencias de privacidade nao sao reais | `frontend/src/screens/main/SettingsPrivacyScreen.tsx:31-34` | Criar contrato backend ou remover do release | P1 |
| `frontend/src/screens/main/SettingsSecurityScreen.tsx` | Seguranca tem comentario de load, mas nao carrega dados reais | Criado parcialmente | Tela passa impressao de seguranca sem estado real | `frontend/src/screens/main/SettingsSecurityScreen.tsx:26-29` | Criar contrato real para estado de seguranca | P1 |
| `frontend/src/screens/main/SettingsAuxScreens.tsx` | Trocar senha e dispositivos/historico sao scaffolds/estaticos | Criado parcialmente | Fluxos de seguranca ficam incompletos | `frontend/src/screens/main/SettingsAuxScreens.tsx:200-210`, `375-398` | Implementar formularios/endpoints ou remover | P0 |
| `frontend/src/screens/main/ActivityScreen.tsx` | Cards `coming_soon` exibem alerta `Em breve` | Criado parcialmente | Area principal mostra recurso nao entregue | `frontend/src/screens/main/ActivityScreen.tsx:40-71` | Implementar ou ocultar cards | P1 |
| `frontend/src/screens/main/ActivityFavoritesScreen.tsx` | Tela declara falta de endpoint/lista consolidada | Criado parcialmente | Favoritos nao estao consumiveis nesta area | `frontend/src/screens/main/ActivityFavoritesScreen.tsx:27-46` | Criar endpoint/lista ou remover tela | P1 |
| `frontend/src/screens/main/ActivityHistoryScreen.tsx` | Tela declara falta de contrato canonico de historico | Criado parcialmente | Historico nao e funcional | `frontend/src/screens/main/ActivityHistoryScreen.tsx:27-39` | Criar contrato ou remover tela | P1 |
| `frontend/src/screens/main/CatalogScreen.tsx` | Catalogo usa `MOCK_CATALOGS` quando nao ha `establishmentId` | Mockado/estatico/fake | Usuario pode ver produtos/servicos fake | `frontend/src/screens/main/CatalogScreen.tsx:57-175` | Remover fallback mock ou exigir contexto real | P0 |
| `frontend/src/screens/main/ItemScreen.tsx` | Templates genericos possuem `item-fallback` e CTA fora do MVP | Criado parcialmente | CTA de pedido/reserva/agenda nao executa fluxo real | `frontend/src/screens/main/ItemScreen.tsx:49-139`, `270-276` | Remover CTAs ou implementar contratos reais | P0 |
| `frontend/src/services/api/UserService.ts` + `backend/src/modules/users/users.controller.ts` | UI de delete account pode pedir senha, mas service/backend deletam sem senha | Quebrado ou sem ligacao | Garantia de seguranca inconsistente | `frontend/src/services/api/UserService.ts:93-95`; `backend/src/modules/users/users.controller.ts:269-280` | Validar senha no backend antes de soft delete | P0 |
| `frontend/src/screens/main/NotificationsScreen.tsx` | Tela tem placeholders `??` e `?` visiveis | Mockado/estatico/fake | UI final fica quebrada | `frontend/src/screens/main/NotificationsScreen.tsx:49-69`, `306-335` | Trocar por icones/textos reais | P1 |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` e telas Settings | Textos mojibake visiveis | Quebrado ou sem ligacao | Release visualmente quebrado | `frontend/src/screens/main/SettingsMyAccountScreen.tsx:41-44`; `SettingsScreen.tsx:89-90`; `SettingsPrivacyScreen.tsx:88-115` | Normalizar encoding e revisar strings | P1 |
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
| Catalogo | Sim | Sim | Sim, via Perfil | Real somente com `establishmentId` | Sim | `MOCK_CATALOGS` quando sem remoto | Nao | `RootNavigator.tsx:221`, `ProfileScreen.tsx:233-242`, `CatalogScreen.tsx:57-175`, `182-189` |
| Item | Sim | Sim | Sim, via Home/Catalogo/Perfil | Real para produto/evento | Sim | `item-fallback` e CTA fora do MVP | Nao | `RootNavigator.tsx:222`, `CatalogScreen.tsx:328`, `ItemScreen.tsx:49-139`, `169-208`, `270-289` |
| Favoritos | Sim | Sim | Sim, via Atividade | Nao consome lista real | Nao | Tela informa lacuna | Nao | `RootNavigator.tsx:74`, `ActivityScreen.tsx:33-76`, `ActivityFavoritesScreen.tsx:27-46` |
| Historico | Sim | Sim | Sim, via Atividade | Nao existe contrato real | Nao | Tela informa lacuna | Nao | `RootNavigator.tsx:75`, `ActivityScreen.tsx:57-76`, `ActivityHistoryScreen.tsx:27-39` |
| Minha conta | Sim | Sim | Sim, via Settings | Fake/local | Nao | Dados fixos, upload vazio, save simulado | Nao | `RootNavigator.tsx:84`, `SettingsScreen.tsx:65`, `SettingsMyAccountScreen.tsx:40-77` |
| Cidade | Sim | Sim | Sim, via Settings | Fake/local | Nao | Lista de cidades e recentes fixos | Nao | `RootNavigator.tsx:85`, `SettingsScreen.tsx:78`, `SettingsCityScreen.tsx:22-52` |
| Privacidade | Sim | Sim | Sim, via Settings | Local-only | Nao | `Load privacy settings` sem implementacao | Nao | `RootNavigator.tsx:89`, `SettingsScreen.tsx:113`, `SettingsPrivacyScreen.tsx:31-34`, `68-118` |
| Seguranca | Sim | Sim | Sim, via Settings | Parcial | Parcial via sub-tela 2FA | `Load security settings` sem implementacao | Nao | `RootNavigator.tsx:91`, `SettingsScreen.tsx:120`, `SettingsSecurityScreen.tsx:26-29`, `37-80` |
| Excluir conta | Sim | Sim | Sim, via Settings | Real parcial | Sim, mas sem senha | UI pede senha, backend nao valida | Nao | `RootNavigator.tsx:98`, `SettingsScreen.tsx:176`, `SettingsDeleteAccountScreen.tsx:45-54`, `UserService.ts:93-95`, `users.controller.ts:269-280` |
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
- Telas com service real mas ainda nao prontas por placeholder/fallback/acao parcial: Buscar, Mapa, Notificacoes, Catalogo, Item, Excluir conta.
- Telas criadas visualmente mas sem backend real suficiente: PersonalSetup, Atividade, Favoritos, Historico, Minha conta, Cidade, Privacidade, Seguranca, Raio de busca, Preferencias de notificacoes, Bloqueados, Alterar senha, Dispositivos, Historico de acessos, Idioma.
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
| `frontend/src/screens/main/CatalogScreen.tsx:327-334` | Tocar item do catalogo | Abrir `Item` com contexto do item | Navega `Item` com `template`, `productId`, `establishmentId`, `item` | Com catalogo remoto funciona; se `Catalog` estiver sem `establishmentId`, origem usa mock | Exigir `establishmentId` para catalogo publico ou bloquear fallback fake |
| `frontend/src/screens/main/ProfileScreen.tsx:233-256` | Tocar vitrine/produto no perfil | Abrir `Catalog`/`Item` do estabelecimento | Navega com `establishmentId`, `establishmentName` e `productId` | Sem problema de nome/parametro encontrado | Manter; validar em smoke |
| `frontend/src/screens/main/ItemScreen.tsx:255-266` | Tocar estabelecimento no item de produto | Voltar/abrir perfil do estabelecimento | Navega `MainTabs -> Profile` com `establishmentId` se existir; senao `goBack()` | Se produto vier sem estabelecimento, acao nao abre destino real | Garantir backend retorna `product.establishment.id` ou desabilitar CTA quando ausente |
| `frontend/src/screens/main/ChatScreen.tsx:129-136` | Tocar conversa | Abrir detalhe da conversa | Navega `ChatDetail` com `conversationId` e `recipientName` | Rota existe no stack interno do chat | Manter; validar em smoke 2 usuarios |
| `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx:52-64` | Confirmar exclusao de conta | Logout e retorno ao login | `CommonActions.reset` para `Login` | Nome de rota existe, mas a exclusao nao valida senha no backend | Corrigir contrato de delete account; navegacao final esta coerente |

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
- `frontend/src/screens/main/SettingsMyAccountScreen.tsx:63-66` foi o caso confirmado de botoes de alerta com `onPress: () => {}`.
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
| Funcional real com ressalva | Excluir conta | `frontend/src/screens/main/SettingsDeleteAccountScreen.tsx:48-54`, `198-204` | Front chama service real, mas a senha digitada nao e validada pelo backend; manter como bloqueio B7 |
| Parcial | Busca rapida | `frontend/src/screens/main/SearchScreen.tsx:52`, `295-299` | Chips executam busca real, mas a origem `RECENT_SEARCHES` e estatica |
| Parcial | Notificacoes | `frontend/src/screens/main/NotificationsScreen.tsx:222-249`, `274-278` | Marca como lida/deleta via service real, mas roteia para tabs genericas e perde parametros |
| Parcial | Perfil publico a partir do feed | `frontend/src/screens/main/FeedSocialScreen.tsx:239-245` | `onPress` existe, mas envia params que `ProfileScreen` nao consome corretamente |
| Parcial | Configuracoes locais | `frontend/src/screens/main/SettingsScreen.tsx:88-93`, `196-198` | Toggle visual/local sem persistencia e fallback vazio para handler |
| Mock/fake | Minha conta | `frontend/src/screens/main/SettingsMyAccountScreen.tsx:40-77`, `103-127` | Dados fixos, carregamento/save simulados e upload sem implementacao |
| Mock/fake | Cidade | `frontend/src/screens/main/SettingsCityScreen.tsx:22-52`, `71-143` | GPS escolhe `Sao Paulo, SP`, lista e historico sao locais |
| Mock/fake | Catalogo sem `establishmentId` | `frontend/src/screens/main/CatalogScreen.tsx:57-175`, `324-334` | Card clicavel pode abrir `Item` com item de `MOCK_CATALOGS` |
| Mock/fake | Telas auxiliares de Settings | `frontend/src/screens/main/SettingsAuxScreens.tsx:102-154`, `188-210`, `375-398` | Linhas estaticas, switches disabled ou scaffold sem service real |
| Quebrado | Lista do mapa | `frontend/src/screens/main/MapScreen.tsx:111-131` | `TouchableOpacity` sem `onPress`; aparencia clicavel sem efeito |
| Quebrado | Alterar foto em Minha conta | `frontend/src/screens/main/SettingsMyAccountScreen.tsx:63-66` | Alert tem botoes `Camera` e `Galeria` com funcao vazia |
| Nao implementado | Pedidos, Agendamentos e Reservas em Activity | `frontend/src/screens/main/ActivityScreen.tsx:36-55`, `69-71` | Cards terminam em alerta `Em breve` |
| Nao implementado | CTAs genericos de Item | `frontend/src/screens/main/ItemScreen.tsx:49-73`, `270-276`, `600-603` | `Agendar`, `Reservar`, `Assinar` e similares apenas exibem alerta |
| Nao implementado | Setup pessoal real | `frontend/src/screens/auth/PersonalSetupScreen.tsx:66-87`, `104-106`, `119-124`, `253-266` | Username, GPS, avatar, skip e finish sao locais/simulados |

Tabela de acoes com problema:

| Arquivo | Componente | Acao | Classificacao | Problema | Evidencia no codigo | Correcao |
|---|---|---|---|---|---|---|
| `frontend/src/screens/main/MapScreen.tsx` | `TouchableOpacity` de item da lista | Tocar evento/estabelecimento no mapa | Quebrado | Nao existe `onPress`; item parece clicavel e nao faz nada | `MapScreen.tsx:111-131` | Adicionar navegacao por `mapType` para `Item`/`Profile` ou trocar para `View` |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Alert `Alterar Foto` | Tocar `Camera` ou `Galeria` | Quebrado | Ambos os botoes usam `onPress: () => {}` | `SettingsMyAccountScreen.tsx:63-66` | Implementar image picker/upload real ou remover botoes |
| `frontend/src/screens/main/SettingsMyAccountScreen.tsx` | Botao `Salvar` | Salvar dados de conta | Mock/fake | Dados iniciais fixos, loading via `setTimeout` e save simulado | `SettingsMyAccountScreen.tsx:40-77`, `103-115` | Carregar perfil real e chamar service de update |
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
| `frontend/src/screens/main/CatalogScreen.tsx` | Card de catalogo | Abrir item | Mock/fake | Sem `establishmentId`, carrega `MOCK_CATALOGS` e navega para `Item` com item fake | `CatalogScreen.tsx:57-175`, `324-334` | Exigir contexto real ou estado vazio; remover mock |
| `frontend/src/screens/main/ItemScreen.tsx` | CTA generico | Agendar, reservar, assinar, adicionar ao carrinho | Nao implementado | `handleGenericAction` so mostra alerta de fluxo fora do MVP | `ItemScreen.tsx:49-73`, `270-276`, `600-603` | Remover CTA do release ou implementar contratos reais |
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
- Quebrado por contrato: `AuthService.refreshToken`, `UserService.updateProfile` e `FeedService.createPost/updatePost` com campo `video`.
- Parcial para producao: tratamento de erro e generico no `ApiClient`; alguns fluxos dependem de SES/SNS/S3/CloudFront reais e smoke mobile.
- Endpoint backend existente mas sem consumo mobile confirmado: gestao owner de produtos, media generica, liked/likes de post, edicao de comentario, public-profile/stats/is-following de usuario, `PUT /users/me/profile`, legal JSON e health.

Tabela service/endpoints:

| Service frontend | Chamada | Endpoint backend | Status | Incompatibilidade | Correcao |
|---|---|---|---|---|---|
| `AuthService.ts:69-77` | `POST /auth/signup`, `POST /auth/login` | `AuthController` `@Post('signup')` e `@Post('login')` em `backend/src/modules/auth/auth.controller.ts:28-68` | OK estatico | Payloads batem com `SignUpDto` e `LoginDto`; rota publica | Manter e validar em smoke mobile |
| `AuthService.ts:83-88` | `POST /auth/verify-2fa-login` com `userId`, `code`, `tempToken` | `AuthController` `@Post('verify-2fa-login')` em `auth.controller.ts:299` | OK estatico | Nenhuma incompatibilidade confirmada | Validar fluxo com usuario 2FA real |
| `AuthService.ts:94-103` | `POST /auth/refresh` com `Authorization: Bearer <refreshToken>` | `AuthController` `@Post('refresh')` + `RefreshTokenGuard` em `auth.controller.ts:93-116`; strategy le bearer em `refresh-token.strategy.ts:11-16` | Quebrado | A chamada usa `apiClient.post`; interceptor em `ApiClient.ts:51-59` pode sobrescrever o header explicito com access token. O store chama esse metodo em `authStore.ts:356-380` | Fazer `AuthService.refreshToken` usar axios cru/cliente sem interceptor ou alterar interceptor para preservar `Authorization` explicito em `/auth/refresh` |
| `ApiClient.ts:231-270` | Refresh automatico em 401 via axios cru `POST /auth/refresh` | Mesmo endpoint `POST /auth/refresh` | OK estatico | Esse caminho nao passa pelo interceptor e envia bearer de refresh corretamente | Reaproveitar esse caminho tambem no `AuthService.refreshToken` |
| `AuthService.ts:109-129` | `POST /auth/logout`, `POST /auth/enable-2fa`, `POST /auth/verify-2fa`, `POST /auth/disable-2fa` | `AuthController` `@Post('logout')`, `enable-2fa`, `verify-2fa`, `disable-2fa` em `auth.controller.ts:118-287` | OK estatico | Rotas protegidas dependem do bearer injetado pelo `ApiClient` | Smoke autenticado |
| `AuthService.ts:135-172` | `POST /auth/request-password-reset`, `reset-password`, `change-password`, `verify-email`, `resend-verification-email` | Endpoints equivalentes em `auth.controller.ts:129-216` | OK estatico | Payloads batem com DTOs; e-mail real depende de SES | Fechar SES e smoke de e-mail |
| `UserService.ts:45-50` | `GET /users/me`, `GET /users/:userId` | `UsersController` `@Get('me')` e `@Get(':id')` em `users.controller.ts:48-69`, `171-185` | OK estatico | `getUserProfile` usa rota generica, nao `public-profile` | Decidir se perfil publico deve usar `GET /users/:id/public-profile` |
| `UserService.ts:53-55` | `PUT /users/me` com `{ name?, bio?, location?, website? }` | `UsersController` `@Put('me')` usa `UpdateUserDto`; `@Put('me/profile')` usa `UpdateProfileDto` em `users.controller.ts:187-233` | Quebrado | `UpdateUserDto` permite `email`, `name`, `profileType`; `bio`, `location`, `website` pertencem a `UpdateProfileDto`. Com `forbidNonWhitelisted`, payload com esses campos falha | Dividir em `updateAccount` para `/users/me` e `updateProfile` para `/users/me/profile` |
| `UserService.ts:57-70` | Multipart `POST /users/me/avatar` campo `file` | `UsersController` `@Post('me/avatar')` + `FileInterceptor('file')` em `users.controller.ts:236-267` | OK estatico | Depende de storage real para producao | Validar S3/CloudFront e smoke de upload |
| `UserService.ts:73-101` | follow/unfollow, followers/following, search `GET /users`, delete `DELETE /users/:id` | Endpoints equivalentes em `users.controller.ts:121-169`, `269-324` | Parcial | Delete account nao envia senha; backend deleta com `ResourceOwnerGuard`, sem validar senha digitada pela UI | Adicionar DTO/senha no backend ou remover pedido de senha da UI |
| `CatalogService.ts:22-28` | `GET /establishments/:id/products`, `GET /products/:id` | `ProductsController` `@Get('establishments/:id/products')`, `@Get('products/:id')` em `products.controller.ts:42-54` | OK estatico | Leitura existe, mas UI ainda pode cair em mock quando nao ha `establishmentId` | Bloquear fallback fake e exigir contexto real |
| `Sem service frontend` | Criar/editar/arquivar/upload de produto | `ProductsController` `POST/PUT/DELETE /establishments/:id/products...` e `POST .../media` em `products.controller.ts:56-145` | Endpoint existente nao usado | Owner nao consegue gerir catalogo completo pelo service mobile atual | Criar metodos no `CatalogService` e telas owner, ou retirar gestao de produtos do release |
| `ChatService.ts:72-181` | Conversas, mensagens, editar/deletar, marcar lida, busca, unread, arquivar | `ChatController` endpoints equivalentes em `chat.controller.ts:44-205` | OK estatico | JSON `{ recipientId }`, `{ content }` e multipart `content` + `file` batem com controller/DTO | Validar anexos reais e push/chat realtime no smoke |
| `FeedService.ts:149-155` | `POST /posts` com `content`, `imageUrls`, `video` | `FeedController` `@Post()` em `feed.controller.ts:51-73`; `CreatePostDto` em `create-post.dto.ts:12-56` | Quebrado quando `video` vem preenchido | `CreatePostDto` nao define `video`; backend rejeita campo extra | Remover `video` do payload ou adicionar suporte backend/testes |
| `FeedService.ts:158-174` | Multipart `POST /posts/media?postId=...` campo `file` | `FeedController` `@Post('media')` em `feed.controller.ts:76-107` | OK estatico | Query `postId` e opcional; nao e rota inexistente | Manter e validar S3/CloudFront |
| `FeedService.ts:177-207` | `GET /posts/feed`, `GET /feed/agito`, `GET /posts/explore`, `GET /posts/:id` | `FeedController` e `AgitoFeedController` em `feed.controller.ts:114-220`, `agito-feed.controller.ts:13` | OK estatico | Paginacao `page/limit` e cursor `cursor/limit/mode` batem com DTOs | Smoke de feed real |
| `FeedService.ts:211-216` | `PUT /posts/:id` com `content`, `imageUrls`, `video` | `FeedController` `@Put(':id')` em `feed.controller.ts:257-285`; `UpdatePostDto` em `update-post.dto.ts:12-56` | Quebrado quando `video` vem preenchido | `UpdatePostDto` nao define `video`; backend rejeita campo extra | Mesmo ajuste de contrato do create post |
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

1. Corrigir `AuthService.refreshToken` para nao passar pelo interceptor que injeta access token.
2. Corrigir `UserService.updateProfile` para usar `PUT /users/me/profile` e separar dados de conta de dados de perfil.
3. Alinhar contrato de post com `video`: remover do frontend ou implementar DTO/backend/storage para video.
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
| P0 | `frontend/src/screens/main/SettingsMyAccountScreen.tsx:40-47`, `51-53`, `70-79` | Conta inicial fixa (`Joao Silva`, `joao@example.com`), loading por timer e save simulado | Nao | Perfil do usuario autenticado, avatar real, email real, bio/location/website reais | `userService.getProfile()`, `userService.updateProfile()`, `userService.uploadAvatar()`; corrigir antes `PUT /users/me/profile` conforme PROMPT-005 | Usuario pode acreditar que salvou dados, mas nada persiste; exposto a dado de exemplo em conta real |
| P0 | `frontend/src/screens/main/SettingsMyAccountScreen.tsx:62-67` | Alert de foto usa botoes `Camera` e `Galeria` com `onPress: () => {}` | Nao | Imagem escolhida pelo usuario e upload real | Image picker + `userService.uploadAvatar()` -> `POST /users/me/avatar` | Acao critica sem efeito; quebra confianca e impede avatar real |
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
2. Reimplementar `SettingsMyAccountScreen` com `userService.getProfile`, `PUT /users/me/profile` e `POST /users/me/avatar`; remover timers e dados de Joao.
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
- `frontend/app.json` configura package/bundle id e permissoes, mas referencia `./google-services.json`; arquivo nao foi encontrado na raiz `frontend`.
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
| Remocao de mocks bloqueantes | Pendente | Validar itens PROMPT-006 | Varredura + smoke das telas | Catalogo, minha conta, onboarding pessoal e cidade nao simulam producao | Sim |
| Config de push mobile | Parcial | Conferir `google-services.json`, APNs/FCM e env SNS | `Test-Path frontend/google-services.json`; build/device | Android/iOS geram token nativo e registram no backend | Sim para push no release |
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
| FCM Android | Pendente: `app.json` referencia `google-services.json`, arquivo nao encontrado | Conferir arquivo e build | `Test-Path frontend/google-services.json`; build Android | Device token nativo gerado por Expo Notifications | Sim para Android push |
| APNs iOS | Pendente | Validar credencial APNs/SNS iOS | Build iOS/device | Device iOS registra token e recebe push | Sim para iOS push |
| Env mobile de platform ARN | Pendente | Conferir env build | `EXPO_PUBLIC_AWS_SNS_PLATFORM_APPLICATION_ARN_ANDROID/IOS` no build | App envia ARN correto ou backend resolve por env | Sim para push real |
| Test push | Endpoint existe | Chamar endpoint autenticado | `POST /notifications/push-test` via app/curl | Push chega no device e entrega fica registrada | Sim para release com push |

#### 8. Seguranca

| Item | Status atual | Como validar | Comando ou teste necessario | Criterio para considerar pronto | Bloqueia deploy? |
|---|---|---|---|---|---|
| Secrets fortes | Pendente ambiente real | Revisar Secrets Manager/SSM/env | Checagem manual/IaC | Sem secrets default/local em ECS ou app build | Sim |
| JWT/refresh | Implementado com gap no refresh mobile PROMPT-005 | Testar login/refresh expiracao | Smoke auth + teste 401 refresh | Refresh usa refresh token correto e nao derruba sessao indevidamente | Sim |
| Ownership guards | Implementado | Testar acesso cruzado | e2e de owner/non-owner | Usuario nao altera recurso de outro | Sim |
| Delete account com senha | Pendente PROMPT-005 | Testar exclusao | Smoke settings | Backend valida senha ou UI nao promete isso | Sim |
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
| Settings criticas | Pendente | Minha conta, senha, delete, privacidade, cidade | Smoke manual | Nada simula persistencia falsa | Sim |

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

Resumo de bloqueadores absolutos antes de deploy publico real:

1. AWS real ponta a ponta: ECS/ECR/RDS/ElastiCache/S3/CloudFront/ALB/ACM/Secrets.
2. Migrations aplicadas no banco alvo.
3. Redis externo validado em producao.
4. SES real validado para verificacao/reset.
5. SNS/APNs/FCM real validado em device.
6. Smoke mobile manual completo.
7. Remocao/correcao dos mocks P0 do PROMPT-006.
8. Build final backend e mobile com env de producao, sem `localhost`.
