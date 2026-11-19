const { getTickets, saveTickets, getCallRequests, saveCallRequests } = require('../database/db');

const SLA_TARGETS = {
  'Critical': '15 minutes',
  'High': '1 hour',
  'Medium': '4 business hours',
  'Low': '1 business day'
};

function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

function listTickets(companyName) {
  const all = getTickets();
  if (!companyName) return all;
  return all.filter(t => !t.companyName || t.companyName.toLowerCase().includes(companyName.toLowerCase()));
}

function createTicket(data) {
  const { companyName, branchName, branchId, category, subcategory, subject, description, priority, contactPreference } = data;
  if (!subject || !description) {
    return { ok: false, message: 'Subject and description are required.' };
  }

  const cleanSubject = sanitizeText(subject);
  const cleanDescription = sanitizeText(description);
  const cleanBranch = sanitizeText(branchName) || 'Main Branch';
  const cleanCompany = sanitizeText(companyName) || 'Royal Cinema Palanpur';

  const tickets = getTickets();
  const ticketId = 'RCERP-' + Math.floor(10000 + Math.random() * 90000);
  const prio = priority || 'Medium';

  const newTicket = {
    id: ticketId,
    companyName: cleanCompany,
    branchName: cleanBranch,
    branchId: branchId || 'br-default',
    category: category || 'Technical',
    subcategory: subcategory || 'Application issue',
    subject: cleanSubject,
    description: cleanDescription,
    priority: prio,
    status: 'Open',
    assignedTo: 'Support Engineering Queue',
    slaTarget: SLA_TARGETS[prio] || '4 hours',
    contactPreference: contactPreference || 'WhatsApp & Email',
    createdAt: new Date().toISOString(),
    messages: [
      {
        author: sanitizeText(data.author || data.requesterName) || 'Cinema Client',
        role: 'client',
        time: 'Just now',
        text: cleanDescription
      }
    ]
  };

  tickets.unshift(newTicket);
  saveTickets(tickets);

  return {
    ok: true,
    ticketId,
    message: `Ticket #${ticketId} created successfully! Our target response time for ${prio} priority is ${newTicket.slaTarget}.`,
    ticket: newTicket
  };
}

function replyToTicket(ticketId, messageText, author = 'Support Specialist', role = 'agent') {
  if (!messageText || !messageText.trim()) return { ok: false, message: 'Message text required' };

  const tickets = getTickets();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) return { ok: false, message: 'Ticket not found' };

  if (!Array.isArray(t.messages)) t.messages = [];
  t.messages.push({
    author,
    role,
    time: 'Just now',
    text: messageText.trim()
  });

  if (role === 'agent' && t.status === 'Open') {
    t.status = 'In Progress';
  }

  saveTickets(tickets);
  return { ok: true, ticket: t };
}

function updateTicketStatus(ticketId, status, priority, assignedTo) {
  const tickets = getTickets();
  const t = tickets.find(x => x.id === ticketId);
  if (!t) return { ok: false, message: 'Ticket not found' };

  if (status) t.status = status;
  if (priority) {
    t.priority = priority;
    t.slaTarget = SLA_TARGETS[priority] || t.slaTarget;
  }
  if (assignedTo) t.assignedTo = assignedTo;

  saveTickets(tickets);
  return { ok: true, ticket: t };
}

function requestCall(data) {
  const { name, phone, branch, reason, preferredDateTime, urgency } = data;
  if (!name || !phone) {
    return { ok: false, message: 'Name and contact phone are required for a callback.' };
  }

  const calls = getCallRequests();
  const callId = 'CALL-' + Math.floor(1000 + Math.random() * 9000);
  const newCall = {
    id: callId,
    name: name.trim(),
    phone: phone.trim(),
    branch: (branch || 'General').trim(),
    reason: (reason || 'Operational Assistance').trim(),
    preferredDateTime: preferredDateTime || 'As soon as possible',
    urgency: urgency || 'Medium',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  calls.unshift(newCall);
  saveCallRequests(calls);

  return {
    ok: true,
    callId,
    message: `Call request #${callId} registered. Our senior support engineer will call on ${phone}.`
  };
}

function listCallRequests() {
  return getCallRequests();
}

module.exports = {
  listTickets,
  createTicket,
  replyToTicket,
  updateTicketStatus,
  requestCall,
  listCallRequests
};
