const url = require('node:url');
const authService = require('../services/authService');
const companyService = require('../services/companyService');
const subscriptionService = require('../services/subscriptionService');
const userService = require('../services/userService');
const bookingService = require('../services/bookingService');
const salesService = require('../services/salesService');
const branchService = require('../services/branchService');
const supportService = require('../services/supportService');
const db = require('../database/db');
const notificationService = require('../services/notificationService');
const supportRbacService = require('../services/supportRbacService');
const workflowService = require('../services/workflowService');
const syncService = require('../services/syncService');
const roleRbacService = require('../services/roleRbacService');
const saasWebsiteService = require('../services/saasWebsiteService');
const saasBusinessService = require('../services/saasBusinessService');
const oauthService = require('../services/oauthService');
const env = require('../config/env');


function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const ct = (req.headers['content-type'] || '').toLowerCase();
        if (ct.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(body);
          const obj = {};
          for (const [k, v] of params.entries()) obj[k] = v;
          resolve(obj);
          return;
        }
        resolve(JSON.parse(body || '{}'));
      }
      catch { resolve({}); }
    });
  });
}

function resolveCorsOrigin(req) {
  const origin = req && req.headers ? req.headers.origin : null;
  const configured = env.CORS_ORIGIN || 'https://royalcinema.in';
  if (!origin) return configured;
  if (
    origin === configured ||
    origin === 'https://royalcinema.in' ||
    origin === 'https://www.royalcinema.in' ||
    origin === 'https://api.royalcinema.in' ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  ) {
    return origin;
  }
  return configured;
}

function sendJson(res, statusCode, data) {
  const allowOrigin = resolveCorsOrigin(res.req);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Role, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

async function handleApiRequest(req, res) {
  res.req = req;
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    const allowOrigin = resolveCorsOrigin(req);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, X-User-Role, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return true;
  }

  // RBAC Security Guard: Verify Role Boundaries
  const rawRole = req.headers['x-user-role'] || parsedUrl.query.userRole;
  if (rawRole) {
    const userRole = roleRbacService.normalizeRole(rawRole);
    // Food Provider: strictly concession counter operations only
    if (userRole === roleRbacService.ROLES.FOOD_PROVIDER) {
      const forbiddenPrefixes = ['/api/company', '/api/saas', '/api/client/branch', '/api/user/add', '/api/user/delete', '/api/user/all', '/api/subscription'];
      if (forbiddenPrefixes.some(p => pathname.startsWith(p))) {
        sendJson(res, 403, { ok: false, error: 'Forbidden: Food Provider has concession counter access only.' });
        return true;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // OAUTH 2.0 & OPENID CONNECT AUTHENTICATION (Google & Microsoft)
  // ═══════════════════════════════════════════════════════════

  // OAuth Config & Status Endpoint
  if (pathname === '/api/auth/oauth/config' && method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      google: {
        enabled: true,
        configured: oauthService.isGoogleConfigured()
      },
      microsoft: {
        enabled: true,
        configured: oauthService.isMicrosoftConfigured()
      }
    });
    return true;
  }

  // OAuth Start Endpoint (Google or Microsoft)
  if ((pathname === '/api/auth/oauth/google/start' || pathname === '/api/auth/oauth/microsoft/start') && method === 'GET') {
    const provider = pathname.includes('/google/') ? 'google' : 'microsoft';
    const redirectAfter = parsedUrl.query.redirect || '/index.html';
    const { state, nonce } = oauthService.createOAuthState(provider, redirectAfter);

    const isConfigured = provider === 'google' ? oauthService.isGoogleConfigured() : oauthService.isMicrosoftConfigured();

    if (isConfigured) {
      const authUrl = provider === 'google'
        ? oauthService.getGoogleAuthUrl(req, state, nonce)
        : oauthService.getMicrosoftAuthUrl(req, state, nonce);

      res.writeHead(302, {
        'Set-Cookie': `rc_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
        'Location': authUrl
      });
      res.end();
      return true;
    } else {
      // Developer / Sandbox simulation mode: render interactive account selection
      const html = oauthService.renderSandboxAuthPage(provider, state);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': `rc_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`
      });
      res.end(html);
      return true;
    }
  }

  // OAuth Callback Endpoint (Google or Microsoft) - handles both GET redirect and POST sandbox submission
  if ((pathname === '/api/auth/oauth/google/callback' || pathname === '/api/auth/oauth/microsoft/callback') && (method === 'GET' || method === 'POST')) {
    const provider = pathname.includes('/google/') ? 'google' : 'microsoft';
    const providerLabel = provider === 'google' ? 'Google' : 'Microsoft';
    const body = method === 'POST' ? await readBody(req) : {};
    const query = parsedUrl.query || {};

    // 1. Check for cancellation or provider error
    const errCode = query.error || body.error;
    if (errCode) {
      const errDesc = query.error_description || body.error_description || (errCode === 'access_denied' ? 'Sign-in was cancelled by user.' : errCode);
      res.writeHead(302, { 'Location': `/index.html?oauth_error=${encodeURIComponent(errDesc)}` });
      res.end();
      return true;
    }

    // 2. Validate OAuth state (CSRF defense)
    const state = query.state || body.state;
    const stateValidation = oauthService.validateAndConsumeState(state, provider);
    if (!stateValidation.valid) {
      res.writeHead(302, { 'Location': `/index.html?oauth_error=${encodeURIComponent(stateValidation.error || 'Security verification failed.')}` });
      res.end();
      return true;
    }

    let profile = null;
    let email = '';

    try {
      // 3. Obtain user identity: Sandbox vs Real OAuth Provider
      if (body.selected_email || body.custom_email) {
        email = String(body.selected_email || body.custom_email || '').trim().toLowerCase();
        profile = {
          provider,
          email,
          name: email.split('@')[0],
          emailVerified: true
        };
      } else if (query.code) {
        if (provider === 'google') {
          profile = await oauthService.exchangeGoogleCode(query.code, req);
        } else {
          profile = await oauthService.exchangeMicrosoftCode(query.code, req);
        }
        email = profile.email;
      } else {
        throw new Error('No authorization code or email provided in callback.');
      }

      // 4. Strict ERP Account Authorization & Role Verification
      const authResult = oauthService.resolveAuthorizedErpUser(email, provider, profile);

      if (!authResult.authorized) {
        // Access Denied: Account not pre-registered or inactive
        res.writeHead(302, {
          'Location': `/index.html?oauth_error=${encodeURIComponent(authResult.message)}`
        });
        res.end();
        return true;
      }

      // 5. Create secure session
      const session = oauthService.createSession(authResult.user, authResult.role, provider);

      // 6. Set secure session cookie & redirect with session token for frontend hydration
      res.writeHead(302, {
        'Set-Cookie': `rc_session=${session.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`,
        'Location': `/index.html?oauth_token=${session.token}&role=${authResult.role}`
      });
      res.end();
      return true;
    } catch (err) {
      console.error(`[${providerLabel} OAuth Error]:`, err.message);
      res.writeHead(302, {
        'Location': `/index.html?oauth_error=${encodeURIComponent(err.message || 'OAuth authentication failed.')}`
      });
      res.end();
      return true;
    }
  }

  // Active Session Hydration Endpoint
  if (pathname === '/api/auth/session' && method === 'GET') {
    const token = parsedUrl.query.token || (req.headers.cookie && req.headers.cookie.match(/rc_session=([a-f0-9]+)/)?.[1]) || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
    const session = oauthService.getSession(token);

    if (!session) {
      sendJson(res, 401, { ok: false, message: 'Invalid or expired session.' });
      return true;
    }

    sendJson(res, 200, {
      ok: true,
      user: session.user,
      role: session.role,
      provider: session.provider
    });
    return true;
  }

  // Logout / Terminate Session Endpoint
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const token = parsedUrl.query.token || (req.headers.cookie && req.headers.cookie.match(/rc_session=([a-f0-9]+)/)?.[1]);
    if (token) oauthService.destroySession(token);

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': 'rc_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
    });
    res.end(JSON.stringify({ ok: true, message: 'Logged out successfully.' }));
    return true;
  }

  // Account Linking Endpoint: Link Google or Microsoft email to existing ERP user
  if (pathname === '/api/auth/oauth/link' && method === 'POST') {
    const { identifier, provider, emailToLink } = await readBody(req);
    const result = oauthService.linkUserAccount(identifier, provider, emailToLink);
    sendJson(res, result.ok ? 200 : 400, result);
    return true;
  }

  // 1. Unified Auth Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { identifier, password } = await readBody(req);
    const result = await authService.authenticateUser(identifier, password);
    sendJson(res, 200, result);
    return true;
  }

  // 2. Onboard Company & Admin
  if (pathname === '/api/company/onboard' && method === 'POST') {
    const body = await readBody(req);
    const result = await companyService.onboardCompany(body);
    sendJson(res, 200, result);
    return true;
  }

  // 2b. Check Subscription Status (By Username / Email / Name)
  if (pathname === '/api/company/check-subscription' && method === 'GET') {
    const identifier = parsedUrl.query.identifier;
    const result = companyService.checkCompanySubscription(identifier);
    sendJson(res, 200, result);
    return true;
  }

  // 2c. Renew Direct Subscription
  if (pathname === '/api/company/renew-direct' && method === 'POST') {
    const body = await readBody(req);
    const result = companyService.renewDirectSubscription(body);
    sendJson(res, 200, result);
    return true;
  }

  // 3. List All Companies (Super Admin)
  if (pathname === '/api/company/list' && method === 'GET') {
    const list = companyService.getAllCompanies();
    sendJson(res, 200, list);
    return true;
  }

  // 4. Toggle Company Status (Super Admin Suspend/Activate)
  if (pathname === '/api/company/toggleStatus' && method === 'POST') {
    const { companyId } = await readBody(req);
    const result = companyService.toggleCompanyStatus(companyId);
    sendJson(res, 200, result);
    return true;
  }

  // 5. Renew Company Subscription
  if (pathname === '/api/company/renew' && method === 'POST') {
    const { companyId, renewData } = await readBody(req);
    const result = companyService.renewCompanySubscription(companyId, renewData);
    sendJson(res, 200, result);
    return true;
  }

  // 6. Get Subscription
  if (pathname === '/api/subscription/get' && method === 'GET') {
    const companyId = parsedUrl.query.companyId;
    const sub = subscriptionService.getSubscription(companyId);
    sendJson(res, 200, sub);
    return true;
  }

  // 7. Update Subscription
  if (pathname === '/api/subscription/update' && method === 'POST') {
    const body = await readBody(req);
    const result = subscriptionService.updateSubscription(null, body);
    sendJson(res, 200, result);
    return true;
  }

  // 8. User List
  if (pathname === '/api/user/list' && method === 'GET') {
    const companyId = parsedUrl.query.companyId;
    const list = userService.listUsers(companyId);
    sendJson(res, 200, list);
    return true;
  }

  // 9. Add User
  if (pathname === '/api/user/add' && method === 'POST') {
    const body = await readBody(req);
    const result = await userService.addUser(body);
    sendJson(res, 200, result);
    return true;
  }

  // 10. Delete User
  if (pathname === '/api/user/delete' && method === 'POST') {
    const { userId } = await readBody(req);
    const result = userService.deleteUser(userId);
    sendJson(res, 200, result);
    return true;
  }

  // 11. Toggle User Status
  if (pathname === '/api/user/toggleStatus' && method === 'POST') {
    const { userId } = await readBody(req);
    const result = userService.toggleUserStatus(userId);
    sendJson(res, 200, result);
    return true;
  }

  // 12. Booking Confirmation
  if (pathname === '/api/bookings/confirm' && method === 'POST') {
    const body = await readBody(req);
    const result = await bookingService.confirmBooking(body);
    sendJson(res, 200, result);
    return true;
  }

  // 13. Demo Accounts
  if (pathname === '/api/demo-accounts' && method === 'GET') {
    const accounts = authService.getDemoAccounts();
    sendJson(res, 200, accounts);
    return true;
  }

  // 14. Sales Demo Request (Public SaaS Website)
  if (pathname === '/api/sales/demo-request' && method === 'POST') {
    const body = await readBody(req);
    const result = salesService.createDemoRequest(body);
    sendJson(res, 200, result);
    return true;
  }

  // 15. List Sales Demo Requests (Super Admin)
  if (pathname === '/api/sales/demo-requests' && method === 'GET') {
    const list = salesService.listDemoRequests();
    sendJson(res, 200, list);
    return true;
  }

  // 16. Contact Message (Public SaaS Website)
  if (pathname === '/api/sales/contact' && method === 'POST') {
    const body = await readBody(req);
    const result = salesService.createContactMessage(body);
    sendJson(res, 200, result);
    return true;
  }

  // =========================================================================
  // MULTI-BRANCH SUBSCRIPTION & CLIENT PORTAL APIs
  // =========================================================================

  // 17. Get Company Branches
  if (pathname === '/api/client/branches' && method === 'GET') {
    const companyId = parsedUrl.query.companyId;
    const result = branchService.getCompanyBranches(companyId);
    sendJson(res, 200, result);
    return true;
  }

  // 18. Add Branch
  if (pathname === '/api/client/branch/add' && method === 'POST') {
    const body = await readBody(req);
    const companyId = body.companyId || parsedUrl.query.companyId;
    const result = branchService.addBranch(companyId, body);
    sendJson(res, 200, result);
    return true;
  }

  // 19. Renew Branch Subscription
  if (pathname === '/api/client/branch/renew' && method === 'POST') {
    const body = await readBody(req);
    const { companyId, branchId, renewData } = body;
    const result = branchService.renewBranchSubscription(companyId, branchId, renewData);
    sendJson(res, 200, result);
    return true;
  }

  // 20. Upgrade Branch Plan
  if (pathname === '/api/client/branch/upgrade' && method === 'POST') {
    const body = await readBody(req);
    const { companyId, branchId, newPlanName } = body;
    const result = branchService.upgradeBranchPlan(companyId, branchId, newPlanName);
    sendJson(res, 200, result);
    return true;
  }

  // 21. Check Branch Access & Subscription Status (Enforces Per-Branch Isolation)
  if (pathname === '/api/client/branch/check-access' && method === 'GET') {
    const companyId = parsedUrl.query.companyId;
    const branchId = parsedUrl.query.branchId;
    const result = branchService.checkBranchAccess(companyId, branchId);
    sendJson(res, 200, result);
    return true;
  }

  // 22. Invoices List
  if (pathname === '/api/client/invoices' && method === 'GET') {
    const list = db.getInvoices();
    sendJson(res, 200, list);
    return true;
  }

  // 23. Releases List
  if (pathname === '/api/client/releases' && method === 'GET') {
    const list = db.getReleases();
    sendJson(res, 200, list);
    return true;
  }

  // =========================================================================
  // SUPPORT TICKETS, CALL REQUESTS & LIVE CHAT APIs
  // =========================================================================

  // 24. List Tickets
  if (pathname === '/api/support/tickets' && method === 'GET') {
    const companyName = parsedUrl.query.companyName;
    const list = supportService.listTickets(companyName);
    sendJson(res, 200, { ok: true, tickets: list });
    return true;
  }

  // 25. Create Ticket
  if ((pathname === '/api/support/tickets' || pathname === '/api/support/ticket/create') && method === 'POST') {
    const body = await readBody(req);
    const result = supportService.createTicket(body);
    sendJson(res, 200, result);
    return true;
  }

  // 26. Reply to Ticket
  if (pathname === '/api/support/ticket/reply' && method === 'POST') {
    const body = await readBody(req);
    const { ticketId, text, message, replyMessage, author, role } = body;
    const msg = text || message || replyMessage;
    const result = supportService.replyToTicket(ticketId, msg, author, role);
    sendJson(res, 200, result);
    return true;
  }

  // 27. Update Ticket Status (Super Admin)
  if (pathname === '/api/support/ticket/status' && method === 'POST') {
    const body = await readBody(req);
    const { ticketId, status, priority, assignedTo } = body;
    const result = supportService.updateTicketStatus(ticketId, status, priority, assignedTo);
    sendJson(res, 200, result);
    return true;
  }

  // 28. Request Callback
  if (pathname === '/api/support/call-request' && method === 'POST') {
    const body = await readBody(req);
    const result = supportService.requestCall(body);
    sendJson(res, 200, result);
    return true;
  }

  // 29. List Callback Requests
  if (pathname === '/api/support/call-requests' && method === 'GET') {
    const list = supportService.listCallRequests();
    sendJson(res, 200, list);
    return true;
  }

  // 30. 4-Stage Checkout & Registration Endpoint
  if (pathname === '/api/checkout/register-checkout' && method === 'POST') {
    const body = await readBody(req);
    const {
      ownerName, email, mobile,
      companyName, branchName, screensCount,
      planName, billingCycle, gstin, address
    } = body;

    // Validate
    if (!ownerName || !email || !companyName || !branchName) {
      sendJson(res, 400, { ok: false, message: 'Owner name, email, company name, and first branch name are required.' });
      return true;
    }

    const orgId = 'org-' + Date.now().toString().slice(-6);
    const branchId = 'br-' + Date.now().toString().slice(-4);
    const selectedPlan = planName || 'Professional';
    const cycle = billingCycle || 'Yearly';

    const priceMap = {
      'Starter': { Monthly: '₹999', Yearly: '₹9,999', screens: 1, devices: 2 },
      'Professional': { Monthly: '₹1,699', Yearly: '₹16,999', screens: 2, devices: 4 },
      'Enterprise': { Monthly: '₹2,499', Yearly: '₹24,999', screens: 4, devices: 8 }
    };
    const pInfo = priceMap[selectedPlan] || priceMap['Professional'];
    const amount = pInfo[cycle];
    const durationDays = cycle === 'Yearly' ? 365 : 30;
    const validTill = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const newCompany = {
      id: orgId,
      name: companyName.trim(),
      type: 'cinema',
      adminUsername: email.trim(),
      adminEmail: email.trim(),
      plainPassword: 'Password@123',
      address: address || 'Main Road',
      phone: mobile || '',
      gstin: gstin || '24AAAPC1234H1ZV',
      status: 'active',
      createdAt: new Date().toISOString(),
      subscription: {
        planName: selectedPlan,
        billingCycle: cycle,
        amountPaid: amount,
        paidDate: new Date().toISOString().slice(0, 10),
        validTill: validTill,
        status: 'Active'
      },
      branches: [
        {
          id: branchId,
          name: branchName.trim(),
          city: (address || 'Palanpur').split(',')[0].trim(),
          state: 'Gujarat',
          screensCount: parseInt(screensCount) || pInfo.screens,
          screens: Array.from({ length: parseInt(screensCount) || pInfo.screens }, (_, i) => `Audi ${i + 1}`),
          branchAdmin: email.trim(),
          status: 'active',
          subscription: {
            planName: selectedPlan,
            billingCycle: cycle,
            amountPaid: amount,
            paidDate: new Date().toISOString().slice(0, 10),
            validTill: validTill,
            status: 'Active',
            devicesLimit: pInfo.devices
          },
          devices: [
            { id: 'dev-' + Math.floor(100 + Math.random() * 900), name: 'Box Office Counter 01', lastActive: 'Activated', status: 'Active' }
          ]
        }
      ]
    };

    const companies = db.getCompanies();
    companies.push(newCompany);
    db.saveCompanies(companies);

    // Generate Invoice
    const invoices = db.getInvoices();
    const invoiceNum = 'RC-INV-' + Date.now().toString().slice(-6);
    invoices.unshift({
      invoiceNumber: invoiceNum,
      companyName: newCompany.name,
      branchName: branchName.trim(),
      branchId: branchId,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: validTill,
      plan: `${selectedPlan} (${screensCount || pInfo.screens} Screens)`,
      cycle,
      total: parseFloat(amount.replace(/[^0-9.]/g, '')),
      status: 'Paid',
      paymentMethod: 'Instant Online Checkout (UPI / Card)',
      sacCode: '999632',
      gstin: gstin || '24AAAPC1234H1ZV'
    });
    db.saveInvoices(invoices);

    sendJson(res, 200, {
      ok: true,
      orgId,
      branchId,
      invoiceNumber: invoiceNum,
      company: newCompany,
      validTill,
      message: `Congratulations! ${companyName} (${branchName}) has been onboarded successfully under ${selectedPlan} plan!`
    });
    return true;
  }

  
  // 31. Notification Preferences (Section 10 Blueprint)
  if (pathname === '/api/notifications/preferences') {
    if (method === 'GET') {
      sendJson(res, 200, { ok: true, preferences: notificationService.getPreferences() });
      return true;
    }
    if (method === 'POST') {
      const body = await readBody(req);
      const updated = notificationService.updatePreferences(body);
      supportRbacService.recordAuditLog({
        actorName: 'Super Admin',
        action: 'NOTIFICATION_PREFERENCES_UPDATED',
        targetResource: 'system_preferences',
        details: body
      });
      sendJson(res, 200, { ok: true, preferences: updated });
      return true;
    }
  }

  // 32. In-App Notifications List (Section 10 Blueprint)
  if (pathname === '/api/notifications/list' && method === 'GET') {
    const notifications = db.getNotifications ? db.getNotifications() : [];
    sendJson(res, 200, { ok: true, notifications });
    return true;
  }

  // 33. SaaS Support Team Members & RBAC (Section 11 Blueprint)
  if (pathname === '/api/saas-staff/list' && method === 'GET') {
    const staff = supportRbacService.getStaffMembers();
    sendJson(res, 200, { ok: true, staff, roles: supportRbacService.SAAS_ROLES });
    return true;
  }

  // 34. Audit Logs (Section 11 Blueprint)
  if (pathname === '/api/audit-logs/list' && method === 'GET') {
    const logs = supportRbacService.getAuditLogs();
    sendJson(res, 200, { ok: true, logs });
    return true;
  }

  // 35. Workflow B: Razorpay Create Order Simulation
  if (pathname === '/api/workflows/razorpay/create-order' && method === 'POST') {
    const body = await readBody(req);
    const amountInPaise = (body.amount || 16999) * 100;
    const orderId = 'order_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    sendJson(res, 200, {
      ok: true,
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_live_cinema_production_dummy_key',
      companyName: body.companyName || 'Royal Cinema Group'
    });
    return true;
  }

  // 36. Workflow B: Razorpay Payment Verification & Activation
  if (pathname === '/api/workflows/razorpay/verify-payment' && method === 'POST') {
    const body = await readBody(req);
    const result = await workflowService.processRazorpayPaymentActivationWorkflow(body);
    sendJson(res, result.ok ? 200 : 400, result);
    return true;
  }

  // 37. Workflow D: Subscription Expiry Sweep & Grace Policy Execution
  if (pathname === '/api/workflows/subscription/expiry-sweep' && method === 'POST') {
    const result = await workflowService.runSubscriptionExpirySweep();
    sendJson(res, 200, { ok: true, result });
    return true;
  }

  
  // 38. Automatic Multi-Tenant Identity & Context Resolver (One Installer, Multi-Client)
  if (pathname === '/api/v1/tenants/resolve-context' && method === 'POST') {
    const body = await readBody(req);
    const companies = db.getCompanies ? db.getCompanies() : [];
    const users = db.getUsers ? db.getUsers() : [];
    const id = body.identifier || body.tenantId || body.email || body.username;
    const result = syncService.resolveTenantContext(id, companies, users);
    sendJson(res, result.ok ? 200 : 401, result);
    return true;
  }

  // 39. Offline Seat Lease Acquisition (Conflict Prevention)
  if (pathname === '/api/v1/sync/seat-lease' && method === 'POST') {
    const body = await readBody(req);
    const result = syncService.acquireSeatLease(body);
    sendJson(res, result.ok ? 200 : 409, result);
    return true;
  }

  // 40. Offline Transaction Journal Recording
  if (pathname === '/api/v1/sync/push-offline' && method === 'POST') {
    const body = await readBody(req);
    const result = syncService.recordOfflineBooking(body);
    sendJson(res, 200, result);
    return true;
  }

  // 41. Reconcile Offline Journal with Cloud Backend
  if (pathname === '/api/v1/sync/reconcile' && method === 'POST') {
    const result = syncService.reconcileOfflineJournal((booking) => {
      const bookings = db.getBookings ? db.getBookings() : [];
      bookings.unshift(booking);
      if (db.saveBookings) db.saveBookings(bookings);
    });
    sendJson(res, 200, result);
    return true;
  }

  // ===== 42. SaaS Owner / Service Provider Exclusive Endpoints =====
  
  // 42a. Get SaaS Website CMS Content
  if (pathname === '/api/saas/website/content' && method === 'GET') {
    const content = saasWebsiteService.getWebsiteContent();
    sendJson(res, 200, { ok: true, content });
    return true;
  }

  // 42b. Update SaaS Website CMS Content (Exclusive to SERVICE_PROVIDER)
  if (pathname === '/api/saas/website/content' && method === 'POST') {
    const role = roleRbacService.normalizeRole(req.headers['x-user-role'] || parsedUrl.query.userRole);
    if (role !== roleRbacService.ROLES.SERVICE_PROVIDER) {
      sendJson(res, 403, { ok: false, error: 'Forbidden: SaaS Service Provider / SaaS Owner role required to update website content.' });
      return true;
    }
    const body = await readBody(req);
    const updated = saasWebsiteService.updateWebsiteContent(body);
    sendJson(res, 200, { ok: true, content: updated });
    return true;
  }

  // 42c. Publish SaaS Website (Exclusive to SERVICE_PROVIDER)
  if (pathname === '/api/saas/website/publish' && method === 'POST') {
    const role = roleRbacService.normalizeRole(req.headers['x-user-role'] || parsedUrl.query.userRole);
    if (role !== roleRbacService.ROLES.SERVICE_PROVIDER) {
      sendJson(res, 403, { ok: false, error: 'Forbidden: SaaS Service Provider / SaaS Owner role required to publish website.' });
      return true;
    }
    const body = await readBody(req);
    const result = saasWebsiteService.setWebsitePublishedStatus(body.isPublished !== false, body.publishedBy || 'SaaS Owner');
    sendJson(res, 200, { ok: true, publication: result });
    return true;
  }

  // 42d. Get Advertisements
  if (pathname === '/api/saas/advertisements' && method === 'GET') {
    const ads = saasWebsiteService.getAdvertisements();
    sendJson(res, 200, { ok: true, advertisements: ads });
    return true;
  }

  // 42e. Create / Update Advertisement (Exclusive to SERVICE_PROVIDER)
  if (pathname === '/api/saas/advertisements' && method === 'POST') {
    const role = roleRbacService.normalizeRole(req.headers['x-user-role'] || parsedUrl.query.userRole);
    if (role !== roleRbacService.ROLES.SERVICE_PROVIDER) {
      sendJson(res, 403, { ok: false, error: 'Forbidden: SaaS Service Provider / SaaS Owner role required to manage advertisements.' });
      return true;
    }
    const body = await readBody(req);
    const result = saasWebsiteService.createAdvertisement(body);
    sendJson(res, 200, result);
    return true;
  }

  // 42f. Delete Advertisement (Exclusive to SERVICE_PROVIDER)
  if (pathname.startsWith('/api/saas/advertisements') && method === 'DELETE') {
    const role = roleRbacService.normalizeRole(req.headers['x-user-role'] || parsedUrl.query.userRole);
    if (role !== roleRbacService.ROLES.SERVICE_PROVIDER) {
      sendJson(res, 403, { ok: false, error: 'Forbidden: SaaS Service Provider / SaaS Owner role required to delete advertisements.' });
      return true;
    }
    const id = parsedUrl.query.id || pathname.split('/').pop();
    const result = saasWebsiteService.deleteAdvertisement(id);
    sendJson(res, 200, result);
    return true;
  }

  // 42g. SaaS Business Analytics (Exclusive to SERVICE_PROVIDER)
  if (pathname === '/api/saas/analytics' && method === 'GET') {
    const role = roleRbacService.normalizeRole(req.headers['x-user-role'] || parsedUrl.query.userRole);
    if (role !== roleRbacService.ROLES.SERVICE_PROVIDER) {
      sendJson(res, 403, { ok: false, error: 'Forbidden: SaaS Service Provider / SaaS Owner role required to access SaaS business analytics.' });
      return true;
    }
    const analytics = saasBusinessService.getSaaSBusinessAnalytics();
    sendJson(res, 200, { ok: true, analytics });
    return true;
  }

  // 42h. Allocate / Toggle Client Feature Packages (Exclusive to SERVICE_PROVIDER)
  if (pathname === '/api/saas/clients/features' && method === 'POST') {
    const role = roleRbacService.normalizeRole(req.headers['x-user-role'] || parsedUrl.query.userRole);
    if (role !== roleRbacService.ROLES.SERVICE_PROVIDER) {
      sendJson(res, 403, { ok: false, error: 'Forbidden: SaaS Service Provider / SaaS Owner role required to manage client feature packages.' });
      return true;
    }
    const body = await readBody(req);
    const result = saasBusinessService.updateCompanyFeatures(body.companyId, body.features);
    sendJson(res, result.ok ? 200 : 400, result);
    return true;
  }

  // ═══════════════════════════════════════════════════════════
  // QR FOOD MENU -> LIVE KITCHEN KDS ORDERS
  // ═══════════════════════════════════════════════════════════
  if (pathname === '/api/food-orders' && method === 'GET') {
    const fs = require('node:fs');
    const path = require('node:path');
    const pathsCfg = require('../config/paths');
    const ordersFile = path.join(pathsCfg.getDataDir(), 'qr_food_orders.json');
    let orders = [];
    try {
      if (fs.existsSync(ordersFile)) {
        orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8')) || [];
      }
    } catch { orders = []; }
    sendJson(res, 200, { ok: true, orders });
    return true;
  }

  if (pathname === '/api/food-orders' && method === 'POST') {
    const fs = require('node:fs');
    const path = require('node:path');
    const pathsCfg = require('../config/paths');
    const body = await readBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    const tableOrSeat = String(body.tableOrSeat || body.seat || 'Table 01').trim();
    if (items.length === 0) {
      sendJson(res, 400, { ok: false, error: 'Order must include at least one item.' });
      return true;
    }
    const ordersFile = path.join(pathsCfg.getDataDir(), 'qr_food_orders.json');
    let orders = [];
    try {
      if (fs.existsSync(ordersFile)) {
        orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8')) || [];
      }
    } catch { orders = []; }

    const kotNum = 1051 + orders.length;
    const totalAmt = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 1)), 0);
    const newOrder = {
      id: 'qr-' + Date.now(),
      kotId: `KOT #${kotNum}`,
      tableOrSeat,
      customerName: String(body.customerName || 'QR Guest').trim(),
      items: items.map(it => ({
        id: it.id,
        name: it.name,
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        label: `${Number(it.qty || 1)}x ${it.name}`
      })),
      totalAmt,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    if (orders.length > 50) orders = orders.slice(0, 50);
    try {
      fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    } catch (e) {
      console.error('[FOOD-ORDERS] Save error:', e.message);
    }
    sendJson(res, 200, { ok: true, order: newOrder });
    return true;
  }

  if (pathname === '/api/food-orders/complete' && method === 'POST') {
    const fs = require('node:fs');
    const path = require('node:path');
    const pathsCfg = require('../config/paths');
    const body = await readBody(req);
    const ordersFile = path.join(pathsCfg.getDataDir(), 'qr_food_orders.json');
    try {
      if (fs.existsSync(ordersFile)) {
        let orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8')) || [];
        orders = orders.filter(o => o.id !== body.id && o.kotId !== body.kotId);
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
      }
    } catch {}
    sendJson(res, 200, { ok: true });
    return true;
  }

  // Route not found
  sendJson(res, 404, { error: 'API route not found' });
  return true;
}

module.exports = {
  handleApiRequest,
  sendJson,
  readBody
};
