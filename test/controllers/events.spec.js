'use strict';

const request = require('supertest');
const Event = require('../../models/Event');

describe('events controller', () => {
  let app;
  const startDate = new Date().toISOString();

  before(() => Event.remove({}));

  afterEach(() => Event.remove({}));

  beforeEach(() => {
    app = require('../../app.js');
  });

  it('/index: returns all events ', () => (
    new Event({ name: 'name', startDate }).save()
      .then(() => (
        request(app)
          .get('/events')
          .expect(200)
      ))
      .then(res => res.body)
      .should.eventually.containSubset({
        events: [
          { name: 'name', startDate }
        ]
      })
  ));

  it('/show: shows the event', () => (
    new Event({ name: 'name', startDate }).save()
      .then(event => (
        request(app)
          .get(`/events/${event._id}`)
          .expect(200)
          .then(res => res.body)
          .should.eventually.containSubset({
            event: { name: 'name', startDate }
          })
      ))
  ));
  it('/show: returns 404 when event was not found', () => (
      request(app)
        .get('/events/597fc3faaafaaaaaaaaaaaa6')
        .expect(404)
  ));

  describe('/create', () => {
    it('validates event', done => {
      request(app)
        .post('/events')
        .expect(422, {
          message: 'event is required'
        }, done);
    });

    it('creates a new event', done => {
      const event = { name: 'event!', startDate };

      request(app)
        .post('/events')
        .send({ event })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          res.body.event.should.containSubset(event);
          done();
        });
    });
  });

  describe('/update', () => {
    it('validates event', done => {
      request(app)
        .put('/events/123')
        .expect(422, {
          message: 'event is required'
        }, done);
    });

    it('returns 404 when event was not found', () => (
      request(app)
        .put('/events/597fc3faaafaaaaaaaaaaaa6')
        .send({ event: { name: 'name', startDate } })
        .expect(404)
    ));

    it('updates the event and returns the updated entity', () => {
      const event = { name: 'anotherName' };
      const subject = new Event({ name: 'name', startDate });

      return subject.save()
        .then(() => (
          request(app)
          .put(`/events/${subject._id}`)
          .send({ event })
          .expect(200)
        ))
        .then(res => res.body)
        .should.eventually.containSubset({
          event: { name: 'anotherName' }
        })
        .then(() => (
          Event.findById(subject._id).should.eventually.containSubset({
            name: 'anotherName'
          })
        ));
    });
  });

  describe('/delete', () => {
    it('returns 404 if event was not found', () => (
      request(app)
        .delete('/events/597fc3faaafaaaaaaaaaaaa6')
        .expect(404)
    ));

    it('returns the deleted key', () => {
      const event = new Event({ name: 'someNadsdme', startDate });

      return event.save()
        .then(() => (
          request(app).delete(`/events/${event._id}`).expect(200)
        ))
        .then(res => (
          res.body.should.containSubset({
            id: event._id.toString()
          })
        ));
    });
  });
});
