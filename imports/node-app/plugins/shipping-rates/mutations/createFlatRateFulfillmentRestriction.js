import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import restrictionSchema from "../util/restrictionSchema.js";

const inputSchema = new SimpleSchema({
  restriction: restrictionSchema,
  shopId: String
});

/**
 * @method createFlatRateFulfillmentRestrictionMutation
 * @summary Creates a flat rate fulfillment restriction
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `restriction` property containing the created restriction
 */
export default async function createFlatRateFulfillmentRestrictionMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { restriction, shopId } = cleanedInput;
  const { collections, userHasPermission } = context;
  const { FlatRateFulfillmentRestrictions } = collections;

  if (!userHasPermission(["admin", "owner", "shipping"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const { insertedCount } = await FlatRateFulfillmentRestrictions.insertOne({
    _id: Random.id(),
    shopId,
    ...restriction
  });
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create restriction method");

  return { restriction };
}
