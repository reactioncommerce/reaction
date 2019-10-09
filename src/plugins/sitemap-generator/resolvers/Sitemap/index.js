import { encodeShopOpaqueId } from "../../../../xforms/shop.js";

export default {
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
