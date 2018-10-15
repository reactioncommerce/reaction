import SimpleSchema from "simpl-schema";
import { Shops } from "/lib/collections";
import { paymentMethods as allPaymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

const paramsSchema = new SimpleSchema({
  shopId: String,
  paymentMethodName: String,
  isEnabled: Boolean
});

export default async function enablePaymentMethodForShop(context, input = {}) {
  paramsSchema.validate(input);

  const { shopId, paymentMethodName, isEnabled } = input;
  const shop = await context.queries.shopById(context, shopId);
  const methods = new Set(shop.availablePaymentMethods)

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

  const paymentMethods = await context.queries.paymentMethods(context, shopId);

  return {
    paymentMethods
  };
}
