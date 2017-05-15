'use strict';

const request = require('supertest');
const User = require('../../models/User');

describe('users controller', () => {
  let app;

  before(() => User.deleteAll());

  afterEach(() => User.deleteAll());

  beforeEach(() => {
    app = require('../../app.js');
  });

  it('/index: returns all the users ', () => (
    new User({ name: 'name', roles: ['admin'], email: 'aaa@aaa.com', password: '1234' }).save()
      .then(() => (
        request(app)
          .get('/users')
          .expect(200)
      ))
      .should.eventually.containSubset({
        body: {
          users: [
            { name: 'name', roles: ['admin'], email: 'aaa@aaa.com', password: '1234' }
          ]
        }
      })
  ));
});
