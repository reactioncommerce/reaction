import { URL } from "url";
import { MongoClient } from "mongodb";
import Logger from "@reactioncommerce/logger";

/**
 * @summary Sleep for some milliseconds
 * @param {Number} ms Milliseconds to sleep for
 * @return {Promise<undefined>} Returns a promise that resolves after
 *   the specified number of milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Connect to mongodb
 *
 * @param {Object} parsedUrl URL to mongodb server and database name, parsed
 * @returns {Promise} a promise resolving to the mongodb db instance
 */
async function connect(parsedUrl) {
  const dbName = parsedUrl.pathname.slice(1);

  // clone to remove the DB name
  const dbParsedUrl = new URL(parsedUrl.toString());
  dbParsedUrl.pathname = "";
  const dbUrl = dbParsedUrl.toString();

  const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });

  return {
    client,
    db: client.db(dbName)
  };
}

/**
 * Runs the mongo command replSetInitiate,
 * which we need for the oplog for change streams
 *
 * @param {String} mongoUrl URL to mongodb
 * @returns {Promise} indication of success/failure
 */
export default async function initReplicaSet(mongoUrl) {
  const parsedUrl = new URL(mongoUrl);

  // eventually we should set `stopped = true` when the developer interrupts
  // the process
  const stopped = false;

  const canConnectTimestamp = Date.now();
  let db;
  let client;
  while (!stopped) {
    try {
      // eslint-disable-next-line no-await-in-loop
      ({ client, db } = await connect(parsedUrl));
    } catch (error) {
      if (Date.now() - canConnectTimestamp > 60000) {
        Logger.error(error);
        throw new Error("Unable to connect to MongoDB server after 1 minute");
      }
    }

    if (client) break;

    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }

  const replSetConfiguration = {
    _id: "rs0",
    version: 1,
    protocolVersion: 1,
    members: [{ _id: 0, host: parsedUrl.host, priority: 100 }]
  };

  try {
    const { config } = await db.admin().command({
      replSetGetConfig: 1
    });

    // If a replication set configuration already exists, it's
    // important that the new version number is greater than the old.
    if (config && typeof config.version === "number") {
      replSetConfiguration.version = config.version + 1;
    }
  } catch (error) {
    // Ignore NotYetInitialized and AlreadyInitialized because they are expected cases
    if (error.codeName !== "NotYetInitialized" && error.codeName !== "AlreadyInitialized") {
      throw new Error(`Error checking replica set config: ${error.message}${error.codeName ? ` (${error.codeName})` : ""}`);
    }
  }

  try {
    await db.admin().command({ replSetInitiate: replSetConfiguration });
  } catch (error) {
    if (error.codeName === "AlreadyInitialized") {
      await db.admin().command({ replSetReconfig: replSetConfiguration, force: true });
    } else {
      throw new Error(`Error initializing replica set: ${error.message}${error.codeName ? ` (${error.codeName})` : ""}`);
    }
  }

  // Wait until the primary is writable. If it isn't writable after one
  // minute, throw an error and report the replica set status.
  const writableTimestamp = Date.now();
  while (!stopped) {
    // eslint-disable-next-line no-await-in-loop
    const { ismaster } = await db.admin().command({ isMaster: 1 });

    if (ismaster) {
      break;
    } else if (Date.now() - writableTimestamp > 60000) {
      // eslint-disable-next-line no-await-in-loop
      const status = await db.admin().command({ replSetGetStatus: 1 });

      throw new Error(`Primary not writable after one minute. Last replica set status: ${JSON.stringify(status)}`);
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(50);
  }

  await client.close();
}
