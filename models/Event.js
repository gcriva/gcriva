'use strict';

const gstore = require('gstore-node');
const { auditDelete, auditSave, setUpdatedAt } = require('./hooks');

const eventsSchema = new gstore.Schema({
  name: { type: 'string', required: true },
  dateStart: { type: 'datetime', required: true },
  dateEnd: { type: 'datetime' },
  description: 'string',
  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }

});

eventsSchema.pre('save', function preSave() {
  const user = this;

  user.updatedAt = new Date();
  return Promise.resolve();
});

eventsSchema.pre('save', setUpdatedAt);
eventsSchema.post('delete', auditDelete);
eventsSchema.pre('save', auditSave);

const Events = gstore.model('Event', eventsSchema);

module.exports = Events;
