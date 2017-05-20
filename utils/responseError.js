'use strict';

const { curry, is } = require('ramda');

module.exports = function responseErrorMiddleware(req, res, next) {
  res.error = curry((statusCode, message) => {
    let response;

    if (is(Array, message)) {
      response = { message: message[0].msg ? message[0].msg : message };
    } else if (is(Object, message)) {
      const messageObj = is(Object, message.message) ? message.message : message;

      response = message.msg ? { message: message.msg } : messageObj;
    } else {
      response = { message };
    }

    res.status(statusCode).json(response);
  });

  next();
};
