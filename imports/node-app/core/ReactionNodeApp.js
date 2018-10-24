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
      getNamedFunctionDetails(name) {
        return (options.namedFunctions || []).find((details) => details.name === name) || null;
      }
    };

    this.mongodb = options.mongodb || mongodb;

    const { graphiql, resolvers, schemas } = options.graphQL;

    this.expressApp = createApolloServer({
      addCallMeteorMethod: this.options.addCallMeteorMethod || defaultAddCallMethod,
      context: this.context,
      debug: this.options.debug || false,
      graphiql: graphiql || false,
      resolvers,
      typeDefs: schemas
    });
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

  async start({ mongoUrl, port }) {
    // (1) Connect to MongoDB database
    await this.connectToMongo({ mongoUrl });

    // (2) Run service startup functions
    await this.runServiceStartup();

    // (3) Start the Express GraphQL server
    await this.startServer({ port });
  }

  async stop() {
    await this.stopServer();
  }
}
