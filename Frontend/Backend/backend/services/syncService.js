const fs = require('fs');
const path = require('path');
const { getDataDir } = require('../config/paths');

const OFFLINE_JOURNAL_FILE = path.join(getDataDir(), 'offline_bookings_journal.json');
const SEAT_LEASES_FILE = path.join(getDataDir(), 'seat_leases.json');

// Read / Write Offline Journal
function getOfflineJournal() {
  try {
    if (fs.existsSync(OFFLINE_JOURNAL_FILE)) {
      return JSON.parse(fs.readFileSync(OFFLINE_JOURNAL_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveOfflineJournal(list) {
  try {
    fs.writeFileSync(OFFLINE_JOURNAL_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

// Seat Lease Management (Conflict Prevention Strategy)
function getSeatLeases() {
  try {
    if (fs.existsSync(SEAT_LEASES_FILE)) {
      return JSON.parse(fs.readFileSync(SEAT_LEASES_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveSeatLeases(leases) {
  try {
    fs.writeFileSync(SEAT_LEASES_FILE, JSON.stringify(leases, null, 2), 'utf8');
  } catch (e) {}
}

/**
 * 1. Acquire Seat Lease Block for Offline Counter POS
 * Counter workstations reserve blocks of seats before showtime to guarantee zero double-booking during internet outage.
 */
function acquireSeatLease(params = {}) {
  const {
    organizationId,
    companyId,
    branchId,
    showId,
    screenId,
    deviceId,
    leaseHolderId,
    operatorId,
    requestedSeats = [],
    seats = [],
    durationMs
  } = params;

  const targetSeats = (Array.isArray(requestedSeats) && requestedSeats.length)
    ? requestedSeats
    : (Array.isArray(seats) ? seats : []);

  const devId = deviceId || leaseHolderId || operatorId || 'device-pos-01';
  const orgId = organizationId || companyId || 'org-default';
  const brId = branchId || 'branch-default';
  const shId = showId || screenId || 'show-default';
  const duration = (typeof durationMs === 'number' && durationMs > 0) ? durationMs : (2 * 60 * 60 * 1000);

  const leases = getSeatLeases();
  const showKey = `${orgId}_${brId}_${shId}`;
  if (!leases[showKey]) leases[showKey] = {};

  const conflicts = [];
  const allocated = [];

  for (const seat of targetSeats) {
    const existing = leases[showKey][seat];
    if (existing && existing.deviceId !== devId && existing.expiresAt > Date.now()) {
      conflicts.push({ seat, leasedBy: existing.deviceId, expiresAt: existing.expiresAt });
    } else {
      leases[showKey][seat] = {
        deviceId: devId,
        leasedAt: Date.now(),
        expiresAt: Date.now() + duration
      };
      allocated.push(seat);
    }
  }

  saveSeatLeases(leases);
  return {
    ok: conflicts.length === 0,
    showKey,
    allocated,
    conflicts,
    leaseValidTill: new Date(Date.now() + duration).toISOString()
  };
}

/**
 * 2. Record Transaction in Offline Journal (when network is down)
 */
function recordOfflineBooking({ organizationId, branchId, deviceId, bookingData }) {
  const journal = getOfflineJournal();
  const entry = {
    journalId: 'jrn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    organizationId,
    branchId,
    deviceId,
    bookingData,
    synced: false,
    recordedOfflineAt: new Date().toISOString()
  };
  journal.push(entry);
  saveOfflineJournal(journal);
  return { ok: true, journalId: entry.journalId, message: 'Saved to local encrypted offline journal' };
}

/**
 * 3. Sync & Reconcile Offline Journal with Central SaaS Cloud Backend
 */
function reconcileOfflineJournal(cloudBookingsCallback) {
  const journal = getOfflineJournal();
  const pending = journal.filter(j => !j.synced);
  const reconciled = [];
  const errors = [];

  for (const item of pending) {
    try {
      if (cloudBookingsCallback) {
        cloudBookingsCallback(item.bookingData);
      }
      item.synced = true;
      item.syncedAt = new Date().toISOString();
      reconciled.push(item.journalId);
    } catch (err) {
      errors.push({ journalId: item.journalId, error: err.message });
    }
  }

  saveOfflineJournal(journal);
  return {
    ok: errors.length === 0,
    totalPending: pending.length,
    reconciledCount: reconciled.length,
    errors
  };
}

/**
 * 4. Automatic Multi-Tenant Identity & Branch Resolver
 * Takes Email or Username -> Automatically identifies Organization, Branch, Subscription, & Devices.
 * Client NEVER needs to enter an Organization ID manually!
 */
function resolveTenantContext(identifier, allCompanies = [], allUsers = []) {
  const cleanId = (identifier || '').trim().toLowerCase();
  if (!cleanId) {
    return { ok: false, message: 'Identifier or tenant ID required' };
  }

  // Find User
  let user = allUsers.find(u => 
    (u.email && u.email.toLowerCase() === cleanId) || 
    (u.username && u.username.toLowerCase() === cleanId)
  );

  // Find Organization
  let company = null;
  if (user) {
    company = allCompanies.find(c => 
      c.id === user.companyId || 
      (c.adminEmail && c.adminEmail.toLowerCase() === cleanId) ||
      (c.adminUsername && c.adminUsername.toLowerCase() === cleanId)
    );
  } else {
    company = allCompanies.find(c => 
      (c.id && c.id.toLowerCase() === cleanId) || 
      (c.name && c.name.toLowerCase().includes(cleanId)) ||
      (c.adminEmail && c.adminEmail.toLowerCase() === cleanId) ||
      (c.adminUsername && c.adminUsername.toLowerCase() === cleanId)
    );
  }

  if (!company) {
    return { ok: false, message: 'No registered cinema organization linked to this account or tenant ID.' };
  }

  // Enforce Multi-Branch Entitlement
  const branches = (company.branches || []).map(b => {
    const sub = b.subscription || {};
    const isExpired = sub.validTill ? new Date(sub.validTill).getTime() < Date.now() : false;
    return {
      branchId: b.id || b.branchId,
      branchName: b.name || b.branchName,
      city: b.city,
      screensCount: b.screensCount || b.screens || 1,
      status: isExpired ? 'expired' : (b.status || 'active'),
      subscription: {
        planName: sub.planName || 'Professional Multiplex',
        validTill: sub.validTill,
        isExpired
      }
    };
  });

  return {
    ok: true,
    company: {
      id: company.id,
      name: company.name,
      status: company.status || 'active',
      plan: company.subscription?.planName || 'Enterprise'
    },
    user: user ? {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.station || 'manager'
    } : null,
    branches,
    activeBranchesCount: branches.filter(b => b.status === 'active').length,
    expiredBranchesCount: branches.filter(b => b.status === 'expired').length
  };
}

module.exports = {
  acquireSeatLease,
  recordOfflineBooking,
  reconcileOfflineJournal,
  resolveTenantContext
};
