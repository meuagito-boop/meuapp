import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { logStructured } from '@common/logging/structured-log';
import { instrumentAwsSdkClient } from '@common/observability/observability.bootstrap';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

type EmailProvider = 'none' | 'ses';

/**
 * Email Service - transactional email delivery via Amazon SES.
 */
@Injectable()
export class EmailService {
  private provider: EmailProvider;
  private sesClient: SESv2Client | null = null;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.resolveProvider();
    this.fromEmail = this.resolveFromEmail();
    this.initializeProvider();
  }

  private resolveProvider(): EmailProvider {
    const configuredProvider = (this.configService.get<string>('EMAIL_PROVIDER') || 'none')
      .trim()
      .toLowerCase();

    return configuredProvider === 'ses' ? 'ses' : 'none';
  }

  private resolveFromEmail(): string {
    return this.configService.get('AWS_SES_FROM_EMAIL') || 'noreply@meuagito.com';
  }

  private initializeProvider() {
    if (this.provider !== 'ses') {
      logStructured('info', 'email.provider.disabled', {
        provider: 'none',
      });
      return;
    }

    this.initializeSes();
  }

  private initializeSes() {
    const region = this.configService.get<string>('AWS_SES_REGION');
    if (!region) {
      logStructured('info', 'email.ses.disabled', {
        reason: 'AWS_SES_REGION missing',
      });
      return;
    }

    try {
      this.sesClient = instrumentAwsSdkClient(new SESv2Client({ region }));
      logStructured('info', 'email.ses.initialized', {
        region,
      });
    } catch (error) {
      logStructured('warn', 'email.ses.initialization_failed', {
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async send(options: EmailOptions): Promise<EmailResponse> {
    if (this.provider !== 'ses') {
      return { success: false, error: 'Email provider not configured' };
    }

    return this.sendWithSes(options);
  }

  private async sendWithSes(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (!this.sesClient) {
        return { success: false, error: 'SES not initialized' };
      }

      const body: {
        Html?: { Data: string };
        Text?: { Data: string };
      } = {};

      if (options.html) {
        body.Html = { Data: options.html };
      }

      if (options.text) {
        body.Text = { Data: options.text };
      }

      if (!body.Html && !body.Text) {
        body.Text = { Data: '' };
      }

      const response = await this.sesClient.send(
        new SendEmailCommand({
          FromEmailAddress: options.from || this.fromEmail,
          Destination: {
            ToAddresses: [options.to],
          },
          Content: {
            Simple: {
              Subject: {
                Data: options.subject,
              },
              Body: body,
            },
          },
        })
      );

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStructured('error', 'email.send.failed', {
        provider: 'ses',
        errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verifique seu email</h2>
        <p>Bem-vindo ao Meu Agito! Para completar seu cadastro, clique no link abaixo:</p>
        <a href="${verificationLink}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verificar Email
        </a>
        <p style="color: #666; margin-top: 20px;">
          Ou copie e cole este link no seu navegador: ${verificationLink}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Se voce nao criou esta conta, ignore este email.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject: 'Verifique seu email - Meu Agito',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Redefinir sua senha</h2>
        <p>Recebemos uma solicitacao para redefinir sua senha. Clique no link abaixo para prosseguir:</p>
        <a href="${resetLink}" style="display: inline-block; background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Redefinir Senha
        </a>
        <p style="color: #666; margin-top: 20px;">
          Este link expira em 24 horas.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Se voce nao solicitou esta alteracao, ignore este email.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject: 'Redefinir sua senha - Meu Agito',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo ao Meu Agito, ${name}!</h2>
        <p>Sua conta foi criada com sucesso e voce esta pronto para comecar.</p>
        <p>Aproveite para:</p>
        <ul>
          <li>Completar seu perfil</li>
          <li>Procurar por eventos locais</li>
          <li>Conectar-se com amigos</li>
          <li>Explorar estabelecimentos</li>
        </ul>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Se voce tiver duvidas, entre em contato conosco.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject: `Bem-vindo ao Meu Agito, ${name}!`,
      html,
    });
  }

  async sendNotificationEmail(
    email: string,
    subject: string,
    message: string
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Voce recebe este email porque habilitou notificacoes por email.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject,
      html,
    });
  }
}
