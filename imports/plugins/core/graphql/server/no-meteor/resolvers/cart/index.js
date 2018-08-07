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
    __resolveType() {
      // obj.methodName should match PaymentMethodName enum
      return "ExamplePaymentMethodData"; // Temporary, until we implement this
    }
  },
  PaymentMethodInputData: {
    __resolveType() {
      // obj.methodName should match PaymentMethodName enum
      return "ExamplePaymentMethodInputData"; // Temporary, until we implement this
    }
  },
  Query
};
