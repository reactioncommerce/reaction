/**
 * @name flatRateFulfillmentMethods
 * @method
 * @memberof Fulfillment/Queries
 * @summary Query the Shipping collection for a list of fulfillment methods
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Request input
 * @param {String} input.shopId - The shop id of the fulfillment methods
 * @returns {Promise<Object>} Mongo cursor
 */
export default async function flatRateFulfillmentMethods(context, input) {
  const { collections } = context;
  const { Shipping } = collections;
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:shippingMethods", "read", {
    shopId
  });

  // aggregate pipeline to extract fulfillment methods inside shippment
  return {
    collection: Shipping,
    pipeline: [
      {
        $match: {
          "provider.name": "flatRates",
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
