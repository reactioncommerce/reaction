import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { FulfillmentTypeSchema } from "../simpleSchemas.js";

/**
 * @method createFulfillmentType
 * @summary Creates a new fulfillment type
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input object
 * @param {String} input.name - name of fulfillment type
 * @param {String} input.shopId - Shop Id
 * @param {ProviderSchema} input.provider - Provider details
 * @param {String} input.fulfillmentType - fulfillment type
 * @param {String} input.displayMessageType - displayMessage for fulfillment type
 * @param {FulfillmentMethodSchema[]} input.methods - ff-method array
 * @returns {Promise<Object>} An object with the updated type
 */
export default async function createFulfillmentType(context, input) {
  const cleanedInput = FulfillmentTypeSchema.clean(input);
  if (!cleanedInput.provider) cleanedInput.provider = {};
  cleanedInput.provider.name = cleanedInput.name;

  if (cleanedInput.method) {
    cleanedInput.method._id = Random.id();
    cleanedInput.method.fulfillmentTypes = [cleanedInput.fulfillmentType];
  }
  FulfillmentTypeSchema.validate(cleanedInput);

  const { collections: { Fulfillment } } = context;
  const { shopId, fulfillmentType } = cleanedInput;

  const ffTypeRecord = await Fulfillment.findOne({ shopId, fulfillmentType });
  if (ffTypeRecord) throw new ReactionError("invalid-parameter", "Fulfillment Type already exists");

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "create", { shopId });

  const { insertedCount } = await Fulfillment.insertOne({
    _id: Random.id(),
    ...cleanedInput
  });
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment type");

  return { group: { name: cleanedInput.name, fulfillmentType: cleanedInput.fulfillmentType } };
}
