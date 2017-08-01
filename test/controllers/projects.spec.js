'use strict';

const request = require('supertest');
const Project = require('../../models/Project');

describe('projects controller', () => {
  let app;
  const startDate = new Date().toISOString();

  before(() => Project.remove({}));

  afterEach(() => Project.remove({}));

  beforeEach(() => {
    app = require('../../app.js');
  });


  it('/index: returns all the projects ', async () => {
    await new Project({ name: 'name', startDate }).save();
    const res = await request(app).get('/projects').expect(200);
    res.body.projects.should.containSubset([{
      name: 'name', startDate
    }]);
  });

  it('/show: shows the project', async () => {
    const project = await new Project({ name: 'name', startDate }).save();
    const res = await request(app).get(`/projects/${project._id}`).expect(200);
    res.body.project.should.containSubset({ name: 'name', startDate });
  });

  it('/show: returns 404 when project was not found', () => (
      request(app)
        .get('/projects/597fc3faaafaaaaaaaaaaaa6')
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
      const project = { name: 'project!', startDate };

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
        .put('/projects/597fc3faaafaaaaaaaaaaaa6')
        .send({ project: { name: 'name', startDate: '2017-05-05' } })
        .expect(404)
    ));

    it('updates the project and returns the updated entity', async () => {
      const project = { name: 'anotherName' };
      const subject = new Project({ name: 'name', startDate: '2017-05-05' });
      await subject.save();
      const res = await request(app).put(`/projects/${subject._id}`).send({ project }).expect(200);
      res.body.should.containSubset({
        project: { name: 'anotherName' }
      });
      const foundProject = await Project.findById(subject._id);
      foundProject.should.containSubset({ name: 'anotherName' });
    });
  });

  describe('/delete', () => {
    it('returns 404 if project was not found', () => (
      request(app)
        .delete('/projects/59805892eee12f2c87d40b13')
        .expect(404)
    ));

    it('returns the deleted key', () => {
      const project = new Project({ name: 'someNadsdme', startDate: '2017-05-05' });

      return project.save()
        .then(() => (
          request(app).delete(`/projects/${project._id}`).expect(200)
        ))
        .then(res => (
          res.body.should.containSubset({
            id: project._id.toString()
          })
        ));
    });
  });
});
