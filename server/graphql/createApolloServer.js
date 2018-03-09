import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { HttpQueryError } from "apollo-server-core";
import getErrorFormatter from "./getErrorFormatter";
import getUserFromToken from "./getUserFromToken";

const defaultServerConfig = {
  // graphql endpoint
  path: "/graphql",
  // GraphiQL endpoint
  graphiqlPath: "/graphiql",
  // GraphiQL options (default: log the current user in your request)
  graphiqlOptions: {
    passHeader: "'meteor-login-token': localStorage['Meteor.loginToken']"
  }
};

// take the existing context and return a new extended context with
// the current user (if valid login token)
async function addUserToContextFromToken(context, token) {
  if (!token) return context;
  return { ...context, user: await getUserFromToken(token) };
}

export default function createApolloServer(options = {}) {
  // the Meteor GraphQL server is an Express server
  const expressServer = express();

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

      let context = {};
      try {
        // get the current user
        context = await addUserToContextFromToken(context, token);
      } catch (error) {
        throw new HttpQueryError(401, error.message);
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
        schema: options.schema
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
