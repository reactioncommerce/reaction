import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import productTags from "./productTags.js";

export default {
  _id: (node) => encodeOrderItemOpaqueId(node._id),
  productTags,
  shop: resolveShopFromShopId,
  status: (node) => node.workflow.status
};
