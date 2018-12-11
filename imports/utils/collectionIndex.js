/**
 * @name collectionIndex
 * @private
 * @param {RawMongoCollection} collection the collection
 * @param {Object} index field to index
* @returns {undefined}
 *
 * Sets up necessary indexes on the Catalog collection
 */
export default async function collectionIndex(collection, index) {
  try {
    await collection.createIndex(index, { background: true });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}
