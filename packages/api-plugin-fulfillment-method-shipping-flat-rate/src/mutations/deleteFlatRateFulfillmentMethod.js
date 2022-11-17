import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  methodId: String,
  shopId: String
});

/**
 * @method deleteFlatRateFulfillmentMethod
 * @summary deletes a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input
 * @param {String} input.methoId - Method Id to be deleted
 * @param {String} input.shopId - Shop Id
 * @returns {Promise<Object>} An object with a `method` property containing the deleted method
 */
export default async function deleteFlatRateFulfillmentMethod(context, input) {
  inputSchema.validate(input);

  const { methodId, shopId } = input;
  const { collections: { Fulfillment } } = context;

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "delete", { shopId });

  const shippingRecord = await Fulfillment.findOne({
    "methods._id": methodId,
    shopId
  });
  if (!shippingRecord) throw new ReactionError("not-found", "Shipping method not found");

  const { matchedCount } = await Fulfillment.updateOne({
    "methods._id": methodId,
    shopId
  }, {
    $pull: {
      methods: {
        _id: methodId
      }
    }
  });
  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to update the Shipping method");

  const method = shippingRecord.methods.find((meth) => meth._id === methodId);
  return { method };
}
