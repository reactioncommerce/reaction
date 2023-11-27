import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { FulfillmentTypeSchema } from "../simpleSchemas.js";

const logCtx = { name: "fulfillment", file: "createFulfillmentType" };
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
 * @returns {Promise<Object>} An object with the updated type
 */
export default async function createFulfillmentType(context, input) {
  const cleanedInput = FulfillmentTypeSchema.clean(input);
  if (cleanedInput.provider) cleanedInput.provider.name = cleanedInput.name;

  // Although allowed by schema, we do not add the ff-method while creating a new ff-type
  // FulfillmentMethods are expected to be added using the mutation createFulfillmentMethod
  // (as it makes sense to add a new ff-method only by a new plugin implementation).
  if (cleanedInput.methods) {
    delete cleanedInput.methods;
  }
  const createdAt = new Date();
  cleanedInput.createdAt = createdAt;
  cleanedInput.updatedAt = createdAt;
  FulfillmentTypeSchema.validate(cleanedInput);

  const { collections: { Fulfillment } } = context;
  const { shopId, fulfillmentType } = cleanedInput;

  const existingFulfillmentType = await Fulfillment.findOne({ shopId, fulfillmentType });
  if (existingFulfillmentType) {
    Logger.warn(logCtx, "Fulfillment Type already exists");
    return { fulfillmentType: { name: cleanedInput.name, fulfillmentType: cleanedInput.fulfillmentType } };
  }

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "create", { shopId });

  const { insertedCount } = await Fulfillment.insertOne({
    _id: Random.id(),
    ...cleanedInput
  });
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment type");

  return { fulfillmentType: { name: cleanedInput.name, fulfillmentType: cleanedInput.fulfillmentType } };
}
