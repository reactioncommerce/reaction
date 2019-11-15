/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tag ID or slug
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input input of tag query
 * @param {String} input.shopId - shopId of tag
 * @param {String} input.slugOrId - ID or slug of tag to query
 * @param {Boolean} [input.shouldIncludeInvisible] - Whether or not to include `isVisible=true` tags. Default is `false`
 * @returns {Object} - A Tag document if one was found
 */
export default async function tag(context, input) {
  const { collections, userHasPermission } = context;
  const { Tags } = collections;
  const { slugOrId, shopId, shouldIncludeInvisible = false } = input;
  let query = {
    $and: [
      { isVisible: true },
      { shopId },
      { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
    ]
  };

  if (shouldIncludeInvisible === true) {
    if (userHasPermission(["owner", "admin"], shopId)) {
      query = { $or: [{ _id: slugOrId }, { slug: slugOrId }] };
    }
  }

  return Tags.findOne(query);
}
