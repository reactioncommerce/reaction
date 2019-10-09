import { encodeProductOpaqueId } from "../../../xforms/product.js";

export default {
  productId: (node) => encodeProductOpaqueId(node.productId),
  productVariantId: (node) => encodeProductOpaqueId(node.productVariantId)
};
