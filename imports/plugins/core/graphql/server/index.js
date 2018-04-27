import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { NoMeteorMedia } from "/imports/plugins/core/files/server";
import createApolloServer from "./createApolloServer";
import defineCollections from "./defineCollections";
import methods from "./methods";
import queries from "./queries";

/**
 * Functions used by the GraphQL server configuration
 * @namespace GraphQL
 */

const collections = { Media: NoMeteorMedia };

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
defineCollections(db, collections);

const server = createApolloServer({
  context: {
    collections,
    methods,
    queries
  },
  // XXX Eventually these should be from individual env variables instead
  debug: Meteor.isDevelopment,
  graphiql: Meteor.isDevelopment
});

// bind the specified paths to the Express server running Apollo + GraphiQL
WebApp.connectHandlers.use(server);
