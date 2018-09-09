import Cart from "./Cart";
import CartItem from "./CartItem";
import CartPayment from "./CartPayment";
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
  CartPayment,
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
