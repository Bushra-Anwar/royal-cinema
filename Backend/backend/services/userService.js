const crypto = require('node:crypto');
const { getUsers, saveUsers, getCompanies } = require('../database/db');
const { hashPassword } = require('./passwordService');

function listUsers(companyId) {
  const users = getUsers();
  const filtered = companyId ? users.filter(u => u.companyId === companyId) : users;
  return filtered.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    station: u.station,
    plainPassword: u.plainPassword,
    createdAt: u.createdAt,
    status: u.status
  }));
}

async function addUser(userData) {
  const { name, username, email, password, station, role, companyId } = userData;
  const stn = station || role || 'ticket';

  if (!name || !username || !email || !password) {
    return { ok: false, message: 'All fields are required.' };
  }

  const users = getUsers();
  const existing = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() ||
         u.email.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    return { ok: false, message: 'A staff user with that username or email already exists.' };
  }

  const companies = getCompanies();
  const cmpId = companyId || (companies[0] ? companies[0].id : 'cmp-primary');

  const { salt, hash } = await hashPassword(password);
  const newUser = {
    id: 'usr-' + crypto.randomBytes(4).toString('hex'),
    companyId: cmpId,
    name,
    username,
    email,
    salt,
    hash,
    plainPassword: password,
    station: stn, // 'ticket' or 'food'
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  users.push(newUser);
  saveUsers(users);

  return { ok: true, user: newUser };
}

function deleteUser(userId) {
  const users = getUsers();
  const next = users.filter(u => u.id !== userId && u.username !== userId);
  if (next.length === users.length) {
    return { ok: false, message: 'User not found' };
  }
  saveUsers(next);
  return { ok: true };
}

function toggleUserStatus(userId) {
  const users = getUsers();
  const u = users.find(x => x.id === userId || x.username === userId);
  if (!u) return { ok: false, message: 'User not found' };

  u.status = u.status === 'active' ? 'suspended' : 'active';
  saveUsers(users);
  return { ok: true, status: u.status };
}

module.exports = {
  listUsers,
  addUser,
  deleteUser,
  toggleUserStatus
};
