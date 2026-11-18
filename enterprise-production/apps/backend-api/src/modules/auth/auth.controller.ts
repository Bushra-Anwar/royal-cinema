import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unified Role-Based Authentication',
    description: 'Authenticates Super Admin, Cinema Admins, or Counter Staff and issues a signed JWT token.',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful. Returns JWT token and role routing.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.authenticate(loginDto);
  }
}
