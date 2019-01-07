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
