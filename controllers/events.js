'use strict';

const Event = require('../models/Event');
const { pick, forEachObjIndexed } = require('ramda');

const eventParams = pick(['name', 'startDate', 'endDate', 'description', 'beneficiaries']);

exports.index = async (req, res) => {
  const events = await Event.find().lean().exec();

  res.json({ events });
};

exports.show = async (req, res) => {
  const event = await Event.findById(req.params.id).lean().exec();

  res.json({ event });
};

exports.create = async (req, res) => {
  req.checkBody('event', 'event is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const event = new Event(eventParams(req.body.event));
  await event.save();
  res.json({ event });
};

exports.update = async (req, res) => {
  req.checkBody('event', 'event is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const event = await Event.findById(req.params.id);
  forEachObjIndexed((value, key) => {
    event[key] = value;
  }, eventParams(req.body.event));
  await event.save();
  res.json({ event });
};

exports.delete = async (req, res) => {
  const event = await Event.findById(req.params.id);
  await event.remove();
  res.json({ id: event._id });
};
