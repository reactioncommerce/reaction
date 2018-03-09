import { makeExecutableSchema } from "graphql-tools";
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import createApolloServer from "./createApolloServer";
import resolvers from "./resolvers";
import typeDefs from "./schemas";

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = createApolloServer({
  // XXX Eventually these should be from individual env variables instead
  debug: Meteor.isDevelopment,
  graphiql: Meteor.isDevelopment,
  schema
});

// bind the specified paths to the Express server running Apollo + GraphiQL
WebApp.connectHandlers.use(server);
