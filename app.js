'use strict';

// This enables logging from Swagger
process.env.DEBUG = 'swagger-tools:middleware:*';

var authMiddlewares = require('./middleware/auth');
var rvi = require('./middleware/rvi');
var mockVehiclesMiddlewares = require('./middleware/mock_vehicles');
var errorHandlerMiddlewares = require('./middleware/error_handlers');

var swagger = require('swagger-tools');
var express = require('express');
var app = express();

var swaggerHelpers = require('./lib/swagger_helpers');
var swaggerSchemaObject = swaggerHelpers.getSchema();

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

  app.use(rvi.rviMiddleware);

  // Default middlewares
  app.use(errorHandlerMiddlewares.defaultMiddleware);
  app.use(errorHandlerMiddlewares.defaultErrorMiddleware);

  app.listen(PORT, function() {
    console.log('App listening on port: ' + PORT);
  });

});


