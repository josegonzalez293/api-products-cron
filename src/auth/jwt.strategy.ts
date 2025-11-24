import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type {
  Request,
  StrategyOptions,
  JwtFromRequestFunction,
} from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const bearerTokenExtractor: JwtFromRequestFunction = (
  req: Request,
): string | null => {
  const authorizationHeader = req.headers?.authorization;
  if (!authorizationHeader) {
    return null;
  }
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: bearerTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    };
    super(options);
  }

  public validate(payload: JwtPayload) {
    return { userId: payload.sub, username: payload.username };
  }
}
