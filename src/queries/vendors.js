/**
 * @name vendors
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary get an array containing all the values for the `product.vendor` field in the Catalog
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String[]} [params.shopIds] - Optional IDs of the shop to get a list of vendors for
 * @param {String[]} [params.tagIds] - Optional IDs of the tags to get a list of vendors for
 * @returns {Object} - An aggregation object to be used by `getPaginatedResponseFromAggregate`
 */
export default async function vendors(context, { shopIds, tagIds } = {}) {
  const { collections } = context;
  const { Catalog } = collections;

  const query = {};

  if (shopIds) query.shopId = { $in: shopIds };
  if (tagIds) query["product.tagIds"] = { $in: tagIds };

  return {
    collection: Catalog,
    pipeline: [
      {
        $group: {
          _id: "$product.vendor",
          name: {
            $first: "$product.vendor"
          }
        }
      },
      {
        $project: {
          _id: false
        }
      }
    ]
  };
}
