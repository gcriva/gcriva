'use strict';

const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { isISO8601 } = require('./validations');

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  childName: String,
  childNumber: String,
  birthDate: { type: Date, validate: isISO8601, required: true },
  grade: String,
  street: String,
  city: String,
  state: String,
  motherName: String,
  fatherName: String,
  guardianName: String,
  phoneNumbers: Array,
}, { timestamps: true });

beneficiarySchema.plugin(hooksPlugin);
const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);

module.exports = Beneficiary;
