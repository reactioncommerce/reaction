import { encodeShopOpaqueId } from "../../../../xforms/shop.js";
import { encodeFulfillmentMethodOpaqueId } from "../../../../xforms/fulfillment.js";
import { encodeFulfillmentRestrictionOpaqueId } from "../../xforms/flatRateFulfillmentRestriction.js";

export default {
  _id: (node) => encodeFulfillmentRestrictionOpaqueId(node._id),
  methodIds: (node) => node.methodIds.map(encodeFulfillmentMethodOpaqueId),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
