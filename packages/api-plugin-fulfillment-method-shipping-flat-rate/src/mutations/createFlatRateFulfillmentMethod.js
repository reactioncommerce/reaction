import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { methodSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  method: methodSchema,
  shopId: String
});

/**
 * @method createFlatRateFulfillmentMethod
 * @summary Creates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input object
 * @param {String} input.shopId - Shop Id
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
 * @returns {Promise<Object>} An object with a `method` property containing the created method
 */
export default async function createFlatRateFulfillmentMethod(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, shopId } = cleanedInput;
  const { collections: { Fulfillment } } = context;
  const method = { ...inputMethod };

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "create", { shopId });

  const shippingRecord = await Fulfillment.findOne({ fulfillmentType: "shipping", shopId });
  if (!shippingRecord) throw new ReactionError("server-error", "Unable to create fulfillment method without defined type");

  method._id = Random.id();
  // `isEnabled` has been marked @deprecated and will be removed in next release. 'enabled' is the replacement field
  if (!method.enabled && !method.isEnabled) method.enabled = false;
  if (!method.enabled) method.enabled = method.isEnabled; // if user not yet using new field, continue to collect it from old field
  if (method.isEnabled) delete method.isEnabled;

  // Hardcoded field, each ff-method plugin has to introduce this field for grouping purpose
  // Schema defined as optional=true for backward compatibility
  method.fulfillmentMethod = "flatRate";

  const { matchedCount } = await Fulfillment.updateOne({
    shopId,
    fulfillmentType: "shipping"
  }, {
    $addToSet: {
      methods: method
    }
  });

  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment method");

  return { method };
}
