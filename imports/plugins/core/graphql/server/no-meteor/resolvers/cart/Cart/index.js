import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import items from "./items";

export default {
  _id: (node) => encodeCartOpaqueId(node._id),
  items,
  shop: resolveShopFromShopId
};
