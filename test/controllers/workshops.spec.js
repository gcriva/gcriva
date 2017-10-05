'use strict';

const request = require('supertest');
const Workshop = require('../../models/Workshop');

describe('workshops controller', () => {
  let app;
  const startDate = new Date().toISOString();

  before(() => Workshop.remove({}));

  afterEach(() => Workshop.remove({}));

  beforeEach(() => {
    app = require('../../app.js');
  });

  it('/index: returns all workshops ', () => (
    new Workshop({ name: 'name', startDate }).save()
      .then(() => (
        request(app)
          .get('/workshops')
          .expect(200)
      ))
      .then(res => res.body)
      .should.eventually.containSubset({
        workshops: [
          { name: 'name', startDate }
        ]
      })
  ));

  it('/show: shows the workshop', () => (
    new Workshop({ name: 'name', startDate }).save()
      .then(workshop => (
        request(app)
          .get(`/workshops/${workshop._id}`)
          .expect(200)
          .then(res => res.body)
          .should.eventually.containSubset({
            workshop: { name: 'name', startDate }
          })
      ))
  ));
  it('/show: returns 404 when workshop was not found', () => (
      request(app)
        .get('/workshops/597fc3faaafaaaaaaaaaaaa6')
        .expect(404)
  ));

  describe('/create', () => {
    it('validates workshop', done => {
      request(app)
        .post('/workshops')
        .expect(422, {
          message: 'workshop is required'
        }, done);
    });

    it('creates a new workshop', done => {
      const workshop = { name: 'workshop!', startDate };

      request(app)
        .post('/workshops')
        .send({ workshop })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          res.body.workshop.should.containSubset(workshop);
          done();
        });
    });
  });

  describe('/update', () => {
    it('validates workshop', done => {
      request(app)
        .put('/workshops/123')
        .expect(422, {
          message: 'workshop is required'
        }, done);
    });

    it('returns 404 when workshop was not found', () => (
      request(app)
        .put('/workshops/597fc3faaafaaaaaaaaaaaa6')
        .send({ workshop: { name: 'name', startDate } })
        .expect(404)
    ));

    it('updates the workshop and returns the updated entity', () => {
      const workshop = { name: 'anotherName' };
      const subject = new Workshop({ name: 'name', startDate });

      return subject.save()
        .then(() => (
          request(app)
          .put(`/workshops/${subject._id}`)
          .send({ workshop })
          .expect(200)
        ))
        .then(res => res.body)
        .should.eventually.containSubset({
          workshop: { name: 'anotherName' }
        })
        .then(() => (
          Workshop.findById(subject._id).should.eventually.containSubset({
            name: 'anotherName'
          })
        ));
    });
  });

  describe('/delete', () => {
    it('returns 404 if workshop was not found', () => (
      request(app)
        .delete('/workshops/597fc3faaafaaaaaaaaaaaa6')
        .expect(404)
    ));

    it('returns the deleted key', () => {
      const workshop = new Workshop({ name: 'someNadsdme', startDate });

      return workshop.save()
        .then(() => (
          request(app).delete(`/workshops/${workshop._id}`).expect(200)
        ))
        .then(res => (
          res.body.should.containSubset({
            id: workshop._id.toString()
          })
        ));
    });
  });
});
