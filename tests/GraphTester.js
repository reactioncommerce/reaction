import util from "util";
import { merge } from "lodash";
import graphql from "graphql.js";
import findFreePort from "find-free-port";
import Datastore from "nedb";
import Cursor from "nedb/lib/cursor";
import createApolloServer from "../imports/plugins/core/graphql/server/createApolloServer";
import defineCollections from "../imports/plugins/core/graphql/server/defineCollections";
import methods from "../.reaction/devserver/methods";
import queries from "../imports/plugins/core/graphql/server/queries";

const loginToken = "LOGIN_TOKEN";
const hashedToken = "5b4TxnA+4UFjJLDxvntNe8D6VXzVtiRXyKFo8mta+wU=";

// nedb does not fully and correctly implement the latest
// MongoDB Cursor schema, so we make some adjustments here
Object.assign(Cursor.prototype, {
  get cmd() {
    return { query: this.query };
  },
  filter(query) {
    merge(this.query, query);
    return this;
  },
  ns: "reaction.collection",
  toArray() {
    return util.promisify(this.exec.bind(this))();
  },
  clone() {
    const clonedCursor = new Cursor(this.db, merge({}, this.query), this.execFn);
    clonedCursor._limit = this._limit;
    clonedCursor._skip = this._skip;
    clonedCursor._sort = this._sort ? merge({}, this._sort) : this._sort;
    clonedCursor._projection = this._projection ? merge({}, this._projection) : this._projection;
    return clonedCursor;
  },
  async count() {
    const values = await this.toArray();
    return values.length;
  }
});

Object.defineProperty(Cursor.prototype, "options", {
  get: function options() {
    return {
      db: {
        collection: () => this.db,
        databaseName: "reaction"
      }
    };
  }
});

// nedb does not have the Promise API, so we need to create it for everything we await
["findOne", "_insert", "_update", "_remove", "count"].forEach((prop) => {
  Datastore.prototype[prop] = util.promisify(Datastore.prototype[prop]);
});

function getLocalDb() {
  const db = {};
  db.collection = () => new Datastore();
  return db;
}

class GraphTester {
  constructor() {
    this.db = getLocalDb();

    this.collections = {};
    defineCollections(this.db, this.collections);

    this.app = createApolloServer({
      context: {
        collections: this.collections,
        methods,
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
}

export default GraphTester;
