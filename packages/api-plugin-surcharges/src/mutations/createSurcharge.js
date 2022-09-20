import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Surcharge } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  surcharge: {
    type: Object,
    blackbox: true
  }
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

  await context.validatePermissions("reaction:legacy:surcharges", "create", { shopId });

  surcharge._id = Random.id();
  surcharge.shopId = shopId;
  surcharge.createdAt = new Date();

  Surcharge.validate(surcharge);

  const { insertedCount } = await Surcharges.insertOne(surcharge);
  if (insertedCount === 0) throw new ReactionError("server-error", "Unable to create surcharge");

  return { surcharge };
}
