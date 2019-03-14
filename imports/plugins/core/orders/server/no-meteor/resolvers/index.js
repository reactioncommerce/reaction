import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import { encodeOrderFulfillmentGroupOpaqueId, encodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import Mutation from "./Mutation";
import Order from "./Order";
import OrderFulfillmentGroup from "./OrderFulfillmentGroup";
import OrderItem from "./OrderItem";
import Query from "./Query";

export default {
  AddOrderFulfillmentGroupPayload: {
    newFulfillmentGroupId: (node) => encodeOrderFulfillmentGroupOpaqueId(node.newFulfillmentGroupId)
  },
  Mutation,
  Order,
  OrderFulfillmentGroup,
  OrderFulfillmentGroupData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  },
  OrderItem,
  Query,
  SplitOrderItemPayload: {
    newItemId: (node) => encodeOrderItemOpaqueId(node.newItemId)
  },
  ...getConnectionTypeResolvers("OrdersByAccountId")
};
