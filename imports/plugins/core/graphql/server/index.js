import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import createApolloServer from "./createApolloServer";
import { baseContext } from "./buildMeteorContext";

const server = createApolloServer({
  context: baseContext,
  // XXX Eventually these should be from individual env variables instead
  debug: Meteor.isDevelopment,
  graphiql: Meteor.isDevelopment
});

// bind the specified paths to the Express server running Apollo + GraphiQL
WebApp.connectHandlers.use(server);
