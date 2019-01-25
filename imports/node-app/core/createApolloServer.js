import cors from "cors";
import express from "express";
import { makeExecutableSchema, mergeSchemas } from "apollo-server";
import { ApolloServer } from "apollo-server-express";
import buildContext from "./util/buildContext";
import getErrorFormatter from "./util/getErrorFormatter";
import tokenMiddleware from "./util/tokenMiddleware";

const DEFAULT_GRAPHQL_PATH = "/graphql-alpha";

const resolverValidationOptions = {
  // After we fix all errors that this prints, we should probably go
  // back to `true` (the default)
  requireResolversForResolveType: false
};

/**
 * @name createApolloServer
 * @method
 * @memberof GraphQL
 * @summary Creates an express app with Apollo Server route
 * @param {Object} options Options
 * @returns {ExpressApp} The express app
 */
export default function createApolloServer(options = {}) {
  const { addCallMeteorMethod, context: contextFromOptions, resolvers } = options;
  const path = options.path || DEFAULT_GRAPHQL_PATH;

  // We support passing in either a typeDefs string or an already executable schema,
  // for the case where a plugin is stitching in a schema from an external API.
  const schemas = options.schemas || [];
  const schemasToMerge = schemas.filter((td) => typeof td !== "string");
  const typeDefs = schemas.filter((td) => typeof td === "string");

  // Create a custom Express server so that we can add our own middleware and HTTP routes
  const app = express();

  let schema = makeExecutableSchema({ typeDefs, resolvers, resolverValidationOptions });
  if (schemasToMerge.length) {
    schema = mergeSchemas({ schemas: [schema, ...schemasToMerge] });
  }

  const apolloServer = new ApolloServer({
    async context({ connection, req }) {
      const context = { ...contextFromOptions };

      // For a GraphQL subscription WebSocket request, there is no `req`
      if (connection) return context;

      // meteorTokenMiddleware will have already set req.user if there is one
      await buildContext(context, req);

      addCallMeteorMethod(context);

      return context;
    },
    debug: options.debug || false,
    formatError: getErrorFormatter(),
    schema,
    subscriptions: {
      path: DEFAULT_GRAPHQL_PATH
    }
  });

  // GraphQL endpoint, enhanced with JSON body parser
  app.use(
    path,
    // Enable `cors` to set HTTP response header: Access-Control-Allow-Origin: *
    // Although the `cors: true` option to `applyMiddleware` below does this already
    // for successful requests, we need it to be set here, before tokenMiddleware,
    // so that the header is set on 401 responses, too. Otherwise it breaks our 401
    // refresh handling on the clients.
    cors(),
    tokenMiddleware(contextFromOptions)
  );

  apolloServer.applyMiddleware({ app, cors: true, path });

  return {
    apolloServer,
    expressApp: app
  };
}
