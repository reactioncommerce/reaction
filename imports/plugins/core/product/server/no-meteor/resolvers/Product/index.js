import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import getVariants from "../../utils/getVariants";
import socialMetadata from "./socialMetadata";
import tagIds from "./tagIds";
import tags from "./tags";

export default {
  _id: (node) => encodeProductOpaqueId(node._id),
  shop: resolveShopFromShopId,
  slug: (node) => node.handle,
  socialMetadata,
  tagIds,
  tags,
  variants: (node, args, context) => getVariants(context, node._id, true)
};
