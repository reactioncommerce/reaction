import { encodeNavigationItemOpaqueId, encodeShopOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeNavigationItemOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
