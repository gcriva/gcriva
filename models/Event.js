'use strict';

const gstore = require('gstore-node');
const { auditDelete, auditSave, setUpdatedAt } = require('./hooks');

const eventsSchema = new gstore.Schema({
  name: { type: 'string', required: true },
  startDate: { type: 'datetime', required: true },
  endDate: { type: 'datetime' },
  description: 'string',
  beneficiaries: 'array',

  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }

});

eventsSchema.pre('save', setUpdatedAt);
eventsSchema.post('delete', auditDelete);
eventsSchema.pre('save', auditSave);

const Event = gstore.model('Event', eventsSchema);

module.exports = Event;
