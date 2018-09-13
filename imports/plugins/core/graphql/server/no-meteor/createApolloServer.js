import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import buildContext from "./buildContext";
import getErrorFormatter from "./getErrorFormatter";
import tokenMiddleware from "./tokenMiddleware";
import runPluginStartup from "./runPluginStartup";
import schema from "./schema";

const defaultServerConfig = {
  // graphql endpoint
  path: "/graphql-alpha",
  // GraphiQL endpoint
  graphiqlPath: "/graphiql",
  // GraphiQL options (default: log the current user in your request)
  graphiqlOptions: {
    passHeader: "'meteor-login-token': localStorage['Meteor.loginToken'] || ''"
  }
};

/**
 * @name createApolloServer
 * @method
 * @memberof GraphQL
 * @summary Creates an express app, adds graphql and optionally graphiql routes to it,
 *   and the returns it.
 * @returns {ExpressApp} The express app
 */
export default function createApolloServer(options = {}) {
  // the Meteor GraphQL server is an Express server
  const expressServer = express();

  const { addCallMeteorMethod, context: contextFromOptions } = options;
  const graphQLPath = options.path || defaultServerConfig.path;

  // GraphQL endpoint, enhanced with JSON body parser
  expressServer.use(
    graphQLPath,
    cors(),
    bodyParser.json(),
    tokenMiddleware(contextFromOptions),
    graphqlExpress(async (req) => {
      const context = { ...contextFromOptions };

      // meteorTokenMiddleware will have set req.user if there is one

      await buildContext(context, req);

      addCallMeteorMethod(context);

      return {
        context,
        debug: options.debug,
        formatError: getErrorFormatter(context),
        formatResponse(res) {
          // Apollo includes `errors` in the response when empty, but the spec forbids this.
          // http://facebook.github.io/graphql/draft/#sec-Errors
          if (Object.prototype.hasOwnProperty.call(res, "errors") && (!res.errors || res.errors.filter((v) => !!v).length === 0)) {
            delete res.errors;
          }

          return res;
        },
        schema
      };
    })
  );

  // Start GraphiQL if enabled
  if (options.graphiql) {
    // GraphiQL endpoint
    expressServer.use(
      options.graphiqlPath || defaultServerConfig.graphiqlPath,
      graphiqlExpress({
        // GraphiQL options
        ...defaultServerConfig.graphiqlOptions,
        // endpoint of the graphql server where to send requests
        endpointURL: graphQLPath
      })
    );
  }

  // For now this is a convenient place to do this, but move it eventually.
  runPluginStartup(contextFromOptions);

  return expressServer;
}
