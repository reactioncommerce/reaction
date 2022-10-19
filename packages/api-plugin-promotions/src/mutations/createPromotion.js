import Random from "@reactioncommerce/random";
import validateTriggerParams from "./validateTriggerParams.js";

/**
 * @summary create promotion
 * @param {Object} context - The application context
 * @param {Object} promotion - The promotion to create
 * @return {Promise<Object>} - The created promotion
 */
export default async function createPromotion(context, promotion) {
  const { collections: { Promotions }, simpleSchemas: { Promotion: PromotionSchema } } = context;
  promotion._id = Random.id();
  PromotionSchema.validate(promotion);
  validateTriggerParams(context, promotion);
  const results = await Promotions.insertOne(promotion);
  const { insertedCount, insertedId } = results;
  promotion._id = insertedId;
  return { success: insertedCount === 1, promotion };
}
