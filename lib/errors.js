'use strict';

var util = require('util');

var errors = {};

/**
 * A request validation error with status code 400.
 */
errors.ValidationError = function(message) {

  this.name = 'validation_error';
  this.statusCode = 400;
  this.message = message || 'Invalid or missing request parameters.';
  Error.captureStackTrace(this, this.constructor);

};
util.inherits(errors.ValidationError, Error);

/**
 * An authorization error with status code 401.
 */
errors.AuthenticationError = function(message) {

  this.name = 'authentication_error';
  this.statusCode = 401;
  this.message = message || 'Invalid or expired token provided.';
  Error.captureStackTrace(this, this.constructor);

};
util.inherits(errors.AuthenticationError, Error);

/**
 * A resource not found error with status code 404.
 */
errors.ResourceNotFoundError = function(message) {

  this.name = 'resource_not_found';
  this.statusCode = 404;
  this.message = message || 'The requested resource was not found.';
  Error.captureStackTrace(this, this.constructor);

};
util.inherits(errors.ResourceNotFoundError, Error);

/**
 * An internalserver error with status code 500.
 */
errors.InternalServerError = function(message) {

  this.name = 'server_error';
  this.statusCode = 500;
  this.message = message || 'Unexpected server error, please try again.';
  Error.captureStackTrace(this, this.constructor);

};
util.inherits(errors.InternalServerError, Error);

module.exports = errors;
