import arrayJoinPlusRemainingQuery from "@reactioncommerce/api-utils/arrayJoinPlusRemainingQuery.js";

/**
 * @name queries.productsByTagId
 * @method
 * @memberof Tags/Queries
 * @summary get a list of products by tag id
 * @param {Object} context - an object containing the per-request state
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.shopId] - Shop ID
 * @param {String} [params.tagId] - Tag ID
 * @param {String} [params.query] - Query string
 * @returns {Promise<Array<Object>>} array of TagProducts
 */
export default async function productsByTagId(context, params) {
  const { connectionArgs, shopId, tagId, query } = params;
  const { collections } = context;
  const { Products, Tags } = collections;

  await context.validatePermissions(`reaction:legacy:tags:${tagId}`, "read", { shopId });

  let joinSelector = { hashtags: tagId, shopId };

  // filter by query
  if (query) {
    const cond = {
      $regex: query,
      $options: "i"
    };
    joinSelector = {
      ...joinSelector,
      $or: [
        {
          _id: cond
        },
        {
          title: cond
        }, {
          pageTitle: cond
        }, {
          description: cond
        }]
    };
  }

  return arrayJoinPlusRemainingQuery({
    arrayFieldPath: "featuredProductIds",
    collection: Tags,
    connectionArgs,
    joinCollection: Products,
    joinFieldPath: "_id",
    joinSelector,
    joinSortOrder: "asc",
    positionFieldName: "position",
    selector: { _id: tagId },
    sortByForRemainingDocs: "createdAt",
    sortOrderForRemainingDocs: "asc"
  });
}
