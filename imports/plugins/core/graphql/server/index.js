import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import createApolloServer from "./createApolloServer";
import getUserFromToken from "./getUserFromToken";
import methods from "./methods";
import queries from "./queries";

const server = createApolloServer({
  context: {
    methods,
    queries
  },
  // XXX Eventually these should be from individual env variables instead
  debug: Meteor.isDevelopment,
  getUserFromToken,
  graphiql: Meteor.isDevelopment
});

// bind the specified paths to the Express server running Apollo + GraphiQL
WebApp.connectHandlers.use(server);
