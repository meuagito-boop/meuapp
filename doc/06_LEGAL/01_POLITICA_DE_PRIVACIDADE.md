# Politica de Privacidade - Meu Agito

Versao: 1.0.0  
Vigencia: 2026-04-23  
Ultima atualizacao: 2026-04-23

## 1. Escopo

Esta Politica de Privacidade descreve como o Meu Agito trata dados pessoais no app (mobile/web) e nos servicos associados.

## 2. Base legal aplicada

Esta politica foi redigida com base na Lei no 13.709/2018 (LGPD), com foco em:

- Art. 6 (principios de finalidade, necessidade, transparencia, seguranca e responsabilizacao);
- Art. 7 (bases legais do tratamento);
- Art. 9 (informacoes claras ao titular);
- Art. 16 (hipoteses de retencao);
- Art. 18 (direitos do titular).

## 3. Dados tratados

No estado atual do codigo, os principais dados sao:

- Cadastro e autenticacao: email, nome/sobrenome, data de nascimento, senha (hash), tokens de sessao;
- Perfil: avatar, bio, localizacao textual, website, tipo de perfil, preferencias de conta;
- Interacao social: posts, comentarios, curtidas, follows, mensagens, participacao em eventos, avaliacoes;
- Localizacao: latitude/longitude quando o usuario concede permissao;
- Dados tecnicos: registros de sessao, timestamps de login, estado de notificacoes.

## 4. Finalidades do tratamento

Tratamos dados para:

- executar funcionalidades essenciais do app (cadastro, login, feed, chat, busca, eventos);
- proteger a plataforma contra abuso, fraude e acessos indevidos;
- cumprir obrigacoes legais e regulatorias;
- operacionalizar notificacoes e comunicacoes transacionais.

## 5. Bases legais por grupo de finalidade

- Execucao de contrato/procedimentos preliminares (LGPD art. 7, V): operacao da conta e das funcionalidades;
- Cumprimento de obrigacao legal/regulatoria (LGPD art. 7, II): retencao e atendimento a autoridades competentes;
- Interesse legitimo (LGPD art. 7, IX): seguranca, monitoracao tecnica e prevencao de abuso;
- Consentimento (LGPD art. 7, I e art. 8): permissoes opcionais do dispositivo (ex.: localizacao em foreground).

## 6. Compartilhamento de dados

Nao vendemos dados pessoais.

Podemos compartilhar dados com operadores/fornecedores estritamente necessarios para operacao:

- infraestrutura tecnica (backend local, banco e cache);
- Amazon SES (emails transacionais), quando configurado;
- AWS SNS Mobile Push (push), com credenciais de plataforma quando configurado;
- provedores de plataforma (Apple/Google/Expo) para recursos tecnicos do app.

Tambem pode haver compartilhamento quando exigido por lei, ordem judicial ou autoridade competente.

## 7. Retencao, exclusao e estado atual do projeto

Dados pessoais sao mantidos enquanto a conta estiver ativa e pelo prazo necessario para finalidades legitimas, seguranca e obrigacoes legais.

Estado tecnico atual:

- o endpoint de exclusao de conta inicia por desativacao logica (soft delete);
- a eliminacao definitiva pode depender de processamento adicional.

## 8. Direitos do titular (LGPD art. 18)

O titular pode solicitar, conforme aplicavel:

- confirmacao de tratamento e acesso aos dados;
- correcao de dados incompletos/inexatos;
- anonimizacao, bloqueio ou eliminacao nos casos previstos;
- portabilidade;
- informacoes sobre compartilhamento;
- revogacao de consentimento.

## 9. Seguranca

Adotamos medidas tecnicas e administrativas proporcionais ao estagio do projeto, incluindo:

- hash de senha;
- autenticacao por token e refresh token;
- validacao de entrada;
- controles de autorizacao por rota.

## 10. Transferencia internacional

Quando houver uso de provedores com infraestrutura fora do Brasil, o tratamento seguira salvaguardas compativeis com a LGPD.

## 11. Menores de idade

No fluxo atual de cadastro, o app exige maioridade (18+). O servico nao e direcionado para menores de 18 anos.

## 12. Alteracoes desta politica

Podemos atualizar esta politica para refletir evolucao legal, tecnica e de produto. Mudancas relevantes poderao ser comunicadas no app e/ou canais oficiais.

## 13. Contato

Canal para solicitacoes LGPD e privacidade:

- `support@meuagito.com`

## 14. Versao publica no backend

Esta politica tambem esta disponivel em:

- `GET /legal/privacy-policy`
- `GET /legal/privacy-policy.json`
