export type LegalDocumentKey = 'privacyPolicy' | 'termsOfUse';

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  contactEmail: string;
  sections: LegalSection[];
}

const EFFECTIVE_DATE = '2026-04-22';
const LAST_UPDATED = '2026-04-22';
const DEFAULT_CONTACT_EMAIL = 'support@meuagito.com';
const CONTACT_EMAIL = process.env.SUPPORT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  privacyPolicy: {
    slug: 'privacy-policy',
    title: 'Politica de Privacidade - Meu Agito',
    summary:
      'Esta politica descreve como o Meu Agito coleta, usa, compartilha e protege dados pessoais.',
    version: '1.0.0',
    effectiveDate: EFFECTIVE_DATE,
    lastUpdated: LAST_UPDATED,
    contactEmail: CONTACT_EMAIL,
    sections: [
      {
        title: '1. Escopo e base legal',
        paragraphs: [
          'Esta Politica de Privacidade se aplica ao uso do aplicativo Meu Agito (mobile e web) e dos servicos relacionados.',
          'O tratamento de dados considera a Lei no 13.709/2018 (LGPD), especialmente os principios do art. 6, as bases legais do art. 7, o dever de transparencia do art. 9, as regras de retencao do art. 16 e os direitos do titular previstos no art. 18.',
        ],
      },
      {
        title: '2. Dados que coletamos',
        paragraphs: [
          'Coletamos dados fornecidos por voce e dados gerados durante o uso da plataforma.',
        ],
        bullets: [
          'Cadastro e autenticacao: email, nome, sobrenome, data de nascimento, senha (armazenada em hash), tokens de sessao e status de autenticacao.',
          'Perfil: avatar, bio, localizacao textual, site, tipo de perfil e preferencias da conta.',
          'Uso social: posts, comentarios, curtidas, follows, mensagens de chat, participacao em eventos e avaliacoes.',
          'Localizacao: coordenadas para busca de eventos/estabelecimentos e recursos de geolocalizacao quando voce concede permissao.',
          'Dados tecnicos: datas de acesso, identificadores de sessao, estado de notificacoes e metadados operacionais.',
        ],
      },
      {
        title: '3. Finalidades e bases legais',
        paragraphs: ['Tratamos dados pessoais para as finalidades abaixo.'],
        bullets: [
          'Executar o contrato com o usuario: criar conta, autenticar, exibir feed, chat, eventos e recursos da plataforma (LGPD art. 7, V).',
          'Cumprir obrigacoes legais e regulatorias aplicaveis (LGPD art. 7, II).',
          'Atender interesses legitimos de seguranca, prevencao a fraude, investigacao de abuso e melhoria tecnica do servico, com avaliacao de proporcionalidade (LGPD art. 7, IX).',
          'Registrar consentimento para recursos opcionais, como permissao de localizacao no dispositivo e preferencias nao essenciais (LGPD art. 7, I e art. 8).',
        ],
      },
      {
        title: '4. Compartilhamento de dados',
        paragraphs: [
          'Nao vendemos dados pessoais.',
          'Podemos compartilhar dados com operadores e provedores necessarios para o funcionamento do servico, dentro do minimo necessario.',
        ],
        bullets: [
          'Infraestrutura e operacao local do backend (NestJS, PostgreSQL, Redis).',
          'Amazon SES para envio de emails operacionais.',
          'AWS SNS Mobile Push para notificacoes push, com credenciais de plataforma quando necessarias.',
          'Servicos de plataforma (Apple, Google, Expo) para execucao do app, permissao de recursos e entrega tecnica.',
          'Autoridades publicas ou judiciais, quando houver obrigacao legal.',
        ],
      },
      {
        title: '5. Retencao e exclusao',
        paragraphs: [
          'Mantemos dados pessoais enquanto a conta estiver ativa e pelo periodo necessario para cumprir finalidades legitimas e obrigacoes legais.',
          'No estado atual do backend, o endpoint de exclusao de conta realiza desativacao logica inicial (soft delete). A exclusao definitiva pode depender de processamento adicional e prazos tecnicos.',
          'Dados podem ser retidos por periodo adicional para defesa em processos, auditoria de seguranca, prevencao de fraude e cumprimento regulatorio.',
        ],
      },
      {
        title: '6. Direitos do titular (LGPD art. 18)',
        paragraphs: ['Voce pode solicitar, conforme aplicavel:'],
        bullets: [
          'Confirmacao da existencia de tratamento e acesso aos dados.',
          'Correcao de dados incompletos, inexatos ou desatualizados.',
          'Anonimizacao, bloqueio ou eliminacao de dados tratados em desconformidade.',
          'Portabilidade dos dados, observados segredos comercial e industrial.',
          'Informacoes sobre compartilhamento e sobre possibilidade de nao consentir.',
          'Revogacao de consentimento e pedido de eliminacao nos casos cabiveis.',
        ],
      },
      {
        title: '7. Seguranca da informacao',
        paragraphs: [
          'Adotamos medidas tecnicas e administrativas para proteger dados pessoais contra acesso nao autorizado, destruicao, perda, alteracao, comunicacao ou difusao indevida.',
          'Entre as medidas tecnicas usadas no projeto estao hash de senha, autenticacao por token, validacao de entrada e controles de acesso por rota.',
        ],
      },
      {
        title: '8. Transferencia internacional',
        paragraphs: [
          'Alguns provedores tecnicos podem processar dados fora do Brasil. Nesses casos, adotamos salvaguardas contratuais e operacionais compativeis com a LGPD e com orientacoes da ANPD.',
        ],
      },
      {
        title: '9. Privacidade de criancas e adolescentes',
        paragraphs: [
          'O fluxo de cadastro atual exige maioridade (18+). O servico nao e direcionado para menores de 18 anos.',
        ],
      },
      {
        title: '10. Alteracoes nesta politica',
        paragraphs: [
          'Podemos atualizar esta Politica de Privacidade para refletir evolucoes legais, tecnicas ou de produto.',
          'Mudancas relevantes podem ser comunicadas pelos canais oficiais do aplicativo.',
        ],
      },
      {
        title: '11. Contato do controlador',
        paragraphs: [
          `Solicitacoes relacionadas a privacidade, direitos LGPD e seguranca podem ser enviadas para: ${CONTACT_EMAIL}.`,
          'Quando necessario, poderemos solicitar informacoes adicionais para confirmar a identidade do solicitante.',
        ],
      },
    ],
  },
  termsOfUse: {
    slug: 'terms-of-use',
    title: 'Termos de Uso - Meu Agito',
    summary: 'Estes termos regem o uso do aplicativo Meu Agito e de seus servicos.',
    version: '1.0.0',
    effectiveDate: EFFECTIVE_DATE,
    lastUpdated: LAST_UPDATED,
    contactEmail: CONTACT_EMAIL,
    sections: [
      {
        title: '1. Aceite dos termos',
        paragraphs: [
          'Ao criar conta, acessar ou usar o Meu Agito, voce declara que leu e concorda com estes Termos de Uso e com a Politica de Privacidade.',
          'Se voce nao concordar com estes termos, nao utilize o servico.',
        ],
      },
      {
        title: '2. Elegibilidade',
        paragraphs: [
          'O cadastro e permitido apenas para pessoas com 18 anos ou mais, em coerencia com o fluxo atual de autenticacao do backend.',
        ],
      },
      {
        title: '3. Conta e seguranca',
        paragraphs: [
          'Voce e responsavel pelas credenciais da sua conta e pelo uso feito com elas.',
        ],
        bullets: [
          'Forneca dados verdadeiros e mantenha suas informacoes atualizadas.',
          'Nao compartilhe senha, token ou codigo de verificacao.',
          'Comunique imediatamente uso nao autorizado da conta.',
        ],
      },
      {
        title: '4. Uso permitido e condutas proibidas',
        paragraphs: ['Ao usar o Meu Agito, voce concorda em nao:'],
        bullets: [
          'Publicar conteudo ilicito, ofensivo, discriminatorio, enganoso ou que viole direitos de terceiros.',
          'Praticar spam, engenharia social, fraude ou abuso de funcionalidades.',
          'Tentar acessar areas restritas, explorar vulnerabilidades ou interferir na disponibilidade da plataforma.',
          'Utilizar automacoes para extracao massiva de dados sem autorizacao.',
        ],
      },
      {
        title: '5. Conteudo do usuario',
        paragraphs: [
          'Voce mantem a titularidade do conteudo que publicar.',
          'Ao publicar conteudo no aplicativo, voce concede licenca nao exclusiva para hospedagem, exibicao e processamento tecnico necessario para operacao do servico.',
          'Podemos remover conteudo que viole estes termos, obrigacoes legais ou politicas de seguranca.',
        ],
      },
      {
        title: '6. Funcionalidades, terceiros e disponibilidade',
        paragraphs: [
          'O Meu Agito pode integrar servicos de terceiros para recursos especificos (ex.: push, email, infraestrutura tecnica).',
          'Algumas funcionalidades podem variar por plataforma, versao, regiao ou estado de configuracao do ambiente.',
          'Nao garantimos disponibilidade ininterrupta, embora busquemos operacao estavel e segura.',
        ],
      },
      {
        title: '7. Suspensao, limitacao e encerramento',
        paragraphs: [
          'Podemos limitar, suspender ou encerrar contas que violem estes termos, que apresentem risco de seguranca ou que descumpram obrigacoes legais.',
          'O usuario pode solicitar encerramento da conta pelos fluxos disponiveis no app e canais de suporte.',
        ],
      },
      {
        title: '8. Exclusao de conta e dados',
        paragraphs: [
          'No estado atual do backend, a exclusao de conta inicia com desativacao logica (soft delete) e pode exigir processamento adicional para eliminacao definitiva conforme obrigacoes legais e tecnicas.',
          'Detalhes de tratamento de dados e direitos do titular estao na Politica de Privacidade.',
        ],
      },
      {
        title: '9. Propriedade intelectual',
        paragraphs: [
          'Marca, identidade visual, software e demais elementos do Meu Agito pertencem aos respectivos titulares e sao protegidos pela legislacao aplicavel.',
          'E proibido copiar, distribuir ou explorar economicamente ativos da plataforma sem autorizacao expressa.',
        ],
      },
      {
        title: '10. Limitacao de responsabilidade',
        paragraphs: [
          'Na extensao permitida por lei, o Meu Agito nao responde por danos indiretos, lucros cessantes ou prejuizos decorrentes de indisponibilidade temporaria, falha de terceiro ou uso indevido por usuarios.',
          'Nada nestes termos exclui responsabilidade quando a legislacao consumerista ou de protecao de dados determinar de forma diferente.',
        ],
      },
      {
        title: '11. Lei aplicavel e foro',
        paragraphs: [
          'Estes termos sao regidos pela legislacao brasileira.',
          'Fica eleito o foro da Comarca de Guarulhos/SP, com ressalva de competencia legal obrigatoria em sentido diverso.',
        ],
      },
      {
        title: '12. Contato',
        paragraphs: [`Duvidas, solicitacoes e comunicacoes oficiais: ${CONTACT_EMAIL}.`],
      },
    ],
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSection(section: LegalSection): string {
  const paragraphs = section.paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');

  const bullets = (section.bullets || []).length
    ? `<ul>${section.bullets?.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
    : '';

  return `
    <section>
      <h2>${escapeHtml(section.title)}</h2>
      ${paragraphs}
      ${bullets}
    </section>
  `;
}

export function renderLegalDocumentHtml(document: LegalDocument): string {
  const sections = document.sections.map((section) => renderSection(section)).join('');

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(document.title)}</title>
    <style>
      :root {
        color-scheme: dark;
      }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #0d0d0d;
        color: #f4f4f4;
        line-height: 1.6;
      }
      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 24px 16px 48px;
      }
      header {
        border-bottom: 1px solid #2a2a2a;
        margin-bottom: 24px;
        padding-bottom: 12px;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 1.6rem;
      }
      .meta {
        margin: 0;
        color: #b8b8b8;
        font-size: 0.92rem;
      }
      h2 {
        margin-top: 24px;
        margin-bottom: 8px;
        color: #e8640a;
        font-size: 1.15rem;
      }
      p {
        margin: 8px 0;
      }
      ul {
        margin: 8px 0 8px 22px;
        padding: 0;
      }
      li + li {
        margin-top: 6px;
      }
      footer {
        margin-top: 28px;
        border-top: 1px solid #2a2a2a;
        padding-top: 14px;
        color: #b8b8b8;
        font-size: 0.9rem;
      }
      a {
        color: #ff9f5c;
      }
      .summary {
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(document.title)}</h1>
        <p class="meta">Versao: ${escapeHtml(document.version)} | Vigencia: ${escapeHtml(
          document.effectiveDate
        )} | Atualizado em: ${escapeHtml(document.lastUpdated)}</p>
        <p class="summary">${escapeHtml(document.summary)}</p>
      </header>
      ${sections}
      <footer>
        <p>Contato: <a href="mailto:${escapeHtml(document.contactEmail)}">${escapeHtml(
          document.contactEmail
        )}</a></p>
        <p>Documento publico oficial do projeto Meu Agito (MVP).</p>
      </footer>
    </main>
  </body>
</html>`;
}
