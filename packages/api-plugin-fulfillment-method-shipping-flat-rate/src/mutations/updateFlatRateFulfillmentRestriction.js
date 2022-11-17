import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { restrictionSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  restrictionId: String,
  restriction: restrictionSchema,
  shopId: String
});


/**
 * @method updateFlatRateFulfillmentRestriction
 * @summary updates a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input
 * @param {String} input.shopId - Shop Id
 * @param {String} input.restrictionId - Restriction Id
 * @param {String[]} input.restriction.methodIds - Array of methodIds
 * @param {Object[]} input.restriction.attributes - Array of attributes
 * @param {String} input.restriction.attributes.property - property of attribute
 * @param {String} input.restriction.attributes.value - value of attribute
 * @param {String} input.restriction.attributes.propertyType - propertyType of attribute
 * @param {String} input.restriction.attributes.operator - operator of attributes
 * @param {Object} input.restriction.destination - destination object
 * @param {String[]} input.restriction.destination.country - Array of countries
 * @param {String[]} input.restriction.destination.region - Array of regions
 * @param {String[]} input.restriction.destination.postal - Array of postal codes
 * @returns {Promise<Object>} An object with a `restriction` property containing the updated method
 */
export default async function updateFlatRateFulfillmentRestriction(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { restriction, restrictionId, shopId } = cleanedInput;
  const { collections: { FulfillmentRestrictions } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentRestrictions", "update", { shopId });

  const { matchedCount } = await FulfillmentRestrictions.updateOne({
    _id: restrictionId,
    shopId
  }, {
    $set: {
      ...restriction
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  return {
    restriction: {
      _id: restrictionId,
      shopId,
      ...restriction
    }
  };
}
