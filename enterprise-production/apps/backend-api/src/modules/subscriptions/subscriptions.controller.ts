import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  @Get()
  @ApiOperation({ summary: 'List branch-level subscriptions' })
  listSubscriptions() {
    return { ok: true, subscriptions: [] };
  }

  @Post(':branchId/renew')
  @ApiOperation({ summary: 'Renew branch subscription' })
  renewSubscription(@Param('branchId') branchId: string, @Body() body: any) {
    return { ok: true, branchId, renewed: true };
  }
}