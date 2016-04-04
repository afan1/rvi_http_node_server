'use strict';

var _ = require('lodash');

var exports = {};

/**
 * Retrieves the Swagger schema path associated with the HTTP request. This
 * assumes that the request has been processed by the Swagger middleware first.
 *
 * @param {Object} req HTTP request object
 * @return {String} a Swagger schema path
 */
exports.getPath = function(req) {
  return _.get(req, 'swagger.apiPath');
};

/**
 * Retrieves the Swagger defined vehicle ID from the HTTP request. This assumes
 * that the request has been processed by the Swagger middleware first.
 *
 * @param {Object} req HTTP request object
 * @return {String} a vehicle ID (UUID v4)
 */
exports.getVehicleId = function(req) {
  return _.get(req, 'swagger.params.id.value');
};

module.exports = exports;
