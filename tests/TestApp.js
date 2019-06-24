import MongoDBMemoryServer from "mongodb-memory-server";
import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionNodeApp from "../imports/node-app/core/ReactionNodeApp";
import buildContext from "../imports/node-app/core/util/buildContext";
import Factory from "../imports/test-utils/helpers/factory";
import hashLoginToken from "../imports/node-app/core/util/hashLoginToken";
import registerPlugins from "../imports/node-app/registerPlugins";
import "../imports/node-app/extendSchemas";

class TestApp {
  constructor(options = {}) {
    const { extraSchemas = [], functionsByType } = options;

    this.reactionNodeApp = new ReactionNodeApp({
      addCallMeteorMethod(context) {
        context.callMeteorMethod = (name) => {
          console.warn(`The "${name}" Meteor method was called. The method has not yet been converted to a mutation that` + // eslint-disable-line no-console
            " works outside of Meteor. If you are relying on a side effect or return value from this method, you may notice unexpected behavior.");
          return null;
        };
      },
      // Uncomment this if you need to debug a test. Otherwise we keep debug mode off to avoid extra
      // error logging in the test output.
      // debug: true,
      context: {
        createUser: async (userInfo) => {
          const { email, name, username } = userInfo;

          const user = {
            _id: Random.id(),
            createdAt: new Date(),
            emails: [
              {
                address: email,
                verified: true,
                provides: "default"
              }
            ],
            name,
            services: {
              password: {
                bcrypt: Random.id(29)
              },
              resume: {
                loginTokens: []
              }
            },
            username
          };

          await this.reactionNodeApp.collections.users.insertOne(user);

          await this.reactionNodeApp.collections.Accounts.insertOne({ ...user, userId: user._id });
        },
        rootUrl: "https://shop.fake.site/"
      },
      functionsByType,
      graphQL: {
        schemas: extraSchemas
      }
    });

    this.collections = this.reactionNodeApp.collections;
    this.context = this.reactionNodeApp.context;
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
    await this.reactionNodeApp.collections.users.insertOne({
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

    await this.reactionNodeApp.collections.Accounts.insertOne({ ...user, userId: user._id });
  }

  async setLoggedInUser(user = {}) {
    if (!user._id) throw new Error("setLoggedInUser: user must have _id property set");

    const { users } = this.reactionNodeApp.collections;

    const loginToken = Random.id();
    const hashedToken = hashLoginToken(loginToken);

    const existing = await users.findOne({ _id: user._id });
    if (!existing) {
      await this.createUserAndAccount(user);
    }

    // Set the hashed login token on the users document
    await users.updateOne({ _id: user._id }, {
      $push: {
        "services.resume.loginTokens": {
          hashedToken,
          when: new Date()
        }
      }
    });

    this.userId = user._id;

    const dbUser = await users.findOne({ _id: user._id });
    this.reactionNodeApp.context.user = dbUser;
  }

  async clearLoggedInUser() {
    this.userId = null;
    this.reactionNodeApp.context.user = null;
  }

  async publishProducts(productIds) {
    const requestContext = { ...this.reactionNodeApp.context };
    await buildContext(requestContext);
    requestContext.userHasPermission = () => true;
    return this.reactionNodeApp.context.mutations.publishProducts(requestContext, productIds);
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

    const result = await this.reactionNodeApp.collections.Shops.insertOne(mockShop);

    return result.insertedId;
  }

  // Keep this in sync with the real `registerPlugin` in `ReactionNodeApp`
  async registerPlugin(plugin) {
    return this.reactionNodeApp.registerPlugin(plugin);
  }

  async runServiceStartup() {
    return this.reactionNodeApp.runServiceStartup();
  }

  async startMongo() {
    this.mongoServer = new MongoDBMemoryServer();
    const mongoUrl = await this.mongoServer.getConnectionString();
    return mongoUrl;
  }

  stopMongo() {
    this.mongoServer.stop();
  }

  async start() {
    try {
      await registerPlugins(this.reactionNodeApp);
    } catch (error) {
      Logger.error(error, "Error registering plugins in TestApp");
      throw error;
    }

    const mongoUrl = await this.startMongo();

    // We intentionally do not pass `port` option, which prevents
    // it from starting the actual server. We will use
    // `createTestClient` below instead of an actual server.
    try {
      await this.reactionNodeApp.start({ mongoUrl });
    } catch (error) {
      Logger.error(error, "Error starting app in TestApp");
      throw error;
    }

    this.graphClient = createTestClient(this.reactionNodeApp.apolloServer);
  }

  async stop() {
    await this.reactionNodeApp.stop();
    this.stopMongo();
  }
}

export default TestApp;
