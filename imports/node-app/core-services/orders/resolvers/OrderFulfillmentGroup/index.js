import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import {
  encodeOrderFulfillmentGroupOpaqueId,
  xformOrderFulfillmentGroupSelectedOption
} from "@reactioncommerce/reaction-graphql-xforms/order";
import fulfillmentGroupDisplayStatus from "./fulfillmentGroupDisplayStatus.js";
import items from "./items.js";
import summary from "./summary.js";

export default {
  _id: (node) => encodeOrderFulfillmentGroupOpaqueId(node._id),
  data(node) {
    if (node.type === "shipping") {
      return { gqlType: "ShippingOrderFulfillmentGroupData", shippingAddress: node.address };
    }
    return null;
  },
  displayStatus: (node, { language }, context) => fulfillmentGroupDisplayStatus(context, node, language),
  items,
  selectedFulfillmentOption: (node) => xformOrderFulfillmentGroupSelectedOption(node.shipmentMethod, node),
  shop: resolveShopFromShopId,
  status: (node) => node.workflow.status,
  summary
};
