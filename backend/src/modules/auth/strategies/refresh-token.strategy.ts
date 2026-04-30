import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: any, payload: JwtPayload): AuthenticatedUser {
    const authorizationHeader: string | undefined = req.get('authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub ?? payload.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    if (payload.temp || payload.type) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType && payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const refreshToken = authorizationHeader.slice('Bearer '.length);
    return {
      id: userId,
      email: payload.email ?? null,
      profileType: payload.profileType ?? null,
      tokenType: 'refresh',
      refreshToken,
    };
  }
}
