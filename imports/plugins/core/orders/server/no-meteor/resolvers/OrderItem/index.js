import { encodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeOrderItemOpaqueId(node._id),
  shop: resolveShopFromShopId
};
