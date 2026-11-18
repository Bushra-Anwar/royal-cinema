const { getCompanies, saveCompanies, getUsers, saveUsers } = require('./db');
const { hashPassword } = require('../services/passwordService');
const env = require('../config/env');

async function seedDefaultDataIfEmpty() {
  const companies = getCompanies();
  if (companies.length > 0) return;

  console.log('[Seed] Seeding initial cinema flagship company and counter staff...');

  const adminPass = env.ADMIN_PASSWORD;
  const { salt: aSalt, hash: aHash } = await hashPassword(adminPass);
  const companyId = 'cmp-royal-palanpur';

  const defaultCompany = {
    id: companyId,
    name: 'Royal Cinema — Palanpur Flagship',
    type: 'cinema',
    adminUsername: env.ADMIN_USERNAME,
    adminEmail: env.ADMIN_EMAIL,
    adminSalt: aSalt,
    adminHash: aHash,
    plainPassword: adminPass,
    address: 'Station Road, Palanpur, Gujarat 385001',
    phone: '+91 98250 12345',
    subscription: {
      planName: 'Enterprise Cinema ERP & POS Cloud Service',
      amountPaid: '₹25,000',
      paidDate: '2026-11-14',
      validTill: '2027-11-14',
      nextDueDate: '2027-11-14',
      billingCycle: 'Yearly / Annual',
      paymentMethod: 'UPI / Bank Transfer (Ref: RC-99421)',
      status: 'Active'
    },
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  const staffPass = 'User@12345';
  const { salt: u1Salt, hash: u1Hash } = await hashPassword(staffPass);
  const { salt: u2Salt, hash: u2Hash } = await hashPassword(staffPass);

  const defaultUsers = [
    {
      id: 'usr-ticket-staff',
      companyId: companyId,
      name: 'Rahul Verma (Box Office Ticket Staff)',
      username: 'ticketstaff',
      email: 'ticket@royalcinema.in',
      salt: u1Salt,
      hash: u1Hash,
      plainPassword: staffPass,
      station: 'ticket',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'usr-food-staff',
      companyId: companyId,
      name: 'Sunita Mehta (Food Counter Staff)',
      username: 'foodstaff',
      email: 'food@royalcinema.in',
      salt: u2Salt,
      hash: u2Hash,
      plainPassword: staffPass,
      station: 'food',
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ];

  saveCompanies([defaultCompany]);
  saveUsers(defaultUsers);
  console.log('[Seed] Initial database setup completed successfully.');
}

module.exports = {
  seedDefaultDataIfEmpty
};
