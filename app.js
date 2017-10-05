'use strict';

const locals = require('./config/locals');
const configureI18n = require('./config/i18n');
const bluebird = require('bluebird');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.Promise = bluebird;

const { is } = require('ramda');
const express = require('express');
require('express-async-errors');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const lusca = require('lusca');
const { NotFoundError } = require('./models/errors');
const passport = require('passport');
const expressValidator = require('express-validator');
const multer = require('multer');
const mongoose = require('mongoose');
const ValidatorError = require('mongoose/lib/error/validator');
const ValidationError = require('mongoose/lib/error/validation');

require('./config/cloudinary')();
const authentication = require('./config/authentication');
const responseError = require('./utils/responseError');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const usersController = require('./controllers/users');
const beneficiariesController = require('./controllers/beneficiaries');
const projectsController = require('./controllers/projects');
const eventsController = require('./controllers/events');
const workshopsController = require('./controllers/workshops');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB
 */
mongoose.Promise = bluebird;
mongoose.connect(locals.mongoUri, { useMongoClient: true });

/**
 * Express configuration.
 */
configureI18n(app);
if (process.env.NODE_ENV !== 'test') {
  app.use(logger(process.env.NODE_ENV === 'development' ? 'dev' : 'short'));
}
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Language, Content-Language, Content-Type, Authorization');

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});
app.use(compression());
app.use(bodyParser.json());
app.use(responseError);
app.use(expressValidator());
app.use(passport.initialize());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.use(authentication.authenticate);

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.post('/login', usersController.postLogin);
app.post('/forgot', usersController.postForgot);
app.post('/reset/:token', usersController.postReset);
app.post('/signup', authentication.authorizeAdmin, usersController.signup);
app.post('/account', usersController.postUpdateProfile);
app.post('/account/password', usersController.postUpdatePassword);
app.post('/account/image', multer().single('picture'), usersController.updatePicture);
app.get('/users', authentication.authorizeAdmin, usersController.index);
app.delete('/users/delete', authentication.authorizeAdmin, usersController.delete);
app.get('/beneficiaries', beneficiariesController.index);
app.post('/beneficiaries', beneficiariesController.create);
app.get('/beneficiaries/:id', beneficiariesController.show);
app.delete('/beneficiaries/:id', beneficiariesController.delete);
app.put('/beneficiaries/:id', beneficiariesController.update);
app.get('/projects', projectsController.index);
app.get('/projects/:id', projectsController.show);
app.post('/projects', authentication.authorizeAdmin, projectsController.create);
app.put('/projects/:id', authentication.authorizeAdmin, projectsController.update);
app.delete('/projects/:id', authentication.authorizeAdmin, projectsController.delete);
app.get('/events', eventsController.index);
app.get('/events/:id', eventsController.show);
app.post('/events', eventsController.create);
app.put('/events/:id', eventsController.update);
app.delete('/events/:id', eventsController.delete);
app.get('/workshops', workshopsController.index);
app.get('/workshops/:id', workshopsController.show);
app.post('/workshops', workshopsController.create);
app.put('/workshops/:id', workshopsController.update);
app.delete('/workshops/:id', workshopsController.delete);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});


const isNotFoundError = is(NotFoundError);
const isValidatorError = is(ValidatorError);
const isValidationError = is(ValidationError);

function handleModelErrors(error, req, res, next) {
  if (isValidatorError(error) || isValidationError(error) || error.array) {
    res.error(422, error.array ? error.array() : error.errors);
  } else if (isNotFoundError(error)) {
    res.error(404, error.errorCode ? res.t(error.errorCode, res.t('record')) : error.message);
  } else if (process.env.NODE_ENV === 'development') {
    // Show the entire error for debugging purposes
    console.error(error);
    res.error(500, error);
  } else {
    next(error);
  }
}
app.use(handleModelErrors);

module.exports = app;
