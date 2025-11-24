import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  JwtFromRequestFunction,
} from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const bearerTokenExtractor: JwtFromRequestFunction = (
  req: Request,
): string | null => {
  const authorizationHeader: string | undefined = req.headers?.authorization;
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
    const secretOrKey: string = (
      process.env.JWT_SECRET ?? 'defaultSecret'
    ).toString();
    super({
      jwtFromRequest: bearerTokenExtractor,
      ignoreExpiration: false,
      secretOrKey,
    } satisfies StrategyOptions);
  }

  public validate(payload: JwtPayload): { userId: string; username: string } {
    return { userId: payload.sub, username: payload.username };
  }
}
