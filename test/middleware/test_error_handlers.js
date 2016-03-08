'use strict';

var _ = require('lodash');
var sinon = require('sinon');
var expect = require('chai')
  .use(require('dirty-chai'))
  .use(require('sinon-chai'))
  .expect;

var errorHandlerMiddlewares = require('../../middleware/error_handlers');
var errors = require('../../lib/errors');

suite('Error Handler Middlewares', function() {

  var sandbox;

  var err;
  var req;
  var res;

  var nextSpy;
  var nextArguments;

  setup(function() {
    sandbox = sinon.sandbox.create();

    err = {};
    req = {};
    res = {
      status: function(code) {
        expect(code).to.be.at.least(100).and.below(600);
        this.statusCode = code;
        return this;
      },
      json: function(body) {
        expect(body).to.have.property('error');
        expect(body).to.have.property('message');
        this.name = body.error;
        this.message = body.message;
      },
    };

    nextArguments = undefined;
    nextSpy = sandbox.spy(function(arg) {
      nextArguments = arg;
    });
  });

  teardown(function() {
    sandbox.restore();
  });

  test('pathValidationErrorMiddleware success', function() {
    _.set(req, 'swagger', {});

    errorHandlerMiddlewares.pathValidationErrorMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.undefined();
  });

  test('pathValidationErrorMiddleware failure', function() {
    errorHandlerMiddlewares.pathValidationErrorMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.ResourceNotFoundError);
  });

  test('swaggerValidationErrorMiddleware', function() {
    errorHandlerMiddlewares
      .swaggerValidationErrorMiddleware(err, req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.ValidationError);
  });

  test('methodValidationErrorMiddleware success', function() {
    _.set(req, 'swagger.path.get', {});
    _.set(req, 'method', 'GET');

    errorHandlerMiddlewares.methodValidationErrorMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.undefined();
  });

  test('methodValidationErrorMiddleware failure', function() {
    _.set(req, 'method', 'GET');

    errorHandlerMiddlewares.methodValidationErrorMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.ValidationError);
  });

  test('defaultMiddleware', function() {
    errorHandlerMiddlewares.defaultMiddleware(req, res, nextSpy);

    expect(nextSpy).to.have.been.calledOnce();
    expect(nextArguments).to.be.instanceof(errors.ResourceNotFoundError);
  });

  test('defaultErrorMiddleware default error', function() {
    errorHandlerMiddlewares.defaultErrorMiddleware(err, req, res, nextSpy);

    var defaultError = new errors.InternalServerError();

    expect(nextSpy).to.not.have.been.called();
    expect(res).to.have.property('statusCode', defaultError.statusCode);
    expect(res).to.have.property('name', defaultError.name);
    expect(res).to.have.property('message', defaultError.message);
  });

  test('defaultErrorMiddleware custom error', function() {
    err = new errors.AuthenticationError('');

    errorHandlerMiddlewares.defaultErrorMiddleware(err, req, res, nextSpy);

    expect(nextSpy).to.not.have.been.called();
    expect(res).to.have.property('statusCode', err.statusCode);
    expect(res).to.have.property('name', err.name);
    expect(res).to.have.property('message', err.message);
  });

});
