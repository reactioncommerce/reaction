import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { FulfillmentMethodSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  method: FulfillmentMethodSchema,
  fulfillmentTypeId: String,
  methodId: String,
  shopId: String
});

/**
 * @method updateFulfillmentMethodMutation
 * @summary updates Fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input object
 * @param {FulfillmentMethodSchema} input.method - fulfillment method object
 * @param {String} input.fulfillmentTypeId - id of fulfillment type
 * @param {String} input.methodId - ff-method Id
 * @param {String} input.shopId - Shop Id
 * @returns {Promise<Object>} An object with a `method` property containing the updated method
 */
export default async function updateFulfillmentMethodMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, methodId, fulfillmentTypeId, shopId } = cleanedInput;
  const { collections: { Fulfillment } } = context;
  const method = { ...inputMethod };

  if (!fulfillmentTypeId) throw new ReactionError("invalid-parameter", "Fulfillment Type ID to be updated not provided");
  if (!methodId) throw new ReactionError("invalid-parameter", "Method ID to be updated not provided");

  await context.validatePermissions(`reaction:legacy:fulfillmentMethods:${methodId}`, "update", { shopId });

  const ffTypeMethodRecord = await Fulfillment.findOne({
    "_id": fulfillmentTypeId,
    shopId,
    "methods._id": methodId
  });
  if (!ffTypeMethodRecord) throw new ReactionError("server-error", "Fulfillment Method does not exist");

  // Do not update the fulfillmentType, fulfillmentMethod, group, name & _id fields
  // Find the matching fulfillmentMethod object and use those values to over-write
  const currentFulfillmentMethod = (ffTypeMethodRecord.methods || []).find((meth) => meth._id === methodId);
  if (!currentFulfillmentMethod) throw new ReactionError("server-error", "Fulfillment Method does not exist");
  const updatedMethod = {
    ...method,
    _id: methodId,
    name: currentFulfillmentMethod.name,
    group: currentFulfillmentMethod.group,
    fulfillmentMethod: currentFulfillmentMethod.fulfillmentMethod,
    fulfillmentType: [ffTypeMethodRecord.fulfillmentType]
  };

  const { matchedCount } = await Fulfillment.updateOne({
    "_id": fulfillmentTypeId,
    "methods._id": methodId,
    shopId
  }, {
    $set: {
      "methods.$": updatedMethod
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Fulfillment type to be updated not found");

  return { group: updatedMethod };
}
