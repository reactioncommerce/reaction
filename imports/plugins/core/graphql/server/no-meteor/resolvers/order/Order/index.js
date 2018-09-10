import { encodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveAccountFromAccountId, resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import totalItemQuantity from "./totalItemQuantity";

export default {
  _id: (node) => encodeOrderOpaqueId(node._id),
  account: resolveAccountFromAccountId,
  notes: (node) => node.notes || [],
  shop: resolveShopFromShopId,
  totalItemQuantity
};
