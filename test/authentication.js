'use strict';

process.env.APP_PORT = 3594;
const request = require('supertest');
const app = require('../app.js');

const not401 = res => res.statusCode !== 401;

describe('endpoint authentication', () => {
  describe('whitelisted endpoints', () => {
    it('accepts /', done => {
      request(app)
        .get('/')
        .expect(200, done);
    });

    it('accepts /login', done => {
      request(app)
        .post('/login')
        .expect(not401)
        .end(done);
    });

    it('accepts /forgot', done => {
      request(app)
        .post('/forgot')
        .expect(not401)
        .end(done);
    });

    it('accepts /signup', done => {
      request(app)
        .post('/signup')
        .expect(not401)
        .end(done);
    });

    it('accepts /reset/:token', done => {
      request(app)
        .post('/reset/123')
        .expect(not401)
        .end(done);
    });
  });
});

// describe('GET /', () => {
//   it('should return 200 OK', (done) => {
//     request(app)
//       .get('/')
//       .expect(200, done);
//   });
// });

// describe('GET /login', () => {
//   it('should return 200 OK', (done) => {
//     request(app)
//       .get('/login')
//       .expect(200, done);
//   });
// });

// describe('GET /signup', () => {
//   it('should return 200 OK', (done) => {
//     request(app)
//       .get('/signup')
//       .expect(200, done);
//   });
// });

// describe('GET /api', () => {
//   it('should return 200 OK', (done) => {
//     request(app)
//       .get('/api')
//       .expect(200, done);
//   });
// });

// describe('GET /contact', () => {
//   it('should return 200 OK', (done) => {
//     request(app)
//       .get('/contact')
//       .expect(200, done);
//   });
// });

// describe('GET /random-url', () => {
//   it('should return 404', (done) => {
//     request(app)
//       .get('/reset')
//       .expect(404, done);
//   });
// });
