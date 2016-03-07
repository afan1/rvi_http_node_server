'use strict';

// This enables logging from Swagger
process.env.DEBUG = 'swagger-tools:middleware:*';

var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');

var authMiddlewares = require('./middleware/auth');
var mockVehiclesMiddlewares = require('./middleware/mock_vehicles');
var errorHandlerMiddlewares = require('./middleware/error_handlers');

var swagger = require('swagger-tools');
var express = require('express');
var app = express();

var swaggerSchemaPath = path.join(__dirname,
  'node_modules/rvi-http-api-spec/swagger.yaml');
var swaggerSchemaObject = yaml.load(fs.readFileSync(swaggerSchemaPath));

var PORT = process.env.PORT || 8001;

swagger.initializeMiddleware(swaggerSchemaObject, function(middleware) {

  // Swagger specific middleware. Must be applied before all other middleware
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerValidator({ validateResponse: true }));

  // Handle any Swagger specific errors
  app.use(errorHandlerMiddlewares.pathValidationErrorMiddleware);
  app.use(errorHandlerMiddlewares.swaggerValidationErrorMiddleware);

  // Account specific middlewares
  app.use(authMiddlewares.basicAuthMiddleware);
  app.get('/vehicles', authMiddlewares.authorizedVehiclesMiddleware);

  // Check if the endpoint is invalid for the given method
  app.use(errorHandlerMiddlewares.methodValidationErrorMiddleware);

  // Mock vehicle middlewares
  app.get('/*', mockVehiclesMiddlewares.getVehicleDataMiddleware);
  app.post('/*', mockVehiclesMiddlewares.postVehicleActionsMiddleware);

  // Default middlewares
  app.use(errorHandlerMiddlewares.defaultMiddleware);
  app.use(errorHandlerMiddlewares.defaultErrorMiddleware);

  app.listen(PORT, function() {
    console.log('App listening on port: ' + PORT);
  });

});


