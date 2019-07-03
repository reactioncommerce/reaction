import { createServer } from "http";
import { PubSub } from "apollo-server";
import { merge } from "lodash";
import mongodb, { MongoClient } from "mongodb";
import Logger from "@reactioncommerce/logger";
import appEvents from "./util/appEvents";
import collectionIndex from "/imports/utils/collectionIndex";
import createApolloServer from "./createApolloServer";
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
      getFunctionsOfType: (type) => (this.functionsByType[type] || []).map(({ func }) => func),
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

    this._registerFunctionsByType(options.functionsByType, "__APP__");

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

  _registerFunctionsByType(functionsByType, pluginName) {
    if (functionsByType) {
      Object.keys(functionsByType).forEach((type) => {
        if (!Array.isArray(this.functionsByType[type])) {
          this.functionsByType[type] = [];
        }
        functionsByType[type].forEach((func) => {
          this.functionsByType[type].push({ func, pluginName });
        });
      });
    }
  }

  /**
   * @summary Use this method to provide the MongoDB database instance.
   *   A side effect is that `this.collections`/`this.context.collections`
   *   will have all collections available on it after this is called.
   * @param {Database} db MongoDB library database instance
   * @return {undefined}
   */
  setMongoDatabase(db) {
    this.db = db;

    // Loop through all registered plugins
    for (const pluginName in this.registeredPlugins) {
      if ({}.hasOwnProperty.call(this.registeredPlugins, pluginName)) {
        const pluginConfig = this.registeredPlugins[pluginName];

        // If a plugin config has `collections` key
        if (pluginConfig.collections) {
          // Loop through `collections` object keys
          for (const collectionKey in pluginConfig.collections) {
            if ({}.hasOwnProperty.call(pluginConfig.collections, collectionKey)) {
              const collectionConfig = pluginConfig.collections[collectionKey];

              // Validate that the `collections` key value is an object and has `name`
              if (!collectionConfig || typeof collectionConfig.name !== "string" || collectionConfig.name.length === 0) {
                throw new Error(`In registerPlugin, collection "${collectionKey}" needs a name property`);
              }

              // Validate that the `collections` key hasn't already been taken by another plugin
              if (this.collections[collectionKey]) {
                throw new Error(`Plugin ${pluginName} defines a collection with key "${collectionKey}" in registerPlugin,` +
                  " but another plugin has already defined a collection with that key");
              }

              // Add the collection instance to `context.collections`
              this.collections[collectionKey] = this.db.collection(collectionConfig.name);

              // If the collection config has `indexes` key, define all requested indexes
              if (Array.isArray(collectionConfig.indexes)) {
                for (const indexArgs of collectionConfig.indexes) {
                  collectionIndex(this.collections[collectionKey], ...indexArgs);
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * @summary Given a MongoDB URL, creates a connection to it, sets `this.mongoClient`,
   *   calls `this.setMongoDatabase` with the database instance, and then
   *   resolves the Promise.
   * @param {Object} options Options object
   * @param {String} options.mongoUrl MongoDB connection URL
   * @return {Promise<undefined>} Nothing
   */
  async connectToMongo({ mongoUrl } = {}) {
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

  /**
   * @summary Calls all `registerPluginHandler` type functions from all registered
   *   plugins, and then calls all `startup` type functions in series, in the order
   *   in which they were registered.
   * @return {Promise<undefined>} Nothing
   */
  async runServiceStartup() {
    // Call `functionsByType.registerPluginHandler` functions for every plugin that
    // has supplied one, passing in all other plugins. Allows one plugin to check
    // for the presence of another plugin and read its config.
    //
    // These are not async but they run before plugin `startup` functions, so a plugin
    // can save off relevant config and handle it later in `startup`.
    const registerPluginHandlerFuncs = this.context.getFunctionsOfType("registerPluginHandler");
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
      for (const startupFunctionInfo of startupFunctionsRegisteredByPlugins) {
        Logger.info(`Running startup function "${startupFunctionInfo.func.name}" for plugin "${startupFunctionInfo.pluginName}"...`);
        const startTime = Date.now();
        await startupFunctionInfo.func(this.context); // eslint-disable-line no-await-in-loop
        const elapsedMs = Date.now() - startTime;
        Logger.info(`Startup function "${startupFunctionInfo.func.name}" for plugin "${startupFunctionInfo.pluginName}" finished in ${elapsedMs}ms`);
      }
    }
  }

  /**
   * @summary Creates the Apollo server and the Express app
   * @return {undefined}
   */
  initServer() {
    const { addCallMeteorMethod, debug, httpServer } = this.options;
    const { resolvers, schemas } = this.graphQL;

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

  /**
   * @summary Creates the Apollo server and the Express app, if necessary,
   *   and then starts it listening on `port`.
   * @param {Object} options Options object
   * @param {Number} [options.port] Port to listen on. If not provided,
   *   the server will be created but will not listen.
   * @return {Promise<undefined>} Nothing
   */
  async startServer({ port } = {}) {
    if (!this.httpServer) this.initServer();

    return new Promise((resolve, reject) => {
      if (!port) {
        resolve();
        return;
      }

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

  /**
   * @summary Starts the entire app. Connects to `mongoUrl`, builds the
   *   `context.collections`, runs plugin startup code, creates the
   *   Apollo server and the Express app as necessary, and then starts
   *   the server listening on `port` if `port` is provided.
   * @param {Object} options Options object
   * @param {String} options.mongoUrl MongoDB connection URL
   * @param {Number} [options.port] Port to listen on. If not provided,
   *   the server will be created but will not listen.
   * @return {Promise<undefined>} Nothing
   */
  async start({ mongoUrl, port } = {}) {
    // (1) Connect to MongoDB database
    await this.connectToMongo({ mongoUrl });

    // (2) Run service startup functions
    await this.runServiceStartup();

    // (3) Start the Express GraphQL server
    await this.startServer({ port });
  }

  /**
   * @summary Stops the entire app. Closes the MongoDB connection and
   *   stops the Express server listening.
   * @return {Promise<undefined>} Nothing
   */
  async stop() {
    // (1) Disconnect from MongoDB database
    await this.disconnectFromMongo();

    // (2) Stop the Express GraphQL server
    await this.stopServer();
  }

  /**
   * @summary Plugins should call this to register everything they provide.
   *   This is a non-Meteor replacement for the old `Reaction.registerPackage`.
   * @param {Object} plugin Plugin configuration object
   * @return {Promise<undefined>} Nothing
   */
  async registerPlugin(plugin = {}) {
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

    this._registerFunctionsByType(plugin.functionsByType, plugin.name);
  }
}
