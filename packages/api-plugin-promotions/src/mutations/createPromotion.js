import Random from "@reactioncommerce/random";
import validateActionParams from "./validateActionParams.js";
import validateTriggerParams from "./validateTriggerParams.js";

/**
 * @summary create promotion
 * @param {Object} context - The application context
 * @param {Object} promotion - The promotion to create
 * @return {Promise<Object>} - The created promotion
 */
export default async function createPromotion(context, promotion) {
  const { collections: { Promotions }, simpleSchemas: { Promotion: PromotionSchema }, promotions } = context;
  promotion._id = Random.id();
  promotion.referenceId = await context.mutations.incrementSequence(context, promotion.shopId, "Promotions");

  PromotionSchema.validate(promotion);
  validateTriggerParams(context, promotion);
  validateActionParams(context, promotion);

  const results = await Promotions.insertOne(promotion);
  const { insertedCount, insertedId } = results;
  promotion._id = insertedId;
  return { success: insertedCount === 1, promotion };
}
