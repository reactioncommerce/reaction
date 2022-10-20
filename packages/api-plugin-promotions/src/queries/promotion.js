/**
 * @summary return a single promotion based on shopId and _id
 * @param {Object} context - the application context
 * @param {String} shopId - The id of the shop
 * @param {String} _id - The unencoded id of the promotion
 * @return {Object} - The promotion or null
 */
export default async function promotion(context, { shopId, _id }) {
  const { collections: { Promotions } } = context;
  const singlePromotion = await Promotions.findOne({ shopId, _id });
  return singlePromotion;
}
