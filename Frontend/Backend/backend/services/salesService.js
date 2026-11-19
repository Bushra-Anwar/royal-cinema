const { getDemoEnquiries, saveDemoEnquiries, getContactEnquiries, saveContactEnquiries } = require('../database/db');

function createDemoRequest(data) {
  const {
    ownerName,
    companyName,
    email,
    mobile,
    cityState,
    branchesCount,
    screensPerBranch,
    preferredDateTime,
    requirements
  } = data;

  if (!ownerName || !companyName || !mobile) {
    return {
      ok: false,
      message: 'Owner name, Cinema / Company name, and Mobile number are required.'
    };
  }

  const enquiryId = 'DEMO-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);
  const enquiries = getDemoEnquiries();

  const newEnquiry = {
    id: enquiryId,
    ownerName: ownerName.trim(),
    companyName: companyName.trim(),
    email: (email || '').trim(),
    mobile: mobile.trim(),
    cityState: (cityState || '').trim(),
    branchesCount: branchesCount || '1',
    screensPerBranch: screensPerBranch || '2 Screens',
    preferredDateTime: preferredDateTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    requirements: (requirements || '').trim(),
    status: 'Scheduled',
    source: 'Public SaaS Website',
    createdAt: new Date().toISOString()
  };

  enquiries.unshift(newEnquiry);
  saveDemoEnquiries(enquiries);

  return {
    ok: true,
    enquiryId,
    message: `Sales Enquiry ${enquiryId} generated successfully! Our enterprise cinema tech consultant will reach out via WhatsApp & call to confirm your live walkthrough.`,
    enquiry: newEnquiry
  };
}

function listDemoRequests() {
  return getDemoEnquiries();
}

function createContactMessage(data) {
  const { name, email, phone, cinemaName, message, topic } = data;
  if (!name || !email || !message) {
    return { ok: false, message: 'Name, email, and message are required.' };
  }

  const refId = 'MSG-' + Date.now().toString().slice(-6);
  const contacts = getContactEnquiries();
  const newMsg = {
    id: refId,
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    cinemaName: (cinemaName || '').trim(),
    topic: topic || 'Sales Enquiry',
    message: message.trim(),
    status: 'New',
    createdAt: new Date().toISOString()
  };

  contacts.unshift(newMsg);
  saveContactEnquiries(contacts);

  return {
    ok: true,
    refId,
    message: `Thank you for contacting Royal Cinema ERP. Your reference ID is ${refId}. Our team will reply within 2 business hours.`
  };
}

module.exports = {
  createDemoRequest,
  listDemoRequests,
  createContactMessage
};
