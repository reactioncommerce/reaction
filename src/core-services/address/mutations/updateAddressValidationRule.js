import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const ruleUpdatesSchema = new SimpleSchema({
  "countryCodes": {
    type: Array,
    optional: true
  },
  "countryCodes.$": String,
  "serviceName": String,
  "updatedAt": Date
});

/**
 * @summary Update an address validation rule
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} Updated rule
 */
export default async function updateAddressValidationRule(context, input) {
  const { _id, countryCodes, serviceName, shopId } = input;
  const { appEvents, collections } = context;
  const { AddressValidationRules } = collections;

  await context.validatePermissions(`reaction:legacy:addressValidationRules:${_id}`, "update", { shopId });

  const updates = {
    countryCodes,
    serviceName,
    updatedAt: new Date()
  };

  ruleUpdatesSchema.validate(updates);

  const { value: updatedRule } = await AddressValidationRules.findOneAndUpdate(
    { _id, shopId },
    {
      $set: updates
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedRule) throw new ReactionError("not-found", "Not found");

  await appEvents.emit("afterAddressValidationRuleUpdate", updatedRule);

  return updatedRule;
}
