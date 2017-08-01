'use strict';

class NotFoundError extends Error {
  constructor(message, model) {
    super(message);
    this.errorCode = 'notFound';
    this.model = model;
  }
}

exports.NotFoundError = NotFoundError;
