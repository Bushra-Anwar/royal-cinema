import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  @Get('preferences')
  @ApiOperation({ summary: 'Get omnichannel notification preferences' })
  getPreferences() {
    return { ok: true };
  }
}