'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var rewire = require('rewire');
var expect = require('chai')
  .use(require('dirty-chai'))
  .use(require('sinon-chai'))
  .expect;

var errors = require('../../lib/errors');

suite('RVI Middleware', function() {

  var sandbox;

  var rvi;
  var registeredEndpoints;
  var registerServiceSpy;

  var callServicePath;
  var callServiceParams;
  var callServiceSpy;

  var pendingRequests;

  var res;
  var req;

  var nextSpy;
  var nextArguments;

  var sendJsonSpy;
  var sendJsonArguments;

  setup(function() {
    sandbox = sinon.sandbox.create();

    rvi = rewire('../../middleware/rvi');

    rvi.__set__('TIMEOUT', 500);
    rvi.__set__('uuid', {
      v4: function() { return 'mockUUID'; },
    });

    registeredEndpoints = {};
    registerServiceSpy = sandbox.spy(function(endpoint, cb) {
      registeredEndpoints[endpoint] = cb;
    });

    callServicePath = null;
    callServiceParams = null;
    callServiceSpy = sandbox.spy(function(path, parameters) {
      callServicePath = path;
      callServiceParams = parameters;
    });

    rvi.__set__('rvi', {
      registerService: registerServiceSpy,
      callService: callServiceSpy,
    });

    rvi.__set__('PENDING', {});
    pendingRequests = rvi.__get__('PENDING');

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

  suite('registerEndpoints', function() {

    test('Register valid endpoints', function() {
      var schema = {};
      _.set(schema, 'paths./vehicles/{id}', null);
      _.set(schema, 'paths./vehicles/{id}/foo/bar/baz', null);

      rvi.registerEndpoints(schema);

      expect(registeredEndpoints).to.have.all.keys([ '/', '/foo/bar/baz' ]);
    });

    test('Register invalid endpoint', function() {
      var schema = _.set({}, 'paths./vehicles', null);
      rvi.registerEndpoints(schema);
      expect(registeredEndpoints).to.be.empty();
    });

    test('RVI responds with invalid transaction ID', function() {
      pendingRequests.validId = res;

      var schema = _.set({}, 'paths./vehicles/{id}/foo/bar');
      rvi.registerEndpoints(schema);

      registeredEndpoints['/foo/bar']({
        transactionId: 'INVALID ID',
        data: {},
      });

      expect(nextSpy).to.not.have.been.called();
      expect(sendJsonSpy).to.not.have.been.called();
    });

    test('RVI responds with invalid data', function() {
      pendingRequests.validId = res;

      var schema = _.set({}, 'paths./vehicles/{id}/foo/bar');
      rvi.registerEndpoints(schema);

      registeredEndpoints['/foo/bar']({
        transactionId: 'validId',
        data: undefined,
      });

      expect(nextSpy).to.not.have.been.called();
      expect(sendJsonSpy).to.not.have.been.called();
    });

    test('Successful RVI response', function() {
      pendingRequests.validId = res;

      var schema = _.set({}, 'paths./vehicles/{id}/foo/bar');
      rvi.registerEndpoints(schema);

      registeredEndpoints['/foo/bar']({
        transactionId: 'validId',
        data: {
          result: 'some value',
        },
      });

      expect(nextSpy).to.not.have.been.called();
      expect(sendJsonSpy).to.have.been.calledOnce();
      expect(sendJsonArguments).to.have.property('result', 'some value');
    });

  });

  suite('rviMiddleware', function() {

    test('RVI timeout', function(done) {
      nextSpy = sandbox.spy(function(arg) {
        expect(arg).to.be.instanceof(errors.TimeoutError);
        done();
      });

      _.set(req, 'swagger.apiPath', '/vehicles/{id}/foo/bar');
      _.set(req, 'swagger.params.id.value', '123');

      rvi.rviMiddleware(req, res, nextSpy);

      expect(callServiceSpy).to.have.been.calledOnce();
      expect(callServicePath).to.equal('genivi.org/vehicles/123/foo/bar');
      expect(callServiceParams).to.have.property('transactionId', 'mockUUID');
    });

    test('Successful RVI response', function(done) {
      var schema = _.set({}, 'paths./vehicles/{id}/foo/bar');
      rvi.registerEndpoints(schema);

      _.set(req, 'swagger.apiPath', '/vehicles/{id}/foo/bar');
      _.set(req, 'swagger.params.id.value', '123');

      rvi.rviMiddleware(req, res, nextSpy);

      expect(pendingRequests).to.have.all.keys([ 'mockUUID' ]);

      registeredEndpoints['/foo/bar']({
        transactionId: 'mockUUID',
        data: {
          result: 'some value',
        },
      });

      expect(nextSpy).to.not.have.been.called();
      expect(sendJsonSpy).to.have.been.calledOnce();
      expect(sendJsonArguments).to.have.property('result', 'some value');
      expect(pendingRequests).to.be.empty();

      setTimeout(function() {
        expect(nextSpy).to.not.have.called();
        done();
      }, rvi.__get__('TIMEOUT') + 500);
    });

  });

});
