'use strict';

const request = require('supertest');
const app = require('../app.js');

const isAuthorided = res => res.statusCode !== 401 && res.statusCode !== 403;

describe('endpoint authentication', () => {
  describe('whitelisted endpoints', () => {
    it('accepts /', () => request(app).get('/').expect(200));

    it('accepts /login', () => request(app).post('/login').expect(isAuthorided));

    it('accepts /forgot', () => request(app).post('/forgot').expect(isAuthorided));

    it('accepts /signup', () => request(app).post('/signup').expect(isAuthorided));

    it('accepts /reset/:token', () => request(app).post('/reset/123').expect(isAuthorided));
  });
});
