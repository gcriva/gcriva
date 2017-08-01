'use strict';

const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { isISO8601 } = require('./validations');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, validate: isISO8601, required: true },
  endDate: { type: Date },
  place: String,
  description: String,
  beneficiaries: Array,
}, { timestamps: true });

courseSchema.plugin(hooksPlugin);
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
