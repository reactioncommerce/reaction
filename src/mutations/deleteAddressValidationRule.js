import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Delete an address validation rule
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} Deleted rule
 */
export default async function deleteAddressValidationRule(context, input) {
  const { shopId, _id } = input;
  const { appEvents, collections } = context;
  const { AddressValidationRules } = collections;

  await context.validatePermissions(`reaction:legacy:addressValidationRules:${_id}`, "delete", { shopId });

  const { ok, value: deletedRule } = await AddressValidationRules.findOneAndDelete({
    _id,
    shopId
  });
  if (ok !== 1) throw new ReactionError("not-found", "Not found");

  await appEvents.emit("afterAddressValidationRuleDelete", deletedRule);

  return deletedRule;
}
