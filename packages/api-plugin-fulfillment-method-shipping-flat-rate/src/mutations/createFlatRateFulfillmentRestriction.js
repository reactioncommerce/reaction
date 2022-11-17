import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { restrictionSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  restriction: restrictionSchema,
  shopId: String
});

/**
 * @method createFlatRateFulfillmentRestriction
 * @summary Creates a flat rate fulfillment restriction
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input
 * @param {String} input.shopId - Shop Id
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
 * @returns {Promise<Object>} An object with a `restriction` property containing the created restriction
 */
export default async function createFlatRateFulfillmentRestriction(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { restriction, shopId } = cleanedInput;
  const { collections: { FulfillmentRestrictions } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentRestrictions", "create", { shopId });

  restriction._id = Random.id();
  restriction.shopId = shopId;

  const { insertedCount } = await FulfillmentRestrictions.insertOne(restriction);
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create restriction method");

  return { restriction };
}
