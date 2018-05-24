/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tag ID or slug
 * @param {Object} context - an object containing the per-request state
 * @param {String} slugOrId - ID or slug of tag to query
 * @return {Object} - A Tag document if one was found
 */
export default async function tag(context, slugOrId) {
  const { collections } = context;

  const { Tags } = collections;
  const query = {
    $or: [
      { _id: slugOrId },
      { slug: slugOrId }
    ]
  };

  return Tags.findOne(query);
}
