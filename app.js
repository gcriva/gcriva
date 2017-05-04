'use strict';

// Load environment variables from .env file, where API keys and passwords are configured.
require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const rollbar = require('rollbar');
const lusca = require('lusca');
const path = require('path');
const gstore = require('gstore-node');
const passport = require('passport');
const expressValidator = require('express-validator');
const multer = require('multer');

const authentication = require('./config/authentication');
const responseError = require('./utils/responseError');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');

const datastore = require('./config/datastore');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to Datastore
 */
gstore.connect(datastore);

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(responseError);
app.use(compression());
app.use(logger(process.env.NODE_ENV === 'development' ? 'dev' : 'short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(passport.initialize());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
// app.use(express.static(path.join(__dirname, 'public/dist'), { maxAge: 31557600000 }));

app.use(authentication.authenticate);

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.post('/login', userController.postLogin);
app.post('/forgot', userController.postForgot);
app.post('/reset/:token', userController.postReset);
app.post('/signup', userController.postSignup);
app.post('/account/password', userController.postUpdatePassword);
app.post('/account/delete', authentication.authorizeAdmin, userController.postDeleteAccount);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Stringify thrown errors
 */
app.use((error, req, res, next) => {
  next(JSON.stringify(error, null, 2));
});
if (process.env.NODE_ENV === 'production') {
  app.use(rollbar.errorHandler(process.env.ROLLBAR_TOKEN));
}


/**
 * Start Express server.
 */
app.listen(process.env.APP_PORT || '3000', () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
