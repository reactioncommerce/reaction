import express from "express";
import { makeExecutableSchema } from "apollo-server";
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
  const { addCallMeteorMethod, context: contextFromOptions, resolvers, typeDefs } = options;
  const path = options.path || DEFAULT_GRAPHQL_PATH;

  // Create a custom Express server so that we can add our own middleware and HTTP routes
  const app = express();

  const schema = makeExecutableSchema({ typeDefs, resolvers, resolverValidationOptions });

  const server = new ApolloServer({
    async context({ req }) {
      const context = { ...contextFromOptions };

      // meteorTokenMiddleware will have already set req.user if there is one
      await buildContext(context, req);

      addCallMeteorMethod(context);

      return context;
    },
    debug: options.debug || false,
    formatError: getErrorFormatter(),
    schema
  });

  // GraphQL endpoint, enhanced with JSON body parser
  app.use(
    path,
    tokenMiddleware(contextFromOptions)
  );

  server.applyMiddleware({ app, cors: true, path });

  return {
    apolloServer: server,
    expressApp: app
  };
}
