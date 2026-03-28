import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    try {
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
          name: signUpDto.name,
          password: hashedPassword,
          profileType: signUpDto.profileType || 'PESSOA_FISICA',
          emailVerified: false,
          twoFactorEnabled: false,
          lastLogin: new Date(),
        },
      });

      // Generate verification token
      const verificationToken = await this.generateVerificationToken(
        user.id,
        user.email,
      );

      // Send verification email (will implement in notifications service)
      // await this.notificationService.sendVerificationEmail(user.email, verificationToken);

      // Generate tokens
      const tokens = await this.generateTokens(user.id);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        profileType: user.profileType,
        createdAt: user.createdAt,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
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
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // If 2FA is enabled, return temporary token instead
      if (user.twoFactorEnabled) {
        const tempToken = this.jwtService.sign(
          { id: user.id, temp: true } as JwtPayload,
          {
            expiresIn: '5m',
            secret: this.configService.get<string>('JWT_SECRET'),
          },
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
      const tokens = await this.generateTokens(user.id);

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
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      if (payload.id !== userId) {
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

      // Generate new tokens
      const newTokens = await this.generateTokens(userId);

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

      return { message: 'Logout successful' };
    } catch (error) {
      throw new InternalServerErrorException('Logout failed');
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if user exists
        return {
          message: 'If user exists, password reset email has been sent',
          email,
        };
      }

      // Generate reset token
      const resetToken = await this.generatePasswordResetToken(user.id, email);

      // Send reset email (will implement in notifications service)
      // await this.notificationService.sendPasswordResetEmail(email, resetToken);

      return {
        message: 'Password reset email sent',
        email,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to request password reset');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid token');
      }

      // Check if token is not expired
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
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

      return { message: 'Password successfully reset' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

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

      return { message: 'Password successfully changed' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'email-verification') {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
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

      // Generate verification token
      const verificationToken = await this.generateVerificationToken(
        user.id,
        user.email,
      );

      // Send verification email (will implement in notifications service)
      // await this.notificationService.sendVerificationEmail(user.email, verificationToken);

      return {
        message: 'Verification email resent',
        email: user.email,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
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
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Persist secret to database
      await this.prismaService.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret.base32 },
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

      // This is simplified - in production, you'd store the secret first
      // For now, using a placeholder
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
      const payload = this.jwtService.verify(tempToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.id !== userId || !payload.temp) {
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
      const tokens = await this.generateTokens(userId);

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

  private async generateTokens(userId: string) {
    try {
      const payload: JwtPayload = { id: userId };

      // Generate access token (15 minutes)
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Generate refresh token (7 days)
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>(
          'REFRESH_TOKEN_EXPIRATION',
          '7d',
        ),
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await this.prismaService.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
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
      { id: userId, email, type: 'email-verification' },
      {
        expiresIn: '24h',
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );
  }

  private async generatePasswordResetToken(userId: string, email: string) {
    return this.jwtService.sign(
      { id: userId, email, type: 'password-reset' },
      {
        expiresIn: '1h',
        secret: this.configService.get<string>('JWT_SECRET'),
      },
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
}
