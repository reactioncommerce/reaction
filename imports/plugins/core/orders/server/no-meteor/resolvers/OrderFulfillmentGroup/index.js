import {
  encodeOrderFulfillmentGroupOpaqueId,
  xformOrderFulfillmentGroupPayment,
  xformOrderFulfillmentGroupSelectedOption
} from "@reactioncommerce/reaction-graphql-xforms/order";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import items from "./items";
import summary from "./summary";

export default {
  _id: (node) => encodeOrderFulfillmentGroupOpaqueId(node._id),
  data(node) {
    if (node.type === "shipping") {
      return { gqlType: "ShippingOrderFulfillmentGroupData", shippingAddress: node.address };
    }
    return null;
  },
  items,
  payment: (node) => xformOrderFulfillmentGroupPayment(node.payment),
  selectedFulfillmentOption: (node) => xformOrderFulfillmentGroupSelectedOption(node.shipmentMethod, node),
  shop: resolveShopFromShopId,
  summary
};
