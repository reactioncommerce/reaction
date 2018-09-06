import { MongoClient } from "mongodb";
import appEvents from "../imports/plugins/core/core/server/appEvents";
import createApolloServer from "../imports/plugins/core/graphql/server/no-meteor/createApolloServer";
import defineCollections from "../collections/defineCollections";
import { getRegisteredFunctionsForType, registerFunction } from "./util/registerFunction";

export default class ReactionNodeApp {
  constructor(options = {}) {
    this.options = { ...options };
    this.collections = {};
    this.context = {
      app: this,
      appEvents,
      collections: this.collections,
      getRegisteredFunctionsForType,
      registerFunction
    };

    this.expressApp = createApolloServer({
      addCallMeteorMethod(context) {
        context.callMeteorMethod = (name) => {
          console.warn(`The "${name}" Meteor method was called. The method has not yet been converted to a mutation that` + // eslint-disable-line no-console
            " works outside of Meteor. If you are relying on a side effect or return value from this method, you may notice unexpected behavior.");
          return null;
        };
      },
      context: this.context,
      debug: this.options.debug || false,
      graphiql: this.options.graphiql || false
    });
  }

  async connectToMongo() {
    const { mongoUrl } = this.options;
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
        this.db = client.db(dbName);
        defineCollections(this.db, this.collections);
        resolve();
      });
    });
  }

  async startServer() {
    const { port } = this.options;
    return new Promise((resolve, reject) => {
      try {
        this.server = this.expressApp.listen(String(port), () => {
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

  async start() {
    const { services } = this.options;

    // (1) Connect to MongoDB database
    await this.connectToMongo();

    // (2) Run service startup functions
    await Promise.all(services.map(async (service) => {
      await service.startup(this.context);
    }));

    // (3) Start the Express GraphQL server
    await this.startServer();
  }

  async stop() {
    await this.stopServer();
  }
}
