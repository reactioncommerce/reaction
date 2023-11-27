import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { UserEditableFulfillmentMethodSchema } from "../simpleSchemas.js";


const inputSchema = new SimpleSchema({
  method: UserEditableFulfillmentMethodSchema,
  fulfillmentTypeId: String,
  methodId: String,
  shopId: String
});

/**
 * @method updateFulfillmentMethodMutation
 * @summary updates Fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input object
 * @param {UserEditableFulfillmentMethodSchema} input.method - fulfillment method object with only user editable fields
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

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "update", { shopId });

  const fulfillmentType = await Fulfillment.findOne({
    "_id": fulfillmentTypeId,
    shopId,
    "methods._id": methodId
  });
  if (!fulfillmentType) throw new ReactionError("server-error", "Fulfillment Type / Method does not exist");

  const currentFulfillmentMethod = (fulfillmentType.methods || []).find((meth) => meth._id === methodId);
  if (!currentFulfillmentMethod) throw new ReactionError("server-error", "Fulfillment Method does not exist");
  const updatedMethod = { ...currentFulfillmentMethod, ...method }; // update only provided user editable fields

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

  return { method: updatedMethod };
}
