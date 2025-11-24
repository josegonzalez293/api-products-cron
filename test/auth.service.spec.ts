import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigGetOptions } from '@nestjs/config';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtSignSpy: jest.Mock;
  let jwtServiceMock: jest.Mocked<Pick<JwtService, 'sign'>>;
  let configServiceMock: Pick<ConfigService<Record<string, string>>, 'get'>;

  const ADMIN_USERNAME = 'adminUser';
  const ADMIN_PASSWORD = 'adminPass';
  const SIGNED_TOKEN = 'signedToken';

  beforeEach(() => {
    jwtSignSpy = jest.fn().mockReturnValue(SIGNED_TOKEN);
    jwtServiceMock = {
      sign: jwtSignSpy,
    };

    const configValues: Record<string, string> = {
      API_USERNAME: ADMIN_USERNAME,
      API_PASSWORD: ADMIN_PASSWORD,
      JWT_EXPIRES_IN: '3600',
    };

    configServiceMock = {
      get<T = string>(
        key: string,
        defaultValue?: T,
        options?: ConfigGetOptions,
      ): T {
        void options;
        const value = configValues[key];
        if (value !== undefined) {
          return value as T;
        }
        return defaultValue as T;
      },
    };

    authService = new AuthService(
      jwtServiceMock as unknown as JwtService,
      configServiceMock as unknown as ConfigService,
    );
  });

  describe('signIn', () => {
    it('should return access token for valid credentials', () => {
      const result = authService.signIn(ADMIN_USERNAME, ADMIN_PASSWORD);
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      expect(result).toEqual({
        accessToken: SIGNED_TOKEN,
        expiresIn: 3600,
        expiresAt,
      });
      expect(jwtSignSpy).toHaveBeenCalledWith(
        { sub: ADMIN_USERNAME, username: ADMIN_USERNAME },
        { expiresIn: 3600 },
      );
    });

    it('should throw UnauthorizedException for invalid credentials', () => {
      expect(() => authService.signIn('wrongUser', 'wrongPass')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
