import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { SignUpDto } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { RequestPasswordResetDto } from './dtos/request-password-reset.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'John Doe',
        profileType: 'PESSOA_FISICA',
        createdAt: '2024-01-01T00:00:00Z',
        accessToken: 'jwt_token',
        refreshToken: 'refresh_token',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signup(@Body() signUpDto: SignUpDto) {
    if (signUpDto.password !== signUpDto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.authService.signup(signUpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          profileType: 'PESSOA_FISICA',
        },
        accessToken: 'jwt_token',
        refreshToken: 'refresh_token',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBearerAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'new_jwt_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Request() req) {
    return this.authService.refreshTokens(
      req.user.id,
      req.user.refreshToken,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logout successful' };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent',
    schema: {
      example: {
        message: 'Password reset email sent',
        email: 'user@example.com',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authService.requestPasswordReset(
      requestPasswordResetDto.email,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: { example: { message: 'Password successfully reset' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    if (resetPasswordDto.password !== resetPasswordDto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: { example: { message: 'Password successfully changed' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    if (changePasswordDto.newPassword !== changePasswordDto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: { example: { message: 'Email successfully verified' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent',
    schema: {
      example: {
        message: 'Verification email resent',
        email: 'user@example.com',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendVerificationEmail(
    @Body() body: { email: string },
  ) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('enable-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({
    status: 200,
    description: '2FA enabled',
    schema: {
      example: {
        secret: 'ABCD1234EFGH5678',
        qrCode: 'data:image/png;base64,...',
        message: 'Scan QR code with authenticator app',
      },
    },
  })
  async enable2FA(@Request() req) {
    return this.authService.setupTwoFactorAuth(req.user.id);
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA verified and enabled',
    schema: {
      example: {
        message: '2FA successfully enabled',
        backupCodes: ['CODE1', 'CODE2', 'CODE3'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async verify2FA(
    @Request() req,
    @Body() body: { code: string },
  ) {
    return this.authService.verifyTwoFactorAuth(req.user.id, body.code);
  }

  @Post('disable-2fa')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({
    status: 200,
    description: '2FA disabled',
    schema: {
      example: {
        message: '2FA successfully disabled',
      },
    },
  })
  async disable2FA(@Request() req) {
    return this.authService.disableTwoFactorAuth(req.user.id);
  }

  @Post('verify-2fa-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code during login' })
  @ApiResponse({
    status: 200,
    description: '2FA verified',
    schema: {
      example: {
        accessToken: 'jwt_token',
        refreshToken: 'refresh_token',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async verify2FALogin(
    @Body() body: { userId: string; code: string; tempToken: string },
  ) {
    return this.authService.verify2FALogin(body.userId, body.code, body.tempToken);
  }
}
