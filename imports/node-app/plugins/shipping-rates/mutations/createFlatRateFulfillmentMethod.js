import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import methodSchema from "../util/methodSchema.js";

const inputSchema = new SimpleSchema({
  method: methodSchema,
  shopId: String
});

/**
 * @method createFlatRateFulfillmentMethodMutation
 * @summary Creates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `method` property containing the created method
 */
export default async function createFlatRateFulfillmentMethodMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method, shopId } = cleanedInput;
  const { collections, userHasPermission } = context;
  const { Shipping } = collections;

  if (!userHasPermission(["admin", "owner", "shipping"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const shippingRecord = await Shipping.findOne({ "provider.name": "flatRates", shopId });
  if (!shippingRecord) {
    await Shipping.insertOne({
      _id: Random.id(),
      name: "Default Shipping Provider",
      shopId,
      provider: {
        enabled: true,
        label: "Flat Rate",
        name: "flatRates"
      }
    });
  }

  method._id = Random.id();

  // MongoDB schema still uses `enabled` rather than `isEnabled`
  method.enabled = method.isEnabled;
  delete method.isEnabled;

  const { matchedCount } = await Shipping.updateOne({
    shopId,
    "provider.name": "flatRates"
  }, {
    $addToSet: {
      methods: method
    }
  });
  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment method");

  return { method };
}
