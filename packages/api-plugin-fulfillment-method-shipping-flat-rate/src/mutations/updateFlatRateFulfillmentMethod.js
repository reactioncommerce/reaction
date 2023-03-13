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
 * @param {Object} input - Input object
 * @param {String} input.shopId - Shop Id
 * @param {String} input.methodId - Method Id to be updated
 * @param {Number} input.method.cost - Cost
 * @param {String} input.method.group - Group name (free / ground)
 * @param {Number} input.method.handling - Handling price
 * @param {Boolean} input.method.isEnabled - Status
 * @param {Boolean} input.method.enabled - Status
 * @param {String} input.method.label - Display label of method
 * @param {String} input.method.name - Name of method
 * @param {String} input.method.fulfillmentMethod - Fulfullment method name non-editable
 * @param {String[]} input.method.fulfillmentTypes - Array of Fulfullment type
 * @param {Number} input.method.rate - Rate of method
 * @returns {Promise<Object>} An object with a `method` property containing the updated method
 */
export default async function updateFlatRateFulfillmentMethod(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, methodId, shopId } = cleanedInput;
  const { collections: { Fulfillment } } = context;
  const method = { ...inputMethod };

  if (!methodId) throw new ReactionError("invalid-parameter", "Method ID to be updated not provided");
  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "update", { shopId });

  // `isEnabled` has been marked @deprecated and will be removed in next release. 'enabled' is the replacement field
  if (!method.enabled && !method.isEnabled) method.enabled = false;
  if (!method.enabled) method.enabled = method.isEnabled; // if user not yet using new field, continue to collect it from old field
  if (method.isEnabled) delete method.isEnabled;

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
