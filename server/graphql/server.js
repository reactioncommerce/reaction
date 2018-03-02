import express from "express";
import bodyParser from "body-parser";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { Accounts } from "meteor/accounts-base";
import { Logger } from "/server/api";

// default server configuration object
export const defaultServerConfig = {
  // graphql endpoint
  path: "/graphql",
  // additional Express server configuration (enable CORS there for instance)
  configServer: () => {},
  // enable GraphiQL only in development mode
  graphiql: Meteor.isDevelopment,
  // GraphiQL endpoint
  graphiqlPath: "/graphiql",
  // GraphiQL options (default: log the current user in your request)
  graphiqlOptions: {
    passHeader: "'meteor-login-token': localStorage['Meteor.loginToken']"
  }
};

// default graphql options to enhance the graphQLExpress server
export const defaultGraphQLOptions = {
  // ensure that a context object is defined for the resolvers
  context: {},
  // error response formatting for failed GraphQL request
  formatError: e => ({
    message: e.message,
    locations: e.locations,
    path: e.path
  }),
  // additional debug logging if execution errors occur in dev mode
  debug: Meteor.isDevelopment
};

export async function getUserForContext(loginToken) {
  if (typeof loginToken === "string") {
    // hash the token
    const hashedToken = Accounts._hashLoginToken(loginToken);

    // search for user from the database with hashedToken
    // note: no need for a fiber aware findOne
    const currentUser = await Meteor.users.rawCollection().findOne({
      "services.resume.loginTokens.hashedToken": hashedToken
    });

    // the current user exists
    if (currentUser) {
      // find the right login token because the user may have
      // several sessions logged in on different browsers/computers
      const tokenInformation = currentUser.services.resume.loginTokens.find(
        tokenInfo => tokenInfo.hashedToken === hashedToken
      );

      // get token expiration date
      const expiresAt = Accounts._tokenExpiration(tokenInformation.when);

      // true if the token is expired
      const isExpired = expiresAt < new Date();

      // if the token is still valid, insert current user
      // information into the resolvers context
      if (!isExpired) {
        return {
          user: currentUser,
          userId: currentUser._id
        };
      }
    }
  }

  return {};
}

// take the existing context and return a new extended context with
// the current user (if valid login token)
export async function addCurrentUserToContext(context, loginToken) {
  const userContext = await getUserForContext(loginToken);
  return {
    ...context,
    ...userContext
  };
}

export function createApolloServer(customOptions = {}, customConfig = {}) {
  // create a new server config object based on the default server config
  // defined above and the custom server config passed to this function
  const config = {
    ...defaultServerConfig,
    ...customConfig
  };

  if (customConfig.graphiqlOptions) {
    config.graphiqlOptions = {
      ...defaultServerConfig.graphiqlOptions,
      ...customConfig.graphiqlOptions
    };
  }

  // the Meteor GraphQL server is an Express server
  const expressServer = express();

  // enhance the GraphQL server with possible express middlewares
  config.configServer(expressServer);

  // GraphQL endpoint, enhanced with JSON body parser
  expressServer.use(
    config.path,
    bodyParser.json(),
    graphqlExpress(async req => {
      try {
        // graphqlExpress can accept a function returning the option object
        const customOptionsObject = typeof customOptions === "function" ? customOptions(req) : customOptions;

        // create a new apollo options object based on the default apollo options
        // defined above and the custom apollo options passed to this function
        const options = {
          ...defaultGraphQLOptions,
          ...customOptionsObject
        };

        // get the login token from the headers request, given by the Meteor's
        // network interface middleware if enabled
        const loginToken = req.headers["meteor-login-token"];

        // get the current user & the user id for the context
        const userContext = await getUserForContext(loginToken);

        // context can accept a function returning the context object
        const context =
          typeof options.context === "function"
            ? await options.context(userContext)
            : { ...options.context, ...userContext };

        // return the configured options to be used by the graphql server
        return {
          ...options,
          context
        };
      } catch (error) {
        // something went bad when configuring the graphql server, we do not
        // swallow the error and display it in the server-side logs
        Logger.error(error, "[GraphQL Server] Something bad happened when handling a request on the GraphQL server");

        // return the default graphql options anyway
        return defaultGraphQLOptions;
      }
    })
  );

  // Start GraphiQL if enabled
  if (config.graphiql) {
    // GraphiQL endpoint
    expressServer.use(
      config.graphiqlPath,
      graphiqlExpress({
        // GraphiQL options
        ...config.graphiqlOptions,
        // endpoint of the graphql server where to send requests
        endpointURL: config.path
      })
    );
  }

  // bind the specified paths to the Express server running Apollo + GraphiQL
  WebApp.connectHandlers.use(expressServer);
}
