import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import { paymentMethods as allPaymentMethods } from "../registration.js";

const paramsSchema = new SimpleSchema({
  isEnabled: Boolean,
  paymentMethodName: String,
  shopId: String
});

/**
 * @method enablePaymentMethodForShop
 * @summary Enables (or disables) payment method for a given shop
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - EnablePaymentMethodForShopInput
 * @param {String} input.isEnabled - Whether to enable or disable specified payment method
 * @param {String} input.paymentMethodName - The name of the payment method to enable or disable
 * @param {String} input.shopId - The id of the shop to enable payment method on
 * @param {String} [input.clientMutationId] - An optional string identifying the mutation call
 * @returns {Promise<Array<Object>>} Array<PaymentMethod>
 */
export default async function enablePaymentMethodForShop(context, input = {}) {
  paramsSchema.validate(input, { ignore: [SimpleSchema.ErrorTypes.KEY_NOT_IN_SCHEMA] });
  const { Shops } = context.collections;
  const { isEnabled, paymentMethodName, shopId } = input;

  if (!context.userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  if (!allPaymentMethods[paymentMethodName]) {
    throw new ReactionError("not-found", "Requested payment method is invalid");
  }

  const shop = await context.queries.shopById(context, shopId);
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const methods = new Set(shop.availablePaymentMethods);

  if (isEnabled) {
    methods.add(paymentMethodName);
  } else {
    methods.delete(paymentMethodName);
  }

  await Shops.updateOne(
    { _id: shop._id },
    { $set: { availablePaymentMethods: Array.from(methods) } }
  );

  return context.queries.paymentMethods(context, shopId);
}
