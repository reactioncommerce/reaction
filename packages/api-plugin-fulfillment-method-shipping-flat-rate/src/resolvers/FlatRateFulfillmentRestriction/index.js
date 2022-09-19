import {
  encodeFulfillmentMethodOpaqueId,
  encodeFulfillmentRestrictionOpaqueId,
  encodeShopOpaqueId
} from "../../xforms/id.js";

export default {
  _id: (node) => encodeFulfillmentRestrictionOpaqueId(node._id),
  methodIds: (node) => node.methodIds.map(encodeFulfillmentMethodOpaqueId),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
