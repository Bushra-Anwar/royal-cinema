const fs = require('node:fs');
const path = require('node:path');

// Root directory is resources/app
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const FRONTEND_DIR = fs.existsSync(path.resolve(ROOT_DIR, '..', '..', '..', 'Frontend'))
  ? path.resolve(ROOT_DIR, '..', '..', '..', 'Frontend')
  : ROOT_DIR;

function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  const env = {};
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  } catch (err) {
    console.warn('[Env] Could not read .env file, using default credentials');
  }
  return env;
}

const ENV = loadEnv();

module.exports = {
  PORT: process.env.PORT || ENV.PORT || 3000,
  APP_NAME: process.env.APP_NAME || ENV.APP_NAME || 'Royal Cinema',
  APP_URL: process.env.APP_URL || ENV.APP_URL || 'https://royalcinema.in',
  FRONTEND_URL: process.env.FRONTEND_URL || ENV.FRONTEND_URL || 'https://royalcinema.in',
  API_BASE_URL: process.env.API_BASE_URL || ENV.API_BASE_URL || 'https://api.royalcinema.in',
  CORS_ORIGIN: process.env.CORS_ORIGIN || ENV.CORS_ORIGIN || 'https://royalcinema.in',
  SUPER_ADMIN_USERNAME: ENV.SUPER_ADMIN_USERNAME || 'superadmin',
  SUPER_ADMIN_EMAIL: (ENV.SUPER_ADMIN_EMAIL || 'superadmin@royalcinema.in').toLowerCase(),
  SUPER_ADMIN_PASSWORD: ENV.SUPER_ADMIN_PASSWORD || 'Royal@Super2026',
  ADMIN_USERNAME: ENV.ADMIN_USERNAME || 'admin',
  ADMIN_EMAIL: (ENV.ADMIN_EMAIL || 'admin@royalcinema.in').toLowerCase(),
  ADMIN_PASSWORD: ENV.ADMIN_PASSWORD || 'Admin@12345',
  APP_SECRET_KEY: ENV.APP_SECRET_KEY || 'royal-cinema-secret-key-2026',
  APP_BASE_URL: process.env.APP_BASE_URL || ENV.APP_BASE_URL || 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ENV.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || ENV.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || ENV.GOOGLE_REDIRECT_URI || '',
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || ENV.MICROSOFT_CLIENT_ID || '',
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || ENV.MICROSOFT_CLIENT_SECRET || '',
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID || ENV.MICROSOFT_TENANT_ID || 'common',
  MICROSOFT_REDIRECT_URI: process.env.MICROSOFT_REDIRECT_URI || ENV.MICROSOFT_REDIRECT_URI || '',
  ROOT_DIR,
  FRONTEND_DIR,
  reloadEnv: loadEnv
};
