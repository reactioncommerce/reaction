import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { HttpQueryError } from "apollo-server-core";
import getErrorFormatter from "./getErrorFormatter";
import schema from "./schema";

const defaultServerConfig = {
  // graphql endpoint
  path: "/graphql-alpha",
  // GraphiQL endpoint
  graphiqlPath: "/graphiql",
  // GraphiQL options (default: log the current user in your request)
  graphiqlOptions: {
    passHeader: "'meteor-login-token': localStorage['Meteor.loginToken']"
  }
};

export default function createApolloServer(options = {}) {
  // the Meteor GraphQL server is an Express server
  const expressServer = express();

  const { context: contextFromOptions, getUserFromToken } = options;
  const graphQLPath = options.path || defaultServerConfig.path;

  // GraphQL endpoint, enhanced with JSON body parser
  expressServer.use(
    graphQLPath,
    cors(),
    bodyParser.json(),
    graphqlExpress(async (req) => {
      // token is set by express-bearer-token middleware
      // get the login token from the headers request, given by the Meteor's
      // network interface middleware if enabled
      const token = req.headers["meteor-login-token"];

      let context;

      if (token && typeof getUserFromToken === "function") {
        try {
          // get the current user
          const user = await getUserFromToken(token);
          context = { ...contextFromOptions, user, userId: (user && user._id) || null };
        } catch (error) {
          throw new HttpQueryError(401, error.message);
        }
      } else {
        context = { ...contextFromOptions };
      }

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

  return expressServer;
}
