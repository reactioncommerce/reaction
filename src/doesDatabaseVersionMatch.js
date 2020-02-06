import validateAndTransformVersion from "./validateAndTransformVersion.js";

const DEFAULT_MIGRATIONS_COLLECTION_NAME = "migrations";

/**
 * @summary Determines whether the version in the database for `namespace` is
 *   the expected one.
 * @param {Object} input Input object
 * @param {Db} db Mongo library Db instance, connected
 * @param {String|Number} expectedVersion Expected version. A number will be coerced into a string.
 * @param {String} [migrationsCollectionName=migrations] If you use a non-default migrations collection name,
 *   pass it here. Otherwise "migrations" will be used.
 * @param {String} namespace Migration namespace to check
 * @param {Boolean|Function} [setToExpectedIfMissing=false] Defines what to do if no current
 *   version is found for this track in the database. By default, the check will fail. That is,
 *   we will assume that some data must need to be migrated. If you have a way of checking whether
 *   it's an empty database or confirming that no migrations are needed, you can do that and pass
 *   `true` here. Then the check will succeed and the current version for the track will be set to
 *   `expectedVersion`. Alternatively, pass a function that returns a Promise that returns `true`
 *   or `false`. This way you can avoid database lookups unless a decision is necessary.
 * @return {Boolean} True if they match exactly.
 */
export default async function doesDatabaseVersionMatch({
  db,
  expectedVersion,
  migrationsCollectionName = DEFAULT_MIGRATIONS_COLLECTION_NAME,
  namespace,
  setToExpectedIfMissing = false
}) {
  const collection = db.collection(migrationsCollectionName);

  const doc = await collection.findOne({
    namespace
  }, {
    projection: {
      version: 1
    }
  });

  const cleanedExpectedVersion = validateAndTransformVersion(expectedVersion);

  let compareVersion;
  if (!doc || typeof doc.version !== "string") {
    let shouldSetIt = false;
    if (typeof setToExpectedIfMissing === "function") {
      shouldSetIt = await setToExpectedIfMissing();
    } else if (typeof setToExpectedIfMissing === "boolean") {
      shouldSetIt = setToExpectedIfMissing;
    }

    if (shouldSetIt) {
      await collection.insertOne({
        namespace,
        version: cleanedExpectedVersion
      });

      return true;
    }

    compareVersion = "1-0";
  } else {
    compareVersion = validateAndTransformVersion(doc.version);
  }

  return compareVersion === cleanedExpectedVersion;
}
