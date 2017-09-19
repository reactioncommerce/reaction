// Adapted from https://github.com/stubailo/meteor-rest/tree/master/packages/json-routes

import _ from "lodash";
import Fiber from "fibers";
import connect from "connect";
import bodyParser from "body-parser";
import connectRoute from "connect-route";

import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

// TODO: Add a rate limiter to our HTTP endpoint module

// This becomes Reaction.Endpoints and can be used in any server side code that imports { Reaction } from "/server/api"
// Exported as default at the bottom of this file.
const Endpoints = {};

WebApp.connectHandlers.use(bodyParser.json({
  limit: "200kb", // Override default request size
  // Attach the raw body which is necessary for doing verifications for some webhooks
  verify: function (req, res, buf) {
    req.rawBody = buf;
  },
  extended: true
}));

// Handler for adding middleware before an endpoint (Endpoints.middleWare
// is just for legacy reasons). Also serves as a namespace for middleware
// packages to declare their middleware functions.
Endpoints.Middleware = Endpoints.middleWare = connect();
WebApp.connectHandlers.use(Endpoints.Middleware);

// List of all defined JSON API Endpoints
Endpoints.routes = [];

// Save reference to router for later
let connectRouter;

// Register as a middleware
WebApp.connectHandlers.use(Meteor.bindEnvironment(connectRoute(function (router) {
  connectRouter = router;
})));

/**
 * Stringifies and writes JSON to body of response
 * @method writeJsonToBody
 * @param  {Object} res response object
 * @param  {Object} json JSON
 * @return {void}
 */
function writeJsonToBody(res, json) {
  if (json !== undefined) {
    const shouldPrettyPrint = (process.env.NODE_ENV === "development");
    const spacer = shouldPrettyPrint ? 2 : null;
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(json, null, spacer));
  }
}

// Error middleware must be added last, to catch errors from prior middleware.
// That's why we cache them and then add after startup.
let errorMiddlewares = [];
Endpoints.ErrorMiddleware = {
  use: function () {
    errorMiddlewares.push(arguments);
  }
};

Meteor.startup(function () {
  errorMiddlewares.forEach((errorMiddleware) => {
    const errorMiddlewareFn = errorMiddleware.map((maybeFn) => {
      if (_.isFunction(maybeFn)) {
        // A connect error middleware needs exactly 4 arguments because they use fn.length === 4 to
        // decide if something is an error middleware.
        return function (a, b, c, d) {
          Meteor.bindEnvironment(maybeFn)(a, b, c, d);
        };
      }
      return maybeFn;
    });
    WebApp.connectHandlers.use.apply(WebApp.connectHandlers, errorMiddlewareFn);
  });

  errorMiddlewares = [];
});

let responseHeaders = {
  "Cache-Control": "no-store",
  "Pragma": "no-cache"
};

Endpoints.add = function (method, path, handler) {
  // Make sure path starts with a slash
  let slashedPath = path;
  if (path[0] !== "/") {
    slashedPath = "/" + path;
  }

  // Add to list of known Endpoints
  Endpoints.routes.push({
    method: method,
    path: slashedPath
  });

  connectRouter[method.toLowerCase()](path, function (req, res, next) {
    // Set headers on response
    const headerKeys = Object.keys(responseHeaders);
    headerKeys.forEach((key) => {
      res.setHeader(key, responseHeaders[key]);
    });

    Fiber(function () {
      try {
        handler(req, res, next);
      } catch (error) {
        next(error);
      }
    }).run();
  });
};

Endpoints.setResponseHeaders = function (headers) {
  responseHeaders = headers;
};

/**
 * Sets the response headers, status code, and body, and ends it.
 * The JSON response will be pretty printed if NODE_ENV is `development`.
 *
 * @param {Object} res Response object
 * @param {Object} [options] Options object
 * @param {Number} [options.code] HTTP status code. Default is 200.
 * @param {Object} [options.headers] Dictionary of headers.
 * @param {Object|Array|null|undefined} [options.data] The object to
 *   stringify as the response. If `null`, the response will be "null".
 *   If `undefined`, there will be no response body.
 * @return {void}
 */
Endpoints.sendResponse = function (res, options = {}) {
  // We've already set global headers on response, but if they
  // pass in more here, we set those.
  if (options.headers) {
    const headerKeys = Object.keys(options.headers);
    headerKeys.forEach((key) => {
      res.setHeader(key, options.headers[key]);
    });
  }

  // Set status code on response
  res.statusCode = options.code || 200;

  // Set response body
  writeJsonToBody(res, options.data);

  // Send the response
  res.end();
};

export default Endpoints;
