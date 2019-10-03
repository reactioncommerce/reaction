import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import getVariants from "../../utils/getVariants";

export default {
  _id: (node) => encodeProductOpaqueId(node._id),
  options: (node, args, context) => getVariants(context, node._id),
  shop: resolveShopFromShopId
};
