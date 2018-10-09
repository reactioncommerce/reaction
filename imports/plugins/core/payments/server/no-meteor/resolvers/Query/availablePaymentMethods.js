import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

export default async function (_, { shopId }, context) {
  const paymentMethodNames = Object.keys(paymentMethods);
  const dbShopId = decodeShopOpaqueId(shopId);
  const shop = await context.queries.shopById(context, dbShopId);

  return shop.availablePaymentMethods
    .map((name) => paymentMethodNames.find((paymentMethodName) => paymentMethodName === name));
}
