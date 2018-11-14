import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import surchargeSchema from "../util/surchargeSchema";

const inputSchema = new SimpleSchema({
  surcharge: surchargeSchema,
  shopId: String
});


/**
 * @method updateSurchargeMutation
 * @summary updates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @return {Promise<Object>} An object with a `surcharge` property containing the updated method
 */
export default async function updateSurchargeMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { surcharge, surchargeId, shopId } = cleanedInput;
  const { collections, userHasPermission } = context;
  const { FlatRateFulfillmentSurcharges } = collections;

  if (!userHasPermission(["admin", "owner", "shipping"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const { matchedCount } = await FlatRateFulfillmentSurcharges.updateOne({
    _id: surchargeId,
    shopId
  }, {
    $set: {
      _id: surchargeId,
      ...surcharge
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  return { surcharge };
}
