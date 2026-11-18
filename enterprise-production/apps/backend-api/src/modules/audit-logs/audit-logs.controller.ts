import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  @Get()
  @ApiOperation({ summary: 'Query immutable administrative audit logs' })
  getLogs() {
    return { ok: true, logs: [] };
  }
}