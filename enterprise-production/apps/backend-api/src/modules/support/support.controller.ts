import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  @Get('tickets')
  @ApiOperation({ summary: 'List tickets with SLA countdown' })
  getTickets() {
    return { ok: true, tickets: [] };
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  createTicket(@Body() body: any) {
    return { ok: true, ticketId: 'TCK-2026-001' };
  }

  @Post('tickets/:id/reply')
  @ApiOperation({ summary: 'Post response to ticket thread' })
  replyTicket(@Param('id') id: string, @Body() body: any) {
    return { ok: true, id, replied: true };
  }
}