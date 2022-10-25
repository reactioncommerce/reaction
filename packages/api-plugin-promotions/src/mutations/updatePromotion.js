import validateTriggerParams from "./validateTriggerParams.js";

/**
 * @summary update a single promotion
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId of the promotion to pdate
 * @param {Object} promotion - The body of the promotion to update
 * @return {Promise<Object>} - updated Promotion
 */
export default async function updatePromotion(context, { shopId, promotion }) {
  const { collections: { Promotions }, simpleSchemas: { Promotion: PromotionSchema } } = context;
  PromotionSchema.validate(promotion);
  validateTriggerParams(context, promotion);
  const { _id } = promotion;
  const results = await Promotions.updateOne({ _id, shopId }, { $set: promotion });
  const { modifiedCount } = results;
  return { success: !!modifiedCount, promotion };
}
