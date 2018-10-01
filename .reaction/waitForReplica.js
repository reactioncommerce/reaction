const { MongoClient } = require("mongodb");

/**
 * Print a message to the console (no trailing newline)
 * @param {string} message User progress message to print
 * @returns {undefined}
 */
function defaultOut(message) {
  process.stdout.write(message);
}

/**
 * Print a message to the console (no trailing newline)
 * @param {Object} options - Named options object
 * @param {function()} options.out Function to show progress
 * @param {number} options.max Number of retries attempted before full failure
 * @param {function():Promise} options.check async/Promise function that implements
 *   the main check operation. Throw an exception to cause a retry. Resolve the
 *   promise to indicate success.
 * @param {number} options.waitMs milliseconds to wait between checks
 * @param {string} options.timeoutMessage for final timeout
 * @returns {Promise} a promise indicating success/failure of the check
 */
async function checkWaitRetry({
  out = defaultOut,
  max = 30,
  check = null,
  waitMs = 1000,
  timeoutMessage = "Timed out waiting for a prerequisite"
} = {}) {
  const messages = new Set();
  /**
   * Show a progress/info message, but not over and over again
   *
   * @param {string} message to be printed
   * @param {number} count retry number for progress dots
  * @returns {undefined}
  */
  function showOnce(message, count) {
    if (!messages.has(message)) {
      messages.add(message);
      out(message);
    }
    if (count % 10 === 0) {
      out(".");
    }
  }
  return new Promise((resolve, reject) => {
    let count = 0;
    /**
     * Inner retry loop. Resolves/rejects the promise when done.
     *
     * @returns {undefined}
     */
    function loop() {
      count += 1;
      if (count >= max) {
        reject(new Error(timeoutMessage));
        return;
      }
      check()
        .then(resolve)
        .catch((error) => {
          showOnce(error.message, count);
          setTimeout(loop, waitMs);
        });
    }
    loop();
  });
}

/**
 * Connect to mongodb
 *
 * @param {string} mongoUrl URL to mongodb server and database name
 * @returns {Promise} a promise resolving to the mongodb db instance
 */
async function connect(mongoUrl) {
  const lastSlash = mongoUrl.lastIndexOf("/");
  const dbUrl = mongoUrl.slice(0, lastSlash);
  const dbName = mongoUrl.slice(lastSlash + 1);

  const client = await MongoClient.connect(
    dbUrl,
    { useNewUrlParser: true }
  );
  return client.db(dbName);
}

/**
 * Check if replication is ready
 *
 * @param {objecct} db connected mongo db instance
 * @returns {Promise} indication of success/failure
 */
async function checkReplicaSetStatus(db) {
  const status = await db.admin().replSetGetStatus();
  if (status.ok !== 1) {
    throw new Error("Replica set not yet initialized");
  }
}

/**
 * Start the replica check/wait/retry loop
 * @returns {Promise} indication of success/failure
 */
async function main() {
  const { MONGO_URL } = process.env;
  if (!MONGO_URL) {
    throw new Error("You must set MONGO_URL environment variable.");
  }
  const db = await connect(MONGO_URL);
  await checkWaitRetry({
    timeoutMessage: "ERROR: MongoDB replica set not ready in time.",
    check: checkReplicaSetStatus.bind(null, db)
  });
  defaultOut("MongoDB replica set initialized and ready.\n");
  process.exit();
}

/**
 * Print an error message and exit with nonzero exit code
 *
 * @param {Error} error cause of failure
 * @returns {undefined} exits the process
 */
function exit(error) {
  console.error(error.message); // eslint-disable-line no-console
  process.exit(10);
}

// Allow this module to be run directly as a node program or imported as lib
if (require.main === module) {
  process.on("unhandledRejection", exit);
  try {
    main();
  } catch (error) {
    exit(error);
  }
}

module.exports = {
  checkWaitRetry
};
