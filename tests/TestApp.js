import mongodb, { MongoClient } from "mongodb";
import MongoDBMemoryServer from "mongodb-memory-server";
import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Random from "@reactioncommerce/random";
import appEvents from "../imports/node-app/core/util/appEvents";
import createApolloServer from "../imports/node-app/core/createApolloServer";
import defineCollections from "../imports/node-app/core/util/defineCollections";
import Factory from "../imports/test-utils/helpers/factory";
import hashLoginToken from "../imports/node-app/core/util/hashLoginToken";
import setUpFileCollections from "../imports/plugins/core/files/server/no-meteor/setUpFileCollections";
import coreMediaXform from "../imports/plugins/core/files/server/no-meteor/xforms/xformFileCollectionsProductMedia";
import mutations from "../imports/node-app/devserver/mutations";
import queries from "../imports/node-app/devserver/queries";
import schemas from "../imports/node-app/devserver/schemas";
import resolvers from "../imports/node-app/devserver/resolvers";

class TestApp {
  constructor(options = { extraSchemas: [] }) {
    this.collections = {};
    this.context = {
      appEvents,
      collections: this.collections,
      getFunctionsOfType: (type) => {
        let funcs;
        switch (type) {
          case "xformCatalogProductMedia":
            funcs = [coreMediaXform];
            break;
          default:
            funcs = [];
        }
        return funcs;
      },
      mutations,
      queries
    };

    const { apolloServer, expressApp } = createApolloServer({
      addCallMeteorMethod(context) {
        context.callMeteorMethod = (name) => {
          console.warn(`The "${name}" Meteor method was called. The method has not yet been converted to a mutation that` + // eslint-disable-line no-console
            " works outside of Meteor. If you are relying on a side effect or return value from this method, you may notice unexpected behavior.");
          return null;
        };
      },
      context: this.context,
      schemas: [...schemas, ...options.extraSchemas],
      resolvers
      // Uncomment this if you need to debug a test. Otherwise we keep debug mode off to avoid extra
      // error logging in the test output.
      // debug: true
    });

    this.app = expressApp;
    this.graphClient = createTestClient(apolloServer);
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
      name: "Primary Shop",
      ...shopData,
      domains: [domain]
    });

    const result = await this.collections.Shops.insertOne(mockShop);

    return result.insertedId;
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
    await this.startMongo();
  }

  async stop() {
    this.stopMongo();
  }
}

export default TestApp;
