import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CognitoAuthGuard } from '../../common/guards/cognito-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('Tenants (Cinema Clients)')
@ApiBearerAuth('JWT-Auth')
@Controller('tenants')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('onboard')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Onboard New Cinema Client / Shop (Super Admin only)',
    description: 'Generates a separate cinema client instance with dedicated Admin credentials and subscription ledger.',
  })
  @ApiResponse({ status: 201, description: 'Cinema client created successfully.' })
  async onboardTenant(@Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List All Onboarded Cinema Clients' })
  async listTenants() {
    return this.tenantsService.getAllTenants();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CINEMA_ADMIN)
  @ApiOperation({ summary: 'Get Cinema Client Details & Subscription Status' })
  async getTenant(@Param('id') id: string) {
    return this.tenantsService.getTenantById(id);
  }
}
