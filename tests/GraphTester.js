import mongodb, { MongoClient } from "mongodb";
import graphql from "graphql.js";
import findFreePort from "find-free-port";
import MongoDBMemoryServer from "mongodb-memory-server";
import createApolloServer from "../imports/plugins/core/graphql/server/createApolloServer";
import defineCollections from "../imports/collections/defineCollections";
import setUpFileCollections from "../imports/plugins/core/files/server/no-meteor/setUpFileCollections";
import methods from "../.reaction/devserver/methods";
import mutations from "../imports/plugins/core/graphql/server/mutations";
import queries from "../imports/plugins/core/graphql/server/queries";

const loginToken = "LOGIN_TOKEN";
const hashedToken = "5b4TxnA+4UFjJLDxvntNe8D6VXzVtiRXyKFo8mta+wU=";

class GraphTester {
  constructor() {
    this.collections = {};

    this.app = createApolloServer({
      context: {
        collections: this.collections,
        methods,
        mutations,
        queries
      },
      debug: true
    });
  }

  mutate = (...args) => this.graphClient.mutate(...args);

  query = (...args) => this.graphClient.query(...args);

  subscribe = (...args) => this.graphClient.subscribe(...args);

  async setLoggedInUser(user = {}) {
    if (!user._id) throw new Error("setLoggedInUser: user must have _id property set");

    await this.collections.users.insert({
      ...user,
      services: {
        resume: {
          loginTokens: [
            {
              hashedToken,
              when: new Date()
            }
          ]
        }
      }
    });

    await this.collections.Accounts.insert({ ...user, userId: user._id });

    this.userId = user._id;
    this.setLoginToken(loginToken);
  }

  async clearLoggedInUser() {
    this.clearLoginToken();
    if (!this.userId) return;

    await this.collections.users.remove({
      _id: this.userId
    });

    await this.collections.Accounts.remove({
      userId: this.userId
    });

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

    return this.collections.Shops.insert({
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
      domains: [domain]
    });
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

export default GraphTester;
