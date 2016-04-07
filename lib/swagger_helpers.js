'use strict';

var _ = require('lodash');
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');

var swaggerSchemaPath = path.join(__dirname,
  '../node_modules/rvi-http-api-spec/swagger.yaml');
var swaggerSchemaObject = yaml.load(fs.readFileSync(swaggerSchemaPath));

var exports = {};

/**
 * Returns the Swagger schema object.
 *
 * @return {Object} a Swagger schema object
 */
exports.getSchema = function() {
  return swaggerSchemaObject;
};

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
