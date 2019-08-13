/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tag ID or slug
 * @param {Object} context - an object containing the per-request state
 * @param {String} slugOrId - ID or slug of tag to query
 * @param {Boolean} [params.shouldIncludeInvisible] - Whether or not to include `isVisible=true` tags. Default is `false`
 * @returns {Object} - A Tag document if one was found
 */
export default async function tag(context, slugOrId, { shouldIncludeInvisible = false } = {}) {
  const { collections, userHasPermission } = context;
  const { Tags } = collections;
  let query = {
    $and: [
      { isVisible: true },
      { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
    ]
  };

  if (shouldIncludeInvisible === true) {
    const shopId = await context.queries.primaryShopId(context.collections);
    if (userHasPermission(["owner", "admin"], shopId)) {
      query = {
        $and: [
          { isVisible: { $in: [false, true] } },
          { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
        ]
      };
    }
  }

  return Tags.findOne(query);
}
