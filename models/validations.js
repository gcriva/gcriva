'use strict';

const validator = require('validator');

exports.isISO8601 = value => validator.isISO8601(value.toISOString());
