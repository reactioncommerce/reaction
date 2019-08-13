import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  methodId: String,
  shopId: String
});

/**
 * @method deleteFlatRateFulfillmentMethodMutation
 * @summary deletes a flat rate fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input (see SimpleSchema)
 * @returns {Promise<Object>} An object with a `method` property containing the deleted method
 */
export default async function deleteFlatRateFulfillmentMethodMutation(context, input) {
  inputSchema.validate(input);

  const { methodId, shopId } = input;
  const { collections, userHasPermission } = context;
  const { Shipping } = collections;

  if (!userHasPermission(["admin", "owner", "shipping"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const shippingRecord = await Shipping.findOne({
    "methods._id": methodId,
    shopId
  });
  if (!shippingRecord) throw new ReactionError("not-found", "Not found");

  const { matchedCount } = await Shipping.updateOne({
    "methods._id": methodId,
    shopId
  }, {
    $pull: {
      methods: {
        _id: methodId
      }
    }
  });
  if (matchedCount === 0) throw new ReactionError("not-found", "Not found");

  const method = shippingRecord.methods.find((meth) => meth._id === methodId);
  return { method };
}
