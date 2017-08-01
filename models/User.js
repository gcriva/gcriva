'use strict';

const bcrypt = require('bcrypt-nodejs');
const { hooksPlugin } = require('./hooks');
const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  email: { type: String, validate: isEmail, index: true, required: true },
  password: { type: String },
  passwordResetToken: String,
  passwordResetExpires: Date,
  name: { type: String, required: true },
  picture: String,
  roles: { type: Array, required: true },

  google: String,
  tokens: { type: Array },
}, { timestamps: true });

userSchema.plugin(hooksPlugin);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function preSave(next) {
  const user = this;

  if (user.email) {
    user.email = user.email.toLowerCase();
  }

  next();
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

userSchema.methods.updatePassword = function updatePassword(newPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return reject(err);
      }

      bcrypt.hash(newPassword, salt, null, (err, hash) => {
        if (err) {
          return reject(err);
        }

        this.password = hash;
        resolve();
      });
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
