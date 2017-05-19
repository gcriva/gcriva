'use strict';

const request = require('supertest');
const Project = require('../../models/Project');

describe('projects controller', () => {
  let app;

  before(() => Project.deleteAll());

  afterEach(() => Project.deleteAll());

  beforeEach(() => {
    app = require('../../app.js');
  });

  it('/index: returns all the projects ', () => (
    new Project({ name: 'name', startDate: '2017-05-04' }).save()
      .then(() => (
        request(app)
          .get('/projects')
          .expect(200)
      ))
      .then(res => res.body)
      .should.eventually.containSubset({
        projects: [
          { name: 'name', startDate: '2017-05-04' }
        ]
      })
  ));

  it('/show: shows the project', () => (
    new Project({ name: 'name', startDate: '2017-05-04' }).save()
      .then(project => (
        request(app)
          .get(`/projects/${project.entityKey.id}`)
          .expect(200)
          .then(res => res.body)
          .should.eventually.containSubset({
            project: { name: 'name', startDate: '2017-05-04' }
          })
      ))
  ));
  it('/show: returns 404 when project was not found', () => (
      request(app)
        .get('/projects/something')
        .expect(404)
  ));

  describe('/create', () => {
    it('validates project', done => {
      request(app)
        .post('/projects')
        .expect(422, {
          message: 'project is required'
        }, done);
    });

    it('creates a new project', done => {
      const project = { name: 'project!', startDate: '2017-05-05' };

      request(app)
        .post('/projects')
        .send({ project })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          res.body.project.should.containSubset(project);
          done();
        });
    });
  });

  describe('/update', () => {
    it('validates project', done => {
      request(app)
        .put('/projects/123')
        .expect(422, {
          message: 'project is required'
        }, done);
    });

    it('returns 404 when project was not found', () => (
      request(app)
        .put('/projects/blau')
        .send({ project: { name: 'name', startDate: '2017-05-05' } })
        .expect(404)
    ));

    it('updates the project and returns the updated entity', () => {
      const project = { name: 'anotherName' };
      const subject = new Project({ name: 'name', startDate: '2017-05-05' });

      return subject.save()
        .then(() => (
          request(app)
          .put(`/projects/${subject.entityKey.id}`)
          .send({ project })
          .expect(200)
        ))
        .then(res => res.body)
        .should.eventually.containSubset({
          project: { name: 'anotherName' }
        })
        .then(() => (
          Project.get(subject.entityKey.id).should.eventually.containSubset({
            name: 'anotherName'
          })
        ));
    });
  });

  describe('/delete', () => {
    it('returns 404 if project was not found', () => (
      request(app)
        .delete('/projects/blau')
        .expect(404)
    ));

    it('returns the deleted key', () => {
      const project = new Project({ name: 'someNadsdme', startDate: '2017-05-05' });

      return project.save()
        .then(() => (
          request(app).delete(`/projects/${project.entityKey.id}`).expect(200)
        ))
        .then(res => (
          res.body.should.containSubset({
            id: Number.parseInt(project.entityKey.id, 10)
          })
        ));
    });
  });
});
