import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { resolveAccountFromAccountId, resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import checkout from "./checkout";
import items from "./items";

export default {
  _id: (node) => encodeCartOpaqueId(node._id),
  account: resolveAccountFromAccountId,
  checkout,
  items,
  shop: resolveShopFromShopId
};
