import { encodeNavigationItemOpaqueId } from "../../../../xforms/navigationItem.js";
import { encodeShopOpaqueId } from "../../../../xforms/shop.js";

export default {
  _id: (node) => encodeNavigationItemOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
