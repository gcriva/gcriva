'use strict';

const request = require('supertest');
const Course = require('../../models/Course');

describe('courses controller', () => {
  let app;

  before(() => Course.deleteAll());

  afterEach(() => Course.deleteAll());

  beforeEach(() => {
    app = require('../../app.js');
  });

  it('/index: returns all courses ', () => (
    new Course({ name: 'name', startDate: '2017-06-01' }).save()
      .then(() => (
        request(app)
          .get('/courses')
          .expect(200)
      ))
      .then(res => res.body)
      .should.eventually.containSubset({
        courses: [
          { name: 'name', startDate: '2017-06-01' }
        ]
      })
  ));

  it('/show: shows the course', () => (
    new Course({ name: 'name', startDate: '2017-06-01' }).save()
      .then(course => (
        request(app)
          .get(`/courses/${course.entityKey.id}`)
          .expect(200)
          .then(res => res.body)
          .should.eventually.containSubset({
            course: { name: 'name', startDate: '2017-06-01' }
          })
      ))
  ));
  it('/show: returns 404 when course was not found', () => (
      request(app)
        .get('/courses/something')
        .expect(404)
  ));

  describe('/create', () => {
    it('validates course', done => {
      request(app)
        .post('/courses')
        .expect(422, {
          message: 'course is required'
        }, done);
    });

    it('creates a new course', done => {
      const course = { name: 'course!', startDate: '2017-06-01' };

      request(app)
        .post('/courses')
        .send({ course })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          res.body.course.should.containSubset(course);
          done();
        });
    });
  });

  describe('/update', () => {
    it('validates course', done => {
      request(app)
        .put('/courses/123')
        .expect(422, {
          message: 'course is required'
        }, done);
    });

    it('returns 404 when course was not found', () => (
      request(app)
        .put('/courses/blau')
        .send({ course: { name: 'name', startDate: '2017-06-01' } })
        .expect(404)
    ));

    it('updates the course and returns the updated entity', () => {
      const course = { name: 'anotherName' };
      const subject = new Course({ name: 'name', startDate: '2017-06-01' });

      return subject.save()
        .then(() => (
          request(app)
          .put(`/courses/${subject.entityKey.id}`)
          .send({ course })
          .expect(200)
        ))
        .then(res => res.body)
        .should.eventually.containSubset({
          course: { name: 'anotherName' }
        })
        .then(() => (
          Course.get(subject.entityKey.id).should.eventually.containSubset({
            name: 'anotherName'
          })
        ));
    });
  });

  describe('/delete', () => {
    it('returns 404 if course was not found', () => (
      request(app)
        .delete('/courses/blau')
        .expect(404)
    ));

    it('returns the deleted key', () => {
      const course = new Course({ name: 'someNadsdme', startDate: '2017-06-01' });

      return course.save()
        .then(() => (
          request(app).delete(`/courses/${course.entityKey.id}`).expect(200)
        ))
        .then(res => (
          res.body.should.containSubset({
            id: Number.parseInt(course.entityKey.id, 10)
          })
        ));
    });
  });
});
