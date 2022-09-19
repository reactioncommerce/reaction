import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { FulfillmentMethodSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  method: FulfillmentMethodSchema,
  fulfillmentTypeId: String,
  shopId: String
});

/**
 * @method createFulfillmentMethodMutation
 * @summary Creates a fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `method` property containing the created method
 */
export default async function createFulfillmentMethodMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, fulfillmentTypeId, shopId } = cleanedInput;
  const { collections } = context;
  const { Fulfillment } = collections;
  const method = { ...inputMethod };

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "create", { shopId });

  const ffTypeRecord = await Fulfillment.findOne({ _id: fulfillmentTypeId, shopId });
  if (!ffTypeRecord) throw new ReactionError("server-error", "Unable to create fulfillment method without defined type");

  method._id = Random.id();
  // MongoDB schema still uses `enabled` rather than `isEnabled`
  // method.enabled = method.isEnabled;
  // delete method.isEnabled;

  method.fulfillmentTypes = [ffTypeRecord.fulfillmentType];

  const { matchedCount } = await Fulfillment.updateOne({
    shopId,
    _id: fulfillmentTypeId
  }, {
    $addToSet: {
      methods: method
    }
  });

  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment method");

  return { group: method };
}
