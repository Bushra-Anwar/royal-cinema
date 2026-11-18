import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'royal-cinema-secret-key-2026',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CognitoAuthGuard, RolesGuard],
  exports: [AuthService, JwtModule, CognitoAuthGuard, RolesGuard],
})
export class AuthModule {}
