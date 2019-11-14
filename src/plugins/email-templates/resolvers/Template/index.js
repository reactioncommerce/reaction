import { encodeShopOpaqueId, encodeTemplateOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeTemplateOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
