const { getCompanies, saveCompanies, getInvoices, saveInvoices } = require('../database/db');

function calculateDaysRemaining(validTillStr) {
  if (!validTillStr) return 0;
  const target = new Date(validTillStr).getTime();
  const diffDays = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getCompanyBranches(companyId) {
  const companies = getCompanies();
  const c = companyId ? companies.find(x => x.id === companyId) : companies[0];
  if (!c) return { ok: false, message: 'Company not found', branches: [] };

  const branches = (c.branches || []).map(b => {
    const daysLeft = calculateDaysRemaining(b.subscription?.validTill);
    const isExpired = daysLeft <= 0;
    return {
      ...b,
      daysRemaining: daysLeft,
      isExpired,
      effectiveStatus: isExpired ? 'Expired' : (b.status || 'Active')
    };
  });

  return {
    ok: true,
    companyId: c.id,
    companyName: c.name,
    branches
  };
}

function addBranch(companyId, branchData) {
  const { name, city, state, screensCount, planName, billingCycle } = branchData;
  if (!name || !city) {
    return { ok: false, message: 'Branch name and city are required.' };
  }

  const companies = getCompanies();
  const c = companyId ? companies.find(x => x.id === companyId) : companies[0];
  if (!c) return { ok: false, message: 'Company not found' };

  if (!Array.isArray(c.branches)) c.branches = [];

  const branchId = 'br-' + Date.now().toString().slice(-6);
  const selectedPlan = planName || 'Professional';
  const cycle = billingCycle || 'Yearly';

  const priceMap = {
    'Starter': { Monthly: '₹999', Yearly: '₹9,999', screens: 1, devices: 2 },
    'Professional': { Monthly: '₹1,699', Yearly: '₹16,999', screens: 2, devices: 4 },
    'Enterprise': { Monthly: '₹2,499', Yearly: '₹24,999', screens: 4, devices: 8 }
  };

  const planInfo = priceMap[selectedPlan] || priceMap['Professional'];
  const amount = planInfo[cycle];
  const validDurationMs = cycle === 'Yearly' ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
  const validTill = new Date(Date.now() + validDurationMs).toISOString().slice(0, 10);

  const newBranch = {
    id: branchId,
    name: name.trim(),
    city: city.trim(),
    state: (state || 'Gujarat').trim(),
    screensCount: parseInt(screensCount) || planInfo.screens,
    screens: Array.from({ length: parseInt(screensCount) || planInfo.screens }, (_, i) => `Audi ${i + 1}`),
    branchAdmin: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_admin@${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
    status: 'active',
    subscription: {
      planName: selectedPlan,
      billingCycle: cycle,
      amountPaid: amount,
      paidDate: new Date().toISOString().slice(0, 10),
      validTill: validTill,
      status: 'Active',
      devicesLimit: planInfo.devices
    },
    devices: [
      { id: 'dev-' + Date.now().toString().slice(-4), name: 'Box Office Counter 01', lastActive: 'Just registered', status: 'Active' }
    ]
  };

  c.branches.push(newBranch);
  saveCompanies(companies);

  // Generate automated invoice for new branch
  const invoices = getInvoices();
  const subtotalVal = cycle === 'Yearly' ? (selectedPlan === 'Enterprise' ? 21185.59 : selectedPlan === 'Professional' ? 14405.93 : 8473.73) : (parseFloat(amount.replace(/[^0-9.]/g, '')) * 0.82);
  const gstVal = subtotalVal * 0.09;
  invoices.unshift({
    invoiceNumber: 'RC-INV-' + Date.now().toString().slice(-6),
    companyName: c.name,
    branchName: newBranch.name,
    branchId: newBranch.id,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    dueDate: validTill,
    plan: `${selectedPlan} (${newBranch.screensCount} Screens)`,
    cycle,
    subtotal: subtotalVal,
    cgst: gstVal,
    sgst: gstVal,
    total: parseFloat(amount.replace(/[^0-9.]/g, '')),
    status: 'Paid',
    paymentMethod: 'UPI / Online Checkout',
    sacCode: '999632',
    gstin: '24AAAPC1234H1ZV'
  });
  saveInvoices(invoices);

  return {
    ok: true,
    message: `Branch "${newBranch.name}" created successfully with ${newBranch.screensCount} Screens under ${selectedPlan} plan!`,
    branch: newBranch
  };
}

function renewBranchSubscription(companyId, branchId, renewData = {}) {
  const companies = getCompanies();
  const c = companyId ? companies.find(x => x.id === companyId) : companies[0];
  if (!c) return { ok: false, message: 'Company not found' };

  const b = (c.branches || []).find(x => x.id === branchId);
  if (!b) return { ok: false, message: 'Branch not found' };

  const cycle = renewData.billingCycle || b.subscription?.billingCycle || 'Yearly';
  const durationMs = cycle === 'Yearly' ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;

  const currentValid = b.subscription?.validTill ? new Date(b.subscription.validTill).getTime() : 0;
  const baseTime = (currentValid > Date.now()) ? currentValid : Date.now();
  const newValidTill = new Date(baseTime + durationMs).toISOString().slice(0, 10);

  b.subscription = {
    ...(b.subscription || {}),
    billingCycle: cycle,
    paidDate: new Date().toISOString().slice(0, 10),
    validTill: newValidTill,
    status: 'Active'
  };
  b.status = 'active';

  // Reactivate devices
  (b.devices || []).forEach(d => { d.status = 'Active'; });

  saveCompanies(companies);

  // Generate Renewal Invoice
  const invoices = getInvoices();
  invoices.unshift({
    invoiceNumber: 'RC-INV-' + Date.now().toString().slice(-6),
    companyName: c.name,
    branchName: b.name,
    branchId: b.id,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    dueDate: newValidTill,
    plan: `${b.subscription.planName} (${b.screensCount} Screens)`,
    cycle,
    total: parseFloat((b.subscription.amountPaid || '9999').replace(/[^0-9.]/g, '')),
    status: 'Paid',
    paymentMethod: 'Instant Renewal (UPI / Card)',
    sacCode: '999632',
    gstin: '24AAAPC1234H1ZV'
  });
  saveInvoices(invoices);

  return {
    ok: true,
    message: `Subscription for branch "${b.name}" renewed successfully! Valid till ${newValidTill}.`,
    branch: b
  };
}

function upgradeBranchPlan(companyId, branchId, newPlanName) {
  const companies = getCompanies();
  const c = companyId ? companies.find(x => x.id === companyId) : companies[0];
  if (!c) return { ok: false, message: 'Company not found' };

  const b = (c.branches || []).find(x => x.id === branchId);
  if (!b) return { ok: false, message: 'Branch not found' };

  const planMap = {
    'Starter': { screens: 1, amountYearly: '₹9,999', devices: 2 },
    'Professional': { screens: 2, amountYearly: '₹16,999', devices: 4 },
    'Enterprise': { screens: 4, amountYearly: '₹24,999', devices: 8 }
  };

  const target = planMap[newPlanName] || planMap['Enterprise'];
  b.subscription.planName = newPlanName;
  b.subscription.amountPaid = target.amountYearly;
  b.subscription.devicesLimit = target.devices;
  b.screensCount = target.screens;
  b.screens = Array.from({ length: target.screens }, (_, i) => `Audi ${i + 1}`);

  saveCompanies(companies);

  return {
    ok: true,
    message: `Branch "${b.name}" successfully upgraded to ${newPlanName} (${target.screens} Screens, ${target.devices} Devices)!`,
    branch: b
  };
}

function registerCompanyWithBranch(data = {}) {
  const companies = getCompanies();
  const cName = data.companyName || 'Royal Cinema Group';
  let company = companies.find(c => String(c.name || '').toLowerCase() === cName.toLowerCase());

  if (!company) {
    company = {
      id: 'cmp-' + Math.random().toString(36).substr(2, 8),
      name: cName,
      status: 'active',
      adminEmail: data.ownerEmail || 'admin@royalcinema.in',
      adminPhone: data.ownerPhone || '+91 98765 43210',
      branches: []
    };
    companies.push(company);
  }

  if (!Array.isArray(company.branches)) company.branches = [];

  const bName = data.branchName || `${cName} — Flagship`;
  let branch = company.branches.find(b => String(b.name || '').toLowerCase() === bName.toLowerCase());

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const validTillStr = nextYear.toISOString().slice(0, 10);

  if (!branch) {
    branch = {
      id: 'br-' + Math.random().toString(36).substr(2, 8),
      name: bName,
      city: data.city || 'Ahmedabad',
      status: 'Active',
      subscription: {
        planName: data.planName || 'Professional Multiplex',
        billingCycle: data.billingCycle || 'Yearly',
        validTill: validTillStr,
        amountPaid: '₹16,999',
        screensAllowed: 4,
        devicesLimit: 4
      },
      screensCount: 4,
      screens: ['Screen 1 (Gold)', 'Screen 2 (Silver)', 'Screen 3 (IMAX)', 'Screen 4 (Executive)']
    };
    company.branches.push(branch);
  } else {
    branch.status = 'Active';
    branch.subscription = {
      ...(branch.subscription || {}),
      planName: data.planName || branch.subscription?.planName || 'Professional Multiplex',
      billingCycle: data.billingCycle || branch.subscription?.billingCycle || 'Yearly',
      validTill: validTillStr,
      status: 'Active'
    };
  }

  saveCompanies(companies);
  return { ok: true, company, branch };
}

function checkBranchAccess(companyId, branchId) {
  const companies = getCompanies();
  let c = companyId ? companies.find(x => x.id === companyId) : null;
  let b = null;

  if (c) {
    b = (c.branches || []).find(x => x.id === branchId || x.name === branchId);
  }

  if (!b) {
    // Search across all companies
    for (const comp of companies) {
      const found = (comp.branches || []).find(x => x.id === branchId || x.name === branchId);
      if (found) {
        c = comp;
        b = found;
        break;
      }
    }
  }

  if (!c || !b) {
    // Fallback to first company and its first branch if branchId was default
    c = c || companies[0];
    b = (c && c.branches && c.branches[0]) ? c.branches[0] : null;
  }

  if (!b) return { ok: false, allowed: false, message: 'Branch not found' };

  const daysLeft = calculateDaysRemaining(b.subscription?.validTill);
  const isExpired = daysLeft <= 0;

  if (isExpired || b.status === 'expired' || b.status === 'suspended') {
    return {
      ok: true,
      allowed: false,
      isExpired: true,
      branchId: b.id,
      branchName: b.name,
      validTill: b.subscription?.validTill,
      message: `Access Restricted: Subscription for "${b.name}" expired on ${b.subscription?.validTill || 'yesterday'}. Other branches remain active. Please renew in Client Portal.`
    };
  }

  return {
    ok: true,
    allowed: true,
    branchId: b.id,
    branchName: b.name,
    screensCount: b.screensCount,
    planName: b.subscription?.planName,
    daysRemaining: daysLeft
  };
}

module.exports = {
  getCompanyBranches,
  addBranch,
  renewBranchSubscription,
  upgradeBranchPlan,
  checkBranchAccess,
  registerCompanyWithBranch
};
