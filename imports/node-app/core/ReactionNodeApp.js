import { createServer } from "http";
import { PubSub } from "apollo-server";
import mongodb, { MongoClient } from "mongodb";
import appEvents from "./util/appEvents";
import createApolloServer from "./createApolloServer";
import defineCollections from "./util/defineCollections";

/**
 * @summary A default addCallMeteorMethod function. Adds `callMeteorMethod`
 *   function to the context (mutates it)
 * @param {Object} context The application context
 * @returns {undefined}
 */
function defaultAddCallMethod(context) {
  context.callMeteorMethod = (name) => {
    console.warn(`The "${name}" Meteor method was called. The method has not yet been converted to a mutation that` + // eslint-disable-line no-console
      " works outside of Meteor. If you are relying on a side effect or return value from this method, you may notice unexpected behavior.");
    return null;
  };
}

export default class ReactionNodeApp {
  constructor(options = {}) {
    this.options = { ...options };
    this.collections = {
      ...(options.additionalCollections || {})
    };
    this.context = {
      ...(options.context || {}),
      app: this,
      appEvents,
      collections: this.collections,
      getFunctionsOfType(type) {
        return ((options.functionsByType || {})[type]) || [];
      },
      // In a large production app, you may want to use an external pub-sub system.
      // See https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#PubSub-Implementations
      // We may eventually bind this directly to Kafka.
      pubSub: new PubSub()
    };

    this.mongodb = options.mongodb || mongodb;

    const { resolvers, schemas } = options.graphQL;

    const {
      apolloServer,
      expressApp,
      path
    } = createApolloServer({
      addCallMeteorMethod: this.options.addCallMeteorMethod || defaultAddCallMethod,
      context: this.context,
      debug: this.options.debug || false,
      resolvers,
      schemas
    });

    this.apolloServer = apolloServer;
    this.expressApp = expressApp;
    this.graphQLPath = path;

    // HTTP server for GraphQL subscription websocket handlers
    this.httpServer = options.httpServer || createServer(this.expressApp);
  }

  setMongoDatabase(db) {
    this.db = db;
    defineCollections(this.db, this.collections);
  }

  async connectToMongo({ mongoUrl }) {
    const lastSlash = mongoUrl.lastIndexOf("/");
    const dbUrl = mongoUrl.slice(0, lastSlash);
    const dbName = mongoUrl.slice(lastSlash + 1);

    return new Promise((resolve, reject) => {
      MongoClient.connect(dbUrl, { useNewUrlParser: true }, (error, client) => {
        if (error) {
          reject(error);
          return;
        }

        this.mongoClient = client;
        this.setMongoDatabase(client.db(dbName));

        resolve();
      });
    });
  }

  disconnectFromMongo() {
    return this.mongoClient.close();
  }

  async runServiceStartup() {
    const { additionalServices = [], functionsByType = {} } = this.options;

    await Promise.all(additionalServices.map(async (service) => {
      await service.startup(this.context);
    }));
    await Promise.all((functionsByType.startup || []).map(async (startupFunction) => {
      await startupFunction(this.context);
    }));
  }

  async startServer({ port }) {
    return new Promise((resolve, reject) => {
      try {
        // To also listen for WebSocket connections for GraphQL
        // subs, this needs to be `this.httpServer.listen`
        // rather than `this.expressApp.listen`.
        this.server = this.httpServer.listen(String(port), () => {
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stopServer() {
    if (!this.server) return null;
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(null);
        }
      });
    });
  }

  async start({ mongoUrl, port }) {
    // (1) Connect to MongoDB database
    await this.connectToMongo({ mongoUrl });

    // (2) Run service startup functions
    await this.runServiceStartup();

    // (3) Start the Express GraphQL server
    await this.startServer({ port });
  }

  async stop() {
    // (1) Disconnect from MongoDB database
    await this.disconnectFromMongo();

    // (2) Stop the Express GraphQL server
    await this.stopServer();
  }
}
