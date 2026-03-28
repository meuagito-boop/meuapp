import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

/**
 * Email Service - SendGrid integration for transactional emails
 * 
 * Handles:
 * - Account verification emails
 * - Password reset emails
 * - Notification emails
 * - Marketing emails
 */
@Injectable()
export class EmailService {
  private sgMail: any; // @sendgrid/mail
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@meuagito.com';
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    try {
      // Dynamic import to avoid hard dependency
      const sgMailModule = require('@sendgrid/mail');
      this.sgMail = sgMailModule;
      const apiKey = this.configService.get('SENDGRID_API_KEY');
      if (apiKey) {
        this.sgMail.setApiKey(apiKey);
        console.log('✓ SendGrid email service initialized');
      } else {
        console.warn('⚠ SENDGRID_API_KEY not configured, emails disabled');
      }
    } catch (error) {
      console.warn('SendGrid not available, email service disabled:', error);
    }
  }

  /**
   * Send email using SendGrid
   */
  async send(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (!this.sgMail) {
        return { success: false, error: 'SendGrid not initialized' };
      }

      const message = {
        to: options.to,
        from: options.from || this.fromEmail,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const response = await this.sgMail.send(message);
      const messageId = response[0]?.headers?.['x-message-id'];

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, verificationLink: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verifique seu email</h2>
        <p>Bem-vindo ao Meu Ágito! Para completar seu cadastro, clique no link abaixo:</p>
        <a href="${verificationLink}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verificar Email
        </a>
        <p style="color: #666; margin-top: 20px;">
          Ou copie e cole este link no seu navegador: ${verificationLink}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Se você não criou esta conta, ignore este email.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject: 'Verifique seu email - Meu Ágito',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Redefinir sua senha</h2>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para prosseguir:</p>
        <a href="${resetLink}" style="display: inline-block; background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Redefinir Senha
        </a>
        <p style="color: #666; margin-top: 20px;">
          Este link expira em 24 horas.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Se você não solicitou esta alteração, ignore este email.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject: 'Redefinir sua senha - Meu Ágito',
      html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo ao Meu Ágito, ${name}!</h2>
        <p>Sua conta foi criada com sucesso e você está pronto para começar.</p>
        <p>Aproveite para:</p>
        <ul>
          <li>Completar seu perfil</li>
          <li>Procurar por eventos locais</li>
          <li>Conectar-se com amigos</li>
          <li>Explorar estabelecimentos</li>
        </ul>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Se você tiver dúvidas, entre em contato conosco.
        </p>
      </div>
    `;

    return this.send({
      to: email,
      subject: `Bem-vindo ao Meu Ágito, ${name}!`,
      html,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Você recebe este email porque habilitou notificações por email.
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
