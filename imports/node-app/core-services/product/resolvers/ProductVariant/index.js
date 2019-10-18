import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import getVariants from "../../utils/getVariants.js";

export default {
  _id: (node) => encodeProductOpaqueId(node._id),
  options: (node, args, context) => getVariants(context, node._id),
  shop: resolveShopFromShopId
};
