import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  fulfillmentTypeId: String,
  shopId: String,
  name: {
    type: String,
    optional: true
  },
  enabled: {
    type: Boolean,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  displayMessageType: {
    type: String,
    optional: true
  }
});

/**
 * @method updateFulfillmentType
 * @summary updates the selected fulfillment type
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input object
 * @param {String} input.fulfillmentTypeId - id of the fulfillment type
 * @param {String} input.shopId - Shop Id
 * @param {String} input.name - name of fulfillment type
 * @param {Boolean} input.enabled - status of ff-type
 * @param {String} input.label - label of ff-type
 * @param {String} input.displayMessageType - optional display message for UI
 * @returns {Promise<Object>} An object with the updated type
 */
export default async function updateFulfillmentType(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { fulfillmentTypeId, shopId, name, enabled, label, displayMessageType } = cleanedInput;
  const { collections: { Fulfillment } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentTypes", "update", { shopId });

  const updatedAt = new Date();
  const providerObject = {};
  const updateObject = {};
  if (enabled) providerObject.enabled = enabled;
  if (name) providerObject.name = name;
  if (label) providerObject.label = label;
  if (Object.keys(providerObject).length) {
    updateObject.provider = providerObject;
  }
  if (displayMessageType) updateObject.displayMessageType = displayMessageType;
  if (name) updateObject.name = name;

  if (Object.keys(updateObject).length) {
    updateObject.updatedAt = updatedAt;
    const { matchedCount } = await Fulfillment.updateOne({
      _id: fulfillmentTypeId,
      shopId
    }, {
      $set: updateObject
    });
    if (matchedCount === 0) throw new ReactionError("not-found", "Fulfillment type to update not found");
  }
  return { fulfillmentType: cleanedInput };
}
