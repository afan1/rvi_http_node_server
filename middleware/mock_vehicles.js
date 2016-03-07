'use strict';

var _ = require('lodash');
var errors = require('../lib/errors');
var mockVehicles = require('../data/mock-vehicles');

var exports = {};

/**
 * Handles all `GET` requests trying to retrieve mock vehicle data. This method
 * assumes that `req.vehicles` is set to be an array of all valid vehicles for
 * the given set of credentials. This also depends on the Swagger metadata
 * middleware.
 *
 * @param {Object} req HTTP request object
 * @param {String} req.swagger.apiPath Swagger schema endpoint
 * @param {String} req.swagger.params.id.value vehicle ID from the URL params
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
exports.getVehicleDataMiddleware = function(req, res, next) {
  var path = _.get(req, 'swagger.apiPath');
  var id = _.get(req, 'swagger.params.id.value');

  if (!_.includes(req.vehicles, id)) {
    return next(
      new errors.AuthenticationError('Unauthorized access for given vehicle.'));
  }

  if (!_.has(mockVehicles, [id, path])) {
    return next();
  }

  return res.json(mockVehicles[id][path]);
};

/**
 * Handles all `POST` requests trying to execute actions on a mock vehicle. This
 * method will not alter the mock vehicle state and will simply respond with a
 * success message. This also depends on the Swagger metadata middleware.
 *
 * @param {Object} req HTTP request object
 * @param {String} req.swagger.params.id.value vehicle ID from the URL params
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
exports.postVehicleActionsMiddleware = function(req, res, next) {
  var id = _.get(req, 'swagger.params.id.value');

  if (!_.includes(req.vehicles, id)) {
    return next(
      new errors.AuthenticationError('Unauthorized access for given vehicle.'));
  }

  if (!_.has(mockVehicles, id)) {
    return next();
  }

  return res.json({ status: 'success' });
};

module.exports = exports;
