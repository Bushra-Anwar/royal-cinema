const https = require('node:https');
const crypto = require('node:crypto');
const url = require('node:url');
const env = require('../config/env');
const db = require('../database/db');
const { ROLES } = require('./roleRbacService');

// In-memory OAuth state and active session store
// In production or cluster environments, this can be backed by Redis or DB
const activeStates = new Map();
const activeSessions = new Map();

// Periodic cleanup of expired states and sessions (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of activeStates.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) {
      activeStates.delete(state);
    }
  }
  for (const [token, data] of activeSessions.entries()) {
    if (now > data.expiresAt) {
      activeSessions.delete(token);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate cryptographically secure state and nonce for OAuth 2.0 / OIDC
 */
function createOAuthState(provider, redirectAfterLogin = '/') {
  const state = crypto.randomBytes(32).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');

  activeStates.set(state, {
    provider,
    nonce,
    redirectAfterLogin,
    createdAt: Date.now()
  });

  return { state, nonce };
}

/**
 * Validate and consume OAuth state (one-time use, prevents CSRF)
 */
function validateAndConsumeState(state, provider) {
  if (!state || !activeStates.has(state)) {
    return { valid: false, error: 'State parameter is missing or expired (CSRF protection failed).' };
  }

  const entry = activeStates.get(state);
  activeStates.delete(state);

  if (entry.provider !== provider) {
    return { valid: false, error: `State provider mismatch: expected ${provider}, got ${entry.provider}.` };
  }

  if (Date.now() - entry.createdAt > 10 * 60 * 1000) {
    return { valid: false, error: 'OAuth session has timed out. Please try logging in again.' };
  }

  return { valid: true, stateData: entry };
}

/**
 * Helper to make HTTPS requests with JSON or form payloads
 */
function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Check if real Google OAuth credentials are configured
 */
function isGoogleConfigured() {
  const cid = (env.GOOGLE_CLIENT_ID || '').trim();
  const sec = (env.GOOGLE_CLIENT_SECRET || '').trim();
  return cid.length > 5 && sec.length > 5 && !cid.includes('YOUR_') && !sec.includes('YOUR_');
}

/**
 * Check if real Microsoft OAuth credentials are configured
 */
function isMicrosoftConfigured() {
  const cid = (env.MICROSOFT_CLIENT_ID || '').trim();
  const sec = (env.MICROSOFT_CLIENT_SECRET || '').trim();
  return cid.length > 5 && sec.length > 5 && !cid.includes('YOUR_') && !sec.includes('YOUR_');
}

/**
 * Build Google OAuth 2.0 / OpenID Connect authorization URL
 */
function getGoogleAuthUrl(req, state, nonce) {
  const baseUrl = env.APP_BASE_URL || (req ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}` : 'http://localhost:3000');
  const redirectUri = env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/oauth/google/callback`;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    nonce: nonce,
    prompt: 'select_account',
    access_type: 'online'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Build Microsoft Entra ID (OAuth 2.0 / OIDC) authorization URL
 */
function getMicrosoftAuthUrl(req, state, nonce) {
  const baseUrl = env.APP_BASE_URL || (req ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}` : 'http://localhost:3000');
  const redirectUri = env.MICROSOFT_REDIRECT_URI || `${baseUrl}/api/auth/oauth/microsoft/callback`;
  const tenant = env.MICROSOFT_TENANT_ID || 'common';

  const params = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email User.Read',
    state: state,
    nonce: nonce,
    response_mode: 'query',
    prompt: 'select_account'
  });

  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Exchange Google authorization code for tokens and fetch user profile
 */
async function exchangeGoogleCode(code, req) {
  const baseUrl = env.APP_BASE_URL || (req ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}` : 'http://localhost:3000');
  const redirectUri = env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/oauth/google/callback`;

  const postParams = new URLSearchParams({
    code: code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }).toString();

  const tokenRes = await httpsRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postParams)
    }
  }, postParams);

  if (tokenRes.status !== 200 || !tokenRes.data.access_token) {
    throw new Error(tokenRes.data.error_description || tokenRes.data.error || 'Failed to exchange Google OAuth code.');
  }

  const accessToken = tokenRes.data.access_token;

  // Retrieve verified user profile from Google UserInfo endpoint
  const userRes = await httpsRequest({
    hostname: 'www.googleapis.com',
    path: '/oauth2/v3/userinfo',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (userRes.status !== 200 || !userRes.data.email) {
    throw new Error('Failed to fetch verified user profile from Google.');
  }

  return {
    provider: 'google',
    id: userRes.data.sub,
    email: userRes.data.email.toLowerCase(),
    emailVerified: userRes.data.email_verified,
    name: userRes.data.name || userRes.data.email,
    picture: userRes.data.picture
  };
}

/**
 * Exchange Microsoft Entra ID authorization code for tokens and fetch user profile
 */
async function exchangeMicrosoftCode(code, req) {
  const baseUrl = env.APP_BASE_URL || (req ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}` : 'http://localhost:3000');
  const redirectUri = env.MICROSOFT_REDIRECT_URI || `${baseUrl}/api/auth/oauth/microsoft/callback`;
  const tenant = env.MICROSOFT_TENANT_ID || 'common';

  const postParams = new URLSearchParams({
    code: code,
    client_id: env.MICROSOFT_CLIENT_ID,
    client_secret: env.MICROSOFT_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }).toString();

  const tokenRes = await httpsRequest({
    hostname: 'login.microsoftonline.com',
    path: `/${tenant}/oauth2/v2.0/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postParams)
    }
  }, postParams);

  if (tokenRes.status !== 200 || !tokenRes.data.access_token) {
    throw new Error(tokenRes.data.error_description || tokenRes.data.error || 'Failed to exchange Microsoft OAuth code.');
  }

  const accessToken = tokenRes.data.access_token;

  // Fetch verified user profile via Microsoft Graph
  const graphRes = await httpsRequest({
    hostname: 'graph.microsoft.com',
    path: '/v1.0/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (graphRes.status !== 200 || (!graphRes.data.mail && !graphRes.data.userPrincipalName)) {
    throw new Error('Failed to fetch user profile from Microsoft Graph API.');
  }

  const email = (graphRes.data.mail || graphRes.data.userPrincipalName || '').toLowerCase();

  return {
    provider: 'microsoft',
    id: graphRes.data.id,
    email: email,
    emailVerified: true,
    name: graphRes.data.displayName || email
  };
}

/**
 * STRICT ERP ACCOUNT AUTHORIZATION & ROLE RESOLUTION
 *
 * Rules:
 * 1. Checks whether the authenticated email belongs to an existing pre-registered ERP user.
 * 2. Does NOT automatically register or grant roles to unknown emails.
 * 3. Assigns only the pre-existing role configured in the ERP database.
 * 4. Rejects deactivated or suspended accounts with a clear message.
 */
function resolveAuthorizedErpUser(email, provider, profile = {}) {
  const id = String(email || '').trim().toLowerCase();

  if (!id) {
    return {
      authorized: false,
      message: 'No email address was provided by the authentication provider.'
    };
  }

  const companies = db.getCompanies();
  const primaryCompany = companies[0] || {
    id: 'cmp-primary',
    name: 'Royal Cinema — Palanpur Flagship',
    subscription: {
      planName: 'Enterprise Cinema ERP & POS Cloud Service',
      status: 'Active'
    }
  };

  // 1. Check Service Provider / SaaS Owner Master Account
  const saEmail = (env.SUPER_ADMIN_EMAIL || 'superadmin@royalcinema.in').toLowerCase();
  if (id === saEmail || id === 'superadmin@royalcinema.in' || id === 'provider@royalcinema.in') {
    return {
      authorized: true,
      role: ROLES.SERVICE_PROVIDER,
      isSuperAdmin: true,
      isServiceProvider: true,
      user: {
        name: profile.name || 'SaaS Owner & Service Provider',
        email: saEmail,
        username: env.SUPER_ADMIN_USERNAME,
        role: ROLES.SERVICE_PROVIDER,
        isSuperAdmin: true,
        isServiceProvider: true,
        companyId: 'provider-root',
        companyName: 'Royal Cinema Cloud Platform',
        authProvider: provider,
        subscription: {
          planName: 'Cloud SaaS Provider Master License',
          status: 'Active'
        }
      }
    };
  }

  // 2. Check Unified General Manager Account
  const admEmail = (env.ADMIN_EMAIL || 'admin@royalcinema.in').toLowerCase();
  const primaryAdminEmail = (primaryCompany.adminEmail || '').toLowerCase();
  if (id === admEmail || id === primaryAdminEmail || id === 'manager@royalcinema.in') {
    return {
      authorized: true,
      role: ROLES.MANAGER,
      isSuperAdmin: false,
      isManager: true,
      user: {
        name: profile.name || 'Cinema General Manager',
        email: primaryCompany.adminEmail || admEmail,
        username: primaryCompany.adminUsername || env.ADMIN_USERNAME,
        role: ROLES.MANAGER,
        isSuperAdmin: false,
        isManager: true,
        companyId: primaryCompany.id,
        companyName: primaryCompany.name,
        authProvider: provider,
        subscription: primaryCompany.subscription
      }
    };
  }

  // 3. Check Cinema Client Managers in Database
  for (const cmp of companies) {
    const matchEmail = (cmp.adminEmail || '').toLowerCase() === id;
    const matchGoogle = (cmp.linkedOAuthGoogleEmail || '').toLowerCase() === id;
    const matchMicrosoft = (cmp.linkedOAuthMicrosoftEmail || '').toLowerCase() === id;

    if (matchEmail || matchGoogle || matchMicrosoft) {
      if (cmp.status && cmp.status !== 'active') {
        return {
          authorized: false,
          message: `Access Suspended: Cinema subscription for "${cmp.name}" is currently inactive or suspended. Please renew subscription to log in.`
        };
      }

      // Automatically record linked provider if not yet stored
      if (provider === 'google' && !cmp.linkedOAuthGoogleEmail) {
        cmp.linkedOAuthGoogleEmail = id;
        db.saveCompanies(companies);
      } else if (provider === 'microsoft' && !cmp.linkedOAuthMicrosoftEmail) {
        cmp.linkedOAuthMicrosoftEmail = id;
        db.saveCompanies(companies);
      }

      return {
        authorized: true,
        role: ROLES.MANAGER,
        isSuperAdmin: false,
        isManager: true,
        user: {
          name: profile.name || (cmp.name + ' Manager'),
          email: cmp.adminEmail,
          username: cmp.adminUsername,
          role: ROLES.MANAGER,
          isSuperAdmin: false,
          isManager: true,
          companyId: cmp.id,
          companyName: cmp.name,
          authProvider: provider,
          subscription: cmp.subscription
        }
      };
    }
  }

  // 4. Check Operational Staff & Food Providers in Database
  const users = db.getUsers();
  for (const usr of users) {
    const matchEmail = (usr.email || '').toLowerCase() === id || (id === 'food@royalcinema.in' && (usr.station === 'food' || usr.username === 'foodstaff'));
    const matchGoogle = (usr.linkedOAuthGoogleEmail || '').toLowerCase() === id;
    const matchMicrosoft = (usr.linkedOAuthMicrosoftEmail || '').toLowerCase() === id;

    if (matchEmail || matchGoogle || matchMicrosoft) {
      if (usr.status && usr.status !== 'active') {
        return {
          authorized: false,
          message: `Account Deactivated: Staff account for "${usr.name}" is currently deactivated. Please contact your manager.`
        };
      }

      const cmp = companies.find(c => c.id === usr.companyId) || primaryCompany;
      if (cmp.status && cmp.status !== 'active') {
        return {
          authorized: false,
          message: 'Access Denied: Cinema subscription is inactive. Counter stations are locked.'
        };
      }

      // Determine existing role
      const isFood = usr.station === 'food' || usr.role === 'food' || (usr.username || '').includes('food') || id === 'food@royalcinema.in';
      const isTicket = usr.station === 'ticket' || usr.role === 'ticket' || (usr.username || '').includes('ticket');
      const assignedRole = isFood ? ROLES.FOOD_PROVIDER : (isTicket ? 'COUNTER_STAFF' : ROLES.MANAGER);

      // Record linked provider
      if (provider === 'google' && !usr.linkedOAuthGoogleEmail) {
        usr.linkedOAuthGoogleEmail = id;
        db.saveUsers(users);
      } else if (provider === 'microsoft' && !usr.linkedOAuthMicrosoftEmail) {
        usr.linkedOAuthMicrosoftEmail = id;
        db.saveUsers(users);
      }

      return {
        authorized: true,
        role: assignedRole,
        isSuperAdmin: false,
        isFoodProvider: isFood,
        isCounterStaff: isTicket,
        user: {
          name: usr.name,
          email: usr.email,
          username: usr.username,
          role: assignedRole,
          station: usr.station,
          companyId: usr.companyId,
          companyName: cmp.name,
          authProvider: provider
        }
      };
    }
  }

  // 5. UNAUTHORIZED: Email does not belong to any pre-registered user
  const providerLabel = provider === 'google' ? 'Google' : 'Microsoft';
  return {
    authorized: false,
    message: `Access Denied: The ${providerLabel} account (${id}) is not registered or pre-authorized for Royal Cinema ERP. Role privileges cannot be assigned automatically. Please contact your Super Admin to add or link this account.`
  };
}

/**
 * Create a secure ERP session for an authorized user
 */
function createSession(user, role, provider) {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    token,
    user,
    role,
    provider,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24-hour expiration
  };

  activeSessions.set(token, sessionData);
  return sessionData;
}

/**
 * Validate an active session token
 */
function getSession(token) {
  if (!token || !activeSessions.has(token)) {
    return null;
  }

  const session = activeSessions.get(token);
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

/**
 * Destroy an active session (Logout)
 */
function destroySession(token) {
  if (token && activeSessions.has(token)) {
    activeSessions.delete(token);
    return true;
  }
  return false;
}

/**
 * Link an existing ERP user's account to a Google or Microsoft email
 */
function linkUserAccount(identifier, provider, emailToLink) {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanLinkEmail = String(emailToLink || '').trim().toLowerCase();

  if (!cleanId || !cleanLinkEmail) {
    return { ok: false, message: 'Valid user identifier and email to link are required.' };
  }

  const companies = db.getCompanies();
  for (const cmp of companies) {
    if ((cmp.adminUsername || '').toLowerCase() === cleanId || (cmp.adminEmail || '').toLowerCase() === cleanId) {
      if (provider === 'google') cmp.linkedOAuthGoogleEmail = cleanLinkEmail;
      else if (provider === 'microsoft') cmp.linkedOAuthMicrosoftEmail = cleanLinkEmail;
      db.saveCompanies(companies);
      return { ok: true, message: `Successfully linked ${provider} account (${cleanLinkEmail}) to Cinema Manager account.` };
    }
  }

  const users = db.getUsers();
  for (const usr of users) {
    if ((usr.username || '').toLowerCase() === cleanId || (usr.email || '').toLowerCase() === cleanId || usr.id === cleanId) {
      if (provider === 'google') usr.linkedOAuthGoogleEmail = cleanLinkEmail;
      else if (provider === 'microsoft') usr.linkedOAuthMicrosoftEmail = cleanLinkEmail;
      db.saveUsers(users);
      return { ok: true, message: `Successfully linked ${provider} account (${cleanLinkEmail}) to staff user "${usr.name}".` };
    }
  }

  return { ok: false, message: 'ERP user account not found.' };
}

/**
 * Render developer / sandbox authorization selection page
 * Shown when GOOGLE_CLIENT_ID or MICROSOFT_CLIENT_ID is not configured in .env
 */
function renderSandboxAuthPage(provider, state) {
  const isGoogle = provider === 'google';
  const providerTitle = isGoogle ? 'Google OAuth 2.0' : 'Microsoft Entra ID';
  const brandBg = isGoogle ? '#4285F4' : '#0078D4';
  const providerIconSvg = isGoogle
    ? `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 11.3 0 14s.7 5.2 1.9 7.6l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.2 7.5 23 12 23z"/></svg>`
    : `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>`;

  const registeredUsers = [
    { label: 'SaaS Owner / Super Admin', email: env.SUPER_ADMIN_EMAIL || 'superadmin@royalcinema.in', role: 'Super Admin' },
    { label: 'Cinema General Manager', email: env.ADMIN_EMAIL || 'admin@royalcinema.in', role: 'Manager' },
    { label: 'Client Cinema Admin', email: 'editinginstagram65@gmail.com', role: 'Manager' },
    { label: 'Box Office Ticketing Staff', email: 'ticket@gmail.com', role: 'Counter POS' },
    { label: 'Food Counter Staff', email: 'food@royalcinema.in', role: 'Food Provider' }
  ];

  const userCardsHtml = registeredUsers.map(u => `
    <button type="submit" name="selected_email" value="${u.email}" class="auth-acc-card">
      <div class="acc-avatar">${u.email.charAt(0).toUpperCase()}</div>
      <div class="acc-meta">
        <div class="acc-name">${u.label}</div>
        <div class="acc-email">${u.email}</div>
      </div>
      <span class="acc-badge">${u.role}</span>
    </button>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${providerTitle} — Choose an Account</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .oauth-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04);
      width: 100%;
      max-width: 480px;
      overflow: hidden;
    }
    .oauth-header {
      padding: 24px 28px 18px;
      border-b: 1px solid #f1f5f9;
      text-align: center;
    }
    .provider-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      margin-bottom: 12px;
    }
    .oauth-title {
      font-size: 19px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .oauth-sub {
      font-size: 13px;
      color: #64748b;
    }
    .oauth-banner {
      background: #eff6ff;
      border-top: 1px solid #dbeafe;
      border-bottom: 1px solid #dbeafe;
      padding: 10px 20px;
      font-size: 11.5px;
      color: #1e40af;
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .oauth-body {
      padding: 20px 24px 24px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .acc-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 18px;
    }
    .auth-acc-card {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 12px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .auth-acc-card:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }
    .acc-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #334155;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 14px;
      flex-shrink: 0;
    }
    .acc-meta {
      flex: 1;
      min-width: 0;
    }
    .acc-name {
      font-size: 13px;
      font-weight: 650;
      color: #0f172a;
    }
    .acc-email {
      font-size: 11.5px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .acc-badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      background: #f1f5f9;
      color: #475569;
      margin-left: 8px;
      flex-shrink: 0;
    }
    .custom-box {
      border-top: 1px dashed #e2e8f0;
      padding-top: 14px;
      margin-top: 10px;
    }
    .custom-input-row {
      display: flex;
      gap: 8px;
    }
    .custom-input {
      flex: 1;
      padding: 9px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 12.5px;
    }
    .custom-submit-btn {
      padding: 9px 16px;
      background: ${brandBg};
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .unauth-btn {
      display: block;
      width: 100%;
      margin-top: 10px;
      padding: 9px;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      color: #be123c;
      border-radius: 10px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
    }
    .unauth-btn:hover {
      background: #ffe4e6;
    }
    .cancel-row {
      text-align: center;
      margin-top: 16px;
    }
    .cancel-link {
      font-size: 12px;
      color: #64748b;
      text-decoration: none;
    }
    .cancel-link:hover {
      text-decoration: underline;
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div class="oauth-box">
    <div class="oauth-header">
      <div class="provider-icon">${providerIconSvg}</div>
      <h1 class="oauth-title">Sign in with ${providerTitle}</h1>
      <p class="oauth-sub">to continue to <strong>Royal Cinema ERP</strong></p>
    </div>

    <div class="oauth-banner">
      <span>ℹ️</span>
      <div>
        <strong>OAuth Simulation / Ready Mode:</strong> Real client credentials can be set in <code>resources/app/.env</code> (<code>GOOGLE_CLIENT_ID</code> / <code>MICROSOFT_CLIENT_ID</code>). Select an account below to test backend role verification and security access rules.
      </div>
    </div>

    <div class="oauth-body">
      <form method="POST" action="/api/auth/oauth/${provider}/callback">
        <input type="hidden" name="state" value="${state}">

        <div class="section-title">Pre-Registered ERP Accounts</div>
        <div class="acc-list">
          ${userCardsHtml}
        </div>

        <div class="section-title">Or Test Custom / Unauthorized Account</div>
        <div class="custom-input-row">
          <input type="email" name="custom_email" class="custom-input" placeholder="e.g. employee@company.com">
          <button type="submit" class="custom-submit-btn">Continue &rarr;</button>
        </div>

        <button type="submit" name="selected_email" value="unregistered.intruder@gmail.com" class="unauth-btn">
          🔒 Test Unauthorized Account (Verifies Access Denied Guard)
        </button>

        <div class="cancel-row">
          <a href="/index.html?oauth_error=User%20cancelled%20authentication" class="cancel-link">&larr; Cancel and return to ERP Login</a>
        </div>
      </form>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  createOAuthState,
  validateAndConsumeState,
  isGoogleConfigured,
  isMicrosoftConfigured,
  getGoogleAuthUrl,
  getMicrosoftAuthUrl,
  exchangeGoogleCode,
  exchangeMicrosoftCode,
  resolveAuthorizedErpUser,
  createSession,
  getSession,
  destroySession,
  linkUserAccount,
  renderSandboxAuthPage
};
