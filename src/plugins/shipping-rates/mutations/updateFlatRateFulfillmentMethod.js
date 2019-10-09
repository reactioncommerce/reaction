import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import methodSchema from "../util/methodSchema.js";

const inputSchema = new SimpleSchema({
  method: methodSchema,
  methodId: String,
  shopId: String
});

/**
 * @method updateFlatRateFulfillmentMethodMutation
 * @summary updates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `method` property containing the updated method
 */
export default async function updateFlatRateFulfillmentMethodMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method, methodId, shopId } = cleanedInput;
  const { collections, userHasPermission } = context;
  const { Shipping } = collections;

  if (!userHasPermission(["admin", "owner", "shipping"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // MongoDB schema still uses `enabled` rather than `isEnabled`
  method.enabled = method.isEnabled;
  delete method.isEnabled;

  const { matchedCount } = await Shipping.updateOne({
    "methods._id": methodId,
    shopId
  }, {
    $set: {
      "methods.$": {
        ...method,
        _id: methodId
      }
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  return { method };
}
