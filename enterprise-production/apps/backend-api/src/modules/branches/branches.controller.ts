import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  @Get()
  @ApiOperation({ summary: 'List all branches for authenticated organization' })
  getBranches() {
    return { ok: true, branches: [] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single branch with subscription status' })
  getBranch(@Param('id') id: string) {
    return { ok: true, branchId: id };
  }
}