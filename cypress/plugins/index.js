const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const APP_ROOT = path.resolve(__dirname).split('/cypress')[0];

module.exports = (_, config) => {
  const env = dotenv.parse(fs.readFileSync(`${APP_ROOT}/.env`));
  config.env.clientId = env.AUTH_CLIENT_ID;
  config.env.clientSecret = env.AUTH_CLIENT_SECRET;
  config.env.accountId = env.AUTH_ACCOUNT_ID;
  return config;
};
