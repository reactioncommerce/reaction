import { merge } from "lodash";
import mongodb, { MongoClient } from "mongodb";
import MongoDBMemoryServer from "mongodb-memory-server";
import { gql, PubSub } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Random from "@reactioncommerce/random";
import appEvents from "../imports/node-app/core/util/appEvents";
import buildContext from "../imports/node-app/core/util/buildContext";
import createApolloServer from "../imports/node-app/core/createApolloServer";
import defineCollections from "../imports/node-app/core/util/defineCollections";
import Factory from "../imports/test-utils/helpers/factory";
import hashLoginToken from "../imports/node-app/core/util/hashLoginToken";
import setUpFileCollections from "../imports/plugins/core/files/server/no-meteor/setUpFileCollections";
import coreMediaXform from "../imports/plugins/core/files/server/no-meteor/xforms/xformFileCollectionsProductMedia";
import mutations from "../imports/node-app/devserver/mutations";
import queries from "../imports/node-app/devserver/queries";
import importedSchemas from "../imports/node-app/devserver/schemas";
import importedResolvers from "../imports/node-app/devserver/resolvers";
import registerPlugins from "../imports/node-app/devserver/registerPlugins";
import "../imports/node-app/devserver/extendSchemas";

class TestApp {
  constructor(options = {}) {
    const { additionalCollections = [], extraSchemas = [] } = options;

    this.options = { ...options };
    this.collections = { ...additionalCollections };
    this.context = {
      ...(options.context || {}),
      app: this,
      appEvents,
      collections: this.collections,
      getFunctionsOfType: (type) => {
        let funcs;
        switch (type) {
          case "xformCatalogProductMedia":
            funcs = [coreMediaXform];
            break;
          default:
            funcs = this.functionsByType[type] || [];
        }
        return funcs;
      },
      pubSub: new PubSub(),
      mutations: { ...mutations },
      queries: { ...queries }
    };

    this.functionsByType = {};
    this.graphQL = {
      resolvers: { ...importedResolvers },
      schemas: [...importedSchemas, ...extraSchemas]
    };
    this.registeredPlugins = {};

    if (options.functionsByType) {
      Object.keys(options.functionsByType).forEach((type) => {
        if (!Array.isArray(this.functionsByType[type])) {
          this.functionsByType[type] = [];
        }
        this.functionsByType[type].push(...options.functionsByType[type]);
      });
    }
  }

  mutate = (mutation) => async (variables) => {
    const result = await this.graphClient.mutate({ mutation: gql(mutation), variables });
    if (result.errors) throw result.errors;
    return result.data;
  };

  query = (query) => async (variables) => {
    const result = await this.graphClient.query({ query: gql(query), variables });
    if (result.errors) throw result.errors;
    return result.data;
  };

  async createUserAndAccount(user = {}, globalRoles) {
    await this.collections.users.insertOne({
      ...user,
      roles: {
        ...(user.roles || {}),
        __global_roles__: globalRoles || [] // eslint-disable-line camelcase
      },
      services: {
        resume: {
          loginTokens: []
        }
      }
    });

    await this.collections.Accounts.insertOne({ ...user, userId: user._id });
  }

  async setLoggedInUser(user = {}) {
    if (!user._id) throw new Error("setLoggedInUser: user must have _id property set");

    const loginToken = Random.id();
    const hashedToken = hashLoginToken(loginToken);

    const existing = await this.collections.users.findOne({ _id: user._id });
    if (!existing) {
      await this.createUserAndAccount(user);
    }

    // Set the hashed login token on the users document
    await this.collections.users.updateOne({ _id: user._id }, {
      $push: {
        "services.resume.loginTokens": {
          hashedToken,
          when: new Date()
        }
      }
    });

    this.userId = user._id;

    const dbUser = await this.collections.users.findOne({ _id: user._id });
    this.context.user = dbUser;
  }

  async clearLoggedInUser() {
    this.userId = null;
    this.context.user = null;
  }

  async publishProducts(productIds) {
    const requestContext = { ...this.context };
    await buildContext(requestContext);
    requestContext.userHasPermission = () => true;
    return this.context.mutations.publishProducts(requestContext, productIds);
  }

  async insertPrimaryShop(shopData) {
    // Need shop domains and ROOT_URL set in order for `shopId` to be correctly set on GraphQL context
    const domain = "shop.fake.site";
    process.env.ROOT_URL = `https://${domain}/`;

    const mockShop = Factory.Shop.makeOne({
      currencies: {
        USD: {
          enabled: true,
          format: "%s%v",
          symbol: "$"
        }
      },
      currency: "USD",
      name: "Primary Shop",
      ...shopData,
      shopType: "primary",
      domains: [domain]
    });

    const result = await this.collections.Shops.insertOne(mockShop);

    return result.insertedId;
  }

  // Keep this in sync with the real `registerPlugin` in `ReactionNodeApp`
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
    const { resolvers, schemas } = this.graphQL;

    const { apolloServer, expressApp } = createApolloServer({
      addCallMeteorMethod(context) {
        context.callMeteorMethod = (name) => {
          console.warn(`The "${name}" Meteor method was called. The method has not yet been converted to a mutation that` + // eslint-disable-line no-console
            " works outside of Meteor. If you are relying on a side effect or return value from this method, you may notice unexpected behavior.");
          return null;
        };
      },
      context: this.context,
      schemas,
      resolvers
      // Uncomment this if you need to debug a test. Otherwise we keep debug mode off to avoid extra
      // error logging in the test output.
      // debug: true
    });

    this.app = expressApp;
    this.graphClient = createTestClient(apolloServer);
  }

  async startMongo() {
    this.mongoServer = new MongoDBMemoryServer();
    const mongoUri = await this.mongoServer.getConnectionString();
    this.connection = await MongoClient.connect(mongoUri, { useNewUrlParser: true });
    this.db = this.connection.db(await this.mongoServer.getDbName());

    defineCollections(this.db, this.collections);

    const { Media } = setUpFileCollections({
      absoluteUrlPrefix: "http://fake.com",
      db: this.db,
      Logger: { info: console.info.bind(console) }, // eslint-disable-line no-console
      MediaRecords: this.collections.MediaRecords,
      mongodb
    });

    this.collections.Media = Media;
  }

  stopMongo() {
    this.connection.close();
    this.mongoServer.stop();
  }

  async start() {
    await registerPlugins(this);
    this.initServer();
    await this.startMongo();
  }

  async stop() {
    this.stopMongo();
  }
}

export default TestApp;
