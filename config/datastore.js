'use strict';

const datastoreConfig = require('@google-cloud/datastore');

const datastoreOptions = {
  projectId: process.env.GCLOUD_PROJECT
};

if (process.env.GOOGLE_CREDENTIALS) {
  datastoreOptions.credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64'));
}

const datastore = datastoreConfig(datastoreOptions);

module.exports = datastore;
