'use strict';

const { omit, curry, is, any, contains, __ } = require('ramda');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/User');
const locals = require('./locals');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: locals.appSecret
};

passport.serializeUser((user, done) => {
  done(null, user.plain().id);
});

passport.deserializeUser((id, done) => {
  User.get(id)
    .then(user => done(null, user.plain()))
    .catch(done);
});

/**
 * Sign In using JWT strategy
 */
passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  // If it's a valid and not expired jwt (handled by passport-jwt), the user is authenticated
  // therefore we just return the user data without iat and exp
  const user = omit(['iat', 'exp'], jwtPayload);
  done(null, user);
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

// TODO: make Google strategy work and remove flash
/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.get(req.user.id, (err, user) => {
          if (err) { return done(err); }
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.name = user.name || profile.displayName;
          user.gender = user.gender || profile._json.gender;
          user.picture = user.picture || profile._json.image.url;
          user.save((err) => {
            req.flash('info', { msg: 'Google account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
          done(err);
        } else {
          const user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.image.url;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

exports.authenticateEndpoint = (req, res, next) => {
  if (req.path === '/login') {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!user) {
      res.status(401).json({ message: 'Por favor, realize o login antes de continuar.' });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

function authorizeEndpoint(roles, req, res, next) {
  const desiredRoles = is(Array, roles) ? roles : [roles];
  const { user } = req;

  if (user.roles && any(contains(__, user.roles), desiredRoles)) {
    next();
  } else {
    res.status(403).json({ message: 'Usuário não possui permissão para acessar a funcionalidade.' });
  }
}

exports.authorizeEndpoint = curry(authorizeEndpoint);

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
