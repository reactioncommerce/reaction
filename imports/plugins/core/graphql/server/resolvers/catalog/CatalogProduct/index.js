import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import tagIds from "./tagIds";
import tags from "./tags";
import variants from "./variants";

export default {
  _id: (node) => encodeCatalogProductOpaqueId(node._id),
  productId: (node) => encodeProductOpaqueId(node._id),
  shop: resolveShopFromShopId,
  tagIds,
  tags,
  variants
};
