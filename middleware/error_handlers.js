'use strict';

var _ = require('lodash');
var errors = require('../lib/errors');

var handlers = {};

/**
 * Ensure the requested resource matched something in the Swagger schema. This
 * is intended to be placed right after all Swagger middleware.
 *
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
handlers.pathValidationErrorMiddleware = function(req, res, next) {
  if (_.has(req, 'swagger')) {
    return next();
  } else {
    return next(new errors.ResourceNotFoundError());
  }
};

/**
 * Swagger middleware error handler because the Swagger middlewares don't handle
 * errors. This is intended to be placed right after all Swagger middlewares.
 *
 * @param {Object} err HTTP error object
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
handlers.swaggerValidationErrorMiddleware = function(err, req, res, next) {
  return next(new errors.ValidationError());
};

/**
 * Ensure the requested resource can handle the given method. For example,
 * `/vehicles/{id}/odometer` is a valid resource but only supports the `GET`
 * method and not the `POST` or `DELETE` methods.
 *
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
handlers.methodValidationErrorMiddleware = function(req, res, next) {
  if (_.has(req, ['swagger', 'path', req.method.toLowerCase()])) {
    return next();
  } else {
    return next(new errors.ValidationError());
  }
};

/**
 * Default middleware to handle any request not processed by any middleware in
 * the application. This is intended to be place last in the middleware stack.
 *
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
handlers.defaultMiddleware = function(req, res, next) {
  return next(new errors.ResourceNotFoundError());
};

/**
 * Default error middleware to handle any errors thrown by other middleware in
 * the application. This is intended to be placed last in the middleware stack.
 *
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
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
