'use strict';

const Beneficiary = require('../models/Beneficiary');
const { pick } = require('ramda');

exports.beneficiaries = (req, res, next) => {
  Beneficiary.list()
    .then(response => {
      res.json({
        beneficiaries: response.entities
      });
    })
    .catch(next);
};

exports.create = (req, res, next) => {
  const beneficiary = new Beneficiary(pick(
      ['name', 'childName', 'birthDate', 'grade', 'street', 'city', 'state', 'motherName', 'fatherName', 'guardianName'],
      req.body.beneficiary
    ));
  beneficiary.save()
  .then(() => {
    res.json({ beneficiary: beneficiary.plain() });
  })
  .catch(next);
};

exports.update = (req, res, next) => {
  const beneficiary = pick(
    ['name', 'childName', 'birthDate', 'grade', 'street', 'city', 'state', 'motherName', 'fatherName', 'guardianName'],
    req.body.beneficiary
  );
  Beneficiary.update(req.params.id, beneficiary)
  .then((updatedBeneficiary) => {
    res.json({ beneficiary: updatedBeneficiary.plain() });
  })
  .catch(next);
};

exports.delete = (req, res, next) => {
  Beneficiary.delete(req.params.id)
    .then((response) => {
      if (response.success) {
        res.json({ id: response.key.id });
      } else {
        res.error(404, res.t('notFound', res.t('beneficiary')));
      }
    })
    .catch(next);
};
