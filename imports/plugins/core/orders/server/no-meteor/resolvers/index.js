import Mutation from "./Mutation";
import Order from "./Order";
import OrderFulfillmentGroup from "./OrderFulfillmentGroup";
import OrderItem from "./OrderItem";
import Query from "./Query";

export default {
  Mutation,
  Order,
  OrderFulfillmentGroup,
  OrderFulfillmentGroupData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  },
  OrderItem,
  Query
};
