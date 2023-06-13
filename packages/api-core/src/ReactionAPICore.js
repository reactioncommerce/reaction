/* eslint-disable no-extra-bind */
import { createRequire } from "module";
import diehard from "diehard";
import express from "express";
import _ from "lodash";
import * as mongodb from "mongodb";
import SimpleSchema from "simpl-schema";
import collectionIndex from "@reactioncommerce/api-utils/collectionIndex.js";
import getAbsoluteUrl from "@reactioncommerce/api-utils/getAbsoluteUrl.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Logger from "@reactioncommerce/logger";
import builtInAppEvents from "./util/appEvents.js";
import checkAppEventsInterface from "./util/checkAppEventsInterface.js";
import initReplicaSet from "./util/initReplicaSet.js";
import mongoConnectWithRetry from "./util/mongoConnectWithRetry.js";
import config from "./config.js";
import createApolloServer from "./createApolloServer.js";
import importPluginsJSONFile from "./importPluginsJSONFile.js";
import coreResolvers from "./graphql/resolvers/index.js";

const require = createRequire(import.meta.url); // eslint-disable-line
const { PubSub } = require("graphql-subscriptions");
const { RedisPubSub } = require("graphql-redis-subscriptions");

const coreGraphQLSchema = importAsString("./graphql/schema.graphql");
const coreGraphQLSubscriptionSchema = importAsString("./graphql/subscription.graphql");

const {
  REACTION_APOLLO_FEDERATION_ENABLED,
  REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED,
  MONGO_URL,
  PORT,
  REACTION_LOG_LEVEL,
  REACTION_SHOULD_INIT_REPLICA_SET,
  ROOT_URL
} = config;

const debugLevels = ["DEBUG", "TRACE"];

// When you update this, also update "ReactionAPICore Configuration" in README
const optionsSchema = new SimpleSchema({
  "appEvents": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "httpServer": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "mongodb": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "serveStaticPaths": {
    type: Array,
    optional: true
  },
  "serveStaticPaths.$": String,
  "rootUrl": {
    type: String,
    optional: true
  },
  "version": {
    type: String,
    optional: true
  }
});

const connectOptionsSchema = new SimpleSchema({
  mongoUrl: {
    type: String,
    optional: true
  }
});

const startServerOptionsSchema = new SimpleSchema({
  port: {
    type: SimpleSchema.Integer,
    optional: true
  },
  silent: {
    type: Boolean,
    optional: true
  }
});

const startOptionsSchema = new SimpleSchema({
  mongoUrl: {
    type: String,
    optional: true
  },
  port: {
    type: SimpleSchema.Integer,
    optional: true
  },
  shouldInitReplicaSet: {
    type: Boolean,
    optional: true
  },
  silent: {
    type: Boolean,
    optional: true
  }
});

const listenForDeath = _.once(diehard.listen.bind(diehard));

const getPubSub = () => {
  const {
    REDIS_PUB_SUB_URL,
    REDIS_PUB_SUB_HOST,
    REDIS_PUB_SUB_PORT,
    REDIS_PUB_SUB_USERNAME,
    REDIS_PUB_SUB_PASSWORD,
    REDIS_PUB_SUB_DB
  } = config;

  if (REDIS_PUB_SUB_URL) {
    Logger.info("Using Redis url as PubSub", { REDIS_PUB_SUB_URL });
    return new RedisPubSub({ connection: REDIS_PUB_SUB_URL });
  }
  if (REDIS_PUB_SUB_HOST) {
    Logger.info("Using Redis host as PubSub", { REDIS_PUB_SUB_HOST, REDIS_PUB_SUB_PORT, REDIS_PUB_SUB_DB });
    return new RedisPubSub({
      connection: {
        host: REDIS_PUB_SUB_HOST,
        port: REDIS_PUB_SUB_PORT,
        db: REDIS_PUB_SUB_DB,
        username: REDIS_PUB_SUB_USERNAME,
        password: REDIS_PUB_SUB_PASSWORD
      }
    });
  }
  Logger.info("Using built-in memory PubSub");
  return new PubSub();
};

export default class ReactionAPICore {
  constructor(options = {}) {
    optionsSchema.validate(options);

    if (options.appEvents) {
      checkAppEventsInterface(options.appEvents);
    }

    this.options = { ...options };

    this.collections = {};

    this.version = options.version || null;

    this.context = {
      app: this,
      appEvents: options.appEvents || builtInAppEvents,
      appVersion: this.version,
      auth: {},
      collections: this.collections,
      /**
       * @summary When calling a query or mutation function that checks permissions from another
       *   query or mutation where you have already checked permissions, or from system code such
       *   as a background job or ETL process, call `context.getInternalContext()` and pass the
       *   result as the `context` argument. This will bypass all permission checks in the function
       *   you are calling.
       * @return {Object} Context object with permission to do anything
       */
      getInternalContext: () => ({
        ...this.context,
        account: null,
        accountId: null,
        isInternalCall: true,
        user: null,
        userHasPermission: async () => true,
        userId: null,
        validatePermissions: async () => undefined
      }),
      getFunctionsOfType: (type) =>
        (this.functionsByType[type] || []).map(({ func }) => func),
      mutations: {},
      queries: {},
      // In a large production app, you may want to use an external pub-sub system.
      // See https://www.apollographql.com/docs/apollo-server/features/subscriptions.html#PubSub-Implementations
      // We may eventually bind this directly to Kafka.
      pubSub: getPubSub()
    };

    const schemas = [coreGraphQLSchema];

    if (REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED) {
      schemas.push(coreGraphQLSubscriptionSchema);
      this.hasSubscriptionsEnabled = true;
    } else {
      this.hasSubscriptionsEnabled = false;
    }

    this.functionsByType = {};
    this.graphQL = {
      resolvers: {},
      schemas,
      typeDefsObj: []
    };

    _.merge(this.graphQL.resolvers, coreResolvers);

    // Passing in `rootUrl` option is mostly for tests. Recommend using ROOT_URL env variable.
    const resolvedRootUrl = options.rootUrl || ROOT_URL;

    this.rootUrl = resolvedRootUrl.endsWith("/")
      ? resolvedRootUrl
      : `${resolvedRootUrl}/`;
    this.context.rootUrl = this.rootUrl;
    this.context.getAbsoluteUrl = (path) =>
      getAbsoluteUrl(this.context.rootUrl, path);

    this.registeredPlugins = {};
    this.expressMiddleware = [];

    this.mongodb = options.mongodb || mongodb;
  }

  _registerFunctionsByType(functionsByType, pluginName) {
    if (functionsByType) {
      Object.keys(functionsByType).forEach((type) => {
        if (!Array.isArray(this.functionsByType[type])) {
          this.functionsByType[type] = [];
        }
        functionsByType[type].forEach((func) => {
          const entryWithSameName = this.functionsByType[type].find((existingEntry) => existingEntry.func.name === func.name);
          if (entryWithSameName) {
            Logger.warn(`Plugin "${pluginName}" registers a function of type "${type}" named "${func.name}", ` +
                `but plugin "${entryWithSameName.pluginName}" has already registered a function of type "${type}" named "${entryWithSameName.func.name}".` +
                " We recommend you choose a unique and descriptive name for all functions passed to `functionsByType` to help with debugging.");
          }

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
   * @returns {undefined}
   */
  async setMongoDatabase(db) {
    this.db = db;

    // Reset these
    this.collections = {};
    this.context.collections = this.collections;

    // Loop through all registered plugins
    for (const pluginName in this.registeredPlugins) {
      if ({}.hasOwnProperty.call(this.registeredPlugins, pluginName)) {
        const pluginConfig = this.registeredPlugins[pluginName];

        // If a plugin config has `collections` key
        if (pluginConfig.collections) {
          // Loop through `collections` object keys
          for (const collectionKey in pluginConfig.collections) {
            if (
              {}.hasOwnProperty.call(pluginConfig.collections, collectionKey)
            ) {
              const collectionConfig = pluginConfig.collections[collectionKey];

              // Validate that the `collections` key value is an object and has `name`
              if (
                !collectionConfig ||
                typeof collectionConfig.name !== "string" ||
                collectionConfig.name.length === 0
              ) {
                throw new Error(`In registerPlugin, collection "${collectionKey}" needs a name property`);
              }

              // Validate that the `collections` key hasn't already been taken by another plugin
              if (this.collections[collectionKey]) {
                throw new Error(`Plugin ${pluginName} defines a collection with key "${collectionKey}" in registerPlugin,` +
                    " but another plugin has already defined a collection with that key");
              }

              // Pass through certain supported collection options
              const collectionOptions = {};
              if (collectionConfig.jsonSchema) {
                collectionOptions.validator = {
                  $jsonSchema: collectionConfig.jsonSchema
                };
              } else if (collectionConfig.validator) {
                collectionOptions.validator = collectionConfig.validator;
              }

              if (collectionConfig.validationLevel) {
                collectionOptions.validationLevel =
                  collectionConfig.validationLevel;
              }
              if (collectionConfig.validationAction) {
                collectionOptions.validationAction =
                  collectionConfig.validationAction;
              }

              /* eslint-disable promise/no-promise-in-callback */

              // Add the collection instance to `context.collections`.
              // If the collection already exists, we need to modify it instead of calling
              // `createCollection`, in order to add validation options.
              // eslint-disable-next-line no-await-in-loop
              this.collections[collectionKey] = await this.getCollection(collectionConfig, collectionOptions);
              this.applyMongoV3BackwardCompatible(this.collections[collectionKey]);

              // If the collection config has `indexes` key, define all requested indexes
              if (Array.isArray(collectionConfig.indexes)) {
                const indexingPromises = collectionConfig.indexes.map((indexArgs) =>
                  collectionIndex(
                    this.collections[collectionKey],
                    ...indexArgs
                  ));
                await Promise.all(indexingPromises); // eslint-disable-line no-await-in-loop
              }
            }
          }
        }
      }
    }
  }

  /**
   * @summary Get legacy collection object
   * @param {Object} collectionConfig - The collection config
   * @param {Object} collectionOptions - The collection options
   * @returns {Object} - legacy collection
   */
  async getCollection(collectionConfig, collectionOptions) {
    try {
      return this.db.collection(collectionConfig.name, collectionOptions);
    } catch {
      return this.db
        .command({ collMod: collectionConfig.name, ...collectionOptions });
    }
  }

  /**
   * @summary Apply MongoV3 backward compatible
   * @param {Object} collection - The legacy collection object
   * @returns {undefined} Nothing
   */
  applyMongoV3BackwardCompatible(collection) {
    const prevFind = collection.find.bind(collection);
    collection.find = ((...args) => {
      const result = prevFind(...args);
      result.cmd = { query: result[Reflect.ownKeys(result).find((symbol) => String(symbol) === "Symbol(filter)")] };
      result.options = { db: collection.s.db };
      result.ns = `${collection.s.namespace.db}.${collection.s.namespace.collection}`;
      return result;
    }).bind(collection);

    const acknowledgedToOk = (acknowledged) => (acknowledged ? 1 : 0);

    const prevDeleteOne = collection.deleteOne.bind(collection);
    collection.deleteOne = (async (...args) => {
      const response = await prevDeleteOne(...args);
      // eslint-disable-next-line id-length
      return { ...response, result: { n: response.deletedCount, ok: acknowledgedToOk(response.acknowledged) } };
    }).bind(collection);

    collection.removeOne = collection.deleteOne.bind(collection);

    const prevUpdateMany = collection.updateMany.bind(collection);
    collection.updateMany = (async (...args) => {
      const response = await prevUpdateMany(...args);
      // eslint-disable-next-line id-length
      return { ...response, result: { n: response.modifiedCount, ok: acknowledgedToOk(response.acknowledged) } };
    }).bind(collection);

    const prevInsertOne = collection.insertOne.bind(collection);
    collection.insertOne = (async (...args) => {
      const response = await prevInsertOne(...args);
      const insertedCount = response.acknowledged ? 1 : 0;
      // eslint-disable-next-line id-length
      return { ...response, insertedCount, result: { n: insertedCount, ok: acknowledgedToOk(response.acknowledged) } };
    }).bind(collection);

    const prevFindOneAndUpdate = collection.findOneAndUpdate.bind(collection);
    collection.findOneAndUpdate = (async (...args) => {
      const options = args[2];
      if (options && typeof options.returnOriginal !== "undefined") {
        args[2].returnDocument = options.returnOriginal ? mongodb.ReturnDocument.BEFORE : mongodb.ReturnDocument.AFTER;
      }
      const response = await prevFindOneAndUpdate(...args);
      return { ...response, modifiedCount: response.lastErrorObject.n };
    }).bind(collection);

    const prevReplaceOne = collection.replaceOne.bind(collection);
    collection.replaceOne = (async (...args) => {
      const response = await prevReplaceOne(...args);
      // eslint-disable-next-line id-length
      return { ...response, result: { n: response.modifiedCount, ok: acknowledgedToOk(response.acknowledged) } };
    }).bind(collection);

    const prevUpdateOne = collection.updateOne.bind(collection);
    collection.updateOne = (async (...args) => {
      const response = await prevUpdateOne(...args);
      // eslint-disable-next-line id-length
      return { ...response, result: { n: response.modifiedCount, ok: acknowledgedToOk(response.acknowledged) } };
    }).bind(collection);

    const prevBulkWrite = collection.bulkWrite.bind(collection);
    collection.bulkWrite = (async (...args) => {
      const response = await prevBulkWrite(...args);
      const {
        nInserted,
        nUpserted,
        nMatched,
        nModified,
        nRemoved
      } = response.result;
      return {
        ...response,
        nInserted,
        nUpserted,
        nMatched,
        nModified,
        nRemoved,
        insertedCount: nInserted,
        matchedCount: nMatched,
        modifiedCount: nModified,
        deletedCount: nRemoved,
        upsertedCount: nUpserted
      };
    }).bind(collection);
  }

  /**
   * @summary Given a MongoDB URL, creates a connection to it, sets `this.mongoClient`,
   *   calls `this.setMongoDatabase` with the database instance, and then
   *   resolves the Promise.
   * @param {Object} options Options object
   * @param {String} [options.mongoUrl] MongoDB connection URL. Default is MONGO_URL env.
   * @returns {Promise<undefined>} Nothing
   */
  async connectToMongo(options = {}) {
    connectOptionsSchema.validate(options);

    const { mongoUrl = MONGO_URL } = options;

    const client = await mongoConnectWithRetry(mongoUrl);

    this.mongoClient = client;
    await this.setMongoDatabase(client.db()); // Uses db name from the connection string
  }

  async disconnectFromMongo() {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }

  /**
   * @summary Calls all `registerPluginHandler` type functions from all registered
   *   plugins, and then calls all `startup` type functions in series, in the order
   *   in which they were registered.
   * @returns {Promise<undefined>} Nothing
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

    // Reaction 3.0.0 removes the old migrations system, which tracked a single
    // database version in a single document in a Migrations collection. We
    // require that you have run all 2.x migrations before upgrading to 3.0.0+.
    // If no migration control record is found, we assume that it's a new
    // database or you have intentionally removed it after running all necessary
    // 2.x migrations.
    const migrationsControl = await this.db
      .collection("Migrations")
      .findOne({ _id: "control" });
    if (migrationsControl && migrationsControl.version < 76) {
      throw new Error(`Detected a migration version (${migrationsControl.version}) for the previous migration system, which is less than 76.` +
          " This likely means that you have not run all 2.x migrations. You must complete the upgrade to at least 2.7.0 before upgrading to 3.0.0 or higher.");
    }

    const preStartupFunctionsRegisteredByPlugins = this.functionsByType
      .preStartup;
    if (Array.isArray(preStartupFunctionsRegisteredByPlugins)) {
      // We are intentionally running these in series, in the order in which they were registered
      for (const preStartupFunctionInfo of preStartupFunctionsRegisteredByPlugins) {
        Logger.info(`Running pre-startup function "${preStartupFunctionInfo.func.name}" for plugin "${preStartupFunctionInfo.pluginName}"...`);
        const startTime = Date.now();
        await preStartupFunctionInfo.func(this.context); // eslint-disable-line no-await-in-loop
        const elapsedMs = Date.now() - startTime;
        Logger.info(`pre-startup function "${preStartupFunctionInfo.func.name}" for plugin "${preStartupFunctionInfo.pluginName}" finished in ${elapsedMs}ms`);
      }
    }

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
   * @returns {undefined}
   */
  async initServer() {
    const { httpServer: defaultHttpService, serveStaticPaths = [] } = this.options;
    const { apolloServer, expressApp, path, httpServer } = await createApolloServer({
      context: this.context,
      debug: debugLevels.includes(REACTION_LOG_LEVEL),
      expressMiddleware: this.expressMiddleware,
      ...this.graphQL,
      functionsByType: this.functionsByType,
      defaultHttpService
    });

    this.apolloServer = apolloServer;
    this.expressApp = expressApp;
    this.graphQLPath = path;

    this.graphQLServerUrl = getAbsoluteUrl(this.rootUrl, path);

    // HTTP server for GraphQL subscription websocket handlers
    this.httpServer = httpServer;

    if (
      REACTION_APOLLO_FEDERATION_ENABLED &&
      REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED
    ) {
      throw new Error("Subscriptions are not supported with Apollo Federation. Set `REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED=false` to disable subscriptions.");
    }

    if (REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED) {
      this.graphQLServerSubscriptionUrl = getAbsoluteUrl(
        this.rootUrl.replace("http", "ws"),
        "/graphql"
      );
    }

    // Serve files in the /public folder statically
    for (const staticPath of serveStaticPaths) {
      this.expressApp.use(express.static(staticPath));
    }
  }

  /**
   * @summary Creates the Apollo server and the Express app, if necessary,
   *   and then starts it listening on `port`.
   * @param {Object} options Options object
   * @param {Number} [options.port] Port to listen on. If not provided,
   *   the server will be created but will not listen.
   * @param {Boolean} [options.silent=false] Don't log info when the server starts listening
   * @returns {Promise<undefined>} Nothing
   */
  async startServer(options = {}) {
    startServerOptionsSchema.validate(options);

    const { port, silent } = options;

    if (!this.httpServer) await this.initServer();

    return new Promise((resolve, reject) => {
      if (!port) {
        resolve();
        return;
      }

      try {
        this.httpServer.on("error", (error) => {
          throw error;
        });

        // To also listen for WebSocket connections for GraphQL
        // subs, this needs to be `this.httpServer.listen`
        // rather than `this.expressApp.listen`.
        this.httpServer.listen({ port }, () => {
          this.serverPort = port;

          if (!silent) {
            Logger.info(`GraphQL listening at ${this.graphQLServerUrl} (port ${port ||
                "unknown"})`);

            if (this.hasSubscriptionsEnabled) {
              Logger.info(`GraphQL subscriptions ready at ${
                this.graphQLServerSubscriptionUrl
              } (port ${port || "unknown"})`);
            }
          }

          resolve();
        });
      } catch (error) {
        if (error.code === "EADDRINUSE") {
          this.retryStartServer(port, silent);
        } else {
          reject(error);
        }
      }
    });
  }

  async retryStartServer(port, silent) {
    Logger.error(`Port ${port} is in use. Stop whatever is listening on that port. Retrying in 5 seconds...`);
    setTimeout(() => {
      const stopStart = async () => {
        await this.stopServer();
        await this.startServer({ port, silent });
      };

      stopStart.catch((error) => {
        throw error;
      });
    }, 5000);
  }

  async stopServer() {
    if (!this.httpServer || !this.httpServer.listening) return null;
    return new Promise((resolve, reject) => {
      this.httpServer.close((error) => {
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
   * @param {String} [options.mongoUrl] MongoDB connection URL. If not provided,
   *   the MONGO_URL environment variable is used.
   * @param {Number} [options.port] Port to listen on. If not provided,
   *   the PORT environment variable is used, which defaults to 3000.
   *   If set to `null`, the server will be created but will not listen.
   * @param {Number} [options.shouldInitReplicaSet] Automatically initialize a
   *   replica set for the MongoDB instance. Set this to `true` when running
   *   the app for development or tests.
   * @param {Boolean} [options.silent=false] Don't log info when the server starts listening
   * @returns {Promise<undefined>} Nothing
   */
  async start(options = {}) {
    startOptionsSchema.validate(options);

    const {
      mongoUrl = MONGO_URL,
      shouldInitReplicaSet = REACTION_SHOULD_INIT_REPLICA_SET,
      silent = false
    } = options;

    // Allow passing `port: null` to skip listening. Otherwise default to PORT env.
    let { port } = options;
    if (port === undefined) port = PORT;

    diehard.register((done) => {
      Logger.info("Stopping Reaction API...");

      /* eslint-disable promise/no-callback-in-promise */
      this.stop()
        .then(() => {
          Logger.info("Reaction API stopped");
          done();
          return null;
        })
        .catch((error) => {
          Logger.error(error);
          done();
        });
    });

    listenForDeath();

    if (shouldInitReplicaSet) {
      try {
        await initReplicaSet(mongoUrl);
      } catch (error) {
        Logger.warn(`Failed to initialize a MongoDB replica set. This may result in errors or some things not working. Error: ${error.message}`);
      }
    }

    // (1) Connect to MongoDB database
    await this.connectToMongo({ mongoUrl });

    // (2) Init the server here. Some startup may need `app.expressApp`
    this.initServer();

    // (3) Run service startup functions
    await this.runServiceStartup();

    // (4) Start the Express GraphQL server
    await this.startServer({ port, silent });
  }

  /**
   * @summary Stops the entire app. Closes the MongoDB connection and
   *   stops the Express server listening.
   * @returns {Promise<undefined>} Nothing
   */
  async stop() {
    // (1) Stop the Express GraphQL server
    await this.stopServer();

    // (2) Run all "shutdown" functions registered by plugins
    const shutdownFunctionsRegisteredByPlugins = this.functionsByType.shutdown;
    if (Array.isArray(shutdownFunctionsRegisteredByPlugins)) {
      // We are intentionally running these in series, in the order in which they were registered
      for (const shutdownFunctionInfo of shutdownFunctionsRegisteredByPlugins) {
        Logger.info(`Running shutdown function "${shutdownFunctionInfo.func.name}" for plugin "${shutdownFunctionInfo.pluginName}"...`);
        const startTime = Date.now();
        await shutdownFunctionInfo.func(this.context); // eslint-disable-line no-await-in-loop
        const elapsedMs = Date.now() - startTime;
        Logger.info(`Shutdown function "${shutdownFunctionInfo.func.name}" for plugin "${shutdownFunctionInfo.pluginName}" finished in ${elapsedMs}ms`);
      }
    }

    // (3) Stop app events since the handlers will not have database access after this point
    this.context.appEvents.stop();

    // (4) Disconnect from MongoDB database
    await this.disconnectFromMongo();
  }

  /**
   * @summary Plugins should call this to register everything they provide.
   *   This is a non-Meteor replacement for the old `Reaction.registerPackage`.
   * @param {Object} plugin Plugin configuration object
   * @returns {Promise<undefined>} Nothing
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
        if (!this.hasSubscriptionsEnabled && plugin.graphQL.resolvers.Subscription) {
          Logger.info(`Plugin "${plugin.name}" registered a GraphQL Subscription resolver, but subscriptions are disabled. Skipping.`);
          delete plugin.graphQL.resolvers.Subscription;
        }
        _.merge(this.graphQL.resolvers, plugin.graphQL.resolvers);
      }
      if (plugin.graphQL.schemas) {
        if (this.hasSubscriptionsEnabled) {
          this.graphQL.schemas.push(...plugin.graphQL.schemas);
        } else {
          const filteredSchemas = plugin.graphQL.schemas.filter((schema) => !schema.includes("type Subscription"));
          if (filteredSchemas.length !== plugin.graphQL.schemas.length) {
            Logger.info("Plugin registered GraphQL schemas with Subscription types, but subscriptions are disabled. Skipping.");
          }
          this.graphQL.schemas.push(...filteredSchemas);
        }
      }
      if (plugin.graphQL.typeDefsObj) {
        this.graphQL.typeDefsObj.push(...plugin.graphQL.typeDefsObj);
      }
    }

    if (plugin.mutations) {
      _.merge(this.context.mutations, plugin.mutations);
    }

    if (plugin.queries) {
      _.merge(this.context.queries, plugin.queries);
    }

    if (plugin.auth) {
      Object.keys(plugin.auth).forEach((key) => {
        if (this.context.auth[key]) {
          throw new Error(`Plugin "${plugin.name} tried to register auth function "${key}" but another plugin already registered this type of function`);
        }
        this.context.auth[key] = plugin.auth[key];
      });
    }

    this._registerFunctionsByType(plugin.functionsByType, plugin.name);

    if (Array.isArray(plugin.expressMiddleware)) {
      this.expressMiddleware.push(...plugin.expressMiddleware.map((def) => ({
        ...def,
        pluginName: plugin.name
      })));
    }

    if (plugin.contextAdditions) {
      Object.keys(plugin.contextAdditions).forEach((key) => {
        if ({}.hasOwnProperty.call(this.context, key)) {
          throw new Error(`Plugin ${plugin.name} is trying to add ${key} key to context but it's already there`);
        }
        this.context[key] = plugin.contextAdditions[key];
      });
    }

    Logger.info(`Registered plugin ${plugin.name} (${plugin.version || "no version"})`);
  }

  /**
   * @summary Register all plugins in the order listed. Each plugin may be the
   *   object with the registration info or a function that takes the API
   *   instance and will call `registerPlugin` on its own.
   * @param {Object} plugins Object listing plugins like:
   *   {
   *     name: function or registration object
   *   }
   * @returns {Promise<undefined>} Nothing
   */
  async registerPlugins(plugins) {
    /* eslint-disable no-await-in-loop */
    for (const [name, plugin] of Object.entries(plugins)) {
      if (typeof plugin === "function") {
        await plugin(this);
      } else if (typeof plugin === "object") {
        await this.registerPlugin(plugin);
      } else {
        Logger.error(
          { name, plugin },
          "Plugin is not a function or object and was skipped"
        );
      }
    }
    /* eslint-enable no-await-in-loop */
  }
}

ReactionAPICore.importPluginsJSONFile = importPluginsJSONFile;
