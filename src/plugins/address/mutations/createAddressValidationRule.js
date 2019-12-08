import Random from "@reactioncommerce/random";
import SimpleSchema from "simpl-schema";

const ruleSchema = new SimpleSchema({
  "_id": String,
  "countryCodes": {
    type: Array,
    optional: true
  },
  "countryCodes.$": String,
  "createdAt": Date,
  "serviceName": String,
  "shopId": String,
  "updatedAt": Date
});

/**
 * @summary Create an address validation rule
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} Created rule
 */
export default async function createAddressValidationRule(context, input) {
  const { countryCodes, serviceName, shopId } = input;
  const { appEvents, checkPermissions, collections } = context;
  const { AddressValidationRules } = collections;

  await checkPermissions(["admin"], shopId);

  const createdAt = new Date();
  const rule = {
    _id: Random.id(),
    countryCodes,
    createdAt,
    serviceName,
    shopId,
    updatedAt: createdAt
  };

  ruleSchema.validate(rule);

  await AddressValidationRules.insertOne(rule);

  await appEvents.emit("afterAddressValidationRuleCreate", rule);

  return rule;
}
