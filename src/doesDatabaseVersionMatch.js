import validateAndTransformVersion from "./validateAndTransformVersion.js";

const DEFAULT_MIGRATIONS_COLLECTION_NAME = "migrations";

/**
 * @summary Determines whether the version in the database for `namespace` is
 *   the expected one.
 * @param {Object} input Input object
 * @param {Db} db Mongo library Db instance, connected
 * @param {String|Number} expectedVersion Expected version. A number will be coerced into a string.
 * @param {String} [migrationsCollectionName] If you use a non-default migrations collection name,
 *   pass it here. Otherwise "migrations" will be used.
 * @param {String} namespace Migration namespace to check
 * @return {Boolean} True if they match exactly.
 */
export default async function doesDatabaseVersionMatch({
  db,
  expectedVersion,
  migrationsCollectionName = DEFAULT_MIGRATIONS_COLLECTION_NAME,
  namespace
}) {
  const doc = await db.collection(migrationsCollectionName).findOne({
    namespace
  }, {
    projection: {
      version: 1
    }
  });

  const currentVersion = doc && doc.version ? doc.version : "1-0";
  return validateAndTransformVersion(currentVersion) === validateAndTransformVersion(expectedVersion);
}
