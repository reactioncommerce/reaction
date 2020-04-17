import { encodeProductOpaqueId } from "../xforms/id.js";

export default {
  productId: (node) => encodeProductOpaqueId(node.productId),
  productVariantId: (node) => encodeProductOpaqueId(node.productVariantId)
};
