import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { LoginDto } from '../src/dtos/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const mockService: jest.Mocked<Pick<AuthService, 'signIn'>> = {
    signIn: jest.fn().mockResolvedValue({ accessToken: 'token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call authService.signIn and return token', async () => {
    const dto: LoginDto = { username: 'user', password: 'pass' };
    await expect(controller.login(dto)).resolves.toEqual({
      accessToken: 'token',
    });
    expect(mockService.signIn).toHaveBeenCalledWith('user', 'pass');
  });
});
