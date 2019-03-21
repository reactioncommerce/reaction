import { encodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import productTags from "./productTags";

export default {
  _id: (node) => encodeOrderItemOpaqueId(node._id),
  productTags,
  shop: resolveShopFromShopId,
  status: (node) => node.workflow.status
};
