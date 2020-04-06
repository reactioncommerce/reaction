import { encodeProductOpaqueId } from "../xforms/id.js";

export default {
  productId: (node) => encodeProductOpaqueId(node.productId),
  variantId: (node) => encodeProductOpaqueId(node.variantId)
};
