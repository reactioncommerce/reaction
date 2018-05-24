/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tagId
 * @param {Object} context - an object containing the per-request state
 * @param {String} slugOrId - ID or Slug of tag to query
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
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
