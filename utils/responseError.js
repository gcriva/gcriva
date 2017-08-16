'use strict';

const { curry, is, values, contains } = require('ramda');

const translatedErrorKinds = ['required'];

module.exports = function responseErrorMiddleware(req, res, next) {
  res.error = curry((statusCode, message) => {
    let response;

    if (is(Array, message)) {
      response = { message: message[0].msg ? message[0].msg : (message[0].message || message) };
    } else if (is(Object, message)) {
      const messageObj = is(Object, message.message) ? message.message : message;

      response = message.msg ? { message: message.msg } : { errors: messageObj };
    } else {
      response = { message };
    }

    if (is(Object, response.errors)) {
      values(response.errors).forEach(error => {
        if (error.$isValidatorError && contains(error.kind, translatedErrorKinds)) {
          error.message = res.t(`validations.${error.kind}`);
        }
      });
    }

    res.status(statusCode).json(response);
  });

  next();
};
