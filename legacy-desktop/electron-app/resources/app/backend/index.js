const env = require('./config/env');
const paths = require('./config/paths');
const db = require('./database/db');
const { seedDefaultDataIfEmpty } = require('./database/seed');
const authService = require('./services/authService');
const companyService = require('./services/companyService');
const subscriptionService = require('./services/subscriptionService');
const userService = require('./services/userService');
const bookingService = require('./services/bookingService');
const passwordService = require('./services/passwordService');
const { handleApiRequest, sendJson, readBody } = require('./routes/apiRouter');

module.exports = {
  config: env,
  paths,
  db,
  seedDefaultDataIfEmpty,
  services: {
    auth: authService,
    company: companyService,
    subscription: subscriptionService,
    user: userService,
    booking: bookingService,
    password: passwordService
  },
  router: {
    handleApiRequest,
    sendJson,
    readBody
  }
};
