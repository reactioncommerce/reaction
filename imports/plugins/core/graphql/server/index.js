import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import appEvents from "/imports/plugins/core/core/server/appEvents";
import collections from "/imports/collections/rawCollections";
import createApolloServer from "./no-meteor/createApolloServer";
import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const server = createApolloServer({
  addCallMeteorMethod(context) {
    context.callMeteorMethod = (name, ...args) => runMeteorMethodWithContext(context, name, args);
  },
  context: { appEvents, collections },
  // XXX Eventually these should be from individual env variables instead
  debug: Meteor.isDevelopment,
  graphiql: Meteor.isDevelopment
});

// bind the specified paths to the Express server running Apollo + GraphiQL
WebApp.connectHandlers.use(server);
