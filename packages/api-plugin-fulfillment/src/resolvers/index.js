import FulfillmentMethod from "./FulfillmentMethod/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

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
