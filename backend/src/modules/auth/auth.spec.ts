import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '@common/email/email.service';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, ProfileType } from './dtos/sign-up.dto';
import { LoginDto } from './dtos/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let emailService: EmailService;

  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    birthDate: new Date('1990-01-01'),
    password: 'hashedPassword123',
    profileType: ProfileType.USER,
    emailVerified: false,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret',
                REFRESH_TOKEN_SECRET: 'test-refresh-secret',
                JWT_EXPIRATION: '15m',
                REFRESH_TOKEN_EXPIRATION: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createSystemNotification: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-id' }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signUpDto: SignUpDto = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        birthDate: '1990-01-01',
        password: 'SecurePassword123!',
        passwordConfirm: 'SecurePassword123!',
        profileType: ProfileType.USER,
        termsAccepted: true,
        privacyPolicyAccepted: true,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        ...mockUser,
        email: signUpDto.email,
        name: 'New User',
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        birthDate: new Date(signUpDto.birthDate),
      });

      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({
        id: 'token-id',
        token: 'test-token',
        userId: 'test-id',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.signup(signUpDto);

      expect(result).toEqual(
        expect.objectContaining({
          email: signUpDto.email,
          name: 'New User',
          verificationEmailSent: true,
          accessToken: 'test-token',
          refreshToken: 'test-token',
        })
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email.toLowerCase() },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            termsAcceptedAt: expect.any(Date),
            termsVersion: '1.0.0',
            privacyPolicyAcceptedAt: expect.any(Date),
            privacyPolicyVersion: '1.0.0',
          }),
        })
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const signUpDto: SignUpDto = {
        email: 'existing@example.com',
        firstName: 'New',
        lastName: 'User',
        birthDate: '1990-01-01',
        password: 'SecurePassword123!',
        passwordConfirm: 'SecurePassword123!',
        termsAccepted: true,
        privacyPolicyAccepted: true,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.signup(signUpDto)).rejects.toThrow(ConflictException);
    });

    it('should reject signup without legal consent', async () => {
      const signUpDto: SignUpDto = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        birthDate: '1990-01-01',
        password: 'SecurePassword123!',
        passwordConfirm: 'SecurePassword123!',
        termsAccepted: false,
        privacyPolicyAccepted: true,
      };

      await expect(service.signup(signUpDto)).rejects.toThrow(BadRequestException);
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash(loginDto.password, 10),
        twoFactorEnabled: false,
      });

      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({
        id: 'token-id',
        token: 'test-token',
        userId: 'test-id',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toEqual(
        expect.objectContaining({
          user: expect.any(Object),
          accessToken: 'test-token',
          refreshToken: 'test-token',
        })
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete all refresh tokens for user', async () => {
      jest.spyOn(prismaService.refreshToken, 'deleteMany').mockResolvedValue({
        count: 1,
      });

      const result = await service.logout('test-id');

      expect(result.message).toBe('Logout successful');
      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'test-id' },
      });
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';

      jest.spyOn(jwtService, 'verify').mockReturnValue({
        id: 'test-id',
      });

      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValue({
        id: 'token-id',
        token: refreshToken,
        userId: 'test-id',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      jest.spyOn(prismaService.refreshToken, 'delete').mockResolvedValue({
        id: 'token-id',
        token: refreshToken,
        userId: 'test-id',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      jest.spyOn(jwtService, 'sign').mockReturnValue('new-token');
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        ...mockUser,
      });
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({
        id: 'new-token-id',
        token: 'new-token',
        userId: 'test-id',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.refreshTokens('test-id', refreshToken);

      expect(result).toEqual(
        expect.objectContaining({
          accessToken: 'new-token',
          refreshToken: 'new-token',
          expiresIn: 900,
        })
      );
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('test-id', 'invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('email flows', () => {
    it('should keep password reset response generic when email delivery fails', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('reset-token');
      jest.spyOn(emailService, 'send').mockResolvedValue({
        success: false,
        error: 'SES sandbox rejection',
      });

      const result = await service.requestPasswordReset('test@example.com');

      expect(result).toEqual({
        message: 'If user exists, password reset email has been sent',
        email: 'test@example.com',
      });
    });

    it('should expose verificationEmailSent=false when resend delivery fails', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('verification-token');
      jest.spyOn(emailService, 'send').mockResolvedValue({
        success: false,
        error: 'SES sandbox rejection',
      });

      const result = await service.resendVerificationEmail('test@example.com');

      expect(result).toEqual({
        message: 'Verification email could not be delivered right now',
        email: 'test@example.com',
        verificationEmailSent: false,
      });
    });
  });
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should call authService.signup with correct data', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
        password: 'SecurePassword123!',
        passwordConfirm: 'SecurePassword123!',
        termsAccepted: true,
        privacyPolicyAccepted: true,
      };

      jest.spyOn(authService, 'signup').mockResolvedValue({
        id: 'test-id',
        email: signUpDto.email,
        name: 'Test User',
        accessToken: 'token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.signup(signUpDto);

      expect(result).toEqual(expect.any(Object));
      expect(authService.signup).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: {
          id: 'test-id',
          email: loginDto.email,
          name: 'Test User',
        },
        accessToken: 'token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });

      const result = await controller.login(loginDto);

      expect(result).toEqual(expect.any(Object));
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user id', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue({
        message: 'Logout successful',
      });

      const result = await controller.logout('test-id');

      expect(result.message).toBe('Logout successful');
      expect(authService.logout).toHaveBeenCalledWith('test-id');
    });
  });
});
