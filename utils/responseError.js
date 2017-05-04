'use strict';

const { curry, is } = require('ramda');

module.exports = function responseErrorMiddleware(req, res, next) {
  res.error = curry((statusCode, message) => {
    let response;

    if (is(Array, message)) {
      response = { messages: message };
    } else if (is(Object, message)) {
      response = message;
    } else {
      response = { message };
    }

    res.status(statusCode).json(response);
  });

  next();
};
