'use strict';

const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { pick } = require('ramda');
const User = require('../models/User');
const locals = require('../config/locals');

// TODO: fix functions that use req.flash

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
          const userJwtData = pick(
            ['id', 'name', 'email', 'roles', 'picture'],
            user.plain()
          );
          const token = jwt.sign(userJwtData, locals.appSecret, {
            expiresIn: '7d'
          });

          res.json({ success: true, token });
        } else {
          res.error(422, {
            success: false,
            message: 'Falha na autenticação. Verifique se a senha foi digitada corretamente.'
          });
        }
      });
    })
    .catch(() => res.status(404).json({ success: false, message: 'Usuário não encontrado' }));
};

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

  User.findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(422).json({ success: false, message: 'Já existe um usuário com este email.' });
      }

      return user.save()
        .then(() => {
          req.logIn(user, err => {
            if (err) {
              return next(err);
            }

            res.json({ success: true, message: 'Usuário criado com sucesso!' });
          });
        });
    })
    .catch(next);
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
            .then(() => res.json({ message: 'Senha alterada com sucesso' }))
            .catch(next);
        } else {
          res.error(422, 'Falha na autenticação. Verifique se a senha atual foi digitada corretamente.');
        }
      });
    })
    .catch(res.error(404));
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
          res.error(422, 'O token de redefinição de senha expirou.');

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
    const mailOptions = {
      to: user.email,
      from: 'Sistema Gcriva <no-reply@gcriva.com>',
      subject: 'A sua senha no Sistema Gcriva foi alterada',
      text: `Olá ${user.name},\n\nEssa é uma confirmação de que a senha da sua conta ${user.email} foi alterada com sucesso.\n\nObrigado!`
    };
    return transporter.sendMail(mailOptions);
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => {
      res.json({
        success: true,
        message: 'Senha alterada com sucesso!'
      });
    })
    .catch(next);
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.error(422, { success: false, message: errors[0] });
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .catch(res.error(404))
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
    const mailOptions = {
      to: user.email,
      from: 'Sistema Gcriva <no-reply@gcriva.com>',
      subject: 'Redefinir sua senha no Gcriva',
      text: `Você está recebendo este email porquê você requisitou no sistema que sua senha fosse redefinida.\n\n
        Por favor clique nolink abaixo, ou o copie no seu navegador para completar o processo:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        Se você não requisitou a redefinição de senha, favor ignorar este email e sua senha continuará a mesma.\n\n
        Atenciosamente,\n\n
        Sistema Gcriva`
    };
    return transporter.sendMail(mailOptions);
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => {
      res.json({
        success: true,
        message: `Um email foi enviado a ${user.email} com as instruções de redefinição.`
      });
    })
    .catch(next);
};
