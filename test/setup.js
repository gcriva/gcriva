'use strict';

const mockery = require('mockery');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiSubset);
chai.use(chaiAsPromised);

mockery.enable({
  warnOnUnregistered: false
});

const goToNextRoute = (req, res, next) => {
  req.user = {};
  next();
};

const authMock = {
  authenticate: goToNextRoute,
  authorize: goToNextRoute,
  authorizeAdmin: goToNextRoute
};

mockery.registerMock('./config/authentication', authMock);
