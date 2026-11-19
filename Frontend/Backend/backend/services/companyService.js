const crypto = require('node:crypto');
const { getCompanies, saveCompanies, getUsers } = require('../database/db');
const { hashPassword } = require('./passwordService');

async function onboardCompany(data) {
  const {
    companyName, companyType, phone, address,
    adminUsername, adminEmail, adminPassword,
    planName, amountPaid, paidDate, validTill, nextDueDate,
    billingCycle, paymentMethod
  } = data;

  if (!companyName || !adminUsername || !adminEmail || !adminPassword) {
    return { ok: false, message: 'Company name, admin username, email, and password are required.' };
  }

  const companies = getCompanies();
  const existing = companies.find(
    c => (c.adminUsername || '').toLowerCase() === adminUsername.toLowerCase() ||
      (c.adminEmail || '').toLowerCase() === adminEmail.toLowerCase()
  );

  if (existing) {
    return { ok: false, message: 'A company or admin with that username or email already exists.' };
  }

  const { salt, hash } = await hashPassword(adminPassword);
  const companyId = 'cmp-' + crypto.randomBytes(4).toString('hex');

  const newCompany = {
    id: companyId,
    name: companyName,
    type: companyType || 'cinema',
    phone: phone || '',
    address: address || '',
    adminUsername,
    adminEmail,
    adminSalt: salt,
    adminHash: hash,
    plainPassword: adminPassword,
    subscription: {
      planName: planName || 'Multiplex Standard Cloud Plan',
      amountPaid: amountPaid || '₹24,999',
      paidDate: paidDate || new Date().toISOString().slice(0, 10),
      validTill: validTill || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      nextDueDate: nextDueDate || validTill || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      billingCycle: billingCycle || 'Yearly / Annual',
      paymentMethod: paymentMethod || 'UPI / Bank Transfer (Ref: RC-99421)',
      status: 'Active'
    },
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  companies.push(newCompany);
  saveCompanies(companies);

  return {
    ok: true,
    message: 'Subscription activated & cinema client onboarded successfully!',
    company: newCompany,
    user: {
      name: newCompany.name + ' Admin',
      email: newCompany.adminEmail,
      username: newCompany.adminUsername,
      role: 'admin',
      companyId: newCompany.id,
      companyName: newCompany.name,
      subscription: newCompany.subscription
    }
  };
}

function getAllCompanies() {
  const companies = getCompanies();
  return companies.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    phone: c.phone,
    address: c.address,
    adminUsername: c.adminUsername,
    adminEmail: c.adminEmail,
    plainPassword: c.plainPassword,
    subscription: c.subscription,
    status: c.status || 'active',
    createdAt: c.createdAt
  }));
}

function getPrimaryCompany() {
  const companies = getCompanies();
  return companies[0] || null;
}

function toggleCompanyStatus(companyId) {
  const companies = getCompanies();
  const c = companies.find(x => x.id === companyId);
  if (!c) return { ok: false, message: 'Company not found' };

  c.status = (c.status === 'active' || !c.status) ? 'suspended' : 'active';
  saveCompanies(companies);
  return { ok: true, status: c.status };
}

function renewCompanySubscription(companyId, renewData) {
  const companies = getCompanies();
  const c = companies.find(x => x.id === companyId);
  if (!c) return { ok: false, message: 'Company not found' };

  c.subscription = {
    ...(c.subscription || {}),
    planName: renewData.planName || c.subscription?.planName || 'Multiplex Standard Cloud Plan',
    amountPaid: renewData.amountPaid || c.subscription?.amountPaid || '₹24,999',
    paidDate: renewData.paidDate || new Date().toISOString().slice(0, 10),
    validTill: renewData.validTill || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    nextDueDate: renewData.nextDueDate || renewData.validTill || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    billingCycle: renewData.billingCycle || c.subscription?.billingCycle || 'Yearly / Annual',
    paymentMethod: renewData.paymentMethod || c.subscription?.paymentMethod || 'UPI / Bank Transfer',
    status: 'Active'
  };
  c.status = 'active';

  saveCompanies(companies);
  return { ok: true, subscription: c.subscription };
}

function checkCompanySubscription(identifier) {
  if (!identifier) return { ok: false, found: false, message: 'Identifier required' };
  const query = String(identifier).trim().toLowerCase();
  const companies = getCompanies();
  const users = getUsers();

  let targetCompany = null;
  const user = users.find(u => 
    String(u.username || '').toLowerCase() === query || 
    String(u.email || '').toLowerCase() === query
  );
  if (user && user.companyId) {
    targetCompany = companies.find(c => c.id === user.companyId);
  }

  if (!targetCompany) {
    targetCompany = companies.find(c => 
      String(c.name || '').toLowerCase().includes(query) ||
      String(c.email || '').toLowerCase() === query ||
      c.id === query
    );
  }

  if (!targetCompany) {
    return { ok: true, found: false, message: 'No existing subscription found for this account.' };
  }

  const sub = targetCompany.subscription || {};
  const validTillDate = sub.validTill ? new Date(sub.validTill) : new Date(Date.now() + 30*24*3600*1000);
  const now = new Date();
  const diffDays = Math.ceil((validTillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0;

  return {
    ok: true,
    found: true,
    companyId: targetCompany.id,
    companyName: targetCompany.name,
    planName: sub.planName || 'Multiplex Standard Cloud Plan',
    validTill: sub.validTill || validTillDate.toISOString().slice(0, 10),
    daysLeft: Math.max(0, diffDays),
    isExpired: isExpired,
    status: isExpired ? 'Expired' : (sub.status || 'Active'),
    message: isExpired 
      ? `Subscription expire ho gaya hai (${sub.validTill}). Kripya renew karein.`
      : `Active subscription maujood hai! ${diffDays} din bache hain.`
  };
}

function renewDirectSubscription(body) {
  const { companyId, identifier, planName, amountPaid, billingCycle } = body || {};
  const companies = getCompanies();
  let c = null;

  if (companyId) {
    c = companies.find(x => x.id === companyId);
  }
  if (!c && identifier) {
    const check = checkCompanySubscription(identifier);
    if (check.found && check.companyId) {
      c = companies.find(x => x.id === check.companyId);
    }
  }
  if (!c) {
    c = companies[0];
  }
  if (!c) return { ok: false, message: 'Cinema company not found' };

  return renewCompanySubscription(c.id, {
    planName: planName || c.subscription?.planName,
    amountPaid: amountPaid || c.subscription?.amountPaid,
    billingCycle: billingCycle || c.subscription?.billingCycle
  });
}

module.exports = {
  onboardCompany,
  getAllCompanies,
  getPrimaryCompany,
  toggleCompanyStatus,
  renewCompanySubscription,
  checkCompanySubscription,
  renewDirectSubscription
};
