'use strict';

var _ = require('lodash');
var errors = require('../lib/errors');

var handlers = {};

handlers.pathValidationErrorMiddleware = function(req, res, next) {
  if (_.has(req, 'swagger')) {
    return next();
  } else {
    return next(new errors.ResourceNotFoundError());
  }
};

handlers.swaggerValidationErrorMiddleware = function(err, req, res, next) {
  return next(new errors.ValidationError());
};

handlers.methodValidationErrorMiddleware = function(req, res, next) {
  if (_.has(req, ['swagger', 'path', req.method.toLowerCase()])) {
    return next();
  } else {
    return next(new errors.ValidationError());
  }
};

handlers.defaultMiddleware = function(req, res, next) {
  return next(new errors.ResourceNotFoundError());
};

handlers.defaultErrorMiddleware = function(err, req, res, next) {
  // jshint unused:false
  var defaultError = new errors.InternalServerError();

  var name = _.get(err, 'name', defaultError.name);
  var statusCode = _.get(err, 'statusCode', defaultError.statusCode);
  var message = _.get(err, 'message', defaultError.message);

  return res.status(statusCode).json({
    error: name,
    message: message,
  });

};

module.exports = handlers;
