import { encodeOrderFulfillmentGroupOpaqueId, xformOrderFulfillmentGroupPayment } from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeOrderFulfillmentGroupOpaqueId(node._id),
  payment: (node) => xformOrderFulfillmentGroupPayment(node.payment, node),
  shop: resolveShopFromShopId
};
