const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('royalERP', {
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  onboardCompany: (data) => ipcRenderer.invoke('company:onboard', data),
  listCompanies: () => ipcRenderer.invoke('company:list'),
  toggleCompanyStatus: (companyId) => ipcRenderer.invoke('company:toggleStatus', { companyId }),
  renewCompany: (companyId, renewData) => ipcRenderer.invoke('company:renew', { companyId, renewData }),
  getSubscription: (companyId) => ipcRenderer.invoke('subscription:get', companyId),
  updateSubscription: (data) => ipcRenderer.invoke('subscription:update', data),
  listUsers: (companyId) => ipcRenderer.invoke('user:list', companyId),
  addUser: (data) => ipcRenderer.invoke('user:add', data),
  deleteUser: (data) => ipcRenderer.invoke('user:delete', data),
  toggleUserStatus: (data) => ipcRenderer.invoke('user:toggleStatus', data),
  getDemoAccounts: () => ipcRenderer.invoke('demo:accounts'),
  confirmBooking: (data) => ipcRenderer.invoke('booking:confirm', data)
});
