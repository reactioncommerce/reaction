import { merge } from "lodash";
import Logger from "@reactioncommerce/logger";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
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
    mongodb
  });

  const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
  app.setMongoDatabase(db);

  // Set the base context used by getGraphQLContextInMeteorMethod, which ideally should be identical
  // to the one in GraphQL
  setBaseContext(app.context);

  await app.runServiceStartup();

  // bind the specified paths to the Express server running Apollo + GraphiQL
  WebApp.connectHandlers.use(app.expressApp);

  // Log to inform that the server is running
  WebApp.httpServer.on("listening", () => {
    Logger.info(`GraphQL listening at ${ROOT_URL}/graphql-alpha`);
    Logger.info(`GraphiQL UI: ${ROOT_URL}/graphiql`);

    appStartupIsComplete = true;
  });
}
