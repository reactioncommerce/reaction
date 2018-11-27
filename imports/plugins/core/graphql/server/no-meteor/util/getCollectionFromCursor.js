/**
 * @name getCollectionFromCursor
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Get the associated Mongo Collection instance for a given Cursor instance
 */
export default function getCollectionFromCursor(cursor) {
  const { db } = cursor.options;
  const collectionName = cursor.ns.slice(db.databaseName.length + 1);
  return db.collection(collectionName);
}
