import {
  encodeAddressValidationRuleOpaqueId,
  encodeShopOpaqueId
} from "../xforms/id.js";

export default {
  _id: (node) => encodeAddressValidationRuleOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
