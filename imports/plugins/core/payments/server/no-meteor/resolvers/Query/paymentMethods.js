import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

export default async function(_, { shopId }, context, info) {
  return Array.from(paymentMethods);
}
