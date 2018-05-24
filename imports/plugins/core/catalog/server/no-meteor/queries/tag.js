/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tagId
 * @param {Object} context - an object containing the per-request state
 * @param {String} tagId - ID of tag to query
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tag(context, tagId) {
  const { collections } = context;

  const { Tags } = collections;
  const query = {
    $or: [
      { _id: tagId },
      { slug: tagId }
    ]
  };

  return Tags.findOne(query);
}
