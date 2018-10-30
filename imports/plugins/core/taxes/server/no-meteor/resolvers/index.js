import graphqlGroupXform from "../util/graphqlGroupXform";
import graphqlItemXform from "../util/graphqlItemXform";
import Query from "./Query";

export default {
  Cart: graphqlGroupXform,
  CartItem: graphqlItemXform,
  OrderFulfillmentGroup: graphqlGroupXform,
  OrderItem: graphqlItemXform,
  Query
};
