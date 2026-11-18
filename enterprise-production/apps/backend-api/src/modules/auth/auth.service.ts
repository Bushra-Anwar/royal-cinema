import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { UserRole } from '../../common/enums/role.enum';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async authenticate(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const password = dto.password.trim();

    // 1. Super Admin Check (.env Master Account)
    const superAdminUser = (this.configService.get<string>('SUPER_ADMIN_USERNAME') || 'superadmin').toLowerCase();
    const superAdminEmail = (this.configService.get<string>('SUPER_ADMIN_EMAIL') || 'superadmin@royalcinema.in').toLowerCase();
    const superAdminPass = this.configService.get<string>('SUPER_ADMIN_PASSWORD') || 'Royal@SuperEnterprise2026!';

    if ((identifier === superAdminUser || identifier === superAdminEmail) && password === superAdminPass) {
      const payload = {
        sub: 'superadmin-master-id',
        username: superAdminUser,
        email: superAdminEmail,
        role: UserRole.SUPER_ADMIN,
        tenantId: null,
      };

      return {
        ok: true,
        accessToken: this.jwtService.sign(payload),
        role: UserRole.SUPER_ADMIN,
        user: {
          name: 'Super Admin Master',
          username: superAdminUser,
          email: superAdminEmail,
          role: UserRole.SUPER_ADMIN,
        },
        redirectPath: '/superadmin',
      };
    }

    // 2. Cinema Admin Tenant Check
    const tenant = await this.tenantModel.findOne({
      $or: [{ adminUsername: identifier }, { adminEmail: identifier }],
    });

    if (tenant) {
      const isMatch = await bcrypt.compare(password, tenant.passwordHash);
      if (isMatch) {
        if (tenant.status !== 'active') {
          throw new UnauthorizedException('This cinema client account is currently suspended.');
        }

        const payload = {
          sub: tenant._id.toString(),
          username: tenant.adminUsername,
          email: tenant.adminEmail,
          role: UserRole.CINEMA_ADMIN,
          tenantId: tenant._id.toString(),
          companyName: tenant.name,
        };

        return {
          ok: true,
          accessToken: this.jwtService.sign(payload),
          role: UserRole.CINEMA_ADMIN,
          user: {
            name: tenant.name + ' Admin',
            username: tenant.adminUsername,
            email: tenant.adminEmail,
            role: UserRole.CINEMA_ADMIN,
            tenantId: tenant._id.toString(),
            companyName: tenant.name,
            subscription: tenant.subscription,
          },
          redirectPath: '/admin',
        };
      }
    }

    // 3. Counter Staff User Check (Box Office Staff or Food Staff)
    const user = await this.userModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).populate('tenantId');

    if (user) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (isMatch) {
        if (user.status !== 'active') {
          throw new UnauthorizedException('Your staff counter account is currently suspended.');
        }

        const tenantDoc = user.tenantId as unknown as TenantDocument;
        const payload = {
          sub: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          counterStation: user.counterStation,
          tenantId: tenantDoc ? tenantDoc._id.toString() : null,
          companyName: tenantDoc ? tenantDoc.name : 'Royal Cinema',
        };

        const redirectPath =
          user.role === UserRole.TICKET_STAFF ? '/pos/ticketing' :
          user.role === UserRole.FOOD_STAFF ? '/pos/food' : '/booking';

        return {
          ok: true,
          accessToken: this.jwtService.sign(payload),
          role: user.role,
          user: {
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            station: user.counterStation,
            tenantId: tenantDoc ? tenantDoc._id.toString() : null,
            companyName: tenantDoc ? tenantDoc.name : 'Royal Cinema',
          },
          redirectPath,
        };
      }
    }

    throw new UnauthorizedException('Invalid username, email, or password.');
  }
}
