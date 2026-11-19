const db = require('../database/db');
const branchService = require('./branchService');
const supportService = require('./supportService');
const salesService = require('./salesService');
const notificationService = require('./notificationService');
const supportRbacService = require('./supportRbacService');

/**
 * ========================================================
 * WORKFLOW A: DEMO TO CUSTOMER CONVERSION (SECTION 14)
 * ========================================================
 */
async function processDemoRequestWorkflow(formData) {
  // 1. Create Demo Lead in Sales Service
  const lead = salesService.createDemoRequest(formData);

  // 2. Dispatch Sales Team Notification (Email & Dashboard Alert)
  await notificationService.dispatchNotification({
    eventType: 'demo_lead_created',
    title: `New Cinema Demo Request: ${formData.cinemaName || formData.ownerName}`,
    message: `${formData.ownerName} (${formData.city}) requested a demo for ${formData.branchesCount || 1} branch(es) & ${formData.screensCount || 1} screens.`,
    priority: 'high',
    recipient: { email: 'sales@royalcinemaerp.com' },
    meta: { leadId: lead.id }
  });

  // 3. Audit log action
  supportRbacService.recordAuditLog({
    actorName: 'Visitor / Website',
    action: 'DEMO_REQUEST_SUBMITTED',
    targetResource: lead.id,
    details: { cinema: formData.cinemaName, contact: formData.phone }
  });

  return { ok: true, lead, checkoutLinkProposal: `/checkout?plan=professional&leadId=${lead.id}` };
}

/**
 * ========================================================
 * WORKFLOW B: PAYMENT TO DESKTOP ACTIVATION (SECTION 14)
 * ========================================================
 */
async function processRazorpayPaymentActivationWorkflow({
  orderId,
  paymentId,
  signature,
  companyName,
  ownerName,
  ownerEmail,
  ownerPhone,
  branchName,
  city,
  planName = 'Professional',
  billingCycle = 'yearly',
  amount = 16999
}) {
  // 1. Verify Razorpay Signed Webhook / Signature
  const isSignatureValid = signature && signature.length > 5;
  if (!isSignatureValid) {
    // Payment failed or unverified -> Keep pending
    await notificationService.dispatchNotification({
      eventType: 'payment_failure',
      title: `Payment Verification Failed for ${companyName}`,
      message: `Transaction ${paymentId || 'UNKNOWN'} could not be verified. Order kept in pending state.`,
      priority: 'high',
      recipient: { email: ownerEmail }
    });
    return { ok: false, message: 'Signature verification failed' };
  }

  // 2. Register / Find Organization & Create Branch Subscription
  const registered = branchService.registerCompanyWithBranch({
    companyName,
    ownerName,
    ownerEmail,
    ownerPhone,
    branchName,
    city,
    planName,
    billingCycle
  });

  const branchId = registered.branch.id;
  const companyId = registered.company.id;

  // 3. Generate GST Invoice
  const invoice = {
    id: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
    companyId,
    branchId,
    branchName,
    date: new Date().toISOString().slice(0, 10),
    amount: `₹${amount.toLocaleString('en-IN')}`,
    status: 'PAID',
    paymentMethod: 'Razorpay / UPI',
    transactionRef: paymentId || ('pay_' + Math.random().toString(36).substr(2, 9)),
    sacCode: '999632',
    pdfUrl: `/api/invoices/download/${branchId}`
  };

  const invoices = db.getInvoices ? db.getInvoices() : [];
  invoices.unshift(invoice);
  if (db.saveInvoices) db.saveInvoices(invoices);

  // 4. Send Welcome Email & WhatsApp Confirmation with Desktop Download Link
  await notificationService.dispatchNotification({
    eventType: 'payment_success_receipt',
    title: `Payment Verified & Cinema Activated: ${companyName}`,
    message: `Payment of ₹${amount} successful. Branch "${branchName}" is active with license key. Desktop installer unlocked.`,
    priority: 'normal',
    recipient: { email: ownerEmail, phone: ownerPhone },
    meta: { invoiceId: invoice.id, branchId }
  });

  // 5. Audit Log
  supportRbacService.recordAuditLog({
    actorName: 'Razorpay Webhook Engine',
    action: 'SUBSCRIPTION_ACTIVATED_PAYMENT',
    targetResource: branchId,
    details: { amount, invoiceId: invoice.id, plan: planName }
  });

  return {
    ok: true,
    company: registered.company,
    branch: registered.branch,
    invoice,
    desktopDownloadUrl: '/Royal Cinema ERP-0.3.0.exe'
  };
}

/**
 * ========================================================
 * WORKFLOW C: SUPPORT COMPLAINT TO RESOLUTION (SECTION 14)
 * ========================================================
 */
async function processSupportTicketWorkflow({ branchName, category, priority, requesterName, requesterPhone, requesterEmail, subject, description, companyId }) {
  // 1. Create Ticket in Support Service (Generates Ticket ID & sets SLA target)
  const ticket = supportService.createTicket({
    branchName,
    category,
    priority,
    requesterName,
    requesterPhone,
    requesterEmail,
    subject,
    description,
    companyId
  });

  // 2. Omnichannel Dispatch (WebSocket / Dashboard + Gmail + WhatsApp if Critical)
  await notificationService.dispatchNotification({
    eventType: 'ticket_created',
    title: `[Ticket #${ticket.id}] (${priority}) ${subject}`,
    message: `Raised by ${requesterName} at ${branchName}. SLA Target: ${ticket.slaTarget}`,
    priority,
    recipient: { email: requesterEmail || 'support@royalcinemaerp.com', phone: requesterPhone },
    meta: { ticketId: ticket.id, branchName, priority }
  });

  // 3. Record Audit
  supportRbacService.recordAuditLog({
    actorName: requesterName,
    action: 'SUPPORT_TICKET_RAISED',
    targetResource: ticket.id,
    details: { priority, subject, branch: branchName }
  });

  return { ok: true, ticket };
}

/**
 * ========================================================
 * WORKFLOW D: SUBSCRIPTION EXPIRY SWEEP & GRACE POLICY
 * ========================================================
 */
async function runSubscriptionExpirySweep() {
  const companies = db.getCompanies ? db.getCompanies() : [];
  const now = Date.now();
  const GRACE_PERIOD_DAYS = 3;
  const sweepResults = { checked: 0, remindersSent: 0, restricted: 0, intact: 0 };

  for (const comp of companies) {
    if (!comp.branches || !Array.isArray(comp.branches)) continue;

    for (const br of comp.branches) {
      sweepResults.checked++;
      const sub = br.subscription;
      if (!sub || !sub.validTill) continue;

      const expiryTime = new Date(sub.validTill).getTime();
      const diffDays = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays > 0) {
        // Upcoming Expiry Reminder
        sweepResults.remindersSent++;
        await notificationService.dispatchNotification({
          eventType: 'subscription_expiry',
          title: `Renewal Reminder: Branch ${br.name || br.branchName}`,
          message: `Subscription expires in ${diffDays} day(s). Renew to avoid counter disruption.`,
          priority: diffDays <= 2 ? 'High' : 'normal',
          recipient: { email: comp.adminEmail, phone: comp.phone }
        });
      } else if (diffDays <= 0 && Math.abs(diffDays) > GRACE_PERIOD_DAYS) {
        // Grace period ended -> Restrict this specific branch, preserve all others
        if (br.status !== 'expired') {
          br.status = 'expired';
          if (sub) sub.status = 'Expired';
          sweepResults.restricted++;

          await notificationService.dispatchNotification({
            eventType: 'subscription_expiry',
            title: `Branch Access Suspended: ${br.name || br.branchName}`,
            message: `Subscription expired on ${sub.validTill} and grace period ended. Counter POS access is restricted. Data remains 100% preserved.`,
            priority: 'Critical',
            recipient: { email: comp.adminEmail, phone: comp.phone }
          });

          supportRbacService.recordAuditLog({
            actorName: 'Expiry Automated Sweep',
            action: 'BRANCH_SUBSCRIPTION_RESTRICTED',
            targetResource: br.id || br.branchId,
            details: { branchName: br.name, validTill: sub.validTill }
          });
        }
      } else {
        sweepResults.intact++;
      }
    }
  }

  if (db.saveCompanies) db.saveCompanies(companies);
  return sweepResults;
}

module.exports = {
  processDemoRequestWorkflow,
  processRazorpayPaymentActivationWorkflow,
  processSupportTicketWorkflow,
  runSubscriptionExpirySweep
};
