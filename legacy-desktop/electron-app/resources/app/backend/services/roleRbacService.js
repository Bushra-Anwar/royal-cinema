/**
 * Royal Cinema ERP — Role-Based Access Control (RBAC) & Security Service
 * 
 * Final Simplified Role Structure:
 * 1. SERVICE_PROVIDER / SAAS_OWNER: Complete SaaS business, client management, website CMS, and advertisements.
 * 2. MANAGER: Unified operational ERP controller (combining Admin + Super Admin operational + Manager).
 * 3. FOOD_PROVIDER: Strictly food operations (menu, incoming orders, stock, payouts).
 * 4. CUSTOMER: Customer self-service booking, ordering, ticket viewing.
 */

const ROLES = {
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  MANAGER: 'MANAGER',
  FOOD_PROVIDER: 'FOOD_PROVIDER',
  CUSTOMER: 'CUSTOMER'
};

// Normalized role alias resolver
function normalizeRole(role) {
  const r = String(role || '').trim().toUpperCase();
  if (r === 'SUPERADMIN' || r === 'SUPER_ADMIN' || r === 'SERVICE_PROVIDER' || r === 'SAAS_OWNER' || r === 'PROVIDER') {
    return ROLES.SERVICE_PROVIDER;
  }
  if (r === 'ADMIN' || r === 'CINEMA_ADMIN' || r === 'MANAGER' || r === 'BRANCH_MANAGER' || r === 'TICKET' || r === 'TICKET_STAFF') {
    return ROLES.MANAGER;
  }
  if (r === 'FOOD' || r === 'FOOD_STAFF' || r === 'FOOD_PROVIDER' || r === 'CONCESSION_STAFF') {
    return ROLES.FOOD_PROVIDER;
  }
  if (r === 'CUSTOMER' || r === 'GUEST' || r === 'USER') {
    return ROLES.CUSTOMER;
  }
  return ROLES.CUSTOMER;
}

// Role Permissions Matrix
const PERMISSIONS = {
  // SaaS Owner Exclusive
  SAAS_WEBSITE_MANAGE: [ROLES.SERVICE_PROVIDER],
  SAAS_WEBSITE_PUBLISH: [ROLES.SERVICE_PROVIDER],
  SAAS_ADVERTISEMENT_MANAGE: [ROLES.SERVICE_PROVIDER],
  SAAS_GLOBAL_CLIENTS_MANAGE: [ROLES.SERVICE_PROVIDER],
  SAAS_ANALYTICS_VIEW: [ROLES.SERVICE_PROVIDER],
  SAAS_PLANS_MANAGE: [ROLES.SERVICE_PROVIDER],

  // Manager Operational Permissions (Combined Admin + Manager)
  ERP_DASHBOARD_ACCESS: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_BRANCH_OPERATIONS: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_BOX_OFFICE_POS: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_COMMAND_CENTER_LEDGER: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_STAFF_MANAGE: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_TICKETS_MANAGE: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_REPORTS_VIEW: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  ERP_PAYMENTS_MONITOR: [ROLES.MANAGER, ROLES.SERVICE_PROVIDER],

  // Food Provider Operations (Strictly Food Only)
  FOOD_OPERATIONS_ACCESS: [ROLES.FOOD_PROVIDER, ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  FOOD_ORDERS_MANAGE: [ROLES.FOOD_PROVIDER, ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  FOOD_MENU_MANAGE: [ROLES.FOOD_PROVIDER, ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  FOOD_STOCK_RESTOCK: [ROLES.FOOD_PROVIDER, ROLES.MANAGER, ROLES.SERVICE_PROVIDER],
  FOOD_EARNINGS_VIEW: [ROLES.FOOD_PROVIDER, ROLES.MANAGER, ROLES.SERVICE_PROVIDER]
};

function hasPermission(userRole, permissionKey) {
  const normRole = normalizeRole(userRole);
  const allowed = PERMISSIONS[permissionKey];
  if (!allowed) return false;
  return allowed.includes(normRole);
}

function verifyRoleAccess(req, allowedRoles = []) {
  // Extract role from request headers (x-user-role, Authorization token, or query)
  const headerRole = req.headers['x-user-role'] || (req.url && new URL(req.url, 'http://localhost').searchParams.get('role'));
  const normRole = normalizeRole(headerRole);

  if (allowedRoles.length === 0) return true;
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
  return normalizedAllowed.includes(normRole);
}

module.exports = {
  ROLES,
  normalizeRole,
  PERMISSIONS,
  hasPermission,
  verifyRoleAccess
};
