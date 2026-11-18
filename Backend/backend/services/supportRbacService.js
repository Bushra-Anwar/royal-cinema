const fs = require('fs');
const path = require('path');
const { getDataDir } = require('../config/paths');

const AUDIT_LOGS_FILE = path.join(getDataDir(), 'audit_logs.json');
const SAAS_STAFF_FILE = path.join(getDataDir(), 'saas_staff_members.json');

// SaaS Support Team Roles & Permission Definitions (Section 11 Blueprint)
const SAAS_ROLES = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full SaaS control and root administrative privileges',
    permissions: ['all']
  },
  SUPPORT_MANAGER: {
    id: 'support_manager',
    name: 'Support Manager',
    description: 'All support tickets, team assignment, SLA monitoring',
    permissions: ['tickets:view_all', 'tickets:assign', 'tickets:reply', 'tickets:resolve', 'calls:manage']
  },
  SUPPORT_AGENT: {
    id: 'support_agent',
    name: 'Support Agent',
    description: 'Assigned customer tickets only; cannot change pricing or settings',
    permissions: ['tickets:view_assigned', 'tickets:reply']
  },
  TECH_SUPPORT: {
    id: 'tech_support',
    name: 'Technical Support',
    description: 'Technical issue resolution, logs inspection; strictly no production DB modification',
    permissions: ['tickets:view_all', 'tickets:reply', 'devices:diagnostics', 'logs:view']
  },
  BILLING_ADMIN: {
    id: 'billing_admin',
    name: 'Billing Admin',
    description: 'Payments, Razorpay transactions, and invoices; cannot delete tickets',
    permissions: ['invoices:manage', 'payments:view', 'refunds:process', 'subscriptions:view']
  },
  SALES_MANAGER: {
    id: 'sales_manager',
    name: 'Sales Manager',
    description: 'Demo requests, prospective leads pipeline, and conversion links',
    permissions: ['demo_requests:manage', 'leads:view', 'checkout_links:generate']
  },
  RELEASE_MANAGER: {
    id: 'release_manager',
    name: 'Release Manager',
    description: 'Application releases, installers, SHA256 validation, and changelogs',
    permissions: ['releases:create', 'releases:publish', 'downloads:manage']
  }
};

// Seed initial SaaS Support Team
const defaultStaff = [
  { id: 'staff_01', name: 'Alok Verma', email: 'alok.super@royalcinemaerp.com', roleId: 'super_admin', active: true },
  { id: 'staff_02', name: 'Sneha Roy', email: 'sneha.mgr@royalcinemaerp.com', roleId: 'support_manager', active: true },
  { id: 'staff_03', name: 'Vikram Joshi', email: 'vikram.agent@royalcinemaerp.com', roleId: 'support_agent', active: true },
  { id: 'staff_04', name: 'Tanvi Shah', email: 'tanvi.tech@royalcinemaerp.com', roleId: 'tech_support', active: true },
  { id: 'staff_05', name: 'Pooja Mehta', email: 'pooja.billing@royalcinemaerp.com', roleId: 'billing_admin', active: true },
  { id: 'staff_06', name: 'Kunal Patel', email: 'kunal.sales@royalcinemaerp.com', roleId: 'sales_manager', active: true },
  { id: 'staff_07', name: 'Rahul Nair', email: 'rahul.release@royalcinemaerp.com', roleId: 'release_manager', active: true }
];

function getStaffMembers() {
  try {
    if (fs.existsSync(SAAS_STAFF_FILE)) {
      return JSON.parse(fs.readFileSync(SAAS_STAFF_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading SaaS staff:', e);
  }
  try {
    fs.writeFileSync(SAAS_STAFF_FILE, JSON.stringify(defaultStaff, null, 2), 'utf8');
  } catch(e) {}
  return defaultStaff;
}

function saveStaffMembers(list) {
  try {
    fs.writeFileSync(SAAS_STAFF_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch(e) {}
}

// Audit Logger for Sensitive SaaS Operations
function recordAuditLog({ actorId = 'super_admin', actorName = 'Super Admin', action, targetResource, details = {}, ip = '127.0.0.1' }) {
  let logs = [];
  try {
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, 'utf8'));
    }
  } catch (e) {}

  const entry = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    actorId,
    actorName,
    action,
    targetResource,
    details,
    ip,
    timestamp: new Date().toISOString()
  };

  logs.unshift(entry);
  try {
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs.slice(0, 300), null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
  return entry;
}

function getAuditLogs() {
  try {
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

/**
 * Check if a role has the required permission
 */
function checkPermission(roleId, requiredPermission) {
  const role = Object.values(SAAS_ROLES).find(r => r.id === roleId);
  if (!role) return false;
  if (role.permissions.includes('all')) return true;
  return role.permissions.includes(requiredPermission);
}

module.exports = {
  SAAS_ROLES,
  getStaffMembers,
  saveStaffMembers,
  recordAuditLog,
  getAuditLogs,
  checkPermission
};
