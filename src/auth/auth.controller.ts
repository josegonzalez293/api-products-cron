import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiExtraModels } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos/login.dto';

@ApiTags('auth')
@ApiExtraModels(LoginDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @ApiQuery({
    name: 'credentials',
    type: LoginDto,
    style: 'form',
    explode: true,
  })
  async login(@Query() dto: LoginDto) {
    return this.authService.signIn(dto?.username, dto?.password);
  }
}
