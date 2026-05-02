import {
  Injectable,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '@common/audit/audit-log.service';
import { AccountType } from '@common/enums/account-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '@common/email/email.service';
import { logStructured } from '@common/logging/structured-log';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @Optional() private readonly auditLogService?: AuditLogService
  ) {}

  async signup(signUpDto: SignUpDto) {
    try {
      const birthDate = this.parseBirthDate(signUpDto.birthDate);

      if (!this.isAtLeast18(birthDate)) {
        throw new BadRequestException('User must be at least 18 years old');
      }

      const firstName = signUpDto.firstName?.trim() || '';
      const lastName = signUpDto.lastName?.trim() || '';

      if (firstName.length < 2) {
        throw new BadRequestException('First name must have at least 2 characters');
      }

      if (lastName.length < 2) {
        throw new BadRequestException('Last name must have at least 2 characters');
      }

      const fullName = (signUpDto.name?.trim() || `${firstName} ${lastName}`).trim();

      // Check if user already exists
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: signUpDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

      // Create user
      const user = await this.prismaService.user.create({
        data: {
          email: signUpDto.email.toLowerCase(),
          name: fullName,
          firstName,
          lastName,
          birthDate,
          password: hashedPassword,
          profileType: signUpDto.profileType || AccountType.USER,
          emailVerified: false,
          twoFactorEnabled: false,
          lastLogin: new Date(),
        },
      });

      // Generate verification token and send email confirmation.
      const verificationToken = await this.generateVerificationToken(user.id, user.email);
      const verificationEmailSent = await this.sendEmailVerification(user.email, verificationToken);

      // Create welcome notification without blocking signup flow.
      try {
        await this.notificationsService.createSystemNotification(
          user.id,
          'Bem-vindo ao Meu Agito',
          'Sua conta foi criada com sucesso. Complete seu perfil para melhorar sua experiencia.'
        );
      } catch (notificationError) {
        logStructured('warn', 'auth.welcome_notification.failed', {
          userId: user.id,
          errorMessage:
            notificationError instanceof Error
              ? notificationError.message
              : String(notificationError),
        });
      }

      // Generate tokens
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        profileType: user.profileType,
      });

      await this.safeAuditLog({
        userId: user.id,
        action: 'auth.signup',
        entity: 'User',
        entityId: user.id,
        changes: {
          profileType: user.profileType,
          emailVerified: user.emailVerified,
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        profileType: user.profileType,
        createdAt: user.createdAt,
        verificationEmailSent,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user by email
      const user = await this.prismaService.user.findUnique({
        where: { email: loginDto.email.toLowerCase() },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // If 2FA is enabled, return temporary token instead
      if (user.twoFactorEnabled) {
        const tempToken = this.jwtService.sign(
          {
            id: user.id,
            sub: user.id,
            email: user.email,
            profileType: user.profileType,
            tokenType: 'temp',
            temp: true,
          } as JwtPayload,
          {
            expiresIn: '5m' as SignOptions['expiresIn'],
            secret: this.configService.get<string>('JWT_SECRET'),
          }
        );

        return {
          requiresTwoFactor: true,
          tempToken,
          userId: user.id,
          message: 'Please provide 2FA code',
        };
      }

      // Update last login
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        profileType: user.profileType,
      });

      await this.safeAuditLog({
        userId: user.id,
        action: 'auth.login',
        entity: 'User',
        entityId: user.id,
        changes: {
          twoFactorEnabled: user.twoFactorEnabled,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileType: user.profileType,
        },
        ...tokens,
        expiresIn: 900, // 15 minutes in seconds
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const payloadUserId = this.resolvePayloadUserId(payload);
      if (!payloadUserId) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      if (payload.temp || payload.type) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (payload.tokenType && payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }

      if (payloadUserId !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token exists in database
      const storedToken = await this.prismaService.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.userId !== userId) {
        throw new UnauthorizedException('Refresh token not found or invalid');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Delete old refresh token
      await this.prismaService.refreshToken.delete({
        where: { id: storedToken.id },
      });

      const refreshedUser = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          profileType: true,
        },
      });

      if (!refreshedUser) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(refreshedUser);

      return {
        ...newTokens,
        expiresIn: 900,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async logout(userId: string) {
    try {
      // Delete all refresh tokens for user
      await this.prismaService.refreshToken.deleteMany({
        where: { userId },
      });

      await this.safeAuditLog({
        userId,
        action: 'auth.logout',
        entity: 'User',
        entityId: userId,
      });

      return { message: 'Logout successful' };
    } catch (error) {
      throw new InternalServerErrorException('Logout failed');
    }
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase();
    const genericResponse = {
      message: 'If user exists, password reset email has been sent',
      email,
    };

    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        // Don't reveal if user exists
        return genericResponse;
      }

      // Generate reset token and send reset email.
      const resetToken = await this.generatePasswordResetToken(user.id, normalizedEmail);
      const resetEmailSent = await this.sendPasswordResetEmail(normalizedEmail, resetToken);
      if (!resetEmailSent) {
        return genericResponse;
      }

      return genericResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to request password reset');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify token
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid token');
      }

      const payloadUserId = this.resolvePayloadUserId(payload);
      if (!payloadUserId) {
        throw new BadRequestException('Invalid token');
      }

      // Check if token is not expired
      const user = await this.prismaService.user.findUnique({
        where: { id: payloadUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Invalidate all refresh tokens
      await this.prismaService.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      await this.safeAuditLog({
        userId: user.id,
        action: 'auth.password_reset',
        entity: 'User',
        entityId: user.id,
      });

      return { message: 'Password successfully reset' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      await this.safeAuditLog({
        userId,
        action: 'auth.password_change',
        entity: 'User',
        entityId: userId,
      });

      return { message: 'Password successfully changed' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'email-verification') {
        throw new BadRequestException('Invalid token');
      }

      const payloadUserId = this.resolvePayloadUserId(payload);
      if (!payloadUserId) {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: payloadUserId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      // Mark email as verified
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      await this.safeAuditLog({
        userId: user.id,
        action: 'auth.email_verified',
        entity: 'User',
        entityId: user.id,
      });

      return { message: 'Email successfully verified' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      // Generate verification token and send confirmation email.
      const verificationToken = await this.generateVerificationToken(user.id, user.email);
      const verificationEmailSent = await this.sendEmailVerification(user.email, verificationToken);
      if (!verificationEmailSent) {
        return {
          message: 'Verification email could not be delivered right now',
          email: user.email,
          verificationEmailSent: false,
        };
      }

      return {
        message: 'Verification email resent',
        email: user.email,
        verificationEmailSent: true,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  async setupTwoFactorAuth(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Meu Agito (${user.email})`,
        issuer: 'Meu Agito',
      });

      // Generate QR code
      if (!secret.otpauth_url) {
        throw new InternalServerErrorException('Failed to generate 2FA QR code payload');
      }
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Persist secret to database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret.base32 },
      });

      await this.safeAuditLog({
        userId,
        action: 'auth.2fa_setup',
        entity: 'User',
        entityId: userId,
      });

      return {
        secret: secret.base32,
        qrCode,
        message: 'Scan QR code with authenticator app',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to setup 2FA');
    }
  }

  async verifyTwoFactorAuth(userId: string, code: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // The secret is generated during setupTwoFactorAuth and persisted before verification.
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token: code,
      });

      if (!verified) {
        throw new BadRequestException('Invalid 2FA code');
      }

      // Enable 2FA
      await this.prismaService.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });

      await this.safeAuditLog({
        userId,
        action: 'auth.2fa_enabled',
        entity: 'User',
        entityId: userId,
      });

      // Generate backup codes
      const backupCodes = this.generateBackupCodes(8);

      return {
        message: '2FA successfully enabled',
        backupCodes,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify 2FA');
    }
  }

  async disableTwoFactorAuth(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Disable 2FA
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      await this.safeAuditLog({
        userId,
        action: 'auth.2fa_disabled',
        entity: 'User',
        entityId: userId,
      });

      return { message: '2FA successfully disabled' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to disable 2FA');
    }
  }

  async verify2FALogin(userId: string, code: string, tempToken: string) {
    try {
      // Verify temp token
      const payload = this.jwtService.verify<JwtPayload>(tempToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const payloadUserId = this.resolvePayloadUserId(payload);
      if (payloadUserId !== userId || !payload.temp) {
        throw new UnauthorizedException('Invalid temp token');
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret || '',
        encoding: 'base32',
        token: code,
      });

      if (!verified) {
        throw new BadRequestException('Invalid 2FA code');
      }

      // Update last login
      await this.prismaService.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        profileType: user.profileType,
      });

      await this.safeAuditLog({
        userId: user.id,
        action: 'auth.login_2fa',
        entity: 'User',
        entityId: user.id,
      });

      return {
        ...tokens,
        expiresIn: 900,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('2FA verification failed');
    }
  }

  private getAppBaseUrl(): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const firstFrontendUrl = frontendUrl
      ?.split(',')
      .map((value) => value.trim())
      .find((value) => value.length > 0);

    if (firstFrontendUrl) {
      return firstFrontendUrl.replace(/\/$/, '');
    }

    return 'http://localhost:8081';
  }

  private async sendEmailVerification(email: string, token: string): Promise<boolean> {
    const appBaseUrl = this.getAppBaseUrl();
    const verificationLink = `${appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const result = await this.emailService.send({
      to: email,
      subject: 'Confirme seu e-mail - Meu Agito',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Confirme seu e-mail</h2>
          <p>Sua conta foi criada. Para concluir, confirme seu e-mail.</p>
          <p><strong>Codigo de validacao:</strong></p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 8px;">${token}</p>
          <p>Voce pode usar o codigo na tela de verificacao do app.</p>
          <p>Se preferir, use este link:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
        </div>
      `,
      text: `Codigo de validacao: ${token}\nLink de verificacao: ${verificationLink}`,
    });

    if (!result.success) {
      logStructured('warn', 'auth.verification_email.failed', {
        emailDomain: email.includes('@') ? email.split('@')[1] : null,
        errorMessage: result.error ?? 'Unknown email delivery error',
      });
      return false;
    }

    return true;
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const appBaseUrl = this.getAppBaseUrl();
    const resetLink = `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const result = await this.emailService.send({
      to: email,
      subject: 'Recuperacao de senha - Meu Agito',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recuperacao de senha</h2>
          <p>Recebemos sua solicitacao de redefinicao de senha.</p>
          <p><strong>Codigo de validacao:</strong></p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 8px;">${token}</p>
          <p>Voce pode usar o codigo na tela de redefinicao de senha do app.</p>
          <p>Se preferir, use este link:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #777;">Esse codigo expira em 1 hora.</p>
        </div>
      `,
      text: `Codigo de validacao: ${token}\nLink para redefinir senha: ${resetLink}\nEsse codigo expira em 1 hora.`,
    });

    if (!result.success) {
      logStructured('warn', 'auth.password_reset_email.failed', {
        emailDomain: email.includes('@') ? email.split('@')[1] : null,
        errorMessage: result.error ?? 'Unknown email delivery error',
      });
      return false;
    }

    return true;
  }

  private async generateTokens(user: { id: string; email: string; profileType: string }) {
    try {
      const basePayload: JwtPayload = {
        id: user.id,
        sub: user.id,
        email: user.email,
        profileType: user.profileType,
      };

      // Generate access token (15 minutes)
      const accessToken = this.jwtService.sign(
        {
          ...basePayload,
          tokenType: 'access',
        },
        {
          expiresIn: this.getJwtExpiresIn('JWT_EXPIRATION', '15m'),
          secret: this.configService.get<string>('JWT_SECRET'),
          jwtid: randomUUID(),
        }
      );

      // Generate refresh token (7 days)
      const refreshToken = this.jwtService.sign(
        {
          ...basePayload,
          tokenType: 'refresh',
        },
        {
          expiresIn: this.getJwtExpiresIn('REFRESH_TOKEN_EXPIRATION', '7d'),
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          jwtid: randomUUID(),
        }
      );

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await this.prismaService.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate tokens');
    }
  }

  private async generateVerificationToken(userId: string, email: string) {
    return this.jwtService.sign(
      { id: userId, sub: userId, email, type: 'email-verification' },
      {
        expiresIn: '24h',
        secret: this.configService.get<string>('JWT_SECRET'),
      }
    );
  }

  private async generatePasswordResetToken(userId: string, email: string) {
    return this.jwtService.sign(
      { id: userId, sub: userId, email, type: 'password-reset' },
      {
        expiresIn: '1h',
        secret: this.configService.get<string>('JWT_SECRET'),
      }
    );
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private isAtLeast18(birthDate: Date): boolean {
    const today = new Date();
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();
    const hasNotHadBirthdayYet =
      monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate());

    if (hasNotHadBirthdayYet) {
      age -= 1;
    }

    return age >= 18;
  }

  private parseBirthDate(rawBirthDate: string): Date {
    if (typeof rawBirthDate !== 'string') {
      throw new BadRequestException('Birth date is invalid');
    }

    const parts = rawBirthDate.split('-');
    if (parts.length !== 3) {
      throw new BadRequestException('Birth date is invalid');
    }

    const [year, month, day] = parts.map((value) => Number.parseInt(value, 10));
    if (!year || !month || !day) {
      throw new BadRequestException('Birth date is invalid');
    }

    const birthDate = new Date(Date.UTC(year, month - 1, day));

    const isInvalidDate =
      Number.isNaN(birthDate.getTime()) ||
      birthDate.getUTCFullYear() !== year ||
      birthDate.getUTCMonth() !== month - 1 ||
      birthDate.getUTCDate() !== day;

    if (isInvalidDate) {
      throw new BadRequestException('Birth date is invalid');
    }

    return birthDate;
  }

  private async safeAuditLog(input: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    changes?: unknown;
  }) {
    await this.auditLogService?.record(input);
  }

  private getJwtExpiresIn(key: string, fallback: string): SignOptions['expiresIn'] {
    return this.configService.get<string>(key, fallback) as SignOptions['expiresIn'];
  }

  private resolvePayloadUserId(payload: JwtPayload): string | null {
    return payload.sub ?? payload.id ?? null;
  }
}
