// Do this migration in batches of 200 to avoid memory issues
const LIMIT = 200;

/**
 * @summary Find documents in a collection that need to be converted, and convert them
 *   in small batches.
 * @param {Object} options Options
 * @param {Object} options.collection The Meteor collection instance
 * @param {Object} [options.query] Optional MongoDB query that will only find not-yet-converted docs
 * @param {Function} options.converter Conversion function for a single doc
 * @returns {undefined}
 */
export default function findAndConvertInBatches({ collection, converter }) {
  let docs;
  let skip = 0;

  do {
    docs = collection.find({}, {
      limit: LIMIT,
      skip,
      sort: {
        _id: 1
      }
    }).fetch();
    skip += LIMIT;

    if (docs.length) {
      docs.forEach((doc) => {
        collection.update({
          _id: doc._id
        }, converter(doc), { bypassCollection2: true });
      });
    }
  } while (docs.length);
}
