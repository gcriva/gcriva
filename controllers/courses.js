'use strict';

const Course = require('../models/Course');
const { forEachObjIndexed } = require('ramda');

exports.index = async (req, res) => {
  const courses = await Course.find().lean().exec();
  res.json({ courses });
};

exports.show = async (req, res) => {
  const course = await Course.findById(req.params.id).lean().exec();

  res.json({ course });
};

exports.create = async (req, res) => {
  req.checkBody('course', 'course is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const course = new Course(req.body.course);
  await course.save();
  res.json({ course: course.toObject() });
};

exports.update = async (req, res) => {
  req.checkBody('course', 'course is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const course = await Course.findById(req.params.id);
  forEachObjIndexed((value, key) => {
    course[key] = value;
  }, req.body.course);
  await course.save();
  res.json({ course });
};

exports.delete = async (req, res) => {
  const course = await Course.findById(req.params.id);
  await course.remove();

  res.json({ id: course._id });
};
