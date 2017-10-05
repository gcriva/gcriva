'use strict';

const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { isISO8601 } = require('./validations');

const workshopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, validate: isISO8601, required: true },
  endDate: { type: Date },
  place: String,
  description: String
}, { timestamps: true });

workshopSchema.plugin(hooksPlugin);
const Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop;
