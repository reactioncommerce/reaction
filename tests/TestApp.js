import mongodb, { MongoClient } from "mongodb";
import graphql from "graphql.js";
import findFreePort from "find-free-port";
import MongoDBMemoryServer from "mongodb-memory-server";
import Random from "@reactioncommerce/random";
import appEvents from "../imports/plugins/core/core/server/appEvents";
import createApolloServer from "../imports/node-app/core/createApolloServer";
import defineCollections from "../imports/node-app/core/util/defineCollections";
import Factory from "../imports/test-utils/helpers/factory";
import hashLoginToken from "../imports/node-app/core/util/hashLoginToken";
import setUpFileCollections from "../imports/node-app/services/files/setUpFileCollections";

class TestApp {
  constructor() {
    this.collections = {};

    this.app = createApolloServer({
      addCallMeteorMethod(context) {
        context.callMeteorMethod = (name) => {
          console.warn(`The "${name}" Meteor method was called. The method has not yet been converted to a mutation that` + // eslint-disable-line no-console
            " works outside of Meteor. If you are relying on a side effect or return value from this method, you may notice unexpected behavior.");
          return null;
        };
      },
      context: {
        appEvents,
        collections: this.collections
      },
      debug: true
    });
  }

  mutate = (...args) => this.graphClient.mutate(...args);

  query = (...args) => this.graphClient.query(...args);

  subscribe = (...args) => this.graphClient.subscribe(...args);

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
    this.setLoginToken(loginToken);
  }

  async clearLoggedInUser() {
    this.clearLoginToken();
    this.userId = null;
  }

  setLoginToken(token) {
    this.graphClient.headers({ "meteor-login-token": token });
  }

  clearLoginToken() {
    this.setLoginToken(null);
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
    this.connection = await MongoClient.connect(mongoUri);
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

  async startServer() {
    const port = await findFreePort(4040);
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(String(port), () => {
          this.graphClient = graphql(`http://localhost:${port}/graphql-alpha`, { asJSON: true });
          resolve(port);
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
    await this.startMongo();
    await this.startServer();
  }

  async stop() {
    this.stopMongo();
    await this.stopServer();
  }
}

export default TestApp;
