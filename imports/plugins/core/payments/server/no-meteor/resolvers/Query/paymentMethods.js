import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

export default async function (_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  const shop = await context.queries.shopById(context, dbShopId);

  return Array.from(paymentMethods)
    .map((paymentMethod) => ({
      ...paymentMethod,
      isEnabled: shop.availablePaymentMethods.includes(paymentMethod.name)
    }));
}
