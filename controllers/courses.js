'use strict';

const Course = require('../models/Course');
const { pick } = require('ramda');

const courseParams = pick(['name', 'startDate', 'endDate', 'place', 'description', 'beneficiaries']);

exports.index = (req, res, next) => {
  Course.list()
    .then(response => {
      res.json({
        courses: response.entities
      });
    })
    .catch(next);
};

exports.show = (req, res, next) => {
  Course.get(req.params.id)
    .then(course => {
      res.json({ course: course.plain() });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  req.checkBody('course', 'course is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.error(422, errors);
  }

  const course = new Course(courseParams(req.body.course));
  course.save()
    .then(() => {
      res.json({ course: course.plain() });
    })
    .catch(next);
};

exports.update = (req, res, next) => {
  req.checkBody('course', 'course is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.error(422, errors);
  }

  const course = courseParams(req.body.course);
  Course.update(req.params.id, course)
    .then((updatedCourse) => {
      res.json({ course: updatedCourse.plain() });
    })
    .catch(next);
};

exports.delete = (req, res, next) => {
  Course.delete(req.params.id)
    .then((response) => {
      if (response.success) {
        res.json({ id: response.key.id });
      } else {
        res.error(404, 'Curso não foi encontrado');
      }
    })
    .catch(next);
};
