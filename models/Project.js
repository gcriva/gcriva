'use strict';

const gstore = require('gstore-node');

const projectSchema = new gstore.Schema({
  name: { type: 'string', required: true },
  startDate: { type: 'datetime', validate: 'isISO8601', required: true },
  endDate: { type: 'datetime', validate: 'isISO8601' },
  sponsorName: 'string',

  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }
});

projectSchema.pre('save', function preSave() {
  const project = this;

  project.updatedAt = new Date();

  return Promise.resolve();
});

const Project = gstore.model('Project', projectSchema);

module.exports = Project;
