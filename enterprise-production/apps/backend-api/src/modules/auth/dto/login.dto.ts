import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@royalcinema.in',
    description: 'Username or Gmail address of Super Admin, Cinema Owner, or Counter Staff',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    example: 'Admin@12345',
    description: 'Password associated with the user account',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
