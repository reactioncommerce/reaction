/**
 * @name flatRateFulfillmentMethods
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Fulfillment collection for a list of fulfillment methods
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.shopId - The shop id of the fulfillment methods
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function flatRateFulfillmentMethods(context, input) {
  const { collections: { Fulfillment } } = context;
  const { shopId } = input;
  const fulfillmentTypeName = "shipping";
  const fulfillmentMethodName = "flatRate";

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "read", { shopId });

  // aggregate pipeline to extract fulfillment methods inside shippment
  return {
    collection: Fulfillment,
    pipeline: [
      {
        $match: {
          "fulfillmentType": fulfillmentTypeName,
          "methods.fulfillmentMethod": fulfillmentMethodName,
          shopId
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
                shopId: "$$ROOT.shopId"
              }
            ]
          }
        }
      }
    ]
  };
}
