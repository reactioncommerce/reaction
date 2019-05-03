import Logger from "@reactioncommerce/logger";

// Do this migration in batches of 200 to avoid memory issues
const LIMIT = 200;

/**
 * @summary Find documents in a collection that need to be converted, and convert them
 *   in small batches.
 * @param {Object} options Options
 * @param {Object} options.collection The Mongo collection instance
 * @param {Function} options.converter Conversion function for a single doc
 * @param {Object} [options.query] Optional MongoDB query that will only find not-yet-converted docs
 * @returns {undefined}
 */
export default async function findAndConvertInBatchesNoMeteor({ collection, converter, query = {} }) {
  let docs;
  let skip = 0;

  /* eslint-disable no-await-in-loop */
  do {
    docs = await collection.find(query, {
      limit: LIMIT,
      skip,
      sort: {
        _id: 1
      }
    }).toArray();
    skip += LIMIT;

    if (docs.length) {
      Logger.debug(
        { name: "migrations" },
        `Migrating batch of ${docs.length} ${collection.collectionName} documents matching query ${JSON.stringify(query)}`
      );
      let operations = await Promise.all(docs.map(async (doc) => {
        const replacement = await converter(doc);
        if (replacement) {
          return {
            replaceOne: {
              filter: { _id: doc._id },
              replacement
            }
          };
        }
        return null;
      }));

      // Remove nulls
      operations = operations.filter((op) => !!op);

      await collection.bulkWrite(operations, { ordered: false });
    }
  } while (docs.length);
}
