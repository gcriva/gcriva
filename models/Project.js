'use strict';

const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { isISO8601 } = require('./validations');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, validate: isISO8601, required: true },
  endDate: { type: Date, validate: isISO8601 },
  sponsorName: String,
  beneficiaries: Array,
}, { timestamps: true });

projectSchema.plugin(hooksPlugin);
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
