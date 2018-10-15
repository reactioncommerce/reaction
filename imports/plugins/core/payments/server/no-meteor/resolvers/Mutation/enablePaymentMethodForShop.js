import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

export default async function enablePaymentMethodForShop(parentResult, { input }, context) {
  const { clientMutationId } = input;
  input.shopId = decodeShopOpaqueId(input.shopId);
  delete input.clientMutationId;

  const paymentMethods = await context.mutations.enablePaymentMethodForShop(context, input);

  return {
    clientMutationId,
    paymentMethods
  };
}
