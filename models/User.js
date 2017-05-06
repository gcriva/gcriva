'use strict';

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const gstore = require('gstore-node');

const userSchema = new gstore.Schema({
  email: { type: 'string', validate: 'isEmail', required: true },
  password: { type: 'string', excludeFromIndexes: true },
  passwordResetToken: 'string',
  passwordResetExpires: 'datetime',
  name: { type: 'string', required: true },
  picture: 'string',
  gender: 'string',
  roles: { type: 'array', required: true },

  google: 'string',
  tokens: { type: 'array' },

  createdAt: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
  updatedAt: { type: 'datetime' }
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function preSave() {
  const user = this;

  if (user.email) {
    user.email = user.email.toLowerCase();
  }

  user.updatedAt = new Date();

  if (!user.password) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return reject(err);
      }

      bcrypt.hash(user.password, salt, null, (err, hash) => {
        if (err) {
          return reject(err);
        }

        user.password = hash;
        resolve();
      });
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = gstore.model('User', userSchema);

module.exports = User;
