import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { fulfillmentTypeSchema } from "../simpleSchemas.js";

/**
 * @method createFulfillmentType
 * @summary updates the selected fulfillment type
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with the updated type
 */
export default async function createFulfillmentType(context, input) {
  const cleanedInput = fulfillmentTypeSchema.clean(input);
  cleanedInput.provider.name = cleanedInput.name;

  if (cleanedInput.method) {
    cleanedInput.method._id = Random.id();
    cleanedInput.method.fulfillmentTypes = [cleanedInput.fulfillmentType];
  }
  fulfillmentTypeSchema.validate(cleanedInput);

  const { collections } = context;
  const { Fulfillment } = collections;
  const { shopId, name, fulfillmentType } = cleanedInput;

  const ffTypeRecord = await Fulfillment.findOne({ name, shopId, fulfillmentType });
  if (ffTypeRecord) throw new ReactionError("invalid-parameter", "Fulfillment Type already exists");

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "create", { shopId });

  const { insertedCount } = await Fulfillment.insertOne({
    _id: Random.id(),
    ...cleanedInput
  });
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment type");

  return { group: { name: cleanedInput.name, fulfillmentType: cleanedInput.fulfillmentType } };
}
