import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { Reaction } from "/server/api";
import createApolloServer from "./createApolloServer";
import defineCollections from "./defineCollections";
import getUserFromToken from "./getUserFromToken";
import methods from "./methods";
import queries from "./queries";

const collections = {};

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
defineCollections(db, collections);

const server = createApolloServer({
  context: {
    collections,
    hasPermission: () => Promise.resolve(Reaction.hasPermission.bind(Reaction)),
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
