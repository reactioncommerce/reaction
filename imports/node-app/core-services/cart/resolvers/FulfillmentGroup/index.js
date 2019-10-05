import { encodeFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeFulfillmentGroupOpaqueId(node._id),
  shop: resolveShopFromShopId
};
