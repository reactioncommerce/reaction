import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";

export default {
  productId: (node) => encodeProductOpaqueId(node.productId),
  productVariantId: (node) => encodeProductOpaqueId(node.productVariantId)
};
