'use strict';

const Project = require('../../models/Project');
const datastore = require('../../config/datastore');

const auditProjectQuery = datastore.createQuery('auditProject');

function wipeData() {
  return Project.deleteAll()
    .then(() =>
      datastore.runQuery(datastore.createQuery('auditProject').select('__key__'))
    )
    .then(result => result[0].map(entity => entity[datastore.KEY]))
    .then(keys => datastore.delete(keys));
}

describe('Project Model', () => {
  describe('hooks', () => {
    before(wipeData);
    afterEach(wipeData);

    it('saves to audit when saving', () => (
      new Project({ name: 'project', startDate: '2017-05-06' }).save()
        .then(() => datastore.runQuery(auditProjectQuery))
        .then(result => {
          result[0].should.have.length(1);
          result[0][0].should.containSubset({
            auditOperation: 'insert',
            name: 'project',
            startDate: '2017-05-06'
          });
        })
    ));
  });
});
