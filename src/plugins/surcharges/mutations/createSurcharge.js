import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import surchargeSchema from "../util/surchargeSchema.js";

const inputSchema = new SimpleSchema({
  surcharge: surchargeSchema,
  shopId: String
});

/**
 * @method createSurchargeMutation
 * @summary Creates a surcharge
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `surcharge` property containing the created surcharge
 */
export default async function createSurchargeMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { surcharge, shopId } = cleanedInput;
  const { collections } = context;
  const { Surcharges } = collections;

  await context.validatePermissionsLegacy(["admin", "owner", "shipping"], null, { shopId });
  await context.validatePermissions("reaction:surcharges", "create", { shopId });

  surcharge._id = Random.id();

  const { insertedCount } = await Surcharges.insertOne({
    shopId,
    createdAt: new Date(),
    ...surcharge
  });
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create surcharge");

  return { surcharge };
}
