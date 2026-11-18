import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  @Get()
  @ApiOperation({ summary: 'List customer invoices' })
  getInvoices() {
    return { ok: true, invoices: [] };
  }
}