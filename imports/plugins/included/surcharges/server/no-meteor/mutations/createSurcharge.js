import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import surchargeSchema from "../util/surchargeSchema";

const inputSchema = new SimpleSchema({
  surcharge: surchargeSchema,
  shopId: String
});

/**
 * @method createSurchargeMutation
 * @summary Creates a surcharge
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @return {Promise<Object>} An object with a `surcharge` property containing the created surcharge
 */
export default async function createSurchargeMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { surcharge, shopId } = cleanedInput;
  const { collections, userHasPermission } = context;
  const { Surcharges } = collections;

  if (!userHasPermission(["admin", "owner", "shipping"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const { insertedCount } = await Surcharges.insertOne({
    _id: Random.id(),
    shopId,
    ...surcharge
  });
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create surcharge");

  return { surcharge };
}
