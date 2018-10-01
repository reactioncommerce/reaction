import Cart from "./Cart";
import CartItem from "./CartItem";
import FulfillmentGroup from "./FulfillmentGroup";
import Mutation from "./Mutation";
import Query from "./Query";

/**
 * Cart related GraphQL resolvers
 * @namespace Cart/GraphQL
 */

export default {
  Cart,
  CartItem,
  FulfillmentGroup,
  Mutation,
  PaymentMethodData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  },
  PaymentData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  },
  Query
};
