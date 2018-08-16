import { encodeCartItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeCartItemOpaqueId(node._id),
  shop: resolveShopFromShopId
};
