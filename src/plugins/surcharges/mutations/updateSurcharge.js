import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import surchargeSchema from "../util/surchargeSchema.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  surcharge: surchargeSchema,
  surchargeId: String
});


/**
 * @method updateSurchargeMutation
 * @summary updates a surcharge
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `surcharge` property containing the updated surcharge
 */
export default async function updateSurchargeMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { surcharge, surchargeId, shopId } = cleanedInput;
  const { validatePermissions, validatePermissionsLegacy, collections } = context;
  const { Surcharges } = collections;

  await validatePermissionsLegacy(["admin", "owner", "shipping"], shopId);
  await validatePermissions(`reaction:surcharges:${surchargeId}`, "update", { shopId });

  const { matchedCount } = await Surcharges.updateOne({
    _id: surchargeId,
    shopId
  }, {
    $set: {
      updatedAt: new Date(),
      ...surcharge
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  return { surcharge };
}
