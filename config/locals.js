'use strict';

// Load environment variables from .env file, where API keys and passwords are configured.
const dotenv = require('dotenv');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const {
  MONGO_HOST,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_OPTIONS,
  APP_SECRET,
  NODE_ENV
} = process.env;
const databaseName = `gcriva_${NODE_ENV}`;
const mongoOptions = MONGO_OPTIONS ? `?${MONGO_OPTIONS}` : '';
const mongoPort = MONGO_PORT || 27017;
const auth = MONGO_USER && MONGO_PASSWORD ? `${MONGO_USER}:${MONGO_PASSWORD}@` : '';

module.exports = {
  appSecret: APP_SECRET || 'pikachu',
  mongoUri: `mongodb://${auth}${MONGO_HOST}:${mongoPort}/${databaseName}${mongoOptions}`
};
