'use strict';

const gstore = require('gstore-node');
const { auditDelete, auditSave, setUpdatedAt } = require('./hooks');

const coursesSchema = new gstore.Schema({
  name: { type: 'string', required: true },
  dateStart: { type: 'datetime', required: true },
  dateEnd: { type: 'datetime' },
  place: 'string',
  description: 'string',
  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }
});

coursesSchema.pre('save', function preSave() {
  const user = this;

  user.updatedAt = new Date();
  return Promise.resolve();
});

coursesSchema.pre('save', setUpdatedAt);
coursesSchema.post('delete', auditDelete);
coursesSchema.pre('save', auditSave);

const Course = gstore.model('Course', coursesSchema);

module.exports = Course;
