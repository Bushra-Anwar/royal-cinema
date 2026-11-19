const path = require('node:path');
const fs = require('node:fs');
const { ROOT_DIR, FRONTEND_DIR } = require('./env');

function getDataDir() {
  const base = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION)
    ? '/tmp'
    : (process.env.APPDATA ? path.join(process.env.APPDATA, 'royal-cinema-erp-desktop') : ROOT_DIR);
  const d = path.join(base, 'royal-erp-data');
  if (!fs.existsSync(d)) {
    try {
      fs.mkdirSync(d, { recursive: true });
    } catch (e) {
      console.warn('[DB] getDataDir mkdir warning:', e.message);
    }
  }
  return d;
}

const resolvedFrontendDir = FRONTEND_DIR || ROOT_DIR;
const resolvedWorkspacesDir = fs.existsSync(path.join(resolvedFrontendDir, 'workspaces'))
  ? path.join(resolvedFrontendDir, 'workspaces')
  : path.join(ROOT_DIR, 'workspaces');

module.exports = {
  ROOT_DIR,
  FRONTEND_DIR: resolvedFrontendDir,
  WORKSPACES_DIR: resolvedWorkspacesDir,
  getDataDir,
  getCompaniesFile: () => path.join(getDataDir(), 'companies.json'),
  getUsersFile: () => path.join(getDataDir(), 'users.json'),
  getBookingsFile: () => path.join(getDataDir(), 'bookings.json'),
  getDemoEnquiriesFile: () => path.join(getDataDir(), 'demo_enquiries.json'),
  getContactEnquiriesFile: () => path.join(getDataDir(), 'contact_enquiries.json'),
  getTicketsFile: () => path.join(getDataDir(), 'tickets.json'),
  getCallRequestsFile: () => path.join(getDataDir(), 'call_requests.json'),
  getChatMessagesFile: () => path.join(getDataDir(), 'chat_messages.json'),
  getInvoicesFile: () => path.join(getDataDir(), 'invoices.json'),
  getDevicesFile: () => path.join(getDataDir(), 'devices.json'),
  getReleasesFile: () => path.join(getDataDir(), 'releases.json')
};
