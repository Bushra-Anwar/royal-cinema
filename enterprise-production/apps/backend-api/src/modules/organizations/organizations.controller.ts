import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  @Get('me')
  @ApiOperation({ summary: 'Get current tenant organization profile' })
  getMyOrganization() {
    return { ok: true, organizationId: 'org_royal_cinema_001', name: 'Royal Cinema Group' };
  }
}