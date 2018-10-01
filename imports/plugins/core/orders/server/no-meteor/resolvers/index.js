import Order from "./Order";
import OrderFulfillmentGroup from "./OrderFulfillmentGroup";
import OrderItem from "./OrderItem";
import Query from "./Query";

export default {
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
