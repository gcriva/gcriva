'use strict';

const mongoose = require('mongoose');
const { NotFoundError } = require('./errors');

const models = {};

exports.hooksPlugin = schema => {
  schema.post('remove', auditDelete);
  schema.post('save', auditSave);
  schema.post('findOne', notFoundHandler);
};

exports.auditSave = auditSave;
exports.auditDelete = auditDelete;

function auditSave(document) {
  if (!document) return;
  const Model = getAuditModel(document.collection.name);

  const auditData = {
    id: document._id,
    auditOperation: 'save',
    auditTimestamp: Date.now(),
    data: document.toObject()
  };

  const model = new Model(auditData);
  model.save().catch(auditSaveHandler(document.collection.name));
}

function auditDelete(document) {
  const Model = getAuditModel(document.collection.name);

  const auditData = {
    id: document._id,
    auditOperation: 'delete',
    auditTimestamp: Date.now(),
    data: document.toObject()
  };

  const model = new Model(auditData);
  model.save().catch(auditSaveHandler(document.collection.name));
}

function auditSaveHandler(modelName) {
  return err => {
    throw new Error(`Error saving audit for model ${modelName}: ${JSON.stringify(err)}`);
  };
}

function notFoundHandler(res, next) {
  if (!res) {
    return next(new NotFoundError('Could not find the record'));
  }

  return next();
}

function getAuditModel(collectionName) {
  const name = `audit_${collectionName}`;
  if (!models[name]) {
    models[name] = mongoose.model(name, new mongoose.Schema({}, {
      strict: false, versionKey: false
    }));
  }

  return models[name];
}
