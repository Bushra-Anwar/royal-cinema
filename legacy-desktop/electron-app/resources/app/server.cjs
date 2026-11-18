const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const backend = require('./backend');

const PORT = backend.config.PORT || 3000;
const ROOT_DIR = backend.paths.ROOT_DIR;
const FRONTEND_DIR = backend.paths.FRONTEND_DIR || ROOT_DIR;

// Seed default company and staff users if not present
backend.seedDefaultDataIfEmpty();

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. API ROUTES (Delegated to Backend router)
  if (pathname.startsWith('/api/')) {
    try {
      await backend.router.handleApiRequest(req, res);
      return;
    } catch (err) {
      console.error('[Backend API Error]:', err);
      backend.router.sendJson(res, 500, { error: 'Internal Server Error' });
      return;
    }
  }

  // 2. STATIC FILE SERVING & ROUTE ALIASES
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const normalizedLower = safePath.replace(/\\/g, '/').toLowerCase();

  if (normalizedLower === '/' || normalizedLower === '') {
    safePath = '/index.html';
  } else if (
    normalizedLower === '/login' || normalizedLower === '/signin' || normalizedLower === '/erp'
  ) {
    safePath = '/index.html';
  } else if (
    normalizedLower === '/booking' || normalizedLower === '/movies' || normalizedLower === '/shows'
  ) {
    safePath = '/workspaces/customer-ticket-booking.html';
  } else if (
    normalizedLower === '/website' || normalizedLower === 'website' ||
    normalizedLower === '/saas' || normalizedLower === 'saas' ||
    normalizedLower === '/saas-website' || normalizedLower === 'saas-website'
  ) {
    safePath = '/saas-website.html';
  } else if (
    normalizedLower === '/checkout' || normalizedLower === 'checkout'
  ) {
    safePath = '/checkout.html';
  } else if (
    normalizedLower === '/portal' || normalizedLower === 'portal' ||
    normalizedLower === '/client-portal' || normalizedLower === 'client-portal'
  ) {
    safePath = '/client-portal.html';
  } else if (
    normalizedLower === '/admin' || normalizedLower === 'admin' ||
    normalizedLower === '/super-admin' || normalizedLower === 'super-admin'
  ) {
    safePath = '/super-admin-portal.html';
  } else if (
    normalizedLower === '/manager' || normalizedLower === '/command-center'
  ) {
    safePath = '/workspaces/city_lite_cinema_erp_command_center_role_login.html';
  } else if (
    normalizedLower === '/staff' || normalizedLower === '/counter' || normalizedLower === '/pos'
  ) {
    safePath = '/workspaces/city_lite_cinema_erp_multi_counter_role_login.html';
  } else if (
    normalizedLower === '/food' || normalizedLower === '/f&b' || normalizedLower === '/concessions' || normalizedLower === '/kitchen'
  ) {
    safePath = '/workspaces/city_lite_f_b_counter_pos_role_login.html';
  } else if (normalizedLower === '/favicon.ico') {
    safePath = '/favicon.svg';
  } else if (normalizedLower === '/robots.txt') {
    safePath = '/robots.txt';
  } else if (normalizedLower === '/sitemap.xml') {
    safePath = '/sitemap.xml';
  }

  let filePath = path.join(FRONTEND_DIR, safePath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT_DIR, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Royal Cinema ERP Web Server is running at http://localhost:${PORT}`);
});
