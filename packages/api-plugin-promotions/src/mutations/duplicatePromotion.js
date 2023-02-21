import _ from "lodash";
import Random from "@reactioncommerce/random";
import validateTriggerParams from "./validateTriggerParams.js";

/**
 * @summary duplicate an existing promotion to a new one
 * @param {Object} context - the per-request application context
 * @param {String} shopId - The shop id of the promotion to duplicate
 * @param {String} promotionId - The ID of the promotion you want to duplicate
 * @return {Promise<{success: boolean, promotion: *}|{success: boolean, errors: [{message: string}]}>} - return the newly created promotion or an array of errors
 */
export default async function duplicatePromotion(context, { shopId, promotionId }) {
  const { collections: { Promotions }, simpleSchemas: { Promotion: PromotionSchema } } = context;
  const now = new Date();
  const existingPromotion = await Promotions.findOne({ shopId, _id: promotionId });
  const newPromotion = _.cloneDeep(existingPromotion);
  newPromotion._id = Random.id();
  newPromotion.createdAt = now;
  newPromotion.updatedAt = now;
  newPromotion.state = "created";
  newPromotion.name = `Copy of ${existingPromotion.name}`;
  newPromotion.enabled = false;
  newPromotion.referenceId = await context.mutations.incrementSequence(context, newPromotion.shopId, "Promotions");
  PromotionSchema.validate(newPromotion);
  validateTriggerParams(context, newPromotion);
  const results = await Promotions.insertOne(newPromotion);
  const { insertedId } = results;
  if (!insertedId) {
    return {
      success: false,
      errors: [{
        message: "The record could not be inserted but no error was thrown"
      }]
    };
  }
  return {
    success: true,
    promotion: newPromotion
  };
}
