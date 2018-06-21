import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";

export default {
  productId: (node) => encodeProductOpaqueId(node.productId),
  variantId: (node) => encodeProductOpaqueId(node.variantId)
};
