'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai')
  .use(require('dirty-chai'))
  .use(require('sinon-chai'))
  .expect;

var authMiddlewares = require('../../middleware/auth');
var errors = require('../../lib/errors');

suite('Authorization Middlewares', function() {

  var sandbox;

  var req;
  var res;

  var nextSpy;
  var nextArguments;

  setup(function() {
    sandbox = sinon.sandbox.create();

    req = {};
    res = {};

    nextArguments = undefined;
    nextSpy = sandbox.spy(function(arg) {
      nextArguments = arg;
    });
  });

  teardown(function() {
    sandbox.restore();
  });

  test('Missing auth header', function() {
    authMiddlewares.basicAuthMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.AuthenticationError);
  });

  test('Malformed basic auth header', function() {
    _.set(req, 'headers.authorization', 'MALFORMED HEADER');

    authMiddlewares.basicAuthMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.AuthenticationError);
  });

  test('Invalid credentials', function() {
    var invalidCredentials = 'invalid-user:invalid-pass';
    var encodedCredentials = new Buffer(invalidCredentials).toString('base64');

    _.set(req, 'headers.authorization', 'Basic ' + encodedCredentials);

    authMiddlewares.basicAuthMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.AuthenticationError);
  });

  test('Successful authorization', function() {
    var validCredentials = 'mock-user:mock-password';
    var encodedCredentials = new Buffer(validCredentials).toString('base64');

    _.set(req, 'headers.authorization', 'Basic ' + encodedCredentials);

    authMiddlewares.basicAuthMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.undefined();
    expect(req).to.have.property('vehicles').and
      .to.have.members(['36ab27d0-fd9d-4455-823a-ce30af709ffc']);
  });

  test('Send authorized vehicles', function() {
    _.set(req, 'vehicles', ['36ab27d0-fd9d-4455-823a-ce30af709ffc']);

    res = {
      json: function(body) {
        expect(body).to.have.property('vehicles').and
          .to.have.members(['36ab27d0-fd9d-4455-823a-ce30af709ffc']);
        expect(body).to.have.deep.property('paging.count', 1);
        expect(body).to.have.deep.property('paging.offset', 0);
      },
    };

    authMiddlewares.authorizedVehiclesMiddleware(req, res);
  });

});
