const fs = require('node:fs');
const {
  getCompaniesFile,
  getUsersFile,
  getBookingsFile,
  getDemoEnquiriesFile,
  getContactEnquiriesFile,
  getTicketsFile,
  getCallRequestsFile,
  getChatMessagesFile,
  getInvoicesFile,
  getDevicesFile,
  getReleasesFile
} = require('../config/paths');

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[DB] Error reading ${filePath}:`, err.message);
    return null;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
    return true;
  } catch (err) {
    console.error(`[DB] Error writing ${filePath}:`, err.message);
    return false;
  }
}

function getCompanies() {
  const list = readJson(getCompaniesFile()) || [];
  // Ensure every company has a branches array
  let updated = false;
  list.forEach(c => {
    if (!Array.isArray(c.branches) || c.branches.length === 0) {
      c.branches = [
        {
          id: 'br-' + c.id + '-01',
          name: c.name + ' — Ahmedabad Main',
          city: 'Ahmedabad',
          state: 'Gujarat',
          screensCount: 4,
          screens: ['Audi 1 (Dolby Atmos)', 'Audi 2 (4K Laser)', 'Audi 3 (VIP)', 'Audi 4 (IMAX)'],
          branchAdmin: c.adminUsername,
          status: 'active',
          subscription: {
            planName: 'Enterprise',
            billingCycle: 'Yearly',
            amountPaid: '₹24,999',
            paidDate: '2026-11-15',
            validTill: '2027-11-15',
            status: 'Active',
            devicesLimit: 8
          },
          devices: [
            { id: 'dev-01', name: 'Box Office Counter 01', lastActive: 'Today · 18:40', status: 'Active' },
            { id: 'dev-02', name: 'Concessions POS 01', lastActive: 'Today · 18:35', status: 'Active' }
          ]
        },
        {
          id: 'br-' + c.id + '-02',
          name: c.name + ' — Gandhinagar Twin',
          city: 'Gandhinagar',
          state: 'Gujarat',
          screensCount: 2,
          screens: ['Audi 1 (Dolby Atmos)', 'Audi 2 (Digital 2K)'],
          branchAdmin: 'gandhinagar_mgr@royalcinema.in',
          status: 'active',
          subscription: {
            planName: 'Professional',
            billingCycle: 'Yearly',
            amountPaid: '₹16,999',
            paidDate: '2026-11-15',
            validTill: '2027-11-15',
            status: 'Active',
            devicesLimit: 4
          },
          devices: [
            { id: 'dev-03', name: 'Box Office Counter 01', lastActive: 'Today · 18:20', status: 'Active' }
          ]
        },
        {
          id: 'br-' + c.id + '-03',
          name: c.name + ' — Surat Heritage',
          city: 'Surat',
          state: 'Gujarat',
          screensCount: 1,
          screens: ['Audi 1 (Heritage Single Screen)'],
          branchAdmin: 'surat_mgr@royalcinema.in',
          status: 'expired',
          subscription: {
            planName: 'Starter',
            billingCycle: 'Monthly',
            amountPaid: '₹999',
            paidDate: '2026-10-15',
            validTill: '2026-11-15', // Expired!
            status: 'Expired',
            devicesLimit: 2
          },
          devices: [
            { id: 'dev-04', name: 'Box Office Counter 01', lastActive: '2026-11-15 22:00', status: 'Restricted' }
          ]
        }
      ];
      updated = true;
    }
  });
  if (updated) saveCompanies(list);
  return list;
}

function saveCompanies(companies) {
  return writeJson(getCompaniesFile(), companies);
}

function getUsers() {
  return readJson(getUsersFile()) || [];
}

function saveUsers(users) {
  return writeJson(getUsersFile(), users);
}

function getBookings() {
  return readJson(getBookingsFile()) || [];
}

function saveBookings(bookings) {
  return writeJson(getBookingsFile(), bookings);
}

function getDemoEnquiries() {
  return readJson(getDemoEnquiriesFile()) || [];
}

function saveDemoEnquiries(enquiries) {
  return writeJson(getDemoEnquiriesFile(), enquiries);
}

function getContactEnquiries() {
  return readJson(getContactEnquiriesFile()) || [];
}

function saveContactEnquiries(enquiries) {
  return writeJson(getContactEnquiriesFile(), enquiries);
}

function getTickets() {
  let list = readJson(getTicketsFile());
  if (!list || !list.length) {
    list = [
      {
        id: 'RCERP-00124',
        companyName: 'Royal Cinema Palanpur',
        branchName: 'Ahmedabad Main',
        branchId: 'br-ahm-01',
        category: 'POS & Booking',
        subcategory: 'Seat booking / Counter issue',
        subject: 'Booking module showing latency during evening weekend rush',
        description: 'Ticket booking screen is showing an error or slight delay after selecting multiple seats on Audi 1. Please inspect.',
        priority: 'Critical',
        status: 'Open',
        assignedTo: 'Ananya Sharma (Senior Tech Lead)',
        slaTarget: '15 minutes',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        messages: [
          { author: 'Rajesh Sharma (Owner)', role: 'client', time: '25 mins ago', text: 'Ticket booking screen is showing an error after selecting seats on Screen 1.' },
          { author: 'Ananya Sharma (Support)', role: 'agent', time: '12 mins ago', text: 'Hi Rajesh, our engineering team has detected the temporary lock latency and is running memory garbage collection on counter node. You will receive an update in 5 mins.' }
        ]
      },
      {
        id: 'RCERP-00125',
        companyName: 'Galaxy Cinemas',
        branchName: 'Gandhinagar Twin',
        branchId: 'br-gan-02',
        category: 'Billing',
        subcategory: 'Invoice download issue',
        subject: 'Need annual GST tax invoice PDF with SAC code 999632',
        description: 'Accountant needs the consolidated GST breakdown invoice for Q3 return filing.',
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: 'Vikram Mehta (Billing Operations)',
        slaTarget: '4 business hours',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        messages: [
          { author: 'Galaxy Manager', role: 'client', time: '1.5 hrs ago', text: 'Please email the tax invoice PDF for Gandhinagar branch renewal.' }
        ]
      },
      {
        id: 'RCERP-00126',
        companyName: 'City Lite Cinema',
        branchName: 'Surat Heritage',
        branchId: 'br-sur-03',
        category: 'Hardware',
        subcategory: '80mm Thermal Printer',
        subject: 'Epson TM-T82III cutter alignment query',
        description: 'Configuring auto paper cut after printing 80mm concession receipt.',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: 'Pooja Patel',
        slaTarget: '1 business day',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        messages: [
          { author: 'Surat Cashier', role: 'client', time: 'Yesterday', text: 'Is ESC/POS paper cutting code 0x1D 0x56 enabled?' },
          { author: 'Pooja Patel', role: 'agent', time: 'Yesterday', text: 'Yes, paper cut signal is transmitted automatically after EOF. Tested and resolved.' }
        ]
      }
    ];
    writeJson(getTicketsFile(), list);
  }
  return list;
}

function saveTickets(tickets) {
  return writeJson(getTicketsFile(), tickets);
}

function getCallRequests() {
  let list = readJson(getCallRequestsFile());
  if (!list || !list.length) {
    list = [
      {
        id: 'CALL-9041',
        name: 'Suresh Patel',
        phone: '+91 98250 12345',
        branch: 'Royal Cinema Ahmedabad',
        reason: 'Adding 2 new screens and upgrading to Enterprise plan',
        preferredDateTime: 'Tomorrow · 14:00 IST',
        urgency: 'High',
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(getCallRequestsFile(), list);
  }
  return list;
}

function saveCallRequests(calls) {
  return writeJson(getCallRequestsFile(), calls);
}

function getInvoices() {
  let list = readJson(getInvoicesFile());
  if (!list || !list.length) {
    list = [
      {
        invoiceNumber: 'RC-INV-2026-0084',
        companyName: 'Royal Cinema Palanpur',
        branchName: 'Ahmedabad Main',
        branchId: 'br-ahm-01',
        date: '15 Nov 2026',
        dueDate: '15 Nov 2027',
        plan: 'Enterprise (4 Screens)',
        cycle: 'Yearly',
        subtotal: 21185.59,
        cgst: 1906.70,
        sgst: 1906.70,
        total: 24999.00,
        status: 'Paid',
        paymentMethod: 'UPI / Bank Transfer (Ref: RC-99421)',
        sacCode: '999632',
        gstin: '24AAAPC1234H1ZV'
      },
      {
        invoiceNumber: 'RC-INV-2026-0085',
        companyName: 'Royal Cinema Palanpur',
        branchName: 'Gandhinagar Twin',
        branchId: 'br-gan-02',
        date: '15 Nov 2026',
        dueDate: '15 Nov 2027',
        plan: 'Professional (2 Screens)',
        cycle: 'Yearly',
        subtotal: 14405.93,
        cgst: 1296.53,
        sgst: 1296.53,
        total: 16999.00,
        status: 'Paid',
        paymentMethod: 'UPI / Instant Webhook',
        sacCode: '999632',
        gstin: '24AAAPC1234H1ZV'
      },
      {
        invoiceNumber: 'RC-INV-2026-0052',
        companyName: 'Royal Cinema Palanpur',
        branchName: 'Surat Heritage',
        branchId: 'br-sur-03',
        date: '15 Oct 2026',
        dueDate: '15 Nov 2026',
        plan: 'Starter (1 Screen)',
        cycle: 'Monthly',
        subtotal: 846.61,
        cgst: 76.20,
        sgst: 76.20,
        total: 999.00,
        status: 'Expired (Renewal Due)',
        paymentMethod: 'UPI Pending',
        sacCode: '999632',
        gstin: '24AAAPC1234H1ZV'
      }
    ];
    writeJson(getInvoicesFile(), list);
  }
  return list;
}

function saveInvoices(invoices) {
  return writeJson(getInvoicesFile(), invoices);
}

function getReleases() {
  let list = readJson(getReleasesFile());
  if (!list || !list.length) {
    list = [
      {
        version: 'v0.3.0',
        channel: 'Stable',
        releaseDate: '15 Nov 2026',
        fileSize: '142 MB',
        fileName: 'Royal-Cinema-ERP-Setup-0.3.0.exe',
        sha256: '9f8e7d6c5b4a392817263544fedcba0918273645e5d4c3b2a10987654321abcd',
        minSupportedVersion: 'v0.2.0',
        mandatoryUpdate: false,
        releaseNotes: [
          'High-throughput 80mm ESC/POS thermal receipt printing integration',
          'Multi-branch independent subscription licensing & branch selector',
          'Itemized 5% GST F&B concessions billing & automated KOT tokens',
          'Distributor settlement ledger (50/50 net gross automated split)',
          'High-resolution PNG admission ticket export'
        ]
      }
    ];
    writeJson(getReleasesFile(), list);
  }
  return list;
}

function saveReleases(releases) {
  return writeJson(getReleasesFile(), releases);
}

module.exports = {
  readJson,
  writeJson,
  getCompanies,
  saveCompanies,
  getUsers,
  saveUsers,
  getBookings,
  saveBookings,
  getDemoEnquiries,
  saveDemoEnquiries,
  getContactEnquiries,
  saveContactEnquiries,
  getTickets,
  saveTickets,
  getCallRequests,
  saveCallRequests,
  getInvoices,
  saveInvoices,
  getReleases,
  saveReleases
};
