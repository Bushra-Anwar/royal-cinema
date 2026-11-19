const { getCompanies, saveCompanies } = require('../database/db');

function getSubscription(companyId) {
  const companies = getCompanies();
  const company = companyId
    ? companies.find(c => c.id === companyId)
    : companies[0];

  if (!company) {
    return {
      planName: 'Enterprise Cinema ERP & POS Cloud Service',
      amountPaid: '₹25,000',
      paidDate: '2026-11-14',
      validTill: '2027-11-14',
      nextDueDate: '2027-11-14',
      billingCycle: 'Yearly / Annual',
      paymentMethod: 'UPI / Bank Transfer (Ref: RC-99421)',
      status: 'Active'
    };
  }

  return company.subscription || {
    planName: 'Enterprise Cinema ERP & POS Cloud Service',
    amountPaid: '₹25,000',
    paidDate: '2026-11-14',
    validTill: '2027-11-14',
    nextDueDate: '2027-11-14',
    billingCycle: 'Yearly / Annual',
    paymentMethod: 'UPI / Bank Transfer (Ref: RC-99421)',
    status: 'Active'
  };
}

function updateSubscription(companyId, updateData) {
  const companies = getCompanies();
  const targetIdx = companyId
    ? companies.findIndex(c => c.id === companyId)
    : 0;

  if (targetIdx === -1 || !companies[targetIdx]) {
    return { ok: false, message: 'Company not found' };
  }

  companies[targetIdx].subscription = {
    ...(companies[targetIdx].subscription || {}),
    ...updateData
  };

  saveCompanies(companies);
  return { ok: true, subscription: companies[targetIdx].subscription };
}

module.exports = {
  getSubscription,
  updateSubscription
};
