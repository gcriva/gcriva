'use strict';

const datastoreConfig = require('@google-cloud/datastore');

const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64'));

const datastore = datastoreConfig({
  projectId: process.env.GCLOUD_PROJECT,
  credentials
});

exports.credentials = credentials;

module.exports = datastore;
