'use strict';

const Workshop = require('../models/Workshop');
const { forEachObjIndexed } = require('ramda');

exports.index = async (req, res) => {
  const workshops = await Workshop.find().lean().exec();
  res.json({ workshops });
};

exports.show = async (req, res) => {
  const workshop = await Workshop.findById(req.params.id)
    .lean()
    .exec();

  res.json({ workshop });
};

exports.create = async (req, res) => {
  req.checkBody('workshop', 'workshop is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const workshop = new Workshop(req.body.workshop);
  await workshop.save();
  res.json({ workshop: workshop.toObject() });
};

exports.update = async (req, res) => {
  req.checkBody('workshop', 'workshop is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const workshop = await Workshop.findById(req.params.id);
  forEachObjIndexed((value, key) => {
    workshop[key] = value;
  }, req.body.workshop);
  await workshop.save();
  res.json({ workshop });
};

exports.delete = async (req, res) => {
  const workshop = await Workshop.findById(req.params.id);
  await workshop.remove();

  res.json({ id: workshop._id });
};
