import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
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
  const now = new Date();
  if (promotion.triggers && promotion.triggers.length) { // if there are no triggers, this is an error, but we'll let schema validation catch it
    const [firstTrigger] = promotion.triggers; // currently support only one trigger
    const { triggerKey } = firstTrigger;
    const trigger = promotions.triggers.find((tr) => tr.key === triggerKey);
    if (!trigger) throw new ReactionError("invalid-params", `No trigger found with key ${triggerKey}`);
    promotion.triggerType = trigger.type;
  }
  promotion.state = "created";
  promotion.createdAt = now;
  promotion.updatedAt = now;
  promotion.referenceId = await context.mutations.incrementSequence(context, promotion.shopId, "Promotions");

  PromotionSchema.validate(promotion);
  validateTriggerParams(context, promotion);
  validateActionParams(context, promotion);

  const results = await Promotions.insertOne(promotion);
  const { insertedCount, insertedId } = results;
  promotion._id = insertedId;
  return { success: insertedCount === 1, promotion };
}
