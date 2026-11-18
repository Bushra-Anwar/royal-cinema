import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    const existing = await this.tenantModel.findOne({
      $or: [
        { adminUsername: dto.adminUsername.toLowerCase() },
        { adminEmail: dto.adminEmail.toLowerCase() },
      ],
    });

    if (existing) {
      throw new ConflictException('A cinema client with this admin username or email already exists.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.adminPassword, saltRounds);
    const tenantCode = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20) + '-' + Math.floor(100 + Math.random() * 900);

    const newTenant = new this.tenantModel({
      tenantCode,
      name: dto.name,
      type: dto.type || 'cinema',
      adminUsername: dto.adminUsername.toLowerCase(),
      adminEmail: dto.adminEmail.toLowerCase(),
      passwordHash,
      subscription: {
        planName: 'Enterprise Cinema ERP & POS Cloud Service',
        amountPaid: dto.amountPaid,
        paidDate: dto.paidDate,
        validTill: dto.validTill,
        nextDueDate: dto.validTill,
        billingCycle: dto.billingCycle || 'Yearly / Annual',
        paymentMethod: dto.paymentMethod || 'UPI / Bank Transfer',
        status: 'Active',
      },
      status: 'active',
    });

    await newTenant.save();
    return {
      ok: true,
      message: `Cinema client '${newTenant.name}' onboarded successfully.`,
      tenant: {
        id: newTenant._id,
        tenantCode: newTenant.tenantCode,
        name: newTenant.name,
        adminUsername: newTenant.adminUsername,
        adminEmail: newTenant.adminEmail,
        subscription: newTenant.subscription,
      },
    };
  }

  async getAllTenants() {
    return this.tenantModel.find().select('-passwordHash').exec();
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantModel.findById(id).select('-passwordHash').exec();
    if (!tenant) throw new NotFoundException('Cinema client not found');
    return tenant;
  }
}
