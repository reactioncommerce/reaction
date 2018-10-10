import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

export default async function availablePaymentMethods(_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  return context.queries.availablePaymentMethods(context, dbShopId);
}
