import { URL } from "url";
import Logger from "@reactioncommerce/logger";
import mongoConnectWithRetry from "./mongoConnectWithRetry.js";

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
 * Runs the mongo command replSetInitiate,
 * which we need for the oplog for change streams
 *
 * @param {String} mongoUrl URL to mongodb
 * @returns {Promise} indication of success/failure
 */
export default async function initReplicaSet(mongoUrl) {
  Logger.info("Initializing MongoDB replica set...");
  const parsedUrl = new URL(mongoUrl);

  // eventually we should set `stopped = true` when the developer interrupts
  // the process
  const stopped = false;

  const client = await mongoConnectWithRetry(mongoUrl);
  const db = client.db(); // Uses db name from the connection string

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
      throw new Error(`Error initializing replica set: ${error.message} (${error.codeName})`);
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
  Logger.info("Finished MongoDB replica set initialization");
}
