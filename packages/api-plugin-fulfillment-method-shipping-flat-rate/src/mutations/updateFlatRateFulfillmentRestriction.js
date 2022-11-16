import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { restrictionSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  restrictionId: String,
  restriction: restrictionSchema,
  shopId: String
});


/**
 * @method updateFlatRateFulfillmentRestriction
 * @summary updates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `restriction` property containing the updated method
 */
export default async function updateFlatRateFulfillmentRestriction(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { restriction, restrictionId, shopId } = cleanedInput;
  const { collections: { FulfillmentRestrictions } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentRestrictions", "update", { shopId });

  const { matchedCount } = await FulfillmentRestrictions.updateOne({
    _id: restrictionId,
    shopId
  }, {
    $set: {
      ...restriction
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  return {
    restriction: {
      _id: restrictionId,
      shopId,
      ...restriction
    }
  };
}
