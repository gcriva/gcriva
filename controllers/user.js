'use strict';

const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');
const { pick } = require('ramda');
const stream = require('stream');
const User = require('../models/User');
const locals = require('../config/locals');

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({ success: false, message: errors[0] });
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          const token = generateUserToken(user);

          res.json({ success: true, token });
        } else {
          res.error(422, { success: false, message: res.t('authFail') });
        }
      });
    })
    .catch(() => res.status(404).json({ success: false, message: 'Usuário não encontrado' }));
};

function generateUserToken(user) {
  const userJwtData = pick(
    ['id', 'name', 'email', 'roles', 'picture'],
    user.plain()
  );
  return jwt.sign(userJwtData, locals.appSecret, {
    expiresIn: '7d'
  });
}

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({ success: false, messages: errors });
  }

  const user = new User(pick(
    ['email', 'password', 'name', 'roles'],
    req.body
  ));

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (existingUser) {
      return res.status(422).json({ success: false, message: res.t('userAlreadyCreated') });
    }

    user.save()
      .then(() => {
        const token = generateUserToken(user);

        res.json({ success: true, message: res.t('userCreated'), token });
      })
      .catch(next);
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({ success: false, messages: errors });
  }

  User.get(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.name = req.body.name || '';
    user.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('currentPassword', 'currentPassword is required').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({ success: false, messages: errors });
  }

  User.get(req.user.id)
    .then(user => {
      user.comparePassword(req.body.currentPassword, (err, isMatch) => {
        if (isMatch && !err) {
          user.save()
            .then(() => res.json({ message: res.t('passwordReset.success') }))
            .catch(next);
        } else {
          res.error(422, res.t('authFail'));
        }
      });
    })
    .catch(next);
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.delete(req.body.id)
    .then(response => {
      if (!response.success) {
        res.error(404, 'Usuário não foi encontrado.');
      }
    })
    .catch(next);
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirmPassword', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(422).json({ success: false, messages: errors });
  }

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .then((user) => {
        if (user.passwordResetExpires < Date.now()) {
          res.error(422, res.t('passwordReset.expiredToken'));

          throw new Error(`O token de redefinição de senha expirou. email: ${user.email}`);
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save();
      });

  const sendResetPasswordEmail = (user) => {
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const { salutation, paragraphs } = buildConfirmationEmailParts(user, res);
    const paragraphTags = paragraphs.map(p => (p === ' ' ? '<br/>' : `<p>${p}</p>`));
    const mailOptions = {
      to: user.email,
      from: `${res.t('thisSystem')} <no-reply@gcriva.ml>`,
      subject: res.t('passwordReset.confirmationHeader'),
      text: `${salutation},\n\n${paragraphs.join('\n\n')}`,
      html: `<p>${salutation},</p>${paragraphTags.join('\n')}`
    };
    return transporter.sendMail(mailOptions);
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => {
      res.json({
        success: true,
        message: res.t('passwordReset.success')
      });
    })
    .catch(next);
};

function buildConfirmationEmailParts(user, res) {
  const salutation = res.t('greeting', user.name);
  const paragraphs = [
    res.t('passwordReset.confirmation', user.email),
    ' ',
    `${res.t('passwordReset.ending')},`,
    res.t('thisSystem')
  ];

  return { salutation, paragraphs };
}

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.error(422, { success: false, messages: errors });
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .catch(next)
      .then(user => {
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour

        return user.save();
      })
      .catch(next);

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    const transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const { salutation, paragraphs } = buildEmailParts(user, token, res);
    const paragraphTags = paragraphs.map(p => (p === ' ' ? '<br/>' : `<p>${p}</p>`));
    const mailOptions = {
      to: user.email,
      from: `${res.t('thisSystem')} <no-reply@gcriva.ml>`,
      subject: res.t('passwordReset.header'),
      text: `${salutation},\n\n${paragraphs.join('\n\n')}`,
      html: `<p>${salutation},</p>${paragraphTags.join('\n')}`
    };

    return transporter.sendMail(mailOptions)
      .then(() => {
        res.json({ success: true, message: res.t('passwordReset.emailSent', user.email) });
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .catch(next);
};

function buildEmailParts(user, token, res) {
  const salutation = res.t('greeting', user.name);
  const paragraphs = [
    ' ',
    res.t('passwordReset.emailExplanation'),
    res.t('passwordReset.clickResetLink'),
    `http://${process.env.CLIENT_URL}/#/reset-password/${token}`,
    res.t('passwordReset.disregardEmail'),
    ' ',
    `${res.t('passwordReset.ending')},`,
    res.t('thisSystem')
  ];

  return { salutation, paragraphs };
}

exports.updatePicture = (req, res, next) => {
  const cloudinaryUploadStream = cloudinary.uploader.upload_stream(result => {
    if (!result || result.error) {
      res.error(500, result.error.message);
    } else {
      User.update(req.user.id, { picture: result.secure_url })
        .then(user => {
          const newToken = generateUserToken(user);

          res.json({ picture: user.picture, token: newToken });
        })
        .catch(next);
    }
  });
  const bufferStream = new stream.PassThrough();

  bufferStream.end(req.file.buffer);
  bufferStream.pipe(cloudinaryUploadStream);
};
