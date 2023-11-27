import Logger from "@reactioncommerce/logger";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { FulfillmentMethodSchema } from "../simpleSchemas.js";

const logCtx = { name: "fulfillment", file: "createFulfillmentMethod" };
const inputSchema = new SimpleSchema({
  method: FulfillmentMethodSchema,
  fulfillmentTypeId: String,
  shopId: String
});

/**
 * @method createFulfillmentMethodMutation
 * @summary Creates a fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input
 * @param {Number} input.cost - optional cost
 * @param {String[]} input.fulfillmentTypes - fulfillment type retained for backward compatibility
 * @param {String} input.group - Group to which fulfillment method belong
 * @param {Number} input.handling - handling charges
 * @param {Boolean} input.enabled - status of fulfillment method
 * @param {String} input.label - displayed on the UI
 * @param {String} input.fulfillmentMethod - used by application, not user editable
 * @param {String} input.displayMessageMethod - used to display additional message on UI specific to ff-method
 * @param {Number} input.rate - rate for the method
 * @returns {Promise<Object>} An object with a `method` property containing the created method
 */
export default async function createFulfillmentMethodMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, fulfillmentTypeId, shopId } = cleanedInput;
  const { collections: { Fulfillment } } = context;
  const method = { ...inputMethod };

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "create", { shopId });

  const fulfillmentType = await Fulfillment.findOne({ _id: fulfillmentTypeId, shopId });
  if (!fulfillmentType) throw new ReactionError("server-error", "Unable to create fulfillment method without defined type");

  const fulfillmentMethod = fulfillmentType.methods?.find((currMethod) => currMethod.fulfillmentMethod === method.fulfillmentMethod);
  if (fulfillmentMethod) {
    Logger.warn(logCtx, "Fulfillment Method already exists");
    return { fulfillmentMethod };
  }

  method._id = Random.id();
  method.fulfillmentTypes = [fulfillmentType.fulfillmentType];

  const { matchedCount } = await Fulfillment.updateOne({
    shopId,
    _id: fulfillmentTypeId
  }, {
    $addToSet: {
      methods: method
    }
  });

  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment method");

  return { method };
}
