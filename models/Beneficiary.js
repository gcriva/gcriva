'use strict';

const gstore = require('gstore-node');
const { auditDelete, auditSave, setUpdatedAt } = require('./hooks');

const beneficiarySchema = new gstore.Schema({
  name: { type: 'string', required: true },
  childName: 'string',
  childNumber: 'string',
  birthDate: { type: 'datetime', required: true },
  grade: 'string',
  street: 'string',
  city: 'string',
  state: 'string',
  motherName: 'string',
  fatherName: 'string',
  guardianName: 'string',
  phoneNumbers: 'array',

  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }
});

beneficiarySchema.pre('save', setUpdatedAt);
beneficiarySchema.post('delete', auditDelete);
beneficiarySchema.pre('save', auditSave);

const Beneficiary = gstore.model('Beneficiary', beneficiarySchema);

module.exports = Beneficiary;
