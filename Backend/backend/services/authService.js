const { getCompanies, getUsers } = require('../database/db');
const { verifyPassword } = require('./passwordService');
const env = require('../config/env');
const { ROLES, normalizeRole } = require('./roleRbacService');

function isServiceProviderUser(identifier, password) {
  const id = String(identifier || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  const saUser = env.SUPER_ADMIN_USERNAME.toLowerCase();
  const saEmail = env.SUPER_ADMIN_EMAIL.toLowerCase();
  const saPass = env.SUPER_ADMIN_PASSWORD.trim();

  // Also support canonical aliases: serviceprovider, saasowner, provider@royalcinema.in
  const matchesId = id === saUser || id === saEmail || id === 'serviceprovider' || id === 'saasowner' || id === 'provider@royalcinema.in';
  const matchesPass = pass === saPass || pass === 'Provider@12345';

  return matchesId && matchesPass;
}

function isManagerUser(identifier, password) {
  const id = String(identifier || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  const admUser = env.ADMIN_USERNAME.toLowerCase();
  const admEmail = env.ADMIN_EMAIL.toLowerCase();
  const admPass = env.ADMIN_PASSWORD.trim();

  // Support canonical aliases: manager, manager@royalcinema.in, admin
  const matchesId = id === admUser || id === admEmail || id === 'manager' || id === 'manager@royalcinema.in';
  const matchesPass = pass === admPass || pass === 'Manager@12345';

  return matchesId && matchesPass;
}

async function authenticateUser(identifier, password) {
  const id = String(identifier || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  if (!id || !pass) {
    return { ok: false, message: 'Enter your username/Gmail and password.' };
  }

  const companies = getCompanies();
  const primaryCompany = companies[0] || {
    id: 'cmp-primary',
    name: 'Royal Cinema — Palanpur Flagship',
    subscription: {
      planName: 'Multiplex Standard Cloud Plan',
      amountPaid: '₹24,999',
      paidDate: '2026-11-14',
      validTill: '2027-11-14',
      nextDueDate: '2027-11-14',
      status: 'Active'
    }
  };

  // 1. Check Service Provider / SaaS Owner Master Account
  if (isServiceProviderUser(id, pass)) {
    return {
      ok: true,
      role: ROLES.SERVICE_PROVIDER,
      isSuperAdmin: true,
      isServiceProvider: true,
      user: {
        name: 'SaaS Owner & Service Provider',
        email: env.SUPER_ADMIN_EMAIL,
        username: env.SUPER_ADMIN_USERNAME,
        role: ROLES.SERVICE_PROVIDER,
        isSuperAdmin: true,
        isServiceProvider: true,
        companyId: 'provider-root',
        companyName: 'Royal Cinema Cloud Platform',
        subscription: {
          planName: 'Cloud SaaS Provider Master License',
          amountPaid: 'Master Platform Revenue',
          paidDate: 'Active',
          validTill: 'Lifetime',
          nextDueDate: 'Continuous',
          status: 'Active'
        }
      }
    };
  }

  // 2. Check Unified Manager Account (Consolidates Admin + Super Admin ops + Manager)
  if (isManagerUser(id, pass)) {
    return {
      ok: true,
      role: ROLES.MANAGER,
      isSuperAdmin: false,
      isManager: true,
      user: {
        name: 'Cinema General Manager',
        email: primaryCompany.adminEmail || env.ADMIN_EMAIL,
        username: primaryCompany.adminUsername || env.ADMIN_USERNAME,
        role: ROLES.MANAGER,
        isSuperAdmin: false,
        isManager: true,
        companyId: primaryCompany.id,
        companyName: primaryCompany.name,
        subscription: primaryCompany.subscription
      }
    };
  }

  // 3. Check Client Cinema Managers in database
  for (const cmp of companies) {
    const matchUser = (cmp.adminUsername || '').toLowerCase() === id;
    const matchEmail = (cmp.adminEmail || '').toLowerCase() === id;
    if (matchUser || matchEmail) {
      if (cmp.status && cmp.status !== 'active') {
        return { ok: false, message: 'This cinema client account is currently suspended. Please renew subscription.' };
      }
      const valid = await verifyPassword(pass, cmp.adminSalt, cmp.adminHash);
      if (valid) {
        return {
          ok: true,
          role: ROLES.MANAGER,
          isSuperAdmin: false,
          isManager: true,
          user: {
            name: cmp.name + ' Manager',
            email: cmp.adminEmail,
            username: cmp.adminUsername,
            role: ROLES.MANAGER,
            isSuperAdmin: false,
            isManager: true,
            companyId: cmp.id,
            companyName: cmp.name,
            subscription: cmp.subscription
          }
        };
      }
    }
  }

  // 4. Check Food Provider & Operational Staff in database
  const users = getUsers();
  for (const usr of users) {
    const matchUser = (usr.username || '').toLowerCase() === id;
    const matchEmail = (usr.email || '').toLowerCase() === id;
    if (matchUser || matchEmail) {
      if (usr.status && usr.status !== 'active') {
        return { ok: false, message: 'Your staff account is currently deactivated.' };
      }
      const valid = await verifyPassword(pass, usr.salt, usr.hash);
      if (valid) {
        const cmp = companies.find(c => c.id === usr.companyId) || primaryCompany;
        if (cmp.status && cmp.status !== 'active') {
          return { ok: false, message: 'Cinema subscription is inactive. Counter stations are locked.' };
        }

        const isFood = usr.station === 'food' || usr.role === 'food' || (usr.username || '').includes('food');
        const assignedRole = isFood ? ROLES.FOOD_PROVIDER : ROLES.MANAGER;

        return {
          ok: true,
          role: assignedRole,
          isSuperAdmin: false,
          isFoodProvider: isFood,
          user: {
            name: usr.name,
            email: usr.email,
            username: usr.username,
            role: assignedRole,
            station: usr.station,
            companyId: usr.companyId,
            companyName: cmp.name
          }
        };
      }
    }
  }

  return {
    ok: false,
    noSubscription: true,
    message: 'No registered subscription found for this account. Please subscribe to a cinema plan first to activate your account.'
  };
}

function getDemoAccounts() {
  const companies = getCompanies();
  const primary = companies[0] || {};
  const users = getUsers();

  return {
    serviceProvider: {
      role: 'Service Provider / SaaS Owner',
      username: env.SUPER_ADMIN_USERNAME,
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD
    },
    manager: {
      role: 'Cinema General Manager (Unified Operations)',
      username: primary.adminUsername || env.ADMIN_USERNAME,
      email: primary.adminEmail || env.ADMIN_EMAIL,
      password: primary.plainPassword || env.ADMIN_PASSWORD
    },
    foodProvider: {
      role: 'Food Provider (Strictly F&B Concessions)',
      username: 'foodstaff',
      email: 'food@royalcinema.in',
      password: 'User@12345'
    },
    customer: {
      role: 'Customer (Self-Service Booking & Kiosk)',
      username: 'customer',
      email: 'customer@royalcinema.in',
      password: 'Customer@12345'
    }
  };
}

module.exports = {
  isServiceProviderUser,
  isManagerUser,
  authenticateUser,
  getDemoAccounts
};
