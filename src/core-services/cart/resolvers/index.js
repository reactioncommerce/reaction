import Cart from "./Cart/index.js";
import CartItem from "./CartItem/index.js";
import FulfillmentGroup from "./FulfillmentGroup/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

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
