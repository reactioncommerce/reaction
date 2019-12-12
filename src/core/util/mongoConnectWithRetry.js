import Logger from "@reactioncommerce/logger";
import mongodb from "mongodb";
import promiseRetry from "promise-retry";

const { MongoClient } = mongodb;

const mongoInitialConnectRetries = 10;

/**
 * @summary The MongoDB driver will auto-reconnect but not on the first connect.
 *   If the first connection fails, it throws. Because we expect to be in a dynamic
 *   Docker environment in which containers may start and slightly different times,
 *   we want to try to reconnect for a bit, even on the first connect.
 * @param {String} url MongoDB URL
 * @return {Object} Client
 */
export default function mongoConnectWithRetry(url) {
  return promiseRetry((retry, number) => {
    if (number > 1) {
      Logger.info(`Retrying connect to MongoDB... (${number - 1} of ${mongoInitialConnectRetries})`);
    } else {
      Logger.info("Connecting to MongoDB...");
    }

    return MongoClient.connect(url, {
      useNewUrlParser: true,
      // Uncomment this after this `mongodb` pkg bug is fixed:
      // https://jira.mongodb.org/browse/NODE-2249
      useUnifiedTopology: true
    }).then((client) => {
      Logger.info(`Connected to MongoDB. Database name: ${client.db().databaseName}`);
      return client;
    }).catch((error) => {
      if (error.name === "MongoNetworkError") {
        retry(error);
      } else {
        throw error;
      }
    });
  }, {
    factor: 1,
    minTimeout: 3000,
    retries: mongoInitialConnectRetries
  }).catch((error) => { throw error; });
}
