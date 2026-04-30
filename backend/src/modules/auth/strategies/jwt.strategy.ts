import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    const userId = payload.sub ?? payload.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    if (payload.temp || payload.type) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.tokenType && payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid access token type');
    }

    return {
      id: userId,
      email: payload.email ?? null,
      profileType: payload.profileType ?? null,
      tokenType: 'access',
    };
  }
}
