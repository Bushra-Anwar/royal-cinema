import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Bearer token format');
    }

    try {
      // In production: verifies signature against AWS Cognito JWKS URL or internal JWT secret
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'royal-cinema-secret-key-2026',
      });

      request.user = {
        id: payload.sub || payload.id,
        username: payload.username || payload['cognito:username'],
        email: payload.email,
        role: payload.role || payload['custom:role'],
        tenantId: payload.tenantId || payload['custom:tenantId'],
        companyName: payload.companyName,
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
