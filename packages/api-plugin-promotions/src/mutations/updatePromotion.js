import validateTriggerParams from "./validateTriggerParams.js";

/**
 * @summary update a single promotion
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId of the promotion to update
 * @param {Object} promotion - The body of the promotion to update
 * @return {Promise<Object>} - updated Promotion
 */
export default async function updatePromotion(context, { shopId, promotion }) {
  const { collections: { Promotions }, simpleSchemas: { Promotion: PromotionSchema } } = context;
  const now = new Date();
  promotion.updatedAt = now;
  const modifier = { $set: promotion };
  PromotionSchema.validate(modifier, { modifier: true });
  validateTriggerParams(context, promotion);
  const { _id } = promotion;
  const results = await Promotions.findOneAndUpdate({ _id, shopId }, modifier, { returnDocument: "after" });
  const { modifiedCount, value } = results;
  return { success: !!modifiedCount, promotion: value };
}
