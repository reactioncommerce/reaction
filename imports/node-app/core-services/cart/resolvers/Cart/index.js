import resolveAccountFromAccountId from "@reactioncommerce/api-utils/graphql/resolveAccountFromAccountId.js";
import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import checkout from "./checkout.js";
import items from "./items.js";
import totalItemQuantity from "./totalItemQuantity.js";

export default {
  _id: (node) => encodeCartOpaqueId(node._id),
  account: resolveAccountFromAccountId,
  checkout,
  items,
  shop: resolveShopFromShopId,
  totalItemQuantity
};
