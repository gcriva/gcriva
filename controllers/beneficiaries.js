'use strict';

const Beneficiary = require('../models/Beneficiary');
const { forEachObjIndexed } = require('ramda');

exports.index = async (req, res) => {
  const beneficiaries = await Beneficiary.find().lean().exec();

  res.json({ beneficiaries });
};

exports.show = async (req, res) => {
  const beneficiary = await Beneficiary.findById(req.params.id)
    .populate('workshops')
    .lean()
    .exec();

  res.json({ beneficiary });
};

exports.create = async (req, res) => {
  req.checkBody('beneficiary', 'beneficiary is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const beneficiary = new Beneficiary(req.body.beneficiary);
  await beneficiary.save();
  res.json({ beneficiary: beneficiary.toObject() });
};

exports.update = async (req, res) => {
  req.checkBody('beneficiary', 'beneficiary is required').notEmpty();
  const errors = await req.getValidationResult();
  errors.throw();

  const beneficiary = await Beneficiary.findById(req.params.id);
  forEachObjIndexed((value, key) => {
    beneficiary[key] = value;
  }, req.body.beneficiary);
  await beneficiary.save();
  res.json({ beneficiary });
};

exports.delete = async (req, res) => {
  const beneficiary = await Beneficiary.findById(req.params.id);
  await beneficiary.remove();

  res.json({ id: beneficiary._id });
};
