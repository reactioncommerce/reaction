import FulfillmentMethod from "./FulfillmentMethod/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

/**
 * Fulfillment related GraphQL resolvers
 * @namespace Fulfillment/GraphQL
 */

export default {
  FulfillmentMethod,
  Mutation,
  Query,
  AdditionalData: {
    __resolveType(obj) {
      return obj.gqlType;
    }
  }
};
