import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthToken } from './interfaces/auth-token.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly adminU: string;
  private readonly adminP: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.adminU = this.configService.get<string>('API_USERNAME', 'admin');
    this.adminP = this.configService.get<string>('API_PASSWORD', 'password');
  }
  private readonly expiresIn: number = process.env.JWT_EXPIRES_IN
    ? parseInt(process.env.JWT_EXPIRES_IN, 10)
    : 3600;

  private validateUser(username: string, password: string): JwtPayload {
    if (username === this.adminU && password === this.adminP) {
      return { sub: username, username }; // if there's a collection of users we can pass _id instead of username as sub
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  private login(username: string): AuthToken {
    const payload: JwtPayload = { sub: username, username };
    const token = this.jwtService.sign(payload, { expiresIn: this.expiresIn });
    const expiresAt = Math.floor(Date.now() / 1000) + this.expiresIn;
    return { accessToken: token, expiresIn: this.expiresIn, expiresAt };
  }

  signIn(username: string, password: string): AuthToken {
    const user = this.validateUser(username, password);
    return this.login(user.username);
  }

  public verifyToken(token?: string): JwtPayload {
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    const parts = token.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Bearer token required');
    }
    const tokenValue = parts[1];

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured on server');
      }
      const payload: JwtPayload = this.jwtService.verify(tokenValue, {
        secret,
      });
      return payload;
    } catch (err) {
      this.logger.error('Token verification failed', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
