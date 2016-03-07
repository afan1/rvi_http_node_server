'use strict';

var _ = require('lodash');
var errors = require('../lib/errors');
var accounts = require('../data/accounts');

var basicAuthRegex = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9\-\._~\+\/]+=*) *$/;

var exports = {};

/**
 * Authorization middleware using Basic Auth. The authorization header should be
 * in the form of:
 *
 *   Basic base64(username:password)
 *
 * This will set `req.vehicles` to an array of vehicles the given credentials
 * have access to.
 *
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
exports.basicAuthMiddleware = function(req, res, next) {
  // Check if an auth header was provided
  if (!_.has(req, 'headers.authorization')) {
    return next(new errors.AuthenticationError('Credentials not provided.'));
  }

  // Check if the auth header type is basic auth
  var match = basicAuthRegex.exec(req.headers.authorization);
  if (!match) {
    return next(
      new errors.AuthenticationError('Malformed auth header provided.'));
  }

  // base64 decode the credentials
  var credentials = new Buffer(match[1], 'base64').toString();

  // Check those credentials are valid
  if (!_.has(accounts, credentials)) {
    return next(
      new errors.AuthenticationError('Invalid credentials provided.'));
  }

  // Save the authorized vehicles for the credentials provided
  req.vehicles = accounts[credentials];
  return next();
};

/**
 * Sends the vehicles retrivied from `basicAuthMiddleware`.
 *
 * @param {Object} req HTTP request object
 * @param {Array} req.vehicles list of authorized vehicles
 * @param {Object} res HTTP response object
 */
exports.authorizedVehiclesMiddleware = function(req, res) {
  // TODO: Add real paging support
  return res.json({
    vehicles: req.vehicles,
    paging: {
      count: _.size(req.vehicles),
      offset: 0,
    },
  });
};

module.exports = exports;
