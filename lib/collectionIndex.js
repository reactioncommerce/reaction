/**
 * @name collectionIndex
 * @summary Sets up necessary indexes on a collection. A wrapper around `createIndex`
 * @param {RawMongoCollection} collection the collection
 * @param {Object} index field or fields to index
 * @param {Object} [options] createIndex options. `background: true` is added automatically
 * @returns {Promise<undefined>} Promise that resolves with undefined
 */
export default async function collectionIndex(collection, index, options = {}) {
  try {
    await collection.createIndex(index, { background: true, ...options });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}
