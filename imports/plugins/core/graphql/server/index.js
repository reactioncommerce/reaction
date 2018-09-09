import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
import collections from "/imports/collections/rawCollections";
import createApolloServer from "/imports/node-app/core/createApolloServer";
import runPluginStartup from "./no-meteor/runPluginStartup";
import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const baseContext = { appEvents, collections };

runPluginStartup(baseContext).catch((error) => {
  Logger.error("Error in runPluginStartup:", error);
});

const server = createApolloServer({
  addCallMeteorMethod(context) {
    context.callMeteorMethod = (name, ...args) => runMeteorMethodWithContext(context, name, args);
  },
  context: baseContext,
  // XXX Eventually these should be from individual env variables instead
  debug: Meteor.isDevelopment,
  graphiql: Meteor.isDevelopment
});

// bind the specified paths to the Express server running Apollo + GraphiQL
WebApp.connectHandlers.use(server);
