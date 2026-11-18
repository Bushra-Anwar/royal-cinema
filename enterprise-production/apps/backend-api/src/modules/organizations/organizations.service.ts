import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationsService {
  async findById(id: string) {
    return { id, name: 'Royal Cinema Group', status: 'active' };
  }
}