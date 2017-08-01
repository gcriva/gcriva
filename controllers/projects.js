'use strict';

const { pick, forEachObjIndexed } = require('ramda');
const Project = require('../models/Project');

const projectParams = pick(['name', 'startDate', 'endDate', 'sponsorName', 'beneficiaries']);

exports.index = async (req, res) => {
  const projects = await Project.find().lean().exec();

  res.json({ projects });
};

exports.show = async (req, res) => {
  const project = await Project.findById(req.params.id).lean().exec();

  res.json({ project });
};

exports.create = async (req, res) => {
  req.checkBody('project', 'project is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const project = new Project(projectParams(req.body.project));

  await project.save();
  res.json({ project: project.toObject() });
};

exports.update = async (req, res) => {
  req.checkBody('project', 'project is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const project = await Project.findById(req.params.id);
  forEachObjIndexed((value, key) => {
    project[key] = value;
  }, projectParams(req.body.project));
  await project.save();
  res.json({ project: project.toObject() });
};

exports.delete = async (req, res) => {
  const project = await Project.findById(req.params.id);
  await project.remove();
  res.json({ id: project._id });
};
