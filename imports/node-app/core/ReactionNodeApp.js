import { createServer } from "http";
import { PubSub } from "apollo-server";
import { merge } from "lodash";
import mongodb, { MongoClient } from "mongodb";
import appEvents from "./util/appEvents";
import createApolloServer from "./createApolloServer";
import defineCollections from "./util/defineCollections";
import getRootUrl from "/imports/plugins/core/core/server/util/getRootUrl";
import getAbsoluteUrl from "/imports/plugins/core/core/server/util/getAbsoluteUrl";

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
      getFunctionsOfType: (type) => this.functionsByType[type] || [],
      // In a large production app, you may want to use an external pub-sub system.
      // See https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#PubSub-Implementations
      // We may eventually bind this directly to Kafka.
      pubSub: new PubSub()
    };

    this.functionsByType = {};
    this.graphQL = {
      resolvers: {},
      schemas: []
    };

    if (options.functionsByType) {
      Object.keys(options.functionsByType).forEach((type) => {
        if (!Array.isArray(this.functionsByType[type])) {
          this.functionsByType[type] = [];
        }
        this.functionsByType[type].push(...options.functionsByType[type]);
      });
    }

    if (options.graphQL) {
      if (options.graphQL.resolvers) {
        merge(this.graphQL.resolvers, options.graphQL.resolvers);
      }
      if (options.graphQL.schemas) {
        this.graphQL.schemas.push(...options.graphQL.schemas);
      }
    }

    this.context.rootUrl = getRootUrl();
    this.context.getAbsoluteUrl = (path) => getAbsoluteUrl(this.context.rootUrl, path);

    this.registeredPlugins = {};

    this.mongodb = options.mongodb || mongodb;
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
    // Call `functionsByType.registerPluginHandler` functions for every plugin that
    // has supplied one, passing in all other plugins. Allows one plugin to check
    // for the presence of another plugin and read its config.
    //
    // These are not async but they run before plugin `startup` functions, so a plugin
    // can save off relevant config and handle it later in `startup`.
    const registerPluginHandlerFuncs = this.functionsByType.registerPluginHandler || [];
    const packageInfoArray = Object.values(this.registeredPlugins);
    registerPluginHandlerFuncs.forEach((registerPluginHandlerFunc) => {
      if (typeof registerPluginHandlerFunc !== "function") {
        throw new Error('A plugin registered a function of type "registerPluginHandler" which is not actually a function');
      }
      packageInfoArray.forEach(registerPluginHandlerFunc);
    });

    const startupFunctionsRegisteredByPlugins = this.functionsByType.startup;
    if (Array.isArray(startupFunctionsRegisteredByPlugins)) {
      // We are intentionally running these in series, in the order in which they were registered
      for (const startupFunction of startupFunctionsRegisteredByPlugins) {
        await startupFunction(this.context); // eslint-disable-line no-await-in-loop
      }
    }
  }

  initServer() {
    const { addCallMeteorMethod, debug, graphQL, httpServer } = this.options;
    const { resolvers, schemas } = graphQL;

    const {
      apolloServer,
      expressApp,
      path
    } = createApolloServer({
      addCallMeteorMethod: addCallMeteorMethod || defaultAddCallMethod,
      context: this.context,
      debug: debug || false,
      resolvers,
      schemas
    });

    this.apolloServer = apolloServer;
    this.expressApp = expressApp;
    this.graphQLPath = path;

    // HTTP server for GraphQL subscription websocket handlers
    this.httpServer = httpServer || createServer(this.expressApp);
  }

  async startServer({ port }) {
    if (!this.httpServer) this.initServer();

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

  // Plugins should call this to register everything they provide.
  // This is a non-Meteor replacement for the old `Reaction.registerPackage`.
  async registerPlugin(plugin) {
    if (typeof plugin.name !== "string" || plugin.name.length === 0) {
      throw new Error("Plugin configuration passed to registerPlugin must have 'name' field");
    }

    if (this.registeredPlugins[plugin.name]) {
      throw new Error(`You registered multiple plugins with the name "${plugin.name}"`);
    }

    this.registeredPlugins[plugin.name] = plugin;

    if (plugin.graphQL) {
      if (plugin.graphQL.resolvers) {
        merge(this.graphQL.resolvers, plugin.graphQL.resolvers);
      }
      if (plugin.graphQL.schemas) {
        this.graphQL.schemas.push(...plugin.graphQL.schemas);
      }
    }

    if (plugin.mutations) {
      merge(this.context.mutations, plugin.mutations);
    }

    if (plugin.queries) {
      merge(this.context.queries, plugin.queries);
    }

    if (plugin.functionsByType) {
      Object.keys(plugin.functionsByType).forEach((type) => {
        if (!Array.isArray(this.functionsByType[type])) {
          this.functionsByType[type] = [];
        }
        this.functionsByType[type].push(...plugin.functionsByType[type]);
      });
    }
  }
}
