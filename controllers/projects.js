'use strict';

const { pick } = require('ramda');
const Project = require('../models/Project');

const projectParams = pick(['name', 'startDate', 'endDate', 'sponsorName']);

exports.index = (req, res, next) => {
  Project.list()
    .then(response => {
      res.json({ projects: response.entities });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  req.checkBody('project', 'project is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.error(422, errors);
  }

  const project = new Project(projectParams(req.body.project));

  project.save()
    .then(() => {
      res.json({ project: project.plain() });
    })
    .catch(next);
};

exports.update = (req, res, next) => {
  req.checkBody('project', 'project is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.error(422, errors);
  }

  Project.update(req.params.id, projectParams(req.body.project))
    .then(project => {
      res.json({ project: project.plain() });
    })
    .catch(next);
};

exports.delete = (req, res, next) => {
  Project.delete(req.params.id)
    .then(response => {
      if (!response.success) {
        res.error(404, res.t('notFound', res.t('project')));
      } else {
        res.json({ id: response.key.id });
      }
    })
    .catch(next);
};
