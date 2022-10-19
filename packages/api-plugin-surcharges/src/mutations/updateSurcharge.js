import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
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

  Logger.trace({ surcharge }, "Print surchage");
  Logger.trace({ surchargeId }, "Print surchageId");
  Logger.trace({ shopId }, "Print shopId");

  await context.validatePermissions(`reaction:legacy:surcharges:${surchargeId}`, "update", { shopId });

  const modifier = {
    $set: {
      updatedAt: new Date(),
      ...surcharge
    }
  };

  Surcharge.validate(modifier, { modifier: true });

  const { matchedCount } = await Surcharges.updateOne({
    _id: surchargeId, shopId
  }, modifier);

  Logger.trace({ matchedCount }, "Print updated count");

  if (matchedCount === 0) throw new ReactionError("not-found", "Unable to update surcharge");

  const updatedSurcharge = await Surcharges.findOne({ _id: surchargeId, shopId });

  Logger.trace({ updatedSurcharge }, "Print updated surcharge");

  return updatedSurcharge;
}
