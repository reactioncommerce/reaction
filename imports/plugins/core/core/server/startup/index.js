import { merge } from "lodash";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { Shops } from "/lib/collections";
import ReactionNodeApp from "/imports/node-app/core/ReactionNodeApp";
import { NoMeteorMedia } from "/imports/plugins/core/files/server";
import { setBaseContext } from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import coreSchemas from "/imports/plugins/core/graphql/server/no-meteor/schemas";
import coreResolvers from "../no-meteor/resolvers";
import coreQueries from "../no-meteor/queries";
import { mutations, queries, resolvers, schemas, serviceConfig, startupFunctions } from "../no-meteor/pluginRegistration";
import fulfillmentService from "../no-meteor/services/fulfillment";
import Reaction from "../Reaction";
import runMeteorMethodWithContext from "../util/runMeteorMethodWithContext";
import Accounts from "./accounts";
import "./browser-policy";
import CollectionSecurity from "./collection-security";
import { importAllTranslations } from "./i18n";
import LoadFixtureData from "./load-data";
import Prerender from "./prerender";
import RateLimiters from "./rate-limits";
import RegisterCore from "./register-core";
import RegisterRouter from "./register-router";
import setupCdn from "./cdn";

/**
 * Core startup function
 */
export default function startup() {
  const startTime = Date.now();

  setupCdn();
  Accounts();
  RegisterCore();
  RegisterRouter();

  // initialize shop registry when a new shop is added
  Shops.find().observe({
    added(doc) {
      Reaction.setShopName(doc);
      Reaction.setDomain();
    },
    removed() {
      // TODO SHOP REMOVAL CLEANUP FOR #357
    }
  });

  LoadFixtureData();
  Reaction.init();

  importAllTranslations();

  Prerender();
  CollectionSecurity();
  RateLimiters();

  const { ROOT_URL } = process.env;
  const mongodb = MongoInternals.NpmModules.mongodb.module;

  // Wire up fulfillment service plugins
  serviceConfig.fulfillment.forEach((fulfillmentServiceConfig) => {
    fulfillmentService.configurePlugin(fulfillmentServiceConfig);
  });

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
      mutations,
      queries: finalQueries,
      rootUrl: ROOT_URL
    },
    graphQL: {
      graphiql: Meteor.isDevelopment,
      resolvers: finalResolvers,
      schemas: [...coreSchemas, ...schemas]
    },
    mongodb,
    services: {
      fulfillment: fulfillmentService
    },
    startupFunctions
  });

  const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
  app.setMongoDatabase(db);

  app.runServiceStartup()
    .then(() => {
      // Set the base context used by getGraphQLContextInMeteorMethod, which ideally should be identical
      // to the one in GraphQL
      setBaseContext(app.context);

      // bind the specified paths to the Express server running Apollo + GraphiQL
      WebApp.connectHandlers.use(app.expressApp);

      // Log to inform that the server is running
      WebApp.httpServer.on("listening", () => {
        Logger.info(`GraphQL listening at ${ROOT_URL}graphql-alpha`);
        Logger.info(`GraphiQL UI: ${ROOT_URL}graphiql`);
      });

      const endTime = Date.now();
      Logger.info(`Reaction initialization finished: ${endTime - startTime}ms`);

      return null;
    })
    .catch((error) => {
      Logger.error(error);
    });
}
