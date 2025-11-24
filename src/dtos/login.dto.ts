import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password', example: 'strongPassword123' })
  @IsString()
  password: string;
}
