import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { methodSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  method: methodSchema,
  methodId: String,
  shopId: String
});

/**
 * @method updateFlatRateFulfillmentMethod
 * @summary updates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `method` property containing the updated method
 */
export default async function updateFlatRateFulfillmentMethod(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, methodId, shopId } = cleanedInput;
  const { collections: { Fulfillment } } = context;
  const method = { ...inputMethod };

  if (!methodId) throw new ReactionError("invalid-parameter", "Method ID to be updated not provided");
  await context.validatePermissions(`reaction:legacy:fulfillmentMethods:${methodId}`, "update", { shopId });

  // MongoDB schema still uses `enabled` rather than `isEnabled`
  method.enabled = method.isEnabled;
  delete method.isEnabled;

  // Hardcoded field, each ff-method plugin has to introduce this field for grouping purpose
  // Schema defined as optional=true for backward compatibility
  method.fulfillmentMethod = "flatRate";

  const { matchedCount } = await Fulfillment.updateOne({
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

  inputMethod._id = methodId;

  return { method: inputMethod };
}
