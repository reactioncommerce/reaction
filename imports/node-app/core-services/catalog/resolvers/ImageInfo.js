import { encodeProductOpaqueId } from "../xforms/id.js";

export default {
  productId: (node) => encodeProductOpaqueId(node.productId),
  // DEPRECATED. toGrid is no longer supported. We always return
  // 1 to avoid breaking the GraphQL ImageInfo type. This will
  // be removed in a future major release.
  toGrid: () => 1,
  variantId: (node) => encodeProductOpaqueId(node.variantId)
};
