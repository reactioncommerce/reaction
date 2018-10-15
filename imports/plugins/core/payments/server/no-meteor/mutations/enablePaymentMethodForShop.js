import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import { Shops } from "/lib/collections";
import { paymentMethods as allPaymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

const paramsSchema = new SimpleSchema({
  isEnabled: Boolean,
  paymentMethodName: String,
  shopId: String
});

export default async function enablePaymentMethodForShop(context, input = {}) {
  paramsSchema.validate(input);
  const { isEnabled, paymentMethodName, shopId } = input;

  if (!allPaymentMethods[paymentMethodName]) {
    throw new ReactionError("not-found", "Requested payment method is invalid");
  }

  const shop = await context.queries.shopById(context, shopId);
  const methods = new Set(shop.availablePaymentMethods);

  if (isEnabled) {
    methods.add(paymentMethodName);
  } else {
    methods.delete(paymentMethodName);
  }

  await Shops.update(
    { _id: shop._id },
    { $set: { availablePaymentMethods: Array.from(methods) } },
    { bypassCollection2: true }
  );

  return context.queries.paymentMethods(context, shopId);
}
