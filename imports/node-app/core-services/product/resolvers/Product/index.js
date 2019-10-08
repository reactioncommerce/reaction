import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import getVariants from "../../utils/getVariants.js";
import socialMetadata from "./socialMetadata.js";
import tagIds from "./tagIds.js";
import tags from "./tags.js";

export default {
  _id: (node) => encodeProductOpaqueId(node._id),
  shop: resolveShopFromShopId,
  slug: (node) => node.handle,
  socialMetadata,
  tagIds,
  tags,
  variants: (node, args, context) => getVariants(context, node._id, true)
};
