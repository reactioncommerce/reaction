import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

export default async function (_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  return context.queries.paymentMethods(context, dbShopId);
}
