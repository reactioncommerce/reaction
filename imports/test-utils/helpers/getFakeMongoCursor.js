/**
 * Helper functions for use in Jest tests
 * @namespace TestHelpers
 */

/**
 * @name getFakeMongoCursor
 * @method
 * @memberof TestHelpers
 * @param {String} collectionName - name of the collection
 * @param {Any} results - results to be returned as part of the cursor
 * @param {Object} options - options to pass to the query
 * @returns {Object} fake cursor
 */
export default function getFakeMongoCursor(collectionName, results, options) {
  const cursor = {
    cmd: {
      query: (options && options.query) || {}
    },
    ns: `meteor.${collectionName}`,
    options: {
      db: {
        databaseName: "meteor"
      }
    }
  };

  const isTesting = typeof jest !== "undefined";

  if (isTesting) {
    cursor.clone = jest.fn().mockName("cursor.clone").mockImplementation(() => cursor);
    cursor.count = jest.fn().mockName("cursor.count").mockReturnValue(results.length);
    cursor.filter = jest.fn().mockName("cursor.filter").mockReturnValue(cursor);
    cursor.hasNext = jest.fn().mockName("cursor.hasNext").mockReturnValue(false);
    cursor.limit = jest.fn().mockName("cursor.limit").mockReturnValue(cursor);
    cursor.options.db.collection = jest.fn().mockName("cursor.options.db.collection").mockReturnValue({
      findOne: jest.fn().mockName("cursor.options.db.collection.findOne").mockResolvedValue(null)
    });
    cursor.rewind = jest.fn().mockName("cursor.rewind").mockReturnValue(cursor);
    cursor.skip = jest.fn().mockName("cursor.skip").mockReturnValue(cursor);
    cursor.sort = jest.fn().mockName("cursor.sort").mockReturnValue(cursor);
    cursor.toArray = jest.fn().mockName("cursor.toArray").mockResolvedValue(results);
  } else {
    cursor.clone = () => cursor;
    cursor.count = () => results.length;
    cursor.filter = () => cursor;
    cursor.limit = () => cursor;
    cursor.options.db.collection = () => ({
      findOne: () => Promise.resolve(null)
    });
    cursor.skip = () => cursor;
    cursor.sort = () => cursor;
    cursor.toArray = () => Promise.resolve(results);
  }

  return cursor;
}
