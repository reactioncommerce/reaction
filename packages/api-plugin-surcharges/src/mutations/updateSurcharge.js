import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Surcharge } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  surcharge: {
    type: Object,
    blackbox: true
  },
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
  const { collections } = context;
  const { Surcharges } = collections;

  await context.validatePermissions(`reaction:legacy:surcharges:${surchargeId}`, "update", { shopId });

  const modifier = {
    $set: {
      updatedAt: new Date(),
      ...surcharge
    }
  };

  Surcharge.validate(modifier, { modifier: true });

  const { matchedCount, value: updatedSurcharge } = await Surcharges.findOneAndUpdate(
    { _id: surchargeId, shopId },
    modifier,
    { returnOriginal: false }
  );
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  return { surcharge: updatedSurcharge };
}
