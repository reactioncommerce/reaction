import { encodeShopOpaqueId } from "../../xforms/id.js";

export default {
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
