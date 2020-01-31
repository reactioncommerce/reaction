import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeProductOpaqueId } from "../../xforms/id.js";
import getVariants from "../../utils/getVariants.js";

export default {
  _id: (node) => encodeProductOpaqueId(node._id),
  metafields: (node) => node.metafields || [],
  options: (node, args, context) => getVariants(context, node._id, undefined, args),
  shop: resolveShopFromShopId
};
