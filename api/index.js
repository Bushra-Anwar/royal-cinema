const path = require('path');
const backend = require('../Backend/backend');

// Ensure seed default data is populated if running on cold start
try {
  backend.seedDefaultDataIfEmpty();
} catch (e) {
  console.warn('[Vercel Seed Init Warning]:', e.message);
}

module.exports = async (req, res) => {
  // Handle CORS Preflight if any
  const origin = req.headers.origin || 'https://royalcinema.in';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    await backend.router.handleApiRequest(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Handler Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'Internal Server Error' }));
  }
};
