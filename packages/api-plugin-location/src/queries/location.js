/**
 * @summary return a single location based on shopId and _id
 * @param {Object} context - the application context
 * @param {String} shopId - The id of the shop
 * @param {String} _id - The unencoded id of the location
 * @return {Promise<Object>} - The location or null
 */
export default async function location(context, { shopId, _id }) {
  const { collections: { Locations } } = context;
  const singleLocation = await Locations.findOne({ shopId, _id });
  return singleLocation;
}
