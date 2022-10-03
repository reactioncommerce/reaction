const FF_TYPE = "shipping";
const FF_METHOD = "flatRate";
const COLL_DEST = "Fulfillment";

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  progress(0);

  const operations = [];

  const ffTypeUpdate = {
    updateMany: {
      filter: { fulfillmentType: { $exists: false } },
      update: {
        $set: {
          fulfillmentType: FF_TYPE
        }
      }
    }
  };

  const ffMethodUpdate = {
    updateMany: {
      filter: { methods: { $exists: true } },
      update: {
        $set: {
          "methods.$[eachMethod].fulfillmentMethod": FF_METHOD
        }
      },
      arrayFilters: [
        {
          "eachMethod.fulfillmentMethod": { $exists: false }
        }
      ]
    }
  };

  operations.push(ffTypeUpdate);
  operations.push(ffMethodUpdate);

  await db.collections(COLL_DEST).bulkWrite(operations);

  progress(100);
}

export default {
  down: "impossible", // We are not tracking the updated documents, hence cannot revert
  up
};
