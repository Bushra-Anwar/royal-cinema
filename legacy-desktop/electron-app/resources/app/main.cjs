const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');
const backend = require('./backend');

// ═══════════════════════════════════════════════════════════
// IPC HANDLERS (Delegated to Backend Services)
// ═══════════════════════════════════════════════════════════

ipcMain.handle('auth:login', async (_event, { identifier, password }) => {
  return backend.services.auth.authenticateUser(identifier, password);
});

ipcMain.handle('company:onboard', async (_event, data) => {
  return backend.services.company.onboardCompany(data);
});

ipcMain.handle('company:list', async () => {
  return backend.services.company.getAllCompanies();
});

ipcMain.handle('company:toggleStatus', async (_event, { companyId }) => {
  return backend.services.company.toggleCompanyStatus(companyId);
});

ipcMain.handle('company:renew', async (_event, { companyId, renewData }) => {
  return backend.services.company.renewCompanySubscription(companyId, renewData);
});

ipcMain.handle('subscription:get', async (_event, companyId) => {
  const sub = backend.services.subscription.getSubscription(companyId);
  const comp = companyId ? backend.services.company.getAllCompanies().find(c => c.id === companyId) : backend.services.company.getPrimaryCompany();
  return {
    ok: true,
    companyName: comp ? comp.name : 'Royal Cinema ERP Service',
    subscription: sub
  };
});

ipcMain.handle('subscription:update', async (_event, data) => {
  return backend.services.subscription.updateSubscription(null, data);
});

ipcMain.handle('user:list', async (_event, companyId) => {
  return backend.services.user.listUsers(companyId);
});

ipcMain.handle('user:add', async (_event, data) => {
  return backend.services.user.addUser(data);
});

ipcMain.handle('user:delete', async (_event, { userId }) => {
  return backend.services.user.deleteUser(userId);
});

ipcMain.handle('user:toggleStatus', async (_event, { userId }) => {
  return backend.services.user.toggleUserStatus(userId);
});

ipcMain.handle('demo:accounts', async () => {
  return backend.services.auth.getDemoAccounts();
});

ipcMain.handle('booking:confirm', async (_event, data) => {
  return backend.services.booking.confirmBooking(data);
});

// ═══════════════════════════════════════════════════════════
// ELECTRON WINDOW CREATION & LIFECYCLE
// ═══════════════════════════════════════════════════════════

function createWindow() {
  const win = new BrowserWindow({
    width: 1520,
    height: 980,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#f8f4f4',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(async () => {
  nativeTheme.themeSource = 'system';
  await backend.seedDefaultDataIfEmpty();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
