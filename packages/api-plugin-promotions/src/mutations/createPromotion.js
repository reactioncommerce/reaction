import Random from "@reactioncommerce/random";
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
  const now = new Date();
  const { triggerKey } = promotions.triggers[0];
  const trigger = promotions.triggers.find((tr) => tr.triggerKey === triggerKey);
  promotion.triggerType = trigger.type;
  promotion.state = "created";
  promotion.createdAt = now;
  promotion.updatedAt = now;
  promotion.referenceId = await context.mutations.incrementSequence(context, promotion.shopId, "Promotions");
  PromotionSchema.validate(promotion);
  validateTriggerParams(context, promotion);
  const results = await Promotions.insertOne(promotion);
  const { insertedCount, insertedId } = results;
  promotion._id = insertedId;
  return { success: insertedCount === 1, promotion };
}
