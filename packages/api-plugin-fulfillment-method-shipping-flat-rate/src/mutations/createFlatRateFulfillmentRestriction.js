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
 * @param {Object} input - Input (see SimpleSchema)
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
