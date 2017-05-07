'use strict';

const datastore = require('../config/datastore');
const { is } = require('ramda');

const isArray = is(Array);

exports.setUpdatedAt = function setUpdatedAt() {
  this.updatedAt = new Date();
  return Promise.resolve();
};

exports.auditSave = function auditSave() {
  const entity = this;
  const entityName = `audit${entity.entityKey.kind}`;
  const auditKey = datastore.key([entityName]);

  const auditData = {
    id: entity.entityKey.id,
    auditOperation: entity.entityKey.id ? 'update' : 'insert',
    auditTimestamp: Date.now(),
  };

  datastore.save({
    key: auditKey,
    data: Object.assign(auditData, entity.entityData)
  }, auditSaveHandler(entity.entityKey));

  return Promise.resolve();
};

exports.auditDelete = function auditDelete(response) {
  if (isArray(response.key)) {
    response.key.forEach(auditDeletedEntity);
  } else {
    auditDeletedEntity(response.key);
  }

  return Promise.resolve(response);
};

function auditDeletedEntity(key) {
  const entityName = `audit${key.kind}`;
  const auditKey = datastore.key([entityName]);

  datastore.save({
    key: auditKey,
    data: {
      id: key.id,
      auditOperation: 'delete',
      auditTimestamp: Date.now()
    }
  }, auditSaveHandler(key));
}

function auditSaveHandler(entityKey) {
  return err => {
    if (err) {
      throw new Error(`Error saving audit for ${entityKey.kind}: ${JSON.stringify(err)}`);
    }
  };
}
