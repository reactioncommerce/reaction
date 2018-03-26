/**
 * @name getFakeMongoCursor
 * @param {String} collectionName - name of the collection
 * @param {Any} results - results to be returned as part of the cursor
 * @return {Object} fake cursor
 */
export default function getFakeMongoCursor(collectionName, results) {
  const cursor = {
    clone: () => ({
      count: () => results.length
    }),
    cmd: {
      query: {}
    },
    filter: () => cursor,
    limit: () => cursor,
    ns: `meteor.${collectionName}`,
    options: {
      db: {
        collection: () => ({
          findOne: () => Promise.resolve(null)
        }),
        databaseName: "meteor"
      }
    },
    skip: () => cursor,
    sort: () => cursor,
    toArray() {
      return Promise.resolve(results);
    }
  };
  return cursor;
}
