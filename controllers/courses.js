'use strict';

const Course = require('../models/Course');
const { pick } = require('ramda');

exports.course = (req, res, next) => {
  Course.list()
    .then(response => {
      res.json({
        course: response.entities
      });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  const course = new Course(pick(
      ['name', 'dateStar', 'dateEnd', 'place', 'description'],
      req.body.course
    ));
  course.save()
  .then(() => {
    res.json({ course: course.plain() });
  })
  .catch(next);
};

exports.update = (req, res, next) => {
  const course = pick(['name', 'childName', 'birthDate', 'grade', 'street', 'city', 'state', 'motherName', 'fatherName', 'guardianName'], req.body.beneficiary);
  Course.update(req.params.id, course)
  .then((updatedCourse) => {
    console.log(updatedCourse);
    res.json({ course: updatedCourse.plain() });
  })
  .catch(next);
};

exports.delete = (req, res, next) => {
  Course.delete(req.params.id)
  .then((response) => {
    if (response.success) {
      res.json({ key: response.key });
    } else {
      res.error(404, 'Curso não foi encontrado');
    }
  })
  .catch(next);
};
