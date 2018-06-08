import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import pricing from "./pricing";
import tagIds from "./tagIds";
import tags from "./tags";

export default {
  _id: (node) => encodeCatalogProductOpaqueId(node._id),
  productId: (node) => encodeProductOpaqueId(node.productId),
  shop: resolveShopFromShopId,
  pricing,
  tagIds,
  tags
};
