'use strict';

const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { merge } = require('ramda');
const { isISO8601 } = require('./validations');

const dateType = { type: Date, validate: isISO8601 };

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  childNumber: String,
  birthDate: merge(dateType, { required: true }),
  grade: String,
  street: String,
  city: String,
  state: String,
  motherName: String,
  fatherName: String,
  guardianName: String,
  phoneNumbers: Array,
  sponsorName: String,
  sponsorNationality: String,
  welcomeDate: dateType,
  exitDate: dateType,
  exitReason: String,
  workshops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' }],
  gender: String,
}, { timestamps: true });

beneficiarySchema.plugin(hooksPlugin);
const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);

module.exports = Beneficiary;
