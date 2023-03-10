/**
 * @name fulfillmentMethods
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Fulfillment collection for a list of fulfillment Methods
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.shopId - The shop id of the fulfillment types
 * @param {String} input.fulfillmentTypeId - The fulfillmentType id of the fulfillment type
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function fulfillmentMethods(context, input) {
  const { collections: { Fulfillment } } = context;
  const { shopId, fulfillmentTypeId } = input;

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "read", { shopId });

  // aggregate pipeline to extract fulfillment methods inside Fulfillment collection
  return {
    collection: Fulfillment,
    pipeline: [
      {
        $match: {
          shopId,
          _id: fulfillmentTypeId
        }
      },
      {
        $unwind: "$methods"
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$methods",
              {
                fulfillmentTypeId: "$$ROOT._id",
                shopId: "$$ROOT.shopId"
              }
            ]
          }
        }
      }
    ]
  };
}
