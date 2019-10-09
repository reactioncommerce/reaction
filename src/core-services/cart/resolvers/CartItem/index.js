import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeCartItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import productTags from "./productTags.js";

export default {
  _id: (node) => encodeCartItemOpaqueId(node._id),
  productTags,
  shop: resolveShopFromShopId
};
