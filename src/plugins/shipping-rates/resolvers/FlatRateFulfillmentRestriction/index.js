import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { encodeFulfillmentRestrictionOpaqueId } from "../../xforms/flatRateFulfillmentRestriction.js";

export default {
  _id: (node) => encodeFulfillmentRestrictionOpaqueId(node._id),
  methodIds: (node) => node.methodIds.map(encodeFulfillmentMethodOpaqueId),
  shopId: (node) => encodeShopOpaqueId(node.shopId)
};
