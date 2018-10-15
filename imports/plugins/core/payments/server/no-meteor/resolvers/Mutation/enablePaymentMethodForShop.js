import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

export default async function enablePaymentMethodForShop(parentResult, { input }, context) {
  input.shopId = decodeShopOpaqueId(input.shopId);
  return context.mutations.enablePaymentMethodForShop(context, input);
}
