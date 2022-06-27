import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user.service';
import { Request } from 'express';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

function cookieExtractor(req: Request) {
  return req?.headers?.['Authentication'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    const user = await this.authService.validateJwtUser(payload);

    if (!user) {
      throw new UnauthorizedException(
        'JWT token invalid or no user matches it',
      );
    }

    return user;
  }
}
