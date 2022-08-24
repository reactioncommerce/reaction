import Random from "@reactioncommerce/random";
import { AddressValidationRule as AddressValidationRuleSchema } from "../simpleSchemas.js";

/**
 * @summary Create an address validation rule
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} Created rule
 */
export default async function createAddressValidationRule(context, input) {
  const { countryCodes, serviceName, shopId } = input;
  const { appEvents, collections } = context;
  const { AddressValidationRules } = collections;

  await context.validatePermissions("reaction:legacy:addressValidationRules", "create", { shopId });

  const createdAt = new Date();
  const rule = {
    _id: Random.id(),
    countryCodes,
    createdAt,
    serviceName,
    shopId,
    updatedAt: createdAt
  };

  AddressValidationRuleSchema.validate(rule);

  await AddressValidationRules.insertOne(rule);

  await appEvents.emit("afterAddressValidationRuleCreate", rule);

  return rule;
}
