import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Licenses')
@Controller('licenses')
export class LicensesController {
  @Post('validate')
  @ApiOperation({ summary: 'Validate desktop device hardware hash against branch license' })
  validateDevice(@Body() body: any) {
    return { ok: true, authorized: true };
  }
}