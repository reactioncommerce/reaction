import url from "url";
import { merge } from "lodash";
import Logger from "@reactioncommerce/logger";
import { execute, subscribe } from "graphql";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { formatApolloErrors } from "apollo-server-errors";
import { SubscriptionServer } from "subscriptions-transport-ws";
import ReactionNodeApp from "/imports/node-app/core/ReactionNodeApp";
import { NoMeteorMedia } from "/imports/plugins/core/files/server";
import { setBaseContext } from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import coreSchemas from "../no-meteor/schemas";
import coreResolvers from "../no-meteor/resolvers";
import coreQueries from "../no-meteor/queries";
import { functionsByType, mutations, queries, resolvers, schemas } from "../no-meteor/pluginRegistration";
import runMeteorMethodWithContext from "../util/runMeteorMethodWithContext";

// For Meteor app tests
let appStartupIsComplete = false;
export const isAppStartupComplete = () => appStartupIsComplete;

/**
 * @summary Starts the Reaction Node app within a Meteor server
 * @returns {undefined}
 */
export default async function startNodeApp() {
  const { ROOT_URL } = process.env;
  const mongodb = MongoInternals.NpmModules.mongodb.module;

  // Adding core resolvers this way because `core` is not a typical plugin and doesn't call registerPackage
  // Note that coreResolvers comes first so that plugin resolvers can overwrite core resolvers if necessary
  const finalResolvers = merge({}, coreResolvers, resolvers);

  // Adding core queries this way because `core` is not a typical plugin and doesn't call registerPackage
  // Note that coreQueries comes first so that plugin queries can overwrite core queries if necessary
  const finalQueries = merge({}, coreQueries, queries);

  const app = new ReactionNodeApp({
    addCallMeteorMethod(context) {
      context.callMeteorMethod = (name, ...args) => runMeteorMethodWithContext(context, name, args);
    },
    additionalCollections: { Media: NoMeteorMedia },
    // XXX Eventually these should be from individual env variables instead
    debug: Meteor.isDevelopment,
    context: {
      createUser(options) {
        return Accounts.createUser(options);
      },
      mutations,
      queries: finalQueries,
      rootUrl: ROOT_URL
    },
    functionsByType,
    graphQL: {
      graphiql: Meteor.isDevelopment,
      resolvers: finalResolvers,
      schemas: [...coreSchemas, ...schemas]
    },
    httpServer: WebApp.httpServer,
    mongodb
  });

  const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
  app.setMongoDatabase(db);

  // Set the base context used by getGraphQLContextInMeteorMethod, which ideally should be identical
  // to the one in GraphQL
  setBaseContext(app.context);

  await app.runServiceStartup();

  // bind the specified paths to the Express server running GraphQL
  WebApp.connectHandlers.use(app.expressApp);

  // Generate upgrade handler which supports both Meteor socket and graphql.
  // See https://github.com/apollographql/subscriptions-transport-ws/issues/235
  // See https://github.com/DxCx/meteor-graphql-rxjs/commit/216856856e00e3f533e4ce39badd37f38274a4b8
  const { apolloServer, graphQLPath } = app;

  // If the dueling WebSockets issue is ever resolved, we should be able to
  // use the standard `installSubscriptionHandlers` call:
  // apolloServer.installSubscriptionHandlers(app.httpServer);
  //
  // But for now this is copied straight out of `installSubscriptionHandlers`
  // with WS options changed to `noServer: true`
  apolloServer.subscriptionServer = SubscriptionServer.create(
    {
      schema: apolloServer.schema,
      execute,
      subscribe,
      onOperation: async (message, connection) => {
        connection.formatResponse = (value) => ({
          ...value,
          errors:
            value.errors &&
            formatApolloErrors([...value.errors], {
              formatter: apolloServer.requestOptions.formatError,
              debug: apolloServer.requestOptions.debug
            })
        });

        let context;
        try {
          context = await apolloServer.context({ connection, payload: message.payload });
        } catch (error) {
          throw formatApolloErrors([error], {
            formatter: apolloServer.requestOptions.formatError,
            debug: apolloServer.requestOptions.debug
          })[0];
        }

        return { ...connection, context };
      }
    },
    {
      noServer: true
    }
  );

  const { wsServer } = apolloServer.subscriptionServer;
  WebApp.httpServer.on("upgrade", (req, socket, head) => {
    const { pathname } = url.parse(req.url);

    if (pathname === graphQLPath) {
      wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit("connection", ws, req);
      });
    } else if (pathname.startsWith("/sockjs")) {
      // Don't do anything, this is meteor socket.
    } else {
      socket.close();
    }
  });

  // Log to inform that the server is running
  WebApp.httpServer.on("listening", () => {
    Logger.info(`GraphQL listening at ${ROOT_URL}${app.apolloServer.graphqlPath}`);
    Logger.info(`GraphQL subscriptions ready at ${ROOT_URL.replace("http", "ws")}${app.apolloServer.subscriptionsPath}`);

    appStartupIsComplete = true;
  });
}
