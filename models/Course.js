'use strict';

const gstore = require('gstore-node');
const { auditDelete, auditSave, setUpdatedAt } = require('./hooks');

const coursesSchema = new gstore.Schema({
  name: { type: 'string', required: true },
  startDate: { type: 'datetime', required: true },
  endDate: { type: 'datetime' },
  place: 'string',
  description: 'string',
  beneficiaries: 'array',

  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }
});

coursesSchema.pre('save', setUpdatedAt);
coursesSchema.post('delete', auditDelete);
coursesSchema.pre('save', auditSave);

const Course = gstore.model('Course', coursesSchema);

module.exports = Course;
