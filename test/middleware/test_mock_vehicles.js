'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai')
  .use(require('dirty-chai'))
  .use(require('sinon-chai'))
  .expect;

var mockVehiclesMiddleware = require('../../middleware/mock_vehicles');
var errors = require('../../lib/errors');

suite('Mock Vehicles Middleware', function() {

  var sandbox;

  var res;
  var req;

  var nextSpy;
  var nextArguments;

  var sendJsonSpy;
  var sendJsonArguments;

  setup(function() {
    sandbox = sinon.sandbox.create();

    nextArguments = undefined;
    nextSpy = sandbox.spy(function(arg) {
      nextArguments = arg;
    });

    sendJsonArguments = undefined;
    sendJsonSpy = sandbox.spy(function(arg) {
      sendJsonArguments = arg;
    });

    res = _.set({}, 'json', sendJsonSpy);
    req = {};
  });

  teardown(function() {
    sandbox.restore();
  });

  var setQueryVehicleId = function(id) {
    _.set(req, 'swagger.params.id.value', id);
  };

  var setAuthorizedVehicleIds = function(ids) {
    _.set(req, 'vehicles', ids);
  };

  suite('GET Requests', function() {

    setup(function() {
      req = _.set({}, 'swagger.apiPath', '/vehicles/{id}');
    });

    test('Unauthorized access to vehicle', function() {
      setQueryVehicleId('a19d0c47-157f-4c6d-9787-36a9cda9d39c');
      setAuthorizedVehicleIds([]);

      mockVehiclesMiddleware.getVehicleDataMiddleware(req, res, nextSpy);

      expect(nextSpy).to.have.been.calledOnce();
      expect(nextArguments).to.be.instanceof(errors.AuthenticationError);
      expect(sendJsonSpy).to.not.have.been.called();
      expect(sendJsonArguments).to.be.undefined();
    });

    test('Invalid mock vehicle ID', function() {
      setQueryVehicleId('a19d0c47-157f-4c6d-9787-36a9cda9d39c');
      setAuthorizedVehicleIds([ 'a19d0c47-157f-4c6d-9787-36a9cda9d39c' ]);

      mockVehiclesMiddleware.getVehicleDataMiddleware(req, res, nextSpy);

      expect(nextSpy).to.have.been.calledOnce();
      expect(nextArguments).to.be.undefined();
      expect(sendJsonSpy).to.not.have.been.called();
      expect(sendJsonArguments).to.be.undefined();
    });

    test('Valid mock vehicle ID', function() {
      setQueryVehicleId('36ab27d0-fd9d-4455-823a-ce30af709ffc');
      setAuthorizedVehicleIds([ '36ab27d0-fd9d-4455-823a-ce30af709ffc' ]);

      mockVehiclesMiddleware.getVehicleDataMiddleware(req, res, nextSpy);

      expect(nextSpy).to.not.have.been.called();
      expect(nextArguments).to.be.undefined();
      expect(sendJsonSpy).to.have.been.calledOnce();
      expect(sendJsonArguments).to.have.property('id',
        '36ab27d0-fd9d-4455-823a-ce30af709ffc');
      expect(sendJsonArguments).to.have.property('make', 'TESLA');
      expect(sendJsonArguments).to.have.property('model', 'Model S');
      expect(sendJsonArguments).to.have.property('year', 2014);
    });

  });

  suite('POST Requests', function() {

    test('Unauthorized access to vehicle', function() {
      setQueryVehicleId('a19d0c47-157f-4c6d-9787-36a9cda9d39c');
      setAuthorizedVehicleIds([]);

      mockVehiclesMiddleware.postVehicleActionsMiddleware(req, res, nextSpy);

      expect(nextSpy).to.have.been.calledOnce();
      expect(nextArguments).to.be.instanceof(errors.AuthenticationError);
      expect(sendJsonSpy).to.not.have.been.called();
      expect(sendJsonArguments).to.be.undefined();
    });

    test('Invalid mock vehicle ID', function() {
      setQueryVehicleId('a19d0c47-157f-4c6d-9787-36a9cda9d39c');
      setAuthorizedVehicleIds([ 'a19d0c47-157f-4c6d-9787-36a9cda9d39c' ]);

      mockVehiclesMiddleware.postVehicleActionsMiddleware(req, res, nextSpy);

      expect(nextSpy).to.have.been.calledOnce();
      expect(nextArguments).to.be.undefined();
      expect(sendJsonSpy).to.not.have.been.called();
      expect(sendJsonArguments).to.be.undefined();
    });

    test('Valid mock vehicle ID', function() {
      setQueryVehicleId('36ab27d0-fd9d-4455-823a-ce30af709ffc');
      setAuthorizedVehicleIds([ '36ab27d0-fd9d-4455-823a-ce30af709ffc' ]);

      mockVehiclesMiddleware.postVehicleActionsMiddleware(req, res, nextSpy);

      expect(nextSpy).to.not.have.been.called();
      expect(nextArguments).to.be.undefined();
      expect(sendJsonSpy).to.have.been.calledOnce();
      expect(sendJsonArguments).to.have.property('status', 'success');
    });

  });

});
