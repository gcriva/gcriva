'use strict';

const bcrypt = require('bcrypt-nodejs');
const gstore = require('gstore-node');

const userSchema = new gstore.Schema({
  email: { type: 'string', validate: 'isEmail', required: true },
  password: { type: 'string', excludeFromIndexes: true },
  passwordResetToken: 'string',
  passwordResetExpires: 'datetime',
  name: { type: 'string', required: true },
  picture: 'string',
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

  return Promise.resolve();
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

const User = gstore.model('User', userSchema);

module.exports = User;
