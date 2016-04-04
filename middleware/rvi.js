'use strict';

var _ = require('lodash');
var errors = require('../lib/errors');
var swaggerHelpers = require('../lib/swagger_helpers');
var uuid = require('uuid');
var RVI = require('rvi');

var HOST = process.env.RVI_HOST || 'localhost';
var PORT = process.env.RVI_PORT || '5000';
var rvi = new RVI(HOST + ':' + PORT);

// RVI request timeout in milliseconds
var TIMEOUT = 30000;

// Pending RVI requests message queue
//   transactionId -> HTTP request object
var PENDING = {};

var exports = {};

/**
 * Pops a transaction from the pending requests map and returns the removed
 * element.
 *
 * @param {String} transactionId a UUID v4 representing an RVI request
 * @return {Object} the original HTTP request object
 */
var popPendingRequest = function(transactionId) {
  var result = _.get(PENDING, transactionId);
  delete PENDING[transactionId];
  return result;
};

/**
 * Registers all non-authentication endpoints with the RVI client.
 *
 * @param {Object} schema a full Swagger schema object
 */
exports.registerEndpoints = function(schema) {
  _(schema.paths)
    .keys()
    .forEach(function(endpoint) {
      // Extract only the relative portion of the endpoint path
      var rviEndpoint = endpoint.replace(/\/vehicles\/{id}\/?/, '/');

      // If a replacement occurred then the endpoint is a non-authentication
      // related endpoint
      if (rviEndpoint !== endpoint) {
        rvi.registerService(rviEndpoint, function(paramters) {
          var transactionId = _.get(paramters, 'transactionId');
          var data = _.get(paramters, 'data');

          // Remove the pending request from the queue and send back a valid
          // response; otherwise consider this a noop
          var pendingRequest = popPendingRequest(transactionId);
          if (!_.isUndefined(pendingRequest) && !_.isUndefined(data)) {
            return pendingRequest.json(data);
          }
        });
      }
    });
};

/**
 * Handles all RVI client requests. Uses a message queue like system to handle
 * responses from the RVI client including a static timeout.
 *
 * @param {Object} req HTTP request object
 * @param {Object} res HTTP response object
 * @param {Function} next callback to invoke the next middleware in the stack
 */
exports.rviMiddleware = function(req, res, next) {
  var path = swaggerHelpers.getPath(req);
  var vehicleId = swaggerHelpers.getVehicleId(req);

  // Resolve the ID placeholder with the actual vehicle ID
  path = path.replace(/{id}/, vehicleId);

  // Create a pending request in the message queue with pointers to the original
  // HTTP request object and next callback
  var transactionId = uuid.v4();
  PENDING[transactionId] = res;

  // Send an async call to the RVI client
  rvi.callService('genivi.org' + path, {
    transactionId: transactionId,
    data: req.body,
  });

  // Check the message queue after a certain timeout to see if the request is
  // still pending
  setTimeout(function() {
    if (_.has(PENDING, transactionId)) {
      popPendingRequest(transactionId);
      next(new errors.TimeoutError());
    }
  }, TIMEOUT);
};

module.exports = exports;
