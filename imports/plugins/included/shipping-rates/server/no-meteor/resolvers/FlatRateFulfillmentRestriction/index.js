import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeFulfillmentRestrictionOpaqueId } from "../../xforms/flatRateFulfillmentRestriction";

export default {
  _id: (node) => encodeFulfillmentRestrictionOpaqueId(node._id),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
