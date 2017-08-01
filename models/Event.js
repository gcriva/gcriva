'use strict';

const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { isISO8601 } = require('./validations');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, validate: isISO8601, required: true },
  endDate: { type: Date },
  description: String,
  beneficiaries: Array,
}, { timestamps: true });

eventSchema.plugin(hooksPlugin);
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
