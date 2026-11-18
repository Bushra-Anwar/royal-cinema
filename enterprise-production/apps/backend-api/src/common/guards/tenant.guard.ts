import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

/**
 * Tenant Isolation Guard (Section 15 Security Requirement)
 * Rule: Never trust organizationId / tenantId sent by the frontend without verifying authenticated membership.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required for multi-tenant resource access.');
    }

    // Super Admin has global governance privileges
    if (user.role === UserRole.SUPER_ADMIN) {
      request.tenantId = request.headers['x-tenant-id'] || user.tenantId || null;
      request.organizationId = request.tenantId;
      return true;
    }

    // For all cinema tenants, strictly enforce authenticated user's organizationId
    const headerTenantId = request.headers['x-tenant-id'];
    const authenticatedTenantId = user.tenantId || user.organizationId;

    if (!authenticatedTenantId) {
      throw new ForbiddenException('User is not associated with any active cinema organization.');
    }

    // Prevent frontend tenant spoofing: If header provided, it MUST match authenticated context
    if (headerTenantId && headerTenantId !== authenticatedTenantId) {
      throw new ForbiddenException('Access denied: You do not have permissions to access data of another organization.');
    }

    request.tenantId = authenticatedTenantId;
    request.organizationId = authenticatedTenantId;
    return true;
  }
}
