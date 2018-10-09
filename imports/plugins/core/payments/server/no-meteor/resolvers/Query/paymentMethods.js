import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

export default async function (_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  const shop = await context.queries.shopById(context, dbShopId);

  return Object.keys(paymentMethods)
    .map((name) => ({
      ...paymentMethods[name],
      isEnabled: shop.availablePaymentMethods.includes(name)
    }));
}
