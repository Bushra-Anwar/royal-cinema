import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  @Get()
  @ApiOperation({ summary: 'Get SaaS per-branch pricing plans' })
  getPlans() {
    return {
      plans: [
        { id: 'starter', name: 'Starter', screens: 1, monthlyPrice: 999, yearlyPrice: 9999 },
        { id: 'professional', name: 'Professional', screens: 2, monthlyPrice: 1699, yearlyPrice: 16999 },
        { id: 'enterprise', name: 'Enterprise', screens: 4, monthlyPrice: 2499, yearlyPrice: 24999 }
      ]
    };
  }
}