import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  fulfillmentGroupId: String,
  shopId: String,
  name: String,
  enabled: {
    type: Boolean,
    defaultValue: true
  },
  label: String,
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
 * @param {String} input.fulfillmentGroupId - fulfillment tpe id of group
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

  const { fulfillmentGroupId, shopId, name, enabled, label, displayMessageType } = cleanedInput;
  const { collections: { Fulfillment } } = context;

  if (!shopId) throw new ReactionError("invalid-parameter", "Shop ID to be updated not provided");
  if (!fulfillmentGroupId) throw new ReactionError("invalid-parameter", "FulfillmentType ID to be updated not provided");
  if (!name) throw new ReactionError("invalid-parameter", "FulfillmentType Name to be updated not provided");

  await context.validatePermissions(`reaction:legacy:fulfillmentTypes:${fulfillmentGroupId}`, "update", { shopId });

  const { matchedCount } = await Fulfillment.updateOne({
    _id: fulfillmentGroupId,
    shopId
  }, {
    $set: {
      name,
      "provider.enabled": enabled,
      "provider.name": name,
      "provider.label": label,
      displayMessageType
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Fulfillment type to update not found");

  return { group: cleanedInput };
}
